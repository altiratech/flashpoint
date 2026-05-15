# Flashpoint Product Audit & Implementation Plan

Date: 2026-05-12

---

## 2026-05-15 Implementation Status

High-priority audit issues are materially reduced, not erased. The setup screen is less admin-heavy, first briefing density is lower, truth reads now cap at the strongest items, Homefront signals make ordinary-life pressure visible without day-one panic inflation, and the selected-response state has one primary commit control. Mobile decision transitions now land on the urgent call surface, and the selected-response review strip appears only after the player selects a move. The optional custom-response field now stays collapsed and quiet until opened, so the main decision surface no longer shows advanced system-log scaffolding by default. Action cards and selected-response consequence reads now use direct player-facing language instead of response-envelope/policy shorthand, while ambiguous text commands such as `sanctions` still route to review rather than accidental execution. Timed mode now starts with an authored 90-second opening clock in the flagship scenario, exposes an extendable first decision clock, and resolves expired countdowns across briefing/decision views and resume. Briefings now promote the resolved turn's consequence images before generic beat previews and quarantine `img_###` fallback art from support visuals when stronger evidence exists, so the White House, semiconductor-fab, and market-crash images surface in the real public/economic path without generic filler. Final reports now carry Homefront consequences, preserve selected variant/custom decision labels through custom-response report paths, promote a state-derived aftermath image from existing local raster assets, use plainer player-facing labels, and render roads-not-taken branches with readable labels instead of raw action IDs or gate syntax.

Still open or intentionally deferred: selected-decision screens do not promote imagery because the v1 review/commit moment should stay focused on the pending action; deeper authored debrief text can still be tuned if Ryan wants the entire report to sound more civilian than policy-room. These are not blocking the current playable-v1 loop, but they remain the next product-quality frontier before a broader public demo.

---

## 1. Current Experience Diagnosis

Flashpoint currently plays like a well-structured policy simulation built for someone who already thinks in terms of "escalation indices" and "alliance trust." The design system is strong — the dark console aesthetic, CRT scanlines, amber accents, and IBM Plex type all feel purposeful. The game engine is solid: seeded RNG, beat graph traversal, Monte Carlo balance testing, and a working timer system.

But the player experience has a fundamental tone problem. The game says "you are an everyday American watching a national emergency unfold." The UI says "you are a policy analyst at a classified terminal." These two identities fight each other on every screen.

The briefing phase buries the player in small-font cards — truth model, verified facts, working theories, unknowns, watch items, supporting signals, immediate outcome, turn debrief, action narrative, rival desk, alliance desk — all rendered between 0.54rem and 0.78rem. Instead of feeling like breaking news that makes your stomach drop, it feels like reading a classified cable on a bad monitor.

The decision phase is better. The amber-bordered "action-required-shell" is the strongest visual moment in the game. But the 6 action cards use abstract policy language ("Use commercial and financial pressure to impose cost beyond the military channel") instead of language a real person would use under fear. The 3-step instructional guide ("Select → Consult → Confirm") is unnecessary scaffolding for an interface that should feel urgent, not tutorial.

Images exist but are constrained to small panels alongside dense text. They should be the emotional anchor of each turn — the thing that makes you feel the crisis — but they're treated as evidence thumbnails.

The start screen has the most chrome: run profile, advanced options, operator notes, recent activity, active runs, completed reports, seed input. It reads as an admin dashboard, not the opening of a thriller.

The copy throughout is competent but sterile. Phrases like "response envelope," "operational indicators," "narrative emphasis," "commercial actors stopped treating the disruption like a bluff" — all accurate, all bloodless. Nobody who just watched gas prices spike and grocery shelves empty thinks in terms of "commercial actors."

What works well and must be preserved:
- The core turn loop (brief → decide → resolve) is mechanically sound
- The amber action-required shell is the right emotional peak
- 4 advisors with distinct personalities and stances create real tension
- Timer/countdown system adds genuine pressure
- Hidden downsides with 22 categories are a great mechanic
- Truth model (verified/theories/unknowns) is a strong concept
- CRT/console aesthetic is distinctive and appropriate
- Beat graph with 5 terminal states gives real divergence
- Image selector scoring + visual family dedup avoids repetition

---

## 2. Top Gameplay/UX Issues

### P0 — Fix Now

