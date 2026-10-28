// まなびゲーム箱 有料プランのサーバー（Cloudflare Workers）
// - 料金表、Stripe での支払い、利用コードの発行、期限の確認、有料版の問題データの配信をします。
// - 問題データは KV（MN）に「pack:ゲーム名」で入れておきます（GitHub には置きません）。
//
// 必要な設定（Cloudflare のダッシュボード → Workers → 設定 → 変数とシークレット）
//   KV の割り当て  MN
//   シークレット   STRIPE_SECRET_KEY（sk_test_… / sk_live_…）, STRIPE_WEBHOOK_SECRET（whsec_…）,
//                  TOKEN_SECRET（長いランダムな文字列）, ADMIN_KEY（管理用の長いランダムな文字列）
//                  RESEND_API_KEY（任意。利用コードをメールで送るとき／お問い合わせをメールで知らせるとき）
//   変数           SITE_URL（例 https://xxxx.github.io/manabi）, MAIL_FROM（任意。例 まなびゲーム箱 <info@example.com>）, CONTACT_TO（任意。お問い合わせを知らせる先のメール）

// ---- 料金表（税込・円）。ここを変えると、購入ページの表示も変わります ----
const SUBJECTS = { kokugo: "国語", sansu: "算数", rika: "理科", shakai: "社会", shikou: "思考力", all: "全教科" };
const PERIODS = {
  d1: { name: "1日", ms: 1 * 864e5 },
  w1: { name: "1週間", ms: 7 * 864e5 },
  m1: { name: "1ヵ月（30日）", ms: 30 * 864e5 },
  y1: { name: "1年（365日）", ms: 365 * 864e5 },
};
const PRICES = {
  kokugo: { d1: 1000, w1: 2000, m1: 4000, y1: 20000 },
  sansu: { d1: 1000, w1: 2000, m1: 4000, y1: 20000 },
  rika: { d1: 1000, w1: 2000, m1: 4000, y1: 20000 },
  shakai: { d1: 1000, w1: 2000, m1: 4000, y1: 20000 },
  shikou: { d1: 1000, w1: 2000, m1: 4000, y1: 20000 },
  all: { d1: 2000, w1: 4000, m1: 8000, y1: 40000 },
};
// ---- 有料版のゲームと教科 ----
const GAMES = {
  chusho: "kokugo", hantaigo: "kokugo", hinshi: "kokugo", hyakunin: "kokugo", kakariuke: "kokugo",
  kotowaza: "kokugo", sanji: "kokugo", yojikanji: "kokugo",
  "keisan-kufu": "sansu", "tokushu-puzzle": "sansu", wariai: "sansu", hayasa: "sansu", menseki: "sansu", kisoku: "shikou", tenkai: "shikou", ronri: "shikou",
  asuka: "shakai", nara: "shakai", kamakura: "shakai", sengoku: "shakai", "edo-zenki": "shakai", "edo-chuki": "shakai", "edo-koki": "shakai",
  "meiji-zenki": "shakai", "meiji-koki": "shakai", "sekai-chizu": "shakai", chizukigou: "shakai",
  yojijukugo300: "kokugo", kanyouku300: "kokugo",
  tentai: "rika", denki: "rika", tekobane: "rika", suiyoeki: "rika",
};
const CONTACT_KINDS = ["有料版・利用コードについて", "お支払い・返金について", "問題のまちがいについて", "ゲームの不具合について", "個人情報の取り扱いについて", "その他"];
const MAX_DEVICES = 3;            // 1つの利用コードで使える端末の数
const START_LIMIT = 180 * 864e5;  // 購入から使い始めるまでの期限（180日）
const TOKEN_TTL = 7 * 864e5;      // 端末に渡す「通行証」の長さ（期限より短ければ、期限の方が優先）

const enc = new TextEncoder();
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64u = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
async function hmac(secret, msg) {
  const k = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode(msg)));
}
const hex = (u8) => [...u8].map((b) => b.toString(16).padStart(2, "0")).join("");
function safeEq(a, b) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }

// 利用コード：まぎらわしい文字（0/O, 1/I/L）を使わない 12文字 → MN-XXXX-XXXX-XXXX
const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function newCode() {
  const r = crypto.getRandomValues(new Uint8Array(12));
  const s = [...r].map((b) => ALPHA[b % ALPHA.length]).join("");
  return `MN-${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8)}`;
}
const normCode = (s) => {
  const t = String(s || "").normalize("NFKC").toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^MN/, "");
  return t.length === 12 ? `MN-${t.slice(0, 4)}-${t.slice(4, 8)}-${t.slice(8)}` : null;
};

function cors(env, req) {
  const origin = req.headers.get("Origin") || "";
  let allow = "*";
  // 管理用（admin.html をパソコンで直接開いて使う）は、管理キーで守るのでどこからでも受けつける
  if (new URL(req.url).pathname.startsWith("/api/admin/")) return { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,X-Admin-Key" };
  try { if (env.SITE_URL) allow = new URL(env.SITE_URL).origin; } catch (e) {}
  if (origin && (origin === allow || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))) allow = origin;
  return { "Access-Control-Allow-Origin": allow, "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Admin-Key", "Vary": "Origin" };
}
const json = (env, req, data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...cors(env, req) } });
const fail = (env, req, status, error, extra = {}) => json(env, req, { error, ...extra }, status);

