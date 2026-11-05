

import * as THREE from "three";
import { texturedMaterial } from "./scene.js";


export const PLANET_DATA = [
  {
    name: "Mercury",
    texture: "mercury.jpg",
    color: 0x9c8b7d,
    size: 1.0,
    distance: 24,
    orbitSpeed: 0.48,
    spinSpeed: 0.12,
    tilt: 0.03,
    real: { radiusKm: 2440, distanceMkm: 57.9, periodYears: 0.2408, dayHours: 1407.6 },
    desc: "The smallest planet and the closest to the Sun, with almost no atmosphere.",
    facts: {
      Diameter: "4,879 km",
      "Distance from Sun": "58 million km",
      "Orbital period": "88 Earth days",
    },
  },
  {
    name: "Venus",
    texture: "venus.jpg",
    color: 0xd8b06a,
    size: 1.5,
    distance: 34,
    orbitSpeed: 0.35,
    spinSpeed: -0.08,
    tilt: 177.4,
    real: { radiusKm: 6052, distanceMkm: 108.2, periodYears: 0.6152, dayHours: -5832.5 },
    desc: "Similar in size to Earth but wrapped in a crushing, super-heated CO2 atmosphere.",
    facts: {
      Diameter: "12,104 km",
      "Distance from Sun": "108 million km",
      "Orbital period": "225 Earth days",
    },
  },
  {
    name: "Earth",
    texture: "earth.jpg",
    color: 0x3b7bd6,
    size: 1.6,
    distance: 46,
    orbitSpeed: 0.29,
    spinSpeed: 0.55,
    tilt: 23.4,
    real: { radiusKm: 6371, distanceMkm: 149.6, periodYears: 1.0, dayHours: 23.93 },
    desc: "Our home planet — the only world known to support life.",
    facts: {
      Diameter: "12,742 km",
      "Distance from Sun": "150 million km",
      "Orbital period": "365.25 days",
    },
  },
  {
    name: "Mars",
    texture: "mars.jpg",
    color: 0xc1440e,
    size: 1.2,
    distance: 58,
    orbitSpeed: 0.24,
    spinSpeed: 0.52,
    tilt: 25.2,
    real: { radiusKm: 3390, distanceMkm: 227.9, periodYears: 1.8808, dayHours: 24.62 },
    desc: "The red planet, coloured by iron oxide dust and home to the tallest volcano in the solar system.",
    facts: {
      Diameter: "6,779 km",
      "Distance from Sun": "228 million km",
      "Orbital period": "687 Earth days",
    },
  },
  {
    name: "Jupiter",
    texture: "jupiter.jpg",
    color: 0xd8a672,
    size: 5.6,
    distance: 86,
    orbitSpeed: 0.13,
    spinSpeed: 1.2,
    tilt: 3.1,
    real: { radiusKm: 69911, distanceMkm: 778.6, periodYears: 11.862, dayHours: 9.925 },
    desc: "The largest planet — a gas giant with a centuries-old storm, the Great Red Spot.",
    facts: {
      Diameter: "139,820 km",
      "Distance from Sun": "778 million km",
      "Orbital period": "12 Earth years",
    },
  },
  {
    name: "Saturn",
    texture: "saturn.jpg",
    color: 0xe0c087,
    size: 4.7,
    distance: 116,
    orbitSpeed: 0.095,
    spinSpeed: 1.05,
    tilt: 26.7,
    ring: { inner: 6.2, outer: 10.5, texture: "saturn_ring.png" },
    real: { radiusKm: 58232, distanceMkm: 1433.5, periodYears: 29.457, dayHours: 10.66 },
    desc: "Famous for its bright ring system made of billions of ice and rock particles.",
    facts: {
      Diameter: "116,460 km",
      "Distance from Sun": "1.4 billion km",
      "Orbital period": "29 Earth years",
    },
  },
  {
    name: "Uranus",
    texture: "uranus.jpg",
    color: 0x9fd8e3,
    size: 3.0,
    distance: 150,
    orbitSpeed: 0.068,
    spinSpeed: -0.4,
    tilt: 97.8,
    real: { radiusKm: 25362, distanceMkm: 2872.5, periodYears: 84.02, dayHours: -17.24 },
    desc: "An ice giant tipped almost completely on its side, so it rolls along its orbit.",
    facts: {
      Diameter: "50,724 km",
      "Distance from Sun": "2.9 billion km",
      "Orbital period": "84 Earth years",
    },
  },
  {
    name: "Neptune",
    texture: "neptune.jpg",
    color: 0x3f5ee0,
    size: 2.9,
    distance: 180,
    orbitSpeed: 0.05,
    spinSpeed: 0.42,
    tilt: 28.3,
    real: { radiusKm: 24622, distanceMkm: 4495.1, periodYears: 164.79, dayHours: 16.11 },
    desc: "The farthest planet from the Sun, with the fastest winds in the solar system.",
    facts: {
      Diameter: "49,244 km",
      "Distance from Sun": "4.5 billion km",
      "Orbital period": "165 Earth years",
    },
  },
];

