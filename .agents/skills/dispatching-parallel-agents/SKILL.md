---
name: dispatching-parallel-agents
description: "Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies"
risk: unknown
source: community
date_added: "2026-02-27"
---

# Dispatching Parallel Agents (2025 Orchestration)

## Overview

When you have multiple unrelated failures or complex tasks, investigating sequentially wastes time. Multi-agent orchestration has evolved into a core requirement for building scalable AI systems. 

**Core principle:** Dispatch specialized agents per independent problem domain in parallel, utilizing modern coordination patterns.

## When to Use

**Use when:**
- 3+ test files failing with different root causes
- Tasks take > 60-120 seconds individually and are truly independent
- Tasks can be decomposed into parallel fan-out operations

**Don't use when:**
- Failures are highly coupled
- Agents would interfere with shared state without durable execution
- The task is too short (sub-minute), meaning orchestration overhead outweighs parallel benefits

## Core Orchestration Patterns

Modern systems (like LangGraph, CrewAI, AutoGen) rely on established structural blueprints:

1. **Orchestrator-Worker**: A central "lead" agent (you) decomposes tasks and routes them to specialized workers. This is the most reliable production pattern.
2. **Parallel Fan-out/Fan-in**: Spawn multiple agents to explore aspects simultaneously, then aggregate results.
3. **Sequential Pipeline**: A chain of agents where the output of one becomes the input of the next.
4. **Hierarchical**: Parent agents delegating to child agents across multiple levels.
5. **Event-Driven**: Agents react autonomously to state changes or pub/sub events.

### Key Frameworks (For Context)
- **LangGraph**: Used for stateful, cyclic orchestration.
- **CrewAI**: Used for role-based orchestration.
- **AutoGen**: Used for conversational, peer-to-peer patterns.

## The Pattern in Practice

### 1. Context Engineering & Domain Identification

Automated management of what information is shared is critical to avoid **Context Starvation**. You MUST pass all relevant context explicitly to subagents, as they do not automatically inherit your memory. Group tasks by domain:
- File A: Tool approval flow
- File B: Batch completion

### 2. Create Focused Agent Tasks (Role-based)

Each agent gets:
- **Specific scope:** One subsystem.
- **Clear goal:** What to achieve.
- **Constraints:** What NOT to do.

### 3. Dispatch in Parallel (invoke_subagent)

Call `invoke_subagent` once with an array of all agents you want to launch simultaneously. Do not make sequential tool calls.

### 4. Review, Integrate, and Reconcile

When agents return:
- Verify fixes don't conflict.
- **Conflict Resolution**: If answers differ significantly, spawn a final **Consensus Agent** to review the parallel outputs and make a final determination.

---

## Antigravity-Specific Patterns

- **invoke_subagent tool**: Launch multiple agents concurrently.
- **send_message**: Utilize A2A (Agent-to-Agent) communication to check in, unblock, or pass context.
- **Workspace modes**:
  - `inherit`: Standard use.
  - `branch`: Full isolation for destructive mutations.
  - `share`: Lightweight isolation.
- **Model selection**:
  - `flash_lite`: Regex parsing, trivial lookups.
  - `flash`: Standard research.
  - `pro`: Complex reasoning, consensus engine lead.
  - `inherit`: Default.

---

## Agent Communication Templates

### Structuring Agent Prompts
1. **Role**: "You are an expert debugger for the auth subsystem."
2. **Context**: "Login tests fail with 401. (Include all necessary context, do not starve the agent)."
3. **Task**: "Fix the bug in `auth.ts`."
4. **Constraints**: "Do not modify DB schema."
5. **Output Format**: Enforce structured schemas.

---

## Cost Guards, Failure Handling & Durable Execution

- **Cost Guard**: Aggressive parallelism scales cost exponentially. Always use early termination and limit the max number of parallel agents.
- **Durable Execution**: Assume agents might fail or get interrupted. Persist state and use `schedule` tool to manage timeouts.
- **Timeout strategies**: Set timers with `TimerCondition` set to the specific agent's ID.
- **Retry patterns**: Spawn a new agent with a refined prompt if one fails due to transient errors.
- **Partial success**: Commit successful work, report failures for manual intervention.

---

## Agent Prompt Template

```text
[ROLE]
You are a specialized [Role, e.g., Frontend React Engineer].

[CONTEXT]
We are currently [Context, e.g., migrating to Tailwind CSS].
(Include any specific file snippets or explicit context here. Do not assume the agent knows).

[TASK]
Your objective is to [Task].

[CONSTRAINTS]
- Do not change the component's public API.
- Do not delete existing tests.

[OUTPUT FORMAT]
When finished, use send_message to return a concise summary.
```
