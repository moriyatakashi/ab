# roreki 仕様書 — アーキテクチャ編
## 更新日: 2026-06-28（第4版）

---

## 1. 使用技術

- GitHub Pages（静的サイト配信、サーバーサイドなし）
- Firebase / Firestore（データ永続化、NoSQL）
- Firebase JS SDK v10.12.2（CDN経由、ESモジュール）
- Vanilla JS / ES Modules（npmビルド不要）
- GeoJSON（日本地図データ、dataofjapan/land より取得）

---

## 2. 開発ステップ

- Step1（現在）: Firestore + GitHub Pages で動くものを作る・壊す
- Step2: 作りたいものが決まったら Azure 等を検討
- Step3: 必要ならスケール設計を学ぶ

前提: AIと一緒にものを作る体験 / スマホだけで完結できる開発スタイル / 学びは手を動かしながら自然に入ってくる程度でいい

---

## 3. リポジトリ構成

### moriyatakashi/ab
- ブランチ: main（公開）, dev（退避用バックアップ）
- Pages: https://moriyatakashi.github.io/ab/

```
ab/
├── index.html          # トップ（JS配列PAGESでカード生成）
├── style.css           # 共通CSS
├── docs/
│   ├── spec.md         # 本ファイル（アーキテクチャ・設計）
│   ├── pages.md        # ページ一覧・機能説明
│   ├── testing.md      # テスト方法・lib説明
│   └── pitfalls.md     # 既知の落とし穴・デバッグ手順
├── lib/
│   ├── firebase.js     # Firebase初期化共通モジュール（全ページ共通）
│   ├── score.js        # スコア管理クラス（ScoreManager）
│   ├── input.js        # タッチ・キー入力管理クラス（Input）
│   ├── gameloop.js     # ゲームループ管理クラス（GameLoop）
│   └── test.html       # ライブラリテストページ
├── play/
│   └── index.html      # 遊ぶサブページ（m6・m8・m4へのリンク）
├── admin/
│   └── index.html      # 管理サブページ（m3・lib/testへのリンク）
├── m1/index.html       # 記録一覧（スコア+訪問+メモ 全件）
├── m2/index.html       # 今日の記録（スコア+訪問+チェック+メモ入力）
├── m3/index.html       # Firestoreビューア + SQLコンソール
├── m4/index.html       # トリビア
├── m6/index.html       # インベーダーゲーム
├── m8/index.html       # ランナー（横スクロールアクション）
└── m9/index.html       # 振り返り（スコア記録・タスク管理・次回日設定）
```

### moriyatakashi/ac
- ブランチ: main（公開）, dev（退避用）
- Pages: https://moriyatakashi.github.io/ac/

```
ac/
└── index.html          # 日本地図5地域カラーマップ
```

---

## 4. トップページの設計思想

トップページ（index.html）のカード一覧はJS配列で管理する。
ページを追加するときは `PAGES` 配列に1行追加するだけ。

```javascript
const PAGES = [
  { icon:"📝", title:"m2 — 今日の記録", desc:"...", href:"m2/" },
  // ここに追加するだけ
];
```

**ナビゲーション設計：**
- トップは5枚程度のカードに絞る
- ゲームは `play/` サブページにまとめる
- 管理ツールは `admin/` サブページにまとめる
- 全ページ2ステップ以内で到達できる
- 今日が振り返り日のとき最上部にバナー表示（ab_checksのreviewDate===today）

---

## 5. Firebase / Firestore 構成

### ab用プロジェクト
- projectId: ab01-9f35a
- authDomain: ab01-9f35a.firebaseapp.com

### ac用プロジェクト
- projectId: ac01-fab17
- authDomain: ac01-fab17.firebaseapp.com

---

## 6. コレクション構成

### ab_items2（ab01-9f35a）★スコアコレクション
| フィールド | 型 | 用途 |
|-----------|-----|------|
| col1 | string | 日付（YYYY-MM-DD） |
| col2 | string | スコア（0〜100） |
| col3 | string | 一言メモ |
| createdAt | string | ISO文字列 |

