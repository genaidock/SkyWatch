---
name: writing-skills
description: "Use when creating, updating, or improving agent skills."
category: meta
risk: unknown
source: community
date_added: "2026-02-27"
---

# Writing Agent Skills (2025 Best Practices)

Dispatcher for skill creation excellence. Modern agent skills focus on **progressive disclosure, concise documentation, and modular design** to optimize shared context windows.

## ⚡ Quick Decision Tree

### What do you need to do?

1. **Create a NEW skill:**
   - Single purpose, doing one thing well? → [Tier 1 Architecture](references/tier-1-simple/README.md)
   - Complex/multi-concept? → [Tier 2 Architecture](references/tier-2-expanded/README.md)
   - Massive platform? → [Tier 3 Architecture](references/tier-3-platform/README.md)

2. **Improve an EXISTING skill:**
   - "Context Bombing" (too long)? -> [Modularize / Progressive Disclosure](references/templates/tier-3-platform.md)
   - "AI ignores rules"? -> [Anti-Rationalization](references/anti-rationalization/README.md)
   - "Users/Agents can't find it"? -> [Trigger-Centric Descriptions](references/cso/README.md)

## 📚 Component Index

| Component | Purpose |
|-----------|---------|
| **[CSO / Descriptions](references/cso/README.md)** | "SEO for LLMs". Writing trigger-centric YAML descriptions. |
| **[Standards](references/standards/README.md)** | Open standards, Namespacing, folder structures. |
| **[Anti-Rationalization](references/anti-rationalization/README.md)**| Non-deterministic agent design and strict constraints. |
| **[Testing](references/testing/README.md)** | Auditing skills against new model versions. |

---

## 1. Core Authoring Principles

- **Concise is Key**: The context window is shared. Only provide information the agent doesn't already have. Challenge every paragraph.
- **Progressive Disclosure**: Keep `SKILL.md` metadata short and actionable. Detailed instructions and references should live in subfolders (`/references/`) and be loaded only when the skill triggers.
- **Trigger-Centric Descriptions**: YAML descriptions decide if a skill is used. They must explicitly state:
  - What it does.
  - When to use it (trigger phrases).
  - Key capabilities.
- **Namespacing**: Use distinct names (e.g., `company_core_auth` vs `auth`) to prevent tool overlap.

---

## 2. Skill Quality Standards (The Full Rubric)

Evaluate skills against these pillars:
- **Trigger clarity**: Is the description optimized for vector embeddings? Does it list specific trigger conditions?
- **Instruction specificity**: Are steps atomic? Avoid words like "sometimes" or "try to".
- **Example coverage**: Are edge cases covered?
- **Anti-rationalization**: Are there hard gates forcing compliance?
- **Non-Deterministic Design**: Are you using structured tool schemas instead of relying on the model to "follow a format" in raw text?

---

## 3. Anti-Rationalization & Non-Deterministic Design

LLMs often rationalize skipping hard steps to please the user quickly.
- **Hard gates**: Replace "You should summarize" with "MANDATORY: You MUST output a summary artifact BEFORE proceeding."
- **Structured Outputs**: Instead of asking for JSON in text, force the agent to use a specific tool with parameter schemas.
- **Negative instructions**: Give explicit examples of failure modes. "DO NOT output raw code without tests."
- **Consequence framing**: Explain *why* the rule exists.

---

## 4. Skill Testing & Maintenance Protocol

- **Test case design**: Write 3 distinct prompts designed to trigger the skill.
- **Model Audits**: As you upgrade to newer model versions (e.g., from Claude 3.5 to Claude 3.7+), **re-audit your skills**. A detailed crutch needed for an older model might become a "shackle" for a smarter one.
- **Multi-model testing**: Verify the skill works on both fast/light models and reasoning-heavy pro models.
- **Security**: Never include sensitive instructions or credentials in frontmatter, as it's part of the system prompt.

---

## Common Skill Failure Modes

| Failure Mode | Symptom | Fix (2025 Standard) |
|--------------|---------|-----|
| **Ghosting** | Skill is never invoked | Rewrite YAML description to be Trigger-Centric |
| **Skipping** | Agent ignores steps | Add Anti-Rationalization hard gates & structured tools |
| **Context Bombing**| Token limits exceeded | Implement Progressive Disclosure (move text to `/references/`) |
| **Overreach** | Tries to solve unrelated problems | Narrow scope, use strict Namespacing |
