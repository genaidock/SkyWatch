---
name: building-native-ui
description: Complete guide for building beautiful apps with Expo Router. Covers fundamentals, styling, components, navigation, animations, patterns, and native tabs.
risk: unknown
source: https://github.com/expo/skills/tree/main/plugins/expo/skills/building-native-ui
source_repo: expo/skills
source_type: official
date_added: 2026-07-01
license: MIT
license_source: https://github.com/expo/skills/blob/main/LICENSE
---

# Expo UI Guidelines
## When to Use

Use this skill when you need complete guide for building beautiful apps with Expo Router. Covers fundamentals, styling, components, navigation, animations, patterns, and native tabs.


## References

Consult these resources as needed:

```
references/
  animations.md          Reanimated: entering, exiting, layout, scroll-driven, gestures
  controls.md            Native iOS: Switch, Slider, SegmentedControl, DateTimePicker, Picker
  form-sheet.md          Form sheets in expo-router: configuration, footers and background interaction.
  gradients.md           CSS gradients via experimental_backgroundImage (New Arch only)
  icons.md               SF Symbols via expo-image (sf: source), names, animations, weights
  media.md               Camera, audio, video, and file saving
  route-structure.md     Route conventions, dynamic routes, groups, folder organization
  search.md              Search bar with headers, useSearch hook, filtering patterns
  storage.md             SQLite, AsyncStorage, SecureStore
  tabs.md                NativeTabs, migration from JS tabs, iOS 26 features
  toolbar-and-headers.md Stack headers and toolbar buttons, menus, search (iOS only)
  visual-effects.md      Blur (expo-blur) and liquid glass (expo-glass-effect)
  webgpu-three.md        3D graphics, games, GPU visualizations with WebGPU and Three.js
  zoom-transitions.md    Apple Zoom: fluid zoom transitions with Link.AppleZoom (iOS 18+)
```

## Running the App

**CRITICAL: Always try Expo Go first before creating custom builds.**

Most Expo apps work in Expo Go without any custom native code. Before running `npx expo run:ios` or `npx expo run:android`:

1. **Start with Expo Go**: Run `npx expo start` and scan the QR code with Expo Go
2. **Check if features work**: Test your app thoroughly in Expo Go
3. **Only create custom builds when required** - see below

### When Custom Builds Are Required

You need `npx expo run:ios/android` or `eas build` ONLY when using:

- **Local Expo modules** (custom native code in `modules/`)
- **Apple targets** (widgets, app clips, extensions via `@bacons/apple-targets`)
- **Third-party native modules** not included in Expo Go
- **Custom native configuration** that can't be expressed in `app.json`

### When Expo Go Works

Expo Go supports a huge range of features out of the box:

- All `expo-*` packages (camera, location, notifications, etc.)
- Expo Router navigation
- Most UI libraries (reanimated, gesture handler, etc.)
- Push notifications, deep links, and more

**If you're unsure, try Expo Go first.** Creating custom builds adds complexity, slower iteration, and requires Xcode/Android Studio setup.

## Code Style

- Be cautious of unterminated strings. Ensure nested backticks are escaped; never forget to escape quotes correctly.
- Always use import statements at the top of the file.
- Always use kebab-case for file names, e.g. `comment-card.tsx`
- Always remove old route files when moving or restructuring navigation
- Never use special characters in file names
- Configure tsconfig.json with path aliases, and prefer aliases over relative imports for refactors.

## Routes

See `./references/route-structure.md` for detailed route conventions.

- Routes belong in the `app` directory.
- Never co-locate components, types, or utilities in the app directory. This is an anti-pattern.
- Ensure the app always has a route that matches "/", it may be inside a group route.

## Library Preferences

- Never use modules removed from React Native such as Picker, WebView, SafeAreaView, or AsyncStorage
- Never use legacy expo-permissions
- `expo-audio` not `expo-av`
- `expo-video` not `expo-av`
- `expo-image` with `source="sf:name"` for SF Symbols, not `expo-symbols` or `@expo/vector-icons`
- `react-native-safe-area-context` not react-native SafeAreaView
- `process.env.EXPO_OS` not `Platform.OS`
- `React.use` not `React.useContext`
- `expo-image` Image component instead of intrinsic element `img`
- `expo-glass-effect` for liquid glass backdrops
- `Color` from `expo-router` for native semantic colors, not raw `PlatformColor` (type-safe, auto-adapts to light/dark)
- In SDK 56+, never import from `@react-navigation/*` directly — use `expo-router/react-navigation` instead (covers `@react-navigation/native`, `/core`, `/elements`, `/routers`)

## Responsiveness

- Always wrap root component in a scroll view for responsiveness
- Use `<ScrollView contentInsetAdjustmentBehavior="automatic" />` instead of `<SafeAreaView>` for smarter safe area insets
- `contentInsetAdjustmentBehavior="automatic"` should be applied to FlatList and SectionList as well
- Use flexbox instead of Dimensions API
- ALWAYS prefer `useWindowDimensions` over `Dimensions.get()` to measure screen size

## Behavior

- Use expo-haptics conditionally on iOS to make more delightful experiences
- Use views with built-in haptics like `<Switch />` from React Native and `@react-native-community/datetimepicker`
- When a route belongs to a Stack, its first child should almost always be a ScrollView with `contentInsetAdjustmentBehavior="automatic"` 

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
