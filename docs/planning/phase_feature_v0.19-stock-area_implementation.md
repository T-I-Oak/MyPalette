# ストックエリアの正式UI実装報告

## 対象と範囲

- ブランチ: feature/v0.19-stock-area。初回実装・オーナー確認対象: 0.19.0。SR-01・SR-02対応の記録更新版: 0.19.1。
- 合意済み計画に沿い、ストックの正式表示・取得操作・手札交換・公開と日末更新の演出を実装した。
- GameWorksOAKは参照のみ。要求仕様・保存済みカード設定・公開設定・引継ぎ書は変更していない。
- 情報・捨て札・デッキの正式化、効果別UI全体の正式化は対象外。初日の7枚配分はオーナーが具体的に指示した演出として実装した。

## 最終の表示・配置

- エリア名は「ストック」。左からA・B・C。各15枚を基準とする。
- 「グレードA ○枚」と公開カードを含む枚数を表示。「残り」「公開カードなし」は表示しない。空の山も列位置を維持する。
- グレード・枚数は拡縮層でカードと同じ倍率。文字は40px/48px、表示幅294。エリア名と取得・返却ボタンは固定倍率層で共通倍率に従う。
- カード294×414、回転±1.5度、並進X±1・Y±0.45、厚み1.5。15枚の積み上げ量21、持ち上げ余白24、グレード領域48と間隔4、上・左右余白4、下端の影用余白22を含め、標準描画寸法は993×546。
- 上オフセット36、下40。山間隔は横の余裕に応じて32〜64とし、それ以上は山全体を中央寄せする。背景は透明。
- 公開カードのタップで既存の詳細画面を開き、ゲーム状態を変えず各ステップを確認できる。

## 状態と操作

- 初期状態は全グレード15枚・すべて裏面、デッキ0枚。初日の仕事開始時にAから7枚をデッキへ移し、その後に各山を公開する。
- 日末は公開カードを裏返して最下段へ回し、次の仕事開始まで先頭も裏面に保つ。翌朝に公開する。
- 発注・カード効果・手札交換の取得待ちはpending.kind=stock。各山の下の固定倍率層の「取得」で既存Game.chooseへ渡す。Bは取得待ちに入るとパネルを開く。
- 返却待ちはpending.kind=handReturn。正式な手札下部の「着手」を「返却」に差し替え、仮ダイアログを使わず1枚選ぶ。
- 進行を止める選択待ちでは、操作可能な返却・取得ボタンにstate-attentionを付ける。通知・演出中は無効な選択を受け付けない。

## 演出と変更箇所

- stockLayout.js / stockPresentation.js / stock.css: 寸法・配置・ラベル・固定ボタン。
- stockMotion.js / stockEffects.js: 朝の公開、初日の配分、取得後の補充、最後の発注から日末更新への連鎖。
- stockHandMotion.js / stockHandEffects.js: 手札交換の返却・取得と、残る手札の連続した再配置。
- 公開は24持ち上げ、縦軸回転、元の高さへ復帰。日末は持ち上げ・裏返し・左へカード幅分移動・下降・右へ差し込み。他カードは1.5上へ移動。
- A/B/Cは120msずつずらす。初日の7枚は90msずつずらす。出発待ちは元の積み順、出発したカードだけを山の手前へ置く。
- 返却は手札から持ち上げ・裏返し・山の左へ移動・最下段へ下降・差し込み。裏返し後はステップ0で描く。取得は持ち上げ・手札へ移動・次のカードを公開する。
- 操作前の描画を保持し、共有移動層と共通座標変換を使用。リサイズ・A/B・固定倍率・パネル開閉に追従する。演出終了・破棄時に移動表示とアイコン監視を解放する。動きを減らす設定では即時反映。
- engine.js / effects.js / view.js / layoutPresentation.js / handPresentation.js / ScreenLayout.js / createLayoutScreen.jsへ接続。実装仕様と開発案内を更新。

## オーナー検証と対応

- SR-01に対応し、[オーナー検証記録](phase_feature_v0.19-stock-area_owner_verification.md)へSV-01〜SV-07を整理した。各項目に理由、再現手順、期待結果、対象バージョン、発言の根拠、案への合意と結果判断、対応結果を記録。
- 当時はIDを付けていなかったため、IDは0.19.1で付与した整理用IDと明記。過去にID付きで提示したようには記録していない。
- 配分時の積み順、ボタン中心、山の下端は既存の修正後のokを照合し、再検証を依頼していない。グレードの表示試案は「いったんこれで行きましょう」による採用判断として記録。
- SV-02（初日・朝・日末）、SV-04（取得・補充・B）、SV-05（正式返却と往復移動）は、過去の案への合意・作業継続指示・フェーズ終了承認を個別の目視承認に読み替えず、今回の記録整理で判断を質問。オーナーの「3項目とも確認済み」を今回得た判断として記録した。確認対象の実装は0.19.0、記録更新版は0.19.1。
- 現時点で確認しないと指定された項目はなく、オーナー検証の保留をバックログへ追加していない。過去の0.19.0の終了草案へのokは、その草案への承認として別記した。

