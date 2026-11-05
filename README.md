# Interactive 3D Solar System Simulation

A computer graphics mini-project: a real-time, interactive 3D model of the solar
system built with **Three.js** (WebGL) and bundled with **Vite**.

The Sun sits at the centre as a light source, all eight planets orbit it on
circular paths while spinning on their own tilted axes, Saturn has a ring,
Earth has a Moon, an asteroid belt of 2,500 tumbling rocks turns between Mars
and Jupiter, and the whole scene sits inside a Milky Way starfield.
The camera is free — orbit, zoom and pan anywhere — and every body can be
hovered for its name or clicked for a fact card.

---

## How to run

```bash
npm install
npm run dev
```

Then open the URL Vite prints (normally <http://localhost:5173>).

To make a production build:

```bash
npm run build      # output goes to dist/
npm run preview    # serve the built version locally
```

**Requirements:** Node.js 18+ and a browser with WebGL 2 (any current Chrome,
Edge or Firefox).

---

## Controls

| Action | Result |
| --- | --- |
| Left-click + drag | Rotate the camera |
| Scroll wheel | Zoom — towards whatever the cursor is pointing at |
| Right-click + drag | Pan |
| Hover a planet | Tooltip with its name appears at the cursor |
| Click a planet | Info popup with a description and three facts |
| **Double-click a planet** | **Fly to it and follow it along its orbit** |
| `F` | Focus the planet under the cursor |
| `R` | Reset to the whole-system view |
| `Space` | Pause / resume |
| `G` | Hide / show the control panel |
| `Esc` | Close the info popup |

In **free flight** mode (toggle it in the panel): `W`/`S` forward and back,
`A`/`D` strafe, `R`/`F` up and down, `Q`/`E` roll, drag the mouse to look around.

### Control panel (top-right, lil-gui)

- **Camera** — focus dropdown (any body, or Free), free-flight toggle,
  flight speed, reset view
- **Scale** — **Realistic solar system** toggle (see below)
- **Simulation** — pause, 0.1x–5x speed multiplier, one-tap normal speed
- **Display** — orbit paths, name labels, asteroid belt, starfield,
  ambient light, Sun brightness
- **Planets** — per-planet visibility plus show-all / hide-all

---

## Folder structure

```
solar-system/
├── public/
│   └── textures/          planet / sun / ring / starfield images
├── src/
│   ├── main.js            entry point: wiring + the render loop
│   ├── scene.js           renderer, camera, OrbitControls, lights,
│   │                      starfield, LoadingManager + texture helpers
│   ├── camera.js          camera rig: fly-to / follow a planet, and
│   │                      the WASD free-flight mode
│   ├── planets.js         planet data table, Sun, planets, Saturn's ring,
│   │                      Earth's Moon, orbit lines, per-frame motion
│   ├── asteroids.js       instanced asteroid belt + named asteroids
│   ├── controls.js        raycasting (hover / click), labels, lil-gui panel
│   └── style.css          loading screen, tooltip, popup, label styling
├── index.html
├── package.json
└── README.md
```

---

## How it works (short walkthrough)

**Scene setup — `scene.js`**
A `PerspectiveCamera`, a `WebGLRenderer` sized to the window (and resized on
`resize`), and `OrbitControls` with damping plus min/max distance limits. A
`PointLight` at the origin acts as the Sun's light and a low-intensity
`AmbientLight` keeps night sides readable rather than pure black. The starfield
is a 2000-unit sphere rendered from the inside (`THREE.BackSide`) with the Milky
Way texture, plus a sparse `THREE.Points` cloud in front of it for depth.

**Bodies — `planets.js`**
All per-planet values live in one `PLANET_DATA` table (size, orbit radius, orbit
speed, spin speed, axial tilt, fallback colour, facts). Each planet is built as a
small hierarchy:

```
orbitGroup   moved around the Sun by trigonometry each frame
 └ tiltGroup holds the axial tilt (Earth 23.4°, Uranus 97.8°, …)
    ├ mesh   textured sphere, spins on its own Y axis
    ├ ring   Saturn only — tilts with the planet but does not spin with it
    └ moon   Earth only — on its own rotating pivot
```

**Motion — `updateSolarSystem()`**
Each frame the planet's orbit angle advances by `orbitSpeed × delta × speed`,
then the position comes from `x = cos(angle) × distance`,
`z = sin(angle) × distance`. Self-rotation is applied separately to the mesh so
spin and orbit are independent. `delta` comes from `THREE.Clock`, so motion is
frame-rate independent.

**Orbit lines** are `EllipseCurve` samples turned into a low-opacity `LineLoop`
on the XZ plane.

**Asteroid belt — `asteroids.js`**
The real belt spans 2.06–3.28 AU, between Mars (1.52 AU) and Jupiter (5.20 AU) —
which is only 14.7% to 47.8% of the way across that gap, hugging the Mars side
rather than filling it. Those same fractions are mapped onto the compressed
orbits (62 → 71.5 units), so the belt is proportionally correct in both scale
modes. Its thickness reflects the real average inclination of 8–10°, so it's a
fat torus rather than the paper-thin ring it's usually drawn as.

2,500 rocks orbit there, drawn with `THREE.InstancedMesh`:
the geometry and material are uploaded to the GPU once and drawn thousands of
times with per-instance matrices, so the belt costs three draw calls instead of
2,500. Each rock's orbit radius, speed, height, size and tumble are stored in
flat `Float32Array`s and its matrix is rebuilt every frame. Inner rocks orbit
faster than outer ones, so the belt shears as it turns. The rock shapes are
generated by randomly denting an icosahedron — no asteroid texture needed; the
Moon map doubles as the rock surface. Ceres, Vesta and Pallas are separate
meshes so they can be hovered, clicked and focused like planets — each on a
circular orbit tilted by its real inclination, which is why Pallas (34.8°)
visibly climbs out of the belt plane while Vesta (7.1°) stays in it.

**Interaction — `controls.js`**
A `THREE.Raycaster` is cast from the pointer every frame against the list of
pickable meshes. The nearest hit drives the hover tooltip and the click popup,
each mesh carrying its facts in `mesh.userData.info`. Name labels are plain HTML
divs positioned by projecting each body's world position into screen space.
Click-vs-drag is separated by measuring pointer travel between `pointerdown`
and `pointerup`, so rotating the camera doesn't open popups.

**Loading screen — `main.js`**
Every texture is loaded through a single `THREE.LoadingManager`. Its
`onProgress` drives the progress bar and `onLoad` fades the overlay out.

### The two scale modes (important for the demo)

The **Scale → Realistic solar system** toggle morphs the whole system between
two layouts over about two seconds. Every planet's size, orbit radius, orbital
speed and spin rate is eased between the two sets of values each frame in
`updateScale()`, and the asteroid belt moves with it.

**Compressed (default).** Sizes, distances and speeds are deliberately
exaggerated so everything is visible at once. What's preserved is the correct
*relative order*: Jupiter clearly the largest, Mercury the smallest, Mercury
orbiting fastest and Neptune slowest.

**Realistic.** Driven by the real measurements stored per planet
(`radiusKm`, `distanceMkm`, `periodYears`, `dayHours`), so relative sizes,
relative distances and relative orbital periods are all true to life. Three
constants make it viewable at all, and they're the only things not to scale:

| Constant | Value | Why |
| --- | --- | --- |
| `UNIT` | 1 unit ≈ 7.49 million km | puts Neptune's orbit at 600 units — vast, but still inside the starfield |
| `SIZE_MAGNIFY` | 30x | at true scale Earth would be a fraction of a pixel; even magnified 30x the Sun still fits inside Mercury's orbit, so proportions *between* bodies stay exact |
| `EARTH_YEAR_SECONDS` | 14 s | one Earth year at 1x speed, so every other period follows from the real ratio — Neptune takes ~38 minutes |

Rotation is the one thing that can't be literal: at this time compression Earth
would spin ~160 times a second, which just strobes. Instead the *relative*
rotation rates are kept and normalised so the fastest spinner (Jupiter) turns at
a comfortable rate — Venus still creeps backwards, Uranus still rolls on its side.

In realistic mode the planets really are specks — that's the point. Use the
focus dropdown or double-click to fly to one; the camera's framing distance and
zoom limits are derived from each body's on-screen size, so it works at either
scale. The Sun's `PointLight` also uses zero distance falloff, for readability.

---

## Credits

Planet, Sun, Moon, ring and starfield textures are sourced from
**Solar System Scope** — <https://www.solarsystemscope.com/textures/>
(Creative Commons Attribution 4.0). The source images were downscaled to a
maximum of 4096 px wide to keep load times reasonable.

Built with [Three.js](https://threejs.org/), [lil-gui](https://lil-gui.georgealways.com/)
and [Vite](https://vitejs.dev/).
#   C G _ m i n i p r o j e c t _ S o l a r S y s t e m  
 #   C G _ m i n i p r o j e c t _ S o l a r S y s t e m  
 #   C G _ m i n i p r o j e c t _ S o l a r S y s t e m  
 #   C G  
 