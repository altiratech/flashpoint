import { useMemo, useState, type ReactNode } from 'react';

import type { ActionDefinition, ActionNarrativePhaseContent, ActionVariantDefinition } from '@wargames/shared-types';

interface ActionCardsProps {
  actions: ActionDefinition[];
  disabled: boolean;
  selectedActionId: string | null;
  selectedVariantId?: string | null;
  selectedVariantLabel?: string | null;
  selectedCustomLabel?: string | null;
  selectedInterpretationRationale?: string | null;
  selectedNarrativeEmphasis?: string | null;
  selectedActionNarrativePreview?: ActionNarrativePhaseContent | null;
  actionAdvisorSummaries: Map<string, { supports: number; cautions: number; opposes: number }>;
  customResponseSlot?: ReactNode;
  onSelect: (actionId: string, variantId?: string | null) => void;
}

const getDefaultVariant = (action: ActionDefinition): ActionVariantDefinition | null => {
  if (!action.variants || action.variants.length === 0) {
    return null;
  }

  return (
    action.variants.find((variant) => variant.id === action.defaultVariantId || variant.isDefault) ??
    action.variants[0] ??
    null
  );
};

const getSelectedVariant = (action: ActionDefinition, selectedVariantId?: string | null): ActionVariantDefinition | null => {
  if (!selectedVariantId) {
    return getDefaultVariant(action);
  }

  return action.variants?.find((variant) => variant.id === selectedVariantId) ?? getDefaultVariant(action);
};

const variantButtonTone = (active: boolean): string =>
  active
    ? 'border-accent bg-accent/12 text-textMain shadow-[inset_0_-2px_0_rgba(255,177,0,1)]'
    : 'border-borderTone/80 bg-panelRaised/35 text-textMuted hover:border-accent/70 hover:bg-panelRaised/60 hover:text-textMain';

const visibilityTone = (visibility: ActionDefinition['visibility']): string => {
  if (visibility === 'public') {
    return 'text-warning';
  }
  if (visibility === 'semi-public') {
    return 'text-accent';
  }
  return 'text-positive';
};

const postureHint = (action: ActionDefinition): string => {
  const netEscalation = action.signal.escalatory - action.signal.deescalatory;
  if (netEscalation >= 0.5) {
    return 'Beijing is likely to read this as a firmer show of resolve. Allies and markets will quickly judge whether it looks controlled or reckless.';
  }
  if (netEscalation <= -0.5) {
    return 'Beijing is likely to read this as restraint. Allies will watch closely to see whether it buys time or looks like a step back.';
  }
  return 'Beijing is likely to read this as a mixed signal. It keeps choices open, but allies and markets may wait before they trust it.';
};

const visibilityHint = (visibility: ActionDefinition['visibility']): string => {
  if (visibility === 'public') {
    return 'Governments, newsrooms, insurers, and traders can react within minutes.';
  }
  if (visibility === 'semi-public') {
    return 'Allied governments, Beijing officials, and industry channels are likely to react first. If it leaks, markets may follow quickly.';
  }
  return 'Initial reaction should stay inside closed channels, but execution problems or leaks can still push the move into public view.';
};

const riskHint = (action: ActionDefinition): string => {
  const dominant = Math.max(
    action.signal.humiliationRisk,
    action.signal.economicStressSignal,
    action.signal.allianceStressSignal
  );
  if (dominant === action.signal.humiliationRisk) {
    return 'Principal risk: Beijing may answer with a sharper move rather than appear to yield under pressure.';
  }
  if (dominant === action.signal.economicStressSignal) {
    return 'Principal risk: shipping, inventory, insurance, and market confidence could deteriorate faster than governments can calm them.';
  }
  return 'Principal risk: allies may read the move differently, weakening the joint line and shaking market confidence.';
};

const firstImpactHint = (action: ActionDefinition): string => {
  if (action.signal.economicStressSignal >= 0.55) {
    return 'Likely first impact: shipping rates, insurance pricing, semiconductor-sensitive names, and broad risk sentiment are the first places to move.';
  }
  if (action.signal.allianceStressSignal >= 0.55) {
    return 'Likely first impact: allies may wobble in public, which quickly feeds uncertainty into business planning and markets.';
  }
  const netEscalation = action.signal.escalatory - action.signal.deescalatory;
  if (netEscalation >= 0.5) {
    return 'Likely first impact: counterpart military and diplomatic channels harden first; market repricing usually follows once follow-through becomes visible.';
  }
  if (netEscalation <= -0.5) {
    return 'Likely first impact: sentiment and freight expectations may stabilize briefly, provided the move is not read as concession.';
  }
  return 'Likely first impact: most people with money or ships at risk will wait to see what happens next.';
};

