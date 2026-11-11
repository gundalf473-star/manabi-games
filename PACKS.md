# パック（有料版の問題データ）の最新版の記録

パックの中身はここに書きません。書くのは、ファイルが同じかどうかを確かめるための **SHA-256 ハッシュ値** だけです（ハッシュ値から中身はわかりません）。パックを作り直して渡すたびに、この表を書きかえます。

## 手元のファイルが最新か確かめる方法

- **Windows**：PowerShell で `Get-FileHash .\packs-sansu-8.zip`（ファイル名は確かめたいものに）。出てきた Hash が下の表の「zip の SHA-256」と同じなら最新です（大文字・小文字のちがいは気にしなくてよい）。
- **Mac**：ターミナルで `shasum -a 256 packs-sansu-8.zip`
- zip を開いて中の .json を確かめるときは、同じやり方で .json のハッシュ値をとり、「json の SHA-256」とくらべます。zip の作り直しで zip の値だけが変わっても、json の値が同じなら中身は同じです。
- 表にないゲームのパックは、この記録を始める前（2026年11月8日より前）に作ったものです。そのパックを作り直したときに、ここに足します。

## zip ごとの最新版

| zip | 作った日時（日本時間） | zip の SHA-256 | 中のゲーム（json の SHA-256） |
|---|---|---|---|
| packs-sengoku-daimyo.zip | 2026-11-11 16:16 | `db79ced8f1185a44bea13e6cbafb8684a316ed8a83b70bed648bfd64644d9cbb` | sengoku-daimyo：`c0f7a61b4ff1bc718c2cc918eb13f6a309a5195f677359020ca405be211ae158` |
| packs-c-kogo.zip | 2026-11-10 15:40 | `0a431f92fae117d2ca66a9af20e857939c3d5f395dbdc57c7caeb61d316077b8` | c-kogo：`7be8ca4b98daacfa81f4609cef781736c3a092685c7e05b10f69782696411282` |
| packs-sansu-8.zip | 2026-11-10 15:39 | `4f399ca2bcd6ec899809ad3c7448eebbf2bc4321c2fe45b18ef4cad9baa9c6fa` | kabusoku：`9a8574f0c9c7ac97586d7eb9448b3461bbd6504987c7421988a997ae905b00b0`<br>kisokusei：`50e2eeea370501f4ddd0475f1e9748f502b0a477acd700c40a471c295ab1340f`<br>shigoto：`f935e0a300779aa53bf9c3ccdce0159e47209c2a5b7108d9406a0fee4e0ba378`<br>shokuen：`67cc04cf308fb85fcc20d20a2b27e90a24cb002fc9ce5aa14712c7092c0b2cc5`<br>soneki：`90bba42691a8ef1d1305a6dde4a0ec3646336a5e80cc1d787e64dc76b6f1ef87`<br>tabibito：`c01059f909a5e55d76066d101a3c500aa5c2c43703e2a24a60a374351c7e273d`<br>tsurukame：`872aeb022bfd9ac646fbc0cc1e5d7c0c06fe7070901a73e3beda8c28427d8f7a`<br>wasa：`55bde6920a3f5a3de9ededcbc697ce072d54390311e18a9c3439a7e13affb9d6` |
| packs-rekinarabe.zip | 2026-11-10 15:39 | `c6d16dc7d8501818188bfbd462ccbaf86db38bcf92aa2a37b15c425d2fd5ace1` | rekinarabe：`435ea2d030f5fa05a67cf9d64ed1e8b48080b43405de7e29ba3f070383ee7f3c` |
| packs-k-ipai.zip | 2026-11-10 15:33 | `dce3ff219e2cf6fed8722cc4f42fd3348c9c8b26b7a855c876750d3397e77bc7` | k-ipai：`f49f0a1c99acd7e33cd169ceb09e71bf4c056711186b111b8febc69d7b758ede` |
| packs-sengo-daijin.zip | 2026-11-10 15:23 | `036daf0062150f6499ff4ff43aeef04c90b5b1aa68228eb3b14407da95dfb5cb` | sengo-daijin：`bb28309f0b36b1ba3b3e04d21f57764d816525d75dd53227370b8b1a25bdabe7` |
| packs-kokugo-dokkai3.zip | 2026-11-10 15:18 | `52ebec1bcb1b685cb6ccd401f92ae2039f37cf1667a33ee00715b1facfe00371` | setsumei：`c8d4de83a09abacba78f75feafdc0b5a43a05e5569a0fbedb57c3f929c3ea290`<br>shidokkai：`b957e1ca737619fe7b251612ca18d6fa9939f8d5e9f7a0f14114f01a79b1410e`<br>zuihitsu：`bb03ce81e7ed05ffe2f3b205d29f3f0121224bb709d97c7d68ea59705cf16566` |
| packs-teigaku-kotowaza.zip | 2026-11-10 14:23 | `693ee85d6b8bfb678d630789ffc8ba607e8cdcbdc5d7926513b567d7295470ca` | t-kotowaza：`49486998ab3d9715034467eca4dd3aab436e6b1e07b6ed125fbe049a3be21edf` |
| packs-rome2.zip | 2026-11-08 22:35 | `5a34193f0768e335b21f403ac1d358f0016ce531786eb8c0c80d9f566ed538a2` | c-rome2：`4bbdeeb3fc33a97bcc7fd446e0f72db40d68c160a885fcc5671f8d98b182b2ba` |
| packs-joho-design.zip | 2026-11-08 21:36 | `5c622061f3bcd362eba753554292810f7ed247131d4f8309dc5991fbbb344634` | c-joho9：`89c7964ace945a6a3aff4e0b4f0a029342b5339fddeaec0e53f36594c9c1ab51` |
| packs-nihonshi-5.zip | 2026-11-08 19:07 | `0b4befc90c139a9d79dc2a45139aed4628ccb0cd66d53e4c99db4ae3711521dd` | c-jshi1：`1323933481fdbf934d8257e1a718c80e49a9d42fbf3091e5b9f7afafba84040f`<br>c-jshi2：`b7c0a233076b272dc7d72b0c0f4a139ea7ba9d2f314c1c466e4c615fdb4c2b0c`<br>c-jshi3：`02e48e3883cb46358dfc023db642f89cdb6fb10a4febcb29c2ce5dd0496ac5d5`<br>c-jshi4：`975e870e2f43fdb13e26cc0e123859c6bdd379de333265655706bf5dc89dea75`<br>c-jshi5：`1cb3171888a0aca6a3181e45082662a5d074ddb66277ffbed587313f340619b1` |
| packs-kokugo-dokkai.zip | 2026-11-08 17:36 | `08be276d92f43e5e5478af9418e2dcfb28a245fc2ba0b0fd8ceee2771c47aeb8` | c-shosetsu：`914483c8fe25cc51c690b45db8dde2a73fa1e7d93e9cc221012790d76f657cec`<br>c-kobun3：`54509a466cf8e032a5314278a293b83e3a9cbd066fcd5171fc047c6c31ad5782` |
| packs-chuko-8.zip | 2026-11-08 16:38 | `3c22384817cd26a6a0babefff620e1a0dbaa50eaeab5b12f4bdbecb41d13427b` | c-kukan：`81c009abb31561f1878891186ba2b8d85575fbbc712715d6ac4a8796672249e6`<br>c-data1：`7e11eaf70d48c8fec9207e3ab0592a621301d7b6f0ff9b18ef662279df8809c1`<br>c-zusei：`38c8dc30a609d814a8d7f4ff422a087de061cda5ad816b4f30d31b58c1ec4159`<br>c-seisu：`463bf8aa3f7bcc70ebfe49797c3d7e61455b6dafd5d3f1fbd51e7428071a2bda`<br>c-su3a：`d4a023abf171e29ce7a7beea9fbc4946bf0c4eeaebeee2bebb70c1a87f79815e`<br>c-su3b：`e606af65684bd0cdf4d5401f984e5ccd2afba60820e4e52d18c609bee2960120`<br>c-koji：`6835e4cf6523fbe517212c8b891d27f6bae1b063d22e6948b4ef753547cf4398`<br>c-genso：`733c0b0073a61d3f049fcece030ffffcf99ee1a336c6d6ffad904be15f6d6a31` |
| packs-teigaku-4.zip | 2026-11-08 15:39 | `df1083a812f8c40f30ee47efc4fd3d0ccd4faab130804daa251757706ac71fd3` | t-bunsu：`c362b5a9486946f53c31cb5c7a75c27a6f674081c96f42f895593c92ea2639ac`<br>t-graph：`260f185a729e7d1ca82180863cde7d23ed8524aa1a024cb6c509377571c0ece8`<br>t-en：`31557b69bc26a3480379531d2bee2cc7da7889189dd34931dc1753acd35e9e08`<br>t-sakubun：`640141e543e84da6c44847a17802689ab817d90798bd60afa5b3fc434b06ec0f` |
| packs-shakai-narabe-bunkashi-jinko.zip | 2026-11-08 15:26 | `34d786a712a3d5a367d1bfdf538ddb509975e40deb41f8140443bf8c2993012f` | bunkashi：`420c848054b9df9585f8a223cebe4f43e40bf4839efeed09db614b67b51cb573`<br>jinko：`c36c504e4f9421749dd095e6c322ff060591837ce8e4b426cae36c19bddd6d57` |
| packs-kokugo-monogatari-kijutsu.zip | 2026-11-08 15:12 | `9d7265d3bb497c1d14526a0e04567eff49361c673e31b81e3ceac13c3dd2ca03` | monogatari：`d3d4dcbb5165c5dcb7859c4d44590ab40703e444b4a516f1eff818a2e1c45f40`<br>kijutsu：`e4a90f5a304f5953ceef6e49c6058550790b8961f8f0fd81e8d3c7cf9a981c90` |
| packs-sansu-setsudan-hayasahi.zip | 2026-11-08 14:58 | `00a7018b712904ee1d1d8a4b5712997df284e36e1fda6b1258fc6ffe98388b61` | setsudan：`c676bb93c81689753befe163c83aca059aa8057995f9d0a239949e1f233144c6`<br>hayasahi：`5cee3aa52497cd0d456a798cd230f1e06dd0444660991a318bda96179a11659a` |

## 使わないパック（古い版）

| zip | 理由 |
|---|---|
| packs-sansu-8.zip の古い版（中に kisoku.json が入っているもの） | 算数「規則性と数列」の名前を kisokusei に変えた。kisoku は思考力「規則性パズル」の名前なので、入れると思考力のパックが上書きされる |
| packs-shakai-narabe-bunkashi-jinko.zip の narabe.json | 社会「歴史の並べかえ」は rekinarabe に名前を変えた（packs-rekinarabe.zip を使う）。narabe は思考力「並べかえ名人」の名前。同じ zip の bunkashi.json・jinko.json はそのまま使える |
