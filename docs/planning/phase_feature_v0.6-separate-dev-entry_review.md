# v0.6.0 開発者用入口の分離 レビュー報告

## 未解決の指摘

- `scripts/checkFaceSearchNotice.cjs:11` が `/src/dice/searchMessages.js` を取得している。入口URLは `/MyPalette/dev.html` に更新されているが、モジュール取得先に Vite のベースパス `/MyPalette/` がない。実際の開発サーバーで旧パスは HTTP 404、新パス `/MyPalette/src/dice/searchMessages.js` は HTTP 200 で、`i18n.js` の import を含むことを確認した。現行スクリプトは404応答から import を抽出できず、言語切替の検証を中断する。取得先を修正し、スクリプトを最後まで実行して確認する。

## 照合・検証結果

- 計画書・実装報告を `master...HEAD` の差分と照合した。両入口と評価設定APIの分離を確認し、移動した評価設定の Git blob ID が移動前と一致することを確認した。
- `npm.cmd test` は115件成功。`npm.cmd run build` は成功し、`dist/` の HTML と JavaScript は本体用各1件、JSON は共有の `data/cards.json` のみだった。開発者用画面・Worker・スタイル・評価設定の出力はなかった。`git diff --check master...HEAD` は成功した。
- 開発者用4画面の起動・復帰と本番プレビューのブラウザー検証は実装報告の記録を照合した。オーナー検証 `DEV-ENTRY-01` は確認済みで、追加対応の記録はない。
