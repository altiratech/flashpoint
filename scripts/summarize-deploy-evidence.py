#!/usr/bin/env python3
import json
import os
import sys


def value_or_dash(value):
    if value is None or value == "":
        return "-"
    return str(value)


def bool_label(value):
    if value is True:
        return "true"
    if value is False:
        return "false"
    return "-"


def markdown_for_evidence(evidence, artifact_name, run_url):
    api = evidence.get("api") or {}
    web = evidence.get("web") or {}
    status = value_or_dash(evidence.get("status"))
    exit_code = value_or_dash(evidence.get("exit_code"))
    error = evidence.get("error")

    lines = [
        "## Flashpoint Deploy Verification",
        "",
        f"Status: `{status}`",
        f"Exit code: `{exit_code}`",
    ]
    if error:
        lines.append(f"Error: `{error}`")
    lines.extend(
        [
            "",
            "| Check | Evidence |",
            "| --- | --- |",
            f"| API health | `{value_or_dash(api.get('health_url'))}` |",
            f"| API bootstrap | `{value_or_dash(api.get('bootstrap_scenario_count'))}` scenarios / `{value_or_dash(api.get('bootstrap_action_count'))}` actions |",
            f"| Scenario | expected `{value_or_dash(api.get('expected_scenario_id'))}`, verified `{value_or_dash(api.get('verified_scenario_id'))}` |",
            f"| Profile creation | `{value_or_dash(api.get('profile_id'))}` |",
            f"| Episode start | `{value_or_dash(api.get('episode_id'))}`, turn `{value_or_dash(api.get('episode_turn'))}` / `{value_or_dash(api.get('episode_max_turns'))}`, offered actions `{value_or_dash(api.get('offered_action_count'))}` |",
            f"| Web shell | `{value_or_dash(web.get('url'))}` |",
            f"| Web asset | `{value_or_dash(web.get('asset_path'))}` |",
            f"| Bundle API origin | `{value_or_dash(api.get('origin'))}` referenced: `{bool_label(web.get('bundle_references_api_origin'))}` |",
            "",
            f"Artifact: `{artifact_name}`",
        ]
    )
    if run_url:
        lines.append(f"Run: {run_url}")
    return "\n".join(lines) + "\n"


def main():
    if len(sys.argv) < 2:
        raise SystemExit("Usage: summarize-deploy-evidence.py <evidence.json> [summary.md]")

    evidence_path = sys.argv[1]
    summary_path = sys.argv[2] if len(sys.argv) > 2 else os.environ.get("GITHUB_STEP_SUMMARY")
    artifact_name = os.environ.get("VERIFY_DEPLOY_ARTIFACT_NAME", "flashpoint-deploy-verification")
    run_url = os.environ.get("GITHUB_SERVER_URL") and os.environ.get("GITHUB_REPOSITORY") and os.environ.get("GITHUB_RUN_ID")
    if run_url:
        run_url = f"{os.environ['GITHUB_SERVER_URL']}/{os.environ['GITHUB_REPOSITORY']}/actions/runs/{os.environ['GITHUB_RUN_ID']}"

    if not os.path.exists(evidence_path):
        markdown = "\n".join(
            [
                "## Flashpoint Deploy Verification",
                "",
                "Status: `missing-evidence`",
                f"Evidence file was not found at `{evidence_path}`.",
                "",
                f"Artifact: `{artifact_name}`",
            ]
        ) + "\n"
    else:
        with open(evidence_path, "r", encoding="utf-8") as handle:
            evidence = json.load(handle)
        markdown = markdown_for_evidence(evidence, artifact_name, run_url)

    if summary_path:
        with open(summary_path, "a", encoding="utf-8") as handle:
            handle.write(markdown)
    else:
        sys.stdout.write(markdown)


if __name__ == "__main__":
    main()
