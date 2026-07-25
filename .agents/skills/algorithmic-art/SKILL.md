---
name: algorithmic-art
description: "Algorithmic philosophies are computational aesthetic movements that are then expressed through code. Output .md files (philosophy), .html files (interactive viewer), and .js files (generative algorithms)."
risk: unknown
source: community
date_added: "2026-02-27"
---

Algorithmic philosophies are computational aesthetic movements that are then expressed through code. Output .md files (philosophy), .html files (interactive viewer), and .js files (generative algorithms).

This happens in two steps:
1. Algorithmic Philosophy Creation (.md file)
2. Express by creating p5.js generative art (.html + .js files)

First, undertake this task:

## ALGORITHMIC PHILOSOPHY CREATION

To begin, create an ALGORITHMIC PHILOSOPHY (not static images or templates) that will be interpreted through:
- Computational processes, emergent behavior, mathematical beauty
- Seeded randomness, noise fields, organic systems
- Particles, flows, fields, forces
- Parametric variation and controlled chaos

### THE CRITICAL UNDERSTANDING
- What is received: Some subtle input or instructions by the user to take into account, but use as a foundation; it should not constrain creative freedom.
- What is created: An algorithmic philosophy/generative aesthetic movement.
- What happens next: The same version receives the philosophy and EXPRESSES IT IN CODE - creating p5.js sketches that are 90% algorithmic generation, 10% essential parameters.

Consider this approach:
- Write a manifesto for a generative art movement
- The next phase involves writing the algorithm that brings it to life

The philosophy must emphasize: Algorithmic expression. Emergent behavior. Computational beauty. Seeded variation.

### HOW TO GENERATE AN ALGORITHMIC PHILOSOPHY

**Name the movement** (1-2 words): "Organic Turbulence" / "Quantum Harmonics" / "Emergent Stillness"

**Articulate the philosophy** (4-6 paragraphs - concise but complete):

To capture the ALGORITHMIC essence, express how this philosophy manifests through:
- Computational processes and mathematical relationships?
- Noise functions and randomness patterns?
- Particle behaviors and field dynamics?
- Temporal evolution and system states?
- Parametric variation and emergent complexity?

**CRITICAL GUIDELINES:**
- **Avoid redundancy**: Each algorithmic aspect should be mentioned once. Avoid repeating concepts about noise theory, particle dynamics, or mathematical principles unless adding new depth.
- **Emphasize craftsmanship REPEATEDLY**: The philosophy MUST stress multiple times that the final algorithm should appear as though it took countless hours to develop, was refined with care, and comes from someone at the absolute top of their field. This framing is essential - repeat phrases like "meticulously crafted algorithm," "the product of deep computational expertise," "painstaking optimization," "master-level implementation."
- **Leave creative space**: Be specific about the algorithmic direction, but concise enough that the next Claude has room to make interpretive implementation choices at an extremely high level of craftsmanship.

The philosophy must guide the next version to express ideas ALGORITHMICALLY, not through static images. Beauty lives in the process, not the final frame.

### PHILOSOPHY EXAMPLES

**"Organic Turbulence"**
Philosophy: Chaos constrained by natural law, order emerging from disorder.
Algorithmic expression: Flow fields driven by layered Perlin noise. Thousands of particles following vector forces, their trails accumulating into organic density maps. Multiple noise octaves create turbulent regions and calm zones. Color emerges from velocity and density - fast particles burn bright, slow ones fade to shadow. The algorithm runs until equilibrium - a meticulously tuned balance where every parameter was refined through countless iterations by a master of computational aesthetics.

**"Quantum Harmonics"**
Philosophy: Discrete entities exhibiting wave-like interference patterns.
Algorithmic expression: Particles initialized on a grid, each carrying a phase value that evolves through sine waves. When particles are near, their phases interfere - constructive interference creates bright nodes, destructive creates voids. Simple harmonic motion generates complex emergent mandalas. The result of painstaking frequency calibration where every ratio was carefully chosen to produce resonant beauty.

**"Recursive Whispers"**
Philosophy: Self-similarity across scales, infinite depth in finite space.
Algorithmic expression: Branching structures that subdivide recursively. Each branch slightly randomized but constrained by golden ratios. L-systems or recursive subdivision generate tree-like forms that feel both mathematical and organic. Subtle noise perturbations break perfect symmetry. Line weights diminish with each recursion level. Every branching angle the product of deep mathematical exploration.

