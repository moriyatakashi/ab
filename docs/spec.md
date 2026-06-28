# roreki 仕様書 — アーキテクチャ編
## 更新日: 2026-06-28（第5版）

---

## 1. 使用技術

- GitHub Pages（静的サイト配信、サーバーサイドなし）
- Firebase / Firestore（データ永続化、NoSQL）
- Firebase JS SDK v10.12.2（CDN経由、ESモジュール）
- Vanilla JS / ES Modules（npmビルド不要）
- GeoJSON（境界線データ、smartnews-smri/japan-topography より取得）
- Canvas API（自作地図描画）

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
├── geo/
│   ├── higashiosaka.geojson  # 東大阪市境界線
│   └── osaka_city.geojson    # 大阪市境界線（24区）
├── lib/
│   ├── firebase.js     # Firebase初期化共通モジュール（全ページ共通）
│   ├── score.js        # スコア管理クラス（ScoreManager）
│   ├── input.js        # タッチ・キー入力管理クラス（Input）
│   ├── gameloop.js     # ゲームループ管理クラス（GameLoop）
│   └── test.html       # ライブラリテストページ
├── play/index.html     # 遊ぶサブページ（m6・m8・m4へのリンク）
├── admin/index.html    # 管理サブページ（m3・lib/testへのリンク）
├── m1/index.html       # 記録一覧（スコア+訪問+メモ 全件）
├── m2/index.html       # 今日の記録（スコア+訪問+チェック+メモ入力）
├── m3/index.html       # Firestoreビューア + SQLコンソール
├── m4/index.html       # トリビア
├── m5/index.html       # 訪問地図（Canvas自作、GeoJSON境界線）
├── m6/index.html       # インベーダーゲーム
├── m8/index.html       # ランナー（横スクロールアクション）
└── m9/index.html       # 振り返り（スコア記録・タスク管理・次回日設定）
```

### moriyatakashi/ac
- ブランチ: main（公開）, dev（退避用）
- Pages: https://moriyatakashi.github.io/ac/

```
ac/
├── index.html          # 日本地図5地域カラーマップ
└── faithjs/            # NESエミュレーター（参考実装、PC作業前提）
    ├── public/
    │   ├── index.html
    │   ├── js/main.js  # ビルド済み
    │   └── rom/        # フリーROM4本
    ├── src/js/
    │   ├── NES.js      # エミュレーター本体
    │   ├── main.js
    │   └── Mapper/     # マッパー55ファイル
    ├── package.json
    ├── webpack.config.js
    └── .babelrc
```

---

## 4. トップページの設計思想

JS配列（PAGES）でカードを生成。ページ追加は1行追加するだけ。

**ナビゲーション設計：**
- トップは6枚程度のカードに絞る
- ゲームは `play/` サブページにまとめる
- 管理ツールは `admin/` サブページにまとめる
- 全ページ2ステップ以内で到達できる
- 今日が振り返り日のとき最上部にバナー表示

---

## 5. Firebase / Firestore 構成

### ab用プロジェクト
- projectId: ab01-9f35a
- authDomain: ab01-9f35a.firebaseapp.com

### ac用プロジェクト
- projectId: ac01-fab17
- authDomain: ac01-fab17.firebaseapp.com

---

## 6. コレクション構成（ab01-9f35a）

| コレクション | ID | 用途 |
|------------|-----|------|
| ab_items2 | 日付（YYYY-MM-DD） | 日次スコア（col2=点数、col3=メモ） |
| ab_visits | 自動採番 | 訪問記録（place・date・time・lat・lng・memo） |
| ab_memos | 自動採番 | 出来事メモ（date・memo・createdAt）複数件/日可 |
| ab_checks | 日付 | 日次チェック（crossed_midnight・ate_meal・reviewDate） |
| ab_reviews | 日付 | 振り返りスコア（score 0〜100、後勝ち） |
| ab_tasks | 自動採番 | タスク（col1=タイトル・col2=カテゴリ・col3=メモ） |
| ab_invader_history | 自動採番 | m6プレイ履歴 |
| ab_invader_hi | record | m6最高得点（ドキュメント固定） |
| ab_runner_history | 自動採番 | m8プレイ履歴 |
| ab_runner_hi | record | m8最高得点（ドキュメント固定） |
| ab_sandbox | - | 実験用（現在未使用） |
| ab_lib_test_hist | 自動採番 | テスト用プレイ履歴（定期削除推奨） |
| ab_lib_test_hi | record | テスト用最高得点（定期削除推奨） |

**重要：** ab_memosのcreatedAtと対象dateが異なる場合は「後から追加した記録」として表示で区別。

---

## 7. セキュリティルール

全コレクション `allow read, write: if true;`（Stage 0、認証なし）。

---

## 8. geo/フォルダの運用

市区町村境界線GeoJSONを必要に応じて追加していく。

**データソース：** smartnews-smri/japan-topography（国土数値情報ベース）
**命名規則：** `{市名ローマ字}.geojson`（例: higashiosaka.geojson）
**追加タイミング：** 新しい市を訪問したタイミングで振り返り日に追加

---

## 9. チャット引き継ぎルール

- 「ズンドコベロンチョわかる？」→ 確認の合言葉
- 「ズンドコベロンチョお願い」→ PAT込みの引き継ぎプロンプトを出力
- テンプレート（PATなし）: Google Driveの `roreki_handover_template.md`

---

## 10. 開発ルール

- ファイル削除は明示的に言われるまで確認を取る
- pushのたびにHTMLの更新時刻を更新する（JST換算）
- devブランチ = mainの退避スナップショット（壊す前に必ず取る）
- GitHub PATはリポジトリ単位で発行（Fine-grained tokens）
- m1・m2・m9はlib/firebase.jsを使用。m6・m8はまだ直接初期化（後回し）
- Firestore REST APIはClaude環境から直接アクセス不可
  → データ確認はm3のコピーボタン経由でJSONをClaudeに貼る
