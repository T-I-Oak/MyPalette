# v0.27 実機検証用の GitHub Pages 公開の実装報告

`package.json` と `package-lock.json` を v0.27.0 に更新した。オーナーの指示を受け、Can We Become Heroes? と同じ `gh-pages` 方式に計画書と開発手順を更新した。

`.github/workflows/deploy.yml` は `master` への push または手動実行で起動する。公開済み GameWorksOAK `master` を `.ci/GameWorksOAK` に取得し、MyPalette の隣にリンクする。Node.js 22 で依存復元、全テスト、本番ビルドが成功した場合に `JamesIves/github-pages-deploy-action@v4` が `dist/` を `gh-pages` に反映する。

## 検証結果

- 公開済み GameWorksOAK `master` とローカルの検証用コミット `48bbb9d5bdd84b5b0c5cdccc7970284824154581` の一致を確認した。
- 作業リポジトリでの `npm ci` は、使用中の `esbuild.exe` を削除できずに中断した。失われた依存ファイルを検証用コピーから復元し、`npm ls --depth=0` で依存解決を確認した。
- 別の Windows 作業コピーに `.ci/GameWorksOAK` と隣接ジャンクションを作成し、Node.js 25.6.1、npm 11.9.0 で `npm ci`、`npm test`（216件成功）、`npm run build` が成功した。GitHub Actions の Linux 上での実行は初回 push 後に確認する。
- `npm run preview` 相当の Vite プレビューに対して `node scripts/checkProductionStartup.cjs http://127.0.0.1:42727/MyPalette/` が Edge 157 で成功した。追加のブラウザー確認では、静的設定の応答が HTTP 200、初日の手札が4枚、ダイス結果が3個、`/api/` へのリクエストが0件だった。

## 初回配信とオーナー検証

Pages の公開元は先行実装で GitHub Actions に設定した。リモートに `gh-pages` がないため、公開元の切り替えはレビューへ引き継ぐ。レビュー担当は承認済みのマージと push の後、`gh-pages` の作成を確認し、Pages を `Deploy from a branch`、`gh-pages`、`/(root)` に設定する。設定を変更できない場合はオーナーに操作を依頼し、変更後に対象コミットの配信結果と公開 URL を確認する。

- **MP27-01 実機での起動と初日の進行（v0.27.0）**。オーナーの指示により、レビューでの初回配信後に確認する。実機のブラウザーで Pages の公開 URL を開き、タイトルのバージョンを確認し、「ゲーム開始」から「今日の仕事を始める」へ進んで初日の手札とダイス結果を確認する。機種、ブラウザー、URL、結果を記録する。レビュー担当が実機を操作できない場合はオーナーに確認を依頼する。