## 0.19.0の検証結果（既存の実装記録）

- npm.cmd test: 最終195件成功。ゲーム開始・日末・効果・配置・前後関係・手札交換追跡・最後の1枚の除去を含む。
- npm.cmd run build: 成功。
- checkStockArea.cjs: A/B、390×844・768×1024等、固定倍率、公開詳細、15枚裏面、空グレードと描画枠への収まりを確認。
- checkStockMotion.cjs: 初日配分、実DOMの積み順、A/B/Cの時間差、日末と翌朝、ロック、演出中のA→B・固定倍率・パネル開閉、移動表示の解放を確認。
- checkStockAcquisition.cjs: 連続取得、正式返却ボタン、注目状態、手札移動、補充、最後の発注から日末への連鎖を確認。演出あり・動きを減らす設定で成功。拡縮前後のボタン中心不変、通常と移動中の裏面寸法一致も確認。
- checkStockEdgeCases.cjs: 空の山への返却、同じ1枚の再取得、2回の連続交換、途中のリサイズ・倍率変更、全ストック空での取得・発注を確認。演出あり・動きを減らす設定の両方で成功。
- checkStockReview.cjs: 実際の生成ページで仕事開始→着手→返却→取得を確認。
- checkHandArea.cjs: 0/4/6枚、重なりタップ、詳細、ステップ、A/B・パネル、ドロー・ダイス関連・効果・終了の回帰確認成功。
- checkScreenLayout.cjs: 5画面寸法、DPR 1/2、パネル、開発者2画面の回帰確認成功。
- git diff --check: 成功。

## 0.19.1のSR-01・SR-02対応

- SR-01: [オーナー検証記録](phase_feature_v0.19-stock-area_owner_verification.md)を追加し、当時未付与だったIDを整理用として付与。案への合意・結果判断・終了草案承認を分離した。過去に個別判断を特定できなかったSV-02・SV-04・SV-05は今回質問し、オーナーの「3項目とも確認済み」を今回の判断として記録した。
- SR-02: 以下に0.19.1で実際に再実行したコマンド・環境・結果を記録する。前節の0.19.0の結果を、この環境で実行した結果へ遡って置き換えない。
- 機能・描画・演出・テストコードは変更していない。変更対象は検証記録とpackage.json/package-lock.jsonの0.19.1への更新。レビュー報告の未解決指摘欄はレビュー担当が判定するため編集していない。

### 再検証環境（2026-11-09、JST）

- 作業ディレクトリ: `C:/Users/tioak/Documents/Games/Projects/GameWorksOAK/MyPalette`。PowerShellで実行。
- Node.js `v25.6.1`、npm `11.9.0`、Vite `7.3.7`。
- 外部Playwright `1.62.1`。解決先: `C:/Users/tioak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright`。
- Microsoft Edge `157.0.4341.42`、実体: `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`。Chromium API、channel=`msedge`、headless=`true`。checkStockReview.cjsはchannelをmsedgeに固定し、他は環境変数で指定した。
- 確認URL: `http://127.0.0.1:3011/MyPalette/`。確認ページ: `http://127.0.0.1:3011/MyPalette/tmp_stock_review.html`。
- サーバーとブラウザーは同じサンドボックス外の環境で、ツールのrequire_escalatedを使用して起動した。0.19.0で失敗したサンドボックス内Edge起動や、外側のブラウザーから内側のサーバーへの接続は再現手順に使わない。
- ストック・手札検証はページ内の検証用状態/設定を使用し、保存済み設定を書き換えない。確認ページも保存設定のコピーのみをページ内で変更する。

サーバーは別のターミナルで次を実行した。固定ポートのため、使用中なら自動的に別ポートへ移らず失敗する。

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 3011 --strictPort
```

ブラウザー検証の各コマンドの前に、同じPowerShellプロセスで次の環境変数を設定した。

```powershell
$env:MYPALETTE_PLAYWRIGHT_MODULE='C:/Users/tioak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'
$env:MYPALETTE_BROWSER_CHANNEL='msedge'
```

### 対象テスト・全テスト・ビルド

実際に実行したコマンドと結果:

```powershell
node --test tests/implementation/ui/stockLayout.test.js tests/implementation/game/stockMotion.test.js tests/implementation/game/stockHandMotion.test.js tests/implementation/game/dayStart.test.js tests/spec/rules_01_game_flow.test.js tests/spec/effects_07_game_other.test.js
npm.cmd test
npm.cmd run build
```

| 検証ID | コマンド | 0.19.1での結果 |
| --- | --- | --- |
| RT-01 | 上記node --test（6ファイル） | 23件成功・失敗0 |
| RT-02 | npm.cmd test | 195件成功・失敗0 |
| RT-03 | npm.cmd run build | 成功、Vite 7.3.7 |

### ブラウザー検証の実行コマンド

以下はそれぞれ上記の環境変数を設定したプロセスで実行した。MYPALETTE_STOCK_MOTIONは値が存在すれば演出ありになるため、演出省略では`0`を代入せず削除する。

```powershell
# RT-04: 表示・詳細・配置。スクリプトがreduceを指定。
node scripts/checkStockArea.cjs http://127.0.0.1:3011/MyPalette/

