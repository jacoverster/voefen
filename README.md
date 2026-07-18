# Voefen

Family bodyweight workouts on the TV — timers, easy/hard cues, editable crew, and remote-friendly controls for the living room.

**Live:** [https://voefen.web.app](https://voefen.web.app)  
**Repo:** [github.com/jacoverster/voefen](https://github.com/jacoverster/voefen)

Built for a **Samsung TV browser** (and any large screen). Free **Firebase Hosting**. No login, no backend — static HTML/CSS/JS only.

## Features

- Pick a workout on the home screen (selection is remembered per browser)
- **Today’s crew** on screen — edit names, emoji, and colours (saved in `localStorage`)
- Everyone does the **same move together**
- **Easy** and **hard** tips on every exercise
- Large **countdown timer**, progress bar, and emoji stage
- **Beeps** for start/end and the last-3-second countdown (Settings)
- Fullscreen button for less browser chrome on the TV

## Family / crew

Home → **Edit** (or **Settings → Edit crew**), or tap a crew chip.

| | |
|--|--|
| Storage | Browser `localStorage` key `fw_family` (that TV / browser only) |
| Defaults | `public/workout-data.js` → `DEFAULT_FAMILY` (until someone edits) |
| Limits | Up to 8 people |
| Controls | Cycle emoji / colour with OK; type names; Add / Remove / Reset / Done |

Clearing site data on the TV resets crew to the defaults.

## Workouts

| Workout | ~Time | Rounds × moves | Vibe |
|---------|-------|----------------|------|
| Family Power | ~27 min | 4 × 5 | Full-energy classic |
| Quick Blast | ~14 min | 3 × 4 | Busy-day burner |
| Cardio Party | ~25 min | 4 × 5 | Jump, dance, smile |
| Strong Together | ~21 min | 3 × 5 | Strength focus |
| Stretch & Flow | ~18 min | 3 × 4 | Gentle mobility |

Times come from the real playlist (warm-up + rounds + water breaks + cool-down).

### Shape

Every workout uses the same pattern:

1. **Warm-up** — 3–5 exercises (no rests between moves by default)
2. **Circuit** — 4–5 moves, repeated for `rounds`
3. **Water break** between rounds (optional)
4. **Cool-down** — stretches + breathing

## TV remote

On Samsung’s browser the Magic Remote often uses a **pointer** (cursor). The app also supports keyboard-style keys when the browser delivers them: arrows for focus, OK to select, Play/Pause to pause a workout, Back to leave a screen.

## Edit workouts

All workout content lives in **`public/workout-data.js`**.

```js
{
  id: "power-30",
  title: "Family Power",
  tagline: "Full-energy classic",
  emoji: "💪",
  warmup: {
    exercises: [ /* 3–5 moves */ ],
  },
  circuit: {
    rounds: 4,                 // more or fewer rounds
    restBetweenExercises: 15,  // seconds between moves in a round
    restBetweenRounds: 60,     // water break; use 0 to skip
    exercises: [ /* 4–5 moves, same each round */ ],
  },
  cooldown: {
    exercises: [ /* stretches + breathing */ ],
  },
}
```

Helper:

```js
ex(name, emoji, seconds, cue, easy, hard)
// optional 6th arg: restAfter override for that step only
```

Default crew placeholders:

```js
window.DEFAULT_FAMILY = [
  { id: "p1", label: "Person 1", emoji: "🙂", color: "#fb923c" },
  // ...
];
```

## Project layout

```
voefen/
  firebase.json         # Firebase Hosting
  .firebaserc           # project id: voefen
  public/
    index.html          # screens: home, crew, workout, done
    styles.css          # TV-first layout (flex-first rows)
    crew.css            # crew editor styles
    polish.css          # focus glow, motion, ambient wash, idle/fullscreen toast
    app.js              # screens, workout flow, glue
    timer.js            # deadline countdown (setTimeout + Date.now)
    crew.js             # crew model, localStorage, editor UI
    remote-nav.js       # D-pad spatial focus + remote keys
    audio.js            # beeps (Web Audio)
    workout-data.js     # DEFAULT_FAMILY + WORKOUTS + playlist builders
  README.md
```

### Browser storage keys

| Key | Purpose |
|-----|---------|
| `fw_family` | Editable crew (JSON) |
| `fw_workout_id` | Last selected workout |
| `fw_beeps` | Beeps on/off |

## Local preview

```bash
npx --yes serve public -p 5173
```

Open [http://localhost:5173](http://localhost:5173).

## Deploy

Requires [Firebase CLI](https://firebase.tools/) and `firebase login`.

```bash
firebase deploy --only hosting
```

Deploys project **`voefen`** → [https://voefen.web.app](https://voefen.web.app).

On the TV: open that URL once and **bookmark** it so you don’t retype with the remote. After a deploy, hard-refresh or reopen the tab if the old version is cached.

## License

Personal / family use.
