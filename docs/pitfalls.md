# roreki 仕様書 — 既知の落とし穴・デバッグ手順
## 作成日: 2026-06-28

---

## 1. 既知の落とし穴

### 🔴 continue をtry/catch内で使うと構文エラー

**症状：** JSが途中で止まる、画面が「読み込み中」のまま変わらない。

**原因：**
```javascript
// ❌ NG: try{}内でcontinueを使うと構文エラー
for (const col of COLLECTIONS) {
  try {
    const snap = await getDocs(...);
    if (snap.size === 0) continue;  // ← エラー
  } catch(e) {}
}
```

**解決策：**
```javascript
// ✅ OK: snapをtryの外で宣言し、取得だけtryで囲む
for (const col of COLLECTIONS) {
  let snap;
  try {
    snap = await getDocs(...);
  } catch(e) { continue; }

  if (snap.size === 0) continue;  // tryの外でcontinue
  // 以降の処理...
}
```

---

### 🔴 GitHub Pages × Firebase Auth の相性問題

**症状：** signInWithRedirect後、ページに戻ってきてもログイン状態にならない。

**原因：** GitHub Pagesのリダイレクト処理とFirebaseのAuth handlerが干渉する。

**対応：** Stage 0では認証なしで運用。Firebase Hostingに移行した段階で再挑戦。

---

### 🔴 Firestore REST APIがClaude環境から叩けない

**症状：** bashからfirestore.googleapis.comへのcurlが失敗する。

**原因：** Claude実行環境のネットワークallowlistに含まれていない。

**対応：** m3の「📋 全データコピー」ボタンでJSONを取得してClaudeに貼る。

---

### 🔴 type="module"のscriptはエラー時にサイレントで止まる

**症状：** 画面が真っ黒、または何も表示されない。

**原因：** ESモジュールはimportエラーやtoplevel構文エラー時に何も表示せず止まる。

**対応：** アラートデバッグで場所を特定する（下記参照）。

---

### 🔴 Promise.allに失敗するfetchが混ざると全体が止まる

**症状：** データが1件も表示されない。

**原因：** `Promise.all([A, B, C])`のうち1つが失敗すると全部失敗する。

**対応：** 重要度の低いfetchはPromise.allから外して個別にtry/catchで囲む。
```javascript
// ❌ NGパターン
const [snap1, snap2, optSnap] = await Promise.all([...]);

// ✅ OKパターン
const [snap1, snap2] = await Promise.all([重要なもの]);
let optSnap;
try { optSnap = await getDocs(...); } catch(e) {}
```

---

## 2. アラートデバッグの手順

GitHub Pagesでは開発者ツールのコンソールが使いにくいため、alertを使ってデバッグする。

### 基本の手順

**Step1: 通常scriptとmodule scriptを分離して確認**
```html
<script>alert("[A-0] 通常script OK");</script>
<script type="module">
alert("[A-1] module開始");
import { ... } from "...";
```
→ A-0が出てA-1が出ない場合、importの構文エラー。

**Step2: 処理ステップごとに番号付きalertを追加**
```javascript
alert("[A-2] Firebase初期化前");
const app = initializeApp({...});
alert("[A-3] Firebase初期化後");
const db = getFirestore(app);
alert("[A-4] getFirestore完了");
```
→ どの番号で止まるかで問題箇所を特定。

**Step3: catchブロックにもalertを追加**
```javascript
} catch(e) {
  alert("[CATCH] " + e.message);
}
```

**Step4: 問題が修正できたらalertを全て削除**

### alertのバージョン管理

更新するたびにアルファベットを変える（A→B→C...）。
更新時刻も同時に変更することで「反映済みか」を右下の時刻で確認できる。

```
[A-1] → [B-1] → [C-1] ...
```

### 反映確認の方法

ページ右下の「更新: YYYY-MM-DD HH:MM」が変わったら反映済み。
変わっていない場合はブラウザのキャッシュをクリアする。

---

## 3. Firebase Firestoreのルール注意点

### 新しいコレクションを追加したとき

Firebase Consoleでセキュリティルールに追記が必要。
追記なしでも動く場合があるが（デフォルトルール次第）、動かない場合はルールを確認する。

### テスト用コレクションの掃除

lib/test.htmlを実行するたびにab_lib_test_hist・ab_lib_test_hiにデータが蓄積する。
定期的にm3のSQLコンソールで削除する：
```sql
TRUNCATE ab_lib_test_hist
DELETE ab_lib_test_hi id="record"
```
またはlib/test.htmlの「🗑 テストデータをリセット」ボタンを使う。
