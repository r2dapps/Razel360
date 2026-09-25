# 📐 3D Architectural Visualizer Rendering Workflow

Hand this specification sheet directly to your 3D designers and visualizers (3ds Max / Corona / V-Ray / Blender / Unreal Engine 5).

---

## 1. Camera Specifications

| Parameter | Setting | Rationale |
| :--- | :--- | :--- |
| **Camera Type** | Equirectangular (Spherical 360°) | Required by Three.js sphere UV projection |
| **Aspect Ratio** | **Strictly 2:1** | Prevents horizontal or vertical pole stretching |
| **Resolution** | **4096 × 2048 px** (Standard) or **6144 × 3072 px** (Ultra 8K) | Crisp zoom inspection without memory crashes |
| **Camera Height** | **1.55m to 1.65m** (5.1 – 5.4 ft) | Mimics true standing eye level |
| **Pitch & Roll** | **0.0° (Level Horizon)** | Crucial: Tilted cameras cause vertigo in VR |

---

## 2. Lighting & Multi-Room Continuity

When rendering adjacent rooms of the same residence:
1. **Consistent Sun Direction:** The exterior sun angle and elevation must remain identical across all rooms.
2. **Exposure Balance:** Keep interior and exterior exposure consistent between adjacent rooms so transitions feel seamless.
3. **Doorways & Portals:** Keep connecting doors open or ajar so the next room is visible in the background, creating natural depth cues for doorway portals.

---

## 3. Export Formats

* **Color Space:** sRGB (Standard Gamma 2.2)
* **File Format:** JPEG (quality 92–95%) or PNG
* **File Size Target:** Under 2 MB per room for instant mobile loading over cellular networks.

---

## 4. Room Naming Convention

Save exported renders using clean snake_case filenames:
* `exterior_facade.jpg`
* `living_room.jpg`
* `kitchen_island.jpg`
* `master_bedroom.jpg`
* `spa_bathroom.jpg`
* `sunset_balcony.jpg`

Drop them into `./assets/demo/` or use the in-app **Tour Studio** batch upload button.
