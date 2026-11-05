

import * as THREE from "three";
import { FlyControls } from "three/addons/controls/FlyControls.js";
import { getWorldRadius } from "./scene.js";


const HOME_POSITION = new THREE.Vector3(0, 120, 260);
const HOME_TARGET = new THREE.Vector3(0, 0, 0);
const HOME_MIN_DISTANCE = 12;

export function createCameraRig({ camera, renderer, orbitControls }) {
  const dom = renderer.domElement;


  let focusMesh = null;
  let transition = null;
  let flyControls = null;
  let flyMode = false;

  const worldPos = new THREE.Vector3();
  const prevWorldPos = new THREE.Vector3();
  const moved = new THREE.Vector3();

  const flySettings = { speed: 5 };




  let homeScale = 1;
  let homeMinDistance = HOME_MIN_DISTANCE;


  function focusOnMesh(mesh) {
    if (!mesh) return;
    if (flyMode) setFlyMode(false);

    focusMesh = mesh;
    mesh.getWorldPosition(worldPos);



    const radius = getWorldRadius(mesh);
    const distance = Math.max(radius * 4.5, 0.05);



    const direction = new THREE.Vector3().subVectors(camera.position, worldPos);
    if (direction.lengthSq() < 1e-6) direction.set(0, 0.4, 1);
    direction.normalize();
    direction.y = Math.max(direction.y, 0.2);
    direction.normalize();

    transition = {
      t: 0,
      duration: 1.0,
      fromPosition: camera.position.clone(),
      toPosition: worldPos.clone().addScaledVector(direction, distance),
      fromTarget: orbitControls.target.clone(),
      toTarget: worldPos.clone(),
    };


    orbitControls.minDistance = Math.max(radius * 1.3, 0.03);
    prevWorldPos.copy(worldPos);
  }


  function reset() {
    if (flyMode) setFlyMode(false);
    focusMesh = null;
    orbitControls.minDistance = homeMinDistance;
    transition = {
      t: 0,
      duration: 1.4,
      fromPosition: camera.position.clone(),
      toPosition: HOME_POSITION.clone().multiplyScalar(homeScale),
      fromTarget: orbitControls.target.clone(),
      toTarget: HOME_TARGET.clone(),
    };
  }


  function setHomeView(scale, minDistance) {
    homeScale = scale;
    homeMinDistance = minDistance;
    if (!focusMesh) orbitControls.minDistance = homeMinDistance;
  }


  function clearFocus() {
    focusMesh = null;
    transition = null;
    orbitControls.minDistance = homeMinDistance;
  }


  function setFlyMode(on) {
    if (on === flyMode) return;
    flyMode = on;

    if (on) {
      focusMesh = null;
      transition = null;
      orbitControls.enabled = false;

      if (!flyControls) {
        flyControls = new FlyControls(camera, dom);
        flyControls.dragToLook = true;
        flyControls.rollSpeed = 0.35;
      } else {
        flyControls.connect(dom);
      }
      flyControls.movementSpeed = flySettings.speed;
    } else {
      if (flyControls) flyControls.disconnect();




      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      orbitControls.target.copy(camera.position).addScaledVector(forward, 60);
      camera.up.set(0, 1, 0);
      camera.lookAt(orbitControls.target);
      orbitControls.minDistance = homeMinDistance;
      orbitControls.enabled = true;
    }
    return flyMode;
  }

  function setFlySpeed(speed) {
    flySettings.speed = speed;
    if (flyControls) flyControls.movementSpeed = speed;
  }


  function update(delta) {
    if (flyMode) {
      flyControls.update(delta);
      return;
    }

    if (transition) {
      transition.t = Math.min(1, transition.t + delta / transition.duration);
      const k = easeInOutCubic(transition.t);



      if (focusMesh) {
        focusMesh.getWorldPosition(worldPos);
        moved.subVectors(worldPos, prevWorldPos);
        transition.toPosition.add(moved);
        transition.toTarget.copy(worldPos);
        prevWorldPos.copy(worldPos);
      }

      camera.position.lerpVectors(transition.fromPosition, transition.toPosition, k);
      orbitControls.target.lerpVectors(transition.fromTarget, transition.toTarget, k);

      if (transition.t >= 1) transition = null;
    } else if (focusMesh) {



      focusMesh.getWorldPosition(worldPos);
      moved.subVectors(worldPos, prevWorldPos);
      camera.position.add(moved);
      orbitControls.target.copy(worldPos);
      prevWorldPos.copy(worldPos);
    }

    orbitControls.update();
  }


  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  return {
    update,
    focusOnMesh,
    clearFocus,
    reset,
    setHomeView,
    setFlyMode,
    setFlySpeed,
    isFlyMode: () => flyMode,
    getFocus: () => focusMesh,
  };
}
