---
name: analyze-project
description: Guidelines and instructions for comprehensively analyzing a project's architecture, dependencies, and structure using modern 2026 methodologies.
category: architecture
risk: low
tags: [analysis, architecture, atam, review, refactoring, codebase]
---

# Comprehensive Project Architecture Analysis Methodology

Software architecture analysis is a critical process for identifying risks, evaluating design decisions, and ensuring that a system meets its quality attribute requirements (performance, modifiability, security, scalability) before or during development.

## 1. When to Use

- **Onboarding**: Understanding the lay of the land in a new project.
- **Pre-Refactoring**: Mapping dependencies before ripping out core systems.
- **Code Review / Audit**: Evaluating code quality, security posture, and architectural soundness.
- **Evaluating Tradeoffs**: Deciding between microservices vs monolith, or evaluating a new framework.

## 2. Core Methodologies (Scenario-Based Evaluation)

The industry standard relies heavily on scenario-based evaluation methods.

### ATAM (Architecture Tradeoff Analysis Method)
The most widely used framework. Focuses on revealing how well an architecture satisfies quality attribute goals and identifying tradeoffs.
1. **Define Business Drivers**: What is the ultimate goal? (e.g., scale to 1M users).
2. **Quality Attribute Scenarios**: Create specific test cases (e.g., "A database node fails during peak load; the system must recover in 2 seconds").
3. **Analyze Architecture**: Map the scenarios to the architecture to uncover risks.

### SAAM (Software Architecture Analysis Method)
A lightweight technique primarily focused on evaluating an architecture’s **modifiability** and adaptability by testing it against various change scenarios.

## 3. Step-by-Step Practical Methodology

### Step 1: Discover Quality Attributes & Tradeoffs
Identify the "-ilities" (maintainability, testability, deployability, scalability, performance).
Map the **Tradeoffs**: e.g., Increasing security (encryption) might negatively impact performance. Identify **Sensitivity Points**: Components that heavily impact a quality attribute.

### Step 2: Repository Structure & Dependency Graph Analysis
- Review `package.json`, `go.mod`, etc.
- Identify the core framework and key libraries.
- Use static analysis tools (SonarQube, CAST) to evaluate structural decay and complexity.

### Step 3: Entry Point & Data Flow Tracing
- Map out the system using the **C4 Model** (Context, Containers, Components, and Code) or **4+1 View Model**.
- Trace a standard request from entry to database and back.

### Step 4: Security & Performance Audit
- Are secrets hardcoded? How is authentication handled?
- Use Architectural Observability platforms (e.g., vFunction) to dynamically analyze technical debt.
- Look for N+1 queries, synchronous blocking, and caching strategies.

### Step 5: Test Coverage & Documentation Review
- Check test reliability and CI pipeline enforcement.
- Validate API docs (Swagger/OpenAPI).

## 4. Recommended Tools

- **Static/Dynamic Analysis**: SonarQube, CAST Software, vFunction (for architectural observability).
- **Modeling**: C4 Model tools (Structurizr), Draw.io.
- **Command Line**: `grep`, `rg` (ripgrep), `tree`.
- **Security**: Trivy, Snyk.

## 5. Output Format (Structured Report Template)

```markdown
# Architectural Analysis Report: [Project Name]

## 1. Executive Summary & Business Drivers
(High-level overview, primary purpose, business goals)

## 2. Quality Attributes & Scenarios
(List of prioritized attributes: Scalability, Security, etc., and the scenarios used to test them)

## 3. Architecture Overview (C4 Model)
(Frameworks, DBs, Architectural patterns - MVC, Event-Driven, etc.)

## 4. Evaluation Findings
- **Sensitivity Points**: (Components highly sensitive to change)
- **Tradeoffs Identified**: (e.g., Latency vs Data Consistency)
- **Risks**: (Potentially problematic architectural decisions)
- **Non-Risks**: (Good decisions that support the goals)

## 5. Technical Debt & Code Health
(Findings from static analysis, test coverage, coupling)

## 6. Recommendations
(Actionable steps to mitigate risks and improve the architecture)
```

## 6. Anti-patterns & Red Flags Checklist
- ❌ **Lack of Architectural Alignment**: Technical decisions made without considering business goals.
- ❌ **God Objects / Monolithic Mud**: Massive files (> 1000 lines) or highly coupled domains.
- ❌ **Ignoring Tradeoffs**: Assuming a pattern (like microservices) solves all problems without acknowledging the operational complexity tradeoff.
- ❌ **"Gut Feeling" Decisions**: Making architectural choices without data-driven scenario analysis.
