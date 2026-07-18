/**
 * Family crew: defaults, localStorage, home chips, editor screen.
 */
window.VoefenCrew = (function () {
  "use strict";

  const STORAGE_KEY = "fw_family";
  const MAX_CREW = 8;
  const EMOJIS = [
    "🙂", "😊", "😄", "😎", "🤗", "🧒", "👧", "👦", "👩", "👨",
    "👴", "👵", "💪", "⭐", "🔥", "🐕", "🐱", "🦁", "🦄", "🦊",
  ];
  const COLORS = [
    "#fb923c", "#a78bfa", "#34d399", "#f472b6", "#fbbf24",
    "#5ec8ff", "#f87171", "#2dd4bf", "#c084fc", "#94a3b8",
  ];

  /** @type {{id:string,label:string,emoji:string,color:string}[]} */
  let members = [];

  /** @type {null | { familyRow: HTMLElement, crewList: HTMLElement, btnAdd: HTMLButtonElement }} */
  let ui = null;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function clampLabel(raw) {
    let v = String(raw == null ? "" : raw).trim();
    if (!v) v = "Person";
    if (v.length > 24) v = v.slice(0, 24);
    return v;
  }

  function normalizePerson(p, i) {
    const id =
      (p && p.id && String(p.id)) ||
      "p" + Date.now().toString(36) + "_" + i;
    return {
      id: id,
      label: clampLabel(p && p.label != null ? p.label : "Person " + (i + 1)),
      emoji: (p && p.emoji && String(p.emoji).trim()) || EMOJIS[i % EMOJIS.length],
      color: (p && p.color && String(p.color).trim()) || COLORS[i % COLORS.length],
    };
  }

  function defaults() {
    const src = window.DEFAULT_FAMILY || window.FAMILY || [];
    return src.map(function (p, i) {
      return normalizePerson(p, i);
    });
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    } catch (_) {
      /* ignore */
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        members = defaults();
        return members;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.length) {
        members = defaults();
        return members;
      }
      members = parsed.slice(0, MAX_CREW).map(normalizePerson);
    } catch (_) {
      members = defaults();
    }
    return members;
  }

  function cycle(list, current) {
    const idx = list.indexOf(current);
    return list[((idx >= 0 ? idx : 0) + 1) % list.length];
  }

  function find(id) {
    for (let i = 0; i < members.length; i++) {
      if (members[i].id === id) return members[i];
    }
    return null;
  }

  function namesLine() {
    const names = members.map(function (p) {
      return p.label;
    }).filter(Boolean);
    if (!names.length) return "family";
    if (names.length === 1) return names[0];
    if (names.length === 2) return names[0] + " & " + names[1];
    return names.slice(0, -1).join(", ") + " & " + names[names.length - 1];
  }

  function list() {
    return members.slice();
  }

  function commitInputs() {
    if (!ui || !ui.crewList) return;
    const inputs = ui.crewList.querySelectorAll("input.crew-name");
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const person = find(input.getAttribute("data-id"));
      if (!person) continue;
      person.label = clampLabel(input.value);
      input.value = person.label;
    }
  }

  function renderHome() {
    if (!ui || !ui.familyRow) return;
    if (!members.length) {
      ui.familyRow.innerHTML =
        '<p class="family-empty">No one yet — tap Edit to add your crew</p>';
      return;
    }
    ui.familyRow.innerHTML = members
      .map(function (p) {
        return (
          '<button type="button" class="family-chip" style="--chip-color:' +
          p.color +
          '" data-edit-crew="1" title="Edit crew">' +
          '<span class="badge" aria-hidden="true">' +
          p.emoji +
          "</span>" +
          '<span class="label">' +
          escapeHtml(p.label) +
          "</span></button>"
        );
      })
      .join("");
  }

  function renderEditor() {
    if (!ui || !ui.crewList) return;
    ui.crewList.innerHTML = members
      .map(function (p, i) {
        const canRemove = members.length > 1;
        return (
          '<div class="crew-row" role="listitem">' +
          '<button type="button" class="crew-emoji" data-action="emoji" data-id="' +
          escapeHtml(p.id) +
          '" aria-label="Change emoji">' +
          p.emoji +
          "</button>" +
          '<input type="text" class="crew-name" data-id="' +
          escapeHtml(p.id) +
          '" maxlength="24" value="' +
          escapeHtml(p.label) +
          '" aria-label="Name ' +
          (i + 1) +
          '" autocomplete="off" spellcheck="false" />' +
          '<button type="button" class="crew-color" data-action="color" data-id="' +
          escapeHtml(p.id) +
          '" style="--chip-color:' +
          p.color +
          '" aria-label="Change colour"></button>' +
          '<button type="button" class="crew-remove ghost quiet" data-action="remove" data-id="' +
          escapeHtml(p.id) +
          '"' +
          (canRemove ? "" : " disabled") +
          ' aria-label="Remove">✕</button></div>'
        );
      })
      .join("");
    if (ui.btnAdd) ui.btnAdd.disabled = members.length >= MAX_CREW;
  }

  function onListClick(e) {
    const btn = e.target.closest("button[data-action]");
    if (!btn || !ui.crewList.contains(btn)) return;
    const person = find(btn.getAttribute("data-id"));
    if (!person) return;
    const action = btn.getAttribute("data-action");

    if (action === "emoji") {
      person.emoji = cycle(EMOJIS, person.emoji);
      btn.textContent = person.emoji;
      save();
      return;
    }
    if (action === "color") {
      person.color = cycle(COLORS, person.color);
      btn.style.setProperty("--chip-color", person.color);
      save();
      return;
    }
    if (action === "remove" && members.length > 1) {
      members = members.filter(function (p) {
        return p.id !== person.id;
      });
      save();
      renderEditor();
    }
  }

  function onNameBlur(e) {
    const input = e.target;
    if (!input || !input.classList || !input.classList.contains("crew-name")) return;
    const person = find(input.getAttribute("data-id"));
    if (!person) return;
    person.label = clampLabel(input.value);
    input.value = person.label;
    save();
  }

  function add() {
    if (members.length >= MAX_CREW) return;
    const i = members.length;
    members.push(
      normalizePerson(
        {
          id: "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          label: "Person " + (i + 1),
          emoji: EMOJIS[i % EMOJIS.length],
          color: COLORS[i % COLORS.length],
        },
        i
      )
    );
    save();
    renderEditor();
    const inputs = ui.crewList.querySelectorAll(".crew-name");
    const last = inputs[inputs.length - 1];
    if (last) {
      last.focus();
      try {
        last.select();
      } catch (_) {
        /* ignore */
      }
    }
  }

  function reset() {
    members = defaults();
    save();
    renderEditor();
  }

  function bind(elements) {
    ui = elements;
    if (ui.crewList) {
      ui.crewList.addEventListener("click", onListClick);
      ui.crewList.addEventListener("blur", onNameBlur, true);
    }
  }

  function openEditor() {
    renderEditor();
  }

  function closeEditor() {
    commitInputs();
    save();
    renderHome();
  }

  return {
    load: load,
    list: list,
    namesLine: namesLine,
    bind: bind,
    renderHome: renderHome,
    openEditor: openEditor,
    closeEditor: closeEditor,
    add: add,
    reset: reset,
  };
})();
