# Codex Agents and Skills Registry

This file indexes custom agents and skills stored in this repository.
The canonical registry location is `AGENTS.md` at the repository root.

## Agents
- ArchitectureAgent: Enforces TestApp architecture layering and responsibilities.
  - Path: .codex/skills/architecture/SKILL.md
- EvenAgent: Domain knowledge for EvenHub (SDK, Simulator, CLI, navigation rules, event mapping).
  - Path: .codex/skills/even_agent/SKILL.md
- UIAgent: EvenHub UI rendering rules and container layout strategy.
  - Path: .codex/skills/ui_agent/SKILL.md

## Skills
- architecture: Same as ArchitectureAgent (kept under skills for reuse).
  - Path: .codex/skills/architecture/SKILL.md
- even_agent: Same as EvenAgent (kept under skills for reuse).
  - Path: .codex/skills/even_agent/SKILL.md
- ui_agent: Same as UIAgent (kept under skills for reuse).
  - Path: .codex/skills/ui_agent/SKILL.md

## Mandatory Skill Policy
- Before starting implementation work, always check whether a matching skill exists under `.codex/skills/*/SKILL.md`.
- If a matching skill exists, it must be used.
- If multiple skills match, use the smallest set that fully covers the task and state the execution order briefly.
- Proceed without skills only when no matching skill exists.
- For EvenHub UI rendering/display tasks, `ui_agent` must be used.
- Mandatory test policy for all implementation work:
  - Always create or update automated tests for every changed method/function and every changed feature flow.
  - Minimum coverage per feature change: happy path + relevant edge/error cases + regression case for the changed behavior.
  - If tests cannot be executed (tooling/environment limits), explicitly document what was not tested and why.
- Sequencing note:
  - If SDK details are needed, apply `ui_agent -> even_agent`.
  - If architecture compliance is needed for code changes, apply `ui_agent -> even_agent -> architecture`.

## Conventions
- Each agent/skill lives in its own folder under `.codex/skills/<name>/`.
- The canonical entry file is `SKILL.md`.
