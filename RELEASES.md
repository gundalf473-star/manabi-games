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
| 思考力の新単元8本（ロボット迷路・折り紙切り紙・一筆書き・虫食い算覆面算・立体の見え方・ナンプレ・天びん・スライドパズル）と、算数「場合の数」（各100問・無料版5問） | 必要（GAMES に nanpure・robot・origami・hitofude・mushikui・mikata・tenbin・slide・baai を追加） | 9本を入れる | ― |
| 思考力の新単元「数字つなぎパズル」「ブロックしきつめ」「積み木の数」「ビルディングパズル」（各100問・無料版5問） | 必要（GAMES に sujitsunagi・shikitsume・tsumiki・building を追加） | sujitsunagi・shikitsume・tsumiki・building を入れる | ― |
| 中高一貫コースの土台：入口ページ（chuko/index.html）・トップの入口（中高一貫コースのゲームが1本でもあると表示）・購入ページに「中高一貫コース」プランと継続割引（中学受験のプランを買ったことがある人は20%引き・1コード1回）・保護者ページのコース切りかえ。「全教科」には中高一貫コースは入らない | 必要（SUBJECTS・PRICES に chuko（1ヵ月4000円）、CONTINUE_OFF＝20、/api/continue） | ― | 利用コードの教科に「中高一貫コース」を追加 |
| 中高一貫コースの入学準備パック4単元「算数から数学へ」「正負の数・文字式」「中1英単語・英文法」「古文入門」（各100問・無料版5問） | 必要（GAMES に c-sansu-sugaku・c-seifu・c-eigo1・c-kobun を "chuko" で追加） | c-sansu-sugaku・c-seifu・c-eigo1・c-kobun を入れる | ― |
| 中高一貫コース：毎日の英単語（chuko/tango.html・中1〜中3の1062語・無料）、定期テスト対策（chuko/test.html）、保護者ページの中だるみ・テスト前のお知らせ、期限前の1年プラン案内。新単元「一次方程式」「比例と反比例」「平面図形」「過去形・進行形」「古文単語と漢文入門」「英検3級対策」（各100問・無料版5問） | 必要（GAMES に c-hoteishiki・c-hirei・c-heimen・c-eigo-kako・c-kobun2・c-eiken3 を "chuko" で追加） | 6単元のパックを入れる | ― |
| 中高一貫コースの社会：世界史「古代文明と宗教」「中世〜近世のヨーロッパとアジア」「市民革命と産業革命」「二つの世界大戦と現代」、日本史「世界とつなげる日本史」「政治のしくみと文化史」「並べかえと因果関係」（各100問・無料版5問） | 必要（GAMES に c-sekai1〜4・c-nihon1〜3 を "chuko" で追加） | 7単元のパックを入れる | ― |
| 中高一貫コースの理科：物理「光・音・力」「電流と磁界」「運動とエネルギー」、化学「物質の性質と状態変化」「原子・分子と化学変化」「イオンと酸・アルカリ」（各100問・無料版5問） | 必要（GAMES に c-butsuri1〜3・c-kagaku1〜3 を "chuko" で追加） | 6単元のパックを入れる | ― |
| 中高一貫コースの英語：「英検準2級対策① 語い・熟語」「英検準2級対策② 文法・会話・読解・ライティング」（各100問・無料版5問） | 必要（GAMES に c-eiken-p2a・c-eiken-p2b を "chuko" で追加） | 2単元のパックを入れる | ― |
| 中高一貫コースの英語：「英検2級対策① 語い・熟語」「英検2級対策② 文法・読解・ライティング」（各100問・無料版5問） | 必要（GAMES に c-eiken2a・c-eiken2b を "chuko" で追加） | 2単元のパックを入れる | ― |
| 中高一貫コースの国語：「評論の読み方① 論理の型」「評論の読み方② 評論のキーワード」「論証と批評」「国語表現 話す・書く・伝える」（各100問・無料版5問） | 必要（GAMES に c-ronri1〜3・c-hyogen を "chuko" で追加） | 4単元のパックを入れる | ― |
| 中高一貫コースの数学：中2「連立方程式」「一次関数」「図形の性質と証明」「確率とデータの活用」、中3「式の展開・因数分解と平方根」「二次方程式と関数 y＝ax²」「相似・円周角・三平方の定理」、高校「数学Ⅰ 数と式・二次関数」「数学Ⅰ 三角比とデータの分析」「数学A 場合の数と確率」（各100問・無料版5問） | 必要（GAMES に10単元を "chuko" で追加） | 10単元のパックを入れる | ― |
| 中高一貫コースの数学：数学Ⅱ「式と証明・複素数と方程式」「図形と方程式」「三角関数」「指数関数・対数関数」「微分と積分」、数学B「数列」、数学C「ベクトル」（各100問・無料版5問） | 必要（GAMES に c-su2a〜e・c-sub・c-suc を "chuko" で追加） | 7単元のパックを入れる | ― |
| 中高一貫コースの数学：数学B「統計的な推測」、数学C「平面上の曲線と複素数平面」（各100問・無料版5問） | 必要（GAMES に c-sub2・c-suc2 を "chuko" で追加） | 2単元のパックを入れる | ― |
| 中高一貫コースの理科：生物「生物の観察と分類」「細胞と生物のからだ」「生命の連続性と自然界」、地学「大地の変化」「天気とその変化」「地球と宇宙」（各100問・無料版5問） | 必要（GAMES に c-seibutsu1〜3・c-chigaku1〜3 を "chuko" で追加） | 6単元のパックを入れる | ― |
| 中高一貫コースの理科：物理基礎5単元・化学基礎4単元・生物基礎4単元・地学基礎3単元（各100問・無料版5問） | 必要（GAMES に c-pk1〜5・c-ck1〜4・c-bk1〜4・c-ek1〜3 を "chuko" で追加） | 16単元のパックを入れる | ― |
| 中高一貫コースの理科：物理5単元・化学4単元・生物4単元（高校の発展科目、各100問・無料版5問） | 必要（GAMES に c-ph1〜5・c-ch1〜4・c-bi1〜4 を "chuko" で追加） | 13単元のパックを入れる | ― |
| 中高一貫コースの料金を教科ごとに（国語・数学・英語・理科・社会 各1ヵ月4,000円、中高一貫 全教科 1ヵ月8,000円。中学受験と同じ値段） | 必要（worker.js を貼り直す） | いらない | ― |
| 中高一貫コースの国語：口語文法①②・中学の漢字①②・語句と語彙・古典文法・漢文の句法・詩歌と文学史（各100問・無料版5問） | 必要（GAMES に c-bunpo1・c-bunpo2・c-kanji1・c-kanji2・c-goku・c-koten・c-kanbun・c-inbun を "ckokugo" で追加） | 8単元のパックを入れる | ― |
| 中高一貫コースの社会：中学地理5・中学公民5・高校の地理総合・歴史総合・テーマ史・公共・政治経済・倫理（各100問・無料版5問） | 必要（GAMES に c-chiri1・c-chiri2・c-chiri3・c-chiri4・c-chiri5・c-komin1・c-komin2・c-komin3・c-komin4・c-komin5・c-chirisogo・c-rekisogo・c-tankyu・c-kokyo・c-seikei・c-rinri を "cshakai" で追加） | 16単元のパックを入れる | ― |
| 中高一貫コースの英語：絵で学ぶ英語7・中学英文法14・会話と読解2・高校英文法10・英検5級/4級/準2級プラス①②/準1級①②・英検ライティング2・英検リスニング3（各100問・無料版5問。絵の単元とリスニングは gen.py の PIC/EN_UI/LISTEN を使う） | 必要（GAMES に 44単元を "ceigo" で追加） | 44単元のパックを入れる | ― |
| 思考力パズル10本：アルゴリズムを追え・並べかえ名人・ランプの暗号・石取りゲームの必勝法・お絵かきロジック・魔方陣・数のピラミッド・マッチ棒パズル・油分け算・川わたり・図形はいくつ？・鏡と回転（無料版5問・有料版100問） | 必要（GAMES に flow・narabe・lamp・ishitori・nonogram・mahojin・matchbou・aburawake・zukeikazu・kagami を "shikou" で追加） | 10本のパックを入れる | ― |
| 算数11単元：円とおうぎ形・立体図形の体積と表面積・水の深さとグラフ・図形の移動・点の移動とグラフ・資料とグラフの読み取り・割合の文章題・特殊算②・方陣算・日暦算・N進法・比と比例・反比例・単位と量（各100問・無料版5問） | 必要（GAMES に enshu・rittai・mizu・idou・tenidou・shiryo・wariai2・tokushu2・hojin・hirei・tani を "sansu" で追加） | 11単元のパックを入れる | ― |
| 中高一貫コースに教科「情報」を追加：情報社会と情報モラル・情報のデジタル化・コンピュータのしくみ・ネットワークとセキュリティ・プログラミング① 変数・条件・くり返し・プログラミング② 関数・探索・整列・データの活用・モデル化とシミュレーション（各100問・無料版5問）。料金プランに「中高一貫 情報」（cjoho）を追加、中高一貫 全教科の対象に情報を追加 | 必要（SUBJECTS・CHUKO_SUBJ・PRICES に cjoho、GAMES に c-joho1・c-joho2・c-joho3・c-joho4・c-joho5・c-joho6・c-joho7・c-joho8 を "cjoho" で追加） | 8単元のパックを入れる | 必要（教科の選択肢に「中高一貫 情報」） |
| 新コース「就活・資格コース」（games/career/・career/index.html）：SPI非言語5・SPI言語3・ITパスポート4・基本情報技術者3・統計学3・簿記3級3・TOEIC英語3（各100問・無料版5問）。料金プラン kspin・kspig・kitp・kfe・kstat・kboki・ktoeic（1教科）と career（全教科）、中高一貫のコードで継続割引 | 必要（SUBJECTS・CAREER_SUBJ・PRICES・covers・継続割引、GAMES に24単元） | 24単元のパックを入れる | 必要（教科の選択肢に就活・資格コース） |
| 新コース「低学年コース」（games/teigaku/・teigaku/index.html）：算数8・国語7・思考力6・ちしき3（各100問・無料版5問・1回5問・ふりがな・読み上げ・スタンプ）。料金プラン tsansu・tkokugo・tshikou・tchishiki（1教科）と teigaku（全教科）、低学年のコードで中学受験コースに継続割引 | 必要（SUBJECTS・TEIGAKU_SUBJ・PRICES・covers・PREV_COURSE、GAMES に24単元） | 24単元のパックを入れる | 必要（教科の選択肢に低学年コース） |

