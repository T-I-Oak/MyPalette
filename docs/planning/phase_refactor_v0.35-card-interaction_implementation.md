# カード操作・詳細表示・重なり順の実装記録

## 対象

- ブランチ: `refactor/v0.35-card-interaction`
- 確認バージョン: `0.35.0`。package.jsonとpackage-lock.jsonを初回実装時に更新。
- 要求仕様・共通リポジトリは変更していない。バックログの削除は行っていない。

## 実装内容

- `cardActions.js`: カードIDから操作を取得する共通契約。識別子・文言・表示・有効条件・実行文脈を管理し、実行直前に現在状態へ照合する。一度実行した定義と同期再入を拒否する。
- `gameCardActions.js`: プレイ、返却、達成、ストック取得を提供。所属、フェーズ、選択要求、公開カード、選択ダイス、達成ステップ、通知・演出・破棄の条件を提供側へ集約。
- `view.js`、`stockPresentation.js`: 通常表示と詳細表示を同じ定義へ接続。元ボタン検索・代理クリックを除去。表示用スナップショットに残る移動済みカードには旧所属の操作を作らない。
- `cardDetail.js`、`view.css`: 独自オーバーレイへ置換。ゲームルート直下へ表示し、既存選択dialog内から開く場合だけ同じdialogへ表示する。背面のinertを保存・復元し、Escape、カード面、閉じる操作を維持。Tabと背面キー操作、背景へのクリック伝播、ポインター操作の既定フォーカスを抑止。明示的focus/autofocusと自動復帰は使わない。
- 詳細のisOpen/close/refreshを提供し、通知待機・再描画・破棄へ接続。終了は冪等で、ステップを引き継ぎ、リスナーとアイコン資源を解放する。
- `cardScene.js`、`cardSceneLayer.js`: 所属・姿勢・反転・個別フレーム・出荷から移動対象を特定する。fieldからfieldに留まるカードをmain層へ保ち、他カードの移動でコルクボードの上に出さない。
- 関連実装仕様と開発手順を更新。カード詳細以外のdialogとボード自動閉鎖は変更しない。

## 提示した構成案

ゲームルート直下の詳細オーバーレイ、既存選択dialog内の例外配置、inertの保存・復元、カードIDによる共通定義、実行時の再照合、静止場札と移動カードの層の分離をチャットで提示した。

## 検証

実施日: 2026-11-23。ブラウザーはWindowsのEdge、接続先は既存の `http://127.0.0.1:3000/MyPalette/`。常用サーバーを停止・再起動・置換していない。追加の開発サーバーは起動していない。

ブラウザー検証では以下の環境変数を使用した。

```powershell
$env:MYPALETTE_PLAYWRIGHT_MODULE='C:/Users/tioak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'
```