**"Field Dynamics"**
Philosophy: Invisible forces made visible through their effects on matter.
Algorithmic expression: Vector fields constructed from mathematical functions or noise. Particles born at edges, flowing along field lines, dying when they reach equilibrium or boundaries. Multiple fields can attract, repel, or rotate particles. The visualization shows only the traces - ghost-like evidence of invisible forces. A computational dance meticulously choreographed through force balance.

**"Stochastic Crystallization"**
Philosophy: Random processes crystallizing into ordered structures.
Algorithmic expression: Randomized circle packing or Voronoi tessellation. Start with random points, let them evolve through relaxation algorithms. Cells push apart until equilibrium. Color based on cell size, neighbor count, or distance from center. The organic tiling that emerges feels both random and inevitable. Every seed produces unique crystalline beauty - the mark of a master-level generative algorithm.

*These are condensed examples. The actual algorithmic philosophy should be 4-6 substantial paragraphs.*

### ESSENTIAL PRINCIPLES
- **ALGORITHMIC PHILOSOPHY**: Creating a computational worldview to be expressed through code
- **PROCESS OVER PRODUCT**: Always emphasize that beauty emerges from the algorithm's execution - each run is unique
- **PARAMETRIC EXPRESSION**: Ideas communicate through mathematical relationships, forces, behaviors - not static composition
- **ARTISTIC FREEDOM**: The next Claude interprets the philosophy algorithmically - provide creative implementation room
- **PURE GENERATIVE ART**: This is about making LIVING ALGORITHMS, not static images with randomness
- **EXPERT CRAFTSMANSHIP**: Repeatedly emphasize the final algorithm must feel meticulously crafted, refined through countless iterations, the product of deep expertise by someone at the absolute top of their field in computational aesthetics

**The algorithmic philosophy should be 4-6 paragraphs long.** Fill it with poetic computational philosophy that brings together the intended vision. Avoid repeating the same points. Output this algorithmic philosophy as a .md file.

---

## DEDUCING THE CONCEPTUAL SEED

**CRITICAL STEP**: Before implementing the algorithm, identify the subtle conceptual thread from the original request.

**THE ESSENTIAL PRINCIPLE**:
The concept is a **subtle, niche reference embedded within the algorithm itself** - not always literal, always sophisticated. Someone familiar with the subject should feel it intuitively, while others simply experience a masterful generative composition. The algorithmic philosophy provides the computational language. The deduced concept provides the soul - the quiet conceptual DNA woven invisibly into parameters, behaviors, and emergence patterns.

This is **VERY IMPORTANT**: The reference must be so refined that it enhances the work's depth without announcing itself. Think like a jazz musician quoting another song through algorithmic harmony - only those who know will catch it, but everyone appreciates the beauty.

---

## p5.js IMPLEMENTATION GUIDE (2.0+ & WebGPU)

As of mid-2026, p5.js 2.x introduces powerful new paradigms, centering around `async` workflows, modern color spaces, and high-performance WebGPU capabilities. 

### p5.js 2.0 New Features
- **WebGPU & Compute Shaders:** WebGPU mode allows for parallel compute processing natively in the browser via `p5.strands` or WGSL.
- **New Color Spaces:** Native support for `OKLab` and `LAB` color spaces allows for perceptually uniform color mixing.
- **Variable Fonts:** Full integration for variable fonts, allowing parameter-driven typography.
- **Asynchronous Workflow:** Key functions like `createCanvas` in WebGPU mode, `loadPixels()`, and `get()` now return promises, requiring an `async setup()` and `await`.

