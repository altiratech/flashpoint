import type {
  ActionDefinition,
  AdvisorDossier,
  AdvisorRecommendationAlignment,
  BeatNode
} from '@wargames/shared-types';

export type AdvisorAlignment = AdvisorRecommendationAlignment;

export interface AdvisorActionRead {
  advisorId: string;
  advisorName: string;
  stance: string;
  alignment: AdvisorAlignment;
  rationale: string;
}

interface ActionProfile {
  isMilitary: boolean;
  isDeterrence: boolean;
  isDiplomacy: boolean;
  isDeescalatory: boolean;
  isEconomic: boolean;
  isHighCost: boolean;
  isCyber: boolean;
  isCovert: boolean;
  isResilience: boolean;
  isIntel: boolean;
  isPublic: boolean;
  isSecret: boolean;
  isOvert: boolean;
  stronglyEscalatory: boolean;
  stronglyDeescalatory: boolean;
}

const hasTag = (action: ActionDefinition, tag: string): boolean => action.tags.includes(tag);

const getActionProfile = (action: ActionDefinition): ActionProfile => ({
  isMilitary: hasTag(action, 'military'),
  isDeterrence: hasTag(action, 'deterrence'),
  isDiplomacy: hasTag(action, 'diplomacy'),
  isDeescalatory: hasTag(action, 'deescalation'),
  isEconomic: hasTag(action, 'economic') || hasTag(action, 'pressure'),
  isHighCost: hasTag(action, 'high_cost'),
  isCyber: hasTag(action, 'cyber'),
  isCovert: hasTag(action, 'covert') || hasTag(action, 'offensive'),
  isResilience: hasTag(action, 'resilience') || hasTag(action, 'energy'),
  isIntel: hasTag(action, 'intel'),
  isPublic: action.visibility === 'public',
  isSecret: action.visibility === 'secret',
  isOvert: action.visibility !== 'secret',
  stronglyEscalatory: action.signal.escalatory >= 0.7,
  stronglyDeescalatory: action.signal.deescalatory >= 0.7
});

const alignmentFromScore = (score: number): AdvisorAlignment => {
  if (score >= 2) {
    return 'supports';
  }
  if (score <= -2) {
    return 'opposes';
  }
  return 'cautions';
};

const scoreForAdvisor = (action: ActionDefinition, advisorId: string): number => {
  const profile = getActionProfile(action);

  switch (advisorId) {
    case 'cross': {
      let score = 0;
      if (profile.isMilitary || profile.isDeterrence) {
        score += 3;
      }
      if (profile.isPublic && action.signal.resolveSignal >= 0.45) {
        score += 1;
      }
      if (profile.isDiplomacy || profile.isDeescalatory) {
        score -= 3;
      }
      if (profile.isEconomic || profile.isResilience) {
        score -= 1;
      }
      if (profile.isCovert && !profile.isPublic) {
        score -= 1;
      }
      return score;
    }
    case 'chen': {
      let score = 0;
      if (profile.isDiplomacy || profile.isDeescalatory) {
        score += 3;
      }
      if (profile.isPublic && action.signal.allianceStressSignal <= 0.15) {
        score += 1;
      }
      if (profile.stronglyEscalatory || profile.isMilitary || profile.isCovert || profile.isCyber) {
        score -= 3;
      }
      if (profile.isHighCost) {
        score -= 1;
      }
      return score;
    }
    case 'okonkwo': {
      let score = 0;
      if (profile.isEconomic && !profile.isHighCost) {
        score += 3;
      }
      if (profile.isResilience) {
        score += 2;
      }
      if (profile.isDiplomacy && profile.isSecret) {
        score += 1;
      }
      if (profile.isHighCost || action.signal.economicStressSignal >= 0.75) {
        score -= 3;
      }
      if (profile.isMilitary || profile.isCovert) {
        score -= 2;
      }
      return score;
    }
    case 'reed': {
      let score = 0;
      if (profile.isSecret && (profile.isCyber || profile.isCovert || profile.isIntel || profile.isDiplomacy)) {
        score += 3;
      }
      if (profile.isPublic && (profile.isMilitary || profile.isEconomic || profile.isHighCost)) {
        score -= 3;
      }
      if (profile.stronglyDeescalatory && profile.isPublic) {
        score -= 2;
      }
      if (profile.isOvert && !profile.isMilitary && !profile.isEconomic) {
        score -= 1;
      }
      return score;
    }
    default:
      return 0;
  }
};

const rationaleForAdvisor = (advisorId: string, alignment: AdvisorAlignment): string => {
  switch (advisorId) {
    case 'cross':
      if (alignment === 'supports') {
        return 'Sees this as a visible move that can make the next PLA step more costly without giving up the initiative.';
      }
      if (alignment === 'opposes') {
        return 'Thinks this shows restraint too early or leans on tools Beijing may not fear.';
      }
      return 'Sees some value here, but questions whether Beijing will see enough force to change course.';
    case 'chen':
      if (alignment === 'supports') {
        return 'Sees this as keeping allies together while leaving a way out that does not reward coercion.';
      }
      if (alignment === 'opposes') {
        return 'Thinks this hardens positions faster than it buys leverage and may close the diplomatic exit.';
      }
      return 'Accepts parts of the move, but worries execution or framing could split allies or narrow the exit ramp.';
    case 'okonkwo':
      if (alignment === 'supports') {
        return 'Likes the market and alliance shape of this move and thinks it is pressure the coalition can carry.';
      }
      if (alignment === 'opposes') {
        return 'Thinks the commercial blowback or coalition cost outweighs the immediate pressure value.';
      }
      return 'Sees leverage here, but worries about shipping, chip, and market spillover if the move is mishandled.';
    case 'reed':
      if (alignment === 'supports') {
        return 'Likes that this keeps choices open and applies pressure without a public commitment.';
      }
      if (alignment === 'opposes') {
        return 'Thinks this closes off hidden options and forces the crisis into a public answer.';
      }
      return 'Sees use in it, but worries the move either reveals too much or leaves too little hidden leverage.';
    default:
      if (alignment === 'supports') {
        return 'Current read is favorable.';
      }
      if (alignment === 'opposes') {
        return 'Current read is negative.';
      }
      return 'Current read is mixed.';
  }
};

const authoredAlignmentForAction = (
  actionId: string,
  guidance?: NonNullable<BeatNode['advisorActionGuidance']>[string]
): AdvisorAlignment | null => {
  if (!guidance) {
    return null;
  }
  if (guidance.supports.includes(actionId)) {
    return 'supports';
  }
  if (guidance.cautions.includes(actionId)) {
    return 'cautions';
  }
  if (guidance.opposes.includes(actionId)) {
    return 'opposes';
  }
  return null;
};

export const getAdvisorActionReads = (
  action: ActionDefinition | null,
  advisorDossiers: AdvisorDossier[],
  beat?: BeatNode | null
): AdvisorActionRead[] => {
  if (!action) {
    return [];
  }

  return advisorDossiers.map((dossier) => {
    const authoredGuidance = beat?.advisorActionGuidance?.[dossier.id];
    const authoredAlignment = authoredAlignmentForAction(action.id, authoredGuidance);
    const alignment = authoredAlignment ?? alignmentFromScore(scoreForAdvisor(action, dossier.id));
    return {
      advisorId: dossier.id,
      advisorName: dossier.name,
      stance: dossier.stance,
      alignment,
      rationale: authoredGuidance?.rationaleByAlignment[alignment] ?? rationaleForAdvisor(dossier.id, alignment)
    };
  });
};