const DEG = Math.PI / 180;
const SUN_SIZE = 9;


const REAL = {
  UNIT: 4495.1 / 600,
  SIZE_MAGNIFY: 30,
  EARTH_YEAR_SECONDS: 14,
  FASTEST_SPIN: 1.1,
  SHORTEST_DAY_HOURS: 9.925,
};


function realRadiusToUnits(radiusKm) {
  return ((radiusKm / 1e6) * REAL.SIZE_MAGNIFY) / REAL.UNIT;
}


export function realDistanceToUnits(distanceMkm) {
  return distanceMkm / REAL.UNIT;
}


export function realPeriodToSpeed(periodYears) {
  return (Math.PI * 2) / (periodYears * REAL.EARTH_YEAR_SECONDS);
}


function realDayToSpin(dayHours) {
  return (REAL.FASTEST_SPIN * REAL.SHORTEST_DAY_HOURS) / dayHours;
}


export const REALISTIC_VIEW_SCALE = 600 / 180;


const scaleState = { target: 0, blend: 0, seconds: 1.8 };

export function setRealisticScale(on) {
  scaleState.target = on ? 1 : 0;
}

export function isRealisticScale() {
  return scaleState.target === 1;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}


export function updateScale(sun, planets, delta) {
  const step = delta / scaleState.seconds;
  if (scaleState.blend < scaleState.target) {
    scaleState.blend = Math.min(scaleState.target, scaleState.blend + step);
  } else if (scaleState.blend > scaleState.target) {
    scaleState.blend = Math.max(scaleState.target, scaleState.blend - step);
  }


  const t = scaleState.blend;
  const k = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;


  sun.scale.setScalar(lerp(SUN_SIZE, realRadiusToUnits(696000), k) / SUN_SIZE);

  for (const p of planets) {
    p.currentDistance = lerp(p.distance, p.realDistance, k);
    p.currentOrbitSpeed = lerp(p.orbitSpeed, p.realOrbitSpeed, k);
    p.currentSpinSpeed = lerp(p.spinSpeed, p.realSpinSpeed, k);



    const size = lerp(p.size, p.realSize, k);
    p.tiltGroup.scale.setScalar(size / p.size);


    p.orbitLine.scale.setScalar(p.currentDistance / p.distance);


    p.orbitGroup.position.x = Math.cos(p.angle) * p.currentDistance;
    p.orbitGroup.position.z = Math.sin(p.angle) * p.currentDistance;
  }

  return k;
}


function createSun(scene) {
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(SUN_SIZE, 64, 32),

    texturedMaterial(THREE.MeshBasicMaterial, "sun.jpg", { color: 0xffffff })
  );
  sun.name = "Sun";
  sun.userData.info = {
    name: "Sun",
    desc: "The star at the centre of the solar system — 99.8% of all the mass here.",
    facts: {
      Diameter: "1,392,700 km",
      "Surface temp": "~5,500 °C",
      Type: "G-type main sequence star",
    },
  };
  scene.add(sun);


  for (const [radius, opacity] of [
    [10.4, 0.28],
    [12.5, 0.12],
  ]) {
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 32, 16),
      new THREE.MeshBasicMaterial({
        color: 0xffa631,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      })
    );
    sun.add(glow);
  }

  return sun;
}


