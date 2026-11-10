# v0.20 定期見直し 実装報告

## 対象

- 計画: [定期見直し計画](phase_refactor_v0.20-periodic-review_plan.md)
- ブランチ: `refactor/v0.20-periodic-review`
- 実装バージョン: `0.20.1`。初回に0.20.0へ更新し、終了草案へのオーナー指摘に基づく修正開始時にPatchを上げた。`package.json` と `package-lock.json` のルート2箇所を更新。依存の変更はない。
- 実施日: 2026-11-10（日本時間）。開始宣言へのオーナーの `ok` を受けて着手した。

## 点検範囲と判断

| 区分 | 点検した範囲・方法 | 判断・対応 |
| --- | --- | --- |
| 開発ルール | 共通の文書ガイド、ワークフロー、フェーズ手順、構成、コード・CSS・モバイル規約と `docs/01.development.md`、計画・引継ぎ | 今回は文書・検証・配置の整理に限定。要求仕様と隣接共通リポジトリは参照専用とした。 |
| 文書 | 開発環境、`docs/spec/08`〜`16` の責務・入口・操作・検証経路、要求仕様7文書との対応、バックログ。相対リンクと仕様内の明示的なソース・テスト参照先を検査 | 相対リンク37件に参照切れなし。正式UIと評価用表示の混在、旧効果説明、共通CSSの読込元、ストック固定層の説明を修正。テスト移動先を反映した。 |
| ファイルサイズ | `src/` 119ファイル、`scripts/` 37ファイル、`tests/` 57ファイルを空行込みで計数（一時検証ファイルを除く） | ソース最大は `src/game/view.js` の433行。既存スクリプト最大166行、テスト最大131行。修正後も全コード500行以下。責務を変えるソース分割は不要と判断した。 |
| ソース・依存 | `src/` の静的・文字列の動的importを起点から走査し、`main.js`、`dev.js`、設定保存・Vite・描画接続・説明アイコンの責務を照合。export名の参照数も補助的に検索 | import先の欠落なし。通常のimport走査で未到達になる `probabilityWorker.js` は `probabilityDisplay.js` の `new Worker(new URL(...))` で利用。未使用として削除できるモジュール・exportは特定しなかった。自己参照やテスト利用もあるため、外部importがないだけでは削除しない。 |
| 重複 | 各presentationとGame/sessionの境界、カード説明の共用経路、スクリプト内の検証用HTML・初期化を照合 | ゲームの論理処理はGame/session、説明は共通定義へ集約されている。ブラウザー検証ごとのHTMLは条件を独立させるfixtureであり、一律の共通化はしない。説明アイコンの入力処理はオーナー指摘に従い修正し、その他のゲームソースの整理は不要と判断した。 |
| 起動・保存API | `index.html`、`dev.html`、`vite.config.js`、`scripts/cardSettingsPlugin.js`、`settingsStorage.js`、`devServer.test.js` | 2入口、base、共通ライブラリ参照、バージョン注入、開発時だけの保存APIと仕様を照合。保存のOrigin・revision・一時ファイルからのrenameを維持。全テスト内の実サーバー検証も成功。 |
| CSS・モバイル | `src/` の `!important`・HTML直書きstyleの検索、viewport、100dvh、touch-action、safe areaと所有CSSを照合 | `!important` とHTMLの直接style属性は検出なし。JSの座標・寸法指定は動的な描画値として維持。今回CSSと画面操作を変更しない。A/B・狭い画面・リサイズ・DPRの既存検証を実施した。 |
| 要求とテスト | `tests/spec/` の7ファイルと要求仕様の対応、実装テスト50ファイルの主なimport先と責務、ブラウザー検証の対象 | ゲームフローと第6・7文書の効果処理が受入テストの中心。視覚・情報操作・アイコンはブラウザー検証等で一部を確認しているが、個々の要求とassertの対応は未整理。文書単位の対応表を開発環境へ記載し、要求単位の対応確定をQA-01へ記録した。章別テストファイルがないことだけを検証不足とは判断しない。 |
| テスト配置 | 実装テストの主な対象モジュールを対応ソースの配置と照合 | 単体・基盤テスト11ファイルを移動。複数モジュールにまたがる日次開始・ロール要求等の結合テスト、保存API・素材検証は目的別の名前を維持し、その理由を開発環境へ記載した。 |
| バックログ | 正式エリアの手札→プレイ→パレット→ストック→デッキ→捨て札→情報の順序、効果別EUI、残作業・オーナー検証欄 | デッキ以降、長押し6面確認、効果別UI、追加要素は残作業として維持。EUI-06は確認済みのため既存の15件の構成を維持。オーナー検証は「なし」のまま。Tab検証項目は今回の対応を記載して残し、削除判断はレビューへ委ねる。 |

ソース・文書の全組合せや全実行経路の適合を保証する監査ではない。静的検索に加え、変更に関係する入口・描画・操作の接続を照合した。要求文書は編集せず、要求の未実装部分を今回の新機能へ広げていない。ダイス仕様311行は、API・物理・表示契約が一続きであるため、文書ガイドの目安だけを理由に分割しない。

