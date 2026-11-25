# ボード操作不能の調査・実装報告

## 状態

- レビュー差し戻しR39-01に対応する実装フェーズ継続中。v0.39.1、`fix/v0.39-board-lock`。
- Windowsで原因を再現し修正した。仮版公開後、オーナーから「確認okです」と回答を受け、MP39-01を項目確認済みとして記録した。
- v0.39.0の実装終了後、レビュー差し戻しの引継ぎ書に従って実装を再開した。引継ぎ書は実装のまま維持する。MP38-05の削除判断はレビューの承認手順で行う。

## 原因と対応

以下の初回修正はv0.39.0の記録。レビュー差し戻しR39-01へのv0.39.1の対応は末尾に記録する。

達成後に捨て札へ移ったカードは、初回の詳細で現在Stepを表示する。過去Stepの効果を読むためにタブを変更して閉じると、`showCardDetail.close()`が元カードのタブへ`.click()`を実行する。このイベントが`cardScene`の捨て札のクリック処理へ伝播して詳細を再起動する。旧詳細は終了処理中なので新詳細の背景スナップショットには`inert=true`が保存される。再表示された詳細をもう一度閉じると、その値が復元されて`.LayoutContent`全体が操作不能になる。

必要条件として確認したのは、捨て札の詳細で元と異なるStepを選択して閉じること。即時リロール、動きを減らす設定、Safari固有の機能は必要ではなかった。Windowsの検証条件では、詳細を開く前の待機は即時リロールの対象ダイスを選択する正常な入力待ちだった。報告されたSafari端末の停止状態まで特定したという意味ではない。

`Card`のタブクリックで伝播を止め、閲覧Stepの更新とカード本体の詳細開始を分離した。詳細の背景遮断・復元、Step引継ぎ、操作終了の順序は既存の処理を使用する。要求仕様・共通リポジトリ・保存済み設定は変更していない。

## 回帰検証

- `checkDiscardArea.cjs`を、元と異なるStepを選択して閉じ、詳細が0件かつ背景が非inertであることを検証するよう更新。
- 修正前に実行すると`closing a changed discard tab must not reopen detail`が`1 !== 0`で失敗。修正後は成功。
- `createBoardLockReview.cjs`で`dev_board_lock_review.html`を生成。乱数とページ内設定を固定し、達成時の即時リロール、後続のリロール権2個獲得、達成後の捨て札確認を再現できる。ファイル保存APIは使用しない。生成ページはGit追跡・本番ビルド対象外で、生成スクリプトから復元する。
- `checkBoardLock.cjs`は通常／動きを減らす、A/B、即時リロール有無の8条件を実行する。実際のポインターで着手・達成・詳細Step変更・終了・再開・ボード開閉・対象ダイス選択・更新・後続効果・次の着手を確認する。詳細中の背景inert、終了後の解除、再閲覧時のStep維持、JavaScript例外なしも検証する。
- 通常設定の注目ボタンは常時拡縮するため、Playwrightの安定待ちを使わず座標への実ポインター入力で押す。ダイス重なりによる検証の変動を避けるためfixtureの乱数を固定する。

## 実行結果

使用Originは既存の`http://127.0.0.1:3000/MyPalette/`。PID 45520のViteを確認し、停止・再起動せず使用した。独立した開発・確認サーバーは追加していない。全テスト内の既存Vite結合テストは一時Originを使用してfinallyで終了する。

Playwrightは既存の外部導入を使用：`MYPALETTE_PLAYWRIGHT_MODULE=C:/Users/tioak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright`。Edge 158.0.4370.33、Chrome 158.0.8127.37。両ブラウザーの通常入口でタイトルの`v0.39.0`表示を確認した。

