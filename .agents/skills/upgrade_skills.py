import os

# 1. ui-ux-pro-max
p1 = r"c:\MyWorkSpace\NewSkills\.agents\skills\ui-ux-pro-max\SKILL.md"
with open(p1, "a", encoding="utf-8") as f:
    f.write("""

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
""")

# 2. slack-gif-creator
p2 = r"c:\MyWorkSpace\NewSkills\.agents\skills\slack-gif-creator\SKILL.md"
with open(p2, "a", encoding="utf-8") as f:
    f.write("""

## Advanced Animation Techniques
- **Easing functions**: Implement non-linear interpolation (ease-in, ease-out, ease-in-out) in Python to make motion feel natural.
- **Tweening**: Use linear interpolation (`start + (end - start) * progress`) for smooth motion across frames.
- **Bounce and spring physics formulas**: Add overshoot and settle mechanics for dynamic, energetic animations.
- **Keyframe animation system**: Define keyframes at specific percentages and interpolate values between them.

## Anti-aliasing & Quality
- **Supersampling technique**: Render your frame at 2x or 4x the target resolution, then downscale using `Image.Resampling.LANCZOS` for buttery smooth edges.
- **PIL ImageFilter.SMOOTH**: Apply a light blur or smoothing filter to reduce jagged pixels before quantization.
- **Sub-pixel rendering for circles**: When drawing small circular elements, use supersampling to avoid pixelated edges.

## Effects Library
- **Glow effect**: Duplicate a shape, enlarge it, fill with the glow color, apply a Gaussian blur (`ImageFilter.GaussianBlur`), and composite it behind the main shape.
- **Shadow effect**: Draw a darker, offset version of the shape, blur it, and place it beneath the subject.
- **Gradient fills on shapes**: Use masks and interpolated color arrays to fill shapes with smooth gradients.
- **Pulsing/breathing animation**: Animate the scale and opacity of a shape over a sine wave loop.
- **Spin/rotate animation**: Use PIL's `Image.rotate()` with varying angles across frames.
- **Wave animation**: Apply a vertical sine offset to pixels or shapes to simulate water or flags.
- **Particle system**: Manage an array of particle objects (x, y, velocity, lifetime) and draw them each frame.
- **Text animations**: Create typewriter effects (revealing one character per frame) or fade-ins using text masks.

## Color Palettes for GIFs
- **Predefined Slack-friendly palettes**: Use bright, high-contrast colors (e.g., Slack's own aubergine, blue, green, yellow, red) that pop on both light and dark backgrounds.
- **Brand color GIFs guide**: Limit brand palettes to 32-64 colors to fit within the 128KB limit without aggressive dithering.
- **Dark vs light background considerations**: Design with transparency. Add a subtle contrasting stroke (e.g., white outline on dark shapes) so the GIF is visible in both Slack dark and light modes.

## Optimization Guide
- **Quantize properly**: Use `Image.quantize(colors=64, method=Image.Quantize.MEDIANCUT)` or neural net quantization to reduce palette size dramatically while maintaining visual fidelity.
- **Dithering options**: Turn off dithering if it introduces too much noise; smooth gradients in GIFs often compress better as flat color bands.
- **Frame deduplication**: If a section of the GIF is static, keep the frame count low or use transparency in subsequent frames to only update changing pixels (using the `gifsicle` approach).
- **Loop count settings**: Set `loop=0` for infinite loops, which is standard for Slack emojis.
- **Disposal methods**: Understand GIF disposal methods (e.g., Restore to Background vs Do Not Dispose) to optimize transparent animations.

## Common GIF Patterns
- **Loading spinner**: Smooth rotating arcs or pulsing dots.
- **Success checkmark**: Animate the drawing of a checkmark path with a slight bounce at the end.
- **Fire/flame effect**: Layered, undulating orange and yellow polygons.
- **Confetti burst**: Particles exploding outward from the center and falling with gravity.
- **Thumbs up animation**: A hand icon that scales up, rotates slightly, and scales back to 100%.
- **Heart beat**: A heart shape that rapidly scales up to 120% and back twice per second.
- **Wave/celebration**: An object moving left to right with a sine wave vertical offset.

## Testing & Preview
- **Preview in Python**: Use `frame.show()` or compile a quick unoptimized GIF for local playback.
- **Browser preview via HTTP server**: Serve the generated GIF locally using `python -m http.server` to view it looping natively in a browser.
- **Slack upload workflow**: Ensure the final file is strictly under 128KB before attempting to upload to Slack. Use a CLI tool like `gifsicle` as a post-processing step if PIL's compression is insufficient.
""")

