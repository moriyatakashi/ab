# roreki 仕様書 — テスト・lib編
## 更新日: 2026-06-27（第3版）

---

## 1. テストの目的

`lib/` 以下のライブラリは複数のページから共有されるため、壊れると影響が広い。テストの目的は以下の3つ：

1. **引き継ぎ時の状態確認**: 新しいセッション（人間・AI問わず）が「今これは動いているか」をすぐ確認できる
2. **修正後のリグレッション検出**: libを変更したあと、他への影響が出ていないか確認する
3. **Firestore接続確認**: 環境設定（APIキー・ルール）が正常かを確認する

---

## 2. テストの実行方法

**ブラウザで以下のURLを開くだけ。操作不要で自動実行される。**

```
https://moriyatakashi.github.io/ab/lib/test.html
```

### 結果の見方

| バッジ色 | 意味 |
|---------|------|
| 🟢 OK（緑） | テスト成功 |
| 🔴 FAIL（赤） | テスト失敗。エラー内容が表示される |
| 🔵 手動（青） | ボタンを押して目視確認が必要 |
| ⚪ 目視（灰） | 動いていれば正常（黄色い球が動くなど） |

画面下部に `X passed / Y failed` のサマリーが出る。
**全テストOKなら緑のサマリー、1件でもFAILがあれば赤のサマリー。**

### FAILが出たときの確認ポイント

- `firebase.js` 関連のFAIL → Firebase設定（APIキー・projectId）を確認
- `score.js` のsaveResult FAIL → FirestoreのセキュリティルールでWriteが拒否されている可能性
- `score.js` のloadHistory FAIL → FirestoreのセキュリティルールでReadが拒否されている可能性
- `input.js` FAIL → ブラウザのDOM操作に関する問題（通常は起きない）
- `gameloop.js` FAIL → requestAnimationFrameが動いていない（通常は起きない）

---

## 3. lib/ の構成と各ファイルの説明

```
lib/
├── firebase.js     # Firebase初期化・db export
├── score.js        # スコア管理クラス（ScoreManager）
├── input.js        # タッチ・キーボード入力管理クラス（Input）
├── gameloop.js     # ゲームループ管理クラス（GameLoop）
└── test.html       # 上記4ファイルのテストページ
```

---

## 4. 各libの詳細

### firebase.js

**役割**: Firebase初期化とFirestoreのdbインスタンスをexportする。全ページ共通の設定をここに集約。

**使い方**:
```javascript
import { db } from "../lib/firebase.js";
```

これだけでFirestoreに接続できるdbが使える。`initializeApp`の多重実行を防ぐために`getApps()`でチェックしている。

**注意**: ab01-9f35a専用。acリポジトリには使えない。

---

### score.js（ScoreManagerクラス）

**役割**: Firestoreへのスコア保存・最高得点管理・履歴読み込みをカプセル化する。m6・m8など複数のゲームで同じパターンを共有するために作成。

**使い方**:
```javascript
import { ScoreManager } from "../lib/score.js";

// コレクション名を渡してインスタンス生成
const sm = new ScoreManager(db, "ab_invader_history", "ab_invader_hi");

// 最高得点を読み込む（ページ読み込み時に呼ぶ）
const hi = await sm.loadHi();   // → 数値を返す

// スコアを保存する（ゲームオーバー時に呼ぶ）
// 第2引数に任意の追加データを渡せる
await sm.saveResult(1200, { wave: 5 });

// 履歴を取得する（最新N件）
const rows = await sm.loadHistory(10);
// → [{ id, score, date, createdAt, ...追加データ }, ...]
```

**設計のポイント**:
- `hiScore`はインスタンスが保持する。`loadHi()`後は`sm.hiScore`で参照可能
- `saveResult()`は最高得点の更新も内部で行う（比較・上書きまで自動）
- エラー時はconsole.warnのみ（画面をクラッシュさせない）

---

### input.js（Inputクラス）

**役割**: タッチボタンとキーボードの入力を統一して管理する。ゲームループ内で`input.keys.left`のように参照できる。

**使い方**:
```javascript
import { Input } from "../lib/input.js";

const input = new Input();

// HTML上のボタン要素と入力名を紐付ける
input.bind("btnLeft",  "left");
input.bind("btnRight", "right");
input.bind("btnFire",  "fire");

// ゲームループ内で参照する
if (input.keys.left)  { player.x -= speed; }
if (input.keys.right) { player.x += speed; }
if (input.keys.fire)  { shoot(); }
```

**キーボードのデフォルトマッピング**:
| キー名 | 対応キー |
|--------|---------|
| left | ArrowLeft |
| right | ArrowRight |
| fire | スペース、z、Z |
| jump | スペース、ArrowUp、z、Z |

カスタムマッピングはコンストラクタで渡せる:
```javascript
const input = new Input({ left: ["a", "A"], right: ["d", "D"] });
```

**設計のポイント**:
- タッチ（touchstart/touchend）とマウス（mousedown/mouseup）を両方登録
- `e.preventDefault()`でスクロール防止
- `reset()`で全キーをfalseにリセットできる

---

### gameloop.js（GameLoopクラス）

**役割**: `requestAnimationFrame`を使ったゲームループを管理する。`update(dt)`と`draw()`を分離し、`dt`（経過ミリ秒）を計算して渡す。

**使い方**:
```javascript
import { GameLoop } from "../lib/gameloop.js";

const loop = new GameLoop({
  update: (dt) => {
    // dt = 前フレームからの経過時間（ミリ秒）
    player.x += speed * dt / 16;  // フレームレート非依存な移動
  },
  draw: () => {
    ctx.clearRect(0, 0, W, H);
    // ...描画処理
  },
  maxDt: 100  // タブ非アクティブ復帰時の暴走防止（省略可、デフォルト100ms）
});

loop.start();   // ループ開始
loop.stop();    // ループ停止
loop.running;   // 現在の状態（true/false）
```

**設計のポイント**:
- `maxDt`で経過時間の上限を設定。タブを切り替えて戻ったとき大きなdtが来ても安全
- `stop()`→`start()`で再起動できる
- `_running`フラグで多重起動を防止

---

## 5. libを修正したときのチェックリスト

1. `lib/test.html` を開いて全テストがOKか確認
2. m6（インベーダー）が正常に動くか確認
3. m8（ランナー）が正常に動くか確認
4. m2（今日の記録）でスコア保存・訪問記録追加が動くか確認

---

## 6. テストで使うFirestoreコレクション

`score.js`のテストは実際にFirestoreに書き込みを行う。使用コレクション：

- `ab_lib_test_hist`: テスト用プレイ履歴
- `ab_lib_test_hi`: テスト用最高得点

これらは本番データには影響しない。定期的に削除しても問題ない（m3のSQLコンソールで`TRUNCATE ab_lib_test_hist`）。

---

## 7. 既知の制限

- **テスト環境はブラウザのみ**: Node.js環境では動かない（Firebase JS SDKがブラウザ向けのため）
- **Firestore REST APIはClaude環境から直接叩けない**: ネットワーク制限のため。データ確認はm3のコピーボタン経由でJSONをClaudeに貼る
- **m6・m8はまだlibを使っていない**: 現状は各ページに直接コードが書いてある。将来的にlibに移行する予定
- **認証なし**: Stage 0の設計。URLを知っていれば誰でも書き込める

---

## 8. 将来のテスト拡張案

- m6・m8をlibに移行したあと、ゲームロジック単体のテストを追加
- Firestoreのセキュリティルール変更時に接続テストを再実行して確認
- CI（GitHub Actions）でtest.htmlをヘッドレスブラウザで実行する仕組み（Stage 1以降）
