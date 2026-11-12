# フェーズ引継ぎ

- 次に開始するフェーズ: 実装
- 開発ブランチ: `feature/v0.27-device-test-pages`
- 予定バージョン: `0.27.0`

[計画書](phase_feature_v0.27-device-test-pages_plan.md)に従い、実機検証用の GitHub Pages 配信を実装する。実装開始時に `package.json` と `package-lock.json` のバージョンを更新する。

GitHub リポジトリの Pages 利用可否と公開元設定は未確認。実装時に確認し、GitHub Actions を公開元として設定する。CI では公開済みの GameWorksOAK `master` を隣接参照できる位置に配置し、`npm ci`、全テスト、本番ビルドを実行する。本番プレビューで `/MyPalette/` から起動できることを確認する。

マージ承認後の `master` への push で、自動配信と公開 URL を確認する。実機ではタイトルからゲームを開始し、初日のドローとダイスロールを確認する。実機確認が残る間はバックログ項目を維持する。