## 修正内容

### 文書

- `docs/01.development.md`: Tab検証の対象と期待値、実装テストの配置方針、要求と検証経路・未検証範囲の対応表を追加。
- `docs/spec/09.playable_game.md`: 評価用の常時6面・配置説明とプレイヤー向けの配置を区別。カードの効果説明を共通本文仕様へ接続。
- `docs/spec/11.shared_ui_style.md`: ゲーム本体と開発者画面のCSS読込元を明記。効果説明アイコンも元の仕様どおりTab対象外で、キーによる説明の開閉を追加しないことを明記。
- `docs/spec/14.screen_layout.md`: 正式化済み4エリア・3Dダイス、評価用配置、開始／終了操作の配置、ストック取得ボタン、テストの参照先を整理。
- `docs/spec/16.effect_common_ui.md`: `role=button`・`tabIndex=-1` とホバー・タップ操作を記載し、Enter／Space／Escapeで開閉しないことと検証経路を明記。
- `docs/planning/backlog.md`: QA-01を追加。Tab検証項目へ対応内容を記載。完了項目の削除やオーナー検証への移動は行っていない。

### ブラウザー検証

`src/iconPopovers.js` の効果説明アイコンを `tabIndex=-1` へ修正し、keydownハンドラーを削除した。元の仕様を正とするオーナー指摘に従い、カード内・本文内の特殊面アイコンともホバー・クリック・タップの共通処理を維持する。

`scripts/checkPaletteArea.cjs` は開始前・ドロー後とも説明アイコンを含めてTab対象ゼロを検証する。`checkEffectCommonUi.cjs` では親子両方のアイコンが `tabindex=-1` であり、開閉それぞれの状態でEnter／Space／Escapeを送っても状態が変わらないことを確認する。既存のホバー・タップ・入れ子操作も検証する。
翌日開始では、ストック演出終了と開始ボタンの有効化を待ち、押下後は終了ボタンへの切替と有効化を待つ。注目ボタンは拡縮し続けるので、状態待ちの後は既存同様にforceクリックを使用する。ブラウザーチャンネルは既存の `MYPALETTE_BROWSER_CHANNEL` を利用できるようにした。

### テストの移動

以下は `tests/implementation/` 内の移動。検証条件とテスト件数は変更せず、必要な相対importと文書参照だけを更新した。

| 移動元 | 移動先 |
| --- | --- |
| `dice/paletteSnapshot.test.js` | `game/paletteSnapshot.test.js` |
| `ui/achievementMotion.test.js` | `game/achievementMotion.test.js` |
| `ui/handLayout.test.js` | `game/handLayout.test.js` |
| `ui/playLayout.test.js` | `game/playLayout.test.js` |
| `ui/stockLayout.test.js` | `game/stockLayout.test.js` |
| `ui/playEffectState.test.js` | `game/playEffectState.test.js` |
| `ui/cardProjection.test.js` | `game/easel/paintingView.test.js` |
| `ui/screenLayout.test.js` | `ui/screenLayout/ScreenLayout.test.js` |
| `ui/canvasArea.test.js` | `ui/screenLayout/CanvasArea.test.js` |
| `ui/areaTransition.test.js` | `ui/areaTransition/index.test.js` |
| `ui/domTransitionSurface.test.js` | `ui/areaTransition/createDomTransitionSurface.test.js` |

## 検証結果

### 変更前

| コマンド | 結果 |
| --- | --- |
| `npm.cmd test` | 0.19.1で195件成功、失敗・skipなし。 |
| `npm.cmd run build` | 0.19.1で成功。Vite 7.3.7、129 modules。 |

### 対象テスト

次のコマンドで移動対象11ファイルの37件が成功、失敗・skipなし。

```powershell
node --test tests/implementation/game/achievementMotion.test.js tests/implementation/game/handLayout.test.js tests/implementation/game/playLayout.test.js tests/implementation/game/stockLayout.test.js tests/implementation/game/playEffectState.test.js tests/implementation/game/easel/paintingView.test.js tests/implementation/game/paletteSnapshot.test.js tests/implementation/ui/screenLayout/ScreenLayout.test.js tests/implementation/ui/screenLayout/CanvasArea.test.js tests/implementation/ui/areaTransition/index.test.js tests/implementation/ui/areaTransition/createDomTransitionSurface.test.js
```

### ブラウザー検証

外部Playwrightは以下を指定し、必須依存には追加していない。ブラウザーはWindowsのEdge、headless。

```powershell
$env:MYPALETTE_PLAYWRIGHT_MODULE='C:/Users/tioak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'
npm.cmd run dev -- --host 127.0.0.1
```

最終検証の実URLは `http://127.0.0.1:3003/MyPalette/`。3000〜3002番が使用中のため自動選択された。

