# Game Ideas

Brainstorming candidates that fit the Wordle formula.

---

## Evaluation Criteria

From our analysis, a strong candidate should have:
- [ ] Rules fit on a postcard (explainable in one breath)
- [ ] Familiar concept people already understand
- [ ] Progressive reveal / narrowing of possibilities
- [ ] Seek vs solve tension (when do I have enough info?)
- [ ] Shareable journey encodable as plain text/emoji
- [ ] Emotional payoff worth broadcasting
- [ ] Cross-generational appeal (no dexterity required)
- [ ] Clean, minimal aesthetic possible
- [ ] Works great on mobile

---

## Idea 1: Image Reveal

**Concept**: Guess what's in a partially hidden image

**Mechanic**:
- Image hidden behind a grid of tiles (4x4? 5x5?)
- Tap tiles to reveal portions
- Guess anytime - fewer reveals = better score
- Daily image, same for everyone

**Familiar game**: "What's behind the curtain" / partially obscured images

**Seek vs solve**: Reveal more tiles, or guess now?

**Share format**:
```
🖼️ Reveal #47 - 3 tiles

⬜⬜🟧⬜
⬜🟧⬜⬜
🟧⬜⬜⬜
⬜⬜⬜✅
```

**Pros**:
- Very simple mechanic
- Visual, universal (no language barrier potential)
- Strategy in *which* tiles to reveal

**Cons**:
- Similar games exist (Framed for movies, etc)
- Content sourcing - what images? Licensing?
- What's the emotional payoff? Recognition?

**Open questions**:
- What category of images? (landmarks, objects, memes, art?)
- How to make it feel fresh vs existing reveal games?

---

## Idea 2: Sound/Audio Reveal

**Concept**: Guess the song/sound from an extending clip

**Mechanic**:
- Sound starts very short (1 second)
- Each attempt extends the clip
- Guess anytime - earlier = better

**Familiar game**: "Name that tune"

**Share format**:
```
🎵 Soundle #47 - 3 listens

🔈━━
🔈━━━━━
🔈━━━━━━━━━ ✅
```

**Pros**:
- Different modality (audio)
- Nostalgic/cultural appeal

**Cons**:
- Audio on web is finicky
- Licensing nightmare for music
- Doesn't work in silent contexts (office, commute)
- Heardle already did this (and died)

---

## Idea 3: Pattern/Sequence Completion

**Concept**: Predict the next element in a sequence

**Mechanic**:
- Shown partial sequence (numbers, shapes, colors)
- More of the pattern revealed each attempt
- Guess the rule/next element

**Share format**:
```
🔢 Sequence #47 - 2 reveals

▢ ▢ ▢ _
▢ ▢ ▢ ▢ _ ✅
```

**Pros**:
- Infinite content generation possible
- Pure logic, no cultural knowledge needed

**Cons**:
- Might feel like an IQ test
- Less emotionally satisfying?
- "Pattern recognition" isn't a familiar casual game

---

## Idea 4: Daily Maze/Path

**Concept**: Find the exit with limited vision

**Mechanic**:
- Maze hidden in fog of war
- Each move reveals adjacent cells
- Find the exit in fewest moves
- Same maze for everyone daily

**Share format**:
```
🌀 Maze #47 - 12 moves

→→↓↓→→↓
↓←←↓→✅
```

**Pros**:
- Spatial reasoning is accessible
- Path itself tells a story
- "Maze" is universally understood

**Cons**:
- Might take too long?
- Mobile maze navigation could be fiddly
- Less "aha" moment, more gradual

---

## Idea 5: Connection/Association

**Concept**: Find the hidden connection between items

**Mechanic**:
- Shown 4-6 items that share a hidden link
- Guess the connection
- Wrong guesses reveal hints
- (Similar to NYT Connections but different reveal mechanic?)

**Pros**:
- "What do these have in common" is familiar
- Satisfying "aha" moment

**Cons**:
- Very close to NYT Connections
- Content creation intensive
- Language/culture dependent

---

## Idea 6: Spot the Difference (Progressive)

**Concept**: Find differences between two images

**Mechanic**:
- Two nearly identical images
- Find X differences
- Hints progressively highlight regions
- Fewer hints used = better score

**Share format**:
```
👀 Spot #47 - 2 hints used

Found: 🔴🔴🔴🔴🔴
Hints: 💡💡⬜⬜⬜
```

**Pros**:
- Very familiar game
- Visual, universal
- Satisfying to find differences

**Cons**:
- Content creation intensive
- Might be too easy or too hard to balance
- Less strategic depth?

---

## Idea 7: [Action] Daily Gauntlet

**Concept**: Complete a short obstacle course in limited attempts

**Mechanic**:
- Same short level for everyone daily
- 5 attempts to complete it
- Learn the patterns through failure
- Fewer attempts = higher skill

**Share format**:
```
🦀 Gauntlet #47 - 3 attempts

🦅 ━━━━━━━━━━━━━━ 45%
🌊 ━━━━━━━━━━━━━━━━━━ 67%
✅ ━━━━━━━━━━━━━━━━━━━━━━━ 100%
```

**Pros**:
- Novel take on Wordle formula
- Action is underexplored in this space
- Learning through failure is satisfying

