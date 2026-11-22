# v0.30 定期見直し実装報告

## 対象と結果

- 計画: `phase_refactor_v0.30-periodic-review_plan.md`。
- ブランチ: `refactor/v0.30-periodic-review`。バージョン: `0.30.0`。
- `npm.cmd version 0.30.0 --no-git-tag-version` でpackage.jsonとpackage-lock.jsonを更新した。
- 新機能、ルール、画面の配置・操作・演出は変更していない。要求仕様、保存済みカード設定、評価設定、共通リポジトリは変更していない。

## 1. 開発規約と構成

- 共通の理念、文書、ワークフロー、フェーズ手順、構成、コーディング、CSS、共通表示・操作、モバイル、環境構築、ライブラリ規約と、ゲーム側の `docs/01.development.md` を参照した。
- src・scripts・tests・docsの配置、package.jsonのコマンドと依存、Viteのbase・両入口・保存API・隣接ライブラリ参照、Pagesワークフロー、ignoreとphase成果物の追跡を点検した。
- 共通ライブラリは相対import、CIは公開masterを隣接配置する構成。共通部への修正依頼は今回なし。公開時のremote照合はレビューでのマージ・push時に行う。
- CSSのテーマ・共通質感・状態の定義と入口からの読込み、viewport・dvh・内部スクロール・ダイス入力領域を静的に確認した。共通規約全体への適合を実機確認したものではない。

## 2. 文書

- docs配下22文書の構成・参照先を点検。相対リンク35件、バッククォートで記載されたsrc/scripts/testsのコードパス78件は存在を確認した。外部URLの到達性とリンクの節アンカーの全件検証は対象にしていない。
- `09.playable_game.md`: 見出しをゲーム全体の仕様へ揃え、プレイヤー向け共通カードシーンと、presentation省略時の評価用移動方式を分離した。タイトルの過去版表記と、評価用ダイス面説明の適用範囲を整理した。
- `11.shared_ui_style.md`: 実装済みの壁・コルク・付箋・日誌・イーゼルの色変数14件と共通質感4件を追記した。
- `12.shared_icons.md`: refreshDiceがゲーム効果・保存形式に含まれること、ダイスが共有アイコンを直接参照すること、呼出元の責務を現行実装へ揃えた。
- `14.screen_layout.md`: デッキ・捨て札の標準寸法454×609、プレイ寸法の初期値と動的更新、各固定倍率操作、起動エラー案内、全エリアのカード移動の説明を更新した。
- `15.play_area.md`: イーゼルが右から入り左へ退くこと、ルート全体の描画Canvasと通常再描画での資源保持を現行実装へ揃えた。
- `18.card_scene.md`: 仕事終了操作の位置を実装どおり上端中央へ訂正した。カードより手前・コルクボードより奥の重なり順も明記した。
- `08.card_editor.md` の設定・評価データの契約、`10.dice_component.md` の単体・群・停止・選択・ドラッグ、`13.area_transition.md` の座標・所属・中断、`16.effect_common_ui.md` の通知・説明、`17.discard_area.md` の移動・再構成を、関連ソース・既存検証の責務と照合した。

## 3. テストの責務と配置

- tests/specは要求01・06・07、tests/implementationはデータ・効果・確率・ダイス・各エリア・移動基盤・レイアウト・保存APIを扱う。要求02〜05の個別assert対応表は既存QA-01のまま残す。
- 旧移動計画だけを検証していたstockMotion・stockHandMotion・discardMotionのテストを削除した。現行の所属変更はcardScenePlans、個体・補間はcardSceneState、実際の描画と進行は既存checkCardScene系が検証する。
- deckMotion.test.jsから旧planDeckDrawsへのassertだけを除き、エンジン・セッションの初日配分と途中再構成のイベント検証をdeckEvents.test.jsへ移した。実際のdrawイベントと取得済み手札・再構成順の一致を確認する。開発文書に結合テストとして責務を記載した。
- playLayout.test.jsでは未使用playButtonCenterだけのテストを削除し、実際に使われる配置・寸法・向きの検証を維持した。固定倍率操作の実表示は既存ブラウザー検証の責務。
- 初日配分の重なり順はcheckCardSceneLimits.cjsが現行シーンの姿勢・zを検証する。未使用のstockDealDepthをテストする経路は残さない。

## 4. ソース・スクリプト