ドキュメントIDは日付文字列（setDoc、同日上書き）。

### ab_visits（ab01-9f35a）
| フィールド | 型 | 用途 |
|-----------|-----|------|
| place | string | 場所名 |
| date | string | 日付（YYYY-MM-DD） |
| time | string | 時刻（HH:MM） |
| memo | string | メモ |
| lat | number / null | 緯度 |
| lng | number / null | 経度 |
| createdAt | string | ISO文字列 |

ドキュメントIDは自動採番。

### ab_memos（ab01-9f35a）
| フィールド | 型 | 用途 |
|-----------|-----|------|
| date | string | 対象日（YYYY-MM-DD） |
| memo | string | 出来事メモ |
| createdAt | string | 入力日時（ISO文字列）|

ドキュメントIDは自動採番。1日複数件OK。
createdAtと対象dateが異なる場合は「後から追加した記録」として表示で区別。

### ab_checks（ab01-9f35a）
| フィールド | 型 | 用途 |
|-----------|-----|------|
| date | string | 日付（YYYY-MM-DD） |
| crossed_midnight | boolean | 日を跨いだか |
| ate_meal | boolean | ご飯食べたか |
| reviewDate | string / null | 次回振り返り日（YYYY-MM-DD） |
| updatedAt | string | 更新日時 |

ドキュメントIDは日付文字列（setDoc、同日上書き）。

### ab_reviews（ab01-9f35a）
| フィールド | 型 | 用途 |
|-----------|-----|------|
| date | string | 振り返りをした日（YYYY-MM-DD） |
| score | number | 振り返りの質（0〜100） |
| createdAt | string | ISO文字列 |

ドキュメントIDは日付文字列（setDoc、同日上書き＝後のが勝つ）。

### ab_tasks（ab01-9f35a）
| フィールド | 型 | 用途 |
|-----------|-----|------|
| col1 | string | タイトル |
| col2 | string | カテゴリ（片付け・設計・開発・検証 など） |
| col3 | string | メモ |
| createdAt | string | ISO文字列 |

ドキュメントIDは自動採番。将来的にカテゴリや状態遷移の再設計予定。

### ab_invader_history / ab_invader_hi（ab01-9f35a）
m6のプレイ履歴・最高得点。

### ab_runner_history / ab_runner_hi（ab01-9f35a）
m8のプレイ履歴・最高得点。

### ac_map（ac01-fab17）
地域ID→カラーコードのマップ。ドキュメントID固定で "region_colors"。

### 廃止済み / テスト用
- ab_sandbox: 実験用（現在未使用）
- ab_lib_test_hist / ab_lib_test_hi: テスト用（定期削除推奨）

---

## 7. セキュリティルール

### ab01-9f35a（現状）
全コレクション `allow read, write: if true;`
認証なし・完全オープン（Stage 0の意図的な設計）。

### ac01-fab17
同上。

---

## 8. 共通CSS（style.css）の設計思想

CSSカスタムプロパティ（変数）でデザイントークンを定義。

主な変数:
- `--bg`: #f7f6f3 / `--panel`: #ffffff / `--border`: #e2ded6
- `--accent`: #b5651d（茶系） / `--accent-soft`: #f1e3d3
- `--text`: #2b2b2b / `--text-soft`: #7a7568

---

## 9. 開発ルール

- ファイル削除は明示的に言われるまで確認を取る
- pushのたびにHTMLの更新時刻を更新する（JST換算）
- 作業前に確認が必要な場合は必ず聞く
- devブランチ = mainの退避スナップショット（壊す前に必ず取る）
- GitHub PATはリポジトリ単位で発行（Fine-grained tokens）
- indexから辿れないファイルは定期的に削除して整理

---

## 10. 運用メモ

- ab → 今のメイン開発 / ac → 地図機能
- Firestore REST APIはClaude環境から直接アクセス不可
  → データ確認はm3のコピーボタン経由でJSONをClaudeに貼る
- 更新時刻はコード作成時刻+9時間（JST換算）で手書き
- m1・m2・m9はlib/firebase.jsを使用。m6・m8はまだ直接初期化（後回し）
