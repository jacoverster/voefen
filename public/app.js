(function () {
  "use strict";

  const Audio = window.WorkoutAudio;
  const Timer = window.VoefenTimer;
  const Crew = window.VoefenCrew;
  const Nav = window.VoefenRemoteNav;
  const workouts = window.WORKOUTS || [];

  const $ = function (id) {
    return document.getElementById(id);
  };

  const screens = {
    home: $("screen-home"),
    crew: $("screen-crew"),
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
    btnEditCrew: $("btn-edit-crew"),
    btnSettingsCrew: $("btn-settings-crew"),
    crewList: $("crew-list"),
    btnCrewAdd: $("btn-crew-add"),
    btnCrewReset: $("btn-crew-reset"),
    btnCrewDone: $("btn-crew-done"),
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
  let lastTickSecond = null;
  let endArmedUntil = 0;

  function activeScreen() {
    for (const name in screens) {
      if (screens[name] && screens[name].classList.contains("active")) return name;
    }
    return "home";
  }

  function showScreen(name) {
    for (const key in screens) {
      if (screens[key]) screens[key].classList.toggle("active", key === name);
    }

    // Delay Pause focus so remote OK keyup does not immediately pause
    const delay = name === "workout" ? 700 : 50;
    setTimeout(function () {
      if (activeScreen() !== name) return;
      try {
        if (name === "home") Nav.focus(els.btnStart);
        else if (name === "crew") {
          const first =
            els.crewList && els.crewList.querySelector("input, button");
          Nav.focus(first || els.btnCrewDone);
        } else if (name === "workout") Nav.focus(els.btnPause);
        else if (name === "done") Nav.focus(els.btnAgain);
      } catch (_) {
        /* ignore */
      }
    }, delay);
  }

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

  function pad2(n) {
    n = Math.floor(Math.abs(n));
    return n < 10 ? "0" + n : String(n);
  }

  function formatTime(totalSeconds) {
    const s = Math.max(0, Math.ceil(totalSeconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m > 0 ? m + ":" + pad2(r) : String(r);
  }

  function formatClock(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + pad2(r);
  }

  function setToggle(btn, on) {
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    const label = btn.dataset.label || btn.textContent;
    btn.textContent = label + ": " + (on ? "On" : "Off");
  }

  function syncToggles() {
    setToggle(els.btnBeeps, Audio.getBeeps());
    els.btnMute.textContent = Audio.getBeeps() ? "Sound On" : "Sound Off";
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
      const roundBit = rounds ? rounds + " rounds · " : "";
      els.metaLine.textContent =
        mins + " min · " + roundBit + "bodyweight · easy & hard";
    }
    const sub = $("home-subtitle");
    if (sub) sub.textContent = workout.title + " — " + workout.tagline;
  }

  function updatePickerUI() {
    if (!els.workoutPicker) return;
    els.workoutPicker.querySelectorAll(".workout-card").forEach(function (btn) {
      btn.setAttribute(
        "aria-selected",
        btn.dataset.id === selectedId ? "true" : "false"
      );
    });
  }

  function renderWorkoutPicker() {
    if (!els.workoutPicker) return;
    els.workoutPicker.innerHTML = workouts
      .map(function (w) {
        const selected = w.id === selectedId;
        const mins =
          (window.workoutDurationMinutes && window.workoutDurationMinutes(w)) ||
          w.durationMinutes ||
          "?";
        const rounds = (w.circuit && w.circuit.rounds) || 0;
        return (
          '<button type="button" class="workout-card" role="option" data-id="' +
          w.id +
          '" aria-selected="' +
          (selected ? "true" : "false") +
          '">' +
          '<span class="w-emoji" aria-hidden="true">' +
          (w.emoji || "💪") +
          "</span>" +
          '<span class="w-title">' +
          w.title +
          "</span>" +
          '<span class="w-meta">' +
          mins +
          " min · " +
          rounds +
          " rounds · " +
          w.tagline +
          "</span></button>"
        );
      })
      .join("");

    els.workoutPicker.querySelectorAll(".workout-card").forEach(function (btn) {
      btn.addEventListener("click", function () {
        selectWorkout(btn.dataset.id);
        btn.focus();
      });
    });
  }

  function safeAudio(fn) {
    try {
      fn();
    } catch (_) {
      /* TV Web Audio can throw — never block workout */
    }
  }

  function paintTimer(state) {
    if (!els.timerDigits) return;
    const secs = state.remainingMs / 1000;
    els.timerDigits.textContent = formatTime(secs);

    const p =
      state.stepTotalMs > 0
        ? ((state.stepTotalMs - state.remainingMs) / state.stepTotalMs) * 100
        : 0;
    if (els.timerRing) {
      els.timerRing.style.setProperty(
        "--p",
        String(Math.min(100, Math.max(0, p)))
      );
    }

    const whole = Math.ceil(secs);
    const urgent = whole <= 3 && whole > 0 && !state.paused;
    els.timerDigits.classList.toggle("urgent", urgent);
    if (urgent && lastTickSecond !== whole) {
      lastTickSecond = whole;
      safeAudio(function () {
        Audio.tick();
      });
    }

    if (els.elapsedText) {
      els.elapsedText.textContent = formatClock(state.runningElapsedMs);
    }
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
      els.nextPreview.innerHTML =
        "Coming up: <strong>" + step.nextName + "</strong>";
    } else if (next) {
      const nlabel = next.type === "rest" ? next.nextName || "Rest" : next.name;
      els.nextPreview.innerHTML =
        next.type === "rest" && next.nextName
          ? "Then rest → <strong>" + next.nextName + "</strong>"
          : "Next: <strong>" + nlabel + "</strong>";
    } else {
      els.nextPreview.innerHTML = "<strong>Final stretch!</strong>";
    }

    els.progressFill.style.width = (index / playlist.length) * 100 + "%";
    els.progressText.textContent = index + 1 + " / " + playlist.length;

    lastTickSecond = null;
    Timer.armStep(step.seconds);

    safeAudio(function () {
      if (isRest || isBreak) Audio.restStart();
      else Audio.workStart();
    });
  }

  function advance(dir) {
    index += dir;
    if (index < 0) {
      index = 0;
    } else if (index >= playlist.length) {
      finishWorkout();
      return;
    }
    Timer.carryElapsed();
    renderStep();
    if (!Timer.isPaused()) {
      // Ensure loop is running after step change (start is idempotent)
      Timer.start();
    }
  }

  function startWorkout() {
    if (!workout || !playlist.length) {
      selectWorkout(selectedId || (workouts[0] && workouts[0].id));
    }
    if (!workout) return;

    const built = window.buildPlaylist(workout);
    playlist = built.playlist;
    totalWorkSeconds = built.totalWorkSeconds;
    if (!playlist.length) return;

    safeAudio(function () {
      Audio.unlock();
    });

    index = 0;
    lastTickSecond = null;
    Timer.resetSession();
    syncPauseUI();
    showScreen("workout");
    // Arm step first, then start the loop so deadline + schedule are in order
    renderStep();
    Timer.start();
  }

  function finishWorkout() {
    Timer.stop();
    safeAudio(function () {
      Audio.complete();
    });
    els.progressFill.style.width = "100%";
    const elapsed = Timer.getElapsedMs();
    const mins =
      Math.round(elapsed / 60000) ||
      (workout &&
        window.workoutDurationMinutes &&
        window.workoutDurationMinutes(workout)) ||
      Math.round(totalWorkSeconds / 60);
    if (els.doneFamily) {
      els.doneFamily.textContent = "Nice work, " + Crew.namesLine() + "!";
    }
    els.doneStats.textContent =
      "You finished " +
      (workout ? workout.title : "the workout") +
      " — about " +
      mins +
      " minutes together.";
    showScreen("done");
  }

  let lastPauseToggleAt = 0;

  function syncPauseUI() {
    const paused = Timer.isPaused();
    if (els.pausedBanner) els.pausedBanner.classList.toggle("show", paused);
    if (els.btnPause) {
      els.btnPause.textContent = paused ? "Resume" : "Pause";
      els.btnPause.setAttribute("aria-pressed", paused ? "true" : "false");
    }
  }

  /**
   * @param {{ force?: boolean, source?: string }} [opts]
   * force: skip post-Start grace (deliberate button press)
   * Debounced so Space/Play-Pause + synthetic button click cannot double-toggle.
   */
  function togglePause(opts) {
    const force = !!(opts && opts.force);
    const t = Date.now();
    if (t - lastPauseToggleAt < 400) {
      syncPauseUI();
      return Timer.isPaused();
    }
    lastPauseToggleAt = t;
    Timer.togglePause({ force: force });
    syncPauseUI();
    return Timer.isPaused();
  }

  function endEarly() {
    const now = Date.now();
    if (now < endArmedUntil) {
      Timer.stop();
      endArmedUntil = 0;
      els.btnEnd.textContent = "End";
      showScreen("home");
      return;
    }
    endArmedUntil = now + 3000;
    els.btnEnd.textContent = "End? Again";
    setTimeout(function () {
      if (Date.now() >= endArmedUntil - 50) els.btnEnd.textContent = "End";
    }, 3100);
  }

  function toggleFullscreen() {
    const doc = document;
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      const el = doc.documentElement;
      const req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (req) req.call(el).catch(function () {});
    } else {
      const exit = doc.exitFullscreen || doc.webkitExitFullscreen;
      if (exit) exit.call(doc).catch(function () {});
    }
  }

  function openCrew() {
    if (els.settingsPanel) els.settingsPanel.classList.remove("open");
    Crew.openEditor();
    showScreen("crew");
  }

  function closeCrew() {
    Crew.closeEditor();
    showScreen("home");
  }

  // --- Wire modules ---

  Timer.configure({
    onComplete: function () {
      advance(1);
    },
    onPaint: paintTimer,
  });

  Crew.bind({
    familyRow: els.familyRow,
    crewList: els.crewList,
    btnAdd: els.btnCrewAdd,
  });
  Crew.load();
  Crew.renderHome();

  Nav.init({
    getScreen: activeScreen,
    onAction: function (action, screen) {
      if (action === "pause" && screen === "workout") {
        // Remote Play/Pause / Space — not a deliberate button click
        togglePause({ force: false, source: "remote" });
      } else if (action === "back") {
        if (screen === "workout") endEarly();
        else if (screen === "crew") closeCrew();
        else if (screen === "done") showScreen("home");
      }
    },
  });

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState !== "visible") return;
    if (activeScreen() !== "workout" || Timer.isPaused()) return;
    Timer.rearmAfterWake();
  });

  els.btnStart.addEventListener("click", startWorkout);
  els.btnSettings.addEventListener("click", function () {
    els.settingsPanel.classList.toggle("open");
  });
  els.btnBeeps.addEventListener("click", function () {
    safeAudio(function () {
      Audio.unlock();
    });
    Audio.setBeeps(!Audio.getBeeps());
    syncToggles();
    if (Audio.getBeeps()) {
      safeAudio(function () {
        Audio.workStart();
      });
    }
  });
  els.btnFullscreen.addEventListener("click", toggleFullscreen);

  if (els.btnEditCrew) els.btnEditCrew.addEventListener("click", openCrew);
  if (els.btnSettingsCrew) els.btnSettingsCrew.addEventListener("click", openCrew);
  if (els.familyRow) {
    els.familyRow.addEventListener("click", function (e) {
      if (e.target.closest("[data-edit-crew]")) openCrew();
    });
  }
  if (els.btnCrewAdd) els.btnCrewAdd.addEventListener("click", function () {
    Crew.add();
  });
  if (els.btnCrewReset) {
    els.btnCrewReset.addEventListener("click", function () {
      Crew.reset();
      Nav.focus(els.btnCrewDone);
    });
  }
  if (els.btnCrewDone) els.btnCrewDone.addEventListener("click", closeCrew);

  els.btnPause.addEventListener("click", function () {
    // Deliberate press — always allow (ignore post-Start grace)
    togglePause({ force: true, source: "button" });
  });
  els.btnSkip.addEventListener("click", function () {
    advance(1);
  });
  els.btnPrev.addEventListener("click", function () {
    advance(-1);
  });
  els.btnEnd.addEventListener("click", endEarly);
  els.btnMute.addEventListener("click", function () {
    Audio.setBeeps(!Audio.getBeeps());
    if (Audio.getBeeps()) {
      safeAudio(function () {
        Audio.unlock();
      });
    }
    syncToggles();
  });
  els.btnAgain.addEventListener("click", startWorkout);
  els.btnHome.addEventListener("click", function () {
    showScreen("home");
  });

  const initialId = loadSelectedId() || (workouts[0] && workouts[0].id);
  selectWorkout(initialId);
  renderWorkoutPicker();
  updatePickerUI();
  updateHomeMeta();
  els.btnBeeps.dataset.label = "Beeps";
  syncToggles();

  console.info(
    "Voefen ready — " +
      workouts.length +
      " workouts, crew: " +
      Crew.namesLine()
  );
})();
