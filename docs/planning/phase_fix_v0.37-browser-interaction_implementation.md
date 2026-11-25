# ブラウザー操作抑止の実装報告

## 実装内容

- 最終版はv0.37.1。初回0.37.0からオーナーフィードバック修正時にPatchを上げた。検討中の0.37.2は取り下げ、公開もしていない。
- オーナーの追加合意により、`src/version.js`が`package.json`を直接importして共通Env Utilityへ設定する方式に変更した。ゲーム本体・開発者入口の呼出しとバージョンテストを更新し、サーバー起動時の定数への依存を除去した。バージョン取得のためのVite設定変更は行っていない。
- 通常入口のbodyに`GameBrowserSurface`を指定した。最終版は内部スクロール要素を含め`touch-action: manipulation`を適用し、ダイス固有の`none`は維持する。初回の`pan-x pan-y`からv0.37.1で変更した。
- `src/ui/browserInteraction.js`でbodyに非passiveのcaptureリスナーを登録し、複数タッチのstart/move、Safariのgesturestart/change、dblclickの既定動作を抑止した。単指のtouchとclickはキャンセルせず、タップ間隔の状態は持たない。解除関数を用意し、HMRで解除する。
- タイトルのメニュー全項目・ポータルリンク・任意の設定ボタン、終了画面の戻るボタンをTab対象外とした。終了・タイトル復帰時の明示的なfocusを除去した。
- ゲーム実装仕様と開発・検証手順を更新した。効果選択のフォーカス処理、標準dialog、開発者入口、共通部、要求仕様、バックログの既存項目は変更していない。
- 追加スコープの共通公開ワークフロー呼出し、DEPLOY_BASE_PATHによるbase切替、標準JSON配置を実装し、開発ブランチのpreview公開を確認した。詳細と後続の公開確認は以下に記録する。

## 検証環境

- Windows、Node.js 25.6.1、Microsoft Edge 158.0.4370.33。
- Playwright: `C:/Users/tioak/AppData/Local/Temp/mypalette-v027-playwright/node_modules/playwright`。`MYPALETTE_PLAYWRIGHT_MODULE`で指定し、依存追加なし。
- 常用`http://127.0.0.1:3000/MyPalette/`を使用。停止・再起動・置換は行っていない。検証用の常駐サーバーは追加していない。既存の全テストに含まれるVite結合テストの一時サーバーはテストのfinallyで終了する。
- 本番成果物は`MYPALETTE_VERIFY_DIST=1`で既存Originのリクエストを検証ブラウザー内だけで`dist/`へ置換して確認した。サーバーの公開内容や一般ブラウザーの表示には影響しない。

## コマンドと結果

| コマンド | 結果 |
| --- | --- |
| `node --test tests/implementation/ui/browserInteraction.test.js`（実装前） | モジュール未実装による失敗を確認。 |
| 同コマンド（実装後） | 2件成功。複数タッチ、単指のタップ・移動、連続tap/click、ジェスチャー、解除・再登録。 |
| `npm.cmd test` | 全246件成功、失敗0。 |
| `npm.cmd run build` | バージョン取得変更後も成功、155モジュール。 |
| `node scripts/checkTitleMenu.cjs <開発URL>` | 成功。1・2・3項目、画面サイズ変更、設定ボタンを含む操作とTab／Shift+Tab除外。 |
| `node scripts/checkBrowserInteraction.cjs`（dist指定・通常開発URL） | 成功。合成zoomイベント、単指イベント非キャンセル、2連続タップのclick、ポータルリンクのタップ（外部応答はfixture）、内部タッチスクロール、ダイスCSS、回転・A/B、開発者入口への非適用。Safari実機未確認。 |
| `node scripts/checkProductionStartup.cjs`（dist指定・通常開発URL） | 成功。v0.37.0表示、取得失敗・不正設定からの再試行、A/Bの翌日・終了・復帰・再開始、終了と復帰のフォーカス、開発者ツール。動きを減らす設定。 |
| `node scripts/checkDiceSelection.cjs` | 成功。抑止有効fixtureでアイコン・実体タップ、選択・消費、ドラッグ・長押し、A/B変更。 |
| `node scripts/checkCardInteraction.cjs`（通常・`MYPALETTE_STOCK_MOTION=1`） | 両方成功。抑止有効fixtureで詳細、フォーカス復元、着手、返却、ストック取得・交換・発注、パネル操作。 |
| `node scripts/checkCardDetail.cjs` | 成功。抑止有効fixtureで通常・選択dialog内の詳細、低い画面、ステップ、終了処理、背景復元。 |
| `git diff --check` | 成功。 |

