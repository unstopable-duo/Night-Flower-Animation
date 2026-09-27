# Glowing Flowers and Hearts

## Dedication

Created for Neo Naledi Mogoboya.  
Made by Roland Penn.

## Legal Notice and Terms of Use

This work was made by Roland Penn for Neo Naledi Mogoboya. Any use, distribution, reproduction, or modification of this code or visual assets without explicit acknowledgements of the creator (Roland Penn) is illegal and prohibited.

---

## Overview

A web-based visual animation featuring blooming night flowers, floating flat pink hearts, interactive stardust trails, drifting fireflies, and an animated cursive dedication. The scene combines pure CSS/SCSS keyframe choreography, hardware-accelerated HTML5 Canvas simulations, and dynamic Web Audio synthesis.

## Features

- Botanical Night Scene: Pure SCSS layered flower blooms, organic stems, and natural meadow grass swaying in the night breeze.
- Dedicated Calligraphy Reveal: Elegant cursive typography inscribed at the meadow base with a sweeping pink gradient reveal and soft starlight luminescence.
- Flat Pink Floating Hearts: Interactive HTML5 Canvas particle system rendering elegant flat pink hearts that drift upward with natural float physics and sparkle trails.
- Bioluminescent Fireflies: Background canvas layer rendering randomized blinking yellow-gold fireflies that drift gently across the horizon.
- Ethereal Ambient Soundtrack: Procedural Web Audio API synthesizer generating a continuous, looping romantic pad progression (Dbmaj9 -> Bbm9 -> Gbmaj7 -> Absus4) with drifting celesta chime droplets and smooth fade-in, without any AI or external audio files.
- Interactive Sound Effects: Harmonic celesta chimes, blooming flourishes, and pentatonic sparkle bursts upon user interaction.
- Performance Optimized: Lightweight 60 FPS rendering using GPU transform composition, requestAnimationFrame scheduling, and zero third-party canvas or audio libraries.

## Technology Stack

- React 19
- TypeScript
- Vite
- Sass (SCSS)
- HTML5 Canvas API
- Web Audio API
- Tailwind CSS

## Project Structure

```
├── index.html
├── metadata.json
├── package.json
├── src
│   ├── App.tsx
│   ├── components
│   │   ├── Firefly.tsx
│   │   ├── Flowers.tsx
│   │   └── HeartCanvas.tsx
│   ├── styles
│   │   └── flowers.scss
│   ├── types.ts
│   ├── utils
│   │   └── soundEngine.ts
│   ├── index.css
│   └── main.tsx
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

Node.js (version 18 or higher) and npm installed on your machine.

### Installation

Clone the repository and install dependencies:

```bash
npm install
```

### Development Server

Start the local development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

### Production Build

Create an optimized production build:

```bash
npm run build
```

Run TypeScript verification:

```bash
npm run lint
```
