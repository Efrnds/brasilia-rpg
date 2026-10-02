import { createArtSample } from "./sample.js";
import * as THREE from "../../vendor/three.module.js";
import { CATALOG, createProp } from "./props.js";
import { ARCHITECTURE, createArchitecture } from "./architecture.js";
import { createCharacterRig } from "./characters.js";
import { CharacterAnimator } from "./animation.js";
import { exportGLB } from "./glb.js";
const canvas = document.querySelector("canvas"),
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd6cbb6);
scene.add(new THREE.HemisphereLight(0xfff3d7, 0x61705c, 2));
const sun = new THREE.DirectionalLight(0xffedd3, 3);
sun.position.set(4, 8, 5);
sun.castShadow = true;
scene.add(sun);
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0xc6bea9, roughness: 1 }),
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);
const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 200),
  select = document.querySelector("#asset"),
  clipSelect = document.querySelector("#clip"),
  clock = new THREE.Clock();
let model,
  animator,
  helper,
  yaw = 0.65,
  pitch = 0.4,
  distance = 7,
  drag = false,
  last;
for (const [type, items] of [
  ["prop", CATALOG],
  ["architecture", ARCHITECTURE],
  [
    "character",
    Object.fromEntries(
      ["luli", "folfonaro", "nair", "assessor", "estagiario", "tio"].map(
        (name) => [name, { name }],
      ),
    ),
  ],
]) {
  const group = document.createElement("optgroup");
  group.label = {
    prop: "Objetos",
    architecture: "Arquitetura",
    character: "Personagens",
  }[type];
  for (const [kind, item] of Object.entries(items)) {
    const option = document.createElement("option");
    option.value = `${type}:${kind}`;
    option.textContent = item.label || item.name;
    group.append(option);
  }
  select.append(group);
}
function dispose(root) {
  root?.traverse((o) => {
    o.geometry?.dispose();
    if (o.material)
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
        if (m.map && !m.map.userData.shared) m.map.dispose();
        m.dispose();
      }
  });
  root?.removeFromParent();
}
function load() {
  animator?.dispose();
  dispose(model);
  dispose(helper);
  const [type, kind] = select.value.split(":");
  let rig;
  if (type === "character") {
    rig = createCharacterRig(kind);
    model = rig.root;
    animator = new CharacterAnimator(rig);
  } else {
    model =
      type === "sample"
        ? createArtSample()
        : type === "prop"
          ? createProp(kind)
          : createArchitecture(kind);
    animator = null;
  }
  scene.add(model);
  const box = new THREE.Box3().setFromObject(model),
    size = box.getSize(new THREE.Vector3());
  helper = new THREE.Box3Helper(box, 0x35573d);
  helper.visible = document.querySelector("#colliders").checked;
  scene.add(helper);
  distance = Math.max(5, size.length() * 1.8);
  clipSelect.replaceChildren();
  for (const name of rig?.clips.map((c) => c.name) || ["Estático"]) {
    const o = document.createElement("option");
    o.textContent = name;
    clipSelect.append(o);
  }
  document.querySelector("#metadata").textContent =
    `${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)} m · pivô no chão · autoria local · CC0. GLB preserva hierarquia e clips; materiais em cor sólida.`;
}
const sample = document.createElement("option");
sample.value = "sample:palace";
sample.textContent = "Amostra: personagem, inimigo, móvel e arquitetura";
select.append(sample);
select.onchange = load;
document.querySelector("#colliders").onchange = (e) =>
  (helper.visible = e.target.checked);
load();
canvas.onpointerdown = (e) => {
  drag = true;
  last = { x: e.clientX, y: e.clientY };
  canvas.setPointerCapture(e.pointerId);
};
canvas.onpointerup = () => (drag = false);
canvas.onpointermove = (e) => {
  if (!drag) return;
  yaw -= (e.clientX - last.x) * 0.008;
  pitch = THREE.MathUtils.clamp(
    pitch + (e.clientY - last.y) * 0.005,
    0.05,
    1.2,
  );
  last = { x: e.clientX, y: e.clientY };
};
canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    distance = THREE.MathUtils.clamp(distance + e.deltaY * 0.005, 3, 25);
  },
  { passive: false },
);
function download(data, extension, type) {
  const url = URL.createObjectURL(new Blob([data], { type })),
    a = document.createElement("a");
  a.href = url;
  a.download = `${select.value.replace(":", "-")}.${extension}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
document.querySelector("#export").onclick = () =>
  download(JSON.stringify(model.toJSON()), "json", "application/json");
document.querySelector("#export-glb").onclick = () => {
  const [type, kind] = select.value.split(":");
  const pristine =
    type === "character"
      ? createCharacterRig(kind).root
      : type === "sample"
        ? createArtSample()
        : type === "prop"
          ? createProp(kind)
          : createArchitecture(kind);
  download(exportGLB(pristine), "glb", "model/gltf-binary");
  dispose(pristine);
};
function frame() {
  requestAnimationFrame(frame);
  animator?.update(clipSelect.value, Math.min(clock.getDelta(), 0.05), 1);
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  camera.position.set(
    Math.sin(yaw) * distance * Math.cos(pitch),
    1 + Math.sin(pitch) * distance,
    Math.cos(yaw) * distance * Math.cos(pitch),
  );
  camera.lookAt(0, 1, 0);
  renderer.render(scene, camera);
}
frame();