const actionOneLiner = (action: ActionDefinition): string => {
  const loweredTags = action.tags.map((tag) => tag.toLowerCase());

  if (loweredTags.includes('diplomacy') && action.visibility === 'secret') {
    return 'Call privately and find out whether there is still a way to stop this before it gets worse.';
  }
  if (loweredTags.includes('diplomacy') && action.visibility !== 'secret') {
    return 'Put a way out on the table publicly and see whether Beijing rejects it.';
  }
  if (loweredTags.includes('military')) {
    return 'Move forces so the next hostile step looks more dangerous to take.';
  }
  if (loweredTags.includes('intel')) {
    return 'Get a clearer picture before making a larger move.';
  }
  if (loweredTags.includes('economic')) {
    return 'Use money, shipping, and trade pressure instead of a military move.';
  }

  return action.summary;
};

const hiddenDownsideMeta = (category?: string | null): { label: string; detail: string } | null => {
  if (!category) {
    return null;
  }

  const map: Record<string, { label: string; detail: string }> = {
    attribution: {
      label: 'Attribution risk',
      detail: 'The move can be traced back quickly enough to erase deniability and invite direct counterpressure.'
    },
    collection_overreach: {
      label: 'Collection overreach',
      detail: 'The push for clarity can expose methods or create a noisy intelligence picture that is harder to trust.'
    },
    counterintrusion: {
      label: 'Counterintrusion',
      detail: 'A stronger defensive or cyber move can trigger a reciprocal probe against allied or commercial systems.'
    },
    exposure: {
      label: 'Exposure risk',
      detail: 'A move meant to stay contained can leak, forcing public explanation before the coalition is ready.'
    },
    false_relief: {
      label: 'False relief',
      detail: 'A calmer signal can disguise a harder follow-on move and pull operators into lowering their guard too early.'
    },
    financial_spillover: {
      label: 'Financial spillover',
      detail: 'What begins as a strategic move can quickly widen into margin stress, funding pressure, and broader market instability.'
    },
    force_burn: {
      label: 'Force burn',
      detail: 'Visible readiness can consume limited capacity faster than planners can replenish it.'
    },
    humiliation: {
      label: 'Humiliation risk',
      detail: 'If the counterpart reads the move as public humiliation, the next step can become more retaliatory and less reversible.'
    },
    market_panic: {
      label: 'Market panic',
      detail: 'Markets may treat the move as the start of something worse and reprice faster than governments can steady expectations.'
    },
    miscalculation: {
      label: 'Miscalculation',
      detail: 'The move can be read as preparation for something larger, increasing the odds of an unnecessary collision.'
    },
    misread_weakness: {
      label: 'Misread weakness',
      detail: 'A cautious move can be interpreted as hesitation, encouraging a harder test instead of restraint.'
    },
    normalized_coercion: {
      label: 'Normalized coercion',
      detail: 'If pressure is left partially unanswered, it can harden into a new operating baseline around the corridor.'
    },
    panic_buying: {
      label: 'Panic buying',
      detail: 'Businesses may rush to secure inventory and shipping routes, worsening shortages and price shock.'
    },
    panic_signal: {
      label: 'Panic signal',
      detail: 'The move itself may communicate alarm, convincing allies and markets that the worst case is closer than they thought.'
    },
    public_commitment: {
      label: 'Public commitment trap',
      detail: 'Once the line is public, backing away becomes reputationally harder even if conditions change.'
    },
    reciprocal_cyber: {
      label: 'Reciprocal cyber',
      detail: 'The move can invite a symmetric digital response against logistics, communications, or commercial infrastructure.'
    },
    retaliatory_cyber: {
      label: 'Retaliatory cyber',
      detail: 'Counterpressure may surface first in cyber channels instead of the visible military lane.'
    },
    retaliatory_pressure: {
      label: 'Retaliatory pressure',
      detail: 'A firmer move can trigger an immediate answer intended to prove the counterpart still controls the pace.'
    },
    slow_rollout: {
      label: 'Slow rollout',
      detail: 'The move may be too gradual to shape expectations before the next shock arrives.'
    },
    strategic_retreat: {
      label: 'Retreat signal',
      detail: 'The move can be read as preparing to step back rather than preparing to hold the line.'
    },
    systemic_spillover: {
      label: 'Spillover',
      detail: 'The damage can escape the immediate theater and begin stressing the wider financial and operating system.'
    },
    underreaction: {
      label: 'Underreaction',
      detail: 'A moderate signal can buy time but also leave the other side believing the pressure remains cheap.'
    },
    visible_blink: {
      label: 'Visible blink',
      detail: 'If the move looks like a concession, allies and markets may start planning around a weaker coalition line.'
    }
  };

  return map[category] ?? {
    label: 'Hidden downside',
    detail: 'This move carries a delayed risk that may not be obvious until the next decision window.'
  };
};

