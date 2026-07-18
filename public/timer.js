/**
 * Step countdown for Voefen.
 *
 * Absolute Date.now() deadline + recursive setTimeout (more reliable than
 * setInterval on Samsung Tizen). Completion is always deferred so we never
 * clear/restart the loop from inside its own callback.
 */
window.VoefenTimer = (function () {
  "use strict";

  const TICK_MS = 200;

  let timeoutId = null;
  let running = false;
  let stepTotalMs = 0;
  let remainingMs = 0;
  let stepEndsAt = 0;
  let sessionStartedAt = 0;
  let elapsedOffsetMs = 0;
  let runningElapsedMs = 0;
  let paused = false;
  let pauseAllowedAt = 0;
  /** Prevents double-fire when remaining hits 0 */
  let completePending = false;

  /** @type {null | (() => void)} */
  let onComplete = null;
  /** @type {null | ((state: object) => void)} */
  let onPaint = null;

  function now() {
    return Date.now();
  }

  function snapshot() {
    return {
      remainingMs: remainingMs,
      stepTotalMs: stepTotalMs,
      runningElapsedMs: runningElapsedMs,
      paused: paused,
    };
  }

  function paint() {
    if (onPaint) {
      try {
        onPaint(snapshot());
      } catch (err) {
        if (typeof console !== "undefined" && console.warn) {
          console.warn("VoefenTimer paint error", err);
        }
      }
    }
  }

  function syncFromDeadline() {
    if (paused || stepEndsAt <= 0) return;
    var t = now();
    remainingMs = Math.max(0, stepEndsAt - t);
    if (sessionStartedAt > 0) {
      runningElapsedMs = elapsedOffsetMs + Math.max(0, t - sessionStartedAt);
    }
  }

  function clearSchedule() {
    if (timeoutId != null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  function scheduleNext() {
    clearSchedule();
    if (!running) return;
    timeoutId = setTimeout(onScheduledTick, TICK_MS);
  }

  function onScheduledTick() {
    timeoutId = null;
    if (!running) return;
    tick();
    // Always reschedule while session is live (including while paused)
    if (running) scheduleNext();
  }

  function tick() {
    if (!running || paused || completePending) return;

    syncFromDeadline();
    paint();

    if (remainingMs <= 0 && stepEndsAt > 0) {
      completePending = true;
      stepEndsAt = 0;
      remainingMs = 0;
      paint();
      // Defer: never invoke advance/start from inside the timeout callback stack
      setTimeout(function () {
        try {
          if (onComplete) onComplete();
        } catch (err) {
          if (typeof console !== "undefined" && console.warn) {
            console.warn("VoefenTimer complete error", err);
          }
        } finally {
          completePending = false;
        }
      }, 0);
    }
  }

  function start() {
    running = true;
    if (!paused && sessionStartedAt <= 0) {
      sessionStartedAt = now();
    }
    // Immediate paint + schedule (do not rely on setInterval)
    if (!paused) {
      syncFromDeadline();
      paint();
    }
    scheduleNext();
    // Second immediate tick after a frame so first second is never sticky on TVs
    setTimeout(function () {
      if (running && !paused) tick();
    }, 50);
  }

  function stop() {
    running = false;
    completePending = false;
    clearSchedule();
  }

  function isRunning() {
    return running;
  }

  /** Begin a step lasting `seconds`. */
  function armStep(seconds) {
    var secs = Math.max(1, Number(seconds) || 40);
    stepTotalMs = secs * 1000;
    remainingMs = stepTotalMs;
    stepEndsAt = now() + stepTotalMs;
    completePending = false;
    if (!paused && sessionStartedAt <= 0) {
      sessionStartedAt = now();
    }
    paint();
  }

  function resetSession() {
    stop();
    paused = false;
    elapsedOffsetMs = 0;
    runningElapsedMs = 0;
    sessionStartedAt = 0;
    stepEndsAt = 0;
    remainingMs = 0;
    stepTotalMs = 0;
    completePending = false;
    pauseAllowedAt = now() + 900;
  }

  /**
   * @param {boolean} next
   * @param {{ force?: boolean }} [opts] force=true skips the post-Start grace period
   *   (use for deliberate Pause button clicks).
   */
  function setPaused(next, opts) {
    next = !!next;
    if (next === paused) return paused;
    // Block accidental remote pause right after Start (OK keyup → Pause focus)
    if (next && !paused && !(opts && opts.force) && now() < pauseAllowedAt) {
      return paused;
    }

    paused = next;
    if (paused) {
      if (stepEndsAt > 0) remainingMs = Math.max(0, stepEndsAt - now());
      if (sessionStartedAt > 0) {
        runningElapsedMs = elapsedOffsetMs + Math.max(0, now() - sessionStartedAt);
      }
      elapsedOffsetMs = runningElapsedMs;
      sessionStartedAt = 0;
      stepEndsAt = 0;
      paint();
    } else {
      stepEndsAt = now() + Math.max(0, remainingMs);
      sessionStartedAt = now();
      if (!running) start();
      else {
        syncFromDeadline();
        paint();
        scheduleNext();
      }
    }
    return paused;
  }

  function togglePause(opts) {
    return setPaused(!paused, opts);
  }

  function isPaused() {
    return paused;
  }

  /** Carry elapsed into the next step; call before armStep when advancing. */
  function carryElapsed() {
    if (!paused) {
      if (sessionStartedAt > 0) {
        runningElapsedMs = elapsedOffsetMs + Math.max(0, now() - sessionStartedAt);
      }
      elapsedOffsetMs = runningElapsedMs;
      // Force next armStep/start to open a new elapsed segment
      sessionStartedAt = 0;
    }
  }

  function getElapsedMs() {
    if (!paused && sessionStartedAt > 0) {
      return elapsedOffsetMs + Math.max(0, now() - sessionStartedAt);
    }
    return runningElapsedMs;
  }

  /** After TV sleep: do not count suspended time as workout. */
  function rearmAfterWake() {
    if (paused) return;
    runningElapsedMs = getElapsedMs();
    elapsedOffsetMs = runningElapsedMs;
    sessionStartedAt = now();
    if (remainingMs > 0) stepEndsAt = now() + remainingMs;
    if (!running) start();
    else {
      paint();
      scheduleNext();
    }
  }

  function configure(opts) {
    if (opts && typeof opts.onComplete === "function") onComplete = opts.onComplete;
    if (opts && typeof opts.onPaint === "function") onPaint = opts.onPaint;
  }

  return {
    configure: configure,
    start: start,
    stop: stop,
    isRunning: isRunning,
    armStep: armStep,
    resetSession: resetSession,
    setPaused: setPaused,
    togglePause: togglePause,
    isPaused: isPaused,
    /** Clear post-Start grace so the next pause is allowed immediately. */
    allowPauseNow: function () {
      pauseAllowedAt = 0;
    },
    carryElapsed: carryElapsed,
    getElapsedMs: getElapsedMs,
    rearmAfterWake: rearmAfterWake,
    snapshot: snapshot,
  };
})();