| コマンド | 結果 |
| --- | --- |
| `node scripts/checkPaletteArea.cjs http://127.0.0.1:3003/MyPalette/` | 最終版で成功。説明アイコンを含むTab対象ゼロ、初日・翌日、1200×800・390×844・844×390、パネル、Canvas維持・再生成、物理結果保持、ブラウザー例外なしを確認。 |
| `node scripts/checkEffectCommonUi.cjs http://127.0.0.1:3003/MyPalette/` | EUI-C01成功。親子説明のTab対象外・Enter／Space／Escape無効、ホバー・タップ、入れ子、外側タップ、通知の寸法・日英・自動消去、1200〜320pxの幅を確認。 |
| `node scripts/checkScreenLayout.cjs http://127.0.0.1:3003/MyPalette/` | 成功。5 viewports、DPR 2/1、A/B・パネル・ページスクロール、開発者用2画面。バージョン表示0.20.1と設定の一致を確認。pageerrorなし。 |

パレットの390px幅のスクリーンショットを目視確認した。新しい見た目や操作仕様の判断は追加していない。実機Safari・Androidや全37スクリプトの実行は今回の検証に含めない。

### 最終の全テスト・ビルド

| コマンド | 結果 |
| --- | --- |
| `npm.cmd test` | 0.20.1で195件成功、失敗・cancel・skip・todoすべて0。移動後も同じ件数を検出。 |
| `npm.cmd run build` | 0.20.1で成功。129 modules、両HTMLとWorkerを出力。 |
| `git diff --check` | 成功。 |

## 途中の失敗と調査

1. サンドボックス内のEdgeは起動直後に終了した。通常環境で再実行するとEdgeは起動したが、サンドボックス側の3001番サーバーへ接続できなかった。同じ通常環境で開発サーバーを起動し、実URLの3002番で検証した。製品の変更で回避していない。
2. 最初の追加チェックは、初日の開始前から説明アイコンがあると期待して失敗した。現在のストックは初日開始前にすべて裏面であり、計画時の「開始前にTab対象アイコンがある」という想定は現行表示では再現しなかった。開始前のゼロ確認を残し、ドロー後に説明アイコンの存在・許可対象とキーボード操作を確認する構成を試行したが、オーナー指摘後は開始前・ドロー後ともTab対象ゼロを検証する構成へ訂正した。実装上のクラス名は達成効果が `reward` であることも照合した。
3. パレット検証は翌日開始直後の `rerolls.isVisible()` でも失敗した。HEADから取得した変更前スクリプトでも同じ失敗を再現。日末のストック演出中は開始ボタンが無効で、forceクリックは開始操作を発火しない。元の待機条件は開始ボタンと終了ボタンが共用する属性だけを見ていた。演出終了・有効化・押下後のボタン名を明示的に待つよう修正した。
4. 翌日のクリックを通常のクリックにした試行は、注目アニメーションでstableにならず30秒で失敗した。明示的な有効状態待ちの後にforceクリックを戻し、全体の成功を確認した。
5. 効果共通UIのfixture実行ではVite HMRのWebSocketに `ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS` のconsoleメッセージが出た。HTTPによるモジュール取得・UIの全assertは成功、pageerrorはなし。今回の静的UI検証はHMRを使わず、開発サーバーの環境依存の警告として記録する。製品の接続設定やブラウザー権限は変更しない。

これらの途中の失敗は上記の修正・実行環境変更で調査した。最終版の対象検証・全テスト・ビルドに失敗は残っていない。

## 範囲外とオーナー検証

- QA-01を「要望・バグ指摘」へ追加した。当初の「全要求・全パラメータを補完する」という記載は完了判断できなかったため、オーナー指摘を受けて訂正した。対象を要求02〜05の固定コミットに限定し、要求単位の対応表を成果物とする。実装済み部分は自動または再現可能な手動検証の成功、未実装部分は既存バックログとの対応を記録し、未分類・検証失敗・対応先不明・未回答を残さないことを完了条件とした。全エリア・EUIの完成待ち、全入力の網羅、未実装機能の開発を条件に含めない。別項目への移管で完了扱いする場合は具体的な完了条件とオーナー判断を必要とする。
- デッキ・捨て札・情報表示、長押し6面確認、過去記録比較、EUIの残作業は既存バックログで追跡する。未実装を今回の機能修正へ広げない。
- KB-01: 終了草案へのオーナー指摘は「元の仕様が正しい。キーボード操作はリクエストしておらず、操作できることを望んでいない」。既存実装を正として例外を追加した判断は誤りだった。0.20.1で例外記述を撤回し、効果説明のTab移動・キー操作を削除、計画・仕様・検証・報告を訂正した。これは元の仕様への適合修正である。自動検証で対応を確認し、新たな選択肢の判断は依頼していない。未回答の検証を保留へ移動していない。
- `docs/requirements/`、共通リポジトリ、保存済みカード・評価データ、ゲームのCSSは変更していない。ソースの変更は効果説明の `iconPopovers.js` に限定する。
- 引継ぎ書の更新と終了コミットは、チャットに提示する引継ぎ草案の承認後に行う。
- QA-01の対象・成果物・完了条件の訂正に対し、オーナーから `ok` を得た。QA-01自体の完了や、実装フェーズの終了承認とは区別する。文書訂正後にも `npm.cmd test`（195件成功）、`npm.cmd run build`（129 modules、成功）、`git diff --check`（成功）を再実行した。
