# Flashpoint Multi-Agent UX/Product Review

Date: 2026-05-12
Coordinator: Codex
Scope: Browser-played review plus three read-only agent workstreams covering gameplay issues, cool factor, copy, UI density, and image fit.

## 1. Current Experience Diagnosis

Flashpoint already has the right raw material: Taiwan crisis pressure, shipping insurance failure, chip supply shock, market panic, family-level anxiety, and deterministic consequences. The best moments are the plain ones: insurance stops quoting, factories ask if wafers will ship, families watch the news, gas and shelves start to matter.

The current product still feels too much like a dense policy console. It is serious and well-structured, but not yet scary enough. The player is asked to read many cards, meters, advisor panels, and response details before the game makes the crisis feel like it has entered ordinary American life.

The strongest direction is not more generic spectacle. It is making the player feel that normal life is shrinking while the secure-room picture gets less trustworthy.

## 2. Top Gameplay/UX Issues

1. Mobile/state-transition scroll can preserve stale scroll position when moving from setup into live play. The first live moment can open below the header, hiding the urgent state.
2. Timed mode can promise pressure but show an untimed first decision, weakening trust and tension.
3. The commit path is easy to lose in the decision phase. After selecting a response, the user has to navigate action detail, variants, advisors, hidden risk, and custom response before committing.
4. Everyday-American stakes are present in content but too secondary in the UI. The main surfaces still emphasize meters, advisors, and policy-room labels before shelves, gas, jobs, families, phones, and panic.
5. The visual hierarchy is too card-heavy. Many cards are useful individually, but together they flatten urgency.

## 3. Cool Factor Opportunities

1. Add a `Homefront` or `At Home` strip that translates crisis state into daily-life consequences: gas lines, grocery panic, 401k shock, flight cancellations, pharmacy delays, reserve-family anxiety, or local emergency notices.
2. Turn public panic into a playable feed: confirmed news, rumors, market alerts, state-media claims, viral clips, and local posts labeled clearly as confirmed, unverified, manipulated, or market-moving.
3. Add a selected-response review strip before commit: `You are about to...`, `Who feels this first`, `What could backfire`, and `What option may close`.
4. Make uncertainty more playable. The game already has verified facts, theories, and unknowns; high-drama beats should make confidence visibly fracture.
5. Render major triggered events as interrupt set pieces, not quiet lines. A market halt, blackout, allied public break, or protest should hit like the world acting back.
6. Add an everyday-American ending to reports: `What America woke up to` with fuel, jobs, prices, shelves, protests, deployment, and savings impact.

## 4. Copy Problems And Rewrite Direction

Keep the writing concrete, frightening, and human. Avoid abstract labels that sound like a strategy memo or generated product copy.

Replace:
- `Response Envelope` -> `How hard to push`
- `Hidden Downside` -> `What could backfire`
- `Counterpart Read` -> `How Beijing may read this`
- `Operational Indicators` -> `Pressure meters`
- `Strategic Read` -> `Final read`
- `Theater` -> `Taiwan Strait` or `where this is happening`

Tone target: clear English, direct threat, no hype. Prefer `gas stations are limiting purchases` over `energy security degradation`; prefer `your pension app is down 9%` over `market stress increased`.

## 5. Visual/Card Density Review

Current density is the largest UX issue.

Observed rendered counts:
- Setup desktop: 4 panels, 13 subpanels, 5 buttons, no imagery.
- Setup mobile: roughly 3,300px before gameplay.
- First summary desktop: 3 panels, 12 subpanels, 12 article cards, 1 figure.
- Decision desktop: 15 buttons, 6 large response cards, advisor panel, custom-response panel, selected-response panel.
- Mobile decision: over 4,000px before commit.

Direction: fewer, stronger surfaces. Do not add more explanatory panels. Collapse secondary advisor/support detail behind expansion. Keep one dominant emotional surface per window.

## 6. Image Review

Image metadata currently includes 73 entries: many SVGs, a stronger raster set, and a generic fallback `img_###` set.

Fix-now findings:
- `img_###` fallback SVGs should not appear in dramatic player-facing moments.
- First live visual is often a calm orientation map. Useful, but wrong as the first emotional image.
- The strongest images are the domestic and human-impact set: supermarket panic, gas/freight shock, family cable news, electronics shortage, port congestion, deployment families, market crash, and fab disruption.
- Too many visuals show polished rooms with people looking at screens. They read serious, not terrifying.
- Generated images with fake signage or visible fake text should stay secondary.

Direction: maps and SVGs should function as evidence artifacts, not hero images. Hero visuals should show confusion, fear, human cost, or a system failing.

## 7. Recommended Implementation Slices

Fix now:
1. Scroll/reset and focus hygiene for setup -> live, resume -> live, turn advance, report open, and return-to-setup transitions.
2. Persistent selected-response review strip before commit, using plain-English consequence language.
3. Clock truth pass so timed-mode copy never promises pressure that the current beat cannot enforce.
4. Quarantine generic `img_###` fallback art from gameplay hero selection.
5. First-turn visual pass: replace the calm map-first moment with radar/evidence/tension imagery and move the map lower.

Prototype next:
1. Homefront impact strip driven by current beat and meters.
2. Public panic/media reality feed with confirmed/unverified/manipulated/market-moving labels.
3. Major event interrupt banners for market panic, blackout, ally break, protests, and similar shocks.
4. Everyday-American report section: `What America woke up to`.

Save for later:
1. Replace calm conference-room imagery with more specific human scenes.
2. Populate truth models for more high-drama beats.
3. Add visual smoke coverage for domestic/economic images.
4. Expand scenario-specific civilian-impact content after the first prototype proves the pattern.

Do not do:
1. Do not add more cards to explain existing cards.
2. Do not turn the product into a generic apocalypse collage.
3. Do not lean on free-form AI improvisation as the differentiator.
4. Do not overuse `strategic`, `posture`, `theater`, `architecture`, or similar abstract language.
5. Do not sacrifice deterministic causality and report trust for cinematic effects.

## 8. Agent Assignments

Agent A: Game Issues + Fixes
- Owns scroll/focus hygiene, clock truth, selected-response commit clarity, and first implementation slices.
- Produces small patches with browser evidence.

Agent B: Cool Factor + Differentiation
- Owns Homefront, public panic feed, event interrupts, and everyday-American report concepts.
- Converts each idea into deterministic content/UI slices.

Agent C: Copy, Visuals, UI Density, Images
- Owns plain-English label rewrites, card-density reductions, image QA, and placeholder-art quarantine.
- Reviews all player-facing copy for abstract or AI-sounding language.

Review/Approval Agent
- Reviews every slice before acceptance.
- Rejects changes that add clutter, weaken causality, introduce fake-sounding copy, or make the game less emotionally real.

## 9. Review/Approval Criteria

Every accepted slice must pass:
- Browser verification on desktop and 390px mobile.
- No relevant console errors or framework overlays.
- Clear before/after evidence.
- Plain-English copy review.
- No new card bloat unless another surface is removed or collapsed.
- Images match the beat emotionally and do not show obvious placeholder/fake text issues.
- The everyday American player should understand what is at stake without needing policy knowledge.
- The game should feel more terrifying, real, tense, and personal after the change.