| コマンド | 結果 |
| --- | --- |
| `node --test tests/implementation/game/cardActions.test.js` | 成功、3件。実装前のモジュール未実装による失敗を確認後、実装して成功。 |
| `node --test tests/implementation/game/cardSceneLayer.test.js` | 成功、1件。実装前の失敗を確認後、全テストでも成功。 |
| `node --test tests/implementation/game/gameCardActions.test.js` | 成功、3件。所属・通知・終了・公開状態・選択要求の更新・古いダイス選択を検証。 |
| `npm.cmd test` | 成功、226/226。 |
| `npm.cmd run build` | 成功、151モジュール。 |
| `node scripts/checkCardInteraction.cjs http://127.0.0.1:3000/MyPalette/` | 成功。詳細からのプレイ・返却・取得3経路、連続取得・補充、フォーカス、Escape、inert復元。 |
| `node scripts/checkCardDetail.cjs http://127.0.0.1:3000/MyPalette/` | 成功。通常ルートと既存選択dialog内、390×360、タブ、フォーカス、Escape、終了後の実行、inert復元、二重終了。 |
| `node scripts/checkStockAcquisition.cjs http://127.0.0.1:3000/MyPalette/` | 成功。通常操作、連続取得、補充、交換、発注。 |
| `node scripts/checkStockEdgeCases.cjs http://127.0.0.1:3000/MyPalette/` | 成功。空グレード、同じカードの再取得、2回交換、倍率変更、全空。 |
| `node scripts/checkHandArea.cjs http://127.0.0.1:3000/MyPalette/` | 成功。手札・詳細・ステップ保持・A/B・タブレット・達成・リロール・効果選択・日末。 |
| `node scripts/checkPlayArea.cjs http://127.0.0.1:3000/MyPalette/` | 成功。共通カードシーン検証への入口。 |
| `node scripts/checkDiscardArea.cjs http://127.0.0.1:3000/MyPalette/` | 成功。最上面の詳細・ステップ参照、A/B、枚数、配置維持。 |
| `node scripts/checkCardScene.cjs http://127.0.0.1:3000/MyPalette/` | 成功。45枚の個体維持、着手・達成・出荷・回収・交換・日末・再構成・破棄。最終実行はfieldからfieldに留まるカードがmain層にあることを毎フレーム検証。 |
| `node scripts/checkCardSceneReduced.cjs http://127.0.0.1:3000/MyPalette/` | 成功。動きを減らす設定、倍率、撤去、日末、翌朝、出荷、縦画面。 |
| `node scripts/checkCardDiceSearch.cjs http://127.0.0.1:3000/MyPalette/` | 成功。目標の画材・色・組合せ検索、使用済みダイスと空結果。 |
| `node scripts/checkScreenLayout.cjs http://127.0.0.1:3000/MyPalette/` | 版表示の照合で失敗。期待0.35.0、実表示0.31.0。画面サイズ・パネル確認後、開発者画面の版表示で停止した。 |
| `git diff --check` | 成功。 |

### 調査・修正した問題と検証の制限

- 初回ブラウザー確認で、最新状態では移動済みだが表示用スナップショットには残っているカードに操作を生成して再描画が止まった。表示中の旧所属に対応する定義がない場合は操作を配置しないように修正し、対象検証を再実行して成功。
- 既存の手札・目標検索検証は旧リロール名称「すべての画材を更新する」を探していた。現行UIの「すべてリロール（リロール権1個消費）」へ更新し、確認UIへの対応と達成後の操作復帰待ちを追加。
- 詳細UI単体の検証用HTMLは文字コードを明示し、ブラウザー組込プロパティと衝突しないカウンター名へ修正して成功。
- 3000番サーバーの版表示は、Vite起動時に読み込むdefine値が0.31.0のまま。package設定と本番ビルドは0.35.0。サーバー管理規定によりAIは再起動していない。版照合を緩めたり、Vite設定を編集して再起動を誘発したりしていない。
- オーナー確認ページは生成時のpackage設定から0.35.0を表示する。390×844のスクリーンショットと実測で詳細・カード・操作が画面に収まり、activeElementがBODYであることを確認。
- iPad Safariの実機確認は自動ブラウザー検証で代替しない。

## オーナー確認の記録

確認ページ: `http://127.0.0.1:3000/MyPalette/tmp_card_interaction_review.html`

`node scripts/createCardInteractionReview.cjs` で再生成可能。保存済み設定は変更しない。生成ページはignore対象・本番ビルド対象外。各項目をチャットに提示し、判断を依頼済み。以下の未回答を保留とは解釈しない。

