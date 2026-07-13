# Voefen

Family bodyweight workouts on the TV — timers, easy/hard cues, and remote-friendly controls for the whole crew.

**Live:** [https://voefen.web.app](https://voefen.web.app)
**Repo:** [github.com/jacoverster/voefen](https://github.com/jacoverster/voefen)

Built for a **Samsung TV browser** (and any large screen). Free **Firebase Hosting**. No login, no backend — static HTML/CSS/JS only.

## Family

| Name | Colour |
|------|--------|
| Dad | Orange |
| Mom | Purple |
| Kid 1 | Green |
| Kid 2 | Pink |
| Kid 3 | Yellow |

Edit names, emoji, and colours in `public/workout-data.js` → `FAMILY`.

## Workouts

Pick one on the home screen (selection is remembered in the browser).

| Workout | ~Time | Rounds × moves | Vibe |
|---------|-------|----------------|------|
| Family Power | ~27 min | 4 × 5 | Full-energy classic |
| Quick Blast | ~14 min | 3 × 4 | Busy-day burner |
| Cardio Party | ~25 min | 4 × 5 | Jump, dance, smile |
| Strong Together | ~21 min | 3 × 5 | Strength focus |
| Stretch & Flow | ~18 min | 3 × 4 | Gentle mobility |

Times are calculated from the real playlist (warm-up + rounds + water breaks + cool-down).

## Workout shape

Every workout uses the same pattern:

1. **Warm-up** — 3–5 exercises, no rests between moves
2. **Circuit** — 4–5 simple exercises, repeated for `rounds`
3. **Water break** between rounds (optional)
4. **Cool-down** — stretches + breathing

## Features

- Everyone does the **same move together**
- **Easy** and **hard** tips on every exercise
- Large **countdown timer**, progress bar, and emoji stage art
- **Beeps** + optional **voice** coaching (toggle on home → Settings)
- TV remote: arrows to move, Enter to select, Space / Play-Pause to pause

## Edit content

All workouts and family data live in **`public/workout-data.js`**.

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

## Project layout

```
voefen/
  firebase.json       # Firebase Hosting config
  .firebaserc         # project id: voefen
  public/
    index.html        # screens (home, workout, done)
    styles.css        # TV-first layout
    app.js            # timer, picker, remote nav
    audio.js          # beeps + speech
    workout-data.js   # FAMILY + WORKOUTS
  README.md
```

## Local preview

```bash
npx --yes serve public -p 5173
```

Open [http://localhost:5173](http://localhost:5173).

## Deploy

Requires [Firebase CLI](https://firebase.google.com/docs/cli) and login (`firebase login`).

```bash
firebase deploy --only hosting
```

Deploys to project **`voefen`** → [https://voefen.web.app](https://voefen.web.app).

On the TV: open that URL once and **bookmark** it so you don’t retype with the remote.

## License

Personal / family use.