**2.1 Font sizes are unreadable at key moments.** The CSS uses 0.54rem–0.78rem for most game text. Truth model items are 0.64rem titles with 0.7rem body. Signal headlines are 0.78rem. Watch items are 0.72rem. Advisor support/caution/oppose counts are 0.54rem. These sizes turn what should be urgent information into a squinting exercise. On a 1080p monitor, 0.54rem is approximately 7px — smaller than browser minimum defaults.

**2.2 Briefing phase is an information avalanche.** A single briefing turn can render: phase transition card, truth model (3 columns × N items each), primary headlines (expandable), secondary headlines (hidden, expandable), watch items (2+ cards), immediate outcome (3 cards: "What Everyone Saw," "What Changed Offstage," "What The Room Fears Now"), turn debrief lines, "What Happened" expandable (with order frame, execution narrative, rival desk, alliance desk), context sections ("What Shifted Under The Surface," "What Could Crack Next"), meter dashboard, and images. This is 15+ distinct information surfaces competing for attention before the player even reaches the decision.

**2.3 Decision phase has unnecessary tutorial scaffolding.** The 3-step guide ("Select a response option → Open the advisor panel → Confirm your decision") takes up vertical space and implies the player doesn't know how buttons work. By turn 2, this is dead weight.

**2.4 Action cards use policy-expert vocabulary.** "Use private channels to test an off-ramp without changing the public posture yet" is how a State Department analyst talks. An everyday American under crisis pressure thinks: "Call them privately and see if there's a way out before this gets worse." Every action card one-liner and variant summary needs a plain-English pass.

**2.5 "Response envelope" label is jargon nobody uses.** Appears in the selected response detail panel and variant selector. Replace with "approach" or just drop the label entirely.

### P1 — Fix Soon

**2.6 Images are treated as evidence, not emotion.** Images sit in a side panel with labels like "Surveillance Read," "Evidence Board," "Live Scene," rendered at constrained widths alongside text. The single strongest way to make the crisis feel real is a large, visceral image that fills the player's visual field at the start of each turn.

**2.7 Start screen has too many sections.** Run Profile, Advanced Options (seed input), Operator Notes, Recent Activity, Active Runs, Completed Reports, scenario selector, clock picker, setup context cards. This is 8+ sections for what should be: pick a scenario, set difficulty, launch.

**2.8 No household-level signals.** The meters track escalation, alliance trust, military readiness, economic stability, energy security, and domestic cohesion. But there's no signal that says "gas is now $7.40/gallon" or "your sister texted asking if she should pull her 401k." The crisis stays abstract at the national level instead of bleeding into ordinary life.

**2.9 Timer urgency is under-sold.** Countdown styling only changes at ≤30s and ≤15s. There's no audio cue, no screen-edge tension, no visible degradation of the UI as time runs out. A 60-second decision window should feel like 60 seconds of mounting dread.

### P2 — Prototype Next

**2.10 No "breaking news" moment between turns.** The transition from one turn to the next is a state swap. There's no cinematic beat, no news-crawl interstitial, no headline splash that makes the player feel the world just lurched.

**2.11 Meter dashboard is clinical.** Six meters with sparklines, deltas, and semantic colors. Mechanically correct but emotionally flat. These should feel like dials on a dashboard that's overheating, not a spreadsheet row.

**2.12 No social/media layer.** The news_wire_ns.json has 120 articles. The intel_fragments has 90 fragments. But they surface as small expandable items in the briefing panel. There's no sense of a chaotic media environment where conflicting reports, social media panic, and official statements clash.

---

## 3. Cool Factor Opportunities

### Tier 1 — High impact, buildable now

**3.1 Full-bleed crisis image at turn start.** Before any text loads, the player sees a single large photograph — a gas station with a line around the block, a carrier group at sea, empty shelves, a packed airport — with a single-line caption and a "Continue to Briefing →" button. This is the emotional anchor. Every turn starts with a gut punch, not a spreadsheet.

**3.2 Household ticker.** A persistent thin bar (or periodic interstitial) showing personal-scale signals: gas price, grocery index, flight cancellations, school closures, 401k change, text messages from family/friends. Generated from meter state. This is the single biggest differentiator from every other wargame — making the crisis personal.

**3.3 News crawl / breaking-news interstitial between turns.** A 3-5 second animated transition showing a cable-news-style lower third with the turn's headline, styled as a CNN/BBC breaking news alert. Uses data from news_wire_ns.json. Makes each turn feel like watching live coverage.

**3.4 Escalating UI degradation.** As escalation rises, the CRT scanlines get heavier, the amber accent shifts toward red, text gets occasional static/glitch effects, and the interface itself starts to feel unstable. The UI becomes a meter. At extreme escalation, parts of the screen could flicker or display "SIGNAL LOST" artifacts.

