import type { ImageAsset, PostGameReport, ScenarioDefinition } from '@wargames/shared-types';

interface SelectReportVisualInput {
  report: PostGameReport;
  scenario: ScenarioDefinition | null;
  images: ImageAsset[];
}

const isRasterImage = (asset: ImageAsset): boolean => /\.(png|jpe?g|webp)$/i.test(asset.path);

const isPromotableReportImage = (asset: ImageAsset): boolean =>
  !asset.id.startsWith('img_') &&
  isRasterImage(asset) &&
  asset.kind !== 'artifact' &&
  asset.kind !== 'map';

const outcomeTags: Record<PostGameReport['outcome'], string[]> = {
  stabilization: ['relief', 'corridor', 'reassurance', 'shipping', 'public'],
  frozen_conflict: ['blockade', 'shipping', 'queue', 'freeze', 'market_panic', 'collapse'],
  economic_collapse: ['market_panic', 'finance', 'supply_chain', 'chip_shock', 'collapse', 'systemic'],
  regime_instability: ['domesticCohesion', 'public', 'civilian_preparation', 'collapse', 'market_panic'],
  war: ['war', 'strike', 'exchange', 'nuclear_risk', 'invasion', 'militarized', 'collapse', 'tail_risk']
};

const severityFromReport = (report: PostGameReport): number => {
  const stress =
    (100 - report.finalMeters.economicStability) * 0.18 +
    (100 - report.finalMeters.energySecurity) * 0.14 +
    (100 - report.finalMeters.domesticCohesion) * 0.18 +
    report.finalMeters.escalationIndex * 0.3 +
    (100 - report.finalMeters.allianceTrust) * 0.2;

  if (stress > 75) {
    return 4;
  }
  if (stress > 62) {
    return 3;
  }
  if (stress > 48) {
    return 2;
  }
  if (stress > 35) {
    return 1;
  }
  return 0;
};

const scoreTags = (asset: ImageAsset, tags: string[], weight: number): number => {
  const assetTags = new Set(asset.tags.map((tag) => tag.toLowerCase()));
  return tags.reduce((score, tag) => score + (assetTags.has(tag.toLowerCase()) ? weight : 0), 0);
};

export const selectReportVisual = ({
  report,
  scenario,
  images
}: SelectReportVisualInput): ImageAsset | null => {
  const terminalBeat = report.terminalBeatId
    ? scenario?.beats.find((beat) => beat.id === report.terminalBeatId) ?? null
    : null;
  const cueImageIds = [
    ...(terminalBeat?.visualCue?.heroImageIds ?? []),
    ...(terminalBeat?.visualCue?.evidenceImageIds ?? [])
  ];
  const cueTags = [
    ...(terminalBeat?.imageHints ?? []),
    ...(terminalBeat?.visualCue?.tags ?? [])
  ];
  const outcomeTagSet = outcomeTags[report.outcome] ?? [];
  const expectedSeverity = severityFromReport(report);
  const severeHomefront =
    report.finalMeters.economicStability < 50 ||
    report.finalMeters.energySecurity < 50 ||
    report.finalMeters.domesticCohesion < 50;

  const candidates = images.filter(isPromotableReportImage);
  if (candidates.length === 0) {
    return null;
  }

  return [...candidates].sort((left, right) => {
    const score = (asset: ImageAsset): number => {
      let total = 0;
      if (cueImageIds.includes(asset.id)) {
        total += 28;
      }
      total += scoreTags(asset, cueTags, 5);
      total += scoreTags(asset, outcomeTagSet, 7);

      if (asset.tags.includes('us_domestic')) {
        total += severeHomefront ? 9 : 8;
      } else if (report.outcome === 'stabilization') {
        total -= 12;
      }
      if (asset.kind === 'documentary_still') {
        total += 8;
      }
      if (asset.perspective === 'news_frame' || asset.perspective === 'street') {
        total += 4;
      }
      if (asset.perspective === 'ticker' && report.outcome !== 'stabilization') {
        total += 3;
      }
      if (report.outcome === 'stabilization' && asset.severity >= 4) {
        total -= 6;
      }
      total -= Math.abs(asset.severity - expectedSeverity) * 2;

      return total;
    };

    return score(right) - score(left) || right.severity - left.severity || left.id.localeCompare(right.id);
  })[0] ?? null;
};
