import type { MeterState } from '@wargames/shared-types';

export interface HomefrontSignal {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: 'danger' | 'warning' | 'steady';
}

export const buildHomefrontSignals = (
  meters: MeterState,
  previousMeters?: MeterState
): HomefrontSignal[] => {
  const marketComposite = Math.round((meters.economicStability + meters.energySecurity) / 2);
  const marketDelta = previousMeters
    ? Math.round(((meters.economicStability + meters.energySecurity) - (previousMeters.economicStability + previousMeters.energySecurity)) / 2)
    : 0;
  const hasPreviousMeters = Boolean(previousMeters);
  const escalationHeat = Math.max(0, meters.escalationIndex - 40);
  const domesticStress = Math.max(0, 75 - meters.domesticCohesion);
  const stress = Math.max(0, 100 - marketComposite);
  const energyStress = Math.max(0, 100 - meters.energySecurity);
  const economicStress = Math.max(0, 100 - meters.economicStability);
  const energyWeight = hasPreviousMeters ? 0.036 : 0.02;
  const economicWeight = hasPreviousMeters ? 0.014 : 0.008;
  const escalationWeight = hasPreviousMeters ? 0.021 : 0.008;
  const gasPrice = (
    3.45 +
    energyStress * energyWeight +
    economicStress * economicWeight +
    escalationHeat * escalationWeight
  ).toFixed(2);
  const groceryIndex = 100 + Math.round(
    economicStress * (hasPreviousMeters ? 0.42 : 0.24) +
    energyStress * (hasPreviousMeters ? 0.3 : 0.16) +
    domesticStress * (hasPreviousMeters ? 0.18 : 0.08)
  );
  const savingsMove = Math.min(
    24,
    Math.round(
      economicStress * (hasPreviousMeters ? 0.13 : 0.07) +
      meters.escalationIndex * (hasPreviousMeters ? 0.055 : 0.025) +
      Math.max(0, previousMeters ? previousMeters.economicStability - meters.economicStability : 0) * 0.25
    )
  );
  const domesticDelta = previousMeters ? meters.domesticCohesion - previousMeters.domesticCohesion : 0;

  return [
    {
      id: 'fuel',
      label: 'Gas',
      value: `$${gasPrice}`,
      detail: hasPreviousMeters && (marketDelta < 0 || meters.energySecurity < 58)
        ? 'Prices are moving before officials explain why.'
        : 'Drivers see the first jump, not panic yet.',
      tone: meters.energySecurity < 45 || escalationHeat > 35 ? 'danger' : meters.energySecurity < 58 || stress > 42 ? 'warning' : 'steady'
    },
    {
      id: 'groceries',
      label: 'Groceries',
      value: `${groceryIndex}`,
      detail: meters.economicStability < 55 || domesticStress > 25
        ? 'Stores are ordering early and warning suppliers.'
        : 'Retailers are watching freight and inventory.',
      tone: meters.economicStability < 45 || groceryIndex >= 135 ? 'danger' : meters.economicStability < 62 || groceryIndex >= 120 ? 'warning' : 'steady'
    },
    {
      id: 'savings',
      label: '401k',
      value: `-${savingsMove}%`,
      detail: savingsMove >= 8 && hasPreviousMeters
        ? 'Retirement apps are turning red.'
        : 'Markets are down enough for families to notice.',
      tone: savingsMove >= 10 ? 'danger' : savingsMove >= 6 ? 'warning' : 'steady'
    },
    {
      id: 'family',
      label: 'Family Text',
      value: domesticDelta < 0 || meters.domesticCohesion < 55 || meters.escalationIndex > 70 ? 'Are we okay?' : 'Should we fill up?',
      detail: meters.domesticCohesion < 55 || meters.escalationIndex > 70
        ? 'The crisis is now in group chats.'
        : 'People are asking practical questions.',
      tone: meters.domesticCohesion < 45 || meters.escalationIndex > 78 ? 'danger' : meters.domesticCohesion < 62 || meters.escalationIndex > 60 ? 'warning' : 'steady'
    }
  ];
};