**3.5 Advisor conflict moments.** When advisors sharply disagree (e.g., Cross says "strike now" while Chen says "back down"), surface this as a direct confrontation — not just stance badges, but a visible clash. "Cross and Chen are arguing. Cross wants a show of force. Chen says that's how wars start by accident."

### Tier 2 — Medium effort, high differentiation

**3.6 Phone notifications from "family."** Fictional text messages from spouse, parent, friend. "Schools just announced early dismissal." "Have you seen the gas prices?" "Mom is scared, should she fill up her car?" Generated from meter state and turn context. Appears as a notification overlay, making the player feel the personal stakes.

**3.7 Market flash crash visualization.** When economic stability drops sharply, show a brief animated stock ticker/chart plunging. Use the economic meter delta to drive intensity. This is visceral — everyone understands a red chart going down.

**3.8 "The world reacted" montage after committing a decision.** A 2-3 card sequence showing: "CNN reported..." / "Beijing's foreign ministry said..." / "S&P futures dropped..." — then transition to the next turn's briefing. Makes the consequence of your choice visible before the next crisis hits.

### Tier 3 — Save for later

**3.9 Audio layer.** Ambient tension sounds, news broadcast clips, phone buzzing. High impact but requires audio assets and careful UX for muting/volume.

**3.10 Multiplayer spectator mode.** Let others watch a player's run in real-time with a 30-second delay. Creates community engagement and streaming potential.

**3.11 Social media feed simulation.** A fake Twitter/X feed panel showing public reaction to the crisis, generated from scenario data. High flavor, high effort.

---

## 4. Copy Problems And Rewrite Direction

### Systemic issues

The copy reads like it was written by someone who works at a think tank. It's grammatically correct, substantively accurate, and emotionally dead. The target player is a 35-year-old American who watches the news, has a mortgage, and is imagining what happens if this crisis reaches their town. The copy should sound like what that person hears in their head when they're scared.

### Specific rewrites needed

**Labels and headers:**
- "Operational Indicators" → "Warning Signs"
- "Response Options" → "What Do You Do?"
- "Response Envelope" → cut entirely, or "Approach"
- "Narrative Emphasis" → "How This Plays Out"
- "Custom Interpretation" → "Your Read"
- "Counterpart Read" → "How Beijing Takes It"
- "Alliance / Market Read" → "How Allies and Markets React"
- "Selected Response" → "Your Move"
- "Immediate Move" → "What Happens First"
- "If This Lands" → keep (this one works)
- "Delayed Risk" → "What Could Go Wrong"
- "Key Developments" → "What Just Happened"
- "Watch Items" → "Keep An Eye On"
- "Surveillance Read" / "Evidence Board" / "Live Scene" → "On the Ground" / "What We're Seeing" / "Right Now"
- "Verified Facts" → "What We Know"
- "Working Theories" → "What We Think"
- "Unknowns" → "What We Don't Know"
- "What Shifted Under The Surface" → keep (this one works)
- "What Could Crack Next" → keep (good)
- "Situation Summary" → "The Situation"
- "Decision Phase" → "Your Call"
- "Order frame:" → cut this label entirely

**Action card one-liners (current → rewritten):**
- "Use private channels to test an off-ramp without changing the public posture yet." → "Reach out quietly and see if there's a deal before this goes public."
- "Put terms on the table publicly and test whether the counterpart wants a visible offramp." → "Make an offer in public. Force them to say yes or no in front of everyone."
- "Change visible military posture to raise the cost of another coercive move." → "Move ships and planes where they can be seen. Make them think twice."
- "Strengthen surveillance, attribution, and defensive readiness before making a larger move." → "Find out what's really happening before you commit to anything."
- "Use commercial and financial pressure to impose cost beyond the military channel." → "Hit their economy. Sanctions, trade restrictions, financial pressure."

**Briefing dynamic context (current → rewritten direction):**
- "Commercial actors stopped treating the disruption like a bluff and started planning around real delay, reroute, and inventory pain." → "Businesses stopped pretending this would blow over. They're planning for real shortages now."
- "Fuel and logistics planners absorbed a new shock" → "Fuel prices are climbing. Shipping routes are being rerouted."
- "Domestic tolerance weakened" → "People are getting nervous. The next visible shock could trigger real panic."
- "Military posture became more visible" → "We've moved more forces into position. That could steady things or scare everyone."
- "Coalition discipline weakened" → "Our allies are starting to disagree publicly. Markets hate that."

