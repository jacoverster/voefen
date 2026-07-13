/**
 * Voefen — workout library
 *
 * HOW TO EDIT
 * -----------
 * 1. Family → FAMILY
 * 2. Workouts → WORKOUTS
 *
 * Each workout has three parts:
 *   warmup.exercises     → 3–5 moves (no rests by default)
 *   circuit.exercises    → 4–5 simple moves repeated every round
 *   circuit.rounds       → how many times to repeat (3–4, or any number)
 *   circuit.restBetweenExercises → rest after each move inside a round
 *   circuit.restBetweenRounds    → water-break seconds between rounds (0 = none)
 *   cooldown.exercises   → a few stretches + breathing
 *
 * Helper: ex(name, emoji, seconds, cue, easy, hard)
 * Optional 6th arg restAfter overrides the default for that step only.
 */
(function () {
  "use strict";

  window.FAMILY = [
    { id: "dad", label: "Jaco", emoji: "👨🏼", color: "#fb923c" },
    { id: "mom", label: "Mia", emoji: "👩🏼", color: "#a78bfa" },
    { id: "kid1", label: "Hanan", emoji: "👦🏼", color: "#34d399" },
    { id: "kid2", label: "Lika", emoji: "👧🏼", color: "#f472b6" },
    { id: "kid3", label: "Thomas", emoji: "👦🏼", color: "#fbbf24" },
  ];

  /**
   * @param {string} name
   * @param {string} emoji
   * @param {number} seconds
   * @param {string} cue
   * @param {string} easy
   * @param {string} hard
   * @param {number} [restAfter] optional override
   */
  function ex(name, emoji, seconds, cue, easy, hard, restAfter) {
    const step = { name, emoji, seconds, cue, easy, hard };
    if (restAfter != null) step.restAfter = restAfter;
    return step;
  }

  // ─────────────────────────────────────────────────────────────
  // WORKOUTS
  // ─────────────────────────────────────────────────────────────
  window.WORKOUTS = [
    {
      id: "power-30",
      title: "Family Power",
      tagline: "Full-energy classic",
      emoji: "💪",
      warmup: {
        exercises: [
          ex("March in Place", "🚶", 45, "Swing your arms. Soft knees.", "Gentle steps, low knees.", "High knees, big arms."),
          ex("Arm Circles", "🔄", 40, "Big circles forward, then reverse.", "Small slow circles.", "Large fast circles."),
          ex("Side Reaches", "🙆", 40, "Reach one arm up and over. Switch.", "Hands on hips, small lean.", "Long overhead reach."),
          ex("Slow Squats", "🦵", 45, "Sit back like a chair. Stand tall.", "Half squat or hold a chair.", "Full depth, slow lower."),
        ],
      },
      circuit: {
        rounds: 4,
        restBetweenExercises: 15,
        restBetweenRounds: 60,
        exercises: [
          ex("Jumping Jacks", "⭐", 40, "Feet out, arms up — smile!", "Step-jacks, no jump.", "Fast crisp jacks."),
          ex("Squats", "🦵", 40, "Chest up. Knees over toes.", "Shallower or chair sit-to-stand.", "Add a small jump."),
          ex("Push-Ups", "💪", 40, "Straight line. Lower with control.", "Wall or knee push-ups.", "Full push-ups."),
          ex("High Knees", "🏃", 40, "Drive knees toward your chest.", "March with high knees.", "Sprint in place!"),
          ex("Plank Hold", "🧘", 40, "Squeeze abs. Hips level.", "Knees down or on a counter.", "Full plank."),
        ],
      },
      cooldown: {
        exercises: [
          ex("Forward Fold", "🙇", 40, "Hinge at hips, hang loose.", "Hands on thighs.", "Deeper fold, gentle sway."),
          ex("Quad Stretch", "🦩", 45, "Hold ankle ~20s each leg.", "Hold a chair for balance.", "Hips pressed forward."),
          ex("Chest Opener", "🤗", 40, "Clasp hands behind back, open chest.", "Hands on lower back.", "Lift arms and open wide."),
          ex("Deep Breaths · High Fives", "🌬️", 45, "In for 4, out for 6. Then celebrate!", "Sit or stand — just breathe.", "Tall posture, full belly breaths."),
        ],
      },
    },

    {
      id: "quick-15",
      title: "Quick Blast",
      tagline: "Busy-day burner",
      emoji: "⚡",
      warmup: {
        exercises: [
          ex("March in Place", "🚶", 35, "Get the wiggles out.", "Gentle steps.", "High knees march."),
          ex("Arm Circles", "🔄", 30, "Forward, then reverse.", "Small circles.", "Big fast circles."),
          ex("Bodyweight Squats", "🦵", 35, "Sit back, stand tall.", "Half squats.", "Full depth."),
        ],
      },
      circuit: {
        rounds: 3,
        restBetweenExercises: 10,
        restBetweenRounds: 45,
        exercises: [
          ex("Jumping Jacks", "⭐", 35, "Feet out, arms up!", "Step-jacks.", "Fast jacks."),
          ex("Squats", "🦵", 35, "Chest proud.", "Shallow squats.", "Jump squats."),
          ex("Push-Ups", "💪", 35, "Strong plank line.", "Knees or wall.", "Full push-ups."),
          ex("High Knees", "🏃", 35, "Drive those knees!", "March high.", "Sprint in place."),
        ],
      },
      cooldown: {
        exercises: [
          ex("Forward Fold", "🙇", 35, "Hang and breathe.", "Hands on thighs.", "Deeper fold."),
          ex("Shoulder Rolls", "🔄", 30, "Slow rolls back and forward.", "Tiny rolls.", "Big slow rolls."),
          ex("Deep Breaths", "🌬️", 40, "In for 4, out for 6.", "Any comfy position.", "Eyes closed if you like."),
        ],
      },
    },

    {
      id: "cardio-25",
      title: "Cardio Party",
      tagline: "Jump, dance, smile",
      emoji: "🎉",
      warmup: {
        exercises: [
          ex("Dance March", "🕺", 40, "March and groove.", "Small steps.", "Big arms, big smile."),
          ex("Arm Waves", "👋", 35, "Wave arms side to side.", "Slow waves.", "Fast overhead waves."),
          ex("Step Touches", "👟", 40, "Step side, touch, switch.", "Small steps.", "Add a clap."),
          ex("Soft Jumps", "🐇", 35, "Tiny bounces in place.", "Heel raises only.", "Light jumps."),
        ],
      },
      circuit: {
        rounds: 4,
        restBetweenExercises: 12,
        restBetweenRounds: 50,
        exercises: [
          ex("Jumping Jacks", "⭐", 40, "Classic jacks!", "Step-jacks.", "Super-fast jacks."),
          ex("High Knees", "🏃", 40, "Run in place.", "March high.", "Sprint!"),
          ex("Star Jumps", "🌟", 40, "Explode into a star.", "Step to star shape.", "Big jumps."),
          ex("Fast Feet", "⚡", 40, "Hot-coal feet!", "Medium pace.", "As fast as you can."),
          ex("Shadow Boxing", "🥊", 40, "Jab, cross, bounce!", "Soft punches.", "Fast combos."),
        ],
      },
      cooldown: {
        exercises: [
          ex("Slow March", "🚶", 35, "Bring the heart rate down.", "Very easy steps.", "Tall posture."),
          ex("Side Stretch", "🙆", 40, "Reach over each side.", "Small lean.", "Long stretch."),
          ex("Forward Fold", "🙇", 40, "Hang loose.", "Hands on thighs.", "Sway gently."),
          ex("Breaths · High Fives", "🌬️", 40, "Big breaths, then high fives!", "Just breathe together.", "In 4, out 6."),
        ],
      },
    },

    {
      id: "strong-25",
      title: "Strong Together",
      tagline: "Build power as a team",
      emoji: "🏋️",
      warmup: {
        exercises: [
          ex("March in Place", "🚶", 40, "Wake up the legs.", "Easy march.", "High knees."),
          ex("Arm Circles", "🔄", 35, "Loosen the shoulders.", "Small circles.", "Big circles."),
          ex("Slow Squats", "🦵", 40, "Grease the groove.", "Half depth.", "3-second lowers."),
          ex("Hip Circles", "⭕", 35, "Hands on hips, draw circles.", "Tiny circles.", "Big smooth circles."),
        ],
      },
      circuit: {
        rounds: 3,
        restBetweenExercises: 15,
        restBetweenRounds: 60,
        exercises: [
          ex("Squats", "🦵", 40, "Sit back, drive up.", "Chair assist.", "Pause at the bottom."),
          ex("Push-Ups", "💪", 40, "Strong line head to heels.", "Wall or knees.", "Full push-ups."),
          ex("Reverse Lunges", "👣", 40, "Alternate legs.", "Hold a wall.", "Pulse at the bottom."),
          ex("Glute Bridge", "🌉", 40, "On your back, lift hips high.", "Small lift.", "Squeeze 2s at top."),
          ex("Plank Hold", "🧘", 40, "Brace your middle.", "Knees down.", "Full plank."),
        ],
      },
      cooldown: {
        exercises: [
          ex("Forward Fold", "🙇", 40, "Release the legs and back.", "Soft knees.", "Deeper hang."),
          ex("Quad Stretch", "🦩", 45, "Both sides. Use a wall.", "Hold a chair.", "Hips forward."),
          ex("Chest Opener", "🤗", 40, "Open after all those pushes.", "Hands on back.", "Clasp and lift."),
          ex("Deep Breaths · High Fives", "🌬️", 40, "Proud finish. Breathe together.", "Easy breaths.", "Tall belly breaths."),
        ],
      },
    },

    {
      id: "stretch-20",
      title: "Stretch & Flow",
      tagline: "Gentle reset day",
      emoji: "🧘",
      warmup: {
        exercises: [
          ex("Soft March", "🚶", 40, "Barely bounce — just arrive.", "Very gentle.", "Add arm swings."),
          ex("Shoulder Rolls", "🔄", 40, "Roll back, then forward.", "Small rolls.", "Big slow rolls."),
          ex("Side Reaches", "🙆", 40, "Reach long over each side.", "Hands on hips.", "Full overhead reach."),
          ex("Cat-Cow", "🐱", 45, "Round and arch — floor or standing.", "Standing only.", "Full floor cat-cow."),
          ex("Hip Circles", "⭕", 40, "Slow circles both ways.", "Tiny range.", "Big smooth circles."),
        ],
      },
      circuit: {
        rounds: 3,
        restBetweenExercises: 10,
        restBetweenRounds: 30,
        exercises: [
          ex("World's Greatest Stretch", "🌍", 45, "Lunge, twist, switch sides.", "Short range.", "Deep lunge + open chest."),
          ex("Hamstring Sweep", "🧹", 45, "Hinge, sweep hands past shins.", "Hands on thighs.", "Longer hinge."),
          ex("Figure-4 Stretch", "4️⃣", 45, "Ankle on opposite knee, gentle press.", "Seated version.", "Recline and pull shin."),
          ex("Child's Pose or Fold", "🧒", 45, "Rest hips toward heels or hang forward.", "Hands on a couch.", "Long arms, deep breath."),
        ],
      },
      cooldown: {
        exercises: [
          ex("Seated or Standing Twist", "🌀", 40, "Gentle twist each side.", "Hands on hips.", "Longer hold."),
          ex("Neck Soft Rolls", "🦢", 35, "Slow half-circles — never force.", "Tiny range.", "Smooth and slow."),
          ex("Chest Open", "🤗", 40, "Open the front body.", "Hands behind back.", "Deeper open."),
          ex("Long Breaths", "🌬️", 50, "In for 4, out for 6. Quiet moment.", "Any comfy position.", "Eyes closed if you like."),
        ],
      },
    },
  ];

  // ─────────────────────────────────────────────────────────────
  // Expand template → blocks → playlist
  // ─────────────────────────────────────────────────────────────

  const COLORS = {
    warmup: "#38bdf8",
    round: ["#fb923c", "#a78bfa", "#f43f5e", "#fbbf24", "#34d399"],
    break: "#22d3ee",
    cooldown: "#34d399",
  };

  function withRest(step, defaultRest) {
    const restAfter =
      step.restAfter != null ? step.restAfter : defaultRest;
    return {
      name: step.name,
      emoji: step.emoji || "💪",
      seconds: step.seconds,
      restAfter,
      cue: step.cue || "",
      easy: step.easy || "",
      hard: step.hard || "",
    };
  }

  /** Turn warmup / circuit / cooldown into the internal blocks format. */
  window.expandWorkout = function expandWorkout(workout) {
    const blocks = [];

    // Warm-up — no rests between moves by default
    const warmEx = (workout.warmup && workout.warmup.exercises) || [];
    if (warmEx.length) {
      blocks.push({
        id: "warmup",
        name: "Warm-Up",
        kind: "work",
        color: COLORS.warmup,
        steps: warmEx.map((s) => withRest(s, 0)),
      });
    }

    // Circuit rounds — same exercises, N times
    const circuit = workout.circuit || {};
    const rounds = Math.max(1, circuit.rounds || 3);
    const betweenEx = circuit.restBetweenExercises != null ? circuit.restBetweenExercises : 15;
    const betweenRounds = circuit.restBetweenRounds != null ? circuit.restBetweenRounds : 60;
    const circuitEx = circuit.exercises || [];

    for (let r = 1; r <= rounds; r++) {
      if (!circuitEx.length) break;
      const color = COLORS.round[(r - 1) % COLORS.round.length];
      blocks.push({
        id: "round-" + r,
        name: "Round " + r + " of " + rounds,
        kind: "work",
        color,
        steps: circuitEx.map((s, i) => {
          // No rest after last move of the round if a water break follows
          const isLast = i === circuitEx.length - 1;
          const defaultRest =
            isLast && r < rounds && betweenRounds > 0 ? 0 : betweenEx;
          return withRest(s, defaultRest);
        }),
      });

      if (r < rounds && betweenRounds > 0) {
        blocks.push({
          id: "break-" + r,
          name: "Water Break",
          kind: "break",
          color: COLORS.break,
          steps: [
            {
              name: "Sip Water · Shake It Out",
              emoji: "💧",
              seconds: betweenRounds,
              restAfter: 0,
              cue: "Nice work on round " + r + "! Drink, breathe, high-fives.",
              easy: "Rest fully. Catch your breath.",
              hard: "Stay standing, bounce lightly.",
            },
          ],
        });
      }
    }

    // Cool-down — short rests between stretches OK
    const coolEx = (workout.cooldown && workout.cooldown.exercises) || [];
    if (coolEx.length) {
      blocks.push({
        id: "cooldown",
        name: "Cool-Down",
        kind: "cooldown",
        color: COLORS.cooldown,
        steps: coolEx.map((s, i) => {
          const isLast = i === coolEx.length - 1;
          return withRest(s, isLast ? 0 : 10);
        }),
      });
    }

    return blocks;
  };

  window.getWorkoutById = function getWorkoutById(id) {
    return (
      window.WORKOUTS.find((w) => w.id === id) ||
      window.WORKOUTS[0] ||
      null
    );
  };

  /** Flatten expanded blocks into a linear playlist. */
  window.buildPlaylist = function buildPlaylist(workout) {
    const blocks = window.expandWorkout(workout);
    const playlist = [];
    let totalWorkSeconds = 0;

    blocks.forEach((blk, bi) => {
      blk.steps.forEach((step, si) => {
        playlist.push({
          type: "exercise",
          blockId: blk.id,
          blockName: blk.name,
          blockKind: blk.kind,
          blockColor: blk.color,
          blockIndex: bi,
          stepIndex: si,
          name: step.name,
          emoji: step.emoji || "💪",
          seconds: step.seconds,
          cue: step.cue,
          easy: step.easy,
          hard: step.hard,
        });
        totalWorkSeconds += step.seconds;

        if (step.restAfter > 0) {
          const isLastInBlock = si === blk.steps.length - 1;
          const nextBlock = blocks[bi + 1];
          const nextStep = !isLastInBlock
            ? blk.steps[si + 1]
            : nextBlock && nextBlock.steps[0];

          playlist.push({
            type: "rest",
            blockId: blk.id,
            blockName: blk.name,
            blockKind: blk.kind,
            blockColor: blk.color,
            blockIndex: bi,
            stepIndex: si,
            name:
              isLastInBlock && nextBlock
                ? "Up next: " + nextBlock.name
                : "Rest",
            emoji: "😌",
            seconds: step.restAfter,
            cue: nextStep ? "Next: " + nextStep.name : "Almost done!",
            easy: "",
            hard: "",
            nextName: (nextStep && nextStep.name) || "",
            nextEmoji: (nextStep && nextStep.emoji) || "💪",
          });
          totalWorkSeconds += step.restAfter;
        }
      });
    });

    return { playlist, totalWorkSeconds, blocks };
  };

  /** Actual length in minutes (rounded) from the expanded playlist. */
  window.workoutDurationMinutes = function workoutDurationMinutes(workout) {
    const { totalWorkSeconds } = window.buildPlaylist(workout);
    return Math.max(1, Math.round(totalWorkSeconds / 60));
  };
})();
