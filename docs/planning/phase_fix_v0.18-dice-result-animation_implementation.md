# ダイス結果アイコンの出現・浮遊アニメーション復元 実装報告

## 対象と結果

- 計画書: [復元計画](phase_fix_v0.18-dice-result-animation_plan.md)。ブランチは`fix/v0.18-dice-result-animation`、確認バージョンは`0.18.0`。
- `package.json`と`package-lock.json`のバージョンを更新した。
- `src/dice/layout.css`に出現・浮遊を復元した。外側は0.7秒・45px下・倍率0.45・透明から出現、内側は0.7秒後から3秒周期・上下7px・回転±3度で浮遊する。
- 動きを減らす設定では両アニメーションを無効にし、結果を即時表示する。
- `DiceScene`の表示状態制御・吸収処理、ゲームルール・物理条件、共通リポジトリ、要求仕様は変更していない。
- 実装仕様にDOMの責務・再生タイミング・動きを減らす設定・検証入口を記載した。

## 原因と再現条件

- `6e6b787`には出現・浮遊・動きを減らす設定のCSSが存在する。
- `99ce9dd`（v0.16のパレット正式UI）で旧ダイス確認UIのCSSを削除する際、同じファイル末尾のアニメーション定義も削除されている。
- 結果DOM・内側のMotion要素と`hidden`切替、吸収時の`state-returning`は残っている。通常面・特殊面とも結果が確定してhiddenが解除されると、アニメーション指定がないため突然表示される状態だった。
- 通常更新でDOMを接続したまま維持する処理は既に存在するため、JavaScriptの状態追加は不要だった。

## 検証環境

- ローカルVite、Microsoft Edgeのヘッドレス実ブラウザー、外部Playwrightを使用。依存は追加していない。
- `MYPALETTE_PLAYWRIGHT_MODULE=C:/Users/tioak/Documents/Games/Projects/GameWorksOAK/CanWeBecomeHeroes/node_modules/playwright`。
- ゲームURL: `http://127.0.0.1:3002/MyPalette/`。起動コマンドは`npm.cmd run dev -- --host 127.0.0.1`。
- サンドボックス内ではEdgeが起動失敗し、外側のEdgeから内側の開発サーバーへも接続できなかった。両者をサンドボックス外で起動して検証した。

## 対象テスト・ブラウザー検証

以下のブラウザーコマンドの`<URL>`は上記ゲームURL。

| コマンド | 結果 |
| --- | --- |
| `node --test tests/implementation/dice/readyMotion.test.js tests/implementation/dice/paletteSnapshot.test.js tests/implementation/dice/Die.test.js tests/implementation/dice/DiceGroup.test.js` | 14件成功 |
| `node scripts/checkDiceResultAnimation.cjs <URL>` | 成功。実物理ロールで出現途中の透明度・transform、通常／特殊面、CSSアニメーションの始点・終点・浮遊姿勢と時間経過を確認 |
| 同上 | 通常のゲーム再描画・A/B・リサイズ・固定倍率0.8への変更でアニメーションオブジェクトを維持 |
| 同上 | 個別の確定時刻を分けた検証で、先に確定した結果だけが出現し、群完了で再始動しない。最後の出現が700ms未満の時点で群Promiseが完了 |
| 同上 | 出現250ms／浮遊1800ms時点からの吸収で、取得した外側の移動・倍率・透明度と内側の姿勢が一致。吸収後に隠れ、同じ出目の次の確定で新しく再生 |
| 同上 | 消費で非表示、再利用で再表示、動きを減らす設定で出現・浮遊なし、ブラウザー例外なし |
| `node scripts/checkAutomaticRolls.cjs <URL>` | 成功。開始、単体／全体／効果／獲得の自動ロール、対象外の維持、翌日の開始 |
| `node scripts/checkDiceSelection.cjs <URL>` | 成功。アイコン／本体選択・輪郭・消費、長押し／ドラッグ抑制、リサイズ |
| `node scripts/checkDiceDrag.cjs <URL>` | 成功。本体／浮遊アイコン／空中待機のドラッグ、全体ロールロック、境界、A/B、タッチ、出目保持 |
| `node scripts/checkAchievementMaterials.cjs <URL>` | 成功。時間差飛行・周回・帰還・吸収、消費表示の順序、達成効果と獲得ロールの再開、リサイズ、中断と再開始 |
| `node scripts/checkScreenLayout.cjs <URL>` | 成功。5サイズ、解像度倍率2／1、パネル開閉、開発者2画面、例外なし |

新規ブラウザー検証の最初の試行では、点滅中の開始ボタンがPlaywrightの安定待ちを満たさず停止した。既存の通常モーション検証と同じ`force:true`のクリックへ修正し、再実行は成功した。

`tmp_dice_result_animation.png`と`tmp_dice_result_animation_portrait.png`を目視し、A/Bで通常画材と星型の特殊面が表示されることを確認した。これらはignore対象の一時画像でコミットしない。

## 全テスト・本番ビルド

- `npm.cmd test`: 186件成功、失敗0、スキップ0。
- `npm.cmd run build`: 成功、122モジュール変換、ゲームと開発者入口を出力。
- `git diff --check`: 成功。

## 既存の検証失敗と扱い

- `node scripts/checkGameConnection.cjs <URL>`は、先頭の`checkPaletteArea.cjs:23`で停止した。同スクリプトはTab移動可能な要素ゼロを期待するが、効果説明のCardIconが`tabIndex=0`を持つ。
- `git show HEAD:src/cardIcons.js`でも該当する`node.tabIndex = edit ? -1 : 0`が存在し、今回の変更ファイルにも同処理は含まれない。CSSアニメーション復元による失敗ではない。
- 効果説明とキーボード操作の契約変更は対象外のため修正せず、「ブラウザー検証のTab移動チェックの整合」をバックログの要望・バグ指摘に記録した。
- 一括検証で到達しなかった今回の対象チェックは上表のコマンドで個別実行した。一括検証全体の成功とは扱わない。

## オーナー検証

### DRA-01: 復元した出現・浮遊・再ロール吸収の見え方

- 確認バージョン: `0.18.0`。
- 理由: 動作と数値は自動検証済みだが、復元された動きがオーナーの意図した見え方か確認するため。
- 手順: 上記ゲームURLを再読込みし、「今日の仕事を始める」を押す。確定時の出現と浮遊を観察し、その後「すべての画材を更新する」で吸収と次の確定時の出現を見る。
- 期待結果: 約0.7秒で下から出現してゆっくり浮遊し、再ロールでは表示中の位置から本体へ吸収され、次の確定で再び出現する。
- 判断: オーナーが「項目確認済み」と回答（2026-11-09）。追加フィードバックなし。バックログのオーナー検証への追加は不要。
