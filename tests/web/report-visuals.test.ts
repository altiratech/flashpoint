import { describe, expect, it } from 'vitest';

import { images, scenarios } from '@wargames/content';
import type { MeterState, PostGameReport } from '@wargames/shared-types';

import { selectReportVisual } from '../../apps/web/src/reportVisuals';

const blackSwanScenario = scenarios.find((entry) => entry.id === 'northern_strait_black_swan');

const baseMeters: MeterState = {
  economicStability: 62,
  energySecurity: 58,
  domesticCohesion: 61,
  militaryReadiness: 59,
  allianceTrust: 60,
  escalationIndex: 52
};

const buildReport = (overrides: Partial<PostGameReport>): PostGameReport => ({
  episodeId: 'REPORT-VISUAL',
  outcome: 'frozen_conflict',
  terminalBeatId: 'ns_blockade_lock',
  outcomeExplanation: 'test report',
  timeline: [],
  finalMeters: baseMeters,
  pivotalDecision: {
    turn: 1,
    actionId: 'backchannel_diplomacy',
    actionName: 'Backchannel Diplomacy',
    reason: 'test'
  },
  beliefEvolution: [],
  misjudgments: [],
  alternativeLine: {
    turn: 1,
    suggestedActionId: 'military_posture_decrease',
    suggestedActionName: 'Military Posture Decrease',
    predictedImpact: 'test'
  },
  fullCausality: {
    outcomeNarrative: {
      title: 'test',
      summary: 'test',
      causalNote: 'test'
    },
    hiddenDeltas: [],
    unseenSystemEvents: [],
    branchesNotTaken: [],
    advisorRetrospectives: [],
    rivalLeaderReveal: null,
    deepDebrief: null,
    tradeoffScorecards: []
  },
  ...overrides
});

describe('report visual selection', () => {
  it('uses a real photographic aftermath image instead of terminal SVG art', () => {
    const visual = selectReportVisual({
      report: buildReport({
        outcome: 'war',
        terminalBeatId: 'ns_limited_strike_exchange',
        finalMeters: {
          ...baseMeters,
          escalationIndex: 96,
          militaryReadiness: 72,
          allianceTrust: 42
        }
      }),
      scenario: blackSwanScenario ?? null,
      images
    });

    expect(visual?.path).toMatch(/\.(png|jpe?g|webp)$/);
    expect(visual?.id).not.toBe('tw_bs_017');
    expect(visual?.tags).toContain('us_domestic');
    expect(visual?.tags).toEqual(expect.arrayContaining(['strike', 'nuclear_risk']));
  });

  it('falls back to an emotionally relevant domestic image when curated terminal art is not promotable', () => {
    const visual = selectReportVisual({
      report: buildReport({
        outcome: 'stabilization',
        terminalBeatId: 'ns_managed_relief',
        finalMeters: {
          ...baseMeters,
          economicStability: 72,
          energySecurity: 69,
          domesticCohesion: 67,
          escalationIndex: 38
        }
      }),
      scenario: blackSwanScenario ?? null,
      images
    });

    expect(visual?.path).toMatch(/\.(png|jpe?g|webp)$/);
    expect(visual?.kind).not.toBe('map');
    expect(visual?.kind).not.toBe('artifact');
    expect(visual?.tags).toContain('us_domestic');
  });
});
