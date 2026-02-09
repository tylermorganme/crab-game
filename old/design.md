# Game Design Document

## Why Wordle Works

### Dead Simple to Learn
- One sentence explanation: "Guess the 5-letter word in 6 tries"
- No tutorial needed, no onboarding friction
- The constraints (5 letters, 6 guesses) are immediately clear

### The Rules Fit on a Postcard
Wordle's entire ruleset is three lines:
1. Guess the Wordle in 6 tries
2. Each guess must be a valid 5-letter word
3. The color of the tiles will change to show how close your guess was

That's it. Then three examples showing green/yellow/gray. The whole game explained in under 50 words. You can teach someone in one breath. This is essential for word-of-mouth virality - if you can't explain it quickly, people won't pass it on.

### Progressive Information Reveal
- Each guess gives you more information
- Green = right letter, right place
- Yellow = right letter, wrong place
- Gray = letter not in word
- The game literally gets easier with every attempt

### The Skill Ceiling Paradox
- **Core insight**: The game becomes easier over time, so skill = winning while it's still hard
- A 2-guess solve means you won with minimal information
- A 6-guess solve means you needed maximum help
- This creates natural difficulty scaling for all skill levels
- Satisfying for casuals (eventually get there) AND experts (race against the assist)

### Infinite to One: Collapsing the Solution Space
- You start with near-infinite possibilities (~13,000 valid words, infinite if counting invalid)
- Each guess collapses the space dramatically
- The journey is from chaos to certainty
- Feedback tells you HOW the space collapsed, not just THAT it did
- Satisfying because you can feel the funnel narrowing

### The Share Mechanic
- Encodes your *journey* without spoiling the answer
- Visual, compact, platform-agnostic (just emoji)
- Shows: how many guesses, the shape of your solve, your strategy
- Creates social comparison without explicit competition
- It's a flex that invites conversation ("how'd you get it in 2?!")

### Share is Plain Text, Not an App Integration
- Click "Share" and it copies text to clipboard - no app opens
- Just unicode emoji that paste anywhere
- Works on every platform: Twitter, iMessage, WhatsApp, Discord, Slack, email, SMS
- No OAuth, no permissions, no API dependencies
- Lowest common denominator of sharing - maximum reach
- The game doesn't need to "know" where you're sharing

### What the Share Actually Needs to Be
The share isn't just "encoding" - it needs to be:
- **Easily understandable**: anyone can glance at it and get the gist
- **Interesting to look at**: visual appeal, not just data
- **Shows "generally how well"**: the vibe/trend, not specific data
- **Spoiler-free**: can't reverse-engineer the solution from it
- The Wordle grid works because colors show struggle/success pattern without revealing letters
- High entropy in the solution space means the share can show more detail safely
- Low entropy puzzles (small grids, limited options) need more abstract shares

### What Makes Clues Giveaways vs Non-Revealing Stories?

Key question: when do clues help the *player* without spoiling for *spectators*?

**Wordle gets away with it because:**
- Every slot is always filled (5 letters, always 5 positions)
- It's about *which* value in each slot, not *whether* a slot is occupied
- 26 options per position = high entropy per slot
- Knowing "position 3 is green" doesn't tell a spectator which letter

**Binary/spatial games struggle because:**
- A position either has something or doesn't (pipe/no pipe, segment/no segment)
- Degrees of freedom are too low - there's not enough room between "giveaway" and "useless"
- Showing "this position is correct" in a sparse grid IS the answer
- The positional nature means correct/incorrect maps directly to the solution

**The insight:** clues are safe to share when there's enough entropy per position that knowing the *result* doesn't reveal the *input*. Need headroom between what the clue says and what the answer is.

**Possible solutions for spatial games:**
- Fill ALL positions (not sparse) - every space has something, question is what
- Multiple valid options per position (not binary)
- Aggregate feedback that doesn't map to specific positions

### Entropy Distribution: Slots vs Options

Two ways to build the same total entropy:

| | Slots | Options per slot | Example |
|---|---|---|---|
| **Wordle model** | Few (5) | Many (26) | 5 letters, 26 choices each |
| **Line/Grid model** | Many (all segments) | Few (2: on/off) | Grid with binary segments |

Both can have large total solution spaces but the **distribution** matters:

- **Few slots, many options**: per-slot feedback is safe (green doesn't reveal which of 26)
- **Many slots, few options**: per-slot feedback IS the answer (green = it's on)

This is a fundamental design axis. If we go spatial/grid-based, we need to either:
1. Increase options per slot (not just on/off)
2. Give aggregate/grouped feedback instead of per-slot
3. Make feedback about relationships between slots, not individual slots

### Emotional Payoff Worth Sharing
- People share because they *feel* something - smart, proud, relieved
- Wordle makes you feel clever for solving it
- Doesn't have to be "smart" - could be skilled, lucky, triumphant
- The share is a humble brag dressed as a story
- Key question: **what feeling does our game give that people want to broadcast?**

### Immediate, Unambiguous Feedback
- Every guess instantly tells you something
- No waiting, no interpretation needed
- The feedback *teaches* you without explaining
- You're never wondering "did I win?" - success/failure is binary and obvious

### Familiar Domain, No Knowledge Barrier
- You already know English words
- It's deduction within a space you own
- Not trivia - you're not punished for not knowing obscure facts

### Low Floor, High Ceiling
- Anyone can guess a word (no skill floor)
- But optimal play has depth (starter words, letter frequency, elimination strategy)
- Casuals and sweats both feel satisfied

### Cross-Generational Appeal
- Purely mental, no physical dexterity required
- A 70-year-old and a 25-year-old are on equal footing
- No reflexes, no motor skills, no time pressure
- This maximizes potential audience for virality
- Action/skill games naturally filter out older players, less dexterous players
- For max viral potential: avoid mechanics that require physical skill

### Tension Escalates
- Guess 1 feels exploratory, guess 5 feels desperate
- Natural drama arc built into the structure
- The stakes rise without the game changing

### Respects Your Time
- One puzzle. Done. Come back tomorrow.
- Doesn't try to extract more playtime
- Artificial scarcity makes it feel precious, not disposable

### Daily Ritual
- One puzzle per day, same for everyone
- Creates shared experience and water cooler talk
- Artificial scarcity prevents burnout
- FOMO drives return visits

### Familiar Game, Fresh Spin
- Wordle didn't invent word guessing - it's hangman with better mechanics
- People already know how to play before they start
- No learning curve on the *concept*, just the specifics
- The innovation is in execution: daily ritual, share mechanic, progressive reveal
- **Key filter**: what existing game could we give the Wordle treatment?

### Cozy, Not Stressful
- No timer - take 10 seconds or 10 minutes per guess
- You can pore over it, think deeply, strategize
- Make an attempt, come back in an hour, dump the rest
- Room for thought between attempts
- Tension comes from limited *attempts*, not limited *time*
- Relaxed and contemplative, not anxious

### No Login Required
- Zero friction to play
- Lowers barrier to sharing (recipient can play immediately)

### Minimal Juice, Clean Interface
- Almost no animations, sound effects, or visual flourishes
- The satisfaction comes from the gameplay, not the UI
- Clean, uncluttered design - nothing competes for attention
- Feels calm and focused, not overstimulating
- Easily playable on mobile - touch-friendly, works in portrait
- No pinching, zooming, or precise gestures required

### Aesthetic Restraint = Respectability
- Doesn't look like Candy Crush or a "casual game"
- No jelly, candy, explosions, or gamified visual language
- Feels more like a crossword than a mobile game
- This attracts people who wouldn't play "games"
- The simplicity signals: this is worth your time, not a time-waster

### Seek vs Solve: The Core Decision
- At any moment: "Do I gather more info, or go for the answer?"
- Early game: mostly seeking (exploring the solution space)
- Late game: pressure to solve (running out of attempts)
- The strategic question: "Do I know enough yet?"
- This is where skill lives - knowing when you have enough info
- Sometimes you just go for it and get lucky - that's part of the fun

### Attempts Are Isolated
- Each guess is mechanically independent - previous guesses don't constrain options
- You can always guess any valid word, no matter what came before
- No resources depleted, no damage, no changing board state
- **Mechanically stateless, informationally stateful**
- The only thing that accumulates is knowledge in your head
- The only "cost" of a guess is one of your limited attempts
- Keeps the game clean and simple - no compound complexity

### UI Does the Bookkeeping
- The keyboard shows which letters you've tried and their results
- You don't have to remember everything - the state is visible
- Reduces cognitive load while keeping information accessible
- Lets you focus on strategy, not memory

### Validation Forces Intentionality
- You can't guess random letters - must be a valid word
- Every attempt is a deliberate choice, no flailing
- Raises the floor on quality of play
- This constraint is part of what makes it feel "fair"

### Depth Reveals Itself Through Play
- Rules are simple, but strategy has layers
- You start playing casually, then realize early guesses are precious
- Learning curve isn't in the rules - it's discovered through experience
- "I wasted my early attempts" = the game teaching you to play better
- This is low floor, high ceiling in action
- **Discovered urgency**: understanding the depth creates self-imposed pressure
- At first: "6 tries is plenty" / After learning: "my first 2 guesses are crucial"
- Self-discovered stakes are more compelling than designed pressure

---

## Principles: Load-Bearing vs Incidental

The next Wordle-scale hit will break some "rules" while keeping others. Knowing which are essential vs. specific to Wordle is the insight.

### Likely Load-Bearing (carry these forward)
- Progressive narrowing (some form of "getting easier" over attempts)
- Shareable journey that tells a story
- Emotional payoff worth broadcasting
- Limited attempts creating tension
- Same challenge for everyone (shared experience)
- Familiar concept, fresh execution
- Respects your time
- Immediate, unambiguous feedback
- Low floor, high ceiling

### Possibly Incidental (could break these)
- Turn-based (could be attempt-based in an action context)
- No timer (tension could come from elsewhere)
- Purely mental (physical skill could work for different audience, but limits virality)
- Text-based (visual, audio, spatial all viable)
- Single correct answer (could be "reach the goal" instead of "find THE answer")

---

## Hackathon Success Criteria

From the brief, the game needs:
1. **Browser-based** - no install, instant play
2. **Viral hook** - shareable, conversation-starting
3. **Hinting mechanism** - progressively narrows path to solution
4. **Quick sessions** - playable in a couple minutes
5. **No login** - frictionless

---

## Core Mechanic We're Exploring

**The better you are, the less help you need.**

In Wordle, hints come from your guesses. The more you guess, the more you know.

The trick: can we find a mechanic where:
- Information/assistance is revealed progressively
- Solving early (with less help) is the skill expression
- The journey can be encoded in a shareable format
- It's simple enough to explain in one sentence

---

## The Share Tells a Story

Key reframe: the share doesn't have to be a grid. It just needs to **encode the journey as a narrative**.

Different formats for different game types:

**Grid** (Wordle-style): Each row is an attempt, colors show progress
**Graph/Timeline** (Action games): Bars showing attempts, icons showing what killed you
**Path** (Maze/exploration): The route you took visualized
**Sequence** (Rhythm/timing): When you hit/missed

### Action Game Example: Infinite Runner

```
🦀 Crab Run #47 - 5 attempts

🦅 ━━━━━━━━━━━━━━━━━━━━━ 412m
🦅 ━━━━━━━━━━━━━━━━━━━━━━━━━━━ 623m
🌊 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 847m
🌊 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 952m
✅ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1,247m
```

This tells a story: "kept dying to birds, figured that out, then waves got me, finally nailed it."

**In action games, the "hint" is experience itself.** The patterns become familiar, muscle memory builds. Progressive difficulty through learning rather than information reveal.

This could be a more interesting/novel take than another puzzle game.

---

## Candidate Directions

### 1. Visual Reveal (Current Front-runner)
- Image hidden behind grid of tiles
- Reveal tiles to get clues, guess anytime
- Fewer reveals = higher skill
- Share shows which tiles you revealed

```
🦀 Crab Game #47 - 4 reveals

⬜⬜⬜🟧
⬜🟧⬜⬜
🟧⬜⬜⬜
⬜⬜🟧✅
```

**Pros**: Simple, visual, strategy in tile selection
**Cons**: Need good image sourcing, might be too similar to existing games

### 2. Audio Reveal
- Sound clip that extends each round
- Guess the song/sound/quote
- Similar to Heardle (RIP)

**Pros**: Different modality, nostalgic appeal
**Cons**: Audio on web is finicky, licensing concerns

### 3. Pattern/Sequence Completion
- Reveal more of a pattern each round
- Guess what comes next

**Pros**: Infinite content generation possible
**Cons**: Might feel more like an IQ test than a game

---

## Open Questions

- What's the content? (images of what? sourced from where?)
- What's the daily cadence? (one per day? multiple categories?)
- What makes ours *unique* vs other reveal games?
- What's the one-liner that makes someone want to play?

---

## Next Steps

1. Pick a direction
2. Define the exact mechanic and rules
3. Prototype the core loop
4. Design the share format
5. Build it