## 失敗時の調査と対応

- 通常開発URLで新規ブラウザー入力検証と起動検証を実行したところ、タイトルの表示が0.31.0で設定の0.37.0と不一致のため失敗した。`/MyPalette/@vite/env`が`__APP_VERSION__: "0.31.0"`を配信していることを確認した。最新main.jsと入力制御のソース・HTMLは配信されている。キャッシュによる旧ソースの表示とは判断していない。
- 当初オーナーへ再起動を依頼したが、必要と断定した案内を撤回した。オーナーが「バージョン取得の修正を含める」と合意したため、計画へ追加記録して直接importへ変更した。常用サーバーの再起動なしに通常URLでv0.37.0表示と入力・起動検証が成功した。
- distでの最初の起動検証は旧ラベル「すべての画材を更新する」で待機してタイムアウトした。診断で現行ラベル「すべてリロール」と操作可能状態を確認し、既存起動スクリプトと新規入力スクリプトの待機条件を修正、再実行で成功した。ゲーム側の動作・ラベルは変更していない。
- 演出ありのカード操作検証は廃止済み`data-stock-hand-motion`の出現待ちで失敗した。共通カード表示の`presentation.cards.busy`と`data-card-scene-motion`による完了待ちへ更新し、再実行で成功した。閉じたボードでは演出が省略されるため、旧演出要素の出現は必須にしない。
- 作業途中で別件の「正式版・仮版の共通公開へ移行する」がバックログに追加された。本実装が作成した差分ではなく、内容を保持した。

## オーナー検証

Safariの実際のページ倍率変化は合成イベントやEdgeでの成功から確認済みとしない。実機確認先は`https://t-i-oak.github.io/MyPalette/preview/`、確認版はタイトル下端のv0.37.1。最新の判断基準と各IDの回答は次表および末尾の確定方針を優先する。

| ID | 確認理由・操作手順・期待結果 | 判断・対応 |
| --- | --- | --- |
| MP37-01 | v0.37.1の一般的なズーム抑止について、仕様上の妥当性・適用範囲・操作維持を確認する。 | v0.37.0でロゴのズーム発生。v0.37.1の特定条件の修正効果は未確定。オーナーの方針変更により、一般的な実装の妥当性を確認後は特定条件を深追いしない。例外の完全解消を確認済みとは扱わず、不確実性を制約として残す。 |
| MP37-02 | 同版で開始、カード詳細、内部スクロール、ダイス選択・ドラッグ、パネル開閉、終了・復帰・再開始、ポータルをタップする。連続タップを含め既存操作を維持する。 | オーナーより「02: ok」。再提示した通常操作の確認は完了。同じ確認を再依頼しない。 |
| MP37-03 | 同版のPCでタイトルのTab／Shift+Tab、終了・タイトル復帰後のフォーカスを確認する。対象ボタン・リンクへ不要なフォーカス移動がない。 | オーナーより「タイトル画面については確認しました」。タイトルの確認は完了。終了・タイトル復帰時の自動フォーカスについては自動検証成功、オーナー確認は未確認。項目全体の完了・明示的な保留とは扱わない。 |

未回答を保留扱いにせず、引継ぎ書は更新していない。

## 追加合意: 正式版・仮版の共通公開

