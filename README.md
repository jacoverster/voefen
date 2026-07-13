# Voefen

A TV-friendly website that guides **Jaco, Mia, Hanan, Lika, and Thomas** through family bodyweight workouts together.

Built for a **Samsung TV browser**, hosted free on **Firebase Hosting**.

## Features

- **5 pre-built workouts** — pick on the home screen (selection remembered)
- **Everyone together** — same exercise at the same time
- **Easy & hard options** on every move
- **Big timers** + progress bar (TV-readable)
- **Emoji-forward UI**, beeps + optional voice, remote-friendly focus
- **No login / no backend** — pure static files

## Workout shape

Every workout is the same pattern (easy to edit):

1. **Warm-up** — 3–5 exercises (no rests between them)
2. **Circuit** — 4–5 simple exercises, repeated for `rounds` (e.g. 3 or 4)
3. **Cool-down** — a few stretches + breathing

Between rounds there is an optional water break (`restBetweenRounds`).

## Edit workouts

All content lives in **`public/workout-data.js`**:

```js
{
  id: "power-30",
  title: "Family Power",
  tagline: "Full-energy classic",
  emoji: "💪",
  warmup: { exercises: [ /* 3–5 */ ] },
  circuit: {
    rounds: 4,                    // change this to do more/less rounds
    restBetweenExercises: 15,
    restBetweenRounds: 60,        // 0 = no water break
    exercises: [ /* 4–5, same each round */ ],
  },
  cooldown: { exercises: [ /* stretches + breathing */ ] },
}
```

Helper: `ex(name, emoji, seconds, cue, easy, hard)`  
Optional 6th arg: per-step `restAfter` override.

## Local preview

```bash
cd family-workout
npx --yes serve public -p 5173
```

Open http://localhost:5173

## Deploy to Firebase (free)

```bash
cd family-workout
firebase deploy --only hosting
```

**Live URL:** https://voefen.web.app  

Project ID: `voefen`. Bookmark on the TV after the first visit.

## Project layout

```
family-workout/
  firebase.json
  public/
    index.html
    styles.css
    app.js
    audio.js
    workout-data.js   # family + exercises
```

## License

Personal / family use — enjoy the sweat.