| コマンド | 結果 |
| --- | --- |
| `node scripts/createBoardLockReview.cjs` | 確認ページ生成成功 |
| `node scripts/checkDiscardArea.cjs http://127.0.0.1:3000/MyPalette/` | 修正前失敗、修正後成功 |
| `node scripts/checkCardDetail.cjs http://127.0.0.1:3000/MyPalette/` | 成功。root/dialog、背景復元、Step、キーボード遮断など |
| `node scripts/checkCardInteraction.cjs http://127.0.0.1:3000/MyPalette/` | 成功。詳細、着手、返却、ストック取得など |
| `node scripts/checkBoardBehavior.cjs http://127.0.0.1:3000/MyPalette/` | 成功。自動開閉、連続取得・交換、手動優先、A/B |
| `node scripts/checkCardSceneReduced.cjs http://127.0.0.1:3000/MyPalette/` | 成功。達成、出荷、翌日、45枚の同一性など |
| `node scripts/checkBoardLock.cjs http://127.0.0.1:3000/MyPalette/` | Edgeの初回・最終fixtureとも8/8成功 |
| `MYPALETTE_BROWSER_CHANNEL=chrome`で同コマンド | 最終fixtureで8/8成功 |
| `npm.cmd test` | 247/247成功。Safari確認後の終了草案提示前にも再実行し、247/247成功 |
| `npm.cmd run build` | 成功。Safari確認後の終了草案提示前にも再実行し、成功 |

既存の`checkEffectGameConnection.cjs`は古い「場にプレイ」を探してタイムアウトした。検証用に現行「着手」へ合わせると、通知中も操作が有効という古い期待値で失敗する。現行実装は`notices.busy`で操作を遮断する。`checkAutomaticRolls.cjs`にも古い更新ボタン名があり、一時的に現行名で調べるとクリック完了時には自動ロール要求が既に消えていて`rollRequest.ids`参照が失敗した。今回のタブ修正と無関係な既存検証の前提の問題であり、広範な検証修復は行わず両ファイルを元へ戻した。対象経路は新しい結合検証で確認する。

Chromeの初期実行では注目ボタンの安定待ちと、ランダムなダイス重なりで検証が停止した。実ポインター入力と固定乱数の最終fixtureで解消し、8条件すべて成功した。これは修正前の詳細再入の失敗とは区別する。
最終確認で常用3000番のPID 45520が維持されていること、`git diff --check`成功、一時PNGの削除を確認した。

## オーナー検証 MP39-01

