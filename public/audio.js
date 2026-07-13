/**
 * Beeps via Web Audio API.
 * Unlocked on a user gesture (Start / Settings) — required by most browsers/TVs.
 */
window.WorkoutAudio = (function () {
  let ctx = null;
  let beepsEnabled = true;
  let unlocked = false;

  function loadPrefs() {
    try {
      const b = localStorage.getItem("fw_beeps");
      if (b !== null) beepsEnabled = b === "1";
    } catch (_) {
      /* ignore */
    }
  }

  function savePrefs() {
    try {
      localStorage.setItem("fw_beeps", beepsEnabled ? "1" : "0");
    } catch (_) {
      /* ignore */
    }
  }

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  /** Call from a user gesture so audio is allowed. */
  function unlock() {
    unlocked = true;
    ensureCtx();
  }

  function tone(freq, duration, type, gainValue, when) {
    if (!beepsEnabled) return;
    const c = ensureCtx();
    if (!c || !unlocked) return;

    const t0 = when != null ? when : c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(gainValue || 0.2, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  /** Short tick for each countdown second in last 3s */
  function tick() {
    tone(880, 0.08, "sine", 0.15);
  }

  /** Start of a work interval */
  function workStart() {
    const c = ensureCtx();
    if (!c || !unlocked || !beepsEnabled) return;
    const t = c.currentTime;
    tone(523.25, 0.12, "sine", 0.22, t);
    tone(659.25, 0.12, "sine", 0.22, t + 0.12);
    tone(783.99, 0.18, "sine", 0.22, t + 0.24);
  }

  /** End of interval / rest start */
  function restStart() {
    const c = ensureCtx();
    if (!c || !unlocked || !beepsEnabled) return;
    const t = c.currentTime;
    tone(440, 0.15, "triangle", 0.18, t);
    tone(330, 0.2, "triangle", 0.18, t + 0.16);
  }

  /** Workout complete fanfare */
  function complete() {
    const c = ensureCtx();
    if (!c || !unlocked || !beepsEnabled) return;
    const t = c.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      tone(f, 0.22, "sine", 0.25, t + i * 0.14);
    });
  }

  function setBeeps(on) {
    beepsEnabled = !!on;
    savePrefs();
  }

  function getBeeps() {
    return beepsEnabled;
  }

  loadPrefs();

  return {
    unlock,
    tick,
    workStart,
    restStart,
    complete,
    setBeeps,
    getBeeps,
  };
})();
