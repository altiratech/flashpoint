import { describe, expect, it } from 'vitest';

import { buildHomefrontSignals } from '../../apps/web/src/homefrontSignals';
import type { MeterState } from '@wargames/shared-types';

const openingMeters: MeterState = {
  economicStability: 68,
  energySecurity: 61,
  domesticCohesion: 64,
  militaryReadiness: 57,
  allianceTrust: 63,
  escalationIndex: 38
};

describe('homefront signals', () => {
  it('does not overstate household panic in the opening briefing', () => {
    const signals = buildHomefrontSignals(openingMeters);
    const gas = signals.find((entry) => entry.id === 'fuel');
    const groceries = signals.find((entry) => entry.id === 'groceries');
    const savings = signals.find((entry) => entry.id === 'savings');
    const family = signals.find((entry) => entry.id === 'family');

    expect(Number(gas?.value.replace('$', ''))).toBeLessThan(5);
    expect(Number(groceries?.value)).toBeLessThan(120);
    expect(savings?.value).toBe('-3%');
    expect(family?.value).toBe('Should we fill up?');
    expect(family?.tone).toBe('steady');
  });

  it('escalates household pressure after state deterioration', () => {
    const lateMeters: MeterState = {
      ...openingMeters,
      economicStability: 42,
      energySecurity: 45,
      domesticCohesion: 50,
      escalationIndex: 75
    };

    const signals = buildHomefrontSignals(lateMeters, openingMeters);
    const gas = signals.find((entry) => entry.id === 'fuel');
    const groceries = signals.find((entry) => entry.id === 'groceries');
    const savings = signals.find((entry) => entry.id === 'savings');
    const family = signals.find((entry) => entry.id === 'family');

    expect(Number(gas?.value.replace('$', ''))).toBeGreaterThan(5.75);
    expect(Number(groceries?.value)).toBeGreaterThan(135);
    expect(savings?.tone).toBe('danger');
    expect(family?.value).toBe('Are we okay?');
  });
});
