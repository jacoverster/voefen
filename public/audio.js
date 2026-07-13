/**
 * Beeps (Web Audio API) + optional spoken cues (SpeechSynthesis).
 * Works best after a user gesture (Start) unlocks audio on TVs/browsers.
 */
window.WorkoutAudio = (function () {
  let ctx = null;
  let beepsEnabled = true;
  let voiceEnabled = true;
  let unlocked = false;

  function loadPrefs() {
    try {
      const b = localStorage.getItem("fw_beeps");
      const v = localStorage.getItem("fw_voice");
      if (b !== null) beepsEnabled = b === "1";
      if (v !== null) voiceEnabled = v === "1";
    } catch (_) {
      /* ignore */
    }
  }

  function savePrefs() {
    try {
      localStorage.setItem("fw_beeps", beepsEnabled ? "1" : "0");
      localStorage.setItem("fw_voice", voiceEnabled ? "1" : "0");
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

  function unlock() {
    unlocked = true;
    ensureCtx();
    // Prime speech on some browsers
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
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

  function speak(text, opts) {
    if (!voiceEnabled || !unlocked) return;
    if (!window.speechSynthesis || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = (opts && opts.rate) || 1.0;
      u.pitch = 1.0;
      u.volume = 1.0;
      // Prefer an English voice if available
      const voices = window.speechSynthesis.getVoices();
      const en =
        voices.find((v) => /en(-|_)?US/i.test(v.lang) && /google|natural|premium|enhanced/i.test(v.name)) ||
        voices.find((v) => /^en/i.test(v.lang));
      if (en) u.voice = en;
      window.speechSynthesis.speak(u);
    } catch (_) {
      /* speech may be unsupported on some TV browsers */
    }
  }

  function stopSpeak() {
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
  }

  function setBeeps(on) {
    beepsEnabled = !!on;
    savePrefs();
  }

  function setVoice(on) {
    voiceEnabled = !!on;
    if (!on) stopSpeak();
    savePrefs();
  }

  function getBeeps() {
    return beepsEnabled;
  }

  function getVoice() {
    return voiceEnabled;
  }

  loadPrefs();

  // Chrome loads voices async
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = function () {};
  }

  return {
    unlock,
    tick,
    workStart,
    restStart,
    complete,
    speak,
    stopSpeak,
    setBeeps,
    setVoice,
    getBeeps,
    getVoice,
  };
})();
