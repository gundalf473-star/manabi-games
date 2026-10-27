// 有料版の問題データ（packs フォルダの JSON）をサーバーに入れます。
// 使い方： node server/upload-packs.mjs <サーバーのアドレス> <ADMIN_KEY> <packsフォルダ>
//   例）node server/upload-packs.mjs https://manabi-api.xxxx.workers.dev 管理キー ../manabi-packs
// packs フォルダは GitHub に入れないでください（有料版の中身そのものです）。
import fs from "node:fs";
import path from "node:path";
const [api, key, dir] = process.argv.slice(2);
if (!api || !key || !dir) { console.log("使い方: node server/upload-packs.mjs <サーバーのアドレス> <ADMIN_KEY> <packsフォルダ>"); process.exit(1); }
let ok = 0, ng = 0;
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
  const game = f.replace(/\.json$/, "");
  const body = fs.readFileSync(path.join(dir, f), "utf8");
  const r = await fetch(api.replace(/\/$/, "") + "/api/admin/pack/" + game, { method: "PUT", headers: { "X-Admin-Key": key, "Content-Type": "application/json" }, body });
  const d = await r.json().catch(() => ({}));
  if (r.ok) { ok++; console.log("OK  ", game, d.bytes + "文字"); } else { ng++; console.log("失敗", game, r.status, d.error || ""); }
}
console.log(`入れたデータ ${ok}本、失敗 ${ng}本`);
