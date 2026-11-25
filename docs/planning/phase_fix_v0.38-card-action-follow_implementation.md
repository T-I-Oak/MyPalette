# 着手ボタンのカード追従 実装報告

## 最終実装とオーナー判断（2026-11-25、v0.38.1）

- 日次・効果ドローと残る手札の再配置でボタンをカードIDごとの現在姿勢に追従させる。固定倍率の寸法・文字と演出中の操作遮断を維持する。
- 着手対象のボタンは、オーナーフィードバックに従い移動開始時に消す。v0.38.0で提示した到着までの保持はv0.38.1で撤去した。
- オーナーの「全部確認済みです」により、MP38-01（日次・効果ドロー）、MP38-02（着手時撤去と残る手札の追従）、MP38-03（A/B・リサイズ・固定倍率・動きを減らす）をすべて確認済みと記録する。動きを減らす設定は公開仮版での実機確認を含む。
- Safariの進行状態が分からない問題とカード詳細後の操作不能は、オーナー指示で別途調査するMP38-04・05としてバックログへ記録した。原因・修正は未確定であり、本件の確認済み判断で解決扱いにはしない。
- 終了草案提示前の再検証: `npm.cmd test` 全247件成功・失敗0、`npm.cmd run build` 成功（Vite 7.3.7、155モジュール）。
- 以下は各版の実装・検証・確認待ちの経過記録であり、最終実装とオーナー判断はこの節を正とする。

## 実装内容

- 計画に従いpackage.json・package-lock.jsonを0.38.0へ更新。
- カードIDごとに現在姿勢の中心座標を固定倍率層へ変換し、描画後にボタン位置を更新する。
- 手札境界で切り取られない専用層へ配置。固定倍率による寸法・文字サイズ、既存の最大幅計算を維持する。
- 着手時は操作要素を到着まで保持し、到着後に撤去。残る手札・日次・効果ドローにも同じ追従処理を使う。
- 演出中は専用層をinertにし、既存の操作定義による実行時の再検証を維持する。
- リセット時に保持した操作要素を撤去する。
- 実装仕様・開発案内、新しい自動検証とオーナー確認ページ生成スクリプトを追加。

## 検証結果

確認日: 2026-11-25。ブラウザーはヘッドレスMicrosoft Edge、既存の開発Origin http://127.0.0.1:3000/MyPalette/ を使用。常用サーバーの起動・再起動・設定変更なし。

Playwrightは環境変数MYPALETTE_PLAYWRIGHT_MODULEに `C:/Users/tioak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright` を指定。サンドボックス内のEdge起動は環境制約により失敗したため、許可されたサンドボックス外実行で検証した。

- `node --test tests/implementation/game/handLayout.test.js`: 5件成功。現在姿勢の移動・固定倍率変換・最終ボタン行を確認。
- `node scripts/checkHandActionFollow.cjs`: 成功。日次・複数枚効果ドロー・着手中の1,317サンプルで水平方向のカード中心との一致と操作遮断を確認。着手カード2枚の追従・縦移動・到着後撤去、途中のA/Bと固定倍率変更、動きを減らす設定で最終操作数を確認。pageerrorなし。
- `node scripts/checkCardInteraction.cjs`: 成功。着手・返却・取得・交換・発注、詳細UI、フォーカスと背景復帰を回帰確認。
- `node scripts/checkCardSceneReduced.cjs`: 成功。複数着手、倍率変更、達成後撤去、日末、翌朝再構成、出荷、縦画面、45枚の同一性。
- `node scripts/checkCardSceneLimits.cjs`: 成功。45枚の手札、45/1/0枚の再構成、空ストック、同カードの達成報酬による再ドロー・イーゼル再利用、縦画面を確認。
- `npm.cmd test`: 全247件成功、失敗0。
- `npm.cmd run build`: 成功（Vite 7.3.7、155モジュール）。
- `git diff --check`: 成功。
- `node scripts/createHandActionReview.cjs`: v0.38.0の確認ページを生成。ブラウザー読込・4枚の操作表示・pageerrorなしを確認し、スクリーンショットで最終配置を確認。

## オーナー検証の提示と判断

v0.38.0の専用ページ: http://127.0.0.1:3000/MyPalette/tmp_hand_action_review.html

- MP38-01: 日次・効果ドロー時の追従と到着時の見た目。再読込して初日を観察し、着手して2枚の効果ドローを確認する。期待結果はカードとボタンが一緒に移動して到着すること。
- MP38-02: 着手対象と残る手札の追従。任意の手札を着手し、対象ボタンは到着まで追従して消え、残る手札のボタンも再配置へ追従することを確認する。
- MP38-03: 演出中にA/B幅切替・固定倍率を変更する。OS／ブラウザーの動きを減らす設定を有効にして再読込する。期待結果は位置ずれ・残留・二重操作がなく、最終配置が正しいこと。

3項目とも実装中に提示済み、オーナー判断待ち。未回答を保留とは扱わず、終了草案はまだ提示しない。

## 残る確認

- MP38-01〜03のオーナー判断と、必要なフィードバック対応。
- 所要の判断後、終了草案を提示する。引継ぎ書は承認まで変更しない。