**Cons**:
- Dexterity required (limits audience)
- Mobile controls for action games are hard
- Might not appeal cross-generationally

---

## Idea 8: Daily Path / Connect the Dots

**Concept**: Find the hidden path through a grid of dots

**Mechanic**:
- Grid of dots (5x5? 6x6?)
- Hidden path connects some dots from start to end
- Draw segments between dots as your guess
- Feedback shows which segments match the hidden path
- Green = correct segment, Gray = wrong, Yellow = dot is on path but segment isn't?

**Constraints to explore**:
- Limited total segments you can draw (like limited guesses)
- Limited segments *per attempt* (forces chunked exploration)
- Only see start point, have to find end
- See both start and end, have to find route
- Path length is hinted or hidden?

**Two-path variant**:
- There are TWO hidden paths (A and B)
- Feedback tells you "this segment is part of a path" but not WHICH path
- You have to deduce which segments belong to which path
- Paths could intersect (shared segments?) or not
- Win condition: trace both complete paths
- Adds a layer of deduction beyond just finding the route
- Share could show: "Found Path A in 3 attempts, Path B in 2"

**Richer feedback variant (Wordle-style three states)**:
- Green = correct segment (right dot, right direction)
- Yellow = this dot is on the path, but you drew the wrong segment from it
- Gray = not part of the path at all
- Now you know "something connects here" but have to deduce *which direction*
- Adds genuine deduction layer vs just binary on/off

**Aggregate feedback variant**:
- Instead of showing which segments, show counts by type:
- "Horizontal: 3/5, Vertical: 2/4, Diagonal: 0/2"
- Tells you *what types* of segments exist without revealing *where*
- Similar to Mastermind feedback
- Forces you to deduce placement from type counts

**Familiar game**: Connect the dots, maze, "find the path"

**Seek vs solve**:
- Short exploratory draws to map territory
- vs. committing to longer path guesses
- "Do I know enough of the path to complete it?"

**Share format**:
```
🔵 Pathle #47 - 4 attempts

Segments: ██░░██████░░██████ ✅
```
Or show the actual path shape?

**The positional/binary problem**:
- A single hidden path is binary: segment is there or it isn't
- Showing which segments are correct basically IS the solution
- Degrees of freedom too low for interesting, non-spoiling clues
- In Wordle, every slot is filled and has 26 options - here it's just on/off

**Possible fixes to increase degrees of freedom**:
- Multiple colored lines to find (every guess fills all spaces, question is assignment)
- Entire grid filled with segments - question isn't "where" but "which belong to what"
- Different segment types (not just present/absent) - direction, color, weight
- The grid is always full, you're sorting/categorizing, not finding blanks

**Key design challenge**: need enough entropy per position that feedback is interesting to give AND non-revealing when shared

**Pros**:
- Drawing on mobile is natural
- Progressive reveal of the path
- Clear seek vs solve decision
- Could have elegant visual share

**Cons**:
- Might be too abstract?
- Path validation could be tricky (partial matches?)
- Need to nail the grid size and path complexity
- The binary nature (segment/no segment) may not support rich enough clues

---

## Idea 9: Action Gauntlet (Expanded)

**Concept**: Complete a 90-second obstacle course in limited attempts

**Mechanic**:
- Same level for everyone, daily
- Fixed length (~90 seconds if played perfectly)
- 5 attempts to complete it
- Obstacles are learnable patterns (not random)
- Each death teaches you something

**The "hint" is experience itself** - patterns become familiar, muscle memory builds

**Share format**:
```
🦀 Gauntlet #47 - 3/5 attempts

🦅 ━━━━━━━━━━━━━━ 34s
🌊 ━━━━━━━━━━━━━━━━━━━━━ 58s
✅ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 90s
```

**Key insight**: This inverts the Wordle formula slightly:
- Wordle: information reveals make it easier
- Gauntlet: experience/muscle memory makes it easier
- Both: skill = succeeding with less help

**Pros**:
- Novel application of the formula
- High emotional payoff (triumph over challenge)
- The share tells a clear struggle/victory story

**Cons**:
- Dexterity required (limits audience)
- Mobile controls are hard
- Might not appeal to crossword crowd

---

## Idea 10: Drawing Reveal / Color Match

**Concept**: Draw on a hidden image, get feedback on how close you are

**Mechanic**:
- Image hidden beneath canvas
- You draw strokes/shapes
- Feedback based on how your drawing matches underlying colors/shapes
- Hot/cold style feedback?

**Still fuzzy on**:
- What exactly is the feedback? Color accuracy? Shape matching?
- What are you trying to guess? The whole image? A specific element?
- How does this become a clear win/lose?

**Might combine with other ideas** - drawing as input method is mobile-friendly

---

## Idea 11: ???

What are we missing? What familiar games haven't been Wordle-ified yet?

- 20 questions?
- Hot/cold seeking?
- Memory matching?
- Jigsaw puzzle?
- Crossword variant?
- Map/geography guessing?
- Timeline ordering?

---

## Notes

- Leaning toward visual/image reveal as safest bet
- Action game is most interesting/novel but highest risk
- Need to identify what makes ours *unique* vs existing games
- The "one-liner" pitch matters a lot

