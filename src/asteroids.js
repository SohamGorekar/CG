

import * as THREE from "three";
import { texturedMaterial } from "./scene.js";
import { realDistanceToUnits, realPeriodToSpeed } from "./planets.js";


const BELT_INNER = 62;
const BELT_OUTER = 71.5;


const BELT_THICKNESS = 4.5;

const BELT_COUNT = 2500;


const BELT_BASE_SPEED = 0.18;


const AU_MKM = 149.6;
const BELT_INNER_AU = 2.06;
const BELT_OUTER_AU = 3.28;
const REAL_BELT_INNER = realDistanceToUnits(BELT_INNER_AU * AU_MKM);
const REAL_BELT_OUTER = realDistanceToUnits(BELT_OUTER_AU * AU_MKM);


function createRockGeometry(detail = 1, lumpiness = 0.45) {
  const geometry = new THREE.IcosahedronGeometry(1, detail);
  const position = geometry.attributes.position;
  const cache = new Map();
  const v = new THREE.Vector3();

  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i);
    const key = `${v.x.toFixed(3)}|${v.y.toFixed(3)}|${v.z.toFixed(3)}`;

    let scale = cache.get(key);
    if (scale === undefined) {
      scale = 1 - lumpiness / 2 + Math.random() * lumpiness;
      cache.set(key, scale);
    }

    v.multiplyScalar(scale);
    position.setXYZ(i, v.x, v.y, v.z);
  }

  geometry.computeVertexNormals();
  return geometry;
}


function createBelt(scene, material) {
  const group = new THREE.Group();
  group.name = "AsteroidBelt";



  const shapes = [
    createRockGeometry(1, 0.5),
    createRockGeometry(1, 0.8),
    createRockGeometry(0, 0.6),
  ];

  const perShape = Math.floor(BELT_COUNT / shapes.length);



  const radius = new Float32Array(BELT_COUNT);
  const angle = new Float32Array(BELT_COUNT);
  const speed = new Float32Array(BELT_COUNT);
  const height = new Float32Array(BELT_COUNT);
  const size = new Float32Array(BELT_COUNT);
  const spin = new Float32Array(BELT_COUNT);
  const spinSpeed = new Float32Array(BELT_COUNT);


  const realRadius = new Float32Array(BELT_COUNT);
  const realSpeed = new Float32Array(BELT_COUNT);

  for (let i = 0; i < BELT_COUNT; i++) {



    const t = (Math.random() + Math.random()) / 2;
    radius[i] = BELT_INNER + t * (BELT_OUTER - BELT_INNER);

    angle[i] = Math.random() * Math.PI * 2;




    const mid = (BELT_INNER + BELT_OUTER) / 2;
    speed[i] = BELT_BASE_SPEED * Math.pow(mid / radius[i], 1.5) * (0.9 + Math.random() * 0.2);


    height[i] = Math.pow(Math.random() * 2 - 1, 3) * BELT_THICKNESS;

    size[i] = 0.05 + Math.pow(Math.random(), 2) * 0.3;
    spin[i] = Math.random() * Math.PI * 2;
    spinSpeed[i] = (Math.random() - 0.5) * 2.5;



    realRadius[i] = REAL_BELT_INNER + t * (REAL_BELT_OUTER - REAL_BELT_INNER);
    const au = BELT_INNER_AU + t * (BELT_OUTER_AU - BELT_INNER_AU);
    realSpeed[i] = realPeriodToSpeed(Math.pow(au, 1.5));
  }

  const meshes = shapes.map((geometry, s) => {
    const count = s === shapes.length - 1 ? BELT_COUNT - perShape * s : perShape;
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    mesh.userData.offset = perShape * s;
    group.add(mesh);
    return mesh;
  });

  scene.add(group);


  const dummy = new THREE.Object3D();
  function update(delta, globalSpeed, blend) {
    if (!group.visible) return;

    for (const mesh of meshes) {
      const offset = mesh.userData.offset;

      for (let j = 0; j < mesh.count; j++) {
        const i = offset + j;

        const r = radius[i] + (realRadius[i] - radius[i]) * blend;
        const s = speed[i] + (realSpeed[i] - speed[i]) * blend;

        angle[i] += s * delta * globalSpeed;
        spin[i] += spinSpeed[i] * delta * globalSpeed;

        dummy.position.set(
          Math.cos(angle[i]) * r,


          height[i] * (1 - blend * 0.2),
          Math.sin(angle[i]) * r
        );
        dummy.rotation.set(spin[i] * 0.6, spin[i], spin[i] * 0.3);
        dummy.scale.setScalar(size[i]);
        dummy.updateMatrix();

        mesh.setMatrixAt(j, dummy.matrix);
      }

      mesh.instanceMatrix.needsUpdate = true;
    }
  }

  update(0, 0, 0);
  return { group, update };
}



