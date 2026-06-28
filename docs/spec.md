# roreki 仕様書 — アーキテクチャ編
## 更新日: 2026-06-28（第3版）

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
├── index.html          # トップ（カードリスト、JS配列で管理）
├── style.css           # 共通CSS
├── docs/
│   ├── spec.md         # 本ファイル（アーキテクチャ・設計）
│   ├── pages.md        # ページ一覧・機能説明
│   ├── testing.md      # テスト方法・lib説明
│   └── pitfalls.md     # 既知の落とし穴・デバッグ手順
├── lib/
│   ├── firebase.js     # Firebase初期化共通モジュール
│   ├── score.js        # スコア管理クラス（ScoreManager）
│   ├── input.js        # タッチ・キー入力管理クラス（Input）
│   ├── gameloop.js     # ゲームループ管理クラス（GameLoop）
│   └── test.html       # ライブラリテストページ
├── play/
│   └── index.html      # 遊ぶサブページ（m6・m8・m4へのリンク）
├── admin/
│   └── index.html      # 管理サブページ（main・m3・lib/testへのリンク）
├── m1/index.html       # 記録一覧（スコア+訪問 全件）
├── m2/index.html       # 今日の記録（スコア+訪問+チェック入力）
├── m3/index.html       # Firestoreビューア + SQLコンソール
├── m4/index.html       # トリビア
├── m6/index.html       # インベーダーゲーム
├── m8/index.html       # ランナー（横スクロールアクション）
├── m9/index.html       # 振り返り（記録・履歴）
└── main/
    ├── index.html
    └── app.js          # CRUD（本番/実験タブ切り替え）
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

### ab_items2（ab01-9f35a）★メインコレクション
| フィールド | 型 | 用途 |
|-----------|-----|------|
| col1 | string | 項目 または 日付（YYYY-MM-DD） |
| col2 | string | カテゴリ または スコア（0〜100） |
| col3 | string | メモ |
| createdAt | timestamp または string | 管理用 |

- スコアデータ: ID=日付文字列（YYYY-MM-DD）、col2=スコア数値
- 一般CRUDデータ: ID=自動採番
- 識別はID形式で可能

### ab_sandbox（ab01-9f35a）
ab_items2と同じ構造。mainページの実験タブ専用。

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

### ab_invader_history / ab_invader_hi（ab01-9f35a）
m6のプレイ履歴・最高得点。

### ab_runner_history / ab_runner_hi（ab01-9f35a）
m8のプレイ履歴・最高得点。

### ac_map（ac01-fab17）
地域ID→カラーコードのマップ。ドキュメントID固定で "region_colors"。

### 廃止済み / 空コレクション
- ab_items: 移行済み（ab_items2に吸収）
- mm_scores: 未使用のまま空
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
