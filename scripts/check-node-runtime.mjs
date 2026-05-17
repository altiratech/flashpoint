#!/usr/bin/env node

const requiredMajor = 22;
const current = process.versions.node;
const currentMajor = Number.parseInt(current.split('.')[0] ?? '', 10);

if (!Number.isFinite(currentMajor) || currentMajor < requiredMajor) {
  console.error(
    [
      `Flashpoint local dev requires Node ${requiredMajor}+; current runtime is Node ${current}.`,
      'This matters for `npm run dev` because the current Wrangler/Miniflare toolchain refuses Node 20.',
      'Use a Node 22+ runtime, then rerun the command.'
    ].join('\n')
  );
  process.exit(1);
}