**Instructional text to cut or shorten:**
- "Read the signal picture first: what is confirmed, what analysts think may be happening, and what is still unknown." → "Here's what we know right now."
- "Choose a response, review its likely strategic and market effects below, then confirm it when you are ready." → "Pick a response."
- "Secondary signals that can change how markets, allies, and operators read the situation." → cut entirely
- "Operators are still trying to match the latest report against theater feeds and commercial traffic data." → "Details still coming in."
- The entire 3-step help workflow text → remove

---

## 5. Visual/Card Density Review

### Briefing Phase — Currently 15+ surfaces, target 5-7

**Cut or collapse:**
- 3-step guide cards in decision phase → remove entirely
- "What Happened" expandable (order frame, execution narrative, rival desk, alliance desk) → collapse into the Immediate Outcome section; one paragraph, not a 4-panel expandable
- Watch Items section → merge 1-2 strongest into the headline section as secondary lines; remove dedicated section
- Secondary headlines "Additional developments" → cut; if there are more than 2 headlines, surface only 2
- Separate "Context" and "Operational Indicators" tabs → fold indicators into context; reduce from 3 tabs to 2 ("What's Happening" / "The Numbers")
- Supporting signals grid → limit to 1 row of 2 max, no "show more" button
- Background expandable → move to a subtle "?" icon or first-turn-only

**Elevate:**
- Hero image → promote to full-width or near-full-width at top of briefing
- Truth model → keep but increase font sizes, reduce item count to top 2 per category
- Immediate Outcome cards → keep 3-card layout, increase font to 0.82rem+
- Meter Dashboard → keep but make visual (progress bars or gauges, not just numbers)

### Decision Phase — Currently good density, needs font/label fixes

- Action cards grid (2×3) → keep, but increase font sizes and rewrite labels
- Selected response detail → keep, remove "Response Envelope" label
- 4 preview cards (Counterpart Read, Alliance/Market, If This Lands, Delayed Risk) → keep, rewrite labels
- Advisor panel → keep, it's one of the best surfaces in the game
- Command input → keep, it's a strong differentiator
- Hidden downside card → keep, great mechanic

### Start Screen — Currently 8+ sections, target 4

- Keep: Scenario selector with brief, clock picker, launch button
- Keep but simplify: Continue Latest Run (promote to primary CTA if active run exists)
- Move to a settings/gear icon: Seed input, run profile
- Cut: Operator Notes (nobody reads these), Recent Activity feed (move to a history page), Active Runs list (show only if >1)

---

## 6. Image Review

### Current state
~55 image entries in images.json. All US-focused Taiwan crisis photography (tw_us_* prefix). Kinds include: photo, map, artifact. Perspectives: satellite, surveillance, street, official. Visual family deduplication prevents repetition. Selector scoring favors action/variant-matched tags.

### Assessment by category

**Strong images (keep, feature more prominently):**
- Carrier group / naval imagery — visceral, everyone understands military ships
- Gas station lines / fuel shortage — personal, domestic, frightening
- Empty shelves / panic buying — universally understood fear signal
- Congressional / Capitol imagery — power, decision, consequences
- Market trading floor / financial screens — economic fear

**Weak images (flag for replacement):**
- Generic satellite views that look like Google Maps screenshots
- Any image labeled "artifact" that's actually a document/chart render — these break immersion
- Official meeting room photos that look like stock corporate imagery
- Map overlays that feel like a PowerPoint slide rather than a crisis visual

**Missing imagery (gaps to fill):**
- Ordinary American life disrupted: school pickup line, neighborhood with gas station sign showing $8, grocery store checkout with empty sections, highway with unusual traffic
- Media chaos: multiple TV screens showing conflicting coverage, phone with news alerts
- Personal scale: kitchen table with news on laptop, family watching TV coverage
- Night/tension imagery: city skyline at dusk with military aircraft, port at night with cargo ships stopped
- Protest/social unrest: crowds, signs, police presence at demonstrations

### Sizing recommendations
- Hero image should be minimum 50% of above-fold viewport on desktop, 100% on mobile
- Supporting images should be at least 200px tall, not the current ~120px thumbnails
- Evidence/map images can remain smaller as reference material
- Consider a full-bleed background image with dark overlay for the start screen

---

## 7. Recommended Implementation Slices

### FIX NOW (Slices 1-6)

