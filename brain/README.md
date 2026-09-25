# 🧠 Lumina 360 Repository Brain & Architecture

Lumina 360 is a high-performance, client-side WebGL & Three.js virtual tour platform tailored for luxury architectural real estate showcases, commercial properties, and VR walkthroughs.

---

## 🏛️ System Architecture

### 1. Viewport & WebGL Canvas Lifecycle
* **100% Full-Bleed Pinned Layout:** The 3D viewport canvas is pinned to `fixed inset-0 w-full h-full z-0`. Sidebars, drawers, and HUD elements float over the canvas with `backdrop-filter: blur(24px)` glassmorphism. This eliminates viewport resizing delays and permanently prevents black border anomalies.
* **Aspect Ratio & Resize Observer:** A `ResizeObserver` on `#canvas-container` coupled with `window.onresize` guarantees instantaneous recalculation of `camera.aspect` and WebGL buffer sizing.
* **Color Pipeline:** Explicit `THREE.sRGBEncoding` output with `THREE.NoToneMapping` ensures architectural textures maintain 1:1 exposure and color calibration without ambient wash or gamma dulling.

---

## 🎯 Navigation & Interaction Models

### 1. Always-Visible Center Crosshair Reticle
* Located in `#crosshair-reticle` with targeting notches, center dot, and dwell ring.
* Provides immediate intuitive feedback in both desktop mode and VR Cardboard mode.
* Raycasts from viewport center `(0, 0)`:
  * Over doorways: Dwell ring begins filling and reticle dot scales up.
  * Over item beacons: Triggers animated leader stem and billboard card.
  * Direct click: Clicking anywhere while hovering a doorway teleports immediately without waiting for dwell completion.

### 2. Animated Arrow Stem & Pop-up Callouts
* **Structure:**
  1. **Beacon Pin (`0, 0, 0`):** Sits directly on furniture or architectural surface.
  2. **Leader Stem (`CylinderGeometry`):** Originates at beacon and shoots upward.
  3. **Arrowhead (`ConeGeometry`):** Ascends at the tip of the stem.
  4. **Billboard Card (`PlaneGeometry`):** 2X Retina canvas badge.
* **Two-Stage Animation:**
  * **Stage 1 (0 to 45%):** Stem line grows upward (`scale.y: 0 -> 1`), and the arrowhead ascends to the tip.
  * **Stage 2 (40% to 100%):** Callout card expands outward with spring ease-out physics (`scale: 0.1 -> 1.0`, `opacity: 0 -> 1.0`).
  * **Dismissal:** When crosshair moves away, card collapses back into arrow tip and stem line retracts down into beacon pin.
* **Zoom Compensation:** Card dimensions dynamically compensate for `camera.fov` changes to ensure crystal-clear readability whether zoomed in or out.

---

## 📁 Multi-Tour & Data Schemas

### Tour Data Object
```json
{
  "id": "tour_villa_lumina",
  "title": "Villa Lumina | Modern Residence",
  "location": "Beverly Hills, CA",
  "price": "$14,500,000",
  "heroImage": "./assets/demo/exterior.jpg",
  "scenes": [
    {
      "id": "scene_exterior",
      "name": "Villa Facade & Pool",
      "imageSrc": "./assets/demo/exterior.jpg",
      "hotspots": [
        {
          "id": "hs_ext_to_living",
          "type": "portal",
          "targetSceneId": "scene_living",
          "x": 160, "y": -45, "z": -360
        },
        {
          "id": "callout_pool",
          "type": "info",
          "title": "Negative-Edge Reflection Pool",
          "tag": "EXTERIOR FEATURE",
          "price": "$280,000",
          "description": "Architectural heated saltwater pool with honed basalt coping.",
          "x": 80, "y": -130, "z": -350
        }
      ]
    }
  ]
}
```

---

## 🎨 Aesthetic & Styling Guidelines

* **Monochromatic Frosted Glass:** All panels use `rgba(18, 22, 32, 0.75)` with `backdrop-filter: blur(24px)` and subtle `rgba(255, 255, 255, 0.12)` borders.
* **No Saturated Blues or Greens:** Badges and pills use neutral frosted silver/white glass with crisp contrast typography.
* **Typography:** `Plus Jakarta Sans` for body text and specifications, `Outfit` for display headlines and prices.

---

## 🧪 Automated Testing

Run the headless automated test suite anytime with:
```bash
node scripts/test_tour_headless.js
```
The test suite validates:
* HTML structure and required UI DOM hooks.
* JavaScript syntax without launching a browser.
* Multi-tour schema integrity and 6-room demo link verification.
* Disk existence and byte size of all 360 panorama assets.
* JSON export and import serialization roundtrips.
* GitHub Pages compatibility (no local drive paths, `.nojekyll` present).

---

## 🚀 GitHub Pages Deployment

This repository is 100% static and ready for instant deployment:
1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "feat: Lumina 360 Virtual Tour Showcase"
   ```
2. Push to GitHub and enable **GitHub Pages** from `Settings -> Pages -> Deploy from branch (main / root)`.
3. The `.nojekyll` file in the root directory ensures GitHub Pages routes all images in `assets/` without Jekyll filter interference.
