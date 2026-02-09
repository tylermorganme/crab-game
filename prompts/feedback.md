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
