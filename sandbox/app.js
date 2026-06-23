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
  const COLLECTION = "ab_items";

  const listEl = document.getElementById("list");
  const emptyMsg = document.getElementById("emptyMsg");
  const statusEl = document.getElementById("status");
  const addBtn = document.getElementById("addBtn");
  const newCol1 = document.getElementById("newCol1");
  const newCol2 = document.getElementById("newCol2");
  const newCol3 = document.getElementById("newCol3");

  const colRef = collection(db, COLLECTION);
  const q = query(colRef, orderBy("createdAt", "asc"));

  onSnapshot(q, (snapshot) => {
    listEl.innerHTML = "";
    if (snapshot.empty) {
      emptyMsg.style.display = "block";
    } else {
      emptyMsg.style.display = "none";
      snapshot.forEach((docSnap) => {
        renderItem(docSnap.id, docSnap.data());
      });
    }
    statusEl.textContent = `${snapshot.size} 件 / 接続OK`;
  }, (err) => {
    statusEl.textContent = "接続エラー: " + err.message;
    console.error(err);
  });

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
    inputs.forEach((inp) => {
      inp.addEventListener("input", () => item.classList.add("dirty"));
    });

    item.querySelector(".btn-save").addEventListener("click", async () => {
      const col1 = item.querySelector(".f-col1").value;
      const col2 = item.querySelector(".f-col2").value;
      const col3 = item.querySelector(".f-col3").value;
      await updateDoc(doc(db, COLLECTION, id), { col1, col2, col3 });
      item.classList.remove("dirty");
    });

    item.querySelector(".btn-delete").addEventListener("click", async () => {
      if (confirm("削除しますか？")) {
        await deleteDoc(doc(db, COLLECTION, id));
      }
    });

    listEl.appendChild(item);
  }

  addBtn.addEventListener("click", async () => {
    const col1 = newCol1.value.trim();
    const col2 = newCol2.value.trim();
    const col3 = newCol3.value.trim();
    if (!col1 && !col2 && !col3) return;
    await addDoc(colRef, { col1, col2, col3, createdAt: serverTimestamp() });
    newCol1.value = "";
    newCol2.value = "";
    newCol3.value = "";
    newCol1.focus();
  });

  [newCol1, newCol2, newCol3].forEach((inp) => {
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") addBtn.click();
    });
  });

  function escapeAttr(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
