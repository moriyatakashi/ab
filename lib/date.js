/**
 * lib/date.js
 * 日付関連の共通ヘルパー
 */

/** ローカル日付を YYYY-MM-DD 形式で返す（引数省略時は現在時刻） */
export function todayStr(d = new Date()) {
  return d.toLocaleDateString("sv-SE");
}
