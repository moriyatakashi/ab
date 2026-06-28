# roreki 仕様書 — 既知の落とし穴・デバッグ手順
## 更新日: 2026-06-28（第2版）

---

## 1. 既知の落とし穴

### 🔴 continue をtry/catch内で使うと構文エラー

**症状：** JSが途中で止まる、画面が「読み込み中」のまま変わらない。

**原因：**
```javascript
// ❌ NG
for (const col of COLLECTIONS) {
  try {
    const snap = await getDocs(...);
    if (snap.size === 0) continue;  // ← エラー
  } catch(e) {}
}
```

**解決策：**
```javascript
// ✅ OK: snapをtryの外で宣言
for (const col of COLLECTIONS) {
  let snap;
  try {
    snap = await getDocs(...);
  } catch(e) { continue; }
  if (snap.size === 0) continue;  // tryの外でcontinue
}
```

---

### 🔴 ESモジュールでimportより前に実行文を書くと構文エラー

**症状：** module scriptが全く動かない（A-0は出るがA-1以降が出ない）。

**原因：** `type="module"` のscriptではimport文はファイルの最上部に集める必要がある。importの前後にalertなどの実行文を挟むと構文エラーになる。

```javascript
// ❌ NG
<script type="module">
alert("開始");           // ← importより前はNG
import { db } from "...";
alert("import間");       // ← importの間もNG
import { getDocs } from "...";
```

```javascript
// ✅ OK
<script type="module">
import { db } from "...";
import { getDocs } from "...";
alert("import後はOK");   // ← importが全部終わってから
```

---

### 🔴 Promise.allに失敗するfetchが混ざると全体が止まる

**症状：** データが1件も表示されない。

**解決策：** 重要度の低いfetchはPromise.allから外して個別try/catchで囲む。
```javascript
// ✅ OK
const [snap1, snap2] = await Promise.all([重要なもの]);
let optSnap;
try { optSnap = await getDocs(...); } catch(e) {}
```

---

### 🔴 GitHub Pages × Firebase Auth の相性問題

**症状：** signInWithRedirect後、ページに戻ってもログイン状態にならない。

**対応：** Stage 0では認証なしで運用。やり方が間違っていた可能性あり→要再検証。

---

### 🔴 Firestore REST APIがClaude環境から叩けない

**対応：** m3の「📋 全データコピー」ボタンでJSONをClaudeに貼る。

---

### 🔴 importしていない関数を使うとサイレントエラー

**症状：** 特定の処理が動かない、catchも実行されない。

**原因：** `getDoc`など必要な関数をimportし忘れていると、その関数を呼んだ瞬間に例外が発生してcatch内でも止まる。

**対応：** 新しい関数を追加したときは必ずimport文を確認する。

---

## 2. アラートデバッグの手順

### 基本の流れ

**Step1: 通常scriptでまず動作確認**
```html
<script>alert("[A-0] 通常scriptOK");</script>
<script type="module">
```
→ A-0が出ない場合はHTML自体の問題。

**Step2: importが全部終わった後にalert**
```javascript
import { db } from "...";
import { getDocs } from "...";
// ↑ import文を全部書いてから
alert("[A-1] import完了");
```

**Step3: 処理ステップごとに番号付きalert**
```javascript
alert("[A-2] 定数定義完了");
alert("[A-3] 関数定義完了");
alert("[A-4] 初期化処理開始");
```

**Step4: catchブロックにもalert**
```javascript
} catch(e) {
  alert("[CATCH] " + colName + ": " + e.message);
}
```

### バージョン管理

更新するたびにアルファベットを変える（A→B→C...）。更新時刻も同時に変更して反映確認に使う。

### 反映確認

ページ右下の「更新: YYYY-MM-DD HH:MM」が変わったら反映済み。変わっていなければキャッシュをクリア（シークレットモードで開くのが確実）。

---

## 3. テスト用データの掃除

lib/test.htmlを実行するたびにab_lib_test_hist・ab_lib_test_hiにデータが蓄積する。
定期的にm3またはlib/test.htmlの「🗑 テストデータをリセット」ボタンで削除する。

```sql
TRUNCATE ab_lib_test_hist
DELETE ab_lib_test_hi id="record"
```
