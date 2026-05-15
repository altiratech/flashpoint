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
  const escalationHeat = Math.max(0, meters.escalationIndex - 40);
  const domesticStress = Math.max(0, 75 - meters.domesticCohesion);
  const stress = Math.max(0, 100 - marketComposite);
  const gasPrice = (
    3.55 +
    Math.max(0, 100 - meters.energySecurity) * 0.045 +
    Math.max(0, 100 - meters.economicStability) * 0.018 +
    escalationHeat * 0.025
  ).toFixed(2);
  const groceryIndex = 100 + Math.round(
    Math.max(0, 100 - meters.economicStability) * 0.45 +
    Math.max(0, 100 - meters.energySecurity) * 0.35 +
    domesticStress * 0.2
  );
  const savingsMove = Math.min(
    24,
    Math.round(
      Math.max(0, 100 - meters.economicStability) * 0.14 +
      meters.escalationIndex * 0.06 +
      Math.max(0, previousMeters ? previousMeters.economicStability - meters.economicStability : 0) * 0.25
    )
  );
  const domesticDelta = previousMeters ? meters.domesticCohesion - previousMeters.domesticCohesion : 0;

  return [
    {
      id: 'fuel',
      label: 'Gas',
      value: `$${gasPrice}`,
      detail: marketDelta < 0 || meters.energySecurity < 58
        ? 'Stations are changing prices before officials settle on a public line.'
        : 'Prices are jumpy enough that people notice before the first warning.',
      tone: meters.energySecurity < 45 || escalationHeat > 35 ? 'danger' : meters.energySecurity < 62 || stress > 35 ? 'warning' : 'steady'
    },
    {
      id: 'groceries',
      label: 'Groceries',
      value: `${groceryIndex}`,
      detail: meters.economicStability < 55 || domesticStress > 25
        ? 'Stores are ordering early and warning suppliers about empty shelves.'
        : 'Retailers are watching freight, chips, and basic inventory.',
      tone: meters.economicStability < 45 || groceryIndex >= 135 ? 'danger' : meters.economicStability < 62 || groceryIndex >= 120 ? 'warning' : 'steady'
    },
    {
      id: 'savings',
      label: '401k',
      value: `-${savingsMove}%`,
      detail: savingsMove >= 8
        ? 'People are opening retirement apps and seeing the crisis in red.'
        : 'Markets are nervous enough for normal families to notice.',
      tone: savingsMove >= 10 ? 'danger' : savingsMove >= 6 ? 'warning' : 'steady'
    },
    {
      id: 'family',
      label: 'Family Text',
      value: domesticDelta < 0 || meters.domesticCohesion < 55 || meters.escalationIndex > 70 ? 'Are we okay?' : 'Should we fill up?',
      detail: meters.domesticCohesion < 55 || meters.escalationIndex > 70
        ? 'The crisis has left the briefing room and entered group chats.'
        : 'People are not panicking yet, but they are asking practical questions.',
      tone: meters.domesticCohesion < 45 || meters.escalationIndex > 78 ? 'danger' : meters.domesticCohesion < 62 || meters.escalationIndex > 60 ? 'warning' : 'steady'
    }
  ];
};
