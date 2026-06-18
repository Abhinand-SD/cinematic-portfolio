# Cinematic Portfolio

A cinematic developer portfolio built with **Next.js 15**, **GSAP**, **Three.js**, and **Framer Motion** — featuring a sticky video hero with a Three.js bokeh layer, scroll-reveal sections, and a stacked project showcase.

## ✨ Features

- **Cinematic video hero** — full-screen autoplaying video with an ambient blurred backdrop, warm/cool gradient grading, a sound toggle, and a floating Three.js bokeh particle layer.
- **Sticky-reveal scroll model** — the hero pins while each opaque section slides up and over it for a "page lifts away from the film" effect.
- **Scroll-driven animations** — GSAP timelines for the hero/intro and Framer Motion for per-section fade-ins and the per-character About reveal.
- **Stacked project showcase** — pinned, scaling project cards driven by scroll progress.
- **Accessible** — honors `prefers-reduced-motion` throughout.
- **Responsive** — fluid `clamp()` typography and mobile-tuned layouts.

## 🛠️ Tech Stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS, CSS Modules |
| Animation | GSAP + `@gsap/react`, Framer Motion |
| 3D / WebGL | Three.js |
| Icons | lucide-react (+ inline brand SVGs) |

## 🚀 Getting Started

```bash
# install dependencies
npm install

# run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```bash
# production build
npm run build
npm start
```

## 📁 Structure

```
src/
├── app/                 # App Router entry (layout, page, globals)
├── components/
│   ├── VideoIntro/      # Sticky cinematic video hero
│   ├── HeroContent/     # Animated hero overlay text
│   ├── CinematicLayer/  # Three.js bokeh particle canvas
│   ├── ScrollIndicator/ # Scroll-down cue
│   └── portfolio/       # About, Services, Projects, Contact + helpers
└── hooks/               # usePrefersReducedMotion
```

## 📝 Notes

Some personal content (About bio, Contact details, footer) is left as `TODO(abhinand)` placeholders — fill these in before publishing.

---

Built by Abhinand SD.
