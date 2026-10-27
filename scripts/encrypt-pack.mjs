// 有料データを合言葉で暗号化します（Claudeが作業するときに使います）。
// 使い方: node scripts/encrypt-pack.mjs 元データ.json 出力先.enc.json 合言葉
// 元データ（暗号化前のファイル）は、GitHubにアップロードしないでください。
import fs from "node:fs";
import { webcrypto as crypto } from "node:crypto";

const [src, out, pass] = process.argv.slice(2);
if (!src || !out || !pass) { console.error("使い方: node scripts/encrypt-pack.mjs 元データ.json 出力先.enc.json 合言葉"); process.exit(1); }

// ページ側と同じ決まりで合言葉をそろえる（全角→半角、大文字→小文字、空白とハイフンを無視）
const norm = (s) => s.normalize("NFKC").toLowerCase().replace(/[\s\-ー－]/g, "");
const b64 = (u8) => Buffer.from(u8).toString("base64");

const ITER = 250000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(norm(pass)), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
const plain = new TextEncoder().encode(JSON.stringify(JSON.parse(fs.readFileSync(src, "utf8"))));
const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain));
fs.writeFileSync(out, JSON.stringify({ v: 1, kdf: "PBKDF2-SHA256", iter: ITER, salt: b64(salt), iv: b64(iv), data: b64(data) }));
console.log(`暗号化しました: ${out}`);
