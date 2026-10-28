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
  + `<script>window.mnTrack=function(n,p){try{if(window.gtag)gtag('event',n,Object.assign({game_title:document.title},p||{}));}catch(e){}};</script>`;

// 学習の履歴（保護者ページ用）。この端末のブラウザの中（localStorage の mn-history）にだけ保存し、どこにも送りません。
// ゲームが呼ぶ mnTrack（level_start / answer_question / level_end）を受けて、1回ぶんの記録を作ります。
const HISTORY = `<script>(function(){var KEY='mn-history',S=null,base=window.mnTrack;
function file(){try{return decodeURIComponent(location.pathname.split('/').pop()||'');}catch(e){return '';}}
function load(){try{var h=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(h)?h:[];}catch(e){return [];}}
function save(){if(!S||(!S.a&&S.s==null))return;try{var h=load(),i=-1;for(var j=h.length-1;j>=0&&j>=h.length-60;j--){if(h[j].id===S.id){i=j;break;}}
var e={id:S.id,t:S.t,e:Date.now(),f:file(),g:document.title,c:S.c,a:S.a,k:S.k,m:S.m};if(S.s!=null){e.s=S.s;if(S.n!=null)e.n=S.n;else e.star=1;}
if(i>=0)h[i]=e;else h.push(e);if(h.length>3000)h=h.slice(-3000);localStorage.setItem(KEY,JSON.stringify(h));}catch(x){}}
function begin(c){save();S={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),t:Date.now(),c:c||'',a:0,k:0,m:[],s:null,n:null};}
window.mnTrack=function(n,p){p=p||{};try{base&&base(n,p);}catch(e){}try{
if(n==='level_start')begin(p.level_name);
else if(n==='answer_question'){if(!S)begin('');S.a++;if(p.correct)S.k++;else if(p.question!=null&&S.m.length<30)S.m.push(String(p.question).slice(0,80));}
else if(n==='level_end'){if(!S)begin(p.level_name);if(p.level_name)S.c=String(p.level_name);if(typeof p.score==='number'){S.s=p.score;S.n=typeof p.total==='number'?p.total:null;}save();S=null;}
}catch(e){}};
addEventListener('pagehide',save);document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')save();});})();</script>`;
const GAME_GA = GA + HISTORY;

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
const FEEDBACK = fs.readFileSync(path.join(ROOT, "scripts", "feedback.html"), "utf8")
  .replace("__FEEDBACK__", () => JSON.stringify(FB).replace(/</g, "\\u003c"));

// 有料版の利用コード（site.json の apiBase に、サーバー（Cloudflare Workers）のアドレスを入れます）
const API = (process.env.API_BASE ?? site.apiBase ?? "").trim().replace(/\/$/, "");
const ACCESS = fs.readFileSync(path.join(ROOT, "scripts", "access.html"), "utf8").replace("__API__", () => JSON.stringify(API));

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

