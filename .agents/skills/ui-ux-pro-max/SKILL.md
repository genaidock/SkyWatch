---
name: ui-ux-pro-max
description: "Comprehensive design guide for web and mobile applications. Use when designing new UI components or pages, choosing color palettes and typography, or reviewing code for UX issues."
risk: unknown
source: community
date_added: "2026-02-27"
---

# UI/UX Pro Max - Design Intelligence

Comprehensive design guide for web and mobile applications. Contains 50+ styles, 97 color palettes, 57 font pairings, 99 UX guidelines, and 25 chart types across 9 technology stacks. Searchable database with priority-based recommendations.

## When to Use
Reference these guidelines when:
- Designing new UI components or pages
- Choosing color palettes and typography
- Reviewing code for UX issues
- Building landing pages or dashboards
- Implementing accessibility requirements

## Rule Categories by Priority

| Priority | Category | Impact | Domain |
|----------|----------|--------|--------|
| 1 | Accessibility | CRITICAL | `ux` |
| 2 | Touch & Interaction | CRITICAL | `ux` |
| 3 | Performance | HIGH | `ux` |
| 4 | Layout & Responsive | HIGH | `ux` |
| 5 | Typography & Color | MEDIUM | `typography`, `color` |
| 6 | Animation | MEDIUM | `ux` |
| 7 | Style Selection | MEDIUM | `style`, `product` |
| 8 | Charts & Data | LOW | `chart` |

## Quick Reference

### 1. Accessibility (CRITICAL)

- `color-contrast` - Minimum 4.5:1 ratio for normal text
- `focus-states` - Visible focus rings on interactive elements
- `alt-text` - Descriptive alt text for meaningful images
- `aria-labels` - aria-label for icon-only buttons
- `keyboard-nav` - Tab order matches visual order
- `form-labels` - Use label with for attribute

### 2. Touch & Interaction (CRITICAL)

- `touch-target-size` - Minimum 44x44px touch targets
- `hover-vs-tap` - Use click/tap for primary interactions
- `loading-buttons` - Disable button during async operations
- `error-feedback` - Clear error messages near problem
- `cursor-pointer` - Add cursor-pointer to clickable elements

### 3. Performance (HIGH)

- `image-optimization` - Use WebP, srcset, lazy loading
- `reduced-motion` - Check prefers-reduced-motion
- `content-jumping` - Reserve space for async content

### 4. Layout & Responsive (HIGH)

- `viewport-meta` - width=device-width initial-scale=1
- `readable-font-size` - Minimum 16px body text on mobile
- `horizontal-scroll` - Ensure content fits viewport width
- `z-index-management` - Define z-index scale (10, 20, 30, 50)

### 5. Typography & Color (MEDIUM)

- `line-height` - Use 1.5-1.75 for body text
- `line-length` - Limit to 65-75 characters per line
- `font-pairing` - Match heading/body font personalities

### 6. Animation (MEDIUM)

- `duration-timing` - Use 150-300ms for micro-interactions
- `transform-performance` - Use transform/opacity, not width/height
- `loading-states` - Skeleton screens or spinners

### 7. Style Selection (MEDIUM)

- `style-match` - Match style to product type
- `consistency` - Use same style across all pages
- `no-emoji-icons` - Use SVG icons, not emojis

### 8. Charts & Data (LOW)

- `chart-type` - Match chart type to data type
- `color-guidance` - Use accessible color palettes
- `data-table` - Provide table alternative for accessibility

## How to Use

Search specific domains using the CLI tool below.

---

## Prerequisites

Check if Python is installed:

```bash
python3 --version || python --version
```

If Python is not installed, install it based on user's OS:

**macOS:**
```bash
brew install python3
```

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install python3
```

**Windows:**
```powershell
winget install Python.Python.3.12
```

---

## How to Use This Skill

When user requests UI/UX work (design, build, create, implement, review, fix, improve), follow this workflow:

### Step 1: Analyze User Requirements

Extract key information from user request:
- **Product type**: SaaS, e-commerce, portfolio, dashboard, landing page, etc.
- **Style keywords**: minimal, playful, professional, elegant, dark mode, etc.
- **Industry**: healthcare, fintech, gaming, education, etc.
- **Stack**: React, Vue, Next.js, or default to `html-tailwind`

### Step 2: Generate Design System (REQUIRED)

**Always start with `--design-system`** to get comprehensive recommendations with reasoning:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```

This command:
1. Searches 5 domains in parallel (product, style, color, landing, typography)
2. Applies reasoning rules from `ui-reasoning.csv` to select best matches
3. Returns complete design system: pattern, style, colors, typography, effects
4. Includes anti-patterns to avoid

