import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, onSnapshot, addDoc,
  updateDoc, deleteDoc, doc, serverTimestamp, orderBy, query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDuPw8nMuFWx8ghV5ZeBGETeiNII3uk4l8",
  authDomain: "ab01-9f35a.firebaseapp.com",
  projectId: "ab01-9f35a",
  storageBucket: "ab01-9f35a.firebasestorage.app",
  messagingSenderId: "502154862201",
  appId: "1:502154862201:web:4ca0c72225af6bd0147ea8",
  measurementId: "G-4L8FF69B1B"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTIONS = {
  prod: "ab_items2",
  sandbox: "ab_sandbox"
};

let currentMode = "prod";
let unsubscribe = null;

const listEl = document.getElementById("list");
const emptyMsg = document.getElementById("emptyMsg");
const statusEl = document.getElementById("status");
const addBtn = document.getElementById("addBtn");
const newCol1 = document.getElementById("newCol1");
const newCol2 = document.getElementById("newCol2");
const newCol3 = document.getElementById("newCol3");
const subText = document.getElementById("subText");
const sandboxNotice = document.getElementById("sandboxNotice");

window.switchMode = function(mode) {
  if (mode === currentMode) return;
  currentMode = mode;

  document.getElementById("tabProd").classList.toggle("active", mode === "prod");
  document.getElementById("tabSandbox").classList.toggle("active", mode === "sandbox");
  subText.textContent = mode === "prod"
    ? "本番データ（ab_items2）"
    : "実験データ（ab_sandbox）";
  sandboxNotice.classList.toggle("show", mode === "sandbox");

  startListen();
};

function startListen() {
  if (unsubscribe) unsubscribe();
  const colName = COLLECTIONS[currentMode];
  const colRef = collection(db, colName);
  const q = query(colRef, orderBy("createdAt", "asc"));

  statusEl.textContent = "読み込み中...";
  listEl.innerHTML = "";

  unsubscribe = onSnapshot(q, (snapshot) => {
    listEl.innerHTML = "";
    if (snapshot.empty) {
      emptyMsg.style.display = "block";
    } else {
      emptyMsg.style.display = "none";
      snapshot.forEach((docSnap) => renderItem(docSnap.id, docSnap.data()));
    }
    statusEl.textContent = `${snapshot.size} 件 / 接続OK`;
  }, (err) => {
    statusEl.textContent = "接続エラー: " + err.message;
    console.error(err);
  });
}

function renderItem(id, data) {
  const item = document.createElement("div");
  item.className = "item";
  item.dataset.id = id;

  item.innerHTML = `
    <div>
      <span class="col-label">項目</span>
      <input type="text" class="f-col1" value="${escapeAttr(data.col1 || "")}">
    </div>
    <div>
      <span class="col-label">カテゴリ</span>
      <input type="text" class="f-col2" value="${escapeAttr(data.col2 || "")}">
    </div>
    <div>
      <span class="col-label">メモ</span>
      <input type="text" class="f-col3" value="${escapeAttr(data.col3 || "")}">
    </div>
    <div class="actions">
      <button class="btn-save">保存</button>
      <button class="btn-icon btn-delete">削除</button>
    </div>
  `;

  const inputs = item.querySelectorAll("input");
  inputs.forEach((inp) => inp.addEventListener("input", () => item.classList.add("dirty")));

  item.querySelector(".btn-save").addEventListener("click", async () => {
    const col1 = item.querySelector(".f-col1").value;
    const col2 = item.querySelector(".f-col2").value;
    const col3 = item.querySelector(".f-col3").value;
    try {
      await updateDoc(doc(db, COLLECTIONS[currentMode], id), { col1, col2, col3 });
      item.classList.remove("dirty");
    } catch (e) {
      alert("保存失敗: " + e.message);
    }
  });

  item.querySelector(".btn-delete").addEventListener("click", async () => {
    if (!confirm("削除しますか？")) return;
    try {
      await deleteDoc(doc(db, COLLECTIONS[currentMode], id));
    } catch (e) {
      alert("削除失敗: " + e.message);
    }
  });

  listEl.appendChild(item);
}

addBtn.addEventListener("click", async () => {
  const col1 = newCol1.value.trim();
  const col2 = newCol2.value.trim();
  const col3 = newCol3.value.trim();
  if (!col1) { newCol1.focus(); return; }
  try {
    await addDoc(collection(db, COLLECTIONS[currentMode]), {
      col1, col2, col3, createdAt: serverTimestamp()
    });
    newCol1.value = ""; newCol2.value = ""; newCol3.value = "";
    newCol1.focus();
  } catch (e) {
    alert("追加失敗: " + e.message);
  }
});

[newCol1, newCol2, newCol3].forEach((el, i, arr) => {
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (i < arr.length - 1) arr[i + 1].focus();
      else addBtn.click();
    }
  });
});

// 初期起動
startListen();