- src・scripts・testsのJS/CJS/CSSについてファイル参照とexport名の利用を検索し、本番入口、開発入口、動的import、検証ページを作るscripts、テスト利用を区別した。JS/CJS計214ファイルはnode --checkで構文検証した。
- srcのJavaScriptはすべて500行以内。最大のview.jsも483行以内で、今回は稼働中のモジュールを分割していない。文書も300行以内で、責務による新規分割は不要と判断した。
- stockSnapshot・clampProgress・discardTimingと、テストからしか呼ばれないplanStockMotion・stockDealDepth・planDeckDraws・planDiscardTransfers・planStockHandTransfers・playButtonCenterを削除した。
- discardMotion.jsとstockHandMotion.jsは利用部分がなくなったため削除。stockMotion.jsとdeckMotion.jsは現行cardSceneTimelineが利用する時間定数を維持した。
- createDocument・createEvaluationは受入／保存APIテストの入力生成に使用するため維持。paletteDieTopは準備時の投影上限を検証する既存テストが使用するため維持した。内部で使う描画関数・定数や公開コンポーネントのAPIを、外部参照がないという理由だけで削除していない。
- 削除したシンボル・ファイルへのsrc/tests/scripts/通常文書の残存参照はないことを確認した。

## 5. バックログ

- 全7エリアの正式化、EUI-06完了と残る15種類、ダイス破棄変更とEUI-10の依存、MP28-02の保留理由、QA-01の独立した着手条件と完了条件を確認した。既存の機能開発項目の削除・着手順変更はしていない。
- QA-01の将来成果物は、既存の17.discard_area.mdと章番号が重複しない19.acceptance_verification.mdへ訂正した。対応表は今回作成していない。
- 「タイトル・ゲーム終了画面のフォーカス制御を共通方針に合わせる」を追加した。ソース上でTab対象除外の未指定と明示的focus呼出しを確認したため、確認手順・期待結果・完了条件を記載。UI変更となるため今回修正せず、カード詳細の既存項目とは対象画面を分けた。
- オーナー検証欄は「なし」を維持した。未回答を保留へ移す処理は行っていない。

## 検証

実行環境: Windows PowerShell、Node.js v25.6.1、npm 11.9.0。実施日: 2026-11-22。

| 区分 | コマンド・確認 | 結果 |
| --- | --- | --- |
| 対象テスト | `node --test tests/implementation/game/deckEvents.test.js tests/implementation/game/cardScenePlans.test.js tests/implementation/game/cardSceneState.test.js tests/implementation/game/playLayout.test.js tests/implementation/version.test.js` | 15件成功、失敗0 |
| 全テスト | `npm.cmd test` | 206件成功、失敗0、skip 0 |
| 本番ビルド | `npm.cmd run build` | Vite v7.3.7、144モジュール、index.html/dev.htmlを生成して成功 |
| 構文 | src/scripts/testsのJS・CJS各ファイルに `node --check <file>` | 214ファイル成功 |
| 文書参照 | Node.jsの一時スクリプトで相対リンク・コードパスを列挙しfs.existsSyncで確認 | 35リンク・78コードパス、欠落0 |
| 削除参照 | `rg -n` で削除シンボルと旧ファイル名をsrc/tests/scripts/docsから検索 | 実装報告を除き残存なし |
| 差分 | `git diff --check` | 空白エラーなし |

途中でも対象テスト9件、整理後の対象テスト11件と全テスト207件を実行して成功した。最後のplayButtonCenter整理を反映した最終結果は上表の15件・206件である。失敗したテスト・ビルドはない。

## 未検証範囲とオーナー検証

- UIの実行経路・見た目を変更せず、稼働経路から参照されないコードを削除したため、新たなオーナー検証項目は不要と判断した。確認依頼中・未対応フィードバックはない。
- 今回はブラウザー検証・実機確認を実行していない。外部Playwrightの環境変数指定はなく、ローカルのplaywright/@playwright/testも解決できないことを確認した。依存の追加はしていない。
- 要求02〜05の個別assert対応、全操作順・全パラメータ、Safariのピンチ・長押し・safe area、フォーカス問題の実機再現、メモリー使用量、外部URLは未検証。静的点検・既存単体／結合テストの成功を、これらの適合証明とは扱わない。
- 共通リポジトリの公開状態確認、マージ・push・公開後確認は実施していない。レビュー担当が該当する手順で行う。