# 3. building-native-ui
p3 = r"c:\MyWorkSpace\NewSkills\.agents\skills\building-native-ui\SKILL.md"
with open(p3, "a", encoding="utf-8") as f:
    f.write("""

## New Architecture (Stable in SDK 53)
- **Fabric renderer benefits**: Experience concurrent React features, smooth UI thread rendering without the asynchronous bridge, and better support for React Suspense.
- **TurboModules vs bridge modules**: TurboModules load lazily and execute synchronously, dramatically reducing app startup time compared to legacy native modules.
- **JSI (JavaScript Interface)**: Understand that JSI allows JavaScript to hold direct references to C++ objects, enabling blazingly fast communication between JS and Native.
- **Migration guide from old architecture**: Most Expo modules are already migrated. Ensure any third-party dependencies are compatible with the New Architecture.
- **Debugging with Hermes inspector**: Use the modern React Native DevTools to debug Hermes and inspect the native UI tree accurately.

## expo-router v4 Features
- **Typed routes**: Use TypeScript to strongly type your route paths and parameters, preventing broken links at compile time.
- **Async layout loading**: Defer the rendering of expensive layouts until they are needed using lazy imports and Suspense.
- **Nested layouts best practices**: Keep layouts focused. Avoid prop drilling by leveraging context or global state alongside layout wrappers.
- **API routes (server-side rendering)**: Build full-stack apps directly within Expo using API routes (`app/api/hello+api.ts`) for server logic.
- **Route middleware**: Intercept and redirect routes based on authentication or feature flags before the layout renders.
- **Authentication flow patterns**: Use group routes (e.g., `(auth)` and `(tabs)`) and a root layout observer to conditionally render stacks based on the user's session state.

## State Management for Native
- **Zustand for cross-component state**: Prefer Zustand for its minimal boilerplate and excellent React Native compatibility.
- **React Query (TanStack Query) for server state**: Use React Query for caching, synchronizing, and background-updating remote data.
- **Jotai for atomic state**: Excellent for complex UIs where derived state and fine-grained re-renders are crucial.
- **AsyncStorage patterns with zustand-persist**: Persist user preferences or session tokens seamlessly using Zustand's persist middleware backed by AsyncStorage or SecureStore.

## Performance Optimization
- **React Native performance profiling**: Master Flipper (or modern Expo DevTools) and the React DevTools Profiler to identify render bottlenecks.
- **FlatList optimization**: Always implement `getItemLayout` for fixed-height items, and tune `windowSize`, `maxToRenderPerBatch`, and `initialNumToRender` to prevent blank spaces during rapid scrolling.
- **Image optimization**: Exclusively use `expo-image` for its aggressive disk and memory caching, placeholder support, and performant blurhashes.
- **Reanimated 3 worklet patterns**: Offload all continuous animations and gesture handling to the UI thread using `useAnimatedStyle` and worklets to prevent JS thread drops.
- **Avoid re-renders**: In React 19 / SDK 53, the React Compiler handles much of this, but continue to design clean component hierarchies to prevent unnecessary prop cascades.

## Testing
- **Jest + Testing Library for React Native**: Standardize on `@testing-library/react-native` for behavior-driven component tests.
- **Maestro for E2E testing**: Use Maestro for reliable, easy-to-write E2E flows on both iOS and Android simulators (preferred over Detox for Expo apps).
- **Unit testing hooks with renderHook**: Isolate and test complex custom hooks reliably without mounting dummy components.

## Production Deployment
- **EAS Build configuration**: Optimize `eas.json` with remote caching and appropriate build profiles (development, preview, production).
- **OTA updates with EAS Update**: Deploy bug fixes and JS updates instantly to users without waiting for App Store review.
- **App Store / Play Store review tips**: Provide test credentials, explain permission usages (like camera or location) clearly in the review notes, and avoid mentioning beta statuses in screenshots.
- **Crash reporting**: Integrate Sentry (`@sentry/react-native`) for comprehensive native and JS crash tracking.
- **Analytics**: Use `expo-tracking-transparency` on iOS to legally and safely request tracking permissions before initializing analytics SDKs.

## iOS 26 Liquid Glass Effect
- **expo-glass-effect usage**: Leverage `expo-glass-effect` for stunning, OS-level blurred translucent backgrounds (Apple's Liquid Glass style).
- **Platform-specific design considerations**: Use `Platform.select` or `process.env.EXPO_OS` to provide fallback styling for Android where native liquid glass is unavailable.
- **SwiftUI interop patterns**: When necessary, build custom SwiftUI views and expose them via Expo Modules to match native Apple design language perfectly.
""")

