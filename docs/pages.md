# roreki 仕様書 — ページ一覧編
## 更新日: 2026-06-27（第3版）

---

## ab リポジトリのページ

### トップ（index.html）
URL: https://moriyatakashi.github.io/ab/
リンク一覧のみ。カードリンクをセクション分け（残す/みる/遊ぶ/管理）。

---

### m2 — 今日の記録 ★メイン入力ページ
URL: https://moriyatakashi.github.io/ab/m2/
使用コレクション: ab_items2（スコア）、ab_visits（訪問）

スコア入力と訪問記録入力を1ページに統合。

**スコアセクション**
- スライダー（0〜100）＋一言メモ＋保存ボタン
- 今日の日付をIDとしてsetDoc（同じ日に何度押しても上書き）

**訪問記録セクション**
- 場所・日付・時間・メモの入力欄
- 現在地ボタン → Nominatim逆ジオコーディングで住所取得
- addDocで追記（同じ日に複数件OK）

**履歴セクション**
- 直近3日分をスコア＋訪問まとめて日付カードで表示
- 「もっと見る →」でm1へ遷移

---

### m1 — 記録一覧（全件）
URL: https://moriyatakashi.github.io/ab/m1/
使用コレクション: ab_items2（スコア）、ab_visits（訪問）

スコアと訪問記録を日付でマージして全件表示。新しい順。
各日付カードにスコアバー＋訪問場所を表示。

---

### m3 — Firestoreビューア＋SQLコンソール
URL: https://moriyatakashi.github.io/ab/m3/
使用コレクション: ab_items2、ab_sandbox、ab_visits

**ビューア**
- 全コレクションのスキーマ（フィールド名・型）を表示
- 全ドキュメントをID付きで一覧表示
- 「📋 全データコピー」ボタン: 全データをJSONでクリップボードへ（Claudeへの情報共有に使う）

**SQLコンソール**
- テキストエリアにコマンドを貼り付けて実行
- 対応コマンド:
  - `INSERT コレクション col1="値" col2="値" col3="値"`
  - `INSERT コレクション id="指定ID" col1="値" ...`（ID指定）
  - `UPDATE コレクション id="docId" col1="新しい値"`
  - `DELETE コレクション id="docId"`
  - `TRUNCATE コレクション`（全件削除）
  - `--` で始まる行はコメント
- 複数行まとめて実行可。実行後に自動リロード。
- ログウィンドウに成功/失敗を色分け表示

---

### m4 — トリビア
URL: https://moriyatakashi.github.io/ab/m4/
鉄道・地理・乗り物のちょっと面白いトリビアを表示。

---

### m6 — インベーダー
URL: https://moriyatakashi.github.io/ab/m6/
使用コレクション: ab_invader_history、ab_invader_hi

スペースインベーダー風のシューティングゲーム。

- 4段×8列のインベーダー
- 波が進むごとに速くなる
- タッチボタン（◀ FIRE ▶）でスマホ操作、キーボード（矢印+スペース）も対応
- ゲームオーバー時にスコア・日付・波数をFirestoreへ保存
- 最高得点をab_invader_hiで管理
- 画面下部にプレイ履歴10件（最高点はゴールド表示）

---

### m8 — ランナー
URL: https://moriyatakashi.github.io/ab/m8/
使用コレクション: ab_runner_history、ab_runner_hi

マリオ風オリジナル横スクロールアクションゲーム。

- ジャンプ・敵を踏む・コイン収集・レベルクリア
- レベルが上がるごとに難易度上昇（ステージランダム生成）
- タッチボタン（◀ JUMP ▶）でスマホ操作、キーボードも対応
- スコア・コイン数・レベルをFirestoreへ保存
- 最高得点をab_runner_hiで管理
- 履歴にコイン数・レベルも記録

---

### main — CRUD
URL: https://moriyatakashi.github.io/ab/main/
使用コレクション: ab_items2（本番）、ab_sandbox（実験）

- 上部タブで本番/実験を切り替え
- 3入力欄（項目・カテゴリ・メモ）＋追加ボタン
- 各行は直接編集可能、変更で「保存」ボタン出現
- onSnapshotでリアルタイム同期

---

## ac リポジトリのページ

### ac — 日本地図カラーマップ
URL: https://moriyatakashi.github.io/ac/
使用コレクション: ac_map（ac01-fab17）

- 5地域（北海道・東北 / 関東・甲信越 / 中部・近畿 / 中国・四国 / 九州・沖縄）
- タップで色を塗り替え
- 「保存」でFirestoreに保存
- 離島は非表示。沖縄本島のみ左上にインセット表示

---

## 廃止・統合の歴史

| 旧ページ | 処置 | 理由 |
|---------|------|------|
| main/ + sandbox/ 別々 | mainに本番/実験タブとして統合 | コード99%同一 |
| mm/（スコア入力） | m2に統合 | m2でカバー |
| m5/（訪問記録） | m2に統合 | m2でカバー |
| m7/（スコア+履歴） | m2に統合 | m2でカバー |
| hub/（iframeナビ） | 廃止 | 不要 |
| auth.js（Google認証） | 廃止 | GitHub Pages×Firebaseの相性問題 |
