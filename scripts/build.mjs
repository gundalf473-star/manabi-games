// games フォルダの中のゲームを読み取って、公開用のサイト（_site）を作ります。
// ふだんはこのファイルをさわる必要はありません。
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "_site");
const GAMES = path.join(ROOT, "games");

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "games"), { recursive: true });

const site = JSON.parse(fs.readFileSync(path.join(ROOT, "site.json"), "utf8"));

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return e.name.toLowerCase().endsWith(".html") ? [p] : [];
  });
}
const pickMeta = (html, name) => {
  const m = html.match(new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["']`, "i"));
  return m ? m[1].trim() : "";
};
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Google アナリティクス（site.json の gaMeasurementId が入っているときだけ）
const gaId = (site.gaMeasurementId || "").trim();
const GA = (gaId ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(gaId)}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${esc(gaId)}');</script>` : "")
  + `<script>window.mnTrack=function(n,p){try{if(window.gtag)gtag('event',n,Object.assign({game_title:window.mnTitle||document.title},p||{}));}catch(e){}};</script>`;

// 学習の履歴（保護者ページ用）。この端末のブラウザの中（localStorage の mn-history）にだけ保存し、どこにも送りません。
// ゲームが呼ぶ mnTrack（level_start / answer_question / level_end）を受けて、1回ぶんの記録を作ります。
const HISTORY = `<script>(function(){var KEY='mn-history',S=null,base=window.mnTrack;
function file(){try{return decodeURIComponent(location.pathname.split('/').pop()||'');}catch(e){return '';}}
function load(){try{var h=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(h)?h:[];}catch(e){return [];}}
function save(){if(!S||(!S.a&&S.s==null))return;try{var h=load(),i=-1;for(var j=h.length-1;j>=0&&j>=h.length-60;j--){if(h[j].id===S.id){i=j;break;}}
var e={id:S.id,t:S.t,e:Date.now(),f:file(),g:window.mnTitle||document.title,c:S.c,a:S.a,k:S.k,m:S.m};if(S.s!=null){e.s=S.s;if(S.n!=null)e.n=S.n;else e.star=1;}
if(i>=0)h[i]=e;else h.push(e);if(h.length>3000)h=h.slice(-3000);localStorage.setItem(KEY,JSON.stringify(h));}catch(x){}}
function begin(c){save();S={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),t:Date.now(),c:c||'',a:0,k:0,m:[],s:null,n:null};}
window.mnTrack=function(n,p){p=p||{};try{base&&base(n,p);}catch(e){}try{
if(n==='level_start')begin(p.level_name);
else if(n==='answer_question'){if(!S)begin('');S.a++;if(p.correct)S.k++;else if(p.question!=null&&S.m.length<30)S.m.push(String(p.question).slice(0,80));}
else if(n==='level_end'){if(!S)begin(p.level_name);if(p.level_name)S.c=String(p.level_name);if(typeof p.score==='number'){S.s=p.score;S.n=typeof p.total==='number'?p.total:null;}save();S=null;}
}catch(e){}};
addEventListener('pagehide',save);document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')save();});})();</script>`;
const GAME_GA = GA + HISTORY;

// 有料版の記録の場所（保護者ページの REC・STARS をそのまま使う）。トップの「にがて復習」と、有料版の問題数に使う
const parentSrc = fs.readFileSync(path.join(ROOT, "parent.html"), "utf8");
const REC_MAP = {}, STAR_MAP = {};
for (const [, k, f, t] of parentSrc.matchAll(/'([\w-]+-p-rec)':\{f:'([^']+)',total:(\d+)\}/g)) REC_MAP[k] = { f, total: +t };
for (const [, k, f, t] of parentSrc.matchAll(/'([\w-]+-stars)':\{f:'([^']+)',total:(\d+|null)\}/g)) STAR_MAP[k] = { f, total: t === "null" ? null : +t };
const paidTotal = (f) => (Object.values(REC_MAP).find((o) => o.f === f) || Object.values(STAR_MAP).find((o) => o.f === f) || {}).total || null;
// ゲームが終わったときの帯（結果カード・有料版の案内）と、ホーム画面に追加するしくみ
const EXTRA_TPL = fs.readFileSync(path.join(ROOT, "scripts", "extra.html"), "utf8");
const BUILD_ID = Date.now().toString(36);
// ホーム画面に追加（アプリのように開く）ためのタグ。depth はサイトのいちばん上からの深さ
const pwaTags = (depth) => { const r = "../".repeat(depth); return `<link rel="manifest" href="${r}manifest.webmanifest"><meta name="theme-color" content="#1f3a6e"><link rel="apple-touch-icon" href="${r}apple-touch-icon.png"><meta name="apple-mobile-web-app-title" content="まなび">`; };
const SW_REG = (depth) => `<script>if('serviceWorker' in navigator)addEventListener('load',function(){navigator.serviceWorker.register('${"../".repeat(depth)}sw.js').catch(function(){});});</script>`;

// ご意見フォーム（site.json の feedbackForm に、Googleフォームの「事前入力したURL」を入れたときだけ使います）
// 事前入力では、ゲーム名の欄に GAME、問題の欄に QUESTION と入れ、種類の欄は「感想・ご意見」をえらんでおきます。
const KANSOU = "感想・ご意見", MACHIGAI = "問題のまちがい";
function parseForm(u) {
  if (!u) return null;
  try {
    const url = new URL(u);
    if (!/docs\.google\.com$/.test(url.hostname)) { console.warn("feedbackForm: docs.google.com の長いURL（事前入力したURL）を入れてください。forms.gle の短いURLは使えません。"); return null; }
    const cfg = { base: url.origin + url.pathname.replace(/\/(formResponse|viewform)?$/, "") + "/viewform", kansou: KANSOU, machigai: MACHIGAI };
    for (const [k, v] of url.searchParams) {
      if (!k.startsWith("entry.")) continue;
      if (v === "GAME") cfg.game = k; else if (v === "QUESTION") cfg.question = k; else if (v === KANSOU || v === MACHIGAI) cfg.type = k;
    }
    if (!cfg.game || !cfg.question) console.warn("feedbackForm: GAME / QUESTION の欄が見つかりません。事前入力のしかたを README で確かめてください。");
    return cfg;
  } catch (e) { console.warn("feedbackForm のURLが読めません"); return null; }
}
const FB = parseForm((site.feedbackForm || "").trim());
// 「わたしの単元」に入れる★ボタン（この端末の localStorage にだけ保存。中高一貫は mn-fav、中学受験は mn-fav-j）。一覧の上に出る
const STAR = (course) => `<button type="button" id="mn-star" style="position:fixed;left:calc(122px + env(safe-area-inset-left,0px));bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:99;background:#1d2b45;color:#fff;font:700 13px/1 system-ui,sans-serif;padding:9px 12px;border-radius:99px;border:0;opacity:.88;cursor:pointer">☆ わたしの単元</button><script>(function(){var K='${course === "chuko" ? "mn-fav" : "mn-fav-j"}',MAX=8,b=document.getElementById('mn-star');
function file(){try{return decodeURIComponent(location.pathname.split('/').pop()||'');}catch(e){return '';}}function base(f){return String(f).replace(/(-full|300)(\\.html)$/,'$2');}function idx(a){var k=base(file());for(var i=0;i<a.length;i++)if(base(a[i])===k)return i;return -1;}
function ld(){try{var a=JSON.parse(localStorage.getItem(K)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}}
function sv(a){try{localStorage.setItem(K,JSON.stringify(a));return true;}catch(e){return false;}}
function show(){var on=idx(ld())>=0;b.textContent=on?'★ わたしの単元':'☆ わたしの単元';b.style.background=on?'#b4442d':'#1d2b45';b.setAttribute('aria-pressed',on?'true':'false');b.title=on?'わたしの単元から外す':'一覧のいちばん上の「わたしの単元」に入れる';}
b.onclick=function(){var a=ld(),i=idx(a);if(i>=0)a.splice(i,1);else{if(a.length>=MAX){b.textContent='8つまでです';setTimeout(show,1600);return;}a.unshift(file());}if(!sv(a)){b.textContent='保存できません';setTimeout(show,1600);return;}show();};
show();})();</script>`;
const FEEDBACK = fs.readFileSync(path.join(ROOT, "scripts", "feedback.html"), "utf8")
  .replace("__FEEDBACK__", () => JSON.stringify(FB).replace(/</g, "\\u003c"));

// 有料版の利用コード（site.json の apiBase に、サーバー（Cloudflare Workers）のアドレスを入れます）
const API = (process.env.API_BASE ?? site.apiBase ?? "").trim().replace(/\/$/, "");
const ACCESS = fs.readFileSync(path.join(ROOT, "scripts", "access.html"), "utf8").replace("__API__", () => JSON.stringify(API));
const REVIEW = fs.readFileSync(path.join(ROOT, "scripts", "review.html"), "utf8");

// 運営からのお知らせ。緊急のもの（帯）は管理画面からサーバーに入れ、全ページで読みこむ。ふつうのものは notices.json に書く
const NOTICE_TPL = fs.readFileSync(path.join(ROOT, "scripts", "notice.html"), "utf8").replace("__API__", () => JSON.stringify(API));
const NOTICE = (depth) => NOTICE_TPL.replace("__ROOT__", () => JSON.stringify("../".repeat(depth)));
const notices = fs.existsSync(path.join(ROOT, "notices.json")) ? JSON.parse(fs.readFileSync(path.join(ROOT, "notices.json"), "utf8")) : {};
const NEWS = (notices.news || []).filter((n) => n && n.date && n.title).map((n, i) => [n, i]).sort((a, b) => b[0].date.localeCompare(a[0].date) || a[1] - b[1]).map((x) => x[0]);   // 新しい日付が上
const NEW_GAMES = notices.newGames || {};
const gameId = (f) => path.basename(f).replace(/\.html?$/i, "").replace(/-full$/, "");
const nl2br = (s) => esc(String(s || "")).replace(/\n/g, "<br>");
// ゲームのページの上に出す注意（notices.json の games にそのゲームが書いてあるもの。until の日を過ぎたら出さない）
function gameNotes(id, depth) {
  const list = NEWS.filter((n) => Array.isArray(n.games) && n.games.includes(id));
  if (!list.length) return "";
  return list.map((n) => `<div class="mn-gnote" data-until="${esc(n.until || "")}" style="box-sizing:border-box;max-width:640px;margin:0 auto 12px;border:1px solid #e3c766;background:#fff8dc;color:#3a2e00;border-radius:10px;padding:10px 14px;font:14px/1.7 'BIZ UDPGothic','Hiragino Sans','Yu Gothic',system-ui,sans-serif">`
    + `<b>お知らせ（${esc(n.date)}）　${esc(n.title)}</b><br>${nl2br(n.body)} <a href="${"../".repeat(depth)}news.html" style="color:inherit;font-weight:700">お知らせ一覧 →</a></div>`).join("")
    + `<script>(function(){var t=new Date(Date.now()+9*36e5).toISOString().slice(0,10);document.querySelectorAll('.mn-gnote').forEach(function(e){var u=e.getAttribute('data-until');if(u&&t>u)e.remove();});})();</script>`;
}
const afterBody = (html, add) => add ? html.replace(/<body[^>]*>/i, (m) => m + add) : html;

// ---- 検索と共有（Google などに見つけてもらう・LINE などで共有したときの見え方） ----
const SITE_URL = (site.siteUrl || "").replace(/\/$/, "");
const OG_IMAGE = SITE_URL ? SITE_URL + "/og.png" : "";
const SITEMAP = [];   // 検索に出したいページ
function seoTags({ url, title, desc, noindex, jsonld, type }) {
  let t = "";
  if (noindex) t += `<meta name="robots" content="noindex">`;
  if (SITE_URL && url && !noindex) t += `<link rel="canonical" href="${esc(url)}">`;
  t += `<meta property="og:site_name" content="${esc(site.name)}"><meta property="og:type" content="${type || "website"}"><meta property="og:title" content="${esc(title)}">`;
  if (desc) t += `<meta property="og:description" content="${esc(desc)}">`;
  if (SITE_URL && url) t += `<meta property="og:url" content="${esc(url)}">`;
  if (OG_IMAGE) t += `<meta property="og:image" content="${OG_IMAGE}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">`;
  t += `<meta name="twitter:card" content="summary_large_image">`;
  if (jsonld) t += `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script>`;
  return t;
}
const pageUrl = (rel) => SITE_URL + "/" + rel.split("/").map(encodeURIComponent).join("/");
const addHead = (html, tags) => html.replace(/<\/head>/i, (m) => tags + m);

const list = [];
for (const file of walk(GAMES)) {
  const rel = path.relative(GAMES, file).split(path.sep);
  let html = fs.readFileSync(file, "utf8");
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [, rel.at(-1)])[1].trim();
  // フォルダ名でも分類できるように（games/算数/図形/xxx.html）
  // コース：games/chuko/ の下（または game:course が chuko）は中高一貫コース。それ以外は中学受験
  const course = pickMeta(html, "game:course") || (rel[0] === "chuko" ? "chuko" : "juken");
  const sub = course === "chuko" && rel[0] === "chuko" ? rel.slice(1) : rel;
  const subject = pickMeta(html, "game:subject") || (sub.length >= 2 ? sub[0] : "その他");
  const unit = pickMeta(html, "game:unit") || (sub.length >= 3 ? sub[1] : "いろいろ");
  const stat = fs.statSync(file);

  // ページの骨組み（文字コードなど）がなければ足して、一覧へ戻るリンクをつける
  const back = `<a href="../${"../".repeat(rel.length - 1)}${course === "chuko" ? "chuko/" : ""}index.html" style="position:fixed;left:calc(10px + env(safe-area-inset-left,0px));bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:99;background:#1d2b45;color:#fff;font:700 13px/1 system-ui,sans-serif;padding:9px 12px;border-radius:99px;text-decoration:none;opacity:.88">← ゲーム一覧</a>`;
  if (!/<!doctype/i.test(html)) {
    const hm = html.match(/^(?:\s*(?:<title>[^<]*<\/title>|<meta[^>]*>|<link[^>]*>))+/i);
    const headBits = hm ? hm[0] : ""; html = html.slice(headBits.length);
    html = `<!doctype html>\n<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">${headBits}\n${GAME_GA}\n<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n</head><body>\n${html}\n${back}${STAR(course)}\n${FEEDBACK}\n</body></html>`;
  } else {
    html = html.replace(/<\/body>/i, `${back}${STAR(course)}${FEEDBACK}</body>`).replace(/<\/head>/i, `${GAME_GA}</head>`);
  }
  // 中高一貫コースのしるし（利用コードの確かめで使う）。フォルダで決まったときも、ページに書きこむ
  if (course === "chuko" && !pickMeta(html, "game:course")) html = html.replace(/<\/head>/i, (m) => `<meta name="game:course" content="chuko">` + m);
  // 緊急のお知らせの帯と、このゲームへの注意
  html = html.replace(/<\/body>/i, (m) => NOTICE(rel.length) + m);
  html = afterBody(html, gameNotes(gameId(file), rel.length));
  // 検索用のタイトル（「ゲーム名｜中学受験 教科｜サイト名」）と、検索・共有のタグ。有料版は検索に出さない
  {
    const paid = pickMeta(html, "game:paid") !== "";
    const seoTitle = `${title}｜${course === "chuko" ? "中学" : "中学受験"} ${subject}｜${site.name}`;
    const url = pageUrl("games/" + rel.join("/"));
    const desc = pickMeta(html, "description");
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${esc(seoTitle)}</title>`);
    const ld = { "@context": "https://schema.org", "@type": "LearningResource", name: title, description: desc, url, inLanguage: "ja",
      learningResourceType: /パズル|ゲーム/.test(title) ? "パズル" : "クイズ", educationalLevel: course === "chuko" ? "中学生（中高一貫校）" : "小学生（中学受験）", about: subject,
      isAccessibleForFree: !paid, isPartOf: { "@type": "WebSite", name: site.name, url: SITE_URL + "/" } };
    html = addHead(html, `<script>window.mnTitle=${JSON.stringify(title).replace(/</g, "\\u003c")};</script>` + seoTags({ url, title: seoTitle, desc, noindex: paid, jsonld: paid ? null : ld, type: "article" }));
    if (!paid) SITEMAP.push(url);
  }
  // 結果の帯（共有・有料版の案内）と、ホーム画面に追加するしくみ
  {
    const base = rel.at(-1), dir = path.dirname(file);
    const isPaid = pickMeta(html, "game:paid") !== "";
    const fullName = base.replace(/\.html$/i, "-full.html"), freeName = base.replace(/-full\.html$/i, ".html");
    const full = !isPaid && fs.existsSync(path.join(dir, fullName)) ? fullName : null;
    const freeRel = isPaid && fs.existsSync(path.join(dir, freeName)) ? [...rel.slice(0, -1), freeName] : rel;
    const info = { site: site.name, title, file: base, root: "../".repeat(rel.length), full, total: full ? paidTotal(fullName) : null,
      shareUrl: SITE_URL ? pageUrl("games/" + freeRel.join("/")) : null };
    html = html.replace(/<\/head>/i, (m) => pwaTags(rel.length) + EXTRA_TPL.replace("__INFO__", () => JSON.stringify(info).replace(/</g, "\\u003c")) + m);
  }
  // 有料版には、利用コードを確かめるしくみを入れる（ゲーム本体のスクリプトより前に読みこむ）
  if (pickMeta(html, "game:paid")) html = html.replace(/<\/head>/i, () => `${ACCESS}${REVIEW}</head>`);
  // 一覧データ（games.json）の場所は、ゲームのフォルダの深さに合わせる
  html = html.replaceAll("'../games.json'", `'${"../".repeat(rel.length)}games.json'`);
  const outFile = path.join(OUT, "games", ...rel);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, html);

  list.push({
    title, subject, unit, course,
    grade: pickMeta(html, "game:grade"),
    players: pickMeta(html, "game:players"),
    paid: pickMeta(html, "game:paid") !== "",
    description: pickMeta(html, "description"),
    url: "games/" + rel.map(encodeURIComponent).join("/"),
    updated: stat.mtime.toISOString().slice(0, 10),
    added: NEW_GAMES[gameId(file)] || "",
    file: rel.at(-1),
  });
}

const order = site.subjectOrder || [];
const rank = (s) => (order.indexOf(s) === -1 ? 999 : order.indexOf(s));
list.sort((a, b) => rank(a.subject) - rank(b.subject) || a.subject.localeCompare(b.subject, "ja") || a.unit.localeCompare(b.unit, "ja") || a.title.localeCompare(b.title, "ja"));

fs.writeFileSync(path.join(OUT, "games.json"), JSON.stringify({ site: Object.assign({}, site, { feedback: FB, newsLatest: NEWS.map((n) => n.date).sort().at(-1) || "" }), games: list, rec: REC_MAP, stars: STAR_MAP }, null, 2));
const withNotice = (html) => html.replace(/<\/body>/i, (m) => NOTICE(0) + m);
// ゲーム以外のページ。name はファイル名、opt.noindex で検索に出さない
function sitePage(html, name, opt = {}) {
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [, site.name])[1].trim();
  const url = SITE_URL + "/" + name.replace(/(^|\/)index\.html$/, "$1");
  const desc = pickMeta(html, "description") || site.description;
  const depth = name.split("/").length - 1;
  html = addHead(html, seoTags({ url, title, desc, noindex: opt.noindex, jsonld: opt.jsonld }) + pwaTags(depth) + SW_REG(depth) + (opt.extraHead || ""));
  if (!opt.noindex) SITEMAP.push(url);
  return html.replace(/<\/body>/i, (m) => NOTICE(depth) + m);
}
// お知らせのページ
const newsHtml = NEWS.map((n) => `<article class="item" data-date="${esc(n.date)}"><time datetime="${esc(n.date)}">${esc(n.date.replace(/^(\d+)-0?(\d+)-0?(\d+)$/, "$1年$2月$3日"))}</time><span class="new">NEW</span>`
  + `<h2>${esc(n.title)}</h2><p>${esc(n.body || "")}</p>${n.link ? `<a class="more" href="${esc(n.link)}">くわしく見る →</a>` : ""}</article>`).join("\n") || '<p class="small">いまはお知らせはありません。</p>';
fs.writeFileSync(path.join(OUT, "news.html"), sitePage(fs.readFileSync(path.join(ROOT, "news.html"), "utf8")
  .replaceAll("{{SITE_NAME}}", esc(site.name)).replace("{{GA}}", GA).replace("{{NEWS}}", () => newsHtml), "news.html"));
let index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8")
  .replaceAll("{{SITE_NAME}}", esc(site.name))
  .replaceAll("{{SITE_DESCRIPTION}}", esc(site.description));
// トップページのゲーム一覧を、はじめから文字で入れておく（検索エンジンがゲームへのリンクをたどれるように。表示は読みこみ後に同じものを作りなおす）
function staticList(games, pre = "") {
  const COLORS = ["--s1", "--s2", "--s3", "--s4", "--s5", "--s6"];
  const subjects = [...new Set(games.map((g) => g.subject))];
  const color = (s) => `var(${COLORS[subjects.indexOf(s) % COLORS.length]})`;
  return subjects.map((s) => {
    const gs = games.filter((g) => g.subject === s);
    return `<section class="group" style="--c:${color(s)}"><div class="gh"><h2>${esc(s)}</h2><span>${gs.length}本</span></div><div class="grid">` + gs.map((g) => `<a class="card" href="${pre}${g.url}"><span class="tags"><span class="tag">${esc(g.unit)}</span>${g.paid ? '<span class="tag paid">有料版</span>' : ""}</span><h3>${esc(g.title)}</h3><p>${esc(g.description)}</p><div class="meta">${g.grade ? `<span>${esc(g.grade)}</span>` : ""}${g.players ? `<span>${esc(g.players)}</span>` : ""}<span class="play" style="margin-left:auto">${pre ? "はじめる" : "あそぶ"} →</span></div></a>`).join("") + `</div></section>`;
  }).join('<div style="height:16px"></div>');
}
const JUKEN = list.filter((g) => g.course !== "chuko"), CHUKO = list.filter((g) => g.course === "chuko");
index = index.replace('<main id="list"><p class="empty">ゲームを読みこんでいます…</p></main>', () => `<main id="list">${staticList(JUKEN)}</main>`);
if (CHUKO.length) index = index.replace('id="chukoentry" href="chuko/index.html" hidden', 'id="chukoentry" href="chuko/index.html"');
const verify = (site.googleSiteVerification ? `<meta name="google-site-verification" content="${esc(site.googleSiteVerification)}">` : "") + (site.bingSiteVerification ? `<meta name="msvalidate.01" content="${esc(site.bingSiteVerification)}">` : "");
fs.writeFileSync(path.join(OUT, "index.html"), sitePage(index.replace("{{GA}}", GA), "index.html", { extraHead: verify,
  jsonld: { "@context": "https://schema.org", "@type": "WebSite", name: site.name, url: SITE_URL + "/", description: site.description, inLanguage: "ja" } }));
// 中高一貫コースのページ（chuko/ の中の .html）。入口のほかは学習の記録をとる。毎日の英単語には単語表を入れる
if (fs.existsSync(path.join(ROOT, "chuko"))) {
  fs.mkdirSync(path.join(OUT, "chuko"), { recursive: true });
  const words = fs.existsSync(path.join(ROOT, "chuko", "words.json")) ? fs.readFileSync(path.join(ROOT, "chuko", "words.json"), "utf8").trim() : "[]";
  for (const name of fs.readdirSync(path.join(ROOT, "chuko")).filter((f) => f.endsWith(".html"))) {
    const ch = fs.readFileSync(path.join(ROOT, "chuko", name), "utf8").replaceAll("{{SITE_NAME}}", esc(site.name)).replace("{{GA}}", name === "index.html" ? GA : GA + HISTORY)
      .replace('<main id="list"></main>', () => `<main id="list">${staticList(CHUKO, "../")}</main>`)
      .replace("/*WORDS*/[]", () => words.replace(/</g, "\\u003c"));
    fs.writeFileSync(path.join(OUT, "chuko", name), sitePage(ch, "chuko/" + name));
  }
}
const privacy = fs.readFileSync(path.join(ROOT, "privacy.html"), "utf8")
  .replaceAll("{{SITE_NAME}}", esc(site.name)).replaceAll("{{CONTACT}}", esc(site.contact || "（連絡先を site.json に書いてください）")).replace("{{GA}}", GA);
fs.writeFileSync(path.join(OUT, "privacy.html"), sitePage(privacy, "privacy.html"));
const parent = fs.readFileSync(path.join(ROOT, "parent.html"), "utf8")
  .replaceAll("{{SITE_NAME}}", esc(site.name)).replace("{{GA}}", GA);
fs.writeFileSync(path.join(OUT, "parent.html"), sitePage(parent, "parent.html"));
const seller = site.seller || {};
const ask = "ご請求があれば、遅滞なく開示します。";
for (const name of ["buy.html", "plan.html", "tokushoho.html", "contact.html"]) {
  const page = fs.readFileSync(path.join(ROOT, name), "utf8")
    .replaceAll("{{SITE_NAME}}", esc(site.name)).replace("{{GA}}", GA).replace("{{ACCESS}}", () => ACCESS)
    .replace("{{SELLER_NAME}}", esc(seller.name || "（site.json の seller.name に書いてください）"))
    .replace("{{SELLER_MANAGER}}", esc(seller.manager || seller.name || "（site.json の seller.manager）"))
    .replace("{{SELLER_ADDRESS}}", esc(seller.address || ask))
    .replace("{{SELLER_PHONE}}", esc(seller.phone || ask))
    .replace("{{SELLER_EMAIL}}", esc(seller.email || site.contact || "（site.json の seller.email に書いてください）"))
    .replace("{{SELLER_NOTE}}", (!seller.address || !seller.phone) ? "所在地・電話番号は、ご請求があればメールでお知らせします。" : "");
  fs.writeFileSync(path.join(OUT, name), sitePage(page, name, { noindex: name === "plan.html" }));
}
if (!API) console.warn("※ site.json の apiBase が空です。有料版は「販売準備中」と表示されます。");
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
if (fs.existsSync(path.join(ROOT, "og.png"))) fs.copyFileSync(path.join(ROOT, "og.png"), path.join(OUT, "og.png"));
// ---- 今日の1問：無料版の4択問題（図がないもの・図形の図のもの）から、日がわりで1問 ----
{
  const GEO_OK = new Set(["poly", "circ", "sect", "arc", "path", "seg", "dot", "lab", "ra", "ang", "par", "eq", "dim", "ell"]);
  const pool = [];
  for (const g of list) {
    if (g.paid || g.course === "chuko") continue;   // 今日の1問は中学受験のゲームから
    const src = fs.readFileSync(path.join(GAMES, ...decodeURIComponent(g.url).split("/").slice(1)), "utf8");
    const m = src.match(/let QS=(\[.*?\]);\n/s); if (!m) continue;
    let qs; try { qs = JSON.parse(m[1]); } catch (e) { continue; }
    for (const q of qs) {
      if (!q || typeof q.q !== "string" || typeof q.a !== "string" || !Array.isArray(q.d) || q.d.length !== 3 || !q.e) continue;
      if (q.fig && !(q.fig.geo && Object.keys(q.fig).length === 1 && q.fig.geo.every((e) => GEO_OK.has(e[0])))) continue;
      pool.push({ q: q.q, a: q.a, d: q.d, e: q.e, fig: q.fig || null, g: g.title, s: g.subject, u: g.url });
    }
  }
  // 毎日同じ順番にならないよう、決まった順にまぜる（だれが開いても、その日は同じ問題）
  let seed = 20261028; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  fs.writeFileSync(path.join(OUT, "daily.json"), JSON.stringify(pool));
  const daily = fs.readFileSync(path.join(ROOT, "daily.html"), "utf8").replaceAll("{{SITE_NAME}}", esc(site.name)).replace("{{GA}}", GA + HISTORY);
  fs.writeFileSync(path.join(OUT, "daily.html"), sitePage(daily, "daily.html"));
  const drill = fs.readFileSync(path.join(ROOT, "drill.html"), "utf8").replaceAll("{{SITE_NAME}}", esc(site.name)).replace("{{GA}}", GA + HISTORY);
  fs.writeFileSync(path.join(OUT, "drill.html"), sitePage(drill, "drill.html"));
  const ichibun = fs.readFileSync(path.join(ROOT, "ichibun.html"), "utf8").replaceAll("{{SITE_NAME}}", esc(site.name)).replace("{{GA}}", GA + HISTORY);
  fs.writeFileSync(path.join(OUT, "ichibun.html"), sitePage(ichibun, "ichibun.html"));
  console.log(`今日の1問：${pool.length}問`);
}
if (SITE_URL) {
  fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${SITEMAP.map((u) => `  <url><loc>${esc(u)}</loc></url>`).join("\n")}\n</urlset>\n`);
} else console.warn("※ site.json の siteUrl が空です。サイトマップは作りません。");
// ---- ホーム画面に追加（アプリのように開く） ----
fs.writeFileSync(path.join(OUT, "manifest.webmanifest"), JSON.stringify({ name: site.name, short_name: "まなび", description: site.description, lang: "ja",
  start_url: "./index.html?from=app", scope: "./", display: "standalone", background_color: "#f2f5f9", theme_color: "#1f3a6e",
  icons: [{ src: "icon-192.png", sizes: "192x192", type: "image/png" }, { src: "icon-512.png", sizes: "512x512", type: "image/png" }, { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }] }, null, 1));
for (const f of ["icon-192.png", "icon-512.png", "apple-touch-icon.png"]) if (fs.existsSync(path.join(ROOT, f))) fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
fs.writeFileSync(path.join(OUT, "sw.js"), fs.readFileSync(path.join(ROOT, "scripts", "sw.js"), "utf8").replace("__BUILD__", BUILD_ID));
console.log(`ゲーム ${list.length} 本で一覧を作りました`);
