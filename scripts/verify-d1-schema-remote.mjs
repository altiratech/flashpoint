#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const dbName = process.env.VERIFY_D1_SCHEMA_DB || 'escalation-db';
const wranglerConfig = process.env.VERIFY_D1_SCHEMA_WRANGLER_CONFIG || 'apps/api/wrangler.toml';

const requiredTables = {
  profiles: {
    columns: {
      id: { type: 'TEXT', pk: true },
      codename: { type: 'TEXT', notNull: true },
      created_at: { type: 'TEXT', notNull: true }
    }
  },
  episodes: {
    columns: {
      id: { type: 'TEXT', pk: true },
      profile_id: { type: 'TEXT', notNull: true },
      scenario_id: { type: 'TEXT', notNull: true },
      adversary_profile_id: { type: 'TEXT', notNull: true },
      seed: { type: 'TEXT', notNull: true },
      status: { type: 'TEXT', notNull: true },
      current_turn: { type: 'INTEGER', notNull: true },
      outcome: { type: 'TEXT' },
      state_json: { type: 'TEXT', notNull: true },
      started_at: { type: 'TEXT', notNull: true },
      ended_at: { type: 'TEXT' }
    },
    indexes: ['idx_episodes_profile']
  },
  turn_logs: {
    columns: {
      id: { type: 'TEXT', pk: true },
      episode_id: { type: 'TEXT', notNull: true },
      turn_number: { type: 'INTEGER', notNull: true },
      player_action_id: { type: 'TEXT', notNull: true },
      rival_action_id: { type: 'TEXT', notNull: true },
      events_json: { type: 'TEXT', notNull: true },
      belief_json: { type: 'TEXT', notNull: true },
      visible_meters_json: { type: 'TEXT', notNull: true },
      true_meters_json: { type: 'TEXT', notNull: true },
      briefing_text: { type: 'TEXT', notNull: true },
      headlines_json: { type: 'TEXT', notNull: true },
      image_id: { type: 'TEXT' },
      rng_trace_json: { type: 'TEXT', notNull: true },
      created_at: { type: 'TEXT', notNull: true }
    },
    indexes: ['idx_turn_logs_episode']
  },
  reports: {
    columns: {
      episode_id: { type: 'TEXT', pk: true },
      report_json: { type: 'TEXT', notNull: true },
      created_at: { type: 'TEXT', notNull: true }
    }
  },
  scores: {
    columns: {
      episode_id: { type: 'TEXT', pk: true },
      profile_id: { type: 'TEXT', pk: true },
      composite_score: { type: 'INTEGER', notNull: true },
      created_at: { type: 'TEXT', notNull: true }
    }
  },
  beat_progress: {
    columns: {
      id: { type: 'TEXT', pk: true },
      episode_id: { type: 'TEXT', notNull: true },
      turn_number: { type: 'INTEGER', notNull: true },
      beat_id_before: { type: 'TEXT', notNull: true },
      beat_id_after: { type: 'TEXT', notNull: true },
      transition_source: { type: 'TEXT', notNull: true },
      transitioned: { type: 'INTEGER', notNull: true },
      timer_mode: { type: 'TEXT', notNull: true },
      timer_seconds: { type: 'INTEGER' },
      timer_seconds_remaining: { type: 'INTEGER' },
      timer_expired: { type: 'INTEGER', notNull: true },
      extend_used: { type: 'INTEGER', notNull: true },
      extend_timer_uses_remaining: { type: 'INTEGER', notNull: true },
      created_at: { type: 'TEXT', notNull: true }
    },
    indexes: ['idx_beat_progress_episode_turn']
  },
  chat_messages: {
    columns: {
      id: { type: 'TEXT', pk: true },
      episode_id: { type: 'TEXT', notNull: true },
      message_id: { type: 'TEXT', notNull: true },
      role: { type: 'TEXT', notNull: true },
      content: { type: 'TEXT', notNull: true },
      turn_number: { type: 'INTEGER', notNull: true },
      timestamp: { type: 'INTEGER', notNull: true },
      advisor_id: { type: 'TEXT' },
      created_at: { type: 'TEXT', notNull: true }
    },
    indexes: ['idx_chat_messages_episode_turn']
  },
  advisor_state: {
    columns: {
      id: { type: 'TEXT', pk: true },
      episode_id: { type: 'TEXT', notNull: true },
      advisor_id: { type: 'TEXT', notNull: true },
      turn_number: { type: 'INTEGER', notNull: true },
      mood: { type: 'TEXT', notNull: true },
      last_suggestion: { type: 'TEXT' },
      last_reaction: { type: 'TEXT' },
      created_at: { type: 'TEXT', notNull: true }
    },
    indexes: ['idx_advisor_state_episode_turn']
  },
  llm_calls: {
    columns: {
      id: { type: 'TEXT', pk: true },
      episode_id: { type: 'TEXT', notNull: true },
      turn_number: { type: 'INTEGER', notNull: true },
      job_type: { type: 'TEXT', notNull: true },
      model: { type: 'TEXT', notNull: true },
      input_tokens: { type: 'INTEGER', notNull: true },
      output_tokens: { type: 'INTEGER', notNull: true },
      latency_ms: { type: 'INTEGER', notNull: true },
      created_at: { type: 'TEXT', notNull: true }
    },
    indexes: ['idx_llm_calls_episode_turn']
  },
  client_telemetry: {
    columns: {
      id: { type: 'TEXT', pk: true },
      episode_id: { type: 'TEXT' },
      scenario_id: { type: 'TEXT' },
      event_name: { type: 'TEXT', notNull: true },
      turn_number: { type: 'INTEGER' },
      elapsed_ms: { type: 'INTEGER' },
      metadata_json: { type: 'TEXT', notNull: true },
      user_agent: { type: 'TEXT' },
      created_at: { type: 'TEXT', notNull: true }
    },
    indexes: ['idx_client_telemetry_episode', 'idx_client_telemetry_event_created']
  },
  rate_limit_buckets: {
    columns: {
      bucket_key: { type: 'TEXT', pk: true },
      count: { type: 'INTEGER', notNull: true },
      reset_at: { type: 'INTEGER', notNull: true },
      updated_at: { type: 'TEXT', notNull: true }
    },
    indexes: ['idx_rate_limit_buckets_reset']
  }
};

