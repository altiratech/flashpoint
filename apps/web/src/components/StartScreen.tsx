import { useMemo, useState } from 'react';

import type { BootstrapPayload, OutcomeCategory } from '@wargames/shared-types';

type TimerMode = 'standard' | 'relaxed' | 'off';

export interface RecentCompletedReport {
  episodeId: string;
  scenarioId: string;
  outcome: OutcomeCategory;
  finalTurn: number;
  finalPressure: number;
  pivotalDecision: string;
  completedAt: string;
}

export interface ActiveRunRecovery {
  episodeId: string;
  scenarioId: string;
  turn: number;
  currentBeatId: string;
  timerMode: TimerMode;
  lastSeenAt: string;
}

export type RunHistoryEventType =
  | 'run_started'
  | 'run_resumed'
  | 'returned_setup'
  | 'report_saved'
  | 'active_removed'
  | 'active_cleared'
  | 'report_removed'
  | 'reports_cleared';

export interface RunHistoryEvent {
  id: string;
  type: RunHistoryEventType;
  createdAt: string;
  scenarioId?: string;
  episodeId?: string;
  count?: number;
}

interface StartScreenProps {
  reference: BootstrapPayload;
  loading: boolean;
  error: string | null;
  activeRuns: ActiveRunRecovery[];
  recentReports: RecentCompletedReport[];
  runHistory: RunHistoryEvent[];
  onStart: (input: {
    codename: string;
    scenarioId: string;
    seed?: string;
    timerMode: TimerMode;
  }) => Promise<void>;
  onResumeRun: (episodeId: string) => Promise<void>;
  onRemoveActiveRun: (episodeId: string) => void;
  onClearActiveRuns: () => void;
  onOpenReport: (episodeId: string) => Promise<void>;
  onRemoveReport: (episodeId: string) => void;
  onClearReports: () => void;
}

const randomSeed = (): string => Math.random().toString(36).slice(2, 10).toUpperCase();

const setupEvidenceImageIds = [
  'tw_us_family_cable_news_crisis',
  'tw_us_gas_lines_freight_shock',
  'tw_us_supermarket_panic',
  'tw_bs_023'
];

const outcomeLabel: Record<OutcomeCategory, string> = {
  stabilization: 'Stabilized',
  frozen_conflict: 'Frozen Conflict',
  war: 'War',
  regime_instability: 'Regime Instability',
  economic_collapse: 'Economic Collapse'
};

const historyLabel: Record<RunHistoryEventType, string> = {
  run_started: 'Started run',
  run_resumed: 'Resumed run',
  returned_setup: 'Returned to setup',
  report_saved: 'Report saved',
  active_removed: 'Active run removed',
  active_cleared: 'Active runs cleared',
  report_removed: 'Report removed',
  reports_cleared: 'Reports cleared'
};

const formatBeatLabel = (beatId: string): string => beatId.replace(/^ns_/, '').replaceAll('_', ' ');

const timerModeOptions: Record<TimerMode, { label: string; detail: string; summary: string }> = {
  off: {
    label: 'User-paced',
    detail: 'No countdown. Best for reading, review, and first-time evaluation.',
    summary: 'No countdown. Windows advance only when you commit a response or deliberately hold position.'
  },
  relaxed: {
    label: 'Relaxed timed',
    detail: 'Timed windows with 50% more time and extension support.',
    summary: 'Timed windows with 50% more time and one extension available while episode extensions remain.'
  },
  standard: {
    label: 'Standard timed',
    detail: 'Authored pressure clock. Best for a sharper playtest run.',
    summary: 'Authored pressure clock. Decision windows can expire into an inaction branch.'
  }
};