- 対象：iPad Safariで達成後の詳細を閉じた後のボード操作と即時リロール継続。
- 理由：報告端末を直接操作できず、Windowsの成功だけではSafari実機での解消を確認できない。
- 確認版・URL：v0.39.0、[仮版](https://t-i-oak.github.io/MyPalette/preview/)。タイトル下端の版を確認するよう依頼した。
- 提示手順：Safariで仮版を再読み込み→同じ操作で達成カードの捨て札詳細を開く→過去Stepを見る→閉じる→ボード開閉を確認する。
- 期待結果：詳細が勝手に再表示されず、背景の操作禁止が解除されてボードを閉じられる。即時リロールの選択・更新とゲーム操作を継続できる。
- 再現についての先行回答：「Safariで再現して、発生時と同じ事象に見えます」。これは再現事象の一致の確認として記録した。
- 公開後の判断：2026-11-25、オーナーから「確認okです」。直前の仮版v0.39.0での修正後確認依頼への回答として、MP39-01を「項目確認済み」とする。追加の修正フィードバック・保留項目はない。
- 端末機種・iPadOS/Safariの具体的な版や詳細操作ログは追加取得していない。オーナー回答以上の個別条件での確認を推定しない。

## 仮版公開

- 公開ソース：`e7010cd82af18430af4b3fd3f4f208789d3f6803`。開発ブランチへの中間コミット・pushであり、実装フェーズの終了ではない。
- [Deploy to GitHub Pages #65](https://github.com/T-I-Oak/MyPalette/actions/runs/45614143580)：成功。開発ブランチを指定したworkflow_dispatchで実行し、共通公開手順で`preview/`へ配置した。
- 共通workflowおよび実際のGameWorksOAK checkout：`4521d7e22af4fc5caa3d31729c91bb6c29aceb58`。公開前に共通側がmaster、HEADとremote master一致、src/lib差分なしを確認した。
- [pages build and deployment](https://github.com/T-I-Oak/MyPalette/actions/runs/45614236002)：成功。配信コミットは`2be947be987562a54712cdeeecd5727b9bf0d335`。
- 公開URL：[仮版](https://t-i-oak.github.io/MyPalette/preview/)。ゲーム本体タイトルの`v0.39.0`と開発者入口の`0.39.0`をブラウザーで確認した。初日のDay 1表示・手札の配布も確認した。
- 公開後の`data/cards.json`、`data/project_info.json`、`data/update_history.json`、`dev.html`、ロゴ画像のHTTP 200を確認。
- 公開URLを外部Playwright＋Edge、390×844、動きを減らす設定で起動し、v0.39.0表示→ゲーム開始→初日のロール完了→手札・一日終了ボタンが操作可能になることを確認。JavaScript例外は0件だった。
- 正式版保持：公開前後ともルートindexのblobは`5de3adb892d1bbecfa2b75f63657cc9a8934e3a3`、assetsツリーは`6b6484f6812014df01c523a60f688c0a3172c398`で一致した。
- 最初のボタン操作では実行が開始しておらず、再クリックは重複デプロイの可能性を理由に自動承認レビューで拒否された。一覧の実行件数・最新実行が変わっていないことを確認したうえで、開発ブランチを選び直し実行ボタンを指定して開始した。受付成功と実行IDを確認し、重複実行はしていない。
- 生成したローカル検証用HTMLは本番ビルドに含めていない。Safariでは上記仮版の通常ゲームでの確認を依頼し、MP39-01の修正後確認OKを受けた。

## R39-01への対応：v0.39.1

- 捨て札の`PaintingFaces`に対するinert設定を除去した。出荷済みの専用表示、裏面・演出中の操作遮断は維持した。
- `cardScene.js`と`view.js`の捨て札だけ詳細を優先する例外を除去した。
- `cardActions.js`の`onCardSurfaceClick`を、実カード・評価用カード・詳細カードで共用する。button／CardIconの操作を除外する判定は一箇所に集約し、閲覧Stepの終了時反映による再入を防ぐタブの伝播停止も維持した。
- 捨て札仕様のタブ操作不可の記述を、Step切替・効果説明・それ以外の面から詳細を開く共通操作へ修正した。要求仕様・保存済みカード設定・共通リポジトリは変更していない。

### v0.39.1の検証

`MYPALETTE_PLAYWRIGHT_MODULE`とOriginは初回実装と同じ。常用3000番のPID 45520を確認し、停止・再起動していない。

| コマンド | 結果 |
| --- | --- |
| `node scripts/checkDiscardArea.cjs http://127.0.0.1:3000/MyPalette/` | 修正前は捨て札タブがinertというアサートで失敗。修正後は成功 |
| `MYPALETTE_STOCK_MOTION=1`で同コマンド | 通常設定でも成功 |
| `node scripts/checkCardDetail.cjs http://127.0.0.1:3000/MyPalette/` | 成功 |
| `node scripts/checkCardInteraction.cjs http://127.0.0.1:3000/MyPalette/` | 成功 |
| `node scripts/checkBoardLock.cjs http://127.0.0.1:3000/MyPalette/` | 通常／動きを減らす・A/B・即時リロール有無の8/8成功 |
| `npm.cmd test` | 247/247成功 |
| `npm.cmd run build` | 成功 |

捨て札検証は通常／動きを減らす設定のA/Bで実ポインターによるタブ切替、効果説明の開閉、タブ・アイコンで詳細を開かないこと、カード面から詳細を開くこと、詳細で異なるStepを選択して閉じた後の詳細0件と背景inert解除、ゲーム状態不変を確認する。重なった山の同じ座標で手前のカードがヒットすること、裏面のデッキはinertのままであることも確認した。結合検証の詳細開始位置はカード面の名前へ明示し、内部操作を押す検証と区別する。

### オーナー検証 MP39-02（R39-01対応）

- 対象版：v0.39.1。MP39-01のv0.39.0確認済み判断は維持し、この修正版の確認済みへ流用しない。
- 理由：レビュー中のオーナー指示による捨て札の操作変更をSafari実機でも確認するため。
- 手順：仮版を再読み込みしてv0.39.1を確認→達成などで捨て札を作る→見えているカード上のStepタブを切り替える→効果アイコンを開閉→名前や絵などのカード面から詳細を開く→別Stepを選んで閉じる→ボードを閉じ、後続操作を行う。
- 期待結果：タブはその場で切り替わり、効果アイコンは説明を開く。どちらもカード詳細を起動しない。それ以外の面で詳細が開き、詳細終了後もボード・ゲーム操作を継続できる。
- 判断：未回答。実機確認用の仮版公開後に提示する。未回答を保留扱いせず、実装フェーズを維持する。
