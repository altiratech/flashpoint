#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const dbName = process.env.VERIFY_TELEMETRY_DB || 'escalation-db';
const wranglerConfig = process.env.VERIFY_TELEMETRY_WRANGLER_CONFIG || 'apps/api/wrangler.toml';
const lookbackHours = Number.parseInt(process.env.VERIFY_TELEMETRY_LOOKBACK_HOURS || '24', 10);
const recentLimit = Number.parseInt(process.env.VERIFY_TELEMETRY_RECENT_LIMIT || '12', 10);
const expectedScenarioId = process.env.VERIFY_TELEMETRY_SCENARIO_ID || '';
const notBefore = process.env.VERIFY_TELEMETRY_NOT_BEFORE || '';

if (!Number.isFinite(lookbackHours) || lookbackHours < 1 || lookbackHours > 168) {
  throw new Error('VERIFY_TELEMETRY_LOOKBACK_HOURS must be an integer from 1 to 168.');
}

if (!Number.isFinite(recentLimit) || recentLimit < 1 || recentLimit > 50) {
  throw new Error('VERIFY_TELEMETRY_RECENT_LIMIT must be an integer from 1 to 50.');
}

if (notBefore && Number.isNaN(Date.parse(notBefore))) {
  throw new Error('VERIFY_TELEMETRY_NOT_BEFORE must be an ISO-parseable timestamp when provided.');
}

const minimums = {
  session_start: Number.parseInt(process.env.VERIFY_TELEMETRY_MIN_SESSION_START || '1', 10),
  decision_made: Number.parseInt(process.env.VERIFY_TELEMETRY_MIN_DECISION_MADE || '1', 10),
  game_completed: Number.parseInt(process.env.VERIFY_TELEMETRY_MIN_GAME_COMPLETED || '1', 10)
};

const quoteSql = (value) => value.replace(/'/g, "''");

const runD1Query = (label, command) => {
  const result = spawnSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    [
      'wrangler',
      'd1',
      'execute',
      dbName,
      '--remote',
      '--config',
      wranglerConfig,
      '--json',
      '--command',
      command
    ],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }
  );

  if (result.status !== 0) {
    throw new Error(
      [
        `Remote D1 query failed: ${label}`,
        result.stdout.trim(),
        result.stderr.trim()
      ].filter(Boolean).join('\n')
    );
  }

  try {
    const parsed = JSON.parse(result.stdout);
    const statements = Array.isArray(parsed) ? parsed : [parsed];
    const failed = statements.find((entry) => entry && entry.success === false);
    if (failed) {
      throw new Error(JSON.stringify(failed));
    }

    for (const statement of statements) {
      if (Array.isArray(statement?.results)) {
        return statement.results;
      }
      if (Array.isArray(statement?.result?.results)) {
        return statement.result.results;
      }
    }
  } catch (error) {
    throw new Error(`Unable to parse Wrangler JSON for ${label}: ${error instanceof Error ? error.message : String(error)}`);
  }

  throw new Error(`Wrangler JSON for ${label} did not include a results array.`);
};

const whereParts = [
  'julianday(created_at) IS NOT NULL',
  `julianday(created_at) >= julianday('now', '-${lookbackHours} hours')`
];
if (notBefore) {
  whereParts.push(`julianday(created_at) >= julianday('${quoteSql(notBefore)}')`);
}
if (expectedScenarioId) {
  whereParts.push(`scenario_id = '${quoteSql(expectedScenarioId)}'`);
}
const whereClause = whereParts.join(' AND ');

const summaryRows = runD1Query(
  'telemetry event summary',
  `
    SELECT
      event_name,
      COUNT(*) AS event_count,
      COUNT(DISTINCT episode_id) AS episode_count,
      MIN(created_at) AS first_seen_at,
      MAX(created_at) AS latest_seen_at
    FROM client_telemetry
    WHERE ${whereClause}
    GROUP BY event_name
    ORDER BY event_name;
  `
);

const counts = new Map(summaryRows.map((row) => [String(row.event_name), Number(row.event_count || 0)]));
const failures = Object.entries(minimums)
  .filter(([, minimum]) => Number.isFinite(minimum) && minimum > 0)
  .filter(([eventName, minimum]) => (counts.get(eventName) || 0) < minimum)
  .map(([eventName, minimum]) => `${eventName}: expected >= ${minimum}, found ${counts.get(eventName) || 0}`);

const recentRows = runD1Query(
  'recent telemetry rows',
  `
    SELECT
      event_name,
      episode_id,
      scenario_id,
      turn_number,
      elapsed_ms,
      created_at,
      substr(user_agent, 1, 96) AS user_agent
    FROM client_telemetry
    WHERE ${whereClause}
    ORDER BY created_at DESC
    LIMIT ${recentLimit};
  `
);

console.log(`Remote telemetry verification for ${dbName}`);
console.log(`Lookback: ${lookbackHours} hour(s)${expectedScenarioId ? `, scenario: ${expectedScenarioId}` : ''}`);
if (notBefore) {
  console.log(`Not before: ${notBefore}`);
}
console.log('Event summary:');
for (const row of summaryRows) {
  console.log(
    `- ${row.event_name}: events=${row.event_count}, episodes=${row.episode_count}, first=${row.first_seen_at}, latest=${row.latest_seen_at}`
  );
}

console.log('Recent rows:');
for (const row of recentRows) {
  console.log(
    `- ${row.created_at} ${row.event_name} episode=${row.episode_id || 'n/a'} turn=${row.turn_number ?? 'n/a'} elapsed_ms=${
      row.elapsed_ms ?? 'n/a'
    } user_agent=${row.user_agent || 'n/a'}`
  );
}

if (failures.length > 0) {
  throw new Error(`Telemetry verification failed:\n${failures.join('\n')}`);
}

if (recentRows.length === 0) {
  throw new Error('Telemetry verification failed: no recent telemetry rows matched the query.');
}

console.log('Remote telemetry verification passed.');
