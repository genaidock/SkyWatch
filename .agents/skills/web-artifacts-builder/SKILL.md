---
name: web-artifacts-builder
description: "To build powerful frontend claude.ai artifacts, follow these steps:"
risk: unknown
source: community
date_added: "2026-02-27"
---

# Web Artifacts Builder (2025 Best Practices)

To build powerful frontend artifacts (like those seen in modern AI interfaces), follow these steps:

1. Initialize the frontend repo using `scripts/init-artifact.sh`
2. Develop your artifact by editing the generated code
3. Bundle all code into a single HTML file using Vite plugin
4. Display artifact to user
5. (Optional) Test the artifact

**Stack**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui

---

## Quick Start

### Step 1: Initialize Project

Run the initialization script to create a new React project:
```bash
bash scripts/init-artifact.sh <project-name>
cd <project-name>
```
*(If the script is unavailable, manually initialize a Vite React TS project and install Tailwind + shadcn/ui).*

### Step 2: Develop Your Artifact

Develop components in `src/`. Use shadcn/ui for rapid UI assembly. Keep state management simple (React state) or use Zustand for complex interactive artifacts.

### Step 3: Bundle to Single HTML File (2025 Approach)

Modern artifacts require a single self-contained HTML file. We achieve this using Vite and `vite-plugin-singlefile`.

1. Ensure the plugin is installed: `npm install vite-plugin-singlefile --save-dev`
2. Configure `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [react(), viteSingleFile()],
});
```
3. Run the build:
```bash
npm run build
```
The output will be a single `dist/index.html` file containing all inline CSS and JS.

### Step 4: Display Artifact

Once built, you can present the `dist/index.html` to the user via your standard artifact viewer or file sharing mechanism.

### Step 5: Testing

Test locally by running `npm run dev` during development. Before final delivery, always open the built `dist/index.html` in a local browser to verify that inlining didn't break assets or paths.

---

## Component Development Guide

- **shadcn/ui**: Use for buttons, cards, dialogs, and forms. Copy the component code directly into the project to allow for deep customization.
- **State Management (Zustand)**: Use for artifacts that act as mini-applications (e.g., calculators, interactive dashboards).
- **Data Visualization**: Use `Recharts` for standard charts, or `D3.js` for complex, bespoke data vis.
- **Animation**: Use `Framer Motion`. Keep animations purposeful (layout transitions, micro-interactions) rather than distracting.

---

## Design Anti-patterns ("AI Slop" to Avoid)

In 2025, users immediately recognize and reject generic "AI generated" UI patterns. Avoid these strictly:
- ❌ **Excessive purple/blue gradients**: Stop using linear-gradient backgrounds for headers or buttons unless explicitly requested.
- ❌ **Uniform border-radius: 12px everywhere**: Mix border radii. Use sharp corners for industrial designs, or massive pills for playful ones.
- ❌ **Generic Inter font everywhere**: Inter is great, but overused. Pair distinctive display fonts for headers.
- ❌ **Centered everything layout**: Not everything belongs in a centered max-w-2xl container. Use asymmetric grids, sidebars, and full-bleed sections.
- ❌ **Blue card with icon grid**: The standard "3 columns of features with a blue icon in a circle" is exhausted. Find new ways to display features (lists, interactive accordions).

---

## Premium Design Patterns

- **Editorial Layouts**: Heavy focus on typography, stark lines, minimal borders, and generous white space.
- **Asymmetric Grids**: Use CSS Grid to create dynamic, magazine-like layouts that guide the eye naturally.
- **Typographic Hierarchy**: Use extreme contrast between `h1` and body text.
- **Purposeful Animation**: Animate elements entering the viewport, or use View Transitions for seamless state changes.

---

## Performance Checklist

1. [ ] Vite build completes with zero errors.
2. [ ] `vite-plugin-singlefile` successfully inlined all assets.
3. [ ] No external image links that might break (use base64 or SVGs if possible).
4. [ ] Bundle size is reasonable for a single HTML file (<2MB).
5. [ ] React components are properly memoized if rendering large data tables.

## Common Component Examples

- **Dashboard**: Use CSS Grid for a sidebar (250px) and a main content area. Include a top stat-row and a Recharts line graph.
- **Landing Page**: Full height hero section with a bold typographic statement, followed by asymmetric feature bento boxes.
- **Data Table**: Use shadcn/ui Table, ensuring horizontal scroll on small screens, and implement sticky headers.