## 2026-11-25 オーナーフィードバック対応（v0.38.1）

MP38-02について「着手時にボタンは追従せずに消えていい」との判断を受領。着手対象のボタンは移動開始時に消す仕様へ変更した。計画の完了条件2のうち着手対象の追従は、この判断で開始時撤去へ置き換える。残る手札の再配置と日次・効果ドローへの追従は維持する。

- package.json・package-lock.jsonを0.38.1へ更新。
- ボタンの保持処理を削除し、描画更新時に現在の操作だけを生成する。
- 実装仕様・確認ページの案内・自動検証を更新。
- `npm.cmd test`: 全247件成功。
- `npm.cmd run build`: 成功（155モジュール）。
- `node scripts/createHandActionReview.cjs`: 0.38.1で再生成。
- `node scripts/checkHandActionFollow.cjs`: 成功（1,658サンプル、pageerrorなし）。着手開始時の対象ボタン撤去、残る手札・ドロー追従、A/B・固定倍率変更、動きを減らす設定を確認。初回は別の着手時に残る手札だった同IDのサンプルまで「着手対象」と判定したため、検証側へ操作ごとの対象IDを記録して修正した。
- `node scripts/checkCardInteraction.cjs`: 成功。着手・返却・取得・交換・発注・詳細UIを回帰確認。

MP38-02の表示方針は合意済み。v0.38.1での修正結果の見た目は再確認待ち。MP38-01・03は引き続き判断待ち。

## 実機確認用の仮版公開（2026-11-25、v0.38.1）

オーナーから、動きを減らす設定を実機確認するため公開する指示を受領し、実装途中の開発ブランチから公開した。引継ぎ書は変更していない。

- 対象コミット: `ae9134f54344fd9bd27fcfd8e1e17e11e9eef0b6`。同名開発ブランチへのpushとremote SHAの一致を確認。
- 共通部はmaster、HEADとremote masterが `4521d7e22af4fc5caa3d31729c91bb6c29aceb58` で一致。src/libに未コミット・未追跡変更なし。push直前にも確認した。
- Deploy to GitHub Pages #63: https://github.com/T-I-Oak/MyPalette/actions/runs/45579266739 成功。開発ブランチをworkflow_dispatchで選択。
- 共通ワークフロー・共通checkoutはいずれも `4521d7e22af4fc5caa3d31729c91bb6c29aceb58`。ActionsのSet up jobと共通checkoutログで確認。
- 配置先: gh-pagesのpreview/。転送ログで対象フォルダーを確認。
- gh-pagesコミット: `aff437b580a8aeaea5f7ee9a2420bbeac96c3fdb`。
- pages build and deployment #61: https://github.com/T-I-Oak/MyPalette/actions/runs/45579350039 成功。
- 公開URL: https://t-i-oak.github.io/MyPalette/preview/ 。タイトルでv0.38.1を確認。
- `node scripts/checkPublicDeployment.cjs snapshot https://t-i-oak.github.io/MyPalette/ tmp_public_baseline_mp38.json`: 公開前の正式版8ファイルを記録。
- `node scripts/checkPublicDeployment.cjs preserved https://t-i-oak.github.io/MyPalette/ tmp_public_baseline_mp38.json`: 公開後も正式版8ファイルが同一であることを確認。
- `node scripts/checkPublicDeployment.cjs metadata https://t-i-oak.github.io/MyPalette/preview/`: 紹介JSON、画像、ロゴ、プレイ先、空の更新履歴、45枚の標準カードJSONの取得成功。
- 配信同期中に一度公開起動検証を実行したところ旧版0.37.1を検出したため、同期成功後に再実行した。旧版表示を公開成功とは扱っていない。
- `node scripts/checkProductionStartup.cjs https://t-i-oak.github.io/MyPalette/preview/`: 成功。Edge 158、動きを減らす有効、A/Bの4実行でタイトル・開発者画面の0.38.1、初日・翌日・終了・再開始・設定エラー再試行を確認。

動きを減らす設定の実機検証はオーナー判断待ち。自動検証の設定再現を実機検証の代わりとはしない。

## 実機確認の追加報告（2026-11-25）

- オーナーから「動きを減らすも確認できた」との報告を受領。MP38-03のうち動きを減らす設定の実機確認結果として記録する。MP38-01〜03全体の一括承認とは扱わない。
- 同じ確認中にSafariで、達成時の即時リロール獲得後に進行停止の理由が分からず、コルクボードからカードを拡大確認して閉じた後、ボードを閉じる操作も効かなくなったとの報告。
- オーナーの「別途調査が必要なのでバックログに記載」の指示に従い、MP38-04（停止理由・状態が分からない表示上の問題）とMP38-05（カード詳細を閉じた後の操作不能）を「要望・バグ指摘」へ追加した。
- JavaScriptエラー、即時リロールとの因果関係、2つの問題の同一原因は未確定。ログ未取得として記録し、この報告を原因確定や既存MP28-02の再発とは扱わない。今回の追従修正では調査・修正しない。