function createOrbitLine(radius) {
  const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2);
  const points2D = curve.getPoints(180);


  const points3D = points2D.map((p) => new THREE.Vector3(p.x, 0, p.y));

  const line = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(points3D),
    new THREE.LineBasicMaterial({
      color: 0x9bb3d9,
      transparent: true,
      opacity: 0.18,
    })
  );
  return line;
}


function createRing({ inner, outer, texture }) {
  const geometry = new THREE.RingGeometry(inner, outer, 128);
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const t = (v.length() - inner) / (outer - inner);
    uv.setXY(i, t, 1);
  }

  const ring = new THREE.Mesh(
    geometry,
    texturedMaterial(THREE.MeshBasicMaterial, texture, {
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    })
  );

  ring.rotation.x = -Math.PI / 2;
  return ring;
}


function createPlanet(data) {
  const orbitGroup = new THREE.Group();

  const tiltGroup = new THREE.Group();
  tiltGroup.rotation.z = data.tilt * DEG;
  orbitGroup.add(tiltGroup);

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(data.size, 64, 32),
    texturedMaterial(THREE.MeshStandardMaterial, data.texture, {
      fallbackColor: data.color,
      roughness: 0.95,
      metalness: 0.0,
    })
  );
  mesh.name = data.name;

  mesh.userData.info = { name: data.name, desc: data.desc, facts: data.facts };
  tiltGroup.add(mesh);


  let ring = null;
  if (data.ring) {
    ring = createRing(data.ring);
    tiltGroup.add(ring);
  }


  let moonPivot = null;
  if (data.name === "Earth") {
    moonPivot = new THREE.Group();
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 32, 16),
      texturedMaterial(THREE.MeshStandardMaterial, "moon.jpg", {
        fallbackColor: 0xb0b0b0,
        roughness: 1,
      })
    );
    moon.position.set(3.4, 0, 0);
    moon.name = "Moon";
    moon.userData.info = {
      name: "Moon",
      desc: "Earth's only natural satellite, locked so the same face always points at us.",
      facts: {
        Diameter: "3,475 km",
        "Distance from Earth": "384,400 km",
        "Orbital period": "27.3 days",
      },
    };
    moonPivot.add(moon);
    tiltGroup.add(moonPivot);
  }

  return {
    ...data,
    angle: Math.random() * Math.PI * 2,


    realSize: realRadiusToUnits(data.real.radiusKm),
    realDistance: realDistanceToUnits(data.real.distanceMkm),
    realOrbitSpeed: realPeriodToSpeed(data.real.periodYears),
    realSpinSpeed: realDayToSpin(data.real.dayHours),


    currentDistance: data.distance,
    currentOrbitSpeed: data.orbitSpeed,
    currentSpinSpeed: data.spinSpeed,

    orbitGroup,
    tiltGroup,
    mesh,
    ring,
    moonPivot,
  };
}


export function createSolarSystem(scene) {
  const sun = createSun(scene);

  const planets = [];
  const orbitLines = [];

  for (const data of PLANET_DATA) {
    const planet = createPlanet(data);
    scene.add(planet.orbitGroup);
    planets.push(planet);

    const line = createOrbitLine(data.distance);
    scene.add(line);
    orbitLines.push(line);
    planet.orbitLine = line;
  }


  const pickable = [sun, ...planets.map((p) => p.mesh)];
  for (const p of planets) {
    if (p.moonPivot) pickable.push(p.moonPivot.children[0]);
  }

  return { sun, planets, orbitLines, pickable };
}


export function updateSolarSystem(sun, planets, delta, speed) {

  sun.rotation.y += 0.02 * delta * speed;

  for (const p of planets) {



    p.angle += p.currentOrbitSpeed * delta * speed;
    p.orbitGroup.position.x = Math.cos(p.angle) * p.currentDistance;
    p.orbitGroup.position.z = Math.sin(p.angle) * p.currentDistance;


    p.mesh.rotation.y += p.currentSpinSpeed * delta * speed;


    if (p.moonPivot) p.moonPivot.rotation.y += 0.9 * delta * speed;
  }
}
