# What Makes Wordle Work

## It's Hangman With Better Mechanics
Wordle didn't invent word guessing. People already know how to play before they start. There's no learning curve on the concept, just the specifics. It feels familiar the moment you see it.

## Three Rules, Fifty Words
The entire game fits on a postcard:
1. Guess the word in 6 tries
2. Each guess must be a valid 5-letter word
3. Tiles change color to show how close you are

Three examples showing green/yellow/gray and you're done. You can teach someone in one breath. If you can't explain it quickly, people won't pass it on.

## The Game Gets Easier. That's the Point.
Each guess gives you more information. The game literally becomes simpler with every attempt. A 2-guess solve means you won while it was still hard. A 6-guess solve means you needed maximum help. This creates natural difficulty scaling - satisfying for casuals (they'll get there eventually) and experts (who race against the assist).

## Infinite to One
You start with ~13,000 possibilities and each guess collapses the space dramatically. The journey is from chaos to certainty. You can *feel* the funnel narrowing. That feeling is satisfying on a deep level - order emerging from noise.

## Seek vs Solve
At any moment you're weighing: "Do I gather more information, or go for the answer?" Early game feels exploratory. Late game feels desperate. That decision point is where the skill lives. Sometimes you just go for it and get lucky - that's part of the fun too.

## Attempts Are Isolated
Each guess is mechanically independent. You can always guess any valid word regardless of what came before. No resources deplete, no board state changes. The only thing that accumulates is knowledge in your head. Mechanically stateless, informationally stateful.

## The Share Tells a Story
The share encodes your *journey* without spoiling the answer. It's not a data export - it's a narrative. The colored grid shows the shape of your struggle and triumph. Someone who knows the game reads it like a little story.

It's plain text - unicode emoji copied to your clipboard. No app opens, no OAuth, no permissions. Works on every platform, in every chat app, in every text field. The lowest common denominator of sharing.

The share needs to be easily understandable, interesting to look at, and show the vibe of how well you did. Not specific data - the feeling.

## People Share Because They Feel Something
Wordle makes you feel clever. The share is a humble brag dressed as a story. People don't share data - they share feelings. Smart, proud, relieved, triumphant. The specific emotion shapes the audience.

## You Can Fail
Six tries, then you're done. That failure state is real. Every guess matters because failure is on the table. The share isn't just a brag - sometimes it's a lament.

## It's Cozy
No timer. Take 10 seconds or 10 minutes per guess. Make an attempt, come back in an hour, dump the rest later. Room for thought between attempts. Tension comes from limited attempts, not limited time. Relaxed and contemplative, not anxious.

## Everyone Gets the Same Puzzle
One puzzle per day, same for everyone. Creates shared experience and water cooler talk. Artificial scarcity prevents burnout and makes it feel precious. FOMO drives return visits.

## It Respects Your Time
One puzzle. Done. Come back tomorrow. It doesn't try to extract more playtime. This is the opposite of most games.

## Anyone Can Play
Purely mental, no physical dexterity. A 70-year-old and a 25-year-old are on equal footing. No reflexes, no motor skills, no time pressure. This is essential for broad virality.

## Depth You Discover Yourself
Rules are simple, but strategy has layers. You start casually, then realize your early guesses are precious. "I wasted my attempts" is the game teaching you to play better. At first: "6 tries is plenty." After learning: "my first 2 guesses are crucial." Self-discovered stakes feel more real than designed pressure.

## Validation Forces Intentionality
You can't guess random letters. Every attempt must be a real word, which means every attempt is a deliberate choice. No flailing. This constraint raises the floor on quality of play.

## The UI Stays Out of the Way
Minimal animations. No sound effects. No celebrations. Clean and uncluttered. Feels more like a crossword than a mobile game. The satisfaction comes from the gameplay, not the UI. This aesthetic restraint signals respectability - it attracts people who wouldn't be caught dead playing Candy Crush.

The on-screen keyboard tracks your letter state so you don't have to remember. The UI does the bookkeeping while you focus on strategy.

Works perfectly on mobile in portrait with one thumb.

## The Name
One word. Easy to spell. Easy to say out loud. Googleable. Memorable after hearing it once. A play on "word." The creator's name (Wardle) gave it a personal, handmade feel.

## Entropy: Slots vs Options
Wordle has few slots (5 letters) with many options each (26 letters). This means per-slot feedback is safe to show - knowing "position 3 is green" doesn't tell you which letter. Games with many slots and few options per slot (like binary on/off grids) have the opposite problem: showing which positions are correct *is* the answer. The distribution of entropy matters for how feedback and sharing can work.