**販売を始めるとき**：`buy.html` の `OPEN` と `server/worker.js` の `SALES_OPEN` を `true` にして worker.js を貼り直し、Stripe を本番モード（sk_live）に切りかえる。

## リリースずみ

| リリース日時 | サーバー（worker.js） | 問題データ | 管理画面 | メモ |
|---|---|---|---|---|
| 2026-10-29 05:56（日本時間） | fa04e4b の版（343行） | 全62本を入れ直し（「すべて入っています」を確認） | fa04e4b の版（つながらないときの理由を表示） | 独自ドメイン manabigamebako.com に切りかえ（SITE_URL も変更）。購入ページは準備中・サーバーでも決済を止めた。理科・社会の新単元、公民・都道府県の有料版、思考力2本、算数2本など 43件をまとめてリリース |
| 2026-10-28 08:30（日本時間） | 349893f の版（274行） | kisoku・ronri・tenkai（確認後の版）。kamakura ほか全部入っていることを確認 | 349893f の版（思考力を選べる） | 思考力を別プランにした。鎌倉時代・思考力3本を追加 |
| 思考力・入り口ゲーム第1弾 20本：ひらがなクロスワード・漢字たし算・熟語の十字・しりとり迷路・ことばさがし・ならべかえことば・さかさことば・なぞなぞ・点つなぎ絵・くるくる歯車もよう・星の形づくり・九九のもよう・タングラム・目標の数をつくれ・数の迷路・数あてゲーム・○×ならべ・点と線の陣取り・ハノイの塔・ライトをすべて消せ（無料版5問・有料版100問） | 必要（GAMES に crossword・kanjitashi・jukujuji・shiritori・kotobasagashi・anagram・sakasakotoba・nazonazo・tentsunagi・haguruma・hoshigata・kukumoyou・tangram・tsukure・kazumeiro・kazuate・marubatsu・jintori・hanoi・lightsout を "shikou" で追加） | 20本のパックを入れる | ― |
| 思考力・入り口ゲーム第2弾 20本：漢字クロスワード・部首パズル・熟語しりとり・ことばのはしご・スケルトン・暗号解読・ペントミノのはこづめ・対称もようを完成させよう・色ぬりパズル・サイコロころがし・カメの線・小町算・たし算クロス・計算ブロック・不等号パズル・橋かけパズル・正直村とうそつき村・犯人さがし・石とび・リバーシ（無料版5問・有料版100問） | 必要（GAMES に kanjicross・bushu・jukushiri・hashigo・skeleton・angou・pentomino・taishomoyo・ironuri・korogashi・kame・komachi・tashicross・keisanblock・futougou・hashikake・shojiki・hannin・ishitobi・reversi を "shikou" で追加） | 20本のパックを入れる | ― |
| 思考力・入り口ゲーム第3弾 20本：句読点パズル・同じ読み方の漢字・ダジャレ見つけ・音とようすのことば・体のことばの慣用句・万華鏡もよう・形は何種類？・かげ絵あて・同じ形に分けよう・鏡の時計・三角陣・星陣・島づくりパズル・カレンダーのひみつ・お金パズル・時計算・リーグ戦の表・ぼうしの色パズル・席決めパズル・じゃんけん推理・一方通行の町（無料版5問・有料版100問） | 必要（GAMES に kutouten・douon・dajare・onomatope・kanyoue・kaleido・katachikazu・kagee・wakeru・kagamidokei・sankakujin・shima・calendar・okane・tokeizan・league・boushi・sekigime・janken・ippou を "shikou" で追加） | 20本のパックを入れる | ― |
| 低学年・思考力「おはなしの主人公」全20話（無料版2話） | 必要（GAMES に "t-ohanashi": "tshikou" を追加） | t-ohanashi のパックを入れる | ― |
| 社会「歴史の人物になりきろう」全20章（無料版は戦国の1章） | 必要（GAMES に nariki: "shakai" を追加） | nariki のパックを入れる | ― |
| 思考力・入り口ゲーム第4弾 20本：カード当て推理・時間割パズル・トーナメントの数・九九ビンゴ・さかさピラミッド・魔法のカード・くるっと回すと？・線でかこむパズル・数字カードの問題・しりとりならべ・画数パズル・なかまはずれさがし・石取りゲーム（囲碁入門）・フローチャートをたどろう・しきつめもよう・ひものからまり・ドミノしきつめ・あいうえお作文・反対ことばペア・ことわざ合体（無料版5問・有料版100問） | 必要（GAMES に cardate・jikanwari・tournament・kukubingo・sakasapyramid・mahocard・kaiten・senkakomi・kazucard・shiritorinarabe・kakusu・nakamahazure・igo・flowchart・tiling・himo・domino・aiueo・hantaipair・kotowazagattai を "shikou" で追加） | 20本のパックを入れる | ― |
| 思考力「買い物クエスト」：買い物クエスト（無料版5問・有料版100問） | 必要（GAMES に kaimono を "shikou" で追加） | 1本のパックを入れる | ― |
| 社会（公民）「しくみになりきろう」全10章（無料版は衆議院議員の1章） | 必要（GAMES に shikumi: "shakai" を追加・自動反映） | shikumi のパックを入れる | ― |
| 社会（地理）「日本一周 地理すごろく」（無料版は九州・沖縄コース、有料版318問）／都道府県クイズのパックの説明文2か所を修正 | 必要（GAMES に "chiri-sugoroku": "shakai" を追加・自動反映） | chiri-sugoroku と todofuken のパックを入れる | ― |
| 理科「生き物になりきろう」全12章（無料版はモンシロチョウの1章） | 必要（GAMES に ikinari: "rika" を追加・自動反映） | ikinari のパックを入れる | ― |
| 中高一貫・社会「世界史の人物になりきろう」全20章（無料版は大航海時代の1章） | 必要（GAMES に "c-sekainari": "cshakai" を追加・自動反映） | c-sekainari のパックを入れる | ― |
| 社会（地理）「世界一周 地理すごろく」（無料版はアジアコース、有料版267問） | 必要（GAMES に "sekai-sugoroku": "shakai" を追加・自動反映） | sekai-sugoroku のパックを入れる | ― |
| 国語「作家・歌人になりきろう（文学史）」全20章（無料版は清少納言の1章） | 必要（GAMES に bungo: "kokugo" を追加・自動反映） | bungo のパックを入れる | ― |
| 理科「物理学者になりきろう」「化学者になりきろう」各6章（無料版はアルキメデス／ラボアジエ） | 必要（GAMES に hakase-b・hakase-k を "rika" で追加・自動反映） | hakase-b と hakase-k のパックを入れる | ― |
| 思考力・入り口ゲーム第5弾 19本：数のことば・カタカナへんしん・かくれた文字さがし・漢字めいろ・形の組み合わせ・おりたたみ・切りぬき・サイコロの目の合計・何曜日？・絵でわかる推理・ドアとかぎ・年れいパズル・ならび順推理・ナイトの旅・しょうぎのこまパズル・すごろく作戦・ならべかえの手順・ドット絵プログラム・わかれ道のプログラム・ブラックボックス（無料版5問・有料版100問） | 必要（GAMES に kazukotoba・katakanahenshin・mojikakure・kanjimeiro・kumiawase・oritatami・saikorogoukei・youbi・enosuiri・doorkagi・nenrei・narabijun・knight・shogikoma・sugoroku・sort・pixel・wakaremichi・kansuu を "shikou" で追加） | 19本のパックを入れる | ― |
