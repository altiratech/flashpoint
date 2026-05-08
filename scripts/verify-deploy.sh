#!/usr/bin/env bash
set -euo pipefail

API_ORIGIN="${VERIFY_API_ORIGIN:-https://escalation-api.rjameson.workers.dev}"
API_HEALTH_URL="${VERIFY_API_HEALTH_URL:-${API_ORIGIN}/api/healthz}"
API_BOOTSTRAP_URL="${VERIFY_API_BOOTSTRAP_URL:-${API_ORIGIN}/api/reference/bootstrap}"
API_PROFILE_URL="${VERIFY_API_PROFILE_URL:-${API_ORIGIN}/api/profiles}"
API_EPISODE_START_URL="${VERIFY_API_EPISODE_START_URL:-${API_ORIGIN}/api/episodes/start}"
WEB_URL="${VERIFY_WEB_URL:-https://escalation-web.pages.dev}"
EXPECTED_SCENARIO_ID="${VERIFY_SCENARIO_ID:-northern_strait_black_swan}"
EVIDENCE_PATH="${VERIFY_DEPLOY_EVIDENCE_PATH:-output/deploy-verification/evidence.json}"

export EVIDENCE_STATUS="running"
export EVIDENCE_ERROR=""
export CURRENT_CHECK="init"
export API_ORIGIN
export API_HEALTH_URL
export API_BOOTSTRAP_URL
export API_PROFILE_URL
export API_EPISODE_START_URL
export WEB_URL
export EXPECTED_SCENARIO_ID
export VERIFIED_SCENARIO_ID=""
export BOOTSTRAP_SCENARIO_COUNT=""
export BOOTSTRAP_ACTION_COUNT=""
export PROFILE_ID=""
export EPISODE_ID=""
export EPISODE_TURN=""
export EPISODE_MAX_TURNS=""
export OFFERED_ACTION_COUNT=""
export WEB_ASSET_PATH=""
export WEB_BUNDLE_HAS_API_ORIGIN="false"
export EVIDENCE_STARTED_AT="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
export EVIDENCE_COMPLETED_AT=""

