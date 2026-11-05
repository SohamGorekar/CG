

import * as THREE from "three";
import GUI from "lil-gui";
import { getWorldRadius } from "./scene.js";


export const settings = {
  paused: false,
  speed: 1.0,
  showOrbits: true,
  showLabels: true,
};


function isVisible(object) {
  let o = object;
  while (o) {
    if (!o.visible) return false;
    o = o.parent;
  }
  return true;
}


export function setupInteraction({ camera, renderer, controls, pickable, rig }) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const mouseScreen = { x: 0, y: 0 };

  const tooltip = document.getElementById("tooltip");
  const panel = document.getElementById("info-panel");
  const nameEl = document.getElementById("info-name");
  const descEl = document.getElementById("info-desc");
  const factsEl = document.getElementById("info-facts");

  let hovered = null;
  let shownMesh = null;


  const labels = pickable.map((mesh) => {
    const el = document.createElement("div");
    el.className = "planet-label";
    el.textContent = mesh.userData.info.name;
    document.body.appendChild(el);
    return { mesh, el };
  });


  renderer.domElement.addEventListener("pointermove", (e) => {
    mouseScreen.x = e.clientX;
    mouseScreen.y = e.clientY;
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });


  let downAt = null;
  renderer.domElement.addEventListener("pointerdown", (e) => {
    downAt = { x: e.clientX, y: e.clientY };
  });
  renderer.domElement.addEventListener("pointerup", (e) => {
    if (!downAt) return;
    const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
    downAt = null;
    if (moved > 5) return;

    if (hovered) showInfo(hovered);
    else hideInfo();
  });


  renderer.domElement.addEventListener("dblclick", () => {
    if (hovered) rig.focusOnMesh(hovered);
  });

  document.getElementById("info-close").addEventListener("click", hideInfo);


  const flyToButton = document.getElementById("info-focus");
  flyToButton.addEventListener("click", () => {
    if (shownMesh) rig.focusOnMesh(shownMesh);
  });


  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideInfo();

    if (rig.isFlyMode()) return;
    if (e.key === "f" || e.key === "F") rig.focusOnMesh(hovered);
    if (e.key === "r" || e.key === "R") rig.reset();
  });

  function showInfo(mesh) {
    const info = mesh.userData.info;
    shownMesh = mesh;
    nameEl.textContent = info.name;
    descEl.textContent = info.desc;
    factsEl.innerHTML = "";
    for (const [key, value] of Object.entries(info.facts)) {
      const li = document.createElement("li");
      li.innerHTML = `<span>${key}</span><span>${value}</span>`;
      factsEl.appendChild(li);
    }
    panel.classList.add("visible");
  }

  function hideInfo() {
    panel.classList.remove("visible");
  }


  function update() {

    const targets = pickable.filter(isVisible);

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(targets, false);

    hovered = hits.length ? hits[0].object : null;

    if (hovered) {
      tooltip.style.display = "block";
      tooltip.style.left = `${mouseScreen.x}px`;
      tooltip.style.top = `${mouseScreen.y}px`;
      tooltip.textContent = hovered.userData.info.name;
      renderer.domElement.style.cursor = "pointer";
    } else {
      tooltip.style.display = "none";
      renderer.domElement.style.cursor = controls.enabled ? "grab" : "default";
    }


    const v = new THREE.Vector3();
    for (const { mesh, el } of labels) {
      if (!settings.showLabels || !isVisible(mesh)) {
        el.style.display = "none";
        continue;
      }
      mesh.getWorldPosition(v);
      v.y += getWorldRadius(mesh) * 1.6;
      v.project(camera);


      if (v.z > 1) {
        el.style.display = "none";
        continue;
      }
      el.style.display = "block";
      el.style.left = `${((v.x + 1) / 2) * window.innerWidth}px`;
      el.style.top = `${((1 - v.y) / 2) * window.innerHeight}px`;
    }
  }

  return { update };
}


export function setupGUI({ planets, sun, rig, visuals, asteroids, onScaleModeChange }) {
  const gui = new GUI({ title: "Solar System", width: 288 });
  gui.domElement.classList.add("solar-gui");


  const bodies = { Sun: sun };
  for (const p of planets) {
    bodies[p.name] = p.mesh;
    if (p.moonPivot) bodies["Moon"] = p.moonPivot.children[0];
  }
  for (const mesh of asteroids.pickable) bodies[mesh.name] = mesh;


  const camFolder = gui.addFolder("🎥  Camera");
  const camState = { focus: "Free", fly: false, flySpeed: 5 };

  const focusController = camFolder
    .add(camState, "focus", ["Free", ...Object.keys(bodies)])
    .name("Focus on")
    .onChange((name) => {
      if (name === "Free") rig.clearFocus();
      else rig.focusOnMesh(bodies[name]);
    });

  const flyController = camFolder
    .add(camState, "fly")
    .name("Free flight (WASD)")
    .onChange((on) => rig.setFlyMode(on));

  camFolder
    .add(camState, "flySpeed", 1, 120, 1)
    .name("Flight speed")
    .onChange((v) => rig.setFlySpeed(v));
  rig.setFlySpeed(camState.flySpeed);

  camFolder.add({ reset: () => rig.reset() }, "reset").name("↺  Reset view");


  const scaleFolder = gui.addFolder("📐  Scale");
  const scaleState = { realistic: false };

  const scaleNote = document.createElement("div");
  scaleNote.className = "gui-note";
  scaleNote.textContent =
    "Compressed view: sizes, distances and speeds are exaggerated so everything is visible.";

  scaleFolder
    .add(scaleState, "realistic")
    .name("Realistic solar system")
    .onChange((on) => {
      scaleNote.textContent = on
        ? "True relative sizes, distances and orbital periods. One Earth year = 14 s; Neptune takes ~38 min. Planets are drawn 30x larger than true scale — otherwise they'd be invisible specks. Double-click one to fly to it."
        : "Compressed view: sizes, distances and speeds are exaggerated so everything is visible.";
      onScaleModeChange(on);
    });

  scaleFolder.domElement.querySelector(".children").appendChild(scaleNote);


  const simFolder = gui.addFolder("⏱  Simulation");

  const pauseController = simFolder
    .add(settings, "paused")
    .name("Pause")
    .listen();

  simFolder.add(settings, "speed", 0.1, 5, 0.1).name("Speed multiplier");


  simFolder
    .add(
      {
        preset: () => {
          settings.speed = 1;
          settings.paused = false;
        },
      },
      "preset"
    )
    .name("▶  Normal speed (1x)");


  const dispFolder = gui.addFolder("👁  Display");

  dispFolder
    .add(settings, "showOrbits")
    .name("Orbit paths")
    .onChange((visible) => {

      for (const p of planets) p.orbitLine.visible = visible && p.orbitGroup.visible;
    });

  dispFolder.add(settings, "showLabels").name("Name labels");

  dispFolder
    .add({ belt: true }, "belt")
    .name("Asteroid belt")
    .onChange((visible) => {
      asteroids.group.visible = visible;
    });

  dispFolder
    .add({ stars: true }, "stars")
    .name("Starfield")
    .onChange((visible) => {
      visuals.sky.visible = visible;
      visuals.starPoints.visible = visible;
    });

  dispFolder
    .add(visuals.ambientLight, "intensity", 0, 0.5, 0.01)
    .name("Ambient light");

  dispFolder.add(visuals.sunLight, "intensity", 0.5, 8, 0.1).name("Sun brightness");

  dispFolder.close();


  const planetFolder = gui.addFolder("🪐  Planets");

  const planetToggles = planets.map((p) => {
    const proxy = { visible: true };
    const controller = planetFolder
      .add(proxy, "visible")
      .name(p.name)
      .onChange((visible) => {
        p.orbitGroup.visible = visible;
        p.orbitLine.visible = visible && settings.showOrbits;
      });
    return { planet: p, proxy, controller };
  });


  function setAllPlanets(visible) {
    for (const { planet, proxy, controller } of planetToggles) {
      proxy.visible = visible;
      planet.orbitGroup.visible = visible;
      planet.orbitLine.visible = visible && settings.showOrbits;
      controller.updateDisplay();
    }
  }

  planetFolder
    .add({ all: () => setAllPlanets(true) }, "all")
    .name("Show all");
  planetFolder
    .add({ none: () => setAllPlanets(false) }, "none")
    .name("Hide all");
  planetFolder.close();


  const legend = document.createElement("div");
  legend.className = "gui-legend";
  legend.innerHTML = `
    <div class="gui-legend-title">Shortcuts</div>
    <div><kbd>Double-click</kbd> fly to a planet</div>
    <div><kbd>F</kbd> focus hovered &nbsp; <kbd>R</kbd> reset view</div>
    <div><kbd>Space</kbd> pause &nbsp; <kbd>G</kbd> hide this panel</div>
    <div><kbd>Esc</kbd> close info popup</div>`;
  gui.domElement.appendChild(legend);


  let panelHidden = false;
  window.addEventListener("keydown", (e) => {

    if (e.target instanceof HTMLInputElement) return;

    if (e.code === "Space") {
      e.preventDefault();
      settings.paused = !settings.paused;
    }
    if ((e.key === "g" || e.key === "G") && !rig.isFlyMode()) {
      panelHidden = !panelHidden;
      panelHidden ? gui.hide() : gui.show();
    }
  });


  function syncCameraPanel() {
    const focused = rig.getFocus();
    const name = focused ? focused.userData.info.name : "Free";
    if (camState.focus !== name) {
      camState.focus = name;
      focusController.updateDisplay();
    }
    if (camState.fly !== rig.isFlyMode()) {
      camState.fly = rig.isFlyMode();
      flyController.updateDisplay();
    }
  }

  return { gui, syncCameraPanel, pauseController };
}