**Slice 1: Font size overhaul**
- Raise all game text minimums: labels from 0.54-0.58rem to 0.68rem, body text from 0.7-0.78rem to 0.84rem, headlines from 0.78rem to 1rem
- Update index.css classes: .label, .console-metric-label, .console-chip, .briefing-tab, .action-required-status, .console-kicker, .console-sidebar-label
- Update inline sizes in BriefingPanel.tsx, ActionCards.tsx, App.tsx
- Verification: screenshot comparison at 1080p and 390px mobile

**Slice 2: Copy rewrite — labels and headers**
- Replace all labels/headers identified in Section 4 across: ActionCards.tsx (labels, helper function strings), BriefingPanel.tsx (section headers, image labels, signal source labels), App.tsx (turn stage headers, context section titles)
- Verification: full playthrough reading every label

**Slice 3: Copy rewrite — action card one-liners and dynamic context**
- Rewrite actionOneLiner() function and all its conditional branches in ActionCards.tsx
- Rewrite buildDynamicContextSections() meter change descriptions in App.tsx
- Rewrite describeShiftInScene() in BriefingPanel.tsx
- Rewrite visibilityHint(), postureHint(), riskHint(), firstImpactHint(), firstShockLine() in ActionCards.tsx
- Verification: play all 6 actions, read every tooltip/hint

**Slice 4: Briefing density reduction**
- Remove 3-step help/guide from ActionCards.tsx (the showHelp section)
- Cap truth model items at 2 per category
- Cap visible headlines at 2 (remove "Additional developments" expand)
- Cap watch items at 2 (remove "show more" button)
- Collapse "What Happened" expandable into a single paragraph within Immediate Outcome
- Verification: side-by-side turn comparison showing fewer panels

**Slice 5: Hero image promotion**
- Move hero image from side panel to near-full-width position above briefing text in BriefingPanel.tsx
- Increase image display height, add atmospheric overlay/gradient
- Relocate supporting images to a smaller strip below hero
- Verification: screenshot showing image as dominant visual element

**Slice 6: Start screen simplification**
- Remove Operator Notes section
- Collapse Advanced Options (seed) into a gear/settings icon
- Remove Recent Activity feed (or move behind a "History" link)
- Show Active Runs inline only if >1 exists
- Make "Continue Latest Run" the primary CTA when an active run exists
- Verification: screenshot showing cleaner start screen

### PROTOTYPE NEXT (Slices 7-10)

**Slice 7: Household ticker**
- New component: HouseholdTicker.tsx
- Thin persistent bar below header showing: gas price, grocery index, flight status, 401k change, family text
- Values derived from meter state (economicStability, energySecurity, domesticCohesion)
- Data mapping: create a small household_signals dataset keyed to meter thresholds
- Verification: ticker updates reflect meter changes across turns

**Slice 8: Breaking news interstitial**
- New component: NewsInterstitial.tsx
- 3-5 second animated transition between turns showing cable-news-style headline
- Pull headline from narrative bundle or news_wire_ns.json
- CSS animation: slide-in lower third, red "BREAKING" badge, network bug
- Verification: interstitial appears between every turn transition

**Slice 9: UI degradation at high escalation**
- CSS-driven: escalation index controls scanline intensity, accent hue shift (amber → red), occasional glitch keyframes
- Add escalation-level CSS class to body/root, driven by meter state
- Light version: heavier scanlines + subtle color shift at escalation ≥70
- Heavy version: text glitch, flicker, "SIGNAL LOST" flash at escalation ≥90
- Verification: play to high-escalation terminal and confirm visual shift

**Slice 10: Advisor conflict surfacing**
- When 2+ advisors have opposing stances on the selected action, render a "conflict card" showing the disagreement as a direct quote-style clash
- Pull from existing advisorLines data and decisionSupport scoring
- Display in AdvisorPanel.tsx as a highlighted section
- Verification: select action where Cross supports and Chen opposes, confirm clash card appears

### SAVE FOR LATER

- Full audio layer (ambient tension, news clips, phone sounds)
- Social media feed simulation panel
- Multiplayer spectator mode
- Phone notification overlays from "family"
- Market flash crash chart animation
- "World reacted" montage after decision commit
- Full image replacement pass (requires new asset creation/sourcing)
- Dynamic meter visualization (gauges instead of numbers)

### DO NOT DO

