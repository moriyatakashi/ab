# roreki 仕様書 — ページ一覧編
## 更新日: 2026-06-28（第4版）

---

## トップページ（index.html）
URL: https://moriyatakashi.github.io/ab/

JS配列（PAGES）でカードを生成。5枚構成：
- 📝 m2 — 今日の記録
- 🔁 m9 — 振り返り
- 📋 m1 — 記録一覧
- 🎮 遊ぶ（play/サブページ）
- ⚙️ 管理（admin/サブページ）

今日が振り返り日のとき（ab_checksのreviewDate===today）、最上部に茶色バナーが出てm9へリンク。

---

## play/（遊ぶサブページ）
URL: https://moriyatakashi.github.io/ab/play/

ゲーム一覧ページ。m8・m6・m4へのリンク。

---

## admin/（管理サブページ）
URL: https://moriyatakashi.github.io/ab/admin/

管理ツール一覧。m3・lib/testへのリンク。開発者・デバッグ用途。

---

## m2 — 今日の記録 ★メイン入力ページ
URL: https://moriyatakashi.github.io/ab/m2/
使用コレクション: ab_items2・ab_visits・ab_checks・ab_memos

**ページ上部から順に：**

1. **振り返りバナー**（今日が振り返り日のとき表示）→ m9へリンク
2. **チェック項目**（日を跨いだ・ご飯食べた、タップで済表示）
3. **スコア入力**（スライダー0〜100＋一言メモ）
   - 開いたとき今日のスコアを読み込んでスライダーにセット
   - 入力済みなら「更新」ボタン
4. **訪問記録**（場所・日付・時間・メモ＋現在地ボタン）
5. **出来事メモ**（日付＋テキスト、1日複数件可）
6. **直近履歴**（3日分、スコア＋チェックタグ＋訪問）→「もっと見る→m1」

**日付確認バナー：**
- 22:15〜23:59に開いたとき → 「今日の記録でいいですか？」
- 0:00〜7:00に開いたとき → 「昨日の記録ですか？」

---

## m9 — 振り返り
URL: https://moriyatakashi.github.io/ab/m9/
使用コレクション: ab_reviews・ab_tasks・ab_checks

**構成（上から順）：**

1. **振り返り記録フォーム**
   - 前回の振り返り日とスコアを表示
   - スライダーで0〜100のスコアを設定して記録（setDoc、同日上書き）
   - 今日すでに記録があればスライダーにその値をセット
   - 次回振り返り日の設定（ab_checksのreviewDateに保存）

2. **振り返り履歴**
   - 全件をバーグラフ付きで表示（新しい順）

3. **タスク一覧**
   - 追加：タイトル＋カテゴリ入力→「＋ 追加」
   - 編集：「編集」ボタン→タイトル・カテゴリ変更→「保存」
   - 強制削除：「強制削除」ボタン→確認ダイアログ→削除

4. **リンク**（m2・m1へ）

---

## m1 — 記録一覧（全件）
URL: https://moriyatakashi.github.io/ab/m1/
使用コレクション: ab_items2・ab_visits・ab_checks・ab_memos

スコア・訪問・メモを日付でマージして全件表示。新しい順。
- チェック済み項目（✓ 日を跨いだ・✓ ご飯食べた）をタグ表示
- 出来事メモを📝で表示（入力日≠対象日のとき「YYYY-MM-DD入力」と表示）

---

## m3 — Firestoreビューア＋SQLコンソール
URL: https://moriyatakashi.github.io/ab/m3/
使用コレクション: ab_items2・ab_visits・ab_checks・ab_reviews・ab_memos・ab_tasks（0件は非表示）

**ビューア**
- スキーマ（フィールド名・型）を表示
- 全ドキュメントをID付きで一覧
- 「📋 全データコピー」→ JSONをクリップボードへ（Claudeへの情報共有に使う）

**SQLコンソール**
```
INSERT コレクション col1="値" col2="値" col3="値"
INSERT コレクション id="指定ID" col1="値"
UPDATE コレクション id="docId" col1="新しい値"
DELETE コレクション id="docId"
TRUNCATE コレクション
-- コメント行
```
複数行まとめて実行可。実行後に自動リロード。

---

## m4 — トリビア
URL: https://moriyatakashi.github.io/ab/m4/

鉄道・地理・乗り物のトリビア表示ページ。

---

## m6 — インベーダー
URL: https://moriyatakashi.github.io/ab/m6/
使用コレクション: ab_invader_history・ab_invader_hi

4段×8列インベーダー。波が進むほど速くなる。タッチ・キーボード対応。

---

## m8 — ランナー
URL: https://moriyatakashi.github.io/ab/m8/
使用コレクション: ab_runner_history・ab_runner_hi

横スクロールアクション。ジャンプ・踏む・コイン収集・レベルクリア。タッチ・キーボード対応。

---

## lib/test — テスト
URL: https://moriyatakashi.github.io/ab/lib/test.html

ブラウザで開くだけで自動テスト実行。詳細はtesting.mdを参照。

---

## ac — 日本地図カラーマップ
URL: https://moriyatakashi.github.io/ac/
使用コレクション: ac_map（ac01-fab17）

5地域をタップで色塗り。Firestoreに保存。

---

## 廃止・統合の歴史

| 旧ページ | 処置 | 理由 |
|---------|------|------|
| main/（CRUD） | 削除 | m9のタスク管理・m3のSQLコンソールで代替 |
| mm/（スコア入力） | m2に統合 | m2でカバー |
| m5/（訪問記録） | m2に統合 | m2でカバー |
| m7/（スコア+履歴） | m2に統合 | m2でカバー |
| hub/（iframeナビ） | 廃止 | 不要 |
| auth.js（Google認証） | 廃止 | GitHub Pages×Firebaseの相性問題（要再検証） |
| トップにm3直リンク | admin/経由に変更 | トップをシンプルに保つ |
| m2の次回振り返り日 | m9に移動 | 振り返りに関することはm9に集約 |