- オーナーが、今回の修正をpreviewへ公開して実機検証するため、バックログの共通公開移行を計画へ追加することに合意した。本ブランチ・v0.37.0を維持する。
- 共通部はmaster、HEADとremote masterは`4521d7e22af4fc5caa3d31729c91bb6c29aceb58`で一致。作業ツリーとsrc/libに変更なし。公開済み`publish.yml`と`deployment.js`を参照した。
- `deploy.yml`を公開済み共通ワークフローへの呼出しへ変更した。master pushは正式版、開発ブランチのworkflow_dispatchはpreviewで、公開先の入力は設けない。
- Vite baseを`DEPLOY_BASE_PATH || '/MyPalette/'`へ変更した。設定ファイル変更に伴うViteの自動反映以外に、常用サーバーの停止・再起動・置換操作は行っていない。
- 標準JSONが未配置だったため、`public/data/project_info.json`と`update_history.json`を追加した。紹介・画像・ロゴ・プレイ先は既存ゲーム素材を使い、公開ルート相対パスとした。履歴はv0のため空配列。
- 共通部の`project_list.json`にはMyPaletteが登録されていない。共通部は参照専用のため編集しない。実ポータルでのMyPalette表示・preview連携は共通部側の登録待ち。共通URL解決関数を用いた相対パス・外部リンクの確認は成功した。

### 追加検証

| コマンド・操作 | 結果 |
| --- | --- |
| `npm.cmd test` | 公開移行後も全246件成功。 |
| `npm.cmd run build` | 正式版baseで成功、155モジュール。 |
| `$env:DEPLOY_BASE_PATH='/MyPalette/preview/'; npm.cmd run build` | preview baseで成功、155モジュール。 |
| `node ../GameWorksOAK/scripts/deployment.js verify`（workflow_dispatch、開発ブランチ、MyPalette、preview baseを環境変数に指定） | 成功。共通部は編集していない。 |
| `checkBrowserInteraction.cjs http://127.0.0.1:3000/MyPalette/preview/`（dist指定） | 成功。v0.37.0とpreview下の素材・ゲーム・開発者画面。 |
| `checkProductionStartup.cjs`（同URL、dist指定） | 成功。設定取得遅延の`route.continue()`が後段のdistルートを無視して開発サーバーへ送信する問題を確認し、`route.fallback()`へ修正して再実行した。A/B、再試行、終了・再開始、両入口のv0.37.0表示を確認。 |
| 公開ルート相対パスの確認 | 紹介の画像・ロゴ・プレイ先がpreview配下、外部URLは維持、画像とロゴの実ファイルと空の履歴を確認。 |
| `node scripts/checkPublicDeployment.cjs snapshot https://t-i-oak.github.io/MyPalette/` | 正式版のindexと参照素材、計8件のSHA-256を`tmp_public_baseline.json`へ記録。公開後の保持検証用。 |

### 公開の進捗と未確認範囲

- EdgeはGitHub未ログインだったが、従来の自動処理があるとのオーナー指摘を受け、ログイン依頼は撤回した。確認用タブは閉じた。
- GitHub CLIはPATHと確認した既存配置場所では見つからず、GH_TOKEN等の設定も確認できなかった。Git credential helperの認証情報をスクリプトで取得してGitHub APIに利用する処理は、自動承認レビューが資格情報取得・再利用の具体的許可不足を理由に拒否した。実行・迂回・資格情報の表示はしていない。該当一時スクリプトは削除した。
- その後、オーナーが「既存のGitHub認証情報を表示・保存せずAPIへ渡し、今回のpreview公開を実行する」ことを明示承認した。承認後のAPI実行は成功し、資格情報は表示・保存していない。一時APIスクリプトとdispatch用ファイルは実行後に削除した。

### preview公開結果