export const StartScreen = ({
  reference,
  loading,
  error,
  activeRuns,
  recentReports,
  runHistory,
  onStart,
  onResumeRun,
  onRemoveActiveRun,
  onClearActiveRuns,
  onOpenReport,
  onRemoveReport,
  onClearReports
}: StartScreenProps) => {
  const [codename] = useState(() => `RUN-${randomSeed()}`);
  const [seed, setSeed] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [timerMode, setTimerMode] = useState<TimerMode>('off');
  const selectedTimerMode = timerModeOptions[timerMode];

  const playableScenarios = useMemo(
    () => reference.scenarios.filter((entry) => !entry.isLegacy),
    [reference.scenarios]
  );
  const defaultScenario = playableScenarios[0]?.id ?? reference.scenarios[0]?.id ?? '';

  const [scenarioId, setScenarioId] = useState(defaultScenario);

  const selectedScenario = useMemo(
    () => playableScenarios.find((entry) => entry.id === scenarioId) ?? reference.scenarios.find((entry) => entry.id === scenarioId),
    [playableScenarios, reference.scenarios, scenarioId]
  );
  const selectedScenarioWorld = useMemo(
    () => reference.scenarioWorld.find((entry) => entry.scenarioId === scenarioId) ?? null,
    [reference.scenarioWorld, scenarioId]
  );
  const recentReportCards = useMemo(
    () =>
      recentReports.map((report) => ({
        ...report,
        scenarioName: reference.scenarios.find((scenario) => scenario.id === report.scenarioId)?.name ?? 'Scenario run',
        shortId: report.episodeId.slice(0, 8),
        completedDate: new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        }).format(new Date(report.completedAt))
      })),
    [recentReports, reference.scenarios]
  );
  const activeRunCards = useMemo(
    () =>
      activeRuns.map((run) => ({
        ...run,
        scenarioName: reference.scenarios.find((scenario) => scenario.id === run.scenarioId)?.name ?? 'Scenario run',
        shortId: run.episodeId.slice(0, 8),
        timerLabel: timerModeOptions[run.timerMode]?.label ?? 'User-paced',
        beatLabel: formatBeatLabel(run.currentBeatId),
        lastSeenLabel: new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        }).format(new Date(run.lastSeenAt))
      })),
    [activeRuns, reference.scenarios]
  );
  const latestActiveRun = activeRunCards[0] ?? null;
  const activeRunLookup = useMemo(
    () => new Map(activeRuns.map((run) => [run.episodeId, run])),
    [activeRuns]
  );
  const recentReportLookup = useMemo(
    () => new Map(recentReports.map((report) => [report.episodeId, report])),
    [recentReports]
  );
  const activityCards = useMemo(
    () =>
      runHistory.map((event) => {
        const shortId = event.episodeId?.slice(0, 8) ?? null;
        const activeRun = event.episodeId ? activeRunLookup.get(event.episodeId) : undefined;
        const recentReport = event.episodeId ? recentReportLookup.get(event.episodeId) : undefined;
        const scenarioName = event.scenarioId
          ? reference.scenarios.find((scenario) => scenario.id === event.scenarioId)?.name ?? 'Scenario run'
          : 'Local setup index';
        const activityDate = new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        }).format(new Date(event.createdAt));
        const detail = event.count
          ? `${event.count} entr${event.count === 1 ? 'y' : 'ies'}`
          : shortId
            ? `Episode ${shortId}`
            : 'Local entry';

        return {
          ...event,
          label: historyLabel[event.type],
          scenarioName,
          activityDate,
          detail,
          action:
            recentReport && event.episodeId
              ? {
                  type: 'open_report' as const,
                  label: 'Open Report',
                  episodeId: event.episodeId
                }
              : activeRun && event.episodeId
                ? {
                    type: 'resume_run' as const,
                    label: 'Resume',
                    episodeId: event.episodeId
                  }
                : null
        };
      }),
    [activeRunLookup, recentReportLookup, reference.scenarios, runHistory]
  );

  const setupContextCards = useMemo(() => {
    const sections = selectedScenarioWorld?.openingBackground?.sections ?? [];
    if (sections.length > 0) {
      return sections;
    }

    return [
      {
        id: 'why_now',
        title: 'Why This Window Looks Different',
        body: 'The coalition is entering the run from a thinner economic and military position than it had a year earlier, which makes ambiguity and warning-time compression more dangerous.'
      },
      {
        id: 'market_first',
        title: 'Why The Market Moves First',
        body: 'Commercial actors usually react before governments settle on language, which is why insurance, freight, and chip supply can break before policy does.'
      },
      {
        id: 'what_you_control',
        title: 'What The First Decisions Do',
        body: 'The early windows are about shaping how the room, the market, and the corridor read the same event before pressure becomes the accepted baseline.'
      }
    ];
  }, [selectedScenarioWorld]);

  const setupEvidenceAsset = useMemo(
    () => setupEvidenceImageIds.map((id) => reference.images.find((image) => image.id === id)).find(Boolean) ?? null,
    [reference.images]
  );

  const theaterStamp = selectedScenarioWorld
    ? `${selectedScenarioWorld.region.name} / ${selectedScenarioWorld.dateAnchor.month} ${selectedScenarioWorld.dateAnchor.year} / ${selectedScenarioWorld.dateAnchor.dayRange}`
    : 'Theater data pending';

  const handleStart = async (): Promise<void> => {
    const payload: {
      codename: string;
      scenarioId: string;
      seed?: string;
      timerMode: TimerMode;
    } = {
      codename,
      scenarioId,
      timerMode
    };

    const normalizedSeed = seed.trim();
    if (normalizedSeed) {
      payload.seed = normalizedSeed;
    }

    await onStart(payload);
  };

  return (
    <main className="console-shell">
      <section className="grid min-h-[calc(100vh-1.5rem)] min-w-0 gap-4 xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="console-sidebar flex flex-col">
          <div className="console-sidebar-brand">Altira Flashpoint</div>

          <div className="console-sidebar-section">
            <p className="console-sidebar-label">Active Scenario</p>
            <div className="console-nav-meta">
              <p className="text-[0.72rem] uppercase tracking-[0.08em] text-textMain">
                {selectedScenario?.name ?? 'No scenario selected'}
              </p>
              <p className="mt-2 text-[0.72rem] uppercase tracking-[0.14em] text-textMuted">{theaterStamp}</p>
            </div>
          </div>

          <div className="console-sidebar-section">
            <p className="console-sidebar-label">Run State</p>
            <div className="space-y-2">
              <div className="console-nav-meta">
                <p className="text-[0.68rem] uppercase tracking-[0.14em] text-textMuted">Flow</p>
                <p className="mt-1 text-[0.72rem] uppercase tracking-[0.08em] text-textMain">
                  {selectedTimerMode.label}
                </p>
              </div>
              <div className="console-nav-meta">
                <p className="text-[0.68rem] uppercase tracking-[0.14em] text-textMuted">Launch Path</p>
                <p className="mt-1 text-[0.72rem] uppercase tracking-[0.08em] text-textMain">Context-first briefing</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-4">
          <header className="console-topbar px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="console-kicker">Altira Flashpoint // Scenario Setup</p>
                <h1 className="mt-2 font-display text-3xl uppercase tracking-[0.08em] text-textMain sm:text-4xl">
                  Configure Scenario Run
                </h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="console-chip">
                  <strong>Scenario</strong>
                  <span>{selectedScenario?.name ?? 'None'}</span>
                </div>
                <div className="console-chip">
                  <strong>Flow</strong>
                  <span>{selectedTimerMode.label}</span>
                </div>
              </div>
            </div>
            <p className="mt-3 max-w-4xl text-[0.84rem] leading-relaxed text-textMuted">
              Choose the scenario, review why this window looks dangerous now, then begin the first briefing window. Current decision clock: {selectedTimerMode.summary}
            </p>
          </header>

          <section className="grid min-w-0 gap-4 2xl:grid-cols-[1.08fr_0.92fr]">
            <section className="console-panel min-w-0 p-5 sm:p-6">
              <p className="label">Scenario Brief</p>
              <div className="mt-3 console-subpanel px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="console-chip">
                    <strong>Theater</strong>
                    <span>{theaterStamp}</span>
                  </span>
                  <span className="console-chip">
                    <strong>Role</strong>
                    <span>{selectedScenario?.role ?? 'N/A'}</span>
                  </span>
                </div>
                <p className="mt-4 text-[0.88rem] leading-relaxed text-textMain">
                  {selectedScenario?.briefing ?? 'Select a scenario to load the briefing.'}
                </p>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="space-y-4">
                  <label className="block text-sm">
                    <span className="label">Scenario</span>
                    <select
                      className="console-input mt-2"
                      value={scenarioId}
                      onChange={(event) => setScenarioId(event.target.value)}
                    >
                      {playableScenarios.map((scenario) => (
                        <option key={scenario.id} value={scenario.id}>
                          {scenario.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div>
                    <p className="label">Decision Clock</p>
                    <div className="mt-2 grid gap-2">
                      {(['off', 'relaxed', 'standard'] as const).map((optionId) => {
                        const option = timerModeOptions[optionId];

                        return (
                          <button
                            key={optionId}
                            type="button"
                            className={`rounded-md border px-3 py-2 text-left transition ${
                              timerMode === optionId
                                ? 'border-accent bg-accent/12 text-textMain shadow-[inset_0_-2px_0_rgba(255,177,0,1)]'
                                : 'border-borderTone/80 bg-panelRaised/45 text-textMuted hover:border-accent/70 hover:text-textMain'
                            }`}
                            onClick={() => setTimerMode(optionId)}
                          >
                            <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.12em]">
                              {option.label}
                            </span>
                            <span className="mt-1 block text-[0.84rem] leading-relaxed">{option.detail}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {setupEvidenceAsset ? (
                    <figure className="console-subpanel overflow-hidden p-0">
                      <div className="relative aspect-[16/9] min-h-[190px] overflow-hidden">
                        <img
                          src={setupEvidenceAsset.path}
                          alt={setupEvidenceAsset.alt}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-3">
                          <p className="label text-accent">First Public Read</p>
                          <p className="mt-2 text-[0.84rem] leading-relaxed text-textMain">
                            {setupEvidenceAsset.caption}
                          </p>
                        </div>
                      </div>
                    </figure>
                  ) : null}
                  {setupContextCards.map((card) => (
                    <div key={card.id} className="console-subpanel px-3 py-3">
                      <p className="label">{card.title}</p>
                      <p className="mt-2 text-[0.84rem] leading-relaxed text-textMuted">{card.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              {error ? (
                <p className="mt-5 border border-warning/60 bg-warning/10 px-3 py-2 text-sm text-warning">
                  {error}
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="console-button console-button-primary"
                  onClick={() => void handleStart()}
                  disabled={loading || !scenarioId}
                >
                  {loading ? 'Beginning Scenario...' : 'Begin Scenario'}
                </button>
              </div>
            </section>

            <div className="min-w-0 space-y-4">
              {latestActiveRun ? (
                <section className="console-panel border-accent/70 bg-accent/8 p-5">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <p className="label text-accent">Continue Latest Run</p>
                      <p className="mt-2 font-display text-xl uppercase tracking-[0.06em] text-textMain">
                        {latestActiveRun.scenarioName}
                      </p>
                      <p className="mt-2 text-[0.72rem] uppercase tracking-[0.12em] text-textMuted">
                        Window {latestActiveRun.turn} / {latestActiveRun.lastSeenLabel} / {latestActiveRun.shortId}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        className="console-button console-button-primary"
                        onClick={() => void onResumeRun(latestActiveRun.episodeId)}
                        disabled={loading}
                      >
                        {loading ? 'Continuing...' : 'Continue Latest Run'}
                      </button>
                      <button
                        type="button"
                        className="console-button"
                        onClick={() => onRemoveActiveRun(latestActiveRun.episodeId)}
                        disabled={loading}
                        aria-label={`Remove active run ${latestActiveRun.shortId}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div className="console-subpanel px-3 py-2.5">
                      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-textMuted">Recovery Point</p>
                      <p className="mt-2 text-[0.72rem] uppercase tracking-[0.08em] text-textMain">
                        Window {latestActiveRun.turn}
                      </p>
                    </div>
                    <div className="console-subpanel px-3 py-2.5">
                      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-textMuted">Clock</p>
                      <p className="mt-2 text-[0.72rem] uppercase tracking-[0.08em] text-textMain">
                        {latestActiveRun.timerLabel}
                      </p>
                    </div>
                    <div className="console-subpanel px-3 py-2.5">
                      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-textMuted">Current Beat</p>
                      <p className="mt-2 text-[0.72rem] uppercase tracking-[0.08em] text-textMain">
                        {latestActiveRun.beatLabel}
                      </p>
                    </div>
                  </div>
                </section>
              ) : null}

              {activityCards.length > 0 ? (
                <section className="console-panel p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="label">Recent Activity</p>
                    <span className="console-chip">
                      <strong>{activityCards.length}</strong>
                      <span>Local</span>
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {activityCards.map((event) => (
                      <article
                        key={event.id}
                        className={`console-subpanel px-3 py-2.5 ${
                          event.action ? 'transition hover:border-accent/70 hover:bg-accent/8' : ''
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-textMain">
                            {event.label}
                          </p>
                          <p className="text-[0.68rem] uppercase tracking-[0.14em] text-textMuted">
                            {event.activityDate}
                          </p>
                        </div>
                        <p className="mt-1 text-[0.84rem] leading-relaxed text-textMuted">{event.scenarioName}</p>
                        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-textMuted">{event.detail}</p>
                          {event.action ? (
                            <button
                              type="button"
                              className="console-button console-button-primary px-3 py-1.5 text-[0.68rem]"
                              onClick={() => {
                                if (event.action?.type === 'open_report') {
                                  void onOpenReport(event.action.episodeId);
                                  return;
                                }

                                if (event.action?.type === 'resume_run') {
                                  void onResumeRun(event.action.episodeId);
                                }
                              }}
                              disabled={loading}
                            >
                              {event.action.label}
                            </button>
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {activeRunCards.length > 1 ? (
                <section className="console-panel p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="label">Other Active Runs</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {activeRunCards.length > 2 ? (
                        <button
                          type="button"
                          className="console-button px-3 py-1.5 text-[0.68rem]"
                          onClick={onClearActiveRuns}
                          disabled={loading}
                        >
                          Clear All
                        </button>
                      ) : null}
                      <span className="console-chip">
                        <strong>{activeRunCards.length - 1}</strong>
                        <span>Recoverable</span>
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {activeRunCards.slice(1).map((run) => (
                      <article
                        key={run.episodeId}
                        className="console-subpanel px-3 py-3 transition hover:border-accent/70 hover:bg-accent/8"
                      >
                        <span className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-textMain">
                            Resume Window {run.turn}
                          </span>
                          <span className="text-[0.68rem] uppercase tracking-[0.14em] text-textMuted">
                            {run.lastSeenLabel} / {run.shortId}
                          </span>
                        </span>
                        <span className="mt-2 block text-[0.88rem] leading-relaxed text-textMuted">
                          {run.scenarioName}
                        </span>
                        <span className="mt-2 grid gap-2 text-[0.72rem] uppercase tracking-[0.1em] text-textMuted sm:grid-cols-2">
                          <span>{run.timerLabel}</span>
                          <span>{run.beatLabel}</span>
                        </span>
                        <span className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="console-button console-button-primary px-3 py-1.5 text-[0.84rem]"
                            onClick={() => void onResumeRun(run.episodeId)}
                            disabled={loading}
                          >
                            Resume
                          </button>
                          <button
                            type="button"
                            className="console-button px-3 py-1.5 text-[0.84rem]"
                            onClick={() => onRemoveActiveRun(run.episodeId)}
                            disabled={loading}
                            aria-label={`Remove active run ${run.shortId}`}
                          >
                            Remove
                          </button>
                        </span>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {recentReportCards.length > 0 ? (
                <section className="console-panel p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="label">Completed Reports</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {recentReportCards.length > 1 ? (
                        <button
                          type="button"
                          className="console-button px-3 py-1.5 text-[0.68rem]"
                          onClick={onClearReports}
                          disabled={loading}
                        >
                          Clear All
                        </button>
                      ) : null}
                      <span className="console-chip">
                        <strong>{recentReportCards.length}</strong>
                        <span>Saved</span>
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {recentReportCards.map((report) => (
                      <article
                        key={report.episodeId}
                        className="console-subpanel px-3 py-3 transition hover:border-accent/70 hover:bg-accent/8"
                      >
                        <span className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-textMain">
                            {outcomeLabel[report.outcome]}
                          </span>
                          <span className="text-[0.68rem] uppercase tracking-[0.14em] text-textMuted">
                            {report.completedDate} / {report.shortId}
                          </span>
                        </span>
                        <span className="mt-2 block text-[0.88rem] leading-relaxed text-textMuted">
                          {report.scenarioName}
                        </span>
                        <span className="mt-2 grid gap-2 text-[0.72rem] uppercase tracking-[0.1em] text-textMuted sm:grid-cols-2">
                          <span>Windows {report.finalTurn}</span>
                          <span>Pressure {report.finalPressure}</span>
                        </span>
                        <span className="mt-2 block text-[0.84rem] leading-relaxed text-textMain">
                          Pivotal: {report.pivotalDecision}
                        </span>
                        <span className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="console-button console-button-primary px-3 py-1.5 text-[0.84rem]"
                            onClick={() => void onOpenReport(report.episodeId)}
                            disabled={loading}
                          >
                            Open Report
                          </button>
                          <button
                            type="button"
                            className="console-button px-3 py-1.5 text-[0.84rem]"
                            onClick={() => onRemoveReport(report.episodeId)}
                            disabled={loading}
                            aria-label={`Remove completed report ${report.shortId}`}
                          >
                            Remove
                          </button>
                        </span>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="console-panel p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="label">Replay Settings</p>
                  <button
                    type="button"
                    className="console-button console-button-ghost"
                    onClick={() => setShowAdvanced((current) => !current)}
                  >
                    {showAdvanced ? 'Hide' : 'Open'}
                  </button>
                </div>
                <p className="mt-2 text-[0.84rem] leading-relaxed text-textMuted">
                  Deterministic seed control is optional and mainly useful for replay and testing.
                </p>
                {showAdvanced ? (
                  <div className="mt-3 space-y-3">
                    <label className="block text-sm">
                      <span className="label">Deterministic Seed</span>
                      <div className="mt-2 flex gap-2">
                        <input
                          className="console-input"
                          value={seed}
                          onChange={(event) => setSeed(event.target.value)}
                          placeholder="Leave blank for auto-seed"
                        />
                        <button
                          type="button"
                          className="console-button console-button-secondary shrink-0"
                          onClick={() => setSeed(randomSeed())}
                        >
                          Generate
                        </button>
                      </div>
                    </label>
                  </div>
                ) : null}
              </section>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
};
