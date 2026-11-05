# INTERACTIVE 3D SOLAR SYSTEM SIMULATION

## Report Content for the Existing Mini-Project Template

> **Use this document as the content source for the existing report template.**
> Replace the template's project-specific text with the content below, but keep
> the original document's formatting, fonts, font sizes, spacing, alignment,
> page layout, headings, tables, captions, and overall structure unchanged.

---

## Cover Page

**INTERACTIVE 3D SOLAR SYSTEM SIMULATION**

Submitted in partial fulfillment of the requirements of the degree of  
**BACHELOR OF COMPUTER ENGINEERING**

by  
**[Your Name] – [Roll Number]**

Guide:  
**[Guide Name]**

Department of Computer Engineering  
**A. P. SHAH INSTITUTE OF TECHNOLOGY, THANE**

**2026–2027**

---

## Technology Used

The project is developed using **JavaScript**, **Three.js**, **WebGL**,
**HTML**, and **CSS**.

**JavaScript** is used to implement the solar-system logic, animations, user
interactions, camera movement, and simulation controls.

**Three.js** is a JavaScript 3D graphics library used to create and render the
complete solar-system scene. It provides objects and utilities such as:

- `THREE.Scene` for storing all 3D objects.
- `THREE.PerspectiveCamera` for viewing the scene.
- `THREE.WebGLRenderer` for rendering graphics using WebGL.
- `THREE.Mesh` for creating planets and other 3D objects.
- `THREE.SphereGeometry` for creating spherical planets.
- `THREE.PointLight` and `THREE.AmbientLight` for lighting.
- `THREE.Raycaster` for detecting mouse interaction with planets.
- `THREE.InstancedMesh` for efficiently rendering thousands of asteroids.

**WebGL** is used by Three.js to display hardware-accelerated 3D graphics in
the browser.

**HTML** defines the page structure, loading screen, information popup, help
text, and rendering container.

**CSS** is used to design the loading screen, planet information cards,
tooltips, labels, control panel, and responsive layout.

**Vite** is used as the development server and build tool. It provides fast
development and creates an optimized production build.

The project uses the following main packages:

- `three` – 3D rendering and computer graphics.
- `lil-gui` – interactive control panel.
- `vite` – development server and production bundler.

The project can be run using:

```bash
npm install
npm run dev
```

The application requires a modern browser with WebGL support.

The main source files are:

- `src/main.js` – application entry point and animation loop.
- `src/scene.js` – renderer, camera, lights, starfield, and texture loading.
- `src/planets.js` – Sun, planets, Moon, Saturn's ring, orbit paths, and motion.
- `src/camera.js` – camera focus, transitions, reset, and free-flight mode.
- `src/controls.js` – raycasting, labels, information panels, and GUI controls.
- `src/asteroids.js` – asteroid belt and named asteroids.
- `src/style.css` – visual styling for the interface.

---

## Basic Idea of the Project

The project is an interactive three-dimensional simulation of the solar
system. It represents the Sun, eight planets, Earth's Moon, Saturn's rings,
an asteroid belt, orbit paths, and a starfield background.

The main purpose of the project is to demonstrate computer-graphics concepts
such as:

- 3D object modelling.
- Texturing and materials.
- Lighting.
- Camera and perspective.
- Hierarchical transformations.
- Rotation and translation.
- Animation.
- Object selection using raycasting.
- Efficient rendering using instanced meshes.
- User interaction.
- Realistic scaling and orbital motion.

### Sun

The Sun is placed at the centre of the scene. It uses a spherical geometry and
a solar texture. A point light is placed at the Sun's position to illuminate
the planets. Additional transparent spheres create a glowing effect around
the Sun.

### Planets

The simulation contains all eight planets:

1. Mercury
2. Venus
3. Earth
4. Mars
5. Jupiter
6. Saturn
7. Uranus
8. Neptune

Each planet is represented using a textured sphere. Every planet has its own
size, distance from the Sun, orbital speed, rotation speed, axial tilt,
texture, description, and scientific facts.

The planets orbit the Sun using circular motion calculated with sine and
cosine functions. Each planet also rotates independently around its own axis.

### Earth and Moon

