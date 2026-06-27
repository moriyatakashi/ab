/**
 * lib/input.js
 * タッチ・キーボード入力管理
 *
 * 使い方:
 *   import { Input } from "../lib/input.js";
 *   const input = new Input();
 *   input.bind("btnLeft",  "left");
 *   input.bind("btnRight", "right");
 *   input.bind("btnFire",  "fire");
 *   // ゲームループ内で
 *   if (input.keys.left) { ... }
 *
 * キーボードマッピングはコンストラクタで渡す（省略時はデフォルト）
 */
export class Input {
  /**
   * @param {object} keyMap - { キー名: [KeyboardEventのkey文字列, ...] }
   */
  constructor(keyMap = {}) {
    this.keys = {};
    this._keyMap = Object.assign({
      left:  ["ArrowLeft"],
      right: ["ArrowRight"],
      fire:  [" ", "z", "Z"],
      jump:  [" ", "ArrowUp", "z", "Z"]
    }, keyMap);
    this._initKeyboard();
  }

  /** ボタン要素とキー名を紐付け（タッチ＋マウス両対応） */
  bind(elementId, keyName) {
    const btn = document.getElementById(elementId);
    if (!btn) return;
    const set = (v) => () => {
      this.keys[keyName] = v;
      btn.classList.toggle("on", v);
      btn.classList.toggle("pressed", v);
    };
    ["touchstart", "mousedown"].forEach(ev =>
      btn.addEventListener(ev, e => { e.preventDefault(); set(true)(); }, { passive: false })
    );
    ["touchend", "mouseup", "mouseleave"].forEach(ev =>
      btn.addEventListener(ev, e => { e.preventDefault(); set(false)(); }, { passive: false })
    );
  }

  /** キーボードイベントを登録 */
  _initKeyboard() {
    const getKey = (e) => {
      for (const [name, keys] of Object.entries(this._keyMap)) {
        if (keys.includes(e.key)) return name;
      }
      return null;
    };
    document.addEventListener("keydown", e => {
      const k = getKey(e);
      if (k) this.keys[k] = true;
    });
    document.addEventListener("keyup", e => {
      const k = getKey(e);
      if (k) this.keys[k] = false;
    });
  }

  /** 全キーをリセット */
  reset() {
    Object.keys(this.keys).forEach(k => this.keys[k] = false);
  }
}
