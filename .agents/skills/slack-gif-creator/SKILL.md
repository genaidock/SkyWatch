---
name: slack-gif-creator
description: "A toolkit providing utilities and knowledge for creating animated GIFs optimized for Slack."
risk: unknown
source: community
date_added: "2026-02-27"
---

# Slack GIF Creator

A toolkit providing utilities and knowledge for creating animated GIFs optimized for Slack.

## Slack Requirements

**Dimensions:**
- Emoji GIFs: 128x128 (recommended)
- Message GIFs: 480x480

**Parameters:**
- FPS: 10-30 (lower is smaller file size)
- Colors: 48-128 (fewer = smaller file size)
- Duration: Keep under 3 seconds for emoji GIFs

## Core Workflow

```python
from core.gif_builder import GIFBuilder
from PIL import Image, ImageDraw

# 1. Create builder
builder = GIFBuilder(width=128, height=128, fps=10)

# 2. Generate frames
for i in range(12):
    frame = Image.new('RGB', (128, 128), (240, 248, 255))
    draw = ImageDraw.Draw(frame)

    # Draw your animation using PIL primitives
    # (circles, polygons, lines, etc.)

    builder.add_frame(frame)

# 3. Save with optimization
builder.save('output.gif', num_colors=48, optimize_for_emoji=True)
```

## Drawing Graphics

### Working with User-Uploaded Images
If a user uploads an image, consider whether they want to:
- **Use it directly** (e.g., "animate this", "split this into frames")
- **Use it as inspiration** (e.g., "make something like this")

Load and work with images using PIL:
```python
from PIL import Image

uploaded = Image.open('file.png')
# Use directly, or just as reference for colors/style
```

### Drawing from Scratch
When drawing graphics from scratch, use PIL ImageDraw primitives:

```python
from PIL import ImageDraw

draw = ImageDraw.Draw(frame)

# Circles/ovals
draw.ellipse([x1, y1, x2, y2], fill=(r, g, b), outline=(r, g, b), width=3)

# Stars, triangles, any polygon
points = [(x1, y1), (x2, y2), (x3, y3), ...]
draw.polygon(points, fill=(r, g, b), outline=(r, g, b), width=3)

# Lines
draw.line([(x1, y1), (x2, y2)], fill=(r, g, b), width=5)

# Rectangles
draw.rectangle([x1, y1, x2, y2], fill=(r, g, b), outline=(r, g, b), width=3)
```

**Don't use:** Emoji fonts (unreliable across platforms) or assume pre-packaged graphics exist in this skill.

### Making Graphics Look Good

Graphics should look polished and creative, not basic. Here's how:

**Use thicker lines** - Always set `width=2` or higher for outlines and lines. Thin lines (width=1) look choppy and amateurish.

**Add visual depth**:
- Use gradients for backgrounds (`create_gradient_background`)
- Layer multiple shapes for complexity (e.g., a star with a smaller star inside)

**Make shapes more interesting**:
- Don't just draw a plain circle - add highlights, rings, or patterns
- Stars can have glows (draw larger, semi-transparent versions behind)
- Combine multiple shapes (stars + sparkles, circles + rings)

**Pay attention to colors**:
- Use vibrant, complementary colors
- Add contrast (dark outlines on light shapes, light outlines on dark shapes)
- Consider the overall composition

**For complex shapes** (hearts, snowflakes, etc.):
- Use combinations of polygons and ellipses
- Calculate points carefully for symmetry
- Add details (a heart can have a highlight curve, snowflakes have intricate branches)

Be creative and detailed! A good Slack GIF should look polished, not like placeholder graphics.

## Available Utilities

### GIFBuilder (`core.gif_builder`)
Assembles frames and optimizes for Slack:
```python
builder = GIFBuilder(width=128, height=128, fps=10)
builder.add_frame(frame)  # Add PIL Image
builder.add_frames(frames)  # Add list of fr

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
