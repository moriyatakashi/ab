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
    this.db       = db || _defaultDb;
    this.histCol  = histCol;
    this.hiDocPath = hiDocPath;
    this.hiScore  = 0;
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
