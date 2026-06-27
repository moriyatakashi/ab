# roreki 仕様書
## 更新日: 2026-06-27（第2版）

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
├── index.html        # トップ（リンク一覧のみ）
├── style.css         # 共通CSS（全ページで読み込む）
├── m1/
│   └── index.html   # 記録一覧（スコア+訪問 全件）
├── m2/
│   └── index.html   # 今日の記録（スコア+訪問 入力+直近3日）
├── m3/
│   └── index.html   # Firestoreビューア + SQLコンソール
├── m4/
│   └── index.html   # トリビア
└── main/
    ├── index.html
    └── app.js        # CRUD（本番/実験タブ切り替え）
```

### moriyatakashi/ac
- ブランチ: main（公開）, dev（退避用）
- Pages: https://moriyatakashi.github.io/ac/

```
ac/
└── index.html        # 日本地図5地域カラーマップ
```

---

## 4. ページ一覧と機能説明

### ab/（トップ）
リンク一覧のみ。m2・m1・m4・main・m3 へのカードリンク。セクション分け（残す/みる/遊ぶ/管理）。

### ab/m2/（今日の記録）★メイン入力ページ
スコア入力と訪問記録入力を1ページに統合。
- **スコアセクション**: スライダー（0〜100）＋一言メモ＋保存ボタン。今日の日付をIDとしてsetDoc（上書き保存）。
- **訪問記録セクション**: 場所・日付・時間・メモの入力欄＋現在地ボタン（Nominatim逆ジオコーディング）。addDocで追記。
- **履歴セクション**: 直近3日分をスコア＋訪問まとめて表示。「もっと見る→」でm1へ。

### ab/m1/（記録一覧）
スコアと訪問記録を日付でマージして全件表示。新しい順。
- ab_items2からスコアデータ（日付ID＋0〜100数値）を抽出
- ab_visitsから訪問記録を全件取得
- 日付でグループ化、各カードにスコアバー＋訪問場所を表示

### ab/m3/（Firestoreビューア + SQLコンソール）
ab_items2・ab_sandbox・ab_visitsの3コレクションを読み込み表示。
- 上部に構造サマリー（フィールド名と型）
- 下部にデータ一覧（ID付き）
- 「📋 全データコピー」ボタン：全コレクションのデータをJSONでクリップボードへ
- 「🛠 SQLコンソール」：INSERT/UPDATE/DELETE/TRUNCATEをFirestoreに実行
  - `INSERT コレクション col1="値" col2="値" col3="値"`
  - `UPDATE コレクション id="docId" col1="新しい値"`
  - `DELETE コレクション id="docId"`
  - `TRUNCATE コレクション`
  - 複数行まとめて実行可。実行後に自動リロード。

### ab/m4/（トリビア）
鉄道・地理・乗り物のトリビア表示ページ。

### ab/main/（CRUD）
ab_items2（本番）とab_sandbox（実験）をタブで切り替えるCRUDページ。
- 3入力欄（項目・カテゴリ・メモ）＋追加ボタン
- 各行は直接編集可能、変更で「保存」ボタン出現
- onSnapshotでリアルタイム同期
- タブで本番/実験を切り替え

### ac/（日本地図・5地域カラーマップ）
日本を5地域に分けてタップで色を塗れる地図アプリ。
- GeoJSONをCDNから取得してcanvasに描画
- 5地域：北海道・東北 / 関東・甲信越 / 中部・近畿 / 中国・四国 / 九州・沖縄
- 離島は非表示。沖縄本島のみ左上にインセット表示
- 「保存」でFirestore（ac_map/region_colors）に保存

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

- スコアデータ: ドキュメントID=日付文字列（YYYY-MM-DD）、col2=スコア数値
- 一般CRUDデータ: ドキュメントID=自動採番
- 両者が混在しているが、識別はID形式で可能

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
| createdAt | string | 管理用（ISO文字列） |

ドキュメントIDは自動採番。

### ac_map（ac01-fab17）
| フィールド | 型 | 用途 |
|-----------|-----|------|
| colors | map | 地域ID（1〜5）→ カラーコード（#xxxxxx） |
| updatedAt | string | 更新日時（ISO文字列） |

ドキュメントIDは固定で "region_colors"。

### 廃止済みコレクション（Firestore上は空で残存）
- ab_items: 移行済み（ab_items2に吸収）
- mm_scores: 未使用のまま空

---

## 7. セキュリティルール

### ab01-9f35a（現状）
```
match /ab_items2/{document=**} { allow read, write: if true; }
match /ab_sandbox/{document=**} { allow read, write: if true; }
match /ab_visits/{document=**}  { allow read, write: if true; }
```
認証なし・完全オープン（Stage 0の意図的な設計）。

### ac01-fab17
```
match /{document=**} { allow read, write: if true; }
```

---

## 8. 共通CSS（style.css）の設計思想

CSSカスタムプロパティ（変数）でデザイントークンを定義。
全ページがこのstyle.cssを読み込むことでデザインを統一。

主な変数:
- `--bg`: #f7f6f3（背景）
- `--panel`: #ffffff（カード背景）
- `--border`: #e2ded6（枠線）
- `--accent`: #b5651d（アクセント色・茶系）
- `--accent-soft`: #f1e3d3（アクセント薄め）
- `--text`: #2b2b2b / `--text-soft`: #7a7568

---

## 9. 開発ルール

- ファイル削除は明示的に言われるまで確認を取る
- pushのたびにHTMLの更新時刻を更新する
- 作業前に確認が必要な場合は必ず聞く
- devブランチ = mainの退避スナップショット（壊す前に必ず取る）
- GitHub PATはリポジトリ単位で発行（Fine-grained tokens）

---

## 10. 運用メモ

- ab → 今のメイン開発 / ac → 地図機能
- 行き詰まったらリポジトリとFirebaseプロジェクトをセットで入れ替える
- indexから辿れないファイルは定期的に削除して整理
- Firestore REST APIはネットワーク制限でClaude環境から直接アクセス不可
  → データ確認はm3のコピーボタン経由でJSONをClaudeに貼る

---

## 11. 廃止・統合の歴史（第1版→第2版）

| 旧ページ | 処置 | 理由 |
|---------|------|------|
| main/ + sandbox/ 別々 | mainに本番/実験タブとして統合 | コード99%同一 |
| mm/（スコア入力） | m2に統合 | m2でカバー |
| m5/（訪問記録） | m2に統合 | m2でカバー |
| m7/（スコア+履歴） | m2に統合 | m2でカバー |
| hub/（iframeナビ） | 廃止 | 不要 |
| auth.js（Google認証） | 廃止 | GitHub Pages×Firebaseの相性問題 |
