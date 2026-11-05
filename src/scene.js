

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


export const loadingManager = new THREE.LoadingManager();
export const textureLoader = new THREE.TextureLoader(loadingManager);


export function loadTexture(file, onError) {
  const tex = textureLoader.load(`textures/${file}`, undefined, undefined, () => {
    console.warn(`[textures] missing "${file}" - falling back to flat colour`);
    if (onError) onError();
  });
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}


export function texturedMaterial(MaterialClass, file, params = {}) {
  const { fallbackColor, ...materialParams } = params;
  const material = new MaterialClass(materialParams);

  material.map = loadTexture(file, () => {
    material.map = null;
    if (fallbackColor !== undefined) material.color.set(fallbackColor);
    material.needsUpdate = true;
  });

  return material;
}


const _worldScale = new THREE.Vector3();
export function getWorldRadius(mesh) {
  mesh.getWorldScale(_worldScale);
  return (mesh.geometry.parameters?.radius ?? 1) * _worldScale.x;
}


export function createScene() {
  const container = document.getElementById("app");

  const scene = new THREE.Scene();






  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.01,
    4000
  );

  camera.position.set(0, 120, 260);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);


  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 12;
  controls.maxDistance = 1400;
  controls.zoomToCursor = true;
  controls.screenSpacePanning = true;
  controls.panSpeed = 1.1;
  controls.target.set(0, 0, 0);
  





  const sunLight = new THREE.PointLight(0xfff2dd, 3.0, 0, 0);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.12);
  scene.add(ambientLight);


  const skyMaterial = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    color: 0x8a94a8,
  });
  skyMaterial.map = loadTexture("stars_background.jpg", () => {

    skyMaterial.map = null;
    skyMaterial.color.set(0x05070d);
    skyMaterial.needsUpdate = true;
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(2000, 64, 32), skyMaterial);
  scene.add(sky);

  const starPoints = createPointStars();
  scene.add(starPoints);


  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });


  return {
    scene,
    camera,
    renderer,
    controls,
    visuals: { sky, starPoints, ambientLight, sunLight },
  };
}


function createPointStars(count = 1500) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 700 + Math.random() * 700;
    positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.6,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    })
  );
}
