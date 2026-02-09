# Agent Prompt: Build a Game Prototype

## The Brief

A browser-based game with a viral hook. Fun and shareable, with a hinting mechanism that narrows the path to a solution. Playable in a couple of minutes, no login required.

## Design Philosophy

The following observations about what makes Wordle successful should inform your design. These are not rules — they're observations about what works emotionally and why. Your game does not need to be a Wordle clone. It needs to be fun, shareable, and make the player feel clever.

---

### It's Hangman With Better Mechanics
Wordle didn't invent word guessing. People already know how to play before they start. There's no learning curve on the concept, just the specifics. It feels familiar the moment you see it.

### Three Rules, Fifty Words
The entire game fits on a postcard:
1. Guess the word in 6 tries
2. Each guess must be a valid 5-letter word
3. Tiles change color to show how close you are

Three examples showing green/yellow/gray and you're done. You can teach someone in one breath. If you can't explain it quickly, people won't pass it on.

### The Game Gets Easier. That's the Point.
Each guess gives you more information. The game literally becomes simpler with every attempt. A 2-guess solve means you won while it was still hard. A 6-guess solve means you needed maximum help. This creates natural difficulty scaling — satisfying for casuals (they'll get there eventually) and experts (who race against the assist).

### Infinite to One
You start with ~13,000 possibilities and each guess collapses the space dramatically. The journey is from chaos to certainty. You can feel the funnel narrowing. That feeling is satisfying on a deep level — order emerging from noise.

### Seek vs Solve
At any moment you're weighing: "Do I gather more information, or go for the answer?" Early game feels exploratory. Late game feels desperate. That decision point is where the skill lives. Sometimes you just go for it and get lucky — that's part of the fun too.

### Attempts Are Isolated
Each guess is mechanically independent. You can always guess any valid word regardless of what came before. No resources deplete, no board state changes. The only thing that accumulates is knowledge in your head. Mechanically stateless, informationally stateful.

### The Share Tells a Story
The share encodes your journey without spoiling the answer. It's not a data export — it's a narrative. The colored grid shows the shape of your struggle and triumph. Someone who knows the game reads it like a little story.

It's plain text — unicode emoji copied to your clipboard. No app opens, no OAuth, no permissions. Works on every platform, in every chat app, in every text field.

The share needs to be easily understandable, interesting to look at, and show the vibe of how well you did. Not specific data — the feeling.

### People Share Because They Feel Something
Wordle makes you feel clever. The share is a humble brag dressed as a story. People don't share data — they share feelings. Smart, proud, relieved, triumphant.

### You Can Fail
Six tries, then you're done. That failure state is real. Every guess matters because failure is on the table.

### It's Cozy
No timer. Take 10 seconds or 10 minutes per guess. Room for thought between attempts. Tension comes from limited attempts, not limited time. Relaxed and contemplative, not anxious.

### Everyone Gets the Same Puzzle
One puzzle per day, same for everyone. Creates shared experience and water cooler talk.

### It Respects Your Time
One puzzle. Done. Come back tomorrow. It doesn't try to extract more playtime.

### Anyone Can Play
Purely mental, no physical dexterity. A 70-year-old and a 25-year-old are on equal footing. No reflexes, no motor skills, no time pressure. This is essential for broad virality.

### Depth You Discover Yourself
Rules are simple, but strategy has layers. You start casually, then realize your early guesses are precious. Self-discovered stakes feel more real than designed pressure.

### Validation Forces Intentionality
Every attempt must be a deliberate choice. No flailing. Constraints raise the floor on quality of play.

### The UI Stays Out of the Way
Minimal animations. Clean and uncluttered. Feels more like a crossword than a mobile game. The satisfaction comes from the gameplay, not the UI. Works perfectly on mobile in portrait with one thumb.

### Entropy: Slots vs Options
Wordle has few slots (5 letters) with many options each (26 letters). Per-slot feedback is safe to show because it doesn't reveal the answer. Games with many slots and few options per slot have the opposite problem: showing which positions are correct IS the answer. The distribution of entropy matters for how feedback and sharing can work.

---

## Technical Instructions

You are building inside a Next.js 16 app with React 19, TypeScript, and Tailwind CSS v4.

### File Structure

All your files go in a single directory:

```
app/games/submissions/{your-game-id}/
```

You MUST create:
1. `meta.json` — game metadata
2. `page.tsx` — your game entry point (this becomes the route)
3. Any additional component files you need — keep them all in your directory

### meta.json format

```json
{
  "id": "your-game-id",
  "name": "Your Game Name",
  "description": "One sentence describing the game",
  "focus": "Which design principles you focused on"
}
```

The `id` MUST match your directory name. Use a descriptive kebab-case slug. To avoid collisions with other agents, append a random 4-digit number to your ID (e.g. `color-guess-3847`, `pattern-match-0192`). Do NOT use generic names like "signal-break" or "puzzle-game" — be specific and unique.

### page.tsx

Must be a `"use client"` component. Include a back link to the hub:

```tsx
"use client";

import Link from "next/link";

export default function YourGame() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <nav className="mx-auto max-w-md px-6 pt-6">
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300">
          &larr; Back
        </Link>
      </nav>
      <main className="mx-auto max-w-md px-6 py-8">
        {/* Your game here */}
      </main>
    </div>
  );
}
```

### Styling

Use Tailwind CSS classes. The app uses a zinc color palette with light/dark mode support via `dark:` prefix. Keep it clean and minimal.

## Constraints

- **No bespoke graphics.** No images, sprites, or assets. Use CSS, SVG, Canvas API, emoji, unicode characters, Tailwind styling. This is plenty.
- **Minimal dependencies.** React 19, Next.js 16, and Tailwind v4 are already installed. You can `npm install` additional packages if you really need to, but you probably won't.
- **No shared file edits.** Do not modify ANY files outside your submission directory. No touching package.json, layout.tsx, config files, or other submissions.
- **Mobile-first.** Must work well on a phone in portrait mode. Touch-friendly. No hover-only interactions.
- **Self-contained.** Everything your game needs lives in your directory.

## What "Done" Looks Like

Your submission must include:

1. **A playable game** with a clear mechanic that someone can understand in seconds
2. **5 daily puzzles baked in** — 5 pre-designed puzzles that a user tester can play through (think: 5 days worth of content). Not procedurally generated randomness.
3. **A win/lose state** — the player must be able to succeed or fail
4. **A share mechanic** — something easily shareable that users would want to post on social media. Could be copy-to-clipboard text, a generated image, or anything that facilitates virality. The share should tell the story of the attempt without spoiling the puzzle. It should make someone who sees it want to play.
5. **A hinting mechanism** — something that progressively narrows the path to the solution
6. **Roughly polished** — it should feel intentional, not broken. Clean layout, readable text, responsive
7. **Fun** — the player should feel clever, satisfied, or triumphant when they win

## Important

- The game must be PLAYABLE. Not a mockup. Not a wireframe. A person should be able to sit down and play 5 rounds.
- Make the player feel clever. This is the most important emotional target.
- The share mechanic is critical — if someone sees the share on social media, they should want to try the game.
- Keep the rules simple enough to explain in one sentence.
- You have creative freedom on the game concept. Puzzle, deduction, spatial, pattern, word, logic — anything goes as long as it doesn't need bespoke graphics.

---


## Your Directive

Break one or more of the design observations intentionally. The next viral game won't follow Wordle's playbook exactly — it'll violate expectations somewhere interesting.

Some rules worth breaking:
- "Anyone Can Play" — what if it requires a specific skill and that's what makes it special?
- "It's Cozy" — what if time pressure is the entire thrill?
- "Attempts Are Isolated" — what if your previous attempts change the game state?
- "No timer" — what if speed is the skill expression?
- "Purely mental" — what if dexterity is the point?
- "Everyone Gets the Same Puzzle" — what if asymmetry is the hook?

State which observation(s) you're breaking and WHY in your `meta.json` focus field. "Breaking X because Y" format. The game still needs to be fun, shareable, and make the player feel something worth sharing. You're not abandoning the philosophy — you're finding where it bends.

---

# Feedback From Playtesting

Learn from these. Previous agents built games and a human playtested them. This is what worked and what didn't. Use this to make better design choices.

---

## General Patterns

### "Guess the number" is not fun
Multiple games fell into the trap of making the core mechanic "guess a numeric value and get told higher/lower." This feels random, not clever. A skilled player can brute-force it mechanically (binary search) which is optimization, not deduction. The player doesn't feel smart — they feel fiddly.

**The fix:** The answer space should involve discrete, meaningful choices — not continuous sliders or numeric dials. The player should reason about *categories*, *relationships*, or *structure* — not converge on a number. Think "which of these things?" not "how much of this thing?"

### Show the answer after the game ends
When the game is over (win or lose), reveal what the correct answer was. Players want to see how close they were. It creates a learning moment and emotional closure.

### The clues must feel necessary
If a player can brute-force the answer through trial and error without needing the hinting/feedback system, the game lacks tension. The possibility space needs to be large enough that you *can't* just guess your way through — you need the clues. The hinting mechanism should feel like a lifeline, not a decoration.

### Start with real entropy
The player should look at the initial puzzle and feel genuinely overwhelmed by possibilities. If the constraints are tight enough that a clever person can deduce the answer from the starting state alone, the game has no journey. There should be a real "I have no idea" moment at the start that gradually resolves through play. Too few options or too many visible constraints kills this.

---

## Signal Lock (4-dial frequency tuning)
- **Variant:** single-focus (Infinite to One)
- **Bad:** Guessing numbers isn't fun. Feels too random. No sense of being smart for guessing a number. The "narrowing" is just binary search on 4 independent dials.
- **Takeaway:** Collapsing a possibility space is satisfying, but only when the *reasoning* is interesting. Four independent number guesses have no interplay — each dial is its own isolated binary search. The dimensions need to interact so that learning about one thing teaches you about another.

## Chroma (color guessing with HSL sliders)
- **Variant:** full-spirit
- **Bad:** Same core issue — essentially guessing numbers. A pro could nail it in 1-2 tries by eyeballing HSL values. Feels fiddly, not clever. Also: doesn't show the actual target color after the game ends, so you never get closure on how close you were.
- **Takeaway:** Visual/aesthetic domains are promising (colors are universally understood), but the *input mechanism* matters. Sliders that converge on a value aren't a puzzle — they're a calibration exercise. If you use a visual domain, the choices should be discrete and meaningful (e.g. "is it warmer or cooler?" not "set hue to 187").

## Link Five (compound word chain)
- **Variant:** full-spirit
- **Score:** 6/10
- **Good:** Playable, discrete meaningful choices, structural reasoning about word relationships.
- **Bad:** The possibility space is too small. With only 8 words (5 correct + 3 decoys), you can brute-force the chain without needing the clue system. The hints feel unnecessary.
- **Takeaway:** The answer space must be large enough that the player genuinely *needs* the feedback to narrow down. If trial and error works without clues, the game lacks tension. Either increase the number of options, add more dimensions of uncertainty, or make each guess more costly.
