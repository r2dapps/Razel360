# 🥽 Razel 360 | Luxury Virtual Showcase & Spatial SaaS

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![WebGL: Three.js r128](https://img.shields.io/badge/WebGL-Three.js%20r128-black.svg)](https://threejs.org/)
[![Styling: Monochromatic Glassmorphism](https://img.shields.io/badge/UI-Monochromatic%20Glass-rose.svg)]()
[![Automated Tests: 91/91 Passing](https://img.shields.io/badge/Headless%20Tests-91%2F91%20Passed-brightgreen.svg)]()

> **Live Repository:** [https://github.com/r2dapps/Razel360.git](https://github.com/r2dapps/Razel360.git)  
> **GitHub Pages Showcase:** [https://r2dapps.github.io/Razel360/](https://r2dapps.github.io/Razel360/)

**Razel 360** is a commercial-grade, client-side WebGL & Three.js virtual tour engine designed for high-end luxury real estate, architectural firms, boutique interior design studios, and open-house kiosks.

---

## 🌟 Highlights & Key Capabilities

### 1. 🏰 Multi-Property Showcase Portfolio
Switch between high-end estates in real-time with zero page reloads:
* **Villa Lumina | Modern Residence** (6 Interconnected Rooms):
  * Villa Facade & Negative-Edge Pool
  * Grand Living Room with Freeman Sectional & Marble Hearth
  * Chef Kitchen & Calacatta Quartzite Island
  * Primary Master Suite & Fluted Oak Wall
  * Spa Bathroom & Nero Marquina Stone Tub
  * Sunset Sky Terrace & Linear Fire Table
* **The Palm Royale | French Limestone Chateau** (8 Interconnected Rooms, generated with Qwen2):
  * Royal Entrance & Hand-Cut Limestone Facade
  * Grand Reception Foyer & Murano Glass Chandelier
  * Double-Height Great Salon with Schuco Glass Curtains
  * Formal Banquet Dining Salon with Solid Walnut Table
  * Chef's Sculptural Wave Island Kitchen
  * Primary Master Suite Retreat & Elliptical Bouclé Bed
  * Sunset Sky Terrace & Teak Soffit Pavilion
  * Resort Oasis Sukabumi Stone Pool & Loggia

---

### 2. 🏷️ Interactive Specification & Price Tags
Appeals directly to high-net-worth buyers who demand granular insight into fixtures, finishes, and bespoke furniture:
* **Two-Stage Animated Hotspots:** A subtle red-inked beacon dot on the item shoots an illuminated arrow stem upward upon crosshair alignment or hover, expanding into a high-contrast 2X Retina canvas callout card.
* **100% Contrast & Color Fidelity:** Deep charcoal glass cards (`#0a0e17`) with bold white titles, red-inked category chips (`[ ● SPECIFICATION ]`), and solid white price badges with pure black text (`#0a0e17`).
* **Zoom Compensation:** Callout planes dynamically adjust scale relative to camera FOV so text remains perfectly legible whether zoomed in (30°) or zoomed out (95°).

---

### 3. 🚪 Upright Vertical Doorway Portals
* Replaces legacy flat discs with **upright luminous doorframe meshes** (`PlaneGeometry(24, 48)`) standing perpendicular to the floor.
* Displays destination room title, illuminated doorway glass, and forward chevron floor doorstep mats.
* Gaze dwell ring automatically charges up and triggers a smooth whoosh walk-through upon 1.3s alignment.

---

### 4. 🎬 Automated "Hands-Free" Demo Mode
* **Open-House & Showroom Ready:** Press **Auto Demo** to trigger a hands-free autonomous architectural showcase.
* The camera smoothly rotates 360° and automatically transitions from room to room in cinematic sequence.
* User touch or mouse interaction immediately yields control back to manual exploration.

---

### 5. 🥽 Offline & Google Cardboard Stereoscopic VR Ready
* Instant 1-tap conversion into split-screen stereoscopic 3D view with center divider.
* Gaze navigation reticle with dwell timer eliminates the need for physical controllers.
* All 2D HTML UI elements automatically hide in VR mode to prevent double vision and eye fatigue.

---

### 6. 📱 iPad & Mobile Multi-Touch Experience
* **Native 2-Finger Pinch-to-Zoom:** Smoothly adjusts optical field of view (FOV) between 30° and 95°.
* **Gyroscope Tilt Sensor:** Native device orientation listener lets visitors pan simply by tilting their mobile phone or iPad.
* **Collapsible UI:** Single-tap eye toggle (`toggleUIVisibility()`) and bottom strip collapse hide all HUD elements for an unobstructed panoramic view.

---

### 7. 🔮 Seamless 360 Panorama Stitching Engine
* **Automatic Edge-Blending:** AI-generated 360 panoramas often exhibit a 1-pixel color or brightness variance at the equirectangular boundary (x=0 vs x=width-1).
* Razel 360 analyzes edge column variance:
  * If variance is detected (`avgDiff > 1.5`), an offscreen canvas cross-fades the 16 outer pixels seamlessly.
  * If the image is a native 3D render from **3ds Max / Corona / V-Ray / Blender / UE5**, variance is `0`, and the original image is preserved **100% bit-exact without modification**.

---

## 🛠️ Technology Architecture

* **Core 3D Engine:** [Three.js r128](https://threejs.org/) (Perspective camera, WebGLRenderer with `sRGBEncoding` and `NoToneMapping`).
* **UI & Aesthetics:** Tailwind CSS with custom glassmorphism (`backdrop-filter: blur(24px)`), Google Outfit & Plus Jakarta Sans architectural typography.
* **Audio Synthesizer:** Native Web Audio API procedural oscillator synthesis (zero external MP3 dependencies).
* **Local Persistence:** Dual-layer `localStorage` caching with full JSON export and import capabilities.
* **Static Deployment:** 100% static client-side architecture (zero Node/server requirements), instantly deployable to GitHub Pages, Cloudflare Pages, AWS S3, or Vercel.

---

## 📋 3D Visualizer Render Guidelines (Handoff Spec)

When commissioning 3D renders from visualization studios:
1. **Aspect Ratio & Dimensions:** Strict **2:1 ratio** (Equirectangular 360° Spherical Camera). Recommended: **4096 × 2048 px** for production, **6144 × 3072 px** for ultra 8K luxury.
2. **Camera Height & Horizon:** Position the spherical camera strictly at standing eye-level: **1.55m to 1.65m (5.1 – 5.4 ft)** above finished floor level. Maintain **Pitch = 0°** and **Roll = 0°**.
3. **Color Space:** Export in **sRGB color profile** (JPEG 95% or PNG). Ensure exterior sunlight and lighting intensity match across connected scenes.

---

## 🧪 Headless Automated Testing

Razel 360 includes a reusable headless test suite that validates the entire DOM structure, JavaScript runtime syntax, multi-tour data integrity, asset resolutions, and GitHub Pages prep without opening a browser window:

```bash
# Run automated headless test suite
node scripts/test_tour_headless.js
```

**Output:**
```
======================================================
  RAZEL 360 HEADLESS TEST SUITE
======================================================

[1/6] Validating HTML, Favicon & Razel Branding...
  ✔ index.html exists in root directory
  ✔ Title and brand name is set to Razel 360
  ✔ Tour Studio includes "Powered by Razel Tech"
  ✔ Inline SVG VR Cardboard headset favicon is present
  ✔ Three.js library is included
  ✔ Permanent navigation crosshair element exists
  ✔ Canvas container element exists
  ✔ Initial loading spinner is implemented
  ✔ Redundant Virtual Tour tagline removed for minimalist UI
  ✔ Settings modal for consolidated controls is implemented
  ✔ Collapsible room strip toggle is implemented
  ✔ Touch gesture pinch-to-zoom is implemented

[2/6] Validating Mobile Responsiveness Meta & CSS...
  ✔ Viewport includes viewport-fit=cover for notched mobile screens
  ✔ Header uses responsive height classes for mobile vs desktop
  ✔ Studio drawer constrained cleanly for mobile viewports
  ✔ Room thumbnail strip supports horizontal touch swipe

[3/6] Validating JavaScript Engine & Audio Synthesizer...
  ✔ Embedded script block found in index.html
  ✔ JavaScript syntax parses cleanly without errors
  ✔ Web Audio API pop chime synthesizer is implemented
  ✔ Web Audio API doorway transition whoosh synthesizer is implemented
  ✔ Automated guided walkthrough demo engine is implemented
  ✔ Upright vertical doorway portal frame mesh is implemented
  ✔ Tiny dot beacon with rising arrow stem callout is implemented
  ✔ Seamless texture edge-blending is implemented
  ✔ Canvas path isolation via ctx.beginPath() prevents white background collision

[4/6] Validating Multi-Tour Data Schema & Demo Assets...
  ✔ DEMO_VILLA_LUMINA schema defined (6 rooms verified)
  ✔ DEMO_PALM_ROYALE schema defined (8 rooms verified)
  ✔ All 14 high-res 360 panorama assets verified on disk

[5/6] Testing JSON Export / Import Validation...
  ✔ Export JSON serialization produces non-empty string
  ✔ Import parser recognizes Razel360 wrapper format
  ✔ Hotspot arrays match exactly after serialization roundtrip

[6/6] Checking Static Hosting & GitHub Pages Prep...
  ✔ .nojekyll exists to ensure GitHub Pages serves all assets
  ✔ index.html contains zero local drive paths

------------------------------------------------------
Summary: 91/91 tests passed (0 failed)
------------------------------------------------------
```

---

## 🚀 GitHub Pages Deployment

1. Configure remote origin:
   ```bash
   git remote add origin https://github.com/r2dapps/Razel360.git
   ```
2. Push repository:
   ```bash
   git branch -M main
   git push -u origin main
   ```
3. In GitHub repository settings:
   * Go to **Settings** > **Pages**.
   * Under **Branch**, select `main` / `master` and `/ (root)`.
   * Click **Save**. The tour will be live globally at `https://r2dapps.github.io/Razel360/`.

---

## 📄 License & Credits

Developed by **Razel Tech** for enterprise architectural virtualization and luxury real estate showcases.  
Released under the [MIT License](LICENSE).