**Example:**
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness service" --design-system -p "Serenity Spa"
```

### Step 3: Supplement with Detailed Searches (as needed)

After getting the design system, use domain searches to get additional details:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

**When to use detailed searches:**

| Need | Domain | Example |
|------|--------|---------|
| More style options | `style` |

## 9. 2025 Design Trends
- **Bento grid layouts**: Use CSS grid and subgrid to create organized, modular layouts that are clean and scannable.
- **Bold typographic systems**: Rely on a single font with extreme weight contrast (e.g., Variable Fonts) for high impact.
- **Glassmorphism 2.0**: Evolved, context-aware frosted glass effects that adapt to the underlying content and dark/light modes.
- **AI-generated texture and noise patterns**: Subtle grain and texture applied to backgrounds to provide warmth and an organic feel.
- **Variable fonts for responsive typography**: Infinite flexibility in weight and width for perfect legibility across all viewport sizes.
- **Scroll-driven animations**: Utilize native CSS scroll-driven animations for performant, JavaScript-free interactions.
- **Dark mode as primary**: Design with dark mode first in mind, not as an afterthought.

## 10. Modern CSS Techniques
- **Container queries vs media queries**: Use container queries (`@container`) for component-level responsiveness, allowing components to adapt based on their parent container's width rather than the viewport. Reserve media queries for macro page layouts.
- **CSS @layer for cascade management**: Organize styles into layers (e.g., reset, base, components, utilities) to firmly control the CSS cascade and avoid specificity wars.
- **CSS custom properties for design tokens**: Map your entire design token hierarchy to CSS variables for scalable theming.
- **Color-mix() for dynamic theming**: Use `color-mix(in srgb, var(--primary), white 20%)` to generate accessible color variants on the fly without needing a preprocessor.
- **:has() selector for parent-based styling**: Apply styles to a parent based on its children (e.g., styling a card differently if it contains an image).
- **View Transitions API**: Enable smooth, app-like page changes and state transitions across the DOM with native browser support.
- **CSS Houdini**: Implement custom paint worklets for advanced visual effects like dynamic gradients or complex borders.

## 11. WCAG 2.2 Compliance Checklist
The WCAG 2.2 standard introduces 9 new success criteria focused on cognitive, learning, and motor disabilities:
- **2.4.11 Focus Not Obscured (Minimum)**: Ensure focused elements are not entirely hidden by author-created content.
- **2.4.12 Focus Not Obscured (Enhanced)**: Ensure focused elements are entirely visible.
- **2.4.13 Focus Appearance**: Focus indicators must have a minimum 2px perimeter and a 3:1 contrast ratio against the background.
- **2.5.7 Dragging Movements**: Provide a simple pointer alternative to any action that requires dragging.
- **2.5.8 Target Size (Minimum)**: Interactive targets must be at least 24x24 CSS pixels.
- **3.2.6 Consistent Help**: Keep help mechanisms in the same relative order across pages.
- **3.3.7 Redundant Entry**: Do not ask users to re-enter information previously provided.
- **3.3.8 Accessible Authentication (Minimum)**: Do not require cognitive tests (like remembering a password) without an alternative (e.g., copy/paste, password managers).
- **3.3.9 Accessible Authentication (Enhanced)**: Stricter authentication requirements without cognitive tests.
- **2.5.3 Label in Name implementation**: Ensure the accessible name (aria-label or visually hidden text) contains the visible text label of the control.
- **Testing tools**: Regularly audit using axe-core, WAVE, and Lighthouse to catch contrast and structural issues.

## 12. Component Design System Architecture
- **Design token hierarchy**: Structure tokens from Global (raw hex values) -> Semantic (color-primary, text-muted) -> Component (button-bg-hover).
- **Component API design**: Use consistent prop naming conventions (e.g., `isOpen`, `onToggle`, `variant`, `size`).
- **Compound component pattern**: Build complex UI (like Select or Accordion) using cooperative child components (`<Select.Option>`) for maximum flexibility.
- **Headless component libraries**: Prefer Radix, Ark, or Headless UI to handle complex accessibility and state logic, applying your own styles on top.
- **Storybook integration**: Document every component's states, edge cases, and accessibility in Storybook.

## 13. Performance UX
- **Core Web Vitals 2025**: Focus on INP (Interaction to Next Paint), which replaces FID, measuring responsiveness to user interactions.
- **Perceived performance techniques**: Make the app feel faster than it is by responding instantly to clicks, even if data is loading.
- **Skeleton screens vs progressive loading**: Use skeleton screens for initial data fetches to prevent layout shifts, and progressive loading for images.
- **Optimistic UI patterns**: Update the UI immediately upon user action assuming the server request will succeed, reverting only on failure.
- **Error boundary UX**: Wrap features in React Error Boundaries to prevent the entire app from crashing, providing localized, friendly fallback UIs.