| ID | 確認内容・必要な理由 | 提示した手順・期待結果 | オーナー判断・対応 |
| --- | --- | --- | --- |
| MP35-01 | 効果による詳細からの連続取得と補充 | ストック2枚取得で着手→公開カード面→詳細の取得→補充後の2枚目も詳細から取得。取得先は捨て札。 | 手順の質問を受領し、mode=gainの直接リンクと5段階の操作手順を回答。判断は未回答。 |
| MP35-02 | 手札交換・発注の取得経路 | 手札交換で返却→公開カードの詳細から取得。発注の準備→仕事終了→詳細から取得。 | 返却カードがストックの下ではなく上を通る演出の指摘を受領。挿入段階だけ所属層と最下段の重なり順を使うよう修正。再確認待ち。 |
| MP35-03 | 通常・詳細の手札操作の一致 | 通常ボタンと詳細の両方で着手・返却。 | 通常が「着手」、詳細が「場にプレイ」という不一致の指摘を受領。共通定義で既存の翻訳資源の「着手」「返却」を使用し、手札表示側の文言書き換えを削除。再確認待ち。 |
| MP35-04 | ダイス選択・達成の一致 | 達成・重なりで着手→最初のダイスを選択→通常・詳細で達成。 | 未回答。 |
| MP35-05 | Bのボードと場札の実際の重なり | 縦長Bで開閉、カード表示と他カードの移動中も場札が背面に留まる。 | 未回答。 |
| MP35-06 | PCの独自UIの操作感・説明・配置 | 開閉、Escape、Tab、ステップ、説明、目標、リサイズ。背面遮断と閉じた後の復帰。 | 通常側で変更したStepが詳細に反映されない指摘を受領。元カードの現在の閲覧Stepを詳細生成へ渡すよう修正。再確認待ち。 |
| MP35-07 | Safariのタップとフォーカスの実状態 | iPad Safariで開閉・タップ・画面内での操作。 | 未回答。 |

必要な判断が揃うまでは引継ぎ書の終了草案を提示しない。引継ぎ書は変更していない。

### MP35-03 文言不一致への対応

元のview.jsが「場にプレイ」で生成し、handPresentation.jsが通常表示だけ「着手」へ変更する構造を、共通化時に残したことが原因。共通操作定義でcardMessagesのstartPainting/returnToStockを使用し、表示側の変更を除去した。checkCardInteraction.cjsで通常の文言が「着手」であることと、詳細に同じ文言の操作があることを照合する。修正後のnpm.cmd testは226/226成功、npm.cmd run buildも成功。同じ実装の確認中の指摘であり終了草案の差し戻しではないため、版は0.35.0を維持した。
修正後のcheckCardInteraction.cjsも成功し、通常・詳細の「着手」の一致とプレイ・返却・取得3経路を確認した。

### MP35-06 Step選択の引き継ぎへの対応

拡大→通常への反映だけが実装され、通常のCardScene側の選択を変更しても、詳細はview.jsの別の保持値から生成されていた。Cardが選択のたびにdata-selected-stepを更新し、cardDetail.jsが詳細の生成引数として元カードの現在値を渡し、view.jsがその値を初期選択に使うよう修正した。通常カードから拡大を開く際にタブの代理クリックは行わない。

checkCardDetail.cjsに通常側Step 2→拡大Step 2→拡大側Step 1→通常Step 1の両方向の検証を追加し、修正前のStep 0不一致を確認した。修正後は通常ルート・選択dialog内の両方で成功。checkHandArea.cjsにも詳細でStep 1選択→通常でStep 2選択→詳細を再度開いてStep 2を確認する経路と、制作段階・ゲーム状態が変わらない検証を追加。npm.cmd testは226/226成功、npm.cmd run buildは成功。版は同じ実装確認中の0.35.0を維持。
修正後のcheckHandArea.cjsも成功。ゲーム本体でも通常側Step 2が再拡大へ反映され、制作段階とゲーム状態が変わらないことを確認した。

### MP35-02 手札返却の挿入時の重なりへの対応

返却の最終段階も移動層（4）を使っていたため、パネル層（3）のストックより常に前面になっていた。カード内のz値だけでは層間の順序を変えられなかった。

cardScene.moveへカード単位のuseAreaLayer指定を追加し、hand-return-insertだけ返却カードを所属するパネル層へ配置する。差し込み開始時に最下段のz値を適用して描画し、初回補間前にも前面へ残らないようにした。飛行・下降では従来の移動層を維持する。

checkCardScene.cjsへ挿入中の返却カードの層と他のストックカードより低いz値を毎フレーム検証する項目を追加。修正前にreturn-above-stockとreturn-stock-orderの失敗を再現した。修正後のnpm.cmd testは226/226成功、npm.cmd run buildも成功。演出ありのcheckCardScene.cjsとcheckStockAcquisition.cjsを再実行し成功。checkStockEdgeCases.cjsも動きを減らす設定で成功。版は同じ実装確認中の0.35.0を維持。

