/* まなびゲーム箱のサービスワーカー（ホーム画面に追加したときに、アプリのように開くため）。
   いつもはインターネットから最新のページを読みこみ、つながらないときだけ、前に開いたページを出します。
   有料版の問題データ（サーバーとのやりとり）は、ここではあつかいません。 */
const V = "mn-__BUILD__";
const FIRST = ["./", "index.html", "daily.html", "games.json", "daily.json", "icon-192.png"];
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(V).then((c) => c.addAll(FIRST)).catch(() => {}));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("mn-") && k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;              // フォントやサーバー（有料版）はそのまま
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok && res.type === "basic") { const copy = res.clone(); caches.open(V).then((c) => c.put(req, copy)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: req.mode === "navigate" }).then((r) => r || (req.mode === "navigate" ? caches.match("index.html") : Response.error())))
  );
});
