# Skill Packaging Rules

Use these rules when turning an idea into a shippable skill bundle in this repo.

## Required SKILL.md shape

- Frontmatter should keep only `name`, `description`, and `metadata`.
- Use `metadata.aisa`, not `metadata.openclaw`.
- Include `emoji`, `requires`, and `compatibility`.
- If the skill depends on `AISA_API_KEY`, include `primaryEnv: AISA_API_KEY`.

## Script references

- When `SKILL.md` references local scripts, use the literal token `{baseDir}`.
- Do not use `${SKILL_ROOT}` or machine-specific bootstrap paths in published examples.

## Runtime dependencies

- Python runtime should be stdlib-first.
- Do not introduce `requests`, `httpx`, `pytest`, or other third-party runtime dependencies for bundled skills unless there is a compelling repo-wide exception.
- Prefer `urllib.request`, `argparse`, `json`, `sqlite3`, and shell wrappers.

## Bundle contents

- Keep only runtime files that the harness or agent actually uses.
- Avoid shipping `README.md`, `pyproject.toml`, tests, eval scripts, sync helpers, or dev bootstrap files inside the skill bundle.
- Prefer one obvious entry CLI plus optional runtime helpers over a large pile of auxiliary scripts.

## Launch readiness

- First-run success should happen with one prompt or one obvious command.
- Title and description should mirror user search intent.
- Output should be decision-ready, not a vague capability description.
- If the skill is too broad, ship the narrowest useful slice first and expand later with variants.
