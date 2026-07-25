---
name: 3d-web-experience
description: Guidelines and instructions for building interactive 3D web experiences using technologies like WebGL, Three.js, or React Three Fiber (Updated for 2026).
category: frontend
risk: medium
tags: [3d, webgpu, threejs, react-three-fiber, frontend, animation]
---

# Interactive 3D Web Experiences (2026 Edition)

Building production-grade 3D web experiences in 2026 requires balancing high visual fidelity with strict performance constraints, shifting towards GPU-driven architectures like WebGPU.

## 1. Decision Tree: Choosing Your Tech Stack

- **Vanilla WebGL/WebGPU**: Use ONLY when building a custom rendering engine or needing absolute raw performance with minimum payload.
- **Three.js (r171+)**: Use for vanilla JavaScript/TypeScript projects. WebGPU is now the standard backend.
- **React Three Fiber (R3F)**: Default choice for React applications. Brings component-driven architecture and a massive ecosystem (`drei`, `rapier`, `postprocessing`) to Three.js. Essential for complex state-driven apps.
- **Babylon.js**: Use for complex games, architectural visualizations, or when you need a robust, built-in physics engine out-of-the-box.

## 2. WebGPU & Scene Setup Patterns (Three.js)

Always aim for WebGPU first, but provide a graceful fallback.

```javascript
import * as THREE from 'three';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';

// Setup Renderer with WebGPU and fallback
const renderer = new WebGPURenderer({
  canvas: document.querySelector('#webgl-canvas'),
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2 for performance
renderer.toneMapping = THREE.ACESFilmicToneMapping;

// Scene & Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 5);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
```

## 3. Performance & Production Discipline

Performance is critical. Target 60 FPS on mid-range mobile devices.

### On-Demand Rendering (R3F)
If the scene is static, don't drain the battery. Use frameloop="demand".
```jsx
<Canvas frameloop="demand">
  <Scene />
</Canvas>
```

### Instanced Meshes & Draw Calls
Never create thousands of separate meshes. Use `THREE.InstancedMesh` or `@react-three/drei`'s `<Instances>`.

```jsx
import { Instances, Instance } from '@react-three/drei'

<Instances limit={1000} range={1000}>
  <boxGeometry />
  <meshStandardMaterial />
  {data.map((props, i) => (
    <Instance key={i} {...props} />
  ))}
</Instances>
```

### Resource Disposal
Three.js does not auto-garbage-collect GPU resources. You MUST manually `.dispose()` geometries, materials, and textures when unmounting to prevent tab crashes. (R3F handles this mostly automatically, but vanilla Three.js requires strict management).

## 4. Modern Shading: TSL (Three.js Shading Language)

Move away from raw GLSL. TSL (introduced for WebGPU) allows you to describe GPU operations directly in JS.

```javascript
import { color, sin, time, positionLocal } from 'three/tsl';

// Node material using TSL
const material = new THREE.MeshBasicNodeMaterial();
material.colorNode = color(0xff0000).mul(sin(time).add(1.0).div(2.0));
```

## 5. Animation Patterns

When using R3F, keep animations in `useFrame` and avoid React `setState` in the loop.

```jsx
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

function RotatingCube() {
  const meshRef = useRef()
  
  useFrame((state, delta) => {
    // Direct mutation, NO setState
    meshRef.current.rotation.x += delta
  })
  
  return <mesh ref={meshRef}><boxGeometry /></mesh>
}
```
*For complex state management, use Zustand, which pairs natively with R3F.*

## 6. Asset Loading

Use `GLTFLoader` with `DRACOLoader` for compressed geometry. Always compress textures (KTX2/Basis).

```jsx
// R3F simplifies this with drei
import { useGLTF } from '@react-three/drei'

function Model() {
  const { nodes, materials } = useGLTF('/model-draco.glb')
  return <mesh geometry={nodes.Cube.geometry} material={materials.Main} />
}
useGLTF.preload('/model-draco.glb')
```

## 7. Common Effects (Post-processing)

Use `RenderPipeline` (Three r183+) or `@react-three/postprocessing`.

```jsx
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing'

function Effects() {
  return (
    <EffectComposer>
      <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
      <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.9} height={300} />
    </EffectComposer>
  )
}
```

## 8. Anti-patterns to Avoid

- ❌ **`setState` inside `useFrame`**: Triggers massive React re-renders. Mutate refs instead.
- ❌ **Ignoring device pixel ratio**: Renders look terrible on high-DPI screens, but capping at `2` is necessary so it doesn't melt the GPU.
- ❌ **Treating prototypes as production**: AI-generated code or quick demos often ignore draw calls. Always do a "production pass" using SpectorJS.
- ❌ **Raw GLSL for new projects**: Shift to TSL to be WebGPU-compatible.
- ❌ **Continuous rendering for static scenes**: Use `frameloop="demand"` if nothing is moving.
