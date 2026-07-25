---
name: antigravity-design-expert
description: Guidelines and instructions for leveraging Antigravity's advanced design system, focusing on Dark Mode and Glassmorphism (2025/2026 standards).
category: design
risk: low
tags: [design, css, ui, ux, frontend, aesthetics, glassmorphism, dark-mode]
---

# Antigravity Design System Expertise (2025/2026)

In 2025, the combination of **Dark Mode** and **Glassmorphism** has become a cornerstone of modern UI design, balancing futuristic aesthetics with functional user experience. Dark mode is an essential UX requirement for eye strain and battery saving, while glassmorphism creates depth and hierarchy.

## 1. Design Philosophy

- **Dark Mode as Standard**: Provide a high-end, focus-oriented environment. Use desaturated, deep grays, not pure black.
- **Glassmorphism for Depth**: Use "frosted glass" to distinguish between layers without heavy shadows.
- **Vibrant, Accessible Accents**: Mesh gradients that maintain WCAG AA contrast.
- **Micro-interactions**: Fluid reactions to user input (hover, click, focus).

## 2. Color System & Contrast

Because glassmorphism relies on transparency, text can easily become unreadable. Ensure text maintains high contrast against blurred backgrounds.

```css
:root {
  /* Core Dark Theme: Desaturated deep grays to avoid eye strain */
  --bg-main: hsl(230, 15%, 8%);
  --bg-surface: hsl(230, 15%, 12%);
  
  /* Text: Avoid pure white on pure black (halation) */
  --text-primary: hsl(0, 0%, 96%); /* #f5f5f5 */
  --text-secondary: hsl(230, 20%, 70%);
  
  /* Gradients */
  --gradient-brand: linear-gradient(135deg, hsl(260, 100%, 65%), hsl(320, 100%, 60%));
}
```

## 3. Glassmorphism Component Patterns

### The Perfect Glass Card
Use a base fill (white or dark) at 20–40% opacity. Add a subtle 1px border or inner glow to define boundaries.

```css
.glass-card {
  /* Transparency Balance: 20-40% opacity */
  background: rgba(255, 255, 255, 0.05); 
  
  /* The Blur */
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  
  /* Edge Highlights: Crucial for shape definition */
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05),
              0 8px 32px rgba(0, 0, 0, 0.2);
              
  border-radius: 16px;
  padding: 24px;
  color: var(--text-primary);
}
```

### Strategic Usage
Reserve glassmorphism for overlays, navigation bars, cards, or decorative elements. **Do not use it for primary, data-heavy, or form-heavy areas** where absolute clarity is mandatory.

## 4. Animation Guidelines

Animation makes the interface feel alive, but keep it performant.
- **Micro-interactions** (buttons, inputs): `150ms cubic-bezier(0.4, 0, 0.2, 1)`.
- **Panel/Modal entries**: `300ms cubic-bezier(0.16, 1, 0.3, 1)`.

## 5. Premium Effects

### Mesh Gradients (Performance Optimized)
Use CSS radial gradients instead of heavy DOM elements. Limit overlapping blurs to maintain performance.

```css
.mesh-bg {
  position: fixed;
  inset: 0;
  background: var(--bg-main);
  z-index: -1;
  overflow: hidden;
}
.mesh-bg::after {
  content: '';
  position: absolute;
  top: -20%; left: -10%;
  width: 50vw; height: 50vw;
  background: radial-gradient(circle, rgba(138,43,226,0.15) 0%, transparent 70%);
  filter: blur(80px); /* Limit blurs to avoid lag */
}
```

## 6. Accessibility & Fallbacks

- **Reduced Transparency Fallbacks**: Always respect system preferences (`@media (prefers-reduced-transparency: reduce)`). Provide a solid fallback.

```css
@media (prefers-reduced-transparency: reduce) {
  .glass-card {
    background: var(--bg-surface);
    backdrop-filter: none;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}
```
- **Focus States**: Never remove `outline` without providing a highly visible alternative.

## 7. Anti-patterns to Avoid

- ❌ **Overusing Glass**: Using glassmorphism for dense data tables or long-form reading text.
- ❌ **Poor Contrast**: Thin fonts on a heavily transparent glass background over a busy image.
- ❌ **Performance Lag**: Stacking multiple `backdrop-filter` elements on top of each other causes severe GPU lag on lower-end devices.
- ❌ **Missing Edge Highlights**: Glass without a 1px border looks like a messy smudge rather than a distinct layer.
- ❌ **Pure Black Backgrounds**: Causes eye strain when scrolling text. Use deep desaturated grays instead.