Earth has a Moon attached to it through a separate rotation group. The Moon
revolves around Earth while Earth revolves around the Sun.

### Saturn's Ring

Saturn contains a textured ring created using `THREE.RingGeometry`. The ring
is positioned and tilted along with Saturn.

### Asteroid Belt

An asteroid belt is placed between Mars and Jupiter. It contains approximately
**2,500 randomly generated asteroid rocks**.

The asteroids are created from irregular icosahedron geometries. Their
positions, sizes, heights, orbital speeds, and rotation values are generated
randomly. The belt also contains three named asteroids:

- Ceres
- Vesta
- Pallas

These named asteroids can be selected and displayed using the same interaction
system as the planets.

### Starfield

The entire scene is surrounded by a starfield background using a large sphere
textured with a Milky Way image. Additional randomly positioned star points
provide depth to the background.

### Camera

The user can freely control the camera using:

- Left mouse drag to rotate.
- Mouse wheel to zoom.
- Right mouse drag to pan.
- Double-clicking a planet to fly towards it.
- The focus option to select a celestial body.
- Free-flight mode using keyboard controls.

### Information Panel

When the user hovers over a celestial body, its name is displayed. When the
user clicks it, an information panel appears containing:

- The name of the object.
- A short description.
- Scientific facts.
- A button to move the camera towards the selected object.

### Simulation Controls

The control panel allows the user to:

- Pause and resume the simulation.
- Change the simulation speed from 0.1x to 5x.
- Show or hide orbit paths.
- Show or hide planet labels.
- Show or hide the asteroid belt.
- Show or hide the starfield.
- Adjust ambient-light intensity.
- Adjust Sun brightness.
- Show or hide individual planets.
- Switch between compressed and realistic scale modes.

### Scale Modes

The simulation provides two scale modes.

In **compressed mode**, distances, sizes, and speeds are adjusted so that all
planets can be seen together in the viewport.

In **realistic mode**, the relative distances, sizes, orbital periods, and
rotation speeds are based on actual astronomical values. The planets are
enlarged slightly because true-scale planets would be too small to see on a
computer screen.

### How the Project Works

When the application starts:

1. The HTML page creates the main application container.
2. Three.js creates the scene, camera, renderer, lights, and controls.
3. Planetary textures and the starfield texture are loaded.
4. The Sun, planets, Moon, Saturn's ring, orbit paths, and asteroid belt are
   created.
5. The camera and user-interaction system are initialized.
6. A loading screen displays texture-loading progress.
7. The animation loop starts.
8. During every animation frame:
   - The planets move along their orbits.
   - The planets rotate around their own axes.
   - The Moon revolves around Earth.
   - The asteroid belt moves and rotates.
   - The camera is updated.
   - Mouse interaction and labels are updated.
   - The scene is rendered on the screen.

The position of a planet on its orbit is calculated using:

```text
x = cos(angle) × distance
z = sin(angle) × distance
```

The angle changes continuously with time, creating the appearance of orbital
motion.

---

## Functions Used

### Functions Written in the Project

#### `createScene()`

Creates the main Three.js scene, camera, renderer, lighting system,
starfield, and orbit controls.

#### `loadTexture()`

Loads a texture from the public texture directory. If a texture cannot be
loaded, it displays a warning and uses a fallback colour.

#### `texturedMaterial()`

Creates a material and assigns a texture to it. It also provides fallback
material properties if the texture fails to load.

#### `createSolarSystem()`

Creates the Sun, all eight planets, orbit lines, Earth's Moon, and Saturn's
ring. It also returns the objects that can be selected by the user.

#### `createPlanet()`

Creates an individual planet using spherical geometry, a texture, axial tilt,
rotation data, orbital data, and information facts.

#### `updateSolarSystem()`

Updates the position and rotation of the Sun, planets, and Moon during every
frame of the animation.

#### `updateScale()`

Smoothly changes the simulation between compressed scale and realistic
astronomical scale.

#### `setRealisticScale()`

Activates or deactivates realistic scale mode.

#### `createAsteroids()`

Creates the asteroid belt and the named asteroids Ceres, Vesta, and Pallas.

#### `createBelt()`

Creates approximately 2,500 asteroid instances and assigns each asteroid its
own position, size, height, speed, and rotation.

