#!/usr/bin/env node
import process from 'node:process';

const apiOrigin = (process.env.VERIFY_RATE_LIMIT_API_ORIGIN || 'https://escalation-api.rjameson.workers.dev').replace(/\/+$/, '');
const probePath = process.env.VERIFY_RATE_LIMIT_PATH || '/api/rate-limit-smoke';
const maxAttempts = Number.parseInt(process.env.VERIFY_RATE_LIMIT_MAX_ATTEMPTS || '130', 10);
const requestDelayMs = Number.parseInt(process.env.VERIFY_RATE_LIMIT_REQUEST_DELAY_MS || '0', 10);
const maxAllowedLimit = Number.parseInt(process.env.VERIFY_RATE_LIMIT_MAX_ALLOWED_LIMIT || '240', 10);

if (!probePath.startsWith('/api/')) {
  throw new Error('VERIFY_RATE_LIMIT_PATH must start with /api/ so the API rate-limit middleware is exercised.');
}

if (!Number.isFinite(maxAttempts) || maxAttempts < 2 || maxAttempts > 500) {
  throw new Error('VERIFY_RATE_LIMIT_MAX_ATTEMPTS must be an integer from 2 to 500.');
}

if (!Number.isFinite(requestDelayMs) || requestDelayMs < 0 || requestDelayMs > 5_000) {
  throw new Error('VERIFY_RATE_LIMIT_REQUEST_DELAY_MS must be an integer from 0 to 5000.');
}

if (!Number.isFinite(maxAllowedLimit) || maxAllowedLimit < 1 || maxAllowedLimit > 500) {
  throw new Error('VERIFY_RATE_LIMIT_MAX_ALLOWED_LIMIT must be an integer from 1 to 500.');
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const url = new URL(probePath, `${apiOrigin}/`).toString();

let firstLimit = null;
let firstReset = null;
let allowedResponses = 0;
let blockedResponse = null;
let lastRemaining = null;

console.log(`Remote rate-limit verification for ${apiOrigin}`);
console.log(`Probe: POST ${probePath}`);
console.log(`Max attempts: ${maxAttempts}`);

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Flashpoint-Rate-Limit-Smoke': '1'
    },
    body: JSON.stringify({ probe: 'rate-limit-smoke', attempt })
  });

  const limit = Number.parseInt(response.headers.get('x-ratelimit-limit') || '', 10);
  const remaining = Number.parseInt(response.headers.get('x-ratelimit-remaining') || '', 10);
  const reset = Number.parseInt(response.headers.get('x-ratelimit-reset') || '', 10);
  const retryAfter = Number.parseInt(response.headers.get('retry-after') || '', 10);

  if (!Number.isFinite(limit)) {
    throw new Error(`Attempt ${attempt} did not include X-RateLimit-Limit; status=${response.status}`);
  }

  if (firstLimit === null) {
    firstLimit = limit;
    firstReset = reset;
    if (firstLimit > maxAllowedLimit) {
      throw new Error(
        `Refusing to run noisy smoke: remote limit ${firstLimit} exceeds max allowed ${maxAllowedLimit}.`
      );
    }
    if (maxAttempts <= firstLimit) {
      throw new Error(
        `VERIFY_RATE_LIMIT_MAX_ATTEMPTS=${maxAttempts} cannot reach remote limit ${firstLimit}; set at least ${
          firstLimit + 1
        }.`
      );
    }
  }

  lastRemaining = remaining;

  if (response.status === 429) {
    blockedResponse = { attempt, limit, remaining, reset, retryAfter };
    break;
  }

  if (response.status < 400 || response.status === 404) {
    allowedResponses += 1;
  } else {
    const body = await response.text();
    throw new Error(`Unexpected pre-limit response at attempt ${attempt}: status=${response.status} body=${body}`);
  }

  if (requestDelayMs > 0) {
    await sleep(requestDelayMs);
  }
}

if (!blockedResponse) {
  throw new Error(
    `Rate-limit verification failed: no 429 after ${maxAttempts} attempts; last remaining=${lastRemaining ?? 'n/a'}.`
  );
}

if (allowedResponses < firstLimit) {
  throw new Error(
    `Rate-limit verification failed: blocked after ${allowedResponses} allowed responses, expected at least ${firstLimit}.`
  );
}

if (!Number.isFinite(blockedResponse.retryAfter) || blockedResponse.retryAfter < 1) {
  throw new Error('Rate-limit verification failed: 429 response did not include a positive Retry-After header.');
}

console.log(`Limit: ${firstLimit}`);
console.log(`Allowed responses before block: ${allowedResponses}`);
console.log(`429 attempt: ${blockedResponse.attempt}`);
console.log(`Remaining at block: ${blockedResponse.remaining}`);
console.log(`Reset epoch seconds: ${blockedResponse.reset || firstReset || 'n/a'}`);
console.log(`Retry-After seconds: ${blockedResponse.retryAfter}`);
console.log('Remote rate-limit verification passed.');
