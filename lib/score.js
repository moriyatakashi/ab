/**
 * lib/score.js
 * Firestoreへのスコア保存・最高得点管理・履歴読み込み
 *
 * 使い方:
 *   import { ScoreManager } from "../lib/score.js";
 *   const sm = new ScoreManager(db, "ab_invader_history", "ab_invader_hi");
 *   await sm.loadHi();           // 最高得点を読み込む
 *   await sm.saveResult(score, { wave: 3 });  // スコアと任意の追加データを保存
 *   await sm.loadHistory(10);    // 直近10件を返す
 */
import { db as _defaultDb } from "./firebase.js";
import {
  collection, addDoc, getDocs, doc, setDoc, getDoc, orderBy, query, limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export class ScoreManager {
  /**
   * @param {object} db        - Firestoreインスタンス（省略時はfirebase.jsのdb）
   * @param {string} histCol   - 履歴コレクション名
   * @param {string} hiDocPath - 最高得点ドキュメントパス（コレクション名）
   */
  constructor(db, histCol, hiDocPath) {
    if (histCol === undefined || histCol === null)
      throw new TypeError("[ScoreManager] histCol は必須です");
    if (typeof histCol !== "string" || histCol.trim() === "")
      throw new TypeError("[ScoreManager] histCol は空でない文字列である必要があります");
    if (hiDocPath === undefined || hiDocPath === null)
      throw new TypeError("[ScoreManager] hiDocPath は必須です");
    if (typeof hiDocPath !== "string" || hiDocPath.trim() === "")
      throw new TypeError("[ScoreManager] hiDocPath は空でない文字列である必要があります");

    this.db        = db || _defaultDb;
    this.histCol   = histCol;
    this.hiDocPath = hiDocPath;
    this.hiScore   = 0;
  }

  /** Firestoreから最高得点を読み込む */
  async loadHi() {
    try {
      const d = await getDoc(doc(this.db, this.hiDocPath, "record"));
      if (d.exists()) this.hiScore = d.data().score || 0;
    } catch(e) {
      console.warn("[score.js] loadHi failed:", e.message);
    }
    return this.hiScore;
  }

  /**
   * スコアを保存し、最高得点を更新する
   * @param {number} score
   * @param {object} extra - 追加で保存したいデータ（wave, level, coins 等）
   */
  async saveResult(score, extra = {}) {
    if (score === undefined || score === null)
      throw new TypeError("[ScoreManager] score は必須です");
    if (typeof score !== "number" || isNaN(score))
      throw new TypeError("[ScoreManager] score は数値である必要があります (受け取った値: " + JSON.stringify(score) + ")");
    if (score < 0)
      throw new RangeError("[ScoreManager] score は0以上である必要があります (受け取った値: " + score + ")");
    if (!Number.isFinite(score))
      throw new RangeError("[ScoreManager] score は有限の数値である必要があります");
    if (extra !== null && typeof extra !== "object")
      throw new TypeError("[ScoreManager] extra はオブジェクトである必要があります");

    const date = new Date().toLocaleDateString("sv-SE");
    try {
      await addDoc(collection(this.db, this.histCol), {
        score, date,
        createdAt: new Date().toISOString(),
        ...extra
      });
      if (score > this.hiScore) {
        this.hiScore = score;
        await setDoc(doc(this.db, this.hiDocPath, "record"), { score, date });
      }
    } catch(e) {
      console.warn("[score.js] saveResult failed:", e.message);
    }
    return this.hiScore;
  }

  /**
   * 履歴を取得して返す
   * @param {number} n - 件数（デフォルト10）
   * @returns {Array} - { score, date, createdAt, ...extra } の配列
   */
  async loadHistory(n = 10) {
    if (typeof n !== "number" || !Number.isInteger(n) || n <= 0)
      throw new RangeError("[ScoreManager] n は正の整数である必要があります (受け取った値: " + JSON.stringify(n) + ")");

    try {
      const q = query(
        collection(this.db, this.histCol),
        orderBy("createdAt", "desc"),
        limit(n)
      );
      const snap = await getDocs(q);
      const rows = [];
      snap.forEach(d => rows.push({ id: d.id, ...d.data() }));
      return rows;
    } catch(e) {
      console.warn("[score.js] loadHistory failed:", e.message);
      return [];
    }
  }
}
