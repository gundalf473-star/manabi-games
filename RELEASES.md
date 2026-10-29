# リリースの記録

サイト（GitHub Pages）は、GitHubに入れると自動で公開されます。
次の3つは自動では入らないので、手で作業します。ここに「いつ・何を入れたか」を残します。

- **サーバー**：Cloudflare に `server/worker.js` を貼り直す
- **問題データ**：`admin.html` で packs の JSON を入れる
- **管理画面**：`server/admin.html` を、自分のパソコンのものと入れかえる

## まだリリースしていない変更（次のリリースでまとめて入れる）

| 変更 | サーバー（worker.js） | 問題データ | 管理画面 |
|---|---|---|---|
| 販促チラシ：チラシ印刷（server/flyer.html）・二次元コードから利用コードが入る（plan.html）・管理画面で利用コードをまとめて作ってCSVで保存 | ― | ― | 必要（admin.html と flyer.html をパソコンに置く） |
| 算数の新単元「計算と逆算」「数の性質」（確認後の版・各100問） | 必要（GAMES に gyakusan・seishitsu を追加） | gyakusan・seishitsu を入れる | ― |
| 間をあけた解き直し（まちがえた問題を1・3・7・14日後にもう一度。有料版のすべての問題ゲーム）・毎日の計算ドリル（drill.html、無料） | ― | ― | ― |
| 国語の新単元「接続語・指示語」（確認後の版・100問）「要約トレーニング」（確認後の版・30題80問）、毎日の一文要約（ichibun.html、無料）、保護者ページに「国語の要約」 | 必要（GAMES に setsuzoku・yoyaku を追加） | setsuzoku・yoyaku を入れる | ― |
| 国語の新単元「漢字の読み書き」「気持ちを表す言葉」「説明文・論説文のことば」（確認後の版・各100問） | 必要（GAMES に kanji・shinjo・hyoron を追加） | kanji・shinjo・hyoron を入れる | ― |
| 国語の新単元「熟語の組み立て」「敬語」「故事成語」「表現技法（詩・短歌・俳句）」（確認後の版・各100問） | 必要（GAMES に jukugo・keigo・koji・hyogen を追加） | jukugo・keigo・koji・hyogen を入れる | ― |
| 理科の新単元「ものの溶け方と溶解度」「理科の計算」「実験の考え方」「エネルギーと環境・時事」「空気と水の性質・圧力」「人のからだの計算」（確認後の版・各100問） | 必要（GAMES に yokai・rikakeisan・jikken・energy・kukimizu・jintaikeisan を追加） | 6本を入れる | ― |
| 思考力の新単元「数字つなぎパズル」「ブロックしきつめ」「積み木の数」「ビルディングパズル」（各100問・無料版5問） | 必要（GAMES に sujitsunagi・shikitsume・tsumiki・building を追加） | sujitsunagi・shikitsume・tsumiki・building を入れる | ― |

**販売を始めるとき**：`buy.html` の `OPEN` と `server/worker.js` の `SALES_OPEN` を `true` にして worker.js を貼り直し、Stripe を本番モード（sk_live）に切りかえる。

## リリースずみ

| リリース日時 | サーバー（worker.js） | 問題データ | 管理画面 | メモ |
|---|---|---|---|---|
| 2026-10-29 05:56（日本時間） | fa04e4b の版（343行） | 全62本を入れ直し（「すべて入っています」を確認） | fa04e4b の版（つながらないときの理由を表示） | 独自ドメイン manabigamebako.com に切りかえ（SITE_URL も変更）。購入ページは準備中・サーバーでも決済を止めた。理科・社会の新単元、公民・都道府県の有料版、思考力2本、算数2本など 43件をまとめてリリース |
| 2026-10-28 08:30（日本時間） | 349893f の版（274行） | kisoku・ronri・tenkai（確認後の版）。kamakura ほか全部入っていることを確認 | 349893f の版（思考力を選べる） | 思考力を別プランにした。鎌倉時代・思考力3本を追加 |
