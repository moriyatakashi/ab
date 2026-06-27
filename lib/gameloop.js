/**
 * lib/gameloop.js
 * requestAnimationFrameベースのゲームループ管理
 *
 * 使い方:
 *   import { GameLoop } from "../lib/gameloop.js";
 *   const loop = new GameLoop({
 *     update: (dt) => { ... },  // dt: 経過ミリ秒
 *     draw:   ()   => { ... }
 *   });
 *   loop.start();
 *   loop.stop();
 */
export class GameLoop {
  /**
   * @param {object} options
   * @param {function} options.update - 毎フレーム呼ばれる更新関数(dt: ms)
   * @param {function} options.draw   - 毎フレーム呼ばれる描画関数
   * @param {number}   options.maxDt  - dtの上限(ms)。タブ非アクティブ復帰時の暴走防止（デフォルト100）
   */
  constructor({ update, draw, maxDt = 100 }) {
    this._update  = update;
    this._draw    = draw;
    this._maxDt   = maxDt;
    this._frameId = null;
    this._lastTs  = null;
    this._running = false;
    this._tick    = this._tick.bind(this);
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._lastTs  = performance.now();
    this._frameId = requestAnimationFrame(this._tick);
  }

  stop() {
    this._running = false;
    if (this._frameId) cancelAnimationFrame(this._frameId);
    this._frameId = null;
  }

  get running() { return this._running; }

  _tick(ts) {
    if (!this._running) return;
    const dt = Math.min(ts - this._lastTs, this._maxDt);
    this._lastTs = ts;
    this._update(dt);
    this._draw();
    this._frameId = requestAnimationFrame(this._tick);
  }
}
