(function () {
  "use strict";

  const Audio = window.WorkoutAudio;
  const family = window.FAMILY || [];
  const workouts = window.WORKOUTS || [];

  const $ = (id) => document.getElementById(id);

  const screens = {
    home: $("screen-home"),
    workout: $("screen-workout"),
    done: $("screen-done"),
  };

  const els = {
    familyRow: $("family-row"),
    workoutPicker: $("workout-picker"),
    brandNum: $("brand-num"),
    metaLine: $("meta-line"),
    settingsPanel: $("settings-panel"),
    btnStart: $("btn-start"),
    btnSettings: $("btn-settings"),
    btnBeeps: $("btn-beeps"),
    btnFullscreen: $("btn-fullscreen"),
    blockLabel: $("block-label"),
    progressFill: $("progress-fill"),
    progressText: $("progress-text"),
    elapsedText: $("elapsed-text"),
    stage: $("stage"),
    iconWrap: $("icon-wrap"),
    exerciseName: $("exercise-name"),
    exerciseCue: $("exercise-cue"),
    timerRing: $("timer-ring"),
    timerDigits: $("timer-digits"),
    timerLabel: $("timer-label"),
    nextPreview: $("next-preview"),
    tipEasy: $("tip-easy"),
    tipHard: $("tip-hard"),
    tipEasyBody: $("tip-easy-body"),
    tipHardBody: $("tip-hard-body"),
    pausedBanner: $("paused-banner"),
    btnPause: $("btn-pause"),
    btnSkip: $("btn-skip"),
    btnPrev: $("btn-prev"),
    btnEnd: $("btn-end"),
    btnMute: $("btn-mute"),
    btnAgain: $("btn-again"),
    btnHome: $("btn-home"),
    doneStats: $("done-stats"),
    doneFamily: $("done-family"),
  };

  let selectedId = null;
  let workout = null;
  let playlist = [];
  let totalWorkSeconds = 0;

  let index = 0;
  let remainingMs = 0;
  let stepTotalMs = 0;
  let paused = false;
  let rafId = null;
  let lastTs = 0;
  let sessionStartedAt = 0;
  let elapsedOffsetMs = 0;
  let runningElapsedMs = 0;
  let lastTickSecond = null;

  function loadSelectedId() {
    try {
      return localStorage.getItem("fw_workout_id");
    } catch (_) {
      return null;
    }
  }

  function saveSelectedId(id) {
    try {
      localStorage.setItem("fw_workout_id", id);
    } catch (_) {
      /* ignore */
    }
  }

  function selectWorkout(id) {
    const next = window.getWorkoutById(id) || workouts[0];
    if (!next) return;
    selectedId = next.id;
    workout = next;
    const built = window.buildPlaylist(workout);
    playlist = built.playlist;
    totalWorkSeconds = built.totalWorkSeconds;
    saveSelectedId(selectedId);
    updatePickerUI();
    updateHomeMeta();
  }

  function updateHomeMeta() {
    if (!workout) return;
    const mins =
      (window.workoutDurationMinutes && window.workoutDurationMinutes(workout)) ||
      workout.durationMinutes ||
      Math.round(totalWorkSeconds / 60);
    const rounds =
      (workout.circuit && workout.circuit.rounds) ||
      (workout.circuit && workout.circuit.exercises ? 3 : 0);
    if (els.brandNum) els.brandNum.textContent = String(mins);
    if (els.metaLine) {
      const roundBit = rounds ? `${rounds} rounds · ` : "";
      els.metaLine.textContent = `${mins} min · ${roundBit}bodyweight · easy & hard`;
    }
    const sub = document.getElementById("home-subtitle");
    if (sub) {
      sub.textContent = `${workout.title} — ${workout.tagline}`;
    }
  }

  function updatePickerUI() {
    if (!els.workoutPicker) return;
    els.workoutPicker.querySelectorAll(".workout-card").forEach((btn) => {
      const on = btn.dataset.id === selectedId;
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function renderWorkoutPicker() {
    if (!els.workoutPicker) return;
    els.workoutPicker.innerHTML = workouts
      .map((w) => {
        const selected = w.id === selectedId;
        const mins =
          (window.workoutDurationMinutes && window.workoutDurationMinutes(w)) ||
          w.durationMinutes ||
          "?";
        const rounds = (w.circuit && w.circuit.rounds) || 0;
        return (
          `<button type="button" class="workout-card" role="option" data-id="${w.id}" ` +
          `aria-selected="${selected ? "true" : "false"}">` +
          `<span class="w-emoji" aria-hidden="true">${w.emoji || "💪"}</span>` +
          `<span class="w-title">${w.title}</span>` +
          `<span class="w-meta">${mins} min · ${rounds} rounds · ${w.tagline}</span>` +
          `</button>`
        );
      })
      .join("");

    els.workoutPicker.querySelectorAll(".workout-card").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectWorkout(btn.dataset.id);
        btn.focus();
      });
    });
  }

  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      el.classList.toggle("active", key === name);
    });
    requestAnimationFrame(() => {
      if (name === "home") els.btnStart.focus();
      else if (name === "workout") els.btnPause.focus();
      else if (name === "done") els.btnAgain.focus();
    });
  }

  function formatTime(totalSeconds) {
    const s = Math.max(0, Math.ceil(totalSeconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m > 0 ? `${m}:${String(r).padStart(2, "0")}` : String(r);
  }

  function formatClock(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  }

  function setToggle(btn, on) {
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    const label = btn.dataset.label || btn.textContent;
    btn.textContent = `${label}: ${on ? "On" : "Off"}`;
  }

  function familyNamesLine() {
    const names = family.map((p) => p.label);
    if (names.length <= 1) return names[0] || "family";
    if (names.length === 2) return `${names[0]} & ${names[1]}`;
    return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
  }

  function renderFamily() {
    els.familyRow.innerHTML = family
      .map((p) => {
        const color = p.color || "#5ec8ff";
        return (
          `<div class="family-chip" style="--chip-color:${color}">` +
          `<div class="badge" aria-hidden="true">${p.emoji || "🙂"}</div>` +
          `<span class="label">${p.label}</span>` +
          `</div>`
        );
      })
      .join("");
  }

  function renderStep() {
    const step = playlist[index];
    if (!step) {
      finishWorkout();
      return;
    }

    const isRest = step.type === "rest";
    const isBreak = step.blockKind === "break";
    const isCooldown = step.blockKind === "cooldown";

    document.documentElement.style.setProperty("--block-color", step.blockColor);
    document.documentElement.style.setProperty(
      "--timer-color",
      isRest ? "#8b93a7" : step.blockColor
    );

    els.blockLabel.textContent = step.blockName;
    els.exerciseName.textContent = step.name;
    els.exerciseCue.textContent = step.cue || "";
    els.iconWrap.textContent = isRest ? "😌" : step.emoji || "💪";

    els.stage.classList.toggle("rest-mode", isRest);
    els.stage.classList.toggle("break-mode", isBreak && !isRest);
    els.stage.classList.toggle("cooldown-mode", isCooldown && !isRest);

    let label = "Work";
    let labelClass = "work";
    if (isRest) {
      label = "Rest";
      labelClass = "rest";
    } else if (isBreak) {
      label = "Break";
      labelClass = "break";
    } else if (isCooldown) {
      label = "Stretch";
      labelClass = "cooldown";
    }
    els.timerLabel.textContent = label;
    els.timerLabel.className = "phase-pill " + labelClass;

    if (isRest || !step.easy) {
      els.tipEasy.classList.add("hidden");
      els.tipHard.classList.add("hidden");
    } else {
      els.tipEasy.classList.remove("hidden");
      els.tipHard.classList.remove("hidden");
      els.tipEasyBody.textContent = step.easy;
      els.tipHardBody.textContent = step.hard;
    }

    const next = playlist[index + 1];
    if (isRest && step.nextName) {
      els.nextPreview.innerHTML = `Coming up: <strong>${step.nextName}</strong>`;
    } else if (next) {
      const nlabel = next.type === "rest" ? next.nextName || "Rest" : next.name;
      els.nextPreview.innerHTML =
        next.type === "rest" && next.nextName
          ? `Then rest → <strong>${next.nextName}</strong>`
          : `Next: <strong>${nlabel}</strong>`;
    } else {
      els.nextPreview.innerHTML = `<strong>Final stretch!</strong>`;
    }

    const pct = (index / playlist.length) * 100;
    els.progressFill.style.width = `${pct}%`;
    els.progressText.textContent = `${index + 1} / ${playlist.length}`;

    stepTotalMs = step.seconds * 1000;
    remainingMs = stepTotalMs;
    lastTickSecond = null;
    updateTimerDisplay();

    if (isRest || isBreak) {
      Audio.restStart();
    } else {
      Audio.workStart();
    }
  }

  function updateTimerDisplay() {
    const secs = remainingMs / 1000;
    els.timerDigits.textContent = formatTime(secs);

    const p = stepTotalMs > 0 ? ((stepTotalMs - remainingMs) / stepTotalMs) * 100 : 0;
    els.timerRing.style.setProperty("--p", String(Math.min(100, Math.max(0, p))));

    const whole = Math.ceil(secs);
    const urgent = whole <= 3 && whole > 0 && !paused;
    els.timerDigits.classList.toggle("urgent", urgent);

    if (urgent && lastTickSecond !== whole) {
      lastTickSecond = whole;
      Audio.tick();
    }

    els.elapsedText.textContent = formatClock(runningElapsedMs);
  }

  function loop(ts) {
    if (!lastTs) lastTs = ts;
    const dt = ts - lastTs;
    lastTs = ts;

    if (!paused) {
      remainingMs -= dt;
      runningElapsedMs = elapsedOffsetMs + (performance.now() - sessionStartedAt);

      if (remainingMs <= 0) {
        remainingMs = 0;
        updateTimerDisplay();
        advance(1);
        return;
      }
      updateTimerDisplay();
    }

    rafId = requestAnimationFrame(loop);
  }

  function startLoop() {
    cancelAnimationFrame(rafId);
    lastTs = 0;
    sessionStartedAt = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function stopLoop() {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  function advance(dir) {
    index += dir;
    if (index < 0) {
      index = 0;
      renderStep();
      startLoop();
      return;
    }
    if (index >= playlist.length) {
      finishWorkout();
      return;
    }
    if (!paused) {
      elapsedOffsetMs = runningElapsedMs;
      sessionStartedAt = performance.now();
    }
    renderStep();
    if (!paused) startLoop();
  }

  function startWorkout() {
    if (!workout || !playlist.length) {
      selectWorkout(selectedId || (workouts[0] && workouts[0].id));
    }
    // Rebuild playlist in case data was edited and page hot-reloaded mid-session
    const built = window.buildPlaylist(workout);
    playlist = built.playlist;
    totalWorkSeconds = built.totalWorkSeconds;

    // Unlock audio inside the Start click so beeps are allowed
    Audio.unlock();
    index = 0;
    paused = false;
    elapsedOffsetMs = 0;
    runningElapsedMs = 0;
    els.pausedBanner.classList.remove("show");
    els.btnPause.textContent = "Pause";
    showScreen("workout");
    renderStep();
    startLoop();
  }

  function finishWorkout() {
    stopLoop();
    Audio.complete();
    els.progressFill.style.width = "100%";
    const mins =
      Math.round(runningElapsedMs / 60000) ||
      (workout && window.workoutDurationMinutes && window.workoutDurationMinutes(workout)) ||
      Math.round(totalWorkSeconds / 60);
    if (els.doneFamily) {
      els.doneFamily.textContent = `Nice work, ${familyNamesLine()}!`;
    }
    els.doneStats.textContent = `You finished ${workout ? workout.title : "the workout"} — about ${mins} minutes together.`;
    showScreen("done");
  }

  function togglePause() {
    paused = !paused;
    els.pausedBanner.classList.toggle("show", paused);
    els.btnPause.textContent = paused ? "Resume" : "Pause";
    if (paused) {
      elapsedOffsetMs = runningElapsedMs;
    } else {
      sessionStartedAt = performance.now();
      lastTs = 0;
      if (!rafId) startLoop();
    }
  }

  let endArmedUntil = 0;
  function endEarly() {
    const now = Date.now();
    if (now < endArmedUntil) {
      stopLoop();
      endArmedUntil = 0;
      els.btnEnd.textContent = "End";
      showScreen("home");
      return;
    }
    endArmedUntil = now + 3000;
    els.btnEnd.textContent = "End? Again";
    setTimeout(() => {
      if (Date.now() >= endArmedUntil - 50) {
        els.btnEnd.textContent = "End";
      }
    }, 3100);
  }

  function syncToggles() {
    setToggle(els.btnBeeps, Audio.getBeeps());
    els.btnMute.textContent = Audio.getBeeps() ? "Sound On" : "Sound Off";
  }

  function toggleFullscreen() {
    const doc = document;
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      const el = doc.documentElement;
      const req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (req) req.call(el).catch(() => {});
    } else {
      const exit = doc.exitFullscreen || doc.webkitExitFullscreen;
      if (exit) exit.call(doc).catch(() => {});
    }
  }

  function focusables() {
    const screen = document.querySelector(".screen.active");
    if (!screen) return [];
    return Array.from(
      screen.querySelectorAll('button:not([disabled]), [tabindex="0"]')
    ).filter((el) => {
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    });
  }

  function moveFocus(dx, dy) {
    const list = focusables();
    if (!list.length) return;
    const active = document.activeElement;
    let idx = list.indexOf(active);
    if (idx < 0) {
      list[0].focus();
      return;
    }

    if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) {
      const next = idx + dx;
      if (next >= 0 && next < list.length) list[next].focus();
      return;
    }

    const cur = active.getBoundingClientRect();
    const cx = cur.left + cur.width / 2;
    const cy = cur.top + cur.height / 2;
    let best = null;
    let bestScore = Infinity;

    list.forEach((el, i) => {
      if (i === idx) return;
      const r = el.getBoundingClientRect();
      const ex = r.left + r.width / 2;
      const ey = r.top + r.height / 2;
      const ddy = ey - cy;
      const ddx = ex - cx;
      if (dy < 0 && ddy >= -8) return;
      if (dy > 0 && ddy <= 8) return;
      const score = Math.abs(ddy) * 2 + Math.abs(ddx);
      if (score < bestScore) {
        bestScore = score;
        best = el;
      }
    });

    if (best) best.focus();
    else {
      const next = Math.max(0, Math.min(list.length - 1, idx + (dy > 0 ? 1 : -1)));
      list[next].focus();
    }
  }

  document.addEventListener("keydown", (e) => {
    const key = e.key;
    if (key === "ArrowRight") {
      e.preventDefault();
      moveFocus(1, 0);
    } else if (key === "ArrowLeft") {
      e.preventDefault();
      moveFocus(-1, 0);
    } else if (key === "ArrowDown") {
      e.preventDefault();
      moveFocus(0, 1);
    } else if (key === "ArrowUp") {
      e.preventDefault();
      moveFocus(0, -1);
    } else if (key === " " || key === "MediaPlayPause") {
      if (screens.workout.classList.contains("active")) {
        e.preventDefault();
        togglePause();
      }
    } else if (key === "Escape" || key === "GoBack") {
      if (screens.workout.classList.contains("active")) {
        e.preventDefault();
        endEarly();
      }
    }
  });

  els.btnStart.addEventListener("click", startWorkout);
  els.btnSettings.addEventListener("click", () => {
    els.settingsPanel.classList.toggle("open");
  });
  els.btnBeeps.addEventListener("click", () => {
    Audio.unlock();
    Audio.setBeeps(!Audio.getBeeps());
    syncToggles();
    if (Audio.getBeeps()) Audio.workStart();
  });
  els.btnFullscreen.addEventListener("click", toggleFullscreen);

  els.btnPause.addEventListener("click", togglePause);
  els.btnSkip.addEventListener("click", () => advance(1));
  els.btnPrev.addEventListener("click", () => advance(-1));
  els.btnEnd.addEventListener("click", endEarly);
  els.btnMute.addEventListener("click", () => {
    Audio.setBeeps(!Audio.getBeeps());
    if (Audio.getBeeps()) Audio.unlock();
    syncToggles();
  });

  els.btnAgain.addEventListener("click", startWorkout);
  els.btnHome.addEventListener("click", () => showScreen("home"));

  // Init
  const initialId = loadSelectedId() || (workouts[0] && workouts[0].id);
  selectWorkout(initialId);
  renderFamily();
  renderWorkoutPicker();
  updatePickerUI();
  updateHomeMeta();
  els.btnBeeps.dataset.label = "Beeps";
  syncToggles();
  setToggle(els.btnBeeps, Audio.getBeeps());

  console.info(
    `Voefen ready — ${workouts.length} workouts. Selected: ${selectedId} (~${Math.round(totalWorkSeconds / 60)} min, ${playlist.length} steps)`
  );
})();