### Project Setup
**CDN Setup (Modern):**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/2.3.0/p5.js"></script>
<!-- Required for WebGPU capabilities -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/2.3.0/addons/p5.webgpu.js"></script>
```

**Canvas Setup Best Practices:**
```javascript
async function setup() {
  // Use async for modern WebGPU canvas setup
  await createCanvas(windowWidth, windowHeight, WEBGPU);
  colorMode(OKLAB);
  pixelDensity(displayDensity());
}
```

**Animation Loop Patterns:**
- `frameRate(60)` for smooth simulation.
- `noLoop()` + `redraw()` for static works that only recalculate on interaction.
- Track state using a `lastUpdate` timestamp to decouple animation from framerate.

## CORE ALGORITHMS LIBRARY

Implement these algorithms as the core engine for your generative expressions:

### Flow Fields (Perlin Noise Vector Fields)
A grid of angles defined by `noise(x, y)`. Particles query the grid and move according to the underlying vector.
```javascript
// Calculate vector angle based on Perlin noise
let angle = noise(x * scale, y * scale, zOffset) * TWO_PI * 4;
let v = p5.Vector.fromAngle(angle);
particle.applyForce(v);
```

### Reaction-Diffusion Systems
Simulating the distribution of two chemicals reacting and diffusing over time, generating organic stripes and spots (Turing patterns). Best implemented using WebGPU compute shaders for real-time 1080p execution.

### Cellular Automata
Beyond Conway's Game of Life, implement continuous cellular automata (Lenia) where states are floating-point values and neighborhoods are defined by radial gradients, creating emergent, lifelike gliders and breathers.

### L-Systems and Branching
Recursive string rewriting systems. Useful for generating trees, plants, and fractal geometries.
- **Axiom:** 'X'
- **Rules:** 'X' -> 'F+[[X]-X]-F[-FX]+X', 'F' -> 'FF'

### Strange Attractors
Plotting systems of differential equations (e.g., Lorenz, Clifford) in phase space. The result is a mathematically precise, mesmerizing web of chaotic orbits.
```javascript
// Clifford Attractor formula
let nextX = sin(a * y) + c * cos(a * x);
let nextY = sin(b * x) + d * cos(b * y);
```

### Voronoi Diagrams & Recursive Subdivision
Subdividing space based on distance to seed points (Voronoi), or recursively splitting rectangles to form Mondrian-like grids or complex architectural layouts.

### Stippling Algorithms
Weighted Voronoi Stippling to generate point-based images where dot density represents image darkness.

## COLOR SYSTEMS FOR GENERATIVE ART

- **OKLab Color Space:** Use `colorMode(OKLAB, 1, 1, 1)` to generate perceptually smooth gradients without the "muddy" transitions found in RGB.
- **Palette Generation:** Use cosine-based palette generation (`color(a + b*cos(2*PI*(c*t + d)))`) to create infinite, perfectly harmonious color palettes mathematically.
- **Noise-Driven Evolution:** Map 1D or 2D noise to hue and saturation to create organic color shifts over time or space.

## PERFORMANCE OPTIMIZATION

- **WebGPU Mode:** The most important optimization. Port heavy particle systems to WebGPU compute shaders for 10x-100x performance gains.
- **Pixel Array Manipulation:** When reading/writing pixels, ALWAYS use `loadPixels()` and manipulate the `pixels[]` array directly instead of using `get()` and `set()`. Remember to `await loadPixels()` in p5.js 2.x.
- **Off-screen Buffers:** Use `createGraphics()` to draw static background elements once, then `image(buffer, 0, 0)` in `draw()`, saving the main canvas for dynamic elements.
- **Caching:** Pre-calculate sine/cosine tables or noise arrays if queried thousands of times per frame.

## EXPORT & DISTRIBUTION

- **High-Res Export:** Override `pixelDensity()` or use `scale()` inside a large `createGraphics` buffer to generate 4K/8K images for print.
- **SVG Output:** Use the `p5.svg` library to render vector geometries for pen plotters.
- **fxhash Integration:** Use `$fx.rand()` instead of p5's `random()` to ensure deterministic minting for on-chain generative art.
- **Animation Export:** Integrate `CCapture.js` to record frames and encode them into MP4 or GIF directly from the browser.

## INTERACTIVE CONTROLS

**Tweakpane Integration:**
Always provide a UI for parameter tweaking. Tweakpane is the modern standard for generative art interfaces.
```javascript
const pane = new Tweakpane.Pane();
const PARAMS = { density: 50, speed: 0.1 };
pane.addInput(PARAMS, 'density', { min: 10, max: 100 });
pane.addInput(PARAMS, 'speed', { min: 0.01, max: 0.5 });
```
Bind these parameters directly to the algorithmic constants to create a "living" artwork that the user can perform. Use MIDI input via the Web MIDI API for live A/V performances.