# RT-05: 初日・日末・翌朝。スクリプトがno-preferenceを指定。
node scripts/checkStockMotion.cjs http://127.0.0.1:3011/MyPalette/

# RT-06: 取得・交換・補充、演出あり。
$env:MYPALETTE_STOCK_MOTION='1'
node scripts/checkStockAcquisition.cjs http://127.0.0.1:3011/MyPalette/

# RT-07: 空ストック・連続交換、演出あり。
$env:MYPALETTE_STOCK_MOTION='1'
node scripts/checkStockEdgeCases.cjs http://127.0.0.1:3011/MyPalette/

# RT-08: 取得・交換・補充、reduce。
Remove-Item Env:MYPALETTE_STOCK_MOTION -ErrorAction SilentlyContinue
node scripts/checkStockAcquisition.cjs http://127.0.0.1:3011/MyPalette/

# RT-09: 空ストック・連続交換、reduce。
Remove-Item Env:MYPALETTE_STOCK_MOTION -ErrorAction SilentlyContinue
node scripts/checkStockEdgeCases.cjs http://127.0.0.1:3011/MyPalette/

# RT-10: 手札回帰。スクリプトがreduceを指定。
node scripts/checkHandArea.cjs http://127.0.0.1:3011/MyPalette/

# RT-11: レイアウト回帰。reducedMotionの明示指定なし。
node scripts/checkScreenLayout.cjs http://127.0.0.1:3011/MyPalette/

# RT-12: 確認ページを0.19.1で再生成し、その実ページを検証。reduce指定。
node scripts/createStockReview.cjs
node scripts/checkStockReview.cjs http://127.0.0.1:3011/MyPalette/tmp_stock_review.html
```

| 検証ID | ブラウザーの表示条件と対象 | 0.19.1での結果 |
| --- | --- | --- |
| RT-04 | 1200×700、390×844、768×1024、1400×700、固定倍率1.25、DPR既定1 | 成功 |
| RT-05 | 1200×700→390×844、固定倍率1.25、パネル開閉、DPR既定1 | 成功 |
| RT-06 | 1200×700→390×844、注目中心・裏面寸法・往復移動・発注連鎖、DPR既定1 | 成功 |
| RT-07 | 1200×700→390×844、返却途中に固定倍率1.25、空の山と同じ1枚の再取得、DPR既定1 | 成功 |
| RT-08 | RT-06と同じ操作、移動演出省略、DPR既定1 | 成功 |
| RT-09 | 1200×700で演出省略、連続交換と全ストック空の進行、DPR既定1 | 成功 |
| RT-10 | 手札0/4/6枚、A/B・タブレット・パネルとゲーム操作の回帰、DPR既定1 | 成功 |
| RT-11 | 5画面寸法、DPR 2/1、パネル・開発者2画面、画面バージョンとpackage.jsonの一致 | 成功 |
| RT-12 | 実際の確認ページ、1200×800、仕事開始→着手→返却→取得、DPR既定1 | 成功 |

`git diff --check`も実行し成功した。今回の再検証で失敗・未実行の項目はない。SR-01・SR-02の対応内容を本報告へ記録し、指摘の解消判定は再レビューで行う。

RT-12で生成したtmp_stock_review.htmlはGit追跡・本番ビルドの対象外。全ブラウザー検証はオーナーの目視判断の代わりに扱わず、SVの判断とは分けて記録する。

## 検出した問題と扱い

- 初回のEdge起動・ローカル接続はサンドボックス環境で失敗。同じ接続環境の確認用サーバーとブラウザーで検証した。Vite HMRのWebSocket制約はゲーム内Errorとは区別した。
- 閉じたBパネルの移動先DOM検索、初期配布と交換の混同、最後の1枚取得時の二重表示を検出し修正。捕捉後consoleへ報告されるアプリErrorもブラウザー検証対象とした。
- 注目ボタンの点滅によるPlaywrightの安定待ち、演出中の無効ボタンへの早すぎる操作、閉パネルのDOM除外を演出終了と誤認する待ち条件、Aで非表示のパネルボタンを押す検証手順を修正。機能の失敗として放置していない。
- 要求仕様は変更せず、朝と日末の公開タイミングは今回のオーナー指定を実装仕様へ記録した。レビュー時に要求仕様との記述差を確認する。
