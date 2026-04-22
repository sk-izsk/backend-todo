# Copilot Instructions for backend-todo

These instructions apply to all tasks in this repository.

## Mandatory Pre-Edit Workflow

Before making any file changes, Copilot must first load and follow these skills:

1. Node.js backend best practices:
   - `/Users/izsk/.agents/skills/nodejs-backend-patterns/SKILL.md`
2. TypeScript/JavaScript best practices:
   - `/Users/izsk/.agents/skills/typescript-best-practices/SKILL.md`

## Enforcement Rules

- For every implementation task that modifies code, load both skill files before editing.
- Also load any additional relevant skill when the task domain requires it.
- Apply both skills to planning, code changes, and review of the change.
- If a task does not edit code (for example, read-only exploration), skill loading is optional.
- If there is a conflict between these skills and a direct user instruction, follow the user instruction and call out the conflict.

## Scope

- This applies to all backend source files and config changes in this repository.
- In practice, treat this as repository-wide guidance for any code change.