const NAMED_ASTEROIDS = [
  {
    name: "Ceres",
    size: 0.55,
    distance: 67.5,
    orbitSpeed: 0.177,
    inclination: 10.6,
    real: { distanceMkm: 414, periodYears: 4.6 },
    desc: "The largest object in the asteroid belt — big enough to be classed as a dwarf planet.",
    facts: {
      Diameter: "940 km",
      "Distance from Sun": "414 million km",
      "Orbital period": "4.6 Earth years",
    },
  },
  {
    name: "Vesta",
    size: 0.42,
    distance: 64.4,
    orbitSpeed: 0.19,
    inclination: 7.1,
    real: { distanceMkm: 353, periodYears: 3.63 },
    desc: "The brightest asteroid, and the second most massive in the belt.",
    facts: {
      Diameter: "525 km",
      "Distance from Sun": "353 million km",
      "Orbital period": "3.6 Earth years",
    },
  },
  {
    name: "Pallas",
    size: 0.4,
    distance: 67.5,
    orbitSpeed: 0.177,
    inclination: 34.8,
    real: { distanceMkm: 414, periodYears: 4.62 },
    desc: "A heavily tilted asteroid whose orbit is steeply inclined to the rest of the belt.",
    facts: {
      Diameter: "512 km",
      "Distance from Sun": "414 million km",
      "Orbital period": "4.6 Earth years",
    },
  },
];

function createNamedAsteroids(group, material) {
  return NAMED_ASTEROIDS.map((data) => {
    const mesh = new THREE.Mesh(createRockGeometry(2, 0.35), material);
    mesh.scale.setScalar(data.size);
    mesh.name = data.name;
    mesh.userData.info = { name: data.name, desc: data.desc, facts: data.facts };



    group.add(mesh);
    const inclination = data.inclination * (Math.PI / 180);

    return {
      ...data,
      angle: Math.random() * Math.PI * 2,
      sinI: Math.sin(inclination),
      cosI: Math.cos(inclination),
      realDistance: realDistanceToUnits(data.real.distanceMkm),
      realOrbitSpeed: realPeriodToSpeed(data.real.periodYears),
      mesh,
    };
  });
}


export function createAsteroids(scene) {



  const material = texturedMaterial(THREE.MeshStandardMaterial, "moon.jpg", {
    fallbackColor: 0x8a8378,
    roughness: 1,
    metalness: 0,
    flatShading: true,
  });

  const belt = createBelt(scene, material);
  const named = createNamedAsteroids(belt.group, material);


  function update(delta, globalSpeed, blend = 0) {
    belt.update(delta, globalSpeed, blend);

    for (const a of named) {
      const distance = a.distance + (a.realDistance - a.distance) * blend;
      const speed = a.orbitSpeed + (a.realOrbitSpeed - a.orbitSpeed) * blend;

      a.angle += speed * delta * globalSpeed;




      a.mesh.position.set(
        Math.cos(a.angle) * distance,
        Math.sin(a.angle) * distance * a.sinI,
        Math.sin(a.angle) * distance * a.cosI
      );
      a.mesh.rotation.y += 0.35 * delta * globalSpeed;
      a.mesh.rotation.x += 0.12 * delta * globalSpeed;
    }
  }

  update(0, 0, 0);

  return {
    group: belt.group,
    update,


    pickable: named.map((a) => a.mesh),
  };
}