// ---- Stripe ----
async function stripe(env, method, path, params) {
  const body = params ? new URLSearchParams(params).toString() : undefined;
  const r = await fetch("https://api.stripe.com/v1/" + path, {
    method, body,
    headers: { Authorization: "Bearer " + env.STRIPE_SECRET_KEY, ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}) },
  });
  const d = await r.json();
  if (!r.ok) throw new Error((d.error && d.error.message) || "Stripe error");
  return d;
}
async function verifyStripe(env, req, raw) {
  const h = req.headers.get("Stripe-Signature") || "";
  const parts = Object.fromEntries(h.split(",").map((p) => p.split("=")));
  const t = parts.t, v1 = h.split(",").filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  if (!t || !v1.length || Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const sig = hex(await hmac(env.STRIPE_WEBHOOK_SECRET, `${t}.${raw}`));
  return v1.some((v) => safeEq(v, sig));
}

// ---- 利用コード ----
const getRec = async (env, code) => { const v = await env.MN.get("code:" + code); return v ? JSON.parse(v) : null; };
const putRec = (env, code, rec) => env.MN.put("code:" + code, JSON.stringify(rec));
async function issueForSession(env, s) {
  if (s.payment_status !== "paid") return null;
  const done = await env.MN.get("sess:" + s.id);
  if (done) return JSON.parse(done);
  const sub = s.metadata && s.metadata.subject, per = s.metadata && s.metadata.period;
  if (!PRICES[sub] || !PRICES[sub][per]) throw new Error("bad metadata");
  const code = newCode();
  const rec = { s: sub, p: per, created: Date.now(), devices: [], session: s.id, amount: s.amount_total, email: (s.customer_details && s.customer_details.email) || "" };
  await putRec(env, code, rec);
  const out = { code, subject: sub, period: per };
  await env.MN.put("sess:" + s.id, JSON.stringify(out));
  if (env.RESEND_API_KEY && rec.email) {
    try { await mailCode(env, rec.email, out); } catch (e) {}
  }
  return out;
}
async function mailCode(env, to, o) {
  const site = env.SITE_URL || "";
  const text = `まなびゲーム箱をご購入いただき、ありがとうございます。\n\n利用コード：${o.code}\nプラン：${SUBJECTS[o.subject]}・${PERIODS[o.period].name}\n\n有料版のゲームを開いて、この利用コードを入れてください。\n利用期間は、はじめてコードを入れたときから始まります（購入から180日以内に使い始めてください）。\n1つのコードで${MAX_DEVICES}台まで使えます。\n\n利用コードの入力・確認：${site}/plan.html\n\nこのメールは送信専用です。`;
  await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.MAIL_FROM || "まなびゲーム箱 <onboarding@resend.dev>", to: [to], subject: "【まなびゲーム箱】利用コードのお知らせ", text }),
  });
}
async function makeToken(env, payload) {
  const body = b64u(enc.encode(JSON.stringify(payload)));
  return body + "." + b64u(await hmac(env.TOKEN_SECRET, body));
}
async function readToken(env, tok) {
  const [body, sig] = String(tok || "").split(".");
  if (!body || !sig) return null;
  if (!safeEq(sig, b64u(await hmac(env.TOKEN_SECRET, body)))) return null;
  try { return JSON.parse(new TextDecoder().decode(fromB64u(body))); } catch (e) { return null; }
}
function statusOf(rec, now) {
  if (rec.revoked) return "revoked";
  if (rec.exp) return now < rec.exp ? "active" : "expired";
  return now - rec.created < START_LIMIT ? "unused" : "expired";
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url), p = url.pathname.replace(/\/+$/, ""), now = Date.now();
    if (req.method === "OPTIONS") return new Response(null, { headers: cors(env, req) });
    try {
      // 料金表
      if (p === "/api/plans" && req.method === "GET")
        return json(env, req, { subjects: SUBJECTS, periods: Object.fromEntries(Object.entries(PERIODS).map(([k, v]) => [k, v.name])), prices: PRICES, maxDevices: MAX_DEVICES, games: GAMES, test: String(env.STRIPE_SECRET_KEY || "").startsWith("sk_test") });

      // 支払いページへ
      if (p === "/api/checkout" && req.method === "POST") {
        const b = await req.json().catch(() => ({}));
        const amount = PRICES[b.subject] && PRICES[b.subject][b.period];
        if (!amount) return fail(env, req, 400, "bad_plan");
        const site = (env.SITE_URL || "").replace(/\/$/, "");
        const name = `まなびゲーム箱 有料版（${SUBJECTS[b.subject]}・${PERIODS[b.period].name}）`;
        const s = await stripe(env, "POST", "checkout/sessions", {
          mode: "payment", locale: "ja",
          // Stripe が販売者になる「Managed Payments」は使わない（販売者は当サイト。特商法の表記もこちら）
          "managed_payments[enabled]": "false",
          "line_items[0][quantity]": "1",
          "line_items[0][price_data][currency]": "jpy",
          "line_items[0][price_data][unit_amount]": String(amount),
          "line_items[0][price_data][product_data][name]": name,
          "line_items[0][price_data][product_data][description]": "利用コードで使う有料版。利用期間は、はじめてコードを入れたときから始まります。自動更新はありません。",
          "metadata[subject]": b.subject, "metadata[period]": b.period,
          "payment_intent_data[metadata][subject]": b.subject, "payment_intent_data[metadata][period]": b.period,
          success_url: `${site}/buy.html?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${site}/buy.html?canceled=1&s=${b.subject}`,
        });
        return json(env, req, { url: s.url });
      }

      // 支払いのあと：利用コードを受け取る
      if (p === "/api/order" && req.method === "GET") {
        const id = url.searchParams.get("session_id") || "";
        if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return fail(env, req, 400, "bad_session");
        const done = await env.MN.get("sess:" + id);
        if (done) return json(env, req, JSON.parse(done));
        const s = await stripe(env, "GET", "checkout/sessions/" + id);
        const out = await issueForSession(env, s);
        return out ? json(env, req, out) : fail(env, req, 402, "not_paid");
      }

      // Stripe からの知らせ（支払い完了）
      if (p === "/api/webhook" && req.method === "POST") {
        const raw = await req.text();
        if (!(await verifyStripe(env, req, raw))) return new Response("bad signature", { status: 400 });
        const ev = JSON.parse(raw);
        if (ev.type === "checkout.session.completed" || ev.type === "checkout.session.async_payment_succeeded") await issueForSession(env, ev.data.object);
        return new Response("ok");
      }

      // 利用コードを端末で使う
      if (p === "/api/activate" && req.method === "POST") {
        const b = await req.json().catch(() => ({}));
        const code = normCode(b.code), dev = String(b.device || "").slice(0, 64);
        if (!code || dev.length < 8) return fail(env, req, 400, "bad_code");
        const rec = await getRec(env, code);
        if (!rec) return fail(env, req, 404, "not_found");
        const st = statusOf(rec, now);
        if (st === "revoked") return fail(env, req, 403, "revoked");
        if (st === "expired") return fail(env, req, 410, "expired", { exp: rec.exp || null });
        if (!rec.devices.includes(dev)) {
          if (rec.devices.length >= MAX_DEVICES) return fail(env, req, 403, "devices", { max: MAX_DEVICES });
          rec.devices.push(dev);
        }
        if (!rec.exp) { rec.start = now; rec.exp = now + PERIODS[rec.p].ms; }
        await putRec(env, code, rec);
        const token = await makeToken(env, { c: code, d: dev, s: rec.s, exp: rec.exp, t: Math.min(rec.exp, now + TOKEN_TTL) });
        return json(env, req, { code, subject: rec.s, period: rec.p, start: rec.start, exp: rec.exp, token });
      }

      // 有料版の問題データ
      const pm = p.match(/^\/api\/pack\/([a-z0-9-]+)$/);
      if (pm && req.method === "GET") {
        const game = pm[1], subj = GAMES[game];
        if (!subj) return fail(env, req, 404, "no_game");
        const tk = await readToken(env, (req.headers.get("Authorization") || "").replace(/^Bearer\s+/, ""));
        if (!tk) return fail(env, req, 401, "bad_token");
        if (tk.s !== "all" && tk.s !== subj) return fail(env, req, 403, "subject");
        if (now >= tk.exp) return fail(env, req, 410, "expired", { exp: tk.exp });
        if (now >= tk.t) return fail(env, req, 401, "renew");
        const rec = await getRec(env, tk.c);
        if (!rec || rec.revoked || !rec.devices.includes(tk.d)) return fail(env, req, 403, "revoked");
        const data = await env.MN.get("pack:" + game);
        if (!data) return fail(env, req, 503, "no_data");
        return new Response(data, { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "private, no-store", ...cors(env, req) } });
      }

      // お問い合わせ（フォームから）。KV に「msg:時刻-乱数」で保存し、管理画面で読む
      if (p === "/api/contact" && req.method === "POST") {
        const b = await req.json().catch(() => ({}));
        if (b.hp) return json(env, req, { ok: true });            // 人には見えない欄に入力がある＝ロボット。保存しない
        const str = (v, n) => String(v == null ? "" : v).normalize("NFKC").replace(/\u0000/g, "").trim().slice(0, n);
        const m = { kind: str(b.kind, 40), title: str(b.title, 100), body: String(b.body == null ? "" : b.body).replace(/\u0000/g, "").trim().slice(0, 3000),
          name: str(b.name, 60), email: str(b.email, 200), code: str(b.code, 30), page: str(b.page, 200) };
        if (!CONTACT_KINDS.includes(m.kind) || !m.title || !m.body) return fail(env, req, 400, "bad_contact");
        if (m.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email)) return fail(env, req, 400, "bad_email");
        if (Number(b.t) > 0 && now - Number(b.t) < 3000) return json(env, req, { ok: true });   // 開いて3秒以内の送信＝ロボットとみなす
        const ip = req.headers.get("CF-Connecting-IP") || "?";
        const rk = `rl:contact:${hex(await hmac(env.TOKEN_SECRET || "x", ip)).slice(0, 16)}:${Math.floor(now / 36e5)}`;
        const n = Number((await env.MN.get(rk)) || 0);
        if (n >= 5) return fail(env, req, 429, "too_many");       // 1時間に5通まで
        await env.MN.put(rk, String(n + 1), { expirationTtl: 7200 });
        const id = `${now}-${hex(crypto.getRandomValues(new Uint8Array(4)))}`;
        await env.MN.put("msg:" + id, JSON.stringify({ id, at: now, ...m, done: false }));
        if (env.RESEND_API_KEY && env.CONTACT_TO) {               // 任意：届いたことをメールで知らせる
          await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ from: env.MAIL_FROM || "まなびゲーム箱 <onboarding@resend.dev>", to: [env.CONTACT_TO], subject: "【まなびゲーム箱】お問い合わせ：" + m.title,
              text: `項目：${m.kind}\nタイトル：${m.title}\nお名前：${m.name || "（なし）"}\n返信先：${m.email || "（なし）"}\n利用コード：${m.code || "（なし）"}\n\n${m.body}\n\n管理画面（admin.html）の「お問い合わせ」で確認できます。` }) }).catch(() => {});
        }
        return json(env, req, { ok: true, id });
      }

      // ---- 管理用（X-Admin-Key が必要） ----
      if (p.startsWith("/api/admin/")) {
        const key = req.headers.get("X-Admin-Key") || "";
        if (!env.ADMIN_KEY || !safeEq(key, env.ADMIN_KEY)) return fail(env, req, 401, "admin");
        const ap = p.slice("/api/admin/".length);
        if (ap === "info" && req.method === "GET") {     // 接続の確認と、問題データが入っているか
          const packs = {};
          for (const g of Object.keys(GAMES)) packs[g] = !!(await env.MN.get("pack:" + g));
          return json(env, req, { ok: true, test: String(env.STRIPE_SECRET_KEY || "").startsWith("sk_test"), site: env.SITE_URL || "", packs });
        }
        const gm = ap.match(/^pack\/([a-z0-9-]+)$/);
        if (gm && req.method === "PUT") {               // 問題データを入れる
          if (!GAMES[gm[1]]) return fail(env, req, 404, "no_game");
          const t = await req.text(); JSON.parse(t);
          await env.MN.put("pack:" + gm[1], t);
          return json(env, req, { ok: true, game: gm[1], bytes: t.length });
        }
        if (ap === "issue" && req.method === "POST") {   // 手で利用コードを作る（テスト・プレゼント用）
          const b = await req.json().catch(() => ({}));
          if (!PRICES[b.subject] || !PERIODS[b.period]) return fail(env, req, 400, "bad_plan");
          const code = newCode();
          await putRec(env, code, { s: b.subject, p: b.period, created: now, devices: [], note: String(b.note || "").slice(0, 200), manual: true });
          return json(env, req, { code, subject: b.subject, period: b.period });
        }
        if (ap === "messages" && req.method === "GET") {   // お問い合わせの一覧（新しい順）
          const out = []; let cursor;
          do {
            const l = await env.MN.list({ prefix: "msg:", cursor });
            for (const k of l.keys) { const v = await env.MN.get(k.name); if (v) out.push(JSON.parse(v)); }
            cursor = l.list_complete ? null : l.cursor;
          } while (cursor && out.length < 500);
          out.sort((a, b) => b.at - a.at);
          return json(env, req, { messages: out });
        }
        if (ap === "message" && req.method === "POST") {    // 対応ずみにする／もどす／消す
          const b = await req.json().catch(() => ({}));
          const key = "msg:" + String(b.id || "").replace(/[^0-9a-f-]/g, "");
          const v = await env.MN.get(key); if (!v) return fail(env, req, 404, "not_found");
          if (b.delete) { await env.MN.delete(key); return json(env, req, { ok: true, deleted: true }); }
          const m = JSON.parse(v); m.done = !!b.done; await env.MN.put(key, JSON.stringify(m));
          return json(env, req, { ok: true, message: m });
        }
        const cm = ap.match(/^code\/(.+)$/);
        if (cm && req.method === "GET") {                 // 利用コードを調べる
          const code = normCode(decodeURIComponent(cm[1])); const rec = code && (await getRec(env, code));
          return rec ? json(env, req, { code, status: statusOf(rec, now), ...rec }) : fail(env, req, 404, "not_found");
        }
        if ((ap === "revoke" || ap === "reset-devices" || ap === "extend") && req.method === "POST") {
          const b = await req.json().catch(() => ({}));
          const code = normCode(b.code); const rec = code && (await getRec(env, code));
          if (!rec) return fail(env, req, 404, "not_found");
          if (ap === "revoke") rec.revoked = true;          // 使えなくする（返金したときなど）
          if (ap === "reset-devices") rec.devices = [];      // 端末の登録を消す（機種変更など）
          if (ap === "extend") { const d = Number(b.days) || 0; if (rec.exp) rec.exp += d * 864e5; }  // 期間をのばす（おわびなど）
          await putRec(env, code, rec);
          return json(env, req, { code, status: statusOf(rec, now), ...rec });
        }
      }
      return fail(env, req, 404, "not_found");
    } catch (e) {
      return fail(env, req, 500, "server", { message: String(e && e.message || e) });
    }
  },
};
