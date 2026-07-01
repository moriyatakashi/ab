# roreki 仕様書 — ページ一覧編
## 更新日: 2026-07-02（第7版）

---

## ab リポジトリのページ

### トップ（index.html）
URL: https://moriyatakashi.github.io/ab/

JS配列（CATEGORIES）でカテゴリ別カード生成。現在の構成：

| カテゴリ | ページ |
|---|---|
| 記録する | m2・m9 |
| 見る・振り返る | m1・m7・m5 |
| ツール | m10・m11 |
| その他 | 遊ぶ（b/）・管理（a/） |

今日が振り返り日のとき最上部に茶色バナー → m9へリンク。

---

### b/（遊ぶサブページ）
URL: https://moriyatakashi.github.io/ab/b/
b1・b2・b3へのリンク一覧。

### a/（管理サブページ）
URL: https://moriyatakashi.github.io/ab/a/
a1・a2へのリンク一覧。

---

### m2 — 今日の記録 ★メイン入力
URL: https://moriyatakashi.github.io/ab/m2/
使用: ab_items2・ab_visits・ab_checks・ab_memos

上から順：
1. 振り返りバナー（今日が振り返り日のとき）→ m9へ
2. チェック項目（日を跨いだ・ご飯食べた）
3. スコア入力（スライダー、開いたとき今日の値を読み込む）
4. 訪問記録（場所・日付・時間・メモ・現在地ボタン）
   - GPS取得したlat/lngを保持して保存（nullハードコードのバグ修正済み）
5. 出来事メモ（日付＋テキスト、複数件可）
6. 直近履歴（3日分）→ もっと見る → m1

日付確認バナー: 22:15〜23:59「今日の記録でいいですか？」/ 0:00〜7:00「昨日の記録ですか？」

---

### m9 — 振り返り
URL: https://moriyatakashi.github.io/ab/m9/
使用: ab_reviews・ab_tasks・ab_checks

1. 振り返りスコア記録（スライダー0〜100、setDoc後勝ち）
2. 次回振り返り日設定（ab_checksに保存）
3. 振り返り履歴（全件バーグラフ表示）
4. タスク一覧（追加・編集・強制削除）
5. m2・m1へのリンク

---

### m1 — 記録一覧（全件）
URL: https://moriyatakashi.github.io/ab/m1/
使用: ab_items2・ab_visits・ab_checks・ab_memos

スコア・訪問・メモを日付でマージ、新しい順。チェックタグ・出来事メモ表示。
入力日≠対象日のメモは「（YYYY-MM-DD入力）」と表示。

---

### m7 — 日次スコア
URL: https://moriyatakashi.github.io/ab/m7/
使用: ab_items2

日次スコアの折れ線グラフ。期間切り替え（直近7日・30日・全件等）対応。

---

### a1 — Firestoreビューア＋SQLコンソール（旧m3）
URL: https://moriyatakashi.github.io/ab/a1/
使用: 全コレクション（0件非表示）

- コレクション選択チェックボックスで選択的コピー（Claude連携用）
- 全選択/全解除ボタン
- SQLコンソール: INSERT・UPDATE・DELETE・TRUNCATE

---

### m5 — 訪問地図
URL: https://moriyatakashi.github.io/ab/m5/
使用: ab_visits

- Canvas APIで自作地図描画（Leaflet不使用）
- geo/フォルダのGeoJSONで境界線を描画
- 訪問ポイントをピンでプロット（lat/lngあるもの）
- リストは全件表示（lat/lngなしは「地図なし」と表示）
- ピンタップでポップアップ、リスト行タップで地図ズーム
- 現在のGeoJSON: 東大阪市・大阪市

---

### m10 — カレンダー
URL: https://moriyatakashi.github.io/ab/m10/

今月・来月のカレンダー表示。

---

### b1 — トリビア（旧m4）
URL: https://moriyatakashi.github.io/ab/b1/
鉄道・地理・乗り物のトリビア。

### b2 — インベーダー（旧m6）
URL: https://moriyatakashi.github.io/ab/b2/
使用: ab_invader_history・ab_invader_hi

### b3 — ランナー（旧m8）
URL: https://moriyatakashi.github.io/ab/b3/
使用: ab_runner_history・ab_runner_hi

### a2 — テスト（旧lib/test.html）
URL: https://moriyatakashi.github.io/ab/a2/
正常系・異常系・手動テスト。テストデータリセットボタンあり。

---

## ac リポジトリのページ

### ac — 日本地図カラーマップ
URL: https://moriyatakashi.github.io/ac/
使用: ac_map（ac01-fab17）
5地域をタップで色塗り・Firestoreに保存。

### faithjs（NESエミュレーター）
PATH: ac/faithjs/public/index.html
URL: https://moriyatakashi.github.io/ac/faithjs/public/
vanilla JS inlined版（webpack/Babel不要）。Mapper4のみ対応。
ROMはフリー素材＋自作ROM（hello_nes4.nes等）。

---

## 廃止・統合の歴史

| 旧ページ | 処置 | 理由 |
|---------|------|------|
| main/（CRUD） | 削除 | m9タスク管理・m3SQLで代替 |
| mm/・旧m5/・旧m7/ | m2に統合 | m2でカバー（※注） |
| hub/ | 廃止 | 不要 |
| auth.js | 廃止 | 相性問題（要再検証） |
| トップにm3直リンク | admin/経由に変更 | トップをシンプルに |
| m2の次回振り返り日 | m9に移動 | 振り返り系はm9に集約 |
| m3・m4・m6・m8・admin/・play/ | a1・b1・b2・b3・a/・b/にリネーム | 管理=a系、ゲーム=b系で命名を整理 |

※ 旧m7は旧称で現在のm7（日次スコアグラフ）とは別のページ。現在のm7はm2統合後に新規作成したもの。