取得検証の演出ありモードでは、表示された補充後の無効ボタンを強制クリックして次の選択が進まない問題と、旧移動用要素を待機する問題があった。取得ボタンは:enabledへの一致を待ってクリックし、注目演出による拡縮の安定待ちは強制クリックで回避する。演出の開始・完了は現在のdata-card-scene-motionを使用するよう更新した。修正後のMYPALETTE_STOCK_MOTION=1で取得・返却・発注の検証が成功した。

### MP35-01 通常と詳細の操作表示の一致への対応

通常で取得ボタンがないストックの詳細に無効な取得ボタンが表示される指摘を受領。共通操作定義のvisibleはfalseだったが、共通.Buttonのdisplay指定がHTMLのhiddenによる非表示を上書きしていた。最初に詳細側だけでvisible=falseの定義を除外する処理も追加したが、オーナーから通常と詳細の同期を直すべきとの指摘を受け、この個別処理は撤回した。最終的な修正はsrc/ui/layout.cssの.Button[hidden]にdisplay:noneを指定する共通修正だけであり、詳細側に取得や非表示の個別条件は追加していない。

checkCardDetail.cjsに正式な共通layout.cssを読み込み、同一の操作定義から生成した通常と詳細についてhidden・disabled・CSS上の表示可否を比較する検証を追加。修正前に非表示ボタンが見える失敗を再現し、修正後に成功。配置によるflex/inline-flexの違いは表示可否と区別して検証する。checkCardInteraction.cjsの取得可能時のプレイ・返却・取得3経路も成功。最終修正後のnpm.cmd testは226/226成功、npm.cmd run buildも成功。0.35.0のままオーナーの再確認を待つ。

### MP35-02 返却選択時のボード自動展開

オーナーから、レイアウトBの交換時には取得待ちまで待たず返却対象の選択時点でコルクボードを開く指示を受領。view.jsから通知・演出が終了して返却選択が可能であることを渡し、layoutPresentation.jsで取得と返却の選択開始を同じ自動展開処理へ接続した。同じ選択要求の再描画では繰り返し展開しない。

checkStockAcquisition.cjsに返却ボタンが有効になった時点でaria-expandedがtrueであることを追加し、修正前のfalseによる失敗を再現。修正後の同スクリプトとcheckStockEdgeCases.cjsは成功し、取得・連続交換・空ストック・レイアウト変更も確認した。npm.cmd testは226/226成功、npm.cmd run buildも成功。版は0.35.0、オーナー再確認待ち。

### MP35-06 キーボード操作の全面遮断

オーナーから「フォーカスを消すのはキーボード操作をできないようにするため。Escも例外ではない」と明示指示を受領。従前の計画のEscape維持よりこの指示を優先し、計画と実装仕様を更新した。これより前のEscapeで閉じる検証記録は変更前の結果である。

cardDetail.jsのキー別の処理を廃止し、詳細表示中はdocumentのキャプチャ段階でkeydown・keypress・keyupの既定動作と伝播をすべて止める。終了時には同じAbortControllerでリスナーを解除する。閉じる操作はカード面または閉じるボタンのクリック・タップを使用する。

checkCardDetail.cjsでEscape・Tab・Shift+Tab・Enter・Space・左右矢印によって閉じたり操作を実行したりしない検証を追加し、修正前のEscapeによる失敗を確認。checkCardInteraction.cjsもEscape後に詳細が残ることと、クリックで閉じて通常操作へ復帰することを確認するよう更新。0.35.0のまま再確認を行う。
修正後のcheckCardDetail.cjsとcheckCardInteraction.cjsは成功。npm.cmd testは226/226成功、npm.cmd run buildも成功した。