const quoteIdentifier = (identifier) => {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
    throw new Error(`Unsafe SQLite identifier: ${identifier}`);
  }

  return `"${identifier}"`;
};

const normalizeType = (type) => String(type || '').trim().toUpperCase();

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

const tableRows = runD1Query(
  'sqlite schema tables',
  `
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
    ORDER BY name;
  `
);

const tableNames = new Set(tableRows.map((row) => String(row.name)));
const failures = [];
const verifiedTables = [];
const verifiedIndexes = new Set();

for (const [tableName, expectation] of Object.entries(requiredTables)) {
  if (!tableNames.has(tableName)) {
    failures.push(`missing table: ${tableName}`);
    continue;
  }

  const tableInfo = runD1Query(
    `table_info ${tableName}`,
    `PRAGMA table_info(${quoteIdentifier(tableName)});`
  );
  const columns = new Map(tableInfo.map((column) => [String(column.name), column]));

  for (const [columnName, columnExpectation] of Object.entries(expectation.columns)) {
    const column = columns.get(columnName);
    if (!column) {
      failures.push(`${tableName}: missing column ${columnName}`);
      continue;
    }

    const actualType = normalizeType(column.type);
    if (columnExpectation.type && actualType !== columnExpectation.type) {
      failures.push(`${tableName}.${columnName}: expected type ${columnExpectation.type}, found ${actualType || 'untyped'}`);
    }

    if (columnExpectation.notNull && Number(column.notnull || 0) !== 1) {
      failures.push(`${tableName}.${columnName}: expected NOT NULL`);
    }

    if (columnExpectation.pk && Number(column.pk || 0) < 1) {
      failures.push(`${tableName}.${columnName}: expected primary key membership`);
    }
  }

  const indexRows = runD1Query(
    `index_list ${tableName}`,
    `PRAGMA index_list(${quoteIdentifier(tableName)});`
  );
  const indexNames = new Set(indexRows.map((row) => String(row.name)));
  for (const indexName of expectation.indexes ?? []) {
    if (!indexNames.has(indexName)) {
      failures.push(`${tableName}: missing index ${indexName}`);
    } else {
      verifiedIndexes.add(indexName);
    }
  }

  verifiedTables.push(`${tableName}(${Object.keys(expectation.columns).length} columns)`);
}

const migrationTrackingTables = [...tableNames].filter((tableName) =>
  tableName === 'd1_migrations' || tableName === '_cf_KV' || /migration/i.test(tableName)
);

console.log(`Remote D1 schema verification for ${dbName}`);
console.log(`Wrangler config: ${wranglerConfig}`);
console.log(`Verified tables: ${verifiedTables.join(', ')}`);
console.log(`Verified indexes: ${[...verifiedIndexes].sort().join(', ') || 'none'}`);
if (migrationTrackingTables.length > 0) {
  console.log(`Migration tracking table(s) present: ${migrationTrackingTables.sort().join(', ')}`);
} else {
  console.log('Migration tracking table: not present; custom ordered SQL runner is expected for this repo.');
}

if (failures.length > 0) {
  throw new Error(`Remote D1 schema verification failed:\n${failures.join('\n')}`);
}

console.log('Remote D1 schema verification passed.');