const firstShockLine = (action: ActionDefinition): string => {
  const loweredTags = action.tags.map((tag) => tag.toLowerCase());

  if (loweredTags.includes('economic')) {
    return 'First shock will likely show up in funding, freight, insurance, and inventory planning.';
  }
  if (loweredTags.includes('intel')) {
    return 'First effect lands in the picture itself: attribution, confidence, and warning time.';
  }
  if (loweredTags.includes('military')) {
    return 'First effect lands in how fast forces move and how seriously Beijing takes the line.';
  }
  if (loweredTags.includes('diplomacy')) {
    return 'First effect lands in whether allies see a real way out or just more delay.';
  }
  if (loweredTags.includes('messaging')) {
    return 'First effect lands in public interpretation, coalition messaging, and market sentiment.';
  }

  return 'First effect lands in how Beijing, allies, and businesses interpret the next move.';
};

interface PlainActionRead {
  beijing: string;
  alliesMarkets: string;
  lands: string;
  risk: string;
}

const plainActionRead = (action: ActionDefinition, variant?: ActionVariantDefinition | null): PlainActionRead | null => {
  const variantLabel = variant?.label ? ` (${variant.label})` : '';

  switch (action.id) {
    case 'backchannel_diplomacy':
      return {
        beijing: `Beijing will hear a private call${variantLabel} as proof Washington still wants a way out. It may use that opening, or it may treat the silence as weakness.`,
        alliesMarkets: 'Allies can live with quiet talks if they see proof the United States is not bargaining Taiwan away. Markets will wait for movement, not words.',
        lands: 'If it works, ships and insurers get one real sign that the crisis is not locked into the worst path.',
        risk: 'If it leaks or stalls, the story becomes Washington asking for time while Beijing keeps pressure on the water.'
      };
    case 'public_signaling_speech':
      return {
        beijing: 'Beijing will parse every line for a red line, a bluff, or a place to split the coalition.',
        alliesMarkets: 'Allies and markets get a clearer public line, but the words can also trap everyone if the next move does not match them.',
        lands: 'If it works, the public hears one steady message and allies stop sounding like nervous separate governments.',
        risk: 'If it goes too far, both sides may be locked into public promises they cannot easily walk back.'
      };
    case 'targeted_sanctions':
      return {
        beijing: 'Beijing will call it economic warfare, then look for the fastest way to make U.S. and allied firms feel pain back.',
        alliesMarkets: 'Allies usually tolerate a narrow package better than a broad shock. Compliance desks and exposed firms will still move fast.',
        lands: 'If it works, the pressure campaign gets more expensive without breaking the whole market at once.',
        risk: 'If firms overreact, cargoes pause, legal desks freeze, and the market shock outruns the policy memo.'
      };
    case 'broad_sanctions':
      return {
        beijing: 'Beijing will see this as a major escalation beyond the Strait and may answer wherever the coalition is weakest.',
        alliesMarkets: 'Committed allies may praise the resolve. Others will immediately calculate how much market pain they can survive.',
        lands: 'If it works, Beijing learns the next squeeze will not stay cheap.',
        risk: 'The same shock hits everyone else: banks, shipping, chip supply, factories, and retirement accounts.'
      };
    case 'resource_stockpiling':
      return {
        beijing: 'Beijing will see a country preparing to endure a longer crisis instead of folding under short-term pain.',
        alliesMarkets: 'Allies like practical preparation. The public may see guarded depots and early orders and wonder what the government knows.',
        lands: 'If it works, one more supply shock does not immediately become empty shelves, empty tanks, and panic calls.',
        risk: 'If the move looks too visible, buyers may start hoarding before the reserves can calm anyone.'
      };
    case 'cyber_intrusion':
      return {
        beijing: 'If Beijing catches the access, it will assume Washington is preparing to expose or disrupt the next move.',
        alliesMarkets: 'Partners like the cleaner picture as long as the operation stays invisible. A leak makes the cyber fight feel like it has already reached ports and firms.',
        lands: 'If it works, the room gets more warning time and a better read on what is real.',
        risk: 'If alarms trip, Beijing can wipe routes, set decoys, and accuse Washington while the evidence is still classified.'
      };
    case 'cyber_disruption':
      return {
        beijing: 'Beijing will treat disruption as a step beyond watching and into active interference.',
        alliesMarkets: 'Allies may accept a non-shooting move, but only if civilian systems stay untouched.',
        lands: 'If it works, the pressure ring slows down without missiles in the air.',
        risk: 'If it splashes into civilian systems, bookings, payments, and port operations can become the next front.'
      };
    case 'covert_sabotage':
      return {
        beijing: 'If Beijing links the move back to Washington, it will treat the deniability as insult, not restraint.',
        alliesMarkets: 'Allies want the pressure slowed, but they will not want to defend a covert mess in public.',
        lands: 'If it works, the next pressure move arrives late, broken, or confused.',
        risk: 'If it is exposed, the crisis becomes less about Beijing pressure and more about who started hidden attacks.'
      };
    case 'military_posture_increase':
      return {
        beijing: 'Beijing will see more ships and aircraft as proof the United States may take real risk.',
        alliesMarkets: 'Allies may feel protected, while markets price the chance that one mistake turns into a collision.',
        lands: 'If it works, the next hostile step looks more dangerous to take.',
        risk: 'If commanders misread each other, the military move meant to prevent a war can become the thing that starts one.'
      };
    case 'military_posture_decrease':
      return {
        beijing: 'Beijing may see restraint, or it may see a chance to press harder while the line looks softer.',
        alliesMarkets: 'Markets may breathe for a moment. Allies will ask whether the pullback still leaves enough protection in place.',
        lands: 'If it works, heat comes down and the other side has room to match the step.',
        risk: 'If it looks like a blink, Beijing may test the gap before the coalition can reset.'
      };
    case 'intelligence_surge':
      return {
        beijing: 'Beijing will notice if allied collection tightens and may start hiding, spoofing, or rushing its next move.',
        alliesMarkets: 'Allies like shared evidence because it makes later public claims easier to defend.',
        lands: 'If it works, the room stops guessing through the next window.',
        risk: 'If the surge gets noisy, the picture can look more certain than it really is.'
      };
    case 'limited_concession':
      return {
        beijing: 'Beijing will test whether the offer is a real way out or proof that pressure works.',
        alliesMarkets: 'Allies and markets may welcome a pause, but only if it comes with proof the pressure stops.',
        lands: 'If it works, carriers and traders get a reason to stop pricing the worst case for a few hours.',
        risk: 'If Beijing pockets the concession and keeps moving, the coalition looks weaker and the next demand gets easier.'
      };
    default:
      return null;
  }
};

