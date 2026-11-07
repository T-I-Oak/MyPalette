# v0.10 定期見直しの実装報告

`chore/v0.10-periodic-review` で `package.json` と `package-lock.json` を更新した。実装終了草案への指摘を受けて記述を修正する際に、共通手順に従って 0.10.0 から 0.10.1 に更新した。

| 対象 | 点検結果と対応 |
| --- | --- |
| 開発ルール | GameWorksOAK の環境構築手順、共通ワークフロー、フェーズ作業手順、共通構成を照合した。開発環境文書に共通規約へのリンクと定期見直しの条件を追記し、初回環境構築時の検証履歴を現行の検証手順に置き換えた。 |
| 文書 | `docs/spec/` の6章を対象とした。カード設定の重複した章番号を修正し、効果の入力候補と保存形式を区別した。評価用ゲーム仕様では絵画カードの責務と段階別の画像表示をまとめ、現行描画と矛盾する記述を解消した。ダイス仕様の共通描画モジュール参照を更新した。 |
| テスト | `tests/spec/` のゲーム進行と効果を要求仕様の第01・06・07章と照合し、特殊面予約テストの参照章番号を修正した。設定の色変更テストは保存・表示、実装テストは編集候補の絞り込みを確認しており、両者で扱う範囲の差をカード設定仕様に明記した。`tests/implementation/` はデータと計算、ゲーム内部、描画と移動、開発サーバーの実装責務との対応を確認した。テストの配置と期待値は維持した。 |
| ソース | `src/` の追跡ファイルはすべて500行以内で、最大は `src/game/view.js` の351行。呼び出し元を確認し、月桂冠の未使用の再エクスポートと、色文字・数字描画の中継を削除した。ダイス検索アイコンは共通グリフと検索文言を直接使う。 |
| バックログ | チラシ発注の既存項目に着手時の確認事項を追記した。プレイヤー向けUIを先に進め、追加要素を後にする優先順を確認した。保留中のオーナー検証項目は0件。 |

## 残課題

- チラシ発注の名声0条件は既存項目。現行の要求仕様とテストは名声条件を設けていないため、着手時に発注手順と期待値をそろえる。
- 3Dダイスの容量・初回ロール時間と警告の点検は、既存バックログに沿ってプレイヤー向け画面への組み込み時に行う。

## オーナーからの指摘

カード設定画面でダイス面の色変更候補をメタ情報で絞り込む挙動はオーナーの要件。見直しで追加したバックログ項目を取り下げ、カード設定仕様に編集候補の制約と保存形式の範囲を記載した。

## 検証

- `node --test tests/implementation/dice/searchMessages.test.js tests/implementation/dice/faceSearch.test.js tests/spec/rules_01_game_flow.test.js tests/spec/effects_06_change_color.test.js tests/implementation/effectChoices.test.js` は21件成功。
- 0.10.1 の `npm.cmd test` は121件成功。サンドボックス内での再検証では一時ファイルの置換に `EPERM` が発生し、対象テストの切り分けではローカル接続にも `EACCES` が発生した。制限外で全テストを再実行し、成功を確認した。
- 0.10.1 の `npm.cmd run build` はVite 7.3.7で成功。
- Viteの開発時変換で、ダイス検索アイコンから共通グリフへの参照が解決されることを確認した。開発者用画面のブラウザ操作は今回の検証に含めていない。
- 既存文書の相対リンクの参照先と見出しを確認した。`git diff --check` は指摘なし。

利用者が個別に判断する挙動の変更がないため、今回のオーナー検証項目は設けていない。

## v0.10.2 レビュー指摘への対応

`package.json` と `package-lock.json` を 0.10.2 に更新した。`DiceScene.js` が削除済みの `describeCondition` を参照していたため、検索文言の定義元である `searchMessages.js` から `describeSearchCondition` を直接読み込むようにした。ダイスシーンと検索表示の依存を読み込む回帰テストを追加し、修正前は名前付きインポートで失敗し、修正後は成功することを確認した。

- `node --test tests/implementation/dice/searchMessages.test.js tests/implementation/dice/faceSearch.test.js tests/spec/rules_01_game_flow.test.js tests/spec/effects_06_change_color.test.js tests/implementation/effectChoices.test.js` は22件成功。
- `npm.cmd run dev -- --port 5174 --strictPort` で起動し、`node scripts/checkFaceSearchBrowser.cjs http://127.0.0.1:5174/MyPalette/dev.html` を隣接プロジェクトの既存PlaywrightとヘッドレスEdgeで実行した。ダイス確認画面が開き、画材・色・組み合わせの検索、一致面数、0件通知、再検索と期限切れ、面の変更、ダイスの追加・削除、検索解除を確認した。ページエラーは0件で、390×844および844×390の表示にあふれはなかった。
- `npm.cmd test` は122件成功。`npm.cmd run build` はVite 7.3.7で成功。

既存画面の復旧をブラウザで確認したため、オーナー検証項目は設けていない。
