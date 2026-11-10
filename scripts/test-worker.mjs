// worker.js を本番に出す前の確認（GitHub Actions で自動で動く。手元では node scripts/test-worker.mjs）
// KV はメモリのにせもの。Stripe には つながない。主な動き（料金表・管理キー・利用コード・パックの受けわたし・教科のちがい）を確かめる。
import worker from "../server/worker.js";

const kv = new Map(), meta = new Map();
const env = {
  MN: {
    get: async (k) => (kv.has(k) ? kv.get(k) : null),
    put: async (k, v, o) => { kv.set(k, v); if (o && o.metadata) meta.set(k, o.metadata); else meta.delete(k); },
    delete: async (k) => { kv.delete(k); },
    list: async ({ prefix = "" } = {}) => ({ keys: [...kv.keys()].filter((k) => k.startsWith(prefix)).map((name) => (meta.has(name) ? { name, metadata: meta.get(name) } : { name })), list_complete: true }),
  },
  STRIPE_SECRET_KEY: "sk_test_dummy", STRIPE_WEBHOOK_SECRET: "whsec_test", TOKEN_SECRET: "test-token-secret", ADMIN_KEY: "test-admin", SITE_URL: "https://example.com",
};
const B = "https://w.example";
const call = async (path, opt = {}) => {
  const r = await worker.fetch(new Request(B + path, opt), env);
  let body = null; try { body = await r.json(); } catch {}
  return { status: r.status, body };
};
const admin = (path, method, body) => call("/api/admin/" + path, { method, headers: { "X-Admin-Key": "test-admin", "Content-Type": "application/json" }, body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body) });

let ng = 0;
const ok = (cond, name) => { console.log((cond ? "ok   " : "NG   ") + name); if (!cond) ng++; };

// ゲーム名（パックの名前）が重なっていないか。重なると、あとに書いたほうの教科になり、パックも上書きされる
{
  const fs = await import("node:fs"), path = await import("node:path");
  const src = fs.readFileSync(new URL("../server/worker.js", import.meta.url), "utf8");
  const body = (src.match(/const GAMES = \{([\s\S]*?)\};/) || [, ""])[1];
  const keys = [...body.matchAll(/(?:^|[{,\s])(?:"([\w-]+)"|([A-Za-z_][\w]*))\s*:/g)].map((m) => m[1] || m[2]);
  const dup = keys.filter((k, i) => keys.indexOf(k) !== i);
  ok(!dup.length, "GAMES のゲーム名が重なっていない" + (dup.length ? "（" + [...new Set(dup)].join("・") + "）" : ""));
  // ちがうページが同じパック名を読んでいないか（無料版と有料版の組は同じでよい）
  const root = new URL("../games/", import.meta.url).pathname, seen = {};
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith(".html") ? [path.join(d, e.name)] : []);
  for (const f of walk(root)) {
    const t = fs.readFileSync(f, "utf8"), m = t.match(/mnAccess\.load\('([\w-]+)'/) || (/mnAccess\.load\(ID\)/.test(t) && t.match(/const ID='([\w-]+)'/)); if (!m) continue;
    const base = f.replace(/(-full)?\.html$/, ""); (seen[m[1]] = seen[m[1]] || new Set()).add(base);
  }
  const clash = Object.entries(seen).filter(([, s]) => s.size > 1).map(([k]) => k);
  ok(!clash.length, "ちがうゲームが同じパック名を使っていない" + (clash.length ? "（" + clash.join("・") + "）" : ""));
}

const plans = await call("/api/plans");
ok(plans.status === 200 && plans.body && plans.body.prices && plans.body.periods, "料金表 /api/plans");
ok(plans.body && plans.body.prices.shakai && plans.body.prices.teigaku, "料金表に 社会・低学年 がある");

ok((await call("/api/admin/info", { headers: { "X-Admin-Key": "wrong" } })).status === 401, "まちがった管理キーは ことわられる");
const st = await admin("info", "GET");
ok(st.status === 200 && st.body && st.body.packs, "管理：パックの一覧");
const games = Object.keys((st.body && st.body.packs) || {});
ok(games.length > 300, `ゲームの登録数 ${games.length}`);

ok((await admin("pack/nariki", "PUT", '{"t":"test"}')).status === 200, "管理：パックを入れる");
ok((await admin("pack/no-such-game-xyz", "PUT", "{}")).status >= 400, "登録していないゲームのパックは入れられない");
{ // パックのハッシュ値：入れたときに記録し、一覧で返す。記録のない古いパックは fill で計算する
  const { createHash } = await import("node:crypto");
  const body = '{"t":"test"}', want = createHash("sha256").update(body).digest("hex");
  const h = await admin("pack-hashes", "GET");
  ok(h.status === 200 && h.body.hashes.nariki && h.body.hashes.nariki.sha === want, "管理：入れたパックのハッシュ値が PACKS.md と同じ計算で出る");
  kv.set("pack:hayasa", '{"old":1}');   // 記録のない古いパック
  const h2 = await admin("pack-hashes?fill=hayasa", "GET");
  ok(h2.body.hashes.hayasa && h2.body.hashes.hayasa.sha === createHash("sha256").update('{"old":1}').digest("hex"), "管理：記録のない古いパックのハッシュ値も計算できる");
  kv.delete("pack:hayasa");
  ok((await call("/api/admin/pack-hashes")).status === 401, "管理キーなしでは ハッシュ値の一覧は見られない");
}
{ const inf = (await admin("info", "GET")).body || { packs: {} }; ok(inf.packs.nariki === true && inf.packs["keisan-kufu"] === false, "管理：入れたパックだけが「入っている」と出る"); }

const iss = await admin("issue", "POST", { subject: "shakai", period: "m1" });
ok(iss.status === 200 && /^MN-/.test((iss.body || {}).code || ""), "管理：利用コードを作る");
const act = await call("/api/activate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: iss.body.code, device: "dev-test-1" }) });
ok(act.status === 200 && act.body && act.body.token, "利用コードを入れる /api/activate");
const tok = act.body && act.body.token;
const pk = await call("/api/pack/nariki", { headers: { Authorization: "Bearer " + tok } });
ok(pk.status === 200 && pk.body && pk.body.t === "test", "社会のコードで 社会のパックが読める");
await admin("pack/keisan-kufu", "PUT", '{"t":"sansu"}');
const other = await call("/api/pack/keisan-kufu", { headers: { Authorization: "Bearer " + tok } });
ok(other.status === 403, "社会のコードでは 算数のパックは読めない");
ok((await call("/api/pack/nariki")).status === 401, "コードなしでは パックは読めない");

console.log(ng ? `\n${ng} 件 NG。本番には出しません。` : "\nすべて ok");
process.exit(ng ? 1 : 0);
