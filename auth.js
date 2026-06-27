// auth.js — 共通認証モジュール（ab01-9f35a）
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDuPw8nMuFWx8ghV5ZeBGETeiNII3uk4l8",
  authDomain: "ab01-9f35a.firebaseapp.com",
  projectId: "ab01-9f35a",
  storageBucket: "ab01-9f35a.firebasestorage.app",
  messagingSenderId: "502154862201",
  appId: "1:502154862201:web:4ca0c72225af6bd0147ea8"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

// ログイン画面HTML（未認証時にbodyに挿入）
function renderLoginScreen() {
  document.body.innerHTML = `
    <div style="
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      min-height:100vh; background:#f7f6f3; font-family:-apple-system,BlinkMacSystemFont,'Hiragino Sans','Yu Gothic',sans-serif;
      padding:24px;
    ">
      <div style="font-size:2rem; margin-bottom:16px;">🗂</div>
      <div style="font-size:1.1rem; font-weight:700; color:#2b2b2b; margin-bottom:6px;">ab</div>
      <div style="font-size:0.82rem; color:#7a7568; margin-bottom:32px;">ログインが必要です</div>
      <button id="btnLogin" style="
        display:flex; align-items:center; gap:10px;
        background:#fff; border:1px solid #e2ded6; border-radius:10px;
        padding:13px 22px; font-size:0.92rem; font-weight:600; color:#2b2b2b;
        cursor:pointer; box-shadow:0 1px 4px rgba(0,0,0,0.08);
      ">
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.2 33.6 29.6 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 1.1 8.2 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.8 0 20-7.8 20-21 0-1.4-.1-2.7-.5-4z"/>
          <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.1 13 24 13c3.1 0 6 1.1 8.2 3l6-6C34.5 5.1 29.5 3 24 3c-7.7 0-14.3 4.4-17.7 11.7z"/>
          <path fill="#FBBC05" d="M24 45c5.4 0 10.3-1.8 14.1-5l-6.5-5.3C29.6 36.3 26.9 37 24 37c-5.5 0-10.2-3.4-11.7-8.3l-7 5.4C8.6 40.5 15.8 45 24 45z"/>
          <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-.8 2.3-2.3 4.3-4.2 5.7l6.5 5.3C41.8 36.2 45 30.6 45 24c0-1.4-.1-2.7-.5-4z"/>
        </svg>
        Googleでログイン
      </button>
    </div>
  `;
  document.getElementById("btnLogin").addEventListener("click", async () => {
    alert("ボタン押されました");
    try {
      await signInWithRedirect(auth, new GoogleAuthProvider());
    } catch(e) {
      alert("ログイン失敗: " + e.message);
    }
  });
}

// ログアウトボタンをヘッダーに追加
function renderUserBadge(user) {
  const badge = document.createElement("div");
  badge.id = "auth-badge";
  badge.style.cssText = `
    position:fixed; top:10px; right:12px; z-index:999;
    display:flex; align-items:center; gap:8px;
  `;
  badge.innerHTML = `
    <span style="font-size:0.72rem; color:#7a7568; max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
      ${user.displayName || user.email}
    </span>
    <button id="btnLogout" style="
      font-size:0.7rem; padding:4px 10px; border-radius:6px;
      border:1px solid #e2ded6; background:#fff; color:#7a7568; cursor:pointer;
    ">ログアウト</button>
  `;
  document.body.appendChild(badge);
  document.getElementById("btnLogout").addEventListener("click", () => signOut(auth));
}

/**
 * 認証ガード
 * @param {function} onReady - ログイン済みユーザーを引数に呼ばれるコールバック
 */
export function requireAuth(onReady) {
  // リダイレクト後の結果を処理
  getRedirectResult(auth).catch(() => {});

  onAuthStateChanged(auth, user => {
    const badge = document.getElementById("auth-badge");
    if (badge) badge.remove();

    if (!user) {
      renderLoginScreen();
    } else {
      renderUserBadge(user);
      onReady(user);
    }
  });
}
