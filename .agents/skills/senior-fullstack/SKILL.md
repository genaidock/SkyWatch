---
name: senior-fullstack
description: "Complete toolkit for senior fullstack with modern tools and best practices."
risk: critical
source: community
date_added: "2026-02-27"
---

# Senior Fullstack Toolkit

Complete toolkit for senior fullstack engineering, covering architecture, backend, frontend, devops, and quality standards. Use this skill when making critical architectural decisions or reviewing complete systems.

## 1. Tech Stack Decision Framework

Choosing the right technology is the first step. Avoid hype-driven development.

### Frameworks & Meta-Frameworks
- **Next.js (App Router)**: Default choice for React applications. Use for complex dashboards, SaaS products, and SSR/SSG needs.
- **Remix**: Best when routing is closely tied to data fetching, and for apps with heavy form mutations.
- **Astro**: Use for content-heavy sites (blogs, marketing, documentation) where zero-JS by default is a major performance win.
- **Vite (SPA)**: Use for highly interactive client-side apps that don't need SEO (internal tools, rich editors).

### Databases
- **PostgreSQL**: The default choice for 90% of applications. ACID compliant, excellent JSON support, highly scalable.
- **MongoDB / NoSQL**: Use ONLY when data structure is highly variable, schema-less by nature, or for rapid prototyping where relations are minimal.
- **Redis**: Use for caching, session storage, pub/sub, and rate limiting. Not a primary data store.
- **ClickHouse / TimescaleDB**: Use for time-series data or heavy analytics.

## 2. Architecture Patterns

- **Clean Architecture**: Separate concerns into layers (Domain, Use Cases, Interfaces, Infrastructure). Dependency rule: dependencies point inwards.
- **Domain-Driven Design (DDD)**: Group code by business domain (e.g., `users`, `billing`, `orders`) rather than technical concern (e.g., `controllers`, `models`).
- **Feature-Sliced Design (FSD)**: Frontend architecture dividing the project into layers, slices, and segments to ensure decoupled, cohesive features.

## 3. Backend Best Practices

### API Design
- **REST**: Use clear noun-based endpoints (`/users`, `/users/:id/orders`). Use standard HTTP methods and status codes.
- **GraphQL**: Use when clients need flexible data fetching, minimizing over/under-fetching.

### Database Patterns
- **Repositories**: Abstract database queries behind interfaces.
- **Migrations**: Always version database schema changes. Never modify production schema directly.
- **Transactions**: Wrap multi-step data mutations in database transactions to ensure consistency.

### Authentication & Authorization
- **AuthN**: Use standard JWT or session cookies (HttpOnly, Secure). Avoid rolling your own crypto.
- **AuthZ**: Implement Role-Based Access Control (RBAC) or Attribute-Based Access Control (ABAC). Always verify permissions at the API boundary, not just the UI.

### Background Jobs & Queues
- Offload heavy tasks (emails, report generation, image processing) to queues (e.g., BullMQ, Celery). Ensure workers are idempotent.

### Caching Strategies
- **Redis**: Cache expensive DB queries or external API calls.
- **CDN**: Cache static assets and public API responses at the edge.
- **Stale-while-revalidate**: Pattern for returning cached data immediately while fetching fresh data in the background.

### Error Handling & Logging
- Centralize error handling middleware.
- Never leak stack traces to clients.
- Use structured JSON logging (Winston, Pino) for easy parsing in Datadog/ELK.

## 4. Frontend Best Practices

### State Management
- **Zustand**: Default for global client state (UI state, toggles).
- **TanStack Query (React Query)**: Default for server state (caching, deduping, refetching, mutations).
- **Jotai / Recoil**: Use for atomic state management in highly complex interactive UIs.

### Component Architecture
- Favor composition over configuration (props drilling).
- Use Compound Components pattern for complex UI elements like Selects or Accordions.

### Performance Optimization
- Implement code splitting (lazy loading routes and heavy components).
- Prefetch data and routes on hover or visibility.
- Optimize images (WebP/AVIF, responsive sizes, lazy loading).

### Testing Pyramid
- **Unit (60%)**: Test utility functions, hooks, and complex pure logic.
- **Integration (30%)**: Test components together, API endpoints, database queries.
- **E2E (10%)**: Playwright/Cypress for critical user flows (login, checkout).

## 5. DevOps & Deployment

- **CI/CD**: Automate linting, testing, and building on every PR. Automate deployments to staging/prod.
- **Docker**: Containerize applications to ensure environment consistency (Dev -> Prod).
- **Environment Management**: Use `.env` files locally, strict secret management (AWS Secrets, Doppler) in prod.
- **Monitoring**: Implement error tracking (Sentry) and performance monitoring (Datadog, New Relic, OpenTelemetry).

## 6. Code Quality Standards

- **TypeScript**: `strict: true`, no `any`, use `unknown` and type guards.
- **Linting**: ESLint (or Biome) with strict rules. Enforce dependency arrays in hooks.
- **Formatting**: Prettier, run on pre-commit hook (Husky + lint-staged).
- **Git Workflow**: Conventional Commits (`feat:`, `fix:`, `chore:`). Trunk-based development or GitHub Flow.

## 7. Security Checklist

- [ ] CSRF protection enabled
- [ ] XSS prevention (React does this mostly, but sanitize user HTML)
- [ ] SQL Injection prevention (Use ORMs/Query Builders or parameterized queries)
- [ ] Rate limiting on public APIs (especially auth)
- [ ] Secure headers (Helmet, CSP)
- [ ] Dependencies scanned for vulnerabilities (npm audit / Snyk)

## 8. Performance Checklist

- [ ] Lighthouse score > 90
- [ ] Core Web Vitals (LCP, FID/INP, CLS) in the green
- [ ] Bundle size analyzed and minimized
- [ ] Tree-shaking enabled
- [ ] Database queries indexed correctly (no sequential scans on large tables)

## 9. Code Review Standards

- Review for **architecture and logic**, not formatting (let CI handle formatting).
- Is this code testable? Are there tests?
- Are edge cases handled?
- Is the PR scoped to a single concern?
- Is there documentation/comments for complex logic?