write_evidence() {
  local exit_code="$1"
  mkdir -p "$(dirname "${EVIDENCE_PATH}")"
  export EVIDENCE_EXIT_CODE="${exit_code}"
  export EVIDENCE_COMPLETED_AT="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  if [[ "${exit_code}" == "0" ]]; then
    export EVIDENCE_STATUS="passed"
  else
    export EVIDENCE_STATUS="failed"
    if [[ -z "${EVIDENCE_ERROR}" ]]; then
      export EVIDENCE_ERROR="deployment verification failed during ${CURRENT_CHECK}"
    fi
  fi

  python3 - "${EVIDENCE_PATH}" <<'PY'
import json
import os
import sys

def int_or_none(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None

evidence = {
    "status": os.environ.get("EVIDENCE_STATUS"),
    "exit_code": int_or_none(os.environ.get("EVIDENCE_EXIT_CODE")),
    "error": os.environ.get("EVIDENCE_ERROR") or None,
    "current_check": os.environ.get("CURRENT_CHECK"),
    "started_at": os.environ.get("EVIDENCE_STARTED_AT"),
    "completed_at": os.environ.get("EVIDENCE_COMPLETED_AT"),
    "api": {
        "origin": os.environ.get("API_ORIGIN"),
        "health_url": os.environ.get("API_HEALTH_URL"),
        "bootstrap_url": os.environ.get("API_BOOTSTRAP_URL"),
        "profile_url": os.environ.get("API_PROFILE_URL"),
        "episode_start_url": os.environ.get("API_EPISODE_START_URL"),
        "expected_scenario_id": os.environ.get("EXPECTED_SCENARIO_ID"),
        "verified_scenario_id": os.environ.get("VERIFIED_SCENARIO_ID") or None,
        "bootstrap_scenario_count": int_or_none(os.environ.get("BOOTSTRAP_SCENARIO_COUNT")),
        "bootstrap_action_count": int_or_none(os.environ.get("BOOTSTRAP_ACTION_COUNT")),
        "profile_id": os.environ.get("PROFILE_ID") or None,
        "episode_id": os.environ.get("EPISODE_ID") or None,
        "episode_turn": int_or_none(os.environ.get("EPISODE_TURN")),
        "episode_max_turns": int_or_none(os.environ.get("EPISODE_MAX_TURNS")),
        "offered_action_count": int_or_none(os.environ.get("OFFERED_ACTION_COUNT")),
    },
    "web": {
        "url": os.environ.get("WEB_URL"),
        "asset_path": os.environ.get("WEB_ASSET_PATH") or None,
        "bundle_references_api_origin": os.environ.get("WEB_BUNDLE_HAS_API_ORIGIN") == "true",
    },
}

with open(sys.argv[1], "w", encoding="utf-8") as handle:
    json.dump(evidence, handle, indent=2, sort_keys=True)
    handle.write("\n")
PY
}

on_exit() {
  local exit_code="$?"
  write_evidence "${exit_code}" || true
}

trap on_exit EXIT

echo "Verifying API health: ${API_HEALTH_URL}"
CURRENT_CHECK="api_health"
api_health="$(curl -fsS "${API_HEALTH_URL}")"
if ! grep -q '"status":"ok"' <<<"${api_health}"; then
  EVIDENCE_ERROR="API health check failed"
  echo "API health check failed: ${api_health}" >&2
  exit 1
fi

echo "Verifying API bootstrap payload: ${API_BOOTSTRAP_URL}"
CURRENT_CHECK="api_bootstrap"
api_bootstrap="$(curl -fsS "${API_BOOTSTRAP_URL}")"
if ! grep -q '"scenarios"' <<<"${api_bootstrap}"; then
  EVIDENCE_ERROR="API bootstrap check failed: missing scenarios field"
  echo "API bootstrap check failed: missing scenarios field" >&2
  exit 1
fi
if ! grep -q '"actions"' <<<"${api_bootstrap}"; then
  EVIDENCE_ERROR="API bootstrap check failed: missing actions field"
  echo "API bootstrap check failed: missing actions field" >&2
  exit 1
fi

bootstrap_tmp="$(mktemp)"
printf '%s' "${api_bootstrap}" > "${bootstrap_tmp}"
bootstrap_evidence="$(python3 - "${bootstrap_tmp}" "${EXPECTED_SCENARIO_ID}" <<'PY'
import json
import sys

with open(sys.argv[1], 'r', encoding='utf-8') as handle:
    data = json.load(handle)
expected = sys.argv[2]
scenarios = data.get("scenarios") or []
if not scenarios:
    raise SystemExit("No scenarios in bootstrap payload")
matches = [scenario for scenario in scenarios if scenario.get("id") == expected]
if not matches:
    raise SystemExit(f"Expected scenario not found: {expected}")
scenario = matches[0]
if scenario.get("isLegacy"):
    raise SystemExit(f"Expected scenario is marked legacy: {expected}")
print(json.dumps({
    "scenario_id": scenario["id"],
    "scenario_count": len(scenarios),
    "action_count": len(data.get("actions") or []),
}))
PY
)"
rm -f "${bootstrap_tmp}"
scenario_id="$(python3 - "${bootstrap_evidence}" <<'PY'
import json
import sys

print(json.loads(sys.argv[1])["scenario_id"])
PY
)"
BOOTSTRAP_SCENARIO_COUNT="$(python3 - "${bootstrap_evidence}" <<'PY'
import json
import sys

print(json.loads(sys.argv[1])["scenario_count"])
PY
)"
BOOTSTRAP_ACTION_COUNT="$(python3 - "${bootstrap_evidence}" <<'PY'
import json
import sys

print(json.loads(sys.argv[1])["action_count"])
PY
)"
VERIFIED_SCENARIO_ID="${scenario_id}"
if [[ -z "${scenario_id}" ]]; then
  EVIDENCE_ERROR="API bootstrap check failed: unable to resolve scenario id"
  echo "API bootstrap check failed: unable to resolve scenario id" >&2
  exit 1
fi

echo "Verifying profile creation: ${API_PROFILE_URL}"
CURRENT_CHECK="profile_creation"
profile_payload="$(printf '{"codename":"SMOKE-%s"}' "$(date +%s)")"
profile_response="$(curl -fsS -X POST "${API_PROFILE_URL}" -H 'Content-Type: application/json' --data "${profile_payload}")"
profile_tmp="$(mktemp)"
printf '%s' "${profile_response}" > "${profile_tmp}"
profile_id="$(python3 - "${profile_tmp}" <<'PY'
import json
import sys

with open(sys.argv[1], 'r', encoding='utf-8') as handle:
    data = json.load(handle)