export const ActionCards = ({
  actions,
  disabled,
  selectedActionId,
  selectedVariantId,
  selectedVariantLabel,
  selectedCustomLabel,
  selectedInterpretationRationale,
  selectedNarrativeEmphasis,
  selectedActionNarrativePreview,
  actionAdvisorSummaries,
  customResponseSlot,
  onSelect
}: ActionCardsProps) => {
  const [showHelp, setShowHelp] = useState(false);

  const sorted = useMemo(() => {
    return [...actions].sort((left, right) => left.name.localeCompare(right.name));
  }, [actions]);

  const selectedAction = useMemo(
    () => sorted.find((entry) => entry.id === selectedActionId) ?? null,
    [selectedActionId, sorted]
  );
  const selectedVariant = useMemo(
    () => (selectedAction ? getSelectedVariant(selectedAction, selectedVariantId) : null),
    [selectedAction, selectedVariantId]
  );
  const selectedPlainRead = useMemo(
    () => (selectedAction ? plainActionRead(selectedAction, selectedVariant) : null),
    [selectedAction, selectedVariant]
  );

  return (
    <section className="console-subpanel h-full min-w-0 px-3 py-3 sm:px-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label">What Do You Do?</p>
          <p className="mt-2 text-[0.84rem] leading-relaxed text-textMuted">
            Pick a response. The advisors and consequence cards will show what could happen next.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center border border-borderTone bg-panelRaised text-[0.84rem] text-textMuted transition hover:border-accent hover:text-textMain"
            onClick={() => setShowHelp((current) => !current)}
          >
            ?
          </button>
          <p className="text-[0.72rem] uppercase tracking-[0.12em] text-textMuted">{sorted.length} options</p>
        </div>
      </div>

      {showHelp ? (
        <div className="mt-3 border border-borderTone/80 bg-panelRaised/55 px-3 py-2 text-[0.84rem] leading-relaxed text-textMuted">
          Pick a response, check the downside, then commit when you are ready to move.
        </div>
      ) : null}

      <div className="mt-3">
        <p className="label">Available Moves</p>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {sorted.map((action) => {
          const active = action.id === selectedActionId;
          const summary = actionAdvisorSummaries.get(action.id) ?? { supports: 0, cautions: 0, opposes: 0 };
          const defaultVariant = getDefaultVariant(action);
          const downside = hiddenDownsideMeta(defaultVariant?.hiddenDownsideCategory);
          return (
            <button
              key={action.id}
              type="button"
              className={`w-full border px-3 py-2.5 text-left transition ${
                active
                  ? 'border-accent bg-accent/12 text-textMain shadow-[inset_0_-2px_0_rgba(255,177,0,1)]'
                  : 'border-borderTone/80 bg-panelRaised/55 text-textMuted hover:border-accent/70 hover:bg-panelRaised/75 hover:text-textMain'
              } ${disabled ? 'cursor-not-allowed opacity-55' : ''}`}
              disabled={disabled}
              onClick={() => onSelect(action.id)}
            >
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-[0.92rem] text-inherit">{action.name}</p>
                    <span
                      className={`px-1.5 py-0.5 text-[0.68rem] uppercase tracking-[0.12em] ${visibilityTone(action.visibility)}`}
                    >
                      {action.visibility}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.72rem] uppercase tracking-[0.12em] text-textMuted">
                    {action.tags.slice(0, 2).join(' · ') || 'Response option'}
                  </p>
                  <p className="mt-2 text-[0.84rem] leading-relaxed text-textMain/90">
                    {defaultVariant?.summary ?? actionOneLiner(action)}
                  </p>
                  <p className="mt-1 text-[0.88rem] leading-relaxed text-textMuted">
                    {downside ? `${downside.label}: ${downside.detail}` : firstShockLine(action)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    <span className="px-0.5 py-0.5 text-[0.68rem] uppercase tracking-[0.12em] text-positive">
                      Supports {summary.supports}
                    </span>
                    <span className="px-0.5 py-0.5 text-[0.68rem] uppercase tracking-[0.12em] text-warning">
                      Cautions {summary.cautions}
                    </span>
                    <span className="px-0.5 py-0.5 text-[0.68rem] uppercase tracking-[0.12em] text-red-300">
                      Opposes {summary.opposes}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 self-start text-[0.68rem] uppercase tracking-[0.12em] text-accent/90 sm:self-auto">
                  {active ? 'Selected' : 'Open'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {customResponseSlot ? <div className="mt-4">{customResponseSlot}</div> : null}

      <div className="mt-4 border border-borderTone bg-panelRaised/40 p-3">
        {selectedAction ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="label">Your Move</p>
                  {selectedCustomLabel ? (
                    <p className="mt-2 text-[0.68rem] uppercase tracking-[0.12em] text-accent">Custom framing</p>
                  ) : null}
                  <h3 className="mt-2 font-display text-xl text-textMain">{selectedCustomLabel ?? selectedAction.name}</h3>
                  {selectedVariantLabel ? (
                    <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-textMuted">
                      Approach: {selectedAction.name} · {selectedVariantLabel}
                    </p>
                  ) : null}
                </div>
              <span className={`px-2 py-1 text-[0.68rem] uppercase tracking-[0.12em] ${visibilityTone(selectedAction.visibility)}`}>
                {selectedAction.visibility}
              </span>
            </div>

            <div className="space-y-2">
              {selectedAction.variants && selectedAction.variants.length > 1 ? (
                <div>
                  <p className="label">Approach</p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    {selectedAction.variants.map((variant) => {
                      const active = selectedVariant?.id === variant.id;
                      const downside = hiddenDownsideMeta(variant.hiddenDownsideCategory);
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          className={`rounded-md border px-3 py-2 text-left transition ${variantButtonTone(active)} ${
                            disabled ? 'cursor-not-allowed opacity-55' : ''
                          }`}
                          disabled={disabled}
                          onClick={() => onSelect(selectedAction.id, variant.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em]">{variant.label}</p>
                            <span className="text-[0.68rem] uppercase tracking-[0.1em] text-accent">
                              {active ? 'Selected' : 'Choose'}
                            </span>
                          </div>
                          <p className="mt-1 text-[0.84rem] leading-relaxed">{variant.summary}</p>
                          {downside ? (
                            <p className="mt-1 text-[0.84rem] leading-relaxed text-textMuted">
                              Risk: {downside.label}
                            </p>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <p className="label">What Happens First</p>
              <p className="text-[0.84rem] leading-relaxed text-textMain">
                {selectedVariant?.summary ?? actionOneLiner(selectedAction)}
              </p>
              <p className="text-[0.84rem] leading-relaxed text-textMuted">
                {selectedAction.summary}
              </p>
            </div>

            {selectedInterpretationRationale || selectedNarrativeEmphasis ? (
              <div className="grid gap-2 lg:grid-cols-2">
                {selectedInterpretationRationale ? (
                  <div className="console-subpanel px-3 py-2.5">
                    <p className="text-[0.68rem] uppercase tracking-[0.12em] text-textMuted">Your Read</p>
                    <p className="mt-1 text-[0.84rem] leading-relaxed text-textMain">{selectedInterpretationRationale}</p>
                  </div>
                ) : null}
                {selectedNarrativeEmphasis ? (
                  <div className="console-subpanel px-3 py-2.5">
                    <p className="text-[0.68rem] uppercase tracking-[0.12em] text-textMuted">How This Plays Out</p>
                    <p className="mt-1 text-[0.84rem] leading-relaxed text-textMain">{selectedNarrativeEmphasis}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

              <div className="grid gap-2 lg:grid-cols-2">
                <div className="console-subpanel px-3 py-2.5">
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-textMuted">How Beijing Takes It</p>
                  <p className="mt-1 text-[0.84rem] leading-relaxed text-textMain">
                    {selectedPlainRead?.beijing ?? selectedActionNarrativePreview?.rivalReaction ?? postureHint(selectedAction)}
                  </p>
                </div>
                <div className="console-subpanel px-3 py-2.5">
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-textMuted">How Allies And Markets React</p>
                  <p className="mt-1 text-[0.84rem] leading-relaxed text-textMain">
                    {selectedPlainRead?.alliesMarkets ?? selectedActionNarrativePreview?.allianceReaction ?? visibilityHint(selectedAction.visibility)}
                  </p>
                </div>
                <div className="console-subpanel px-3 py-2.5">
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-textMuted">If This Lands</p>
                  <p className="mt-1 text-[0.84rem] leading-relaxed text-textMain">
                    {selectedPlainRead?.lands ?? selectedActionNarrativePreview?.successOutcome ?? firstImpactHint(selectedAction)}
                  </p>
                </div>
                <div className="console-subpanel px-3 py-2.5">
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-textMuted">What Could Go Wrong</p>
                  <p className="mt-1 text-[0.84rem] leading-relaxed text-textMain">
                    {selectedPlainRead?.risk ??
                      selectedActionNarrativePreview?.complicationOutcome ??
                      hiddenDownsideMeta(selectedVariant?.hiddenDownsideCategory)?.detail ??
                      riskHint(selectedAction)}
                  </p>
                </div>
              </div>

              {selectedVariant?.hiddenDownsideCategory ? (
                <div className="rounded-md border border-borderTone/80 bg-panelRaised/35 px-3 py-2.5">
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-textMuted">Hidden Downside</p>
                  <p className="mt-1 text-[0.84rem] leading-relaxed text-textMain">
                    {hiddenDownsideMeta(selectedVariant.hiddenDownsideCategory)?.label ?? 'Delayed downside'}{' '}
                    <span className="text-textMuted">
                      {hiddenDownsideMeta(selectedVariant.hiddenDownsideCategory)?.detail}
                    </span>
                  </p>
                </div>
              ) : null}

            <div className="flex flex-wrap gap-1.5">
              {selectedAction.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-borderTone/80 px-1.5 py-0.5 text-[0.68rem] uppercase tracking-[0.1em] text-textMuted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="label">Your Move</p>
            <p className="mt-2 text-[0.88rem] leading-relaxed text-textMuted">
              No response selected yet. Choose one option above to load the likely consequences, advisor views, and confirmation path.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