- Tutorial/onboarding flow beyond the existing help toggle — the game is simple enough to learn by playing
- Difficulty settings beyond clock mode — the beat graph provides natural difficulty through branch conditions
- Achievement/badge system — breaks the serious tone
- Leaderboard — comparing crisis outcomes defeats the simulation purpose
- AI-generated images at runtime — quality/consistency risk
- Voice acting — cost/quality mismatch for the scale
- Mobile-first redesign — the console aesthetic requires desktop screen real estate; mobile should be functional, not primary

---

## 8. Agent Assignments

### Agent 1: Game Issues + Fixes (Slices 1-6)
- Implements all Fix Now slices in order
- Each slice: make changes → build → verify in browser → commit
- Uses small vertical diffs, never combines unrelated changes
- Reports before/after evidence for each slice

### Agent 2: Review + Approval
- Reviews every slice from Agent 1 before it is accepted
- Checks: no regressions (lint, build, test pass), copy reads naturally in context, font sizes are actually larger on screen, density reduction doesn't hide critical information, labels are clear to a non-expert
- Can reject with specific feedback or request changes
- Final approval = slice is merged to working branch

### Agent 3: Cool Factor + Differentiation (Slices 7-10)
- Prototypes each feature as a self-contained component
- Starts with Household Ticker (most differentiating, lowest risk)
- Each prototype: new component → integrate → browser verify → commit
- Works in parallel with Agent 1 on separate files

### Agent 4: Copy + Visual Direction
- Provides the actual rewrite text for Slices 2-3
- Reviews every copy change for tone (direct, human, tense, not consultant-speak)
- Flags any new copy that sounds AI-generated, policy-expert, or bloodless
- Provides image sizing/placement specs for Slice 5

### Coordination
- Slices 1-6 are sequential (each builds on the last)
- Slices 7-10 can run in parallel with Slices 1-6
- Agent 2 reviews everything before it's accepted
- Agent 4 provides copy input to Agent 1 for Slices 2-3

---

## 9. Review/Approval Criteria

### Per-slice checklist

Every implementation slice must pass ALL of the following before approval:

1. **Build passes.** `npm run lint` + `npm run build` + `npm test` — zero new errors or warnings.
2. **No content regressions.** No game information was removed that a player would need to make an informed decision. Density reduction means consolidation, not deletion of substance.
3. **Font sizes verified.** Screenshot comparison at 1080p showing measurably larger text. No text below 0.68rem in the gameplay view.
4. **Copy reads naturally.** Every changed label/string is read aloud by the reviewer. If it sounds like a policy brief, a consulting deck, or an AI writing prompt, it fails.
5. **Player-first language.** All new copy is evaluated from the perspective of a 35-year-old American who is frightened, not an analyst who is briefing. Specific test: would you say this sentence to your neighbor who just asked "what's happening?"
6. **Visual hierarchy improved.** The most important information on each screen is the largest and most prominent. Images are emotional anchors, not evidence thumbnails.
7. **Mobile not broken.** Quick check at 390px width confirms nothing overflows, stacks correctly, remains usable.
8. **Existing tests pass.** Full `npm test` suite, including beat-validation and engine tests.
9. **Browser verification.** At least one full turn played through in browser after changes, confirming the changes are visible and functional in context.
10. **Git hygiene.** Clean commit with descriptive message, no unrelated changes, `git diff --check` passes.

### Rejection criteria

The reviewer MUST reject a slice if:
- Any copy still uses jargon that requires policy expertise to understand
- Font sizes were changed in CSS but not verified in rendered browser output
- Information density was reduced by hiding content behind clicks without consolidating it
- A new feature was added that doesn't serve the "terrifying, real, tense" goal
- The change looks good in isolation but breaks the flow when played in sequence
- Test suite has new failures
- The change introduces a new third-party dependency without justification

---

## Summary Priority Matrix

| Priority | Slice | Effort | Impact | Risk |
|----------|-------|--------|--------|------|
| Fix Now | 1. Font size overhaul | Low | High | Low |
| Fix Now | 2. Label/header copy rewrite | Low | High | Low |
| Fix Now | 3. Action/context copy rewrite | Medium | High | Low |
| Fix Now | 4. Briefing density reduction | Medium | High | Medium |
| Fix Now | 5. Hero image promotion | Medium | Very High | Low |
| Fix Now | 6. Start screen simplification | Low | Medium | Low |
| Prototype | 7. Household ticker | Medium | Very High | Medium |
| Prototype | 8. Breaking news interstitial | Medium | High | Low |
| Prototype | 9. UI degradation at escalation | Low | High | Low |
| Prototype | 10. Advisor conflict surfacing | Low | Medium | Low |
