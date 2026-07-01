# roreki 仕様書 — アーキテクチャ編
## 更新日: 2026-07-02（第7版）

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
├── index.html          # トップ（CATEGORIESでカテゴリ別カード生成）
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
│   ├── date.js         # 日付フォーマット共通ヘルパー（todayStr）
│   ├── score.js        # スコア管理クラス（ScoreManager）
│   ├── input.js        # タッチ・キー入力管理クラス（Input）
│   └── gameloop.js     # ゲームループ管理クラス（GameLoop）
├── b/index.html        # 遊ぶサブページ（b1・b2・b3へのリンク）
├── a/index.html         # 管理サブページ（a1・a2へのリンク）
├── a1/index.html        # Firestoreビューア + SQLコンソール（旧m3）
├── a2/index.html        # ライブラリテストページ（旧lib/test.html）
├── a3/index.html        # URL受け口テスト（クエリパラメータ表示・Firestore読み取り確認用）
├── a4/index.html        # URLからメモ書き込み（?memo=本文 → ab_memosへ、確認ボタン方式）
├── b1/index.html        # トリビア（旧m4）
├── b2/index.html        # インベーダーゲーム（旧m6）
├── b3/index.html        # ランナー（横スクロールアクション、旧m8）
├── m1/index.html       # 記録一覧（スコア+訪問+メモ 全件）
├── m2/index.html       # 今日の記録（スコア+訪問+チェック+メモ入力）
├── m5/index.html       # 訪問地図（Canvas自作、GeoJSON境界線）
├── m7/index.html       # 日次スコア（折れ線グラフ）
├── m9/index.html       # 振り返り（スコア記録・タスク管理・次回日設定）
├── m10/index.html      # カレンダー（今月・来月表示）
└── m11/index.html      # 五角形レーダーチャート（デザイン検討中）
```

### moriyatakashi/ac
- ブランチ: main（公開）, dev（退避用）
- Pages: https://moriyatakashi.github.io/ac/

```
ac/
├── index.html          # 日本地図5地域カラーマップ
├── faithjs/            # NESエミュレーター（vanilla JS版、Mapper4のみ対応）
│   ├── public/
│   │   ├── index.html  # エミュレーター本体（vanilla JS inlined）
│   │   └── rom/        # フリーROM・自作ROM
│   ├── tools/
│   │   └── nes_emu.py  # Pythonミニエミュレーター（89命令版）
│   └── test/           # Jestテスト
├── nes_py/             # faithjs初期版のPython移植（Claude実行・デバッグ用）
│   ├── cpu.py          # 6502 CPU・メモリマップ・ジョイパッド
│   ├── ppu.py          # PPU（スキャンライン描画・静的レンダリング）
│   ├── mapper4.py      # Mapper4（MMC3）
│   ├── nes.py          # iNES読み込み・結線・フレームループ
│   └── README.md
└── nes_py_capture/     # Bad Apple霊夢シルエット抜き取り実験
    ├── capture.py
    ├── reimu_f0060.png
    ├── reimu_f0150.png
    ├── reimu_f0300.png
    └── README.md
```

---

## 4. トップページの設計思想

JS配列（CATEGORIES）でカテゴリ別カードを生成。カテゴリ追加・ページ追加は配列1行追加するだけ。

**現在のカテゴリ構成：**
- 記録する: m2・m9
- 見る・振り返る: m1・m7・m5
- ツール: m10・m11
- その他: b/・a/

**ナビゲーション設計：**
- トップはカテゴリグループで整理
- ゲームは `b/` サブページにまとめる（配下 b1・b2・b3）
- 管理ツールは `a/` サブページにまとめる（配下 a1・a2）
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
| ab_invader_history | 自動採番 | b2（旧m6）プレイ履歴 |
| ab_invader_hi | record | b2（旧m6）最高得点（ドキュメント固定） |
| ab_runner_history | 自動採番 | b3（旧m8）プレイ履歴 |
| ab_runner_hi | record | b3（旧m8）最高得点（ドキュメント固定） |
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
- 「ズンドコベロンチョ＋リポジトリ名」→ そのリポジトリ限定の引き継ぎ
- テンプレート（PATなし）: Google Driveの `roreki_handover_template.md`

---

## 10. 開発ルール

- ファイル削除は明示的に言われるまで確認を取る
- pushのたびにHTMLの更新時刻を更新する（JST換算）
- devブランチ = mainの退避スナップショット（壊す前に必ず取る）
- GitHub PATはリポジトリ単位で発行（Fine-grained tokens）
- m1・m2・m9・index・a1・b2・b3はlib/firebase.jsを使用（全ページ統一済み）
- Firestore REST APIはClaude環境から直接アクセス不可
  → データ確認はa1のコピーボタン経由でJSONをClaudeに貼る
- 「Claudeが生成したURLをSafariで開いて実行する」方式（a3・a4）を検証済み：
  - Claudeはbash_toolでab本体・Firestore本体どちらにも直接アクセス不可（host_not_allowed）
  - web_fetchは「会話に既出のURL」しか取得できない制約あり、Claudeが自発的に新規URLを覗きに行くことはできない
  - 読み取り：a3が`?col=&doc=`を受けてFirestoreを読み、結果をユーザーが目視でClaudeに伝える
  - 書き込み：Firestore REST APIは書き込みにPOST/PATCH+JSON本文が必須でURL単体では不可のため、a4のような「受け口ページ（GETでロード→ページ内JSが正しいリクエストを送る）」を経由する。誤送信・二重送信防止のため自動書き込みはせず、確認→ボタン押下の2段階方式を採用