### 実機確認用の配信
オーナーの公開指示に基づき、実装中の0.35.0を開発ブランチへ保存・pushし、既存deploy.ymlを開発ブランチ指定で手動実行する。実機確認のための配信であり、実装終了・レビュー完了・masterへのマージを意味しない。共通ライブラリはmaster、HEADとリモートmasterが48bbb9d5bdd84b5b0c5cdccc7970284824154581で一致し、src/libに未コミット・未追跡変更がないことを確認した。

### 実機確認版の配信結果

- 配信元コミット: d0754ec52fdc412aa5deeee8607d83acd32c5750（開発ブランチ）。ローカルとリモートの一致を確認。
- Deploy to GitHub Pages: https://github.com/T-I-Oak/MyPalette/actions/runs/45118002392 — テスト・ビルド・デプロイ成功。
- pages build and deployment: https://github.com/T-I-Oak/MyPalette/actions/runs/45118055510 — 成功。配信用gh-pagesコミットは2f1ba4c7540811f6ddb6bceed2832c0c1fd150d4。
- 公開URL: https://t-i-oak.github.io/MyPalette/ 。確認バージョン0.35.0。
- 公開URLでWindows Edgeの1200×800と390×844を確認。タイトルの0.35.0、保存済み設定によるゲーム開始、実カード45枚、通常と詳細の「着手」、独自詳細UI、Step選択の保持、Escape・Tab・Enter・Spaceで操作されないこと、クリックでの閉鎖を検証。ページ例外・HTTPエラーなし。
- この公開はオーナーの実機確認のための配信。iPad Safari自体の確認結果は未回答であり、自動ブラウザー検証で代替していない。実装・レビューの終了承認、masterへのマージは行っていない。

### MP35-07 Safari実機でのボタン字体の不一致

オーナーのSafari実機確認で、通常と拡大のボタンのフォントが異なる指摘を受領。共通.Buttonのfont:inheritにより、通常の固定倍率層はsystem-uiを継承するが、ゲームルート直下の詳細はブラウザー標準フォントを継承していた。checkCardInteraction.cjsへ通常・詳細のfontFamily/fontSize/fontWeight/fontStyleの一致を追加し、修正前にTimes New Roman対system-uiの不一致を再現した。

共通.Button自身に24px/1.2 system-ui, sans-serifを指定し、配置先からの基本フォントの継承を廃止。詳細側への個別指定は加えない。共通スタイル仕様を更新し、検証後に既存の開発ブランチ配信を更新する。
フォント修正後のcheckCardInteraction.cjsとcheckCardDetail.cjsは成功。npm.cmd testは226/226成功、npm.cmd run buildも成功。再配信前の共通masterは48bbb9d5bdd84b5b0c5cdccc7970284824154581でリモートと一致し、src/lib差分なし。
フォント修正版の配信元はd2a831ab8867e686c353082bf3b00106f2b5fa35。Deploy to GitHub Pages（https://github.com/T-I-Oak/MyPalette/actions/runs/45121058077）とpages build and deployment（https://github.com/T-I-Oak/MyPalette/actions/runs/45121109235）は成功。公開URL https://t-i-oak.github.io/MyPalette/?review=d2a831a でPC幅1200×800・縦長幅390×844の起動、通常と詳細のfontFamily/fontSize/fontWeight/fontStyle一致、Step保持、キー遮断を確認し、HTTPエラーとページ例外はなし。Safari実機での再確認はオーナー判断待ち。

### フォント修正版の版番号の訂正

オーナーから、公開後の修正を0.35.0のまま配信しては新旧を確認できないとの指摘を受領。公開後の修正を継続実装中の変更として同じ版に保った判断は不適切だった。package.jsonとpackage-lock.jsonを0.35.1へ更新し、フォント修正版を識別可能な版として再配信する。以後の確認依頼では公開画面で検証した版番号を明示する。以前の0.35.0の配信・検証記録は当時の履歴として保持する。
0.35.1でnpm.cmd testは226/226成功、npm.cmd run buildは成功。確認専用ページも0.35.1で再生成。共通masterは48bbb9d5bdd84b5b0c5cdccc7970284824154581でリモートと一致し、src/lib差分なし。
