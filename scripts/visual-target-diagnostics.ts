import {
  actions,
  adversaryProfiles,
  debriefDeep,
  images,
  scenarios
} from '@wargames/content';
import {
  buildActionMap,
  initializeGameState,
  resolveTurn,
  selectPlayerActionOptions,
  SeededRng
} from '@wargames/engine';
import type {
  ActionDefinition,
  ActionVariantDefinition,
  BeatNode,
  GameState,
  ScenarioDefinition
} from '@wargames/shared-types';

const targetImageIds = [
  'tw_us_electronics_store_shortage',
  'tw_us_semiconductor_fab_disruption',
  'tw_us_white_house_press_briefing',
  'tw_us_market_crash_chip_crisis',
  'tw_us_gas_lines_freight_shock',
  'tw_us_nuclear_risk_command',
  'tw_us_congress_chip_hearing'
] as const;

type CoverageMode = 'natural-offers' | 'expanded-offers' | 'targeted-public-econ';

interface ImageHit {
  mode: CoverageMode;
  imageId: string;
  beatBefore: string;
  beatAfter: string;
  actionId: string;
  actionName: string;
  variantId: string | null;
  variantLabel: string | null;
  gallery: string[];
}

const requestedScenarioId = process.argv.find((arg) => arg.startsWith('--scenario='))?.split('=')[1];
const scenario = scenarios.find((entry) =>
  requestedScenarioId ? entry.id === requestedScenarioId : !entry.isLegacy
);

if (!scenario) {
  throw new Error(`Scenario not found${requestedScenarioId ? `: ${requestedScenarioId}` : ''}`);
}

const adversaryProfile = adversaryProfiles.find((entry) => entry.id === scenario.adversaryProfileId);
if (!adversaryProfile) {
  throw new Error(`Adversary profile not found: ${scenario.adversaryProfileId}`);
}

const actionMap = buildActionMap(actions);
const actionById = new Map(actions.map((action) => [action.id, action]));
const imageById = new Map(images.map((image) => [image.id, image]));
const nonTerminalBeats = scenario.beats.filter((beat) => beat.terminalOutcome === null);

const missingTargets = targetImageIds.filter((id) => !imageById.has(id));
if (missingTargets.length > 0) {
  throw new Error(`Target image metadata missing: ${missingTargets.join(', ')}`);
}

const cloneState = (state: GameState): GameState => JSON.parse(JSON.stringify(state)) as GameState;

const isActionValidForTurn = (action: ActionDefinition, turn: number): boolean => {
  if (action.actor !== 'player') {
    return false;
  }
  if (action.minTurn !== undefined && turn < action.minTurn) {
    return false;
  }
  if (action.maxTurn !== undefined && turn > action.maxTurn) {
    return false;
  }
  return scenario.availablePlayerActionIds.includes(action.id);
};

const variantsForAction = (action: ActionDefinition): Array<ActionVariantDefinition | null> => {
  if (!action.variants || action.variants.length === 0) {
    return [null];
  }
  return action.variants;
};

const publicEconomicActionPreference = [
  'public_signaling_speech',
  'targeted_sanctions',
  'broad_sanctions',
  'resource_stockpiling',
  'military_posture_increase',
  'intelligence_surge',
  'limited_concession',
  'backchannel_diplomacy',
  'military_posture_decrease'
];

const publicEconomicVariantPreference: Record<string, string> = {
  public_signaling_speech: 'calibrated_address',
  targeted_sanctions: 'signaling_tranche',
  broad_sanctions: 'maximal_package',
  resource_stockpiling: 'emergency_buffer',
  military_posture_increase: 'broadcast_deterrence',
  intelligence_surge: 'allied_attribution_cell',
  limited_concession: 'public_offramp',
  backchannel_diplomacy: 'firm_channel',
  military_posture_decrease: 'public_decompression'
};

const buildStateAtBeat = (beat: BeatNode, turn: number, mode: CoverageMode): GameState => {
  const state = initializeGameState(
    `visual-target:${mode}:${scenario.id}:${beat.id}`,
    `visual-target:${mode}:${scenario.id}:${beat.id}`,
    {
      scenario,
      adversaryProfile,
      actions,
      images,
      debriefVariants: debriefDeep?.variants
    },
    { timerMode: 'off' }
  );

  state.turn = Math.min(Math.max(1, turn), scenario.maxTurns);
  state.status = 'active';
  state.outcome = null;
  state.currentBeatId = beat.id;
  state.beatHistory = [scenario.startingBeatId, beat.id].filter((value, index, array) => array.indexOf(value) === index);
  state.history = [];
  state.recentImageIds = [];
  state.turnDebrief = null;
  state.activeCountdown = null;

  if (mode === 'natural-offers') {
    state.offeredActionIds = selectPlayerActionOptions(
      state,
      scenario,
      actionMap,
      new SeededRng(`visual-target-options:${scenario.id}:${beat.id}:${turn}`)
    );
  } else {
    state.offeredActionIds = actions
      .filter((action) => isActionValidForTurn(action, state.turn))
      .map((action) => action.id);
  }

  return state;
};