profile_id = data.get("profileId")
if not profile_id:
    raise SystemExit("Profile response missing profileId")
print(profile_id)
PY
)"
rm -f "${profile_tmp}"
PROFILE_ID="${profile_id}"
if [[ -z "${profile_id}" ]]; then
  EVIDENCE_ERROR="Profile verification failed: missing profile id"
  echo "Profile verification failed: missing profile id" >&2
  exit 1
fi

echo "Verifying episode start route: ${API_EPISODE_START_URL}"
CURRENT_CHECK="episode_start"
start_payload="$(printf '{"profileId":"%s","scenarioId":"%s","timerMode":"off"}' "${profile_id}" "${scenario_id}")"
start_response="$(curl -fsS -X POST "${API_EPISODE_START_URL}" -H 'Content-Type: application/json' --data "${start_payload}")"
start_tmp="$(mktemp)"
printf '%s' "${start_response}" > "${start_tmp}"
episode_evidence="$(python3 - "${start_tmp}" <<'PY'
import json
import sys

with open(sys.argv[1], 'r', encoding='utf-8') as handle:
    data = json.load(handle)
required_fields = ["episodeId", "scenarioId", "status", "turn", "maxTurns", "offeredActions"]
missing = [field for field in required_fields if field not in data]
if missing:
    raise SystemExit(f"Episode start response missing fields: {', '.join(missing)}")
if data["status"] != "active":
    raise SystemExit(f"Episode did not start as active (status={data['status']})")
if not isinstance(data["offeredActions"], list) or not data["offeredActions"]:
    raise SystemExit("Episode start response has empty offeredActions")
print(json.dumps({
    "episode_id": data["episodeId"],
    "turn": data["turn"],
    "max_turns": data["maxTurns"],
    "offered_action_count": len(data["offeredActions"]),
}))
PY
)"
python3 - "${episode_evidence}" <<'PY'
import json
import sys

data = json.loads(sys.argv[1])
print(f"episode_started={data['episode_id']} turn={data['turn']}")
PY
EPISODE_ID="$(python3 - "${episode_evidence}" <<'PY'
import json
import sys

print(json.loads(sys.argv[1])["episode_id"])
PY
)"
EPISODE_TURN="$(python3 - "${episode_evidence}" <<'PY'
import json
import sys

print(json.loads(sys.argv[1])["turn"])
PY
)"
EPISODE_MAX_TURNS="$(python3 - "${episode_evidence}" <<'PY'
import json
import sys

print(json.loads(sys.argv[1])["max_turns"])
PY
)"
OFFERED_ACTION_COUNT="$(python3 - "${episode_evidence}" <<'PY'
import json
import sys

print(json.loads(sys.argv[1])["offered_action_count"])
PY
)"
rm -f "${start_tmp}"

echo "Verifying web shell: ${WEB_URL}"
CURRENT_CHECK="web_shell"
web_html="$(curl -fsS "${WEB_URL}")"
if ! grep -Eiq 'Altira Flashpoint' <<<"${web_html}"; then
  EVIDENCE_ERROR="Web verification failed: expected Altira Flashpoint marker not found"
  echo "Web verification failed: expected Altira Flashpoint marker not found" >&2
  exit 1
fi

CURRENT_CHECK="web_asset"
web_asset_path="$(grep -Eo 'src="/assets/[^"]+\.js"' <<<"${web_html}" | head -n 1 | sed -E 's/src="([^"]+)"/\1/')"
WEB_ASSET_PATH="${web_asset_path}"
if [[ -z "${web_asset_path}" ]]; then
  EVIDENCE_ERROR="Web verification failed: could not find deployed JavaScript asset"
  echo "Web verification failed: could not find deployed JavaScript asset" >&2
  exit 1
fi

echo "Verifying web API target: ${WEB_URL}${web_asset_path}"
CURRENT_CHECK="web_api_target"
web_asset="$(curl -fsS "${WEB_URL}${web_asset_path}")"
if ! grep -Fq "${API_ORIGIN}" <<<"${web_asset}"; then
  EVIDENCE_ERROR="Web verification failed: deployed bundle does not reference API origin ${API_ORIGIN}"
  echo "Web verification failed: deployed bundle does not reference API origin ${API_ORIGIN}" >&2
  exit 1
fi
WEB_BUNDLE_HAS_API_ORIGIN="true"

echo "Deployment verification checks passed."