- 公開ソース: `118948ca57a9f135ee95abed289f02feeb21adfc`。開発ブランチへの途中コミット・pushで、フェーズ終了コミットではない。masterは`4c41d6824139464175b054d86c9dd59629338036`のまま。
- [Deploy to GitHub Pages #58](https://github.com/T-I-Oak/MyPalette/actions/runs/45403497906): 成功。workflow_dispatch、ブランチ`fix/v0.37-browser-interaction`。
- 共通ワークフローと共通checkoutはいずれも`4521d7e22af4fc5caa3d31729c91bb6c29aceb58`。ジョブログで確認した。`DEPLOY_BASE_PATH=/MyPalette/preview/`、`target-folder: preview`。
- gh-pagesの公開コミット: `349a086bf80f057b4e7cd8913a7670f617712767`。[Pages build and deployment](https://github.com/T-I-Oak/MyPalette/actions/runs/45403585547)も成功。
- 公開URL: [https://t-i-oak.github.io/MyPalette/preview/](https://t-i-oak.github.io/MyPalette/preview/)。最初の取得はPages反映中の503で失敗したが、Pagesジョブ成功後の再実行では正常取得できた。
- `node scripts/checkPublicDeployment.cjs metadata https://t-i-oak.github.io/MyPalette/preview/`: 成功。紹介JSON、画像、ロゴ、プレイ先、空の履歴、カード45枚を取得できた。
- `node scripts/checkPublicDeployment.cjs preserved https://t-i-oak.github.io/MyPalette/`: 成功。事前記録した正式版のindexと参照素材8件すべてのSHA-256が一致。
- 公開ポータルの`data/project_list.json`でもMyPalette未登録を確認した。実ポータルでのMyPaletteのカード表示・preview連携は共通部の登録待ちで、完了扱いにしない。
- `checkBrowserInteraction.cjs https://t-i-oak.github.io/MyPalette/preview/`（dist置換なし）: 成功。実配信のv0.37.0、タッチ・スクロール・ポータルタップ、A/B、開発者画面のバージョンを確認した。
- 公開URLの入力検証と起動検証は、初回の並列実行でロール待ち60秒のタイムアウトが発生した。起動検証は単独の初回再実行でも再開始時にタイムアウトしたため、並列負荷だけが原因とは断定しない。診断用の単独ブラウザーではDay 1の操作可能状態、4枚の手札、リロールボタン有効化を確認し、JavaScript例外・ゲーム素材の通信失敗は検出されなかった。入力検証の単独再実行は成功した。
- 起動検証へ失敗時のDOM状態とrun番号の出力を追加して再実行すると、実際の公開URLで全4runが成功した。A/Bの翌日・ゲーム終了・復帰・再開始、設定取得失敗・不正設定後の再試行、ゲームと開発者画面のv0.37.0表示、開発者ツールを確認した。タイムアウトの原因は未確定で、ゲームの実装は変更していない。スクリプトのnetwork表示がlocalhost固定だったため、今後は引数URLのoriginを出力するよう修正した（成功runの出力表示は修正前だが、実行引数は公開preview URL）。
- 正式版を更新したときにpreviewが保持される逆方向の確認は、レビューのmasterマージ承認前には実施しない。Safari実機のMP37-01〜03のオーナー判断も引き続き待つ。

## MP37-01フィードバック対応（v0.37.1）

- オーナーより、v0.37.0のiPad Safariでタイトルのロゴをダブルタップすると意図しないズームが起きるとの報告。MP37-01は未解消と記録した。MP37-02・03は案内が不明瞭との回答で、確認済み・保留とは扱わない。
- 修正着手時にpackageとlockのPatchを0.37.1へ更新した。
- ゲーム本体の既定touch-actionを`pan-x pan-y`から`manipulation`へ変更した。[WebKitの説明](https://webkit.org/blog/5610/more-responsive-tapping-on-ios/)でダブルタップズーム抑止として案内される指定をロゴ画像にも適用する。ピンチ抑止の複数タッチ・Safariジェスチャーのキャンセルは維持する。スクロールを許可し、ダイスの`none`と既存のタップ経路を維持する。実機の解消確認はオーナー再検証を必要とする。
- `checkBrowserInteraction.cjs`へタイトルロゴ画像の計算済みtouch-action確認と、ロゴへの実タッチ2回・倍率維持の検証を追加した。Chromiumでの成功をSafari実機の成功と混同しない。
- `npm.cmd test`: 全246件成功。`npm.cmd run build`: 成功。`DEPLOY_BASE_PATH=/MyPalette/preview/`でのビルドも成功（155モジュール）。
- `checkBrowserInteraction.cjs`: 通常開発URLとpreview用distで成功。2連続タップのclick、ロゴ、内部タッチスクロール、ピンチイベント抑止、開発者入口への非適用を確認した。
- `checkDiceSelection.cjs`: 成功。抑止下の出目・本体タップ、選択切替、ドラッグ、長押し、A/B変更を確認した。

### 再提示する操作手順

共通の確認先は`https://t-i-oak.github.io/MyPalette/preview/`。ページを読み直し、タイトル下端がv0.37.1であることを確認する。

- **MP37-01（iPad Safari）**: タイトル上部の「My Palette」のロゴ画像を素早く2回タップする。縦向き・横向きでそれぞれ試す。期待結果は、ロゴやページ全体の表示倍率が変わらないこと。タイトル・ゲーム中・終了画面でピンチしても倍率が変わらないことも確認する。
- **MP37-02（iPad Safari、ズーム抑止が既存操作を壊していないか）**: 「ゲーム開始」後に初日のダイスが止まるのを待つ。ダイスの出目アイコンを1回タップして選択表示を付け、もう1回タップして外す。ダイス本体を指で少し動かす。手札の絵をタップして詳細を開き、「閉じる」で閉じる。縦向きで右端のパネル開閉ボタンを押し、表示・非表示が切り替わることを確認する。着手せず「今日の仕事を終える」を繰り返して終了し、「タイトルへ戻る」→「ゲーム開始」で再度遊べることを確認する。期待結果は、各タップに反応し、ダイスを動かせ、詳細・パネルの開閉と再開始ができること。詳細などで内容が縦に溢れる場合は、その内容を指で上下にスクロールできることも確認する。
- **MP37-03（PC、不要なキーボードフォーカス移動）**: タイトルでTabを数回、Shift+Tabを数回押す。「ゲーム開始」と下端の「GameWorks OAK」リンクに選択の枠が移らないことを確認する。マウスで開始し、着手せず各日の仕事を終えて終了画面を出す。表示直後に「タイトルへ戻る」へ自動で選択の枠が付かず、タイトルへ戻った直後に「ゲーム開始」へ自動で選択の枠が付かないことを確認する。

上記をIDごとに確認済み・フィードバックあり・現時点で確認しない・却下のいずれかで判断してもらう。操作説明の不明点は検証成功とは記録しない。

### v0.37.1のpreview更新

#### オーナー再回答と検証上の制約

- オーナーより、ロゴのどの位置でダブルタップズームが起きるか明確ではなく、毎回再現するわけではないため、修正の正しさを保証できないとの回答があった。再現条件は未確定であり、オーナーに保証を要求しない。
- MP37-01は「修正適用済み、Safari実機での修正効果は未確定」とする。確認済み・却下・明示的な保留のいずれにも読み替えず、未回答を理由にバックログのオーナー検証欄へ移動しない。
- 単発の非再現、Chromiumの自動検証、全DOMへのCSS適用確認を、Safariの症状解消の証明とは扱わない。担当側で検証根拠と限界を示し、全要素の手動確認や繰り返し試行をオーナーへ要求しない。MP37-02・03も現時点では追加の手動確認を依頼しない。
- 追加調査でWebKitにmanipulationとダブルタップズームに関する修正記録を確認したが、オーナー環境の症状と同一原因である証拠はない。修正が搭載されたiOS／iPadOS製品版も未特定。「古いiOSが原因」という説明は撤回した。オーナーは最近OSをアップデートしたとのことで、更新不足を前提にしない。
- 原因との対応を示さずにタップ終了のキャンセル・クリック合成やゲーム全体のnone指定を検討したことについて、オーナーより過剰防衛との指摘があった。これらの未公開の実装・専用テスト・関連仕様変更と作業用の0.37.2設定は取り下げ、ソースは公開済みv0.37.1へ戻した。対策を追加しただけで解消とは判断せず、アプリ側の適用・イベント・表示倍率とブラウザー起因を区別する再現比較を先に行う。引継ぎ書・公開preview・masterは変更していない。

- 公開ソースは`97b48c187c8320c1f9a300cdd05553d63f917525`。[公開ジョブ](https://github.com/T-I-Oak/MyPalette/actions/runs/45407415266)は成功し、共通ワークフローは`4521d7e22af4fc5caa3d31729c91bb6c29aceb58`。
- gh-pagesは`9dcd16c7c80f989bec2fea3d50352eba7740b080`。[Pages反映](https://github.com/T-I-Oak/MyPalette/actions/runs/45407505226)も成功。反映待ちの間に行った初回の公開URL検証では旧v0.37.0表示のため失敗したが、Pages成功後の再実行で成功した。
- 実配信の`checkBrowserInteraction.cjs https://t-i-oak.github.io/MyPalette/preview/`は成功。v0.37.1表示、ロゴのmanipulation指定とダブルタップ、通常の2連続click、内部タッチスクロール、ピンチイベントキャンセル、ダイスのnone維持、A/B、開発者画面の版と入力範囲を確認した。Safari実機のMP37-01はオーナーによる再検証待ち。
- `checkPublicDeployment.cjs preserved`: 正式版のHTML・素材8件が引き続き同じハッシュであることを確認した。

## 検証方針の確定（2026-11-25）

- オーナーは、一般的なズーム抑止を実装し、Safari等の仕様から見ても妥当であるなら、特定条件で抑止できない可能性を深追いしない方針を示した。WebKitの問題の可能性も除外できないことは、追加対策を重ねる理由にしない。
- これを今回の完了判定基準へ反映した。仕様上の根拠、ゲーム本体への適用、既存操作の維持を担当側で確認し、特定条件の完全な非再現保証をオーナーに求めない。例外の原因特定・解消確認と、一般的な実装の妥当性確認を区別する。
- 「一般的に妥当な抑止を実装し、確認した範囲では機能と通常操作を維持できているかで判断し、今後一切起こらないとは保証しない」との整理に、オーナーより「それでよいです」と明示合意を得た。これは完了判定基準への合意であり、実装フェーズ終了草案の承認や、未確認の実機結果の確認済み判定とは区別する。
- v0.37.1を基準とし、追加計測機能や通常操作を変える防御処理の開発は進めない。特定条件の未確定事項は報告上の制約として記載し、未回答の検証依頼として際限なく残したり、オーナーの将来の反復確認を前提にしたりしない。公開previewやソースはこの方針記録によって変更していない。

## 最終版の妥当性確認と引継ぎ前確認（2026-11-25）

- [Pointer Events Level 3のtouch-action値](https://www.w3.org/TR/pointerevents3/#details-of-touch-action-values)では、manipulationはパンと連続的ズームを許可し、ダブルタップ等の時間制約付き複数操作によるズームを禁止する。全画面のnone指定やクリックの合成を追加せず、単指タップとスクロールを維持する一般的な指定として採用した。
- manipulationが許すピンチについては、複数タッチのtouchstart/moveとSafariのgesturestart/changeを非passiveでキャンセルする。[AppleのSafari Web Content Guide](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/HandlingEvents.html)にはgesturestart/changeのpreventDefaultによるピンチ抑止が記載されている。viewportも既存の倍率制限を維持する。これらは一般的な実装の根拠であり、全Safari版・全条件の動作保証ではない。
- 全DOMの適用確認では、タイトル57要素、プレイ中2,579要素、カード詳細2,632要素にmanipulationまたはダイス固有のnoneが適用され、指定漏れはなかった。これは適用範囲の確認であり、全要素のSafari実操作結果ではない。
- `src/main.js`にfocus呼出しはなく、終了画面ボタンとタイトル生成経路（設定・ポータル含む）はtabIndex=-1。MP37-03の終了・復帰は既存のブラウザー検証で確認し、オーナーに仮UIの追加実機確認は要求しない。未確認の実機結果を確認済みとは記録しない。
- `npm.cmd test`: 最終ソースで全246件成功、失敗0。`npm.cmd run build`: 正式版baseで成功。`$env:DEPLOY_BASE_PATH='/MyPalette/preview/'; npm.cmd run build`: preview baseでも成功（いずれも155モジュール）。
- `checkProductionStartup.cjs http://127.0.0.1:3000/MyPalette/preview/`（MYPALETTE_VERIFY_DIST=1）: 全4run成功。最終ビルドのA/B、開始、設定失敗後の再試行、翌日、終了、タイトル復帰、再開始、フォーカス、ゲーム・開発者画面のv0.37.1表示を再確認した。
- 後続の公開確認として残るのは、共通ポータルへのMyPalette登録後の実表示・preview連携と、正式版更新後にpreviewが保持される逆方向の確認。前者は共通部を編集しない制約、後者はレビューのmasterマージ承認前であるため未実施。今回の実装報告では完了扱いにしない。これらを明記した引継ぎ草案を提示する。
