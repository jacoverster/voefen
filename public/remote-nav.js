/**
 * TV remote / keyboard spatial navigation.
 * One capture-phase keydown listener (no double registration).
 */
window.VoefenRemoteNav = (function () {
  "use strict";

  /** @type {null | (() => string)} returns active screen name */
  let getScreen = null;
  /** @type {null | ((action: string) => void)} */
  let onAction = null;

  function focusables() {
    const screen = document.querySelector(".screen.active");
    if (!screen) return [];
    return Array.prototype.slice
      .call(
        screen.querySelectorAll(
          "button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])"
        )
      )
      .filter(function (el) {
        if (el.getAttribute("aria-hidden") === "true") return false;
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") return false;
        const r = el.getBoundingClientRect();
        return r.width > 2 && r.height > 2;
      });
  }

  function focusEl(el) {
    if (!el) return;
    try {
      el.focus({ preventScroll: true });
    } catch (_) {
      try {
        el.focus();
      } catch (__) {
        /* ignore */
      }
    }
    try {
      el.scrollIntoView({ block: "nearest", inline: "nearest" });
    } catch (_) {
      /* ignore */
    }
  }

  function ensureFocus() {
    const list = focusables();
    if (!list.length) return;
    if (list.indexOf(document.activeElement) < 0) focusEl(list[0]);
  }

  function moveFocus(dx, dy) {
    const list = focusables();
    if (!list.length) return;

    document.body.classList.add("using-dpad");

    const active = document.activeElement;
    const idx = list.indexOf(active);
    if (idx < 0) {
      focusEl(list[0]);
      return;
    }

    const cur = active.getBoundingClientRect();
    const cx = cur.left + cur.width / 2;
    const cy = cur.top + cur.height / 2;

    let best = null;
    let bestScore = Infinity;

    for (let i = 0; i < list.length; i++) {
      if (i === idx) continue;
      const el = list[i];
      const r = el.getBoundingClientRect();
      const ex = r.left + r.width / 2;
      const ey = r.top + r.height / 2;
      const ddx = ex - cx;
      const ddy = ey - cy;

      if (dx > 0 && ddx < 8) continue;
      if (dx < 0 && ddx > -8) continue;
      if (dy > 0 && ddy < 8) continue;
      if (dy < 0 && ddy > -8) continue;

      let primary;
      let secondary;
      if (dx !== 0) {
        primary = Math.abs(ddx);
        secondary = Math.abs(ddy);
        if (secondary > primary * 1.8 + cur.height) continue;
      } else {
        primary = Math.abs(ddy);
        secondary = Math.abs(ddx);
        if (secondary > primary * 1.8 + cur.width) continue;
      }

      const score = primary + secondary * 2.2;
      if (score < bestScore) {
        bestScore = score;
        best = el;
      }
    }

    if (best) {
      focusEl(best);
      return;
    }

    const step = dx !== 0 ? dx : dy > 0 ? 1 : -1;
    const next = Math.max(0, Math.min(list.length - 1, idx + step));
    if (next !== idx) focusEl(list[next]);
  }

  function mapKey(e) {
    const key = e.key;
    const code = e.keyCode || e.which || 0;
    if (key === "ArrowRight" || code === 39) return "right";
    if (key === "ArrowLeft" || code === 37) return "left";
    if (key === "ArrowDown" || code === 40) return "down";
    if (key === "ArrowUp" || code === 38) return "up";
    if (
      key === "Enter" ||
      key === "Accept" ||
      key === "Select" ||
      code === 13 ||
      code === 23 ||
      code === 66
    ) {
      return "enter";
    }
    if (
      key === " " ||
      key === "MediaPlayPause" ||
      key === "MediaPlay" ||
      key === "MediaPause" ||
      code === 32 ||
      code === 179 ||
      code === 19 ||
      code === 415 ||
      code === 10252
    ) {
      return "pause";
    }
    if (
      key === "Escape" ||
      key === "GoBack" ||
      key === "BrowserBack" ||
      code === 27 ||
      code === 10009 ||
      code === 461
    ) {
      return "back";
    }
    return null;
  }

  function typingInNameField() {
    const el = document.activeElement;
    return el && el.tagName === "INPUT" && el.classList.contains("crew-name");
  }

  function onKeydown(e) {
    const action = mapKey(e);
    if (!action) return;

    const screen = getScreen ? getScreen() : "";

    // Caret in name field: leave left/right to the browser
    if (typingInNameField() && (action === "left" || action === "right")) return;

    if (action === "left" || action === "right" || action === "up" || action === "down") {
      e.preventDefault();
      e.stopPropagation();
      ensureFocus();
      if (action === "right") moveFocus(1, 0);
      else if (action === "left") moveFocus(-1, 0);
      else if (action === "down") moveFocus(0, 1);
      else moveFocus(0, -1);
      return;
    }

    if (action === "enter") {
      const active = document.activeElement;
      if (active && active.tagName === "INPUT") {
        e.preventDefault();
        active.blur();
        moveFocus(0, 1);
        return;
      }
      if (active && active.tagName === "BUTTON" && !active.disabled) {
        e.preventDefault();
        e.stopPropagation();
        active.click();
      }
      return;
    }

    // App-level actions (pause / back) — only when screen cares
    if (onAction) {
      if (action === "pause" || action === "back") {
        // Prevent Space from also synthesizing a click on the focused button
        // (would double-toggle Pause → Resume → Pause with no visible change)
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === "function") {
          e.stopImmediatePropagation();
        }
        onAction(action, screen);
      }
    }
  }

  function onKeyup(e) {
    const action = mapKey(e);
    // Space activates buttons on keyup in HTML — block that during workout
    // so we only handle pause once on keydown.
    if (action === "pause") {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === "function") {
        e.stopImmediatePropagation();
      }
    }
  }

  function init(opts) {
    getScreen = opts && opts.getScreen;
    onAction = opts && opts.onAction;
    document.addEventListener("keydown", onKeydown, true);
    document.addEventListener("keyup", onKeyup, true);
    document.addEventListener(
      "pointermove",
      function () {
        document.body.classList.remove("using-dpad");
      },
      { passive: true }
    );
  }

  function focus(el) {
    focusEl(el);
  }

  return {
    init: init,
    focus: focus,
    moveFocus: moveFocus,
    ensureFocus: ensureFocus,
  };
})();