const list = [];
for (const file of walk(GAMES)) {
  const rel = path.relative(GAMES, file).split(path.sep);
  let html = fs.readFileSync(file, "utf8");
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [, rel.at(-1)])[1].trim();
  // フォルダ名でも分類できるように（games/算数/図形/xxx.html）
  const subject = pickMeta(html, "game:subject") || (rel.length >= 2 ? rel[0] : "その他");
  const unit = pickMeta(html, "game:unit") || (rel.length >= 3 ? rel[1] : "いろいろ");
  const stat = fs.statSync(file);

  // ページの骨組み（文字コードなど）がなければ足して、一覧へ戻るリンクをつける
  const back = `<a href="../${"../".repeat(rel.length - 1)}index.html" style="position:fixed;left:calc(10px + env(safe-area-inset-left,0px));bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:99;background:#1d2b45;color:#fff;font:700 13px/1 system-ui,sans-serif;padding:9px 12px;border-radius:99px;text-decoration:none;opacity:.88">← ゲーム一覧</a>`;
  if (!/<!doctype/i.test(html)) {
    html = `<!doctype html>\n<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${GAME_GA}\n<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n</head><body>\n${html}\n${back}\n${FEEDBACK}\n</body></html>`;
  } else {
    html = html.replace(/<\/body>/i, `${back}${FEEDBACK}</body>`).replace(/<\/head>/i, `${GAME_GA}</head>`);
  }
  // 緊急のお知らせの帯と、このゲームへの注意
  html = html.replace(/<\/body>/i, (m) => NOTICE(rel.length) + m);
  html = afterBody(html, gameNotes(gameId(file), rel.length));
  // 有料版には、利用コードを確かめるしくみを入れる（ゲーム本体のスクリプトより前に読みこむ）
  if (pickMeta(html, "game:paid")) html = html.replace(/<\/head>/i, `${ACCESS}</head>`);
  // 一覧データ（games.json）の場所は、ゲームのフォルダの深さに合わせる
  html = html.replaceAll("'../games.json'", `'${"../".repeat(rel.length)}games.json'`);
  const outFile = path.join(OUT, "games", ...rel);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, html);

  list.push({
    title, subject, unit,
    grade: pickMeta(html, "game:grade"),
    players: pickMeta(html, "game:players"),
    paid: pickMeta(html, "game:paid") !== "",
    description: pickMeta(html, "description"),
    url: "games/" + rel.map(encodeURIComponent).join("/"),
    updated: stat.mtime.toISOString().slice(0, 10),
    added: NEW_GAMES[gameId(file)] || "",
  });
}

const order = site.subjectOrder || [];
const rank = (s) => (order.indexOf(s) === -1 ? 999 : order.indexOf(s));
list.sort((a, b) => rank(a.subject) - rank(b.subject) || a.subject.localeCompare(b.subject, "ja") || a.unit.localeCompare(b.unit, "ja") || a.title.localeCompare(b.title, "ja"));

fs.writeFileSync(path.join(OUT, "games.json"), JSON.stringify({ site: Object.assign({}, site, { feedback: FB, newsLatest: NEWS.map((n) => n.date).sort().at(-1) || "" }), games: list }, null, 2));
const withNotice = (html) => html.replace(/<\/body>/i, (m) => NOTICE(0) + m);
// お知らせのページ
const newsHtml = NEWS.map((n) => `<article class="item" data-date="${esc(n.date)}"><time datetime="${esc(n.date)}">${esc(n.date.replace(/^(\d+)-0?(\d+)-0?(\d+)$/, "$1年$2月$3日"))}</time><span class="new">NEW</span>`
  + `<h2>${esc(n.title)}</h2><p>${esc(n.body || "")}</p>${n.link ? `<a class="more" href="${esc(n.link)}">くわしく見る →</a>` : ""}</article>`).join("\n") || '<p class="small">いまはお知らせはありません。</p>';
fs.writeFileSync(path.join(OUT, "news.html"), withNotice(fs.readFileSync(path.join(ROOT, "news.html"), "utf8")
  .replaceAll("{{SITE_NAME}}", esc(site.name)).replace("{{GA}}", GA).replace("{{NEWS}}", () => newsHtml)));
let index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8")
  .replaceAll("{{SITE_NAME}}", esc(site.name))
  .replaceAll("{{SITE_DESCRIPTION}}", esc(site.description));
fs.writeFileSync(path.join(OUT, "index.html"), withNotice(index.replace("{{GA}}", GA)));
const privacy = fs.readFileSync(path.join(ROOT, "privacy.html"), "utf8")
  .replaceAll("{{SITE_NAME}}", esc(site.name)).replaceAll("{{CONTACT}}", esc(site.contact || "（連絡先を site.json に書いてください）")).replace("{{GA}}", GA);
fs.writeFileSync(path.join(OUT, "privacy.html"), withNotice(privacy));
const parent = fs.readFileSync(path.join(ROOT, "parent.html"), "utf8")
  .replaceAll("{{SITE_NAME}}", esc(site.name)).replace("{{GA}}", GA);
fs.writeFileSync(path.join(OUT, "parent.html"), withNotice(parent));
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
  fs.writeFileSync(path.join(OUT, name), withNotice(page));
}
if (!API) console.warn("※ site.json の apiBase が空です。有料版は「販売準備中」と表示されます。");
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
console.log(`ゲーム ${list.length} 本で一覧を作りました`);