const collectHitsForMode = (mode: CoverageMode): ImageHit[] => {
  const hits: ImageHit[] = [];

  nonTerminalBeats.forEach((beat, index) => {
    const baseState = buildStateAtBeat(beat, index + 1, mode);

    for (const actionId of baseState.offeredActionIds) {
      const action = actionById.get(actionId);
      if (!action) {
        continue;
      }

      for (const variant of variantsForAction(action)) {
        const { resolution } = resolveTurn(
          cloneState(baseState),
          action.id,
          {
            scenario,
            adversaryProfile,
            actions,
            images,
            debriefVariants: debriefDeep?.variants
          },
          {
            playerVariantId: variant?.id ?? null,
            nowMs: 0
          }
        );

        const gallery = [
          resolution.selectedImageId,
          ...resolution.selectedSupportingImageIds
        ].filter((entry): entry is string => Boolean(entry));

        for (const imageId of gallery) {
          if (!targetImageIds.includes(imageId as (typeof targetImageIds)[number])) {
            continue;
          }

          hits.push({
            mode,
            imageId,
            beatBefore: beat.id,
            beatAfter: resolution.beatIdAfter,
            actionId: action.id,
            actionName: action.name,
            variantId: variant?.id ?? null,
            variantLabel: variant?.label ?? null,
            gallery
          });
        }
      }
    }
  });

  return hits;
};

const collectHitsForPublicEconomicPath = (): ImageHit[] => {
  const hits: ImageHit[] = [];
  let state = initializeGameState(
    'visual-target:targeted-public-econ',
    'public-econ-2',
    {
      scenario,
      adversaryProfile,
      actions,
      images,
      debriefVariants: debriefDeep?.variants
    },
    { timerMode: 'off' }
  );

  while (state.status === 'active') {
    const actionId =
      publicEconomicActionPreference.find((candidate) => state.offeredActionIds.includes(candidate)) ??
      state.offeredActionIds[0];
    const action = actionId ? actionById.get(actionId) : null;
    if (!action) {
      break;
    }

    const preferredVariantId = publicEconomicVariantPreference[action.id] ?? null;
    const variant = preferredVariantId
      ? action.variants?.find((entry) => entry.id === preferredVariantId) ?? null
      : null;
    const beatBefore = state.currentBeatId;
    const { nextState, resolution } = resolveTurn(
      cloneState(state),
      action.id,
      {
        scenario,
        adversaryProfile,
        actions,
        images,
        debriefVariants: debriefDeep?.variants
      },
      {
        playerVariantId: variant?.id ?? null,
        nowMs: 0
      }
    );

    const gallery = [
      resolution.selectedImageId,
      ...resolution.selectedSupportingImageIds
    ].filter((entry): entry is string => Boolean(entry));

    for (const imageId of gallery) {
      if (!targetImageIds.includes(imageId as (typeof targetImageIds)[number])) {
        continue;
      }

      hits.push({
        mode: 'targeted-public-econ',
        imageId,
        beatBefore,
        beatAfter: resolution.beatIdAfter,
        actionId: action.id,
        actionName: action.name,
        variantId: variant?.id ?? null,
        variantLabel: variant?.label ?? null,
        gallery
      });
    }

    state = nextState;
  }

  return hits;
};

const naturalHits = collectHitsForMode('natural-offers');
const expandedHits = collectHitsForMode('expanded-offers');
const publicEconomicPathHits = collectHitsForPublicEconomicPath();

const formatHit = (hit: ImageHit | undefined): string => {
  if (!hit) {
    return 'missing';
  }

  const variant = hit.variantId ? `/${hit.variantId}` : '';
  return `${hit.mode}: ${hit.beatBefore} -> ${hit.beatAfter} via ${hit.actionId}${variant} [${hit.gallery.join(' > ')}]`;
};

console.log(`Visual target diagnostics for ${scenario.id}`);
console.log(`Targets: ${targetImageIds.length}`);
console.log(`Non-terminal beats scanned: ${nonTerminalBeats.length}`);

const missingExpanded: string[] = [];

for (const imageId of targetImageIds) {
  const firstNaturalHit = naturalHits.find((hit) => hit.imageId === imageId);
  const firstExpandedHit = expandedHits.find((hit) => hit.imageId === imageId);
  const firstPublicEconomicPathHit = publicEconomicPathHits.find((hit) => hit.imageId === imageId);
  const naturalCount = naturalHits.filter((hit) => hit.imageId === imageId).length;
  const expandedCount = expandedHits.filter((hit) => hit.imageId === imageId).length;
  const publicEconomicPathCount = publicEconomicPathHits.filter((hit) => hit.imageId === imageId).length;

  console.log(`\n${imageId}`);
  console.log(`  naturalHits=${naturalCount} ${formatHit(firstNaturalHit)}`);
  console.log(`  expandedHits=${expandedCount} ${formatHit(firstExpandedHit)}`);
  console.log(`  targetedPublicEconHits=${publicEconomicPathCount} ${formatHit(firstPublicEconomicPathHit)}`);

  if (!firstExpandedHit) {
    missingExpanded.push(imageId);
  }
}

if (missingExpanded.length > 0) {
  console.error(`\nMissing target images under expanded decision coverage: ${missingExpanded.join(', ')}`);
  process.exit(1);
}

const missingNatural = targetImageIds.filter((id) => !naturalHits.some((hit) => hit.imageId === id));
if (missingNatural.length > 0) {
  const stillUncovered = missingNatural.filter((id) => !publicEconomicPathHits.some((hit) => hit.imageId === id));
  if (stillUncovered.length > 0) {
    console.log(`\nNatural-offer coverage gaps remain: ${stillUncovered.join(', ')}`);
    console.log('These are not selector metadata failures; they require offer-path tuning or targeted browser smoke paths.');
  } else {
    console.log('\nSingle-beat natural-offer gaps are covered by the targeted public/economic path.');
  }
}

console.log('\nVisual target diagnostics passed.');