#### `createRockGeometry()`

Generates irregular asteroid shapes by modifying the vertices of an
icosahedron.

#### `createCameraRig()`

Controls camera focusing, camera transitions, camera reset, planet-following
behaviour, and free-flight mode.

#### `focusOnMesh()`

Moves the camera smoothly towards a selected planet, asteroid, or other
celestial body.

#### `setupInteraction()`

Handles mouse movement, hover detection, clicking, double-clicking, tooltips,
information panels, and planet labels.

#### `setupGUI()`

Creates the control panel using `lil-gui`. It provides controls for the
camera, simulation speed, display settings, lighting, planets, and scale mode.

#### `animate()`

Runs the main animation loop. It calculates the time between frames, updates
the solar system, updates the camera and interactions, and renders the scene.

### Important Three.js Functions and Classes

- `THREE.Scene()` creates the 3D scene.
- `THREE.PerspectiveCamera()` creates a perspective camera.
- `THREE.WebGLRenderer()` renders the scene using WebGL.
- `THREE.Mesh()` creates visible 3D objects.
- `THREE.SphereGeometry()` creates spherical objects.
- `THREE.RingGeometry()` creates Saturn's ring.
- `THREE.PointLight()` creates the main light source.
- `THREE.AmbientLight()` provides low-intensity background lighting.
- `THREE.Raycaster()` detects which object is under the mouse pointer.
- `THREE.InstancedMesh()` renders many asteroid objects efficiently.
- `OrbitControls` enables orbiting, zooming, and panning.
- `FlyControls` enables free-flight camera movement.
- `requestAnimationFrame()` continuously redraws the scene for smooth animation.

### Mathematical Functions Used

- `Math.sin()` and `Math.cos()` calculate orbital positions.
- `Math.PI` is used for circular movement and angle calculations.
- Linear interpolation is used to transition between compressed and realistic
  scale.
- Vector calculations are used for camera movement, object positioning, and
  direction calculation.

---

## Screenshots of the Output

Insert screenshots in the corresponding positions in the existing report.
Do not change the original caption style or alignment.

### Screenshot 1: Initial View of the Interactive Solar System

This screenshot shows the Sun, planets, orbit paths, asteroid belt, and
starfield background in the default compressed-scale mode.

### Screenshot 2: Realistic Scale Mode

This screenshot shows the solar system after enabling the realistic-scale
option from the control panel.

### Screenshot 3: Planet Information Panel

This screenshot shows the information popup displayed after clicking a planet.
It contains the planet's description and scientific facts.

### Screenshot 4: Camera Focused on a Planet

This screenshot shows the camera moving towards a selected planet after
double-clicking it or selecting it from the camera menu.

### Screenshot 5: Asteroid Belt

This screenshot shows the animated asteroid belt positioned between Mars and
Jupiter, including the named asteroids Ceres, Vesta, and Pallas.

### Screenshot 6: Control Panel

This screenshot shows the `lil-gui` control panel containing simulation,
camera, display, lighting, scale, and planet-visibility controls.

---

## Conclusion

This project demonstrates how an interactive 3D solar-system simulation can be
developed using JavaScript, Three.js, and WebGL.

The project helped us understand the fundamental concepts of computer
graphics, including:

- Creation of 3D objects.
- Application of textures and materials.
- Use of lights and shadows.
- Perspective camera projection.
- Object transformations.
- Hierarchical modelling.
- Animation using time-based updates.
- Orbital motion using trigonometric functions.
- Mouse-based object selection using raycasting.
- Efficient rendering using instanced meshes.
- User-interface integration with a 3D scene.

The simulation provides a visual representation of the relative motion and
arrangement of planets. The planets revolve around the Sun, rotate around
their axes, and maintain individual orbital and physical properties. The Moon
revolves around Earth, Saturn displays its ring system, and the asteroid belt
adds additional detail to the scene.

The compressed scale mode makes the complete solar system easy to view, while
the realistic scale mode provides a more scientifically accurate
representation of distances, sizes, and orbital periods.

The interactive features such as camera movement, planet selection,
information panels, free-flight mode, simulation speed, and display controls
make the project more engaging and educational.

In the future, the project can be improved by adding:

- Elliptical rather than circular orbits.
- Planetary atmosphere effects.
- More accurate shadows and eclipses.
- Real-time astronomical data.
- Satellite and spacecraft models.
- Sound effects and background music.
- Mobile touch controls.
- Collision detection.
- Planet trails and orbital history.
- A time-control system for observing long-term planetary motion.

---

## Video of the Output

**Video link:** `[Insert your uploaded video link here]`

Upload the project video to Google Drive, GitHub, YouTube, or another
platform and paste its link in this section.

---

# Prompt for Editing the Existing Report File

Copy and paste the following prompt into an LLM that can edit DOCX files:

```text
I have uploaded two files:

1. An existing Microsoft Word mini-project report template:
   A_2_39_cg_miniproject_report.docx
2. A Markdown document containing the correct project information:
   solar_system_project_report.md

The existing DOCX template currently contains information about a different
toy-train project. Replace only the project-specific written content with the
information from solar_system_project_report.md. The actual project is an
Interactive 3D Solar System Simulation built using JavaScript, Three.js,
WebGL, HTML, CSS, Vite, and lil-gui.

This is a content-replacement task, not a redesign task.

Strict requirements:

1. Preserve the original DOCX file's formatting exactly.
2. Preserve the original page size, margins, page breaks, header, footer,
   cover-page arrangement, paragraph spacing, line spacing, indentation,
   alignment, text justification, and section order.
3. Preserve the original font families, font sizes, bold, italic, underline,
   capitalization, colours, styles, and heading hierarchy wherever possible.
4. Preserve the original tables, table dimensions, borders, cell alignment,
   row heights, column widths, and table styling.
5. Preserve the original image locations, image sizes, captions, caption
   alignment, and screenshot placeholders. Do not remove or move them.
6. Do not add a new design, theme, cover page, table of contents, or extra
   sections unless the original template already contains them.
7. Do not convert the report into a different format. Return an edited DOCX
   file.
8. Do not change the formatting to match the Markdown file. The Markdown file
   is only the source of the replacement information.
9. Keep the report's original structure and replace the old toy-train content
   section by section with the solar-system project content.
10. If the template has fields such as student name, roll number, guide name,
    institute, academic year, video link, or screenshot captions, preserve
    their existing formatting and replace only their values. If a value is
    not available, use a clearly marked placeholder such as [Your Name] or
    [Insert Video Link].
11. Do not invent personal details, guide names, roll numbers, links, test
    results, screenshots, or claims that are not supported by the project
    files.
12. Keep technical facts consistent with the project:
    - The project uses Three.js and WebGL.
    - It contains the Sun, all eight planets, Earth's Moon, Saturn's ring,
      a starfield, orbit paths, and an asteroid belt.
    - The asteroid belt contains approximately 2,500 instanced asteroid rocks.
    - Ceres, Vesta, and Pallas are individually selectable.
    - The project supports compressed and realistic scale modes.
    - The project includes camera orbit, zoom, pan, focus, reset, and
      free-flight controls.
    - The project uses raycasting for hover and click selection.
    - The project uses lil-gui for simulation and display controls.
13. Use the existing report's writing style and level of detail where
    practical, but ensure that all technical information describes the solar
    system project rather than the toy-train project.
14. Check the completed DOCX after editing. Make sure no toy-train-specific
    text remains, no content is clipped, no text overflows its page, and the
    original formatting is still intact.
15. Do not modify the source code repository. Only create the edited report
    document.

Before saving, compare the edited report with the original template and
verify that the visual structure is unchanged. Save the result as:

A_2_39_cg_miniproject_report_solar_system.docx

Use the content from solar_system_project_report.md as the authoritative
source for the project information.
```

## Final Editing Checklist

- Replace `[Your Name]` with the student's name.
- Replace `[Roll Number]` with the student's roll number.
- Replace `[Guide Name]` with the guide's name.
- Insert the actual screenshots without changing their original placement or
  dimensions.
- Insert the actual video link.
- Check that no toy-train text remains.
- Check that the DOCX page count and visual layout remain consistent with the
  original template.
- Open the edited DOCX in Microsoft Word or LibreOffice before submission.
