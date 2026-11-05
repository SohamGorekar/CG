

import * as THREE from "three";
import "./style.css";

import { createScene, loadingManager } from "./scene.js";
import {
  createSolarSystem,
  updateSolarSystem,
  updateScale,
  setRealisticScale,
  REALISTIC_VIEW_SCALE,
} from "./planets.js";
import { createAsteroids } from "./asteroids.js";
import { createCameraRig } from "./camera.js";
import { setupInteraction, setupGUI, settings } from "./controls.js";


const { scene, camera, renderer, controls, visuals } = createScene();


const { sun, planets, pickable } = createSolarSystem(scene);


const asteroids = createAsteroids(scene);
pickable.push(...asteroids.pickable);


const rig = createCameraRig({ camera, renderer, orbitControls: controls });


const interaction = setupInteraction({ camera, renderer, controls, pickable, rig });
const { syncCameraPanel } = setupGUI({
  planets,
  sun,
  rig,
  visuals,
  asteroids,


  onScaleModeChange: (realistic) => {
    setRealisticScale(realistic);



    rig.setHomeView(realistic ? REALISTIC_VIEW_SCALE : 1, realistic ? 4 : 12);
    if (!rig.getFocus()) rig.reset();
  },
});




const loadingScreen = document.getElementById("loading-screen");
const barFill = document.getElementById("loading-bar-fill");
const percentEl = document.getElementById("loading-percent");

loadingManager.onProgress = (_url, loaded, total) => {
  const percent = Math.round((loaded / total) * 100);
  barFill.style.width = `${percent}%`;
  percentEl.textContent = `${percent}%`;
};

function finishLoading() {
  barFill.style.width = "100%";
  percentEl.textContent = "100%";
  loadingScreen.classList.add("hidden");
  setTimeout(() => (loadingScreen.style.display = "none"), 900);
}

loadingManager.onLoad = finishLoading;


loadingManager.onError = () => setTimeout(finishLoading, 500);




const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();




  const scaleBlend = updateScale(sun, planets, delta);



  const simDelta = settings.paused ? 0 : delta;
  updateSolarSystem(sun, planets, simDelta, settings.speed);
  asteroids.update(simDelta, settings.speed, scaleBlend);



  rig.update(delta);

  interaction.update();
  syncCameraPanel();
  renderer.render(scene, camera);
}

animate();
