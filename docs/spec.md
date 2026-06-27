# roreki 仕様書 — アーキテクチャ編
## 更新日: 2026-06-27（第3版）

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
├── index.html          # トップ（リンク一覧のみ）
├── style.css           # 共通CSS（全ページで読み込む）
├── docs/
│   ├── spec.md         # 本ファイル（アーキテクチャ・設計）
│   ├── pages.md        # ページ一覧・機能説明
│   └── testing.md      # テスト方法・lib説明
├── lib/
│   ├── firebase.js     # Firebase初期化共通モジュール
│   ├── score.js        # スコア管理クラス
│   ├── input.js        # タッチ・キー入力管理クラス
│   ├── gameloop.js     # ゲームループ管理クラス
│   └── test.html       # ライブラリテストページ
├── m1/ m2/ m3/ m4/ m6/ m8/ main/   # 各ページ（pages.mdを参照）
```

### moriyatakashi/ac
- ブランチ: main（公開）, dev（退避用）
- Pages: https://moriyatakashi.github.io/ac/

```
ac/
└── index.html          # 日本地図5地域カラーマップ
```

---

## 4. Firebase / Firestore 構成

### ab用プロジェクト
- projectId: ab01-9f35a
- authDomain: ab01-9f35a.firebaseapp.com

### ac用プロジェクト
- projectId: ac01-fab17
- authDomain: ac01-fab17.firebaseapp.com

---

## 5. コレクション構成

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

### ab_invader_history / ab_invader_hi（ab01-9f35a）
m6（インベーダー）のプレイ履歴・最高得点。

### ab_runner_history / ab_runner_hi（ab01-9f35a）
m8（ランナー）のプレイ履歴・最高得点。

### ac_map（ac01-fab17）
| フィールド | 型 | 用途 |
|-----------|-----|------|
| colors | map | 地域ID（1〜5）→ カラーコード |
| updatedAt | string | 更新日時 |

ドキュメントIDは固定で "region_colors"。

### 廃止済みコレクション（Firestore上は空で残存）
- ab_items: 移行済み（ab_items2に吸収）
- mm_scores: 未使用のまま空
- ab_lib_test_hist / ab_lib_test_hi: テスト用（削除候補）

---

## 6. セキュリティルール

### ab01-9f35a（現状）
```
match /ab_items2/{document=**} { allow read, write: if true; }
match /ab_sandbox/{document=**} { allow read, write: if true; }
match /ab_visits/{document=**}  { allow read, write: if true; }
match /ab_invader_history/{document=**} { allow read, write: if true; }
match /ab_invader_hi/{document=**} { allow read, write: if true; }
match /ab_runner_history/{document=**} { allow read, write: if true; }
match /ab_runner_hi/{document=**} { allow read, write: if true; }
```
認証なし・完全オープン（Stage 0の意図的な設計）。

### ac01-fab17
```
match /{document=**} { allow read, write: if true; }
```

---

## 7. 共通CSS（style.css）の設計思想

CSSカスタムプロパティ（変数）でデザイントークンを定義。全ページがstyle.cssを読み込むことでデザインを統一。

主な変数:
- `--bg`: #f7f6f3 / `--panel`: #ffffff / `--border`: #e2ded6
- `--accent`: #b5651d（茶系） / `--accent-soft`: #f1e3d3
- `--text`: #2b2b2b / `--text-soft`: #7a7568

---

## 8. 開発ルール

- ファイル削除は明示的に言われるまで確認を取る
- pushのたびにHTMLの更新時刻を更新する
- 作業前に確認が必要な場合は必ず聞く
- devブランチ = mainの退避スナップショット（壊す前に必ず取る）
- GitHub PATはリポジトリ単位で発行（Fine-grained tokens）

---

## 9. 運用メモ

- ab → 今のメイン開発 / ac → 地図機能
- indexから辿れないファイルは定期的に削除して整理
- Firestore REST APIはClaude環境から直接アクセス不可
  → データ確認はm3のコピーボタン経由でJSONをClaudeに貼る
