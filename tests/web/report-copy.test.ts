import { describe, expect, it } from 'vitest';

import { summarizeBeijingReadEvolution } from '../../apps/web/src/components/ReportView';

describe('report copy helpers', () => {
  it('turns Beijing belief snapshots into qualitative player-facing language', () => {
    const summaries = summarizeBeijingReadEvolution([
      {
        turn: 1,
        bluffProb: 0.47,
        thresholdHighProb: 0.61,
        humiliation: 0.16
      },
      {
        turn: 2,
        bluffProb: 0.72,
        thresholdHighProb: 0.82,
        humiliation: 0.64
      }
    ]);

    const visibleCopy = summaries
      .flatMap((entry) => [entry.headline, entry.signalRead, entry.pressureRead, entry.faceRead])
      .join(' ');

    expect(visibleCopy).not.toMatch(/\b0\.\d+\b/);
    expect(visibleCopy).not.toMatch(/bluff risk|trigger risk|humiliation pressure|probability|average/i);
    expect(visibleCopy).toContain('Beijing');
    expect(visibleCopy).toContain('Face-saving');
  });
});