# 4. theme-factory
p4 = r"c:\MyWorkSpace\NewSkills\.agents\skills\theme-factory\SKILL.md"
with open(p4, "w", encoding="utf-8") as f:
    f.write("""---
name: theme-factory
description: "This skill provides a curated collection of professional font and color themes themes, each with carefully selected color palettes and font pairings. Once a theme is chosen, it can be applied to any artifact."
risk: unknown
source: community
date_added: "2026-02-27"
---

# Theme Factory Skill

## Purpose
To apply consistent, premium, and functional styling to artifacts or web pages in 2025. Each theme includes a cohesive color palette with hex codes, complementary Google font pairings (focusing on variable fonts and high contrast), and distinct visual identities suitable for various industries.

## Themes Available (15 Premium Themes)

### 1. Ocean Depths
- **Tagline**: Deep, reliable, and corporate.
- **Primary Palette**: `#0A1628`, `#1E3A5F`, `#4A9ECD`, `#7EC8E3`, `#FFFFFF`
- **Font Pairing**: Merriweather (Heading) + Source Sans Pro (Body)
- **Best For**: Corporate SaaS, B2B platforms, Financial institutions.
- **Mood**: Trustworthy, Professional, Calm.

### 2. Sunset Boulevard
- **Tagline**: Warm, energetic, and creative.
- **Primary Palette**: `#1A0A00`, `#C45C2E`, `#F5A623`, `#FDE8CC`, `#FFFFFF`
- **Font Pairing**: Playfair Display (Heading) + Nunito (Body)
- **Best For**: Creative portfolios, Lifestyle blogs, Boutique agencies.
- **Mood**: Vibrant, Inviting, Artistic.

### 3. Forest Sanctuary
- **Tagline**: Grounded, organic, and peaceful.
- **Primary Palette**: `#0D1F0D`, `#2D5A2D`, `#5C9E5C`, `#B8D9B8`, `#FFFFFF`
- **Font Pairing**: Lora (Heading) + Open Sans (Body)
- **Best For**: Wellness apps, Environmental organizations, Health platforms.
- **Mood**: Natural, Serene, Balanced.

### 4. Arctic Noir
- **Tagline**: Cold, technical, and sharp.
- **Primary Palette**: `#0A0A14`, `#1E1E2E`, `#8888CC`, `#CCCCFF`, `#FFFFFF`
- **Font Pairing**: Space Grotesk (Heading) + IBM Plex Sans (Body)
- **Best For**: Developer tools, Cyber security, Data dashboards.
- **Mood**: Technical, Futuristic, Sleek.

### 5. Golden Hour
- **Tagline**: Elegant, luxurious, and timeless.
- **Primary Palette**: `#1A1200`, `#8B6914`, `#D4A017`, `#F5E6A3`, `#FFFFFF`
- **Font Pairing**: Cormorant Garamond (Heading) + Raleway (Body)
- **Best For**: High-end retail, Editorial, Hospitality.
- **Mood**: Luxurious, Warm, Sophisticated.

### 6. Deep Space
- **Tagline**: Bold, vast, and sci-fi inspired.
- **Primary Palette**: `#000814`, `#001D3D`, `#003566`, `#FFC300`, `#FFFFFF`
- **Font Pairing**: Orbitron (Heading) + Exo 2 (Body)
- **Best For**: Gaming, Crypto, Tech startups.
- **Mood**: Futuristic, Intense, Modern.

### 7. Rose Garden
- **Tagline**: Soft, romantic, and inviting.
- **Primary Palette**: `#1A0812`, `#6B2B3E`, `#C06080`, `#F0B8C8`, `#FFFFFF`
- **Font Pairing**: Crimson Text (Heading) + Quicksand (Body)
- **Best For**: Beauty brands, Weddings, Floral shops.
- **Mood**: Romantic, Gentle, Elegant.

### 8. Slate & Steel
- **Tagline**: Industrial, utilitarian, and clean.
- **Primary Palette**: `#1A1A1F`, `#2E2E38`, `#4A6FA5`, `#A8C4E8`, `#FFFFFF`
- **Font Pairing**: Inter (Heading) + Roboto Mono (Body)
- **Best For**: Productivity tools, Admin panels, Engineering.
- **Mood**: Functional, Sturdy, Objective.

### 9. Terracotta Dreams
- **Tagline**: Earthy, artisanal, and warm.
- **Primary Palette**: `#1A0800`, `#7A3B1E`, `#C4703A`, `#E8C4A8`, `#FFFFFF`
- **Font Pairing**: Libre Baskerville (Heading) + Mulish (Body)
- **Best For**: Artisan goods, Pottery, Interior design.
- **Mood**: Earthy, Crafted, Cozy.

### 10. Midnight Garden
- **Tagline**: Mysterious, deep, and enchanting.
- **Primary Palette**: `#050510`, `#1A1A3E`, `#4A4A8A`, `#8A8ACA`, `#FFFFFF`
- **Font Pairing**: Josefin Sans (Heading) + Karla (Body)
- **Best For**: Nightlife, Premium events, Fashion.
- **Mood**: Mysterious, Premium, Bold.

### 11. Neon Tokyo
- **Tagline**: High-contrast, electric, and urban.
- **Primary Palette**: `#0A0014`, `#1A0030`, `#FF0080`, `#00F5FF`, `#FFFFFF`
- **Font Pairing**: Rajdhani (Heading) + Fira Code (Body)
- **Best For**: Esports, Web3, Night-mode focused apps.
- **Mood**: Electric, Fast, Edgy.

### 12. Sage & Sand
- **Tagline**: Muted, minimalist, and breathable.
- **Primary Palette**: `#1A1A14`, `#4A4A30`, `#9C9C6B`, `#D9D9B8`, `#FFFFFF`
- **Font Pairing**: DM Serif Display (Heading) + DM Sans (Body)
- **Best For**: Minimalist blogs, Sustainable fashion, Architecture.
- **Mood**: Minimal, Breathable, Calm.

### 13. Volcanic Ash
- **Tagline**: High-impact, stark, and brutalist.
- **Primary Palette**: `#0A0A0A`, `#1E1E1E`, `#4A4A4A`, `#D0D0D0`, `#FFFFFF`
- **Font Pairing**: Monument Extended (subset) / Syncopate (Heading) + Inter (Body)
- **Best For**: Brutalist web design, Streetwear brands, Magazines.
- **Mood**: Stark, Unapologetic, Bold.

### 14. Lagoon
- **Tagline**: Refreshing, aquatic, and vibrant.
- **Primary Palette**: `#001824`, `#003848`, `#00A89C`, `#7ADDD8`, `#FFFFFF`
- **Font Pairing**: Poppins (Heading) + Source Code Pro (Body)
- **Best For**: Travel agencies, App landing pages, Aquatic sports.
- **Mood**: Refreshing, Energetic, Clear.

### 15. Copper & Cream
- **Tagline**: Classic, comforting, and rich.
- **Primary Palette**: `#1A0F00`, `#6B3F1E`, `#C48B4A`, `#F5DEB3`, `#FFFFFF`
- **Font Pairing**: EB Garamond (Heading) + Cabin (Body)
- **Best For**: Coffee shops, Bakeries, Historical sites.
- **Mood**: Rich, Nostalgic, Comforting.

## Implementation Section

### How to apply a theme to HTML/CSS
1. Select the appropriate theme from the list above.
2. Inject the Google Fonts import into your CSS or HTML `<head>`.
3. Map the hex codes to CSS Custom Properties (`:root`).
4. Apply the variables to your structural elements (body background, text color, heading fonts).

### CSS Custom Properties Template
```css
:root {
  /* Using Deep Space as an example */
  --color-bg-primary: #000814;
  --color-bg-secondary: #001D3D;
  --color-accent-1: #003566;
  --color-accent-2: #FFC300;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: rgba(255, 255, 255, 0.7);

  --font-header: 'Orbitron', sans-serif;
  --font-body: 'Exo 2', sans-serif;
}

body {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  transition: background-color 0.3s ease, color 0.3s ease;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-header);
  color: var(--color-text-primary);
  font-weight: 700;
}

.button-primary {
  background-color: var(--color-accent-2);
  color: var(--color-bg-primary); /* High contrast */
  font-family: var(--font-body);
  font-weight: 600;
  border-radius: 8px;
}
```

### Google Fonts Import Snippet (Example)
```html
<!-- Deep Space Theme -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,100..900;1,100..900&family=Orbitron:wght@400..900&display=swap" rel="stylesheet">
```
*(Always use the variable font URL format when available to optimize performance and typography control).*

### Dark/Light Mode Switching Implementation
Use `color-mix()` and CSS variables to invert or adjust the palette dynamically:
```css
[data-theme="light"] {
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F0F0F0;
  --color-text-primary: #000814;
  /* Invert or slightly dim accents for light mode */
  --color-accent-2: color-mix(in srgb, #FFC300, black 10%); 
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    /* Apply light mode variables here */
  }
}
```

### Theme Switcher JavaScript Snippet
```javascript
const themeToggleBtn = document.getElementById('theme-toggle');
themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// On load
const savedTheme = localStorage.getItem('theme') || 
  (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
document.documentElement.setAttribute('data-theme', savedTheme);
```

## Usage Guide

### Which Theme for Which Industry/Purpose
- Choose **function over form** for dashboards (Slate & Steel, Arctic Noir).
- Choose **warmth and contrast** for consumer facing products (Sunset Boulevard, Terracotta Dreams).
- Maintain brand alignment: Tech brands benefit from cooler hues and sans-serifs, while lifestyle brands thrive on warmer tones and serif headlines.

### Theme Combination (Accent Mixing)
- You can borrow an accent color from a vibrant theme (like Pop Art Punch's `#FF003C`) and inject it into a muted theme (like Sage & Sand) to create a striking Call to Action (CTA) button. Limit mixing to one accent color to maintain harmony.

### Accessibility Check for Each Theme
- **Contrast Ratios**: The palettes listed are designed so that the lightest color (`#FFFFFF`) easily passes WCAG 2.2 AA (4.5:1 ratio) against the darkest background colors.
- Always verify contrast when placing text on `--color-accent-1` or `--color-accent-2`. Use a tool like axe-core or Lighthouse. If a button background is a bright accent (e.g., `#FFC300` in Deep Space), the text inside must be dark (`#000814`) to ensure legibility.
""")
