# roreki 仕様書 — ページ一覧編
## 更新日: 2026-06-28（第5版）

---

## ab リポジトリのページ

### トップ（index.html）
URL: https://moriyatakashi.github.io/ab/

JS配列（PAGES）でカード生成。6枚構成：
- 📝 m2 — 今日の記録
- 🔁 m9 — 振り返り
- 📋 m1 — 記録一覧
- 🗺️ m5 — 訪問地図
- 🎮 遊ぶ（play/）
- ⚙️ 管理（admin/）

今日が振り返り日のとき最上部に茶色バナー → m9へリンク。

---

### play/（遊ぶサブページ）
URL: https://moriyatakashi.github.io/ab/play/
m8・m6・m4へのリンク一覧。

### admin/（管理サブページ）
URL: https://moriyatakashi.github.io/ab/admin/
m3・lib/testへのリンク一覧。

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

### m3 — Firestoreビューア＋SQLコンソール
URL: https://moriyatakashi.github.io/ab/m3/
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

### m4 — トリビア
URL: https://moriyatakashi.github.io/ab/m4/
鉄道・地理・乗り物のトリビア。

### m6 — インベーダー
URL: https://moriyatakashi.github.io/ab/m6/
使用: ab_invader_history・ab_invader_hi

### m8 — ランナー
URL: https://moriyatakashi.github.io/ab/m8/
使用: ab_runner_history・ab_runner_hi

### lib/test — テスト
URL: https://moriyatakashi.github.io/ab/lib/test.html
正常系・異常系・手動テスト。テストデータリセットボタンあり。

---

## ac リポジトリのページ

### ac — 日本地図カラーマップ
URL: https://moriyatakashi.github.io/ac/
使用: ac_map（ac01-fab17）
5地域をタップで色塗り・Firestoreに保存。

### faithjs（NESエミュレーター参考実装）
PATH: ac/faithjs/
sairoutine/faithjsをコピー。PC作業前提でwebpack現代版に更新予定。
ROMはフリー素材（bad_apple_2_5.nes・megaari.nes・nestest.nes・nittori.nes）。

---

## 廃止・統合の歴史

| 旧ページ | 処置 | 理由 |
|---------|------|------|
| main/（CRUD） | 削除 | m9タスク管理・m3SQLで代替 |
| mm/・m5/・m7/ | m2に統合 | m2でカバー |
| hub/ | 廃止 | 不要 |
| auth.js | 廃止 | 相性問題（要再検証） |
| トップにm3直リンク | admin/経由に変更 | トップをシンプルに |
| m2の次回振り返り日 | m9に移動 | 振り返り系はm9に集約 |
