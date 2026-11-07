# v0.11.0 実装報告

特殊面の予約とチラシ制作の後に、残った未使用ダイス数を確定する。その数が現在の信用以上なら発注をスキップし、完成したチラシと制作途中の進捗、次回必要枚数を保持する。信用が残る日は従来どおり発注し、ストックが空でもチラシを消費して次回必要枚数を2枚増やす。信用の更新は発注処理の後に行う。

- `src/game/engine.js` で発注の判定と信用更新に同じ未使用ダイス数を使う。
- `docs/requirements/01.game_rules.md` と `docs/spec/09.playable_game.md` に発注条件と処理順を反映した。
- `package.json` と `package-lock.json` を `0.11.0` に更新した。

## 検証

| コマンド | 結果 |
| --- | --- |
| `node --test tests/spec/rules_01_game_flow.test.js`（修正前） | 新規ケースでカード選択待ちになり失敗することを確認 |
| `node --test tests/spec/rules_01_game_flow.test.js tests/implementation/game/engine.test.js` | 16件成功 |
| `npm.cmd test` | 124件成功 |
| `npm.cmd run build` | 成功 |

公開ストックの有無に応じた発注・終了処理、チラシの保持、信用更新の順序を自動テストで確認した。計画の完了条件を自動テストで判定できるため、追加のオーナー検証項目は設定しなかった。

## レビュー時の照合事項

バックログの該当候補は「名声が0」と記載されている。合意済み計画の「信用が0」との関係をレビュー時に照合する。
