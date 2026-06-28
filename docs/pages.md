# roreki 仕様書 — ページ一覧編
## 更新日: 2026-06-28（第3版）

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

管理ツール一覧。main・m3・lib/testへのリンク。
開発者・デバッグ用途。

---

## m2 — 今日の記録 ★メイン入力ページ
URL: https://moriyatakashi.github.io/ab/m2/
使用コレクション: ab_items2・ab_visits・ab_checks

**ページ上部から順に：**

1. **振り返りバナー**（今日が振り返り日のとき表示）→ m9へリンク
2. **次回振り返り日**（日付input、変更で即保存）
3. **チェック項目**（日を跨いだ・ご飯食べた、タップで済表示）
4. **スコア入力**（スライダー0〜100＋一言メモ）
   - 開いたとき今日のスコアを読み込んでスライダーにセット
   - 入力済みなら「更新」ボタン
   - 日付を変えると対応する日のスコアを再読み込み
5. **訪問記録**（場所・日付・時間・メモ＋現在地ボタン）
6. **直近履歴**（3日分、スコア＋チェックタグ＋訪問）→「もっと見る→m1」

**日付確認バナー：**
- 22:15〜23:59に開いたとき → 「今日の記録でいいですか？」
- 0:00〜7:00に開いたとき → 「昨日の記録ですか？」

---

## m9 — 振り返り
URL: https://moriyatakashi.github.io/ab/m9/
使用コレクション: ab_reviews

- 前回の振り返り日とスコアを表示
- スライダーで0〜100のスコアを設定して記録（setDoc、同日上書き）
- 今日すでに記録があればスライダーにその値をセット
- 振り返り履歴をバーグラフ付きで全件表示（新しい順）
- m2・m1へのリンク

---

## m1 — 記録一覧（全件）
URL: https://moriyatakashi.github.io/ab/m1/
使用コレクション: ab_items2・ab_visits・ab_checks

スコアと訪問記録を日付でマージして全件表示。新しい順。
チェック済み項目（✓ 日を跨いだ・✓ ご飯食べた）をタグ表示。

---

## m3 — Firestoreビューア＋SQLコンソール
URL: https://moriyatakashi.github.io/ab/m3/
使用コレクション: ab_items2・ab_visits・ab_checks・ab_reviews（0件は非表示）

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

4段×8列インベーダー。波が進むほど速くなる。
タッチ（◀ FIRE ▶）・キーボード対応。
スコア・波数をFirestoreに保存。最高得点管理。

---

## m8 — ランナー
URL: https://moriyatakashi.github.io/ab/m8/
使用コレクション: ab_runner_history・ab_runner_hi

横スクロールアクション（オリジナルキャラ）。
ジャンプ・踏む・コイン収集・レベルクリア。
タッチ（◀ JUMP ▶）・キーボード対応。
スコア・コイン・レベルをFirestoreに保存。

---

## main — CRUD
URL: https://moriyatakashi.github.io/ab/main/
使用コレクション: ab_items2・ab_sandbox

上部タブで本番/実験を切り替え。
3入力欄＋追加ボタン。各行は直接編集可能。onSnapshotでリアルタイム同期。

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
| main/ + sandbox/ 別々 | mainに本番/実験タブとして統合 | コード99%同一 |
| mm/（スコア入力） | m2に統合 | m2でカバー |
| m5/（訪問記録） | m2に統合 | m2でカバー |
| m7/（スコア+履歴） | m2に統合 | m2でカバー |
| hub/（iframeナビ） | 廃止 | 不要 |
| auth.js（Google認証） | 廃止 | GitHub Pages×Firebaseの相性問題 |
| トップにm3直リンク | admin/経由に変更 | トップをシンプルに保つ |
