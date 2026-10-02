import { createArchitecture } from "../assets/pack/architecture.js";
import { CharacterAnimator } from "../assets/pack/animation.js";
import { createCharacterRig, RIG_CLIPS } from "../assets/pack/characters.js";
import { createSurfaceMaterial } from "../assets/pack/materials.js";
import { ENVIRONMENT_OBJECTS } from "./environment.js";
import {
  BODY_RADIUS,
  circleOverlapsBox,
  segmentBoxEntry,
} from "./collision.js";
import { placeProp, CATALOG, roundedBox } from "../assets/pack/props.js";
import * as THREE from "../vendor/three.module.js";
import { CHAPTERS } from "./content.js";
import { levelFor, floorAt, contains } from "./levels.js";
import { buildLevelGeometry } from "./level-geometry.js";
export { THREE };
const P = {
  cream: 0xe8d9ba,
  stone: 0xc0b89c,
  paper: 0xf6e8c8,
  ink: 0x293d36,
  green: 0x476c48,
  dark: 0x193e34,
  yellow: 0xf3c84c,
  coral: 0xca694e,
  skin: 0xd9ab80,
};
export class World {
  constructor(
    canvas,
    rendererFactory = (options) => new THREE.WebGLRenderer(options),
  ) {
    this.THREE = THREE;
    this.renderer = rendererFactory({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.3));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xe7a789);
    this.scene.fog = new THREE.Fog(0xe7a789, 65, 135);
    this.camera = new THREE.PerspectiveCamera(58, 1, 0.1, 180);
    this.camera.position.set(28, 23, 43);
    this.camera.lookAt(0, 1, -8);
    this.ambient = new THREE.HemisphereLight(0xffefca, 0x527d64, 2);
    this.scene.add(this.ambient);
    this.sun = new THREE.DirectionalLight(0xffe5bb, 2.8);
    this.sun.position.set(-24, 38, 18);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1024, 1024);
    Object.assign(this.sun.shadow.camera, {
      left: -65,
      right: 65,
      top: 65,
      bottom: -65,
      far: 150,
    });
    this.sun.shadow.normalBias = 0.035;
    this.sun.target.position.set(0, 0, -14);
    this.scene.add(this.sun, this.sun.target);
    this.materials = new Map();
    this.actorAnimators = new WeakMap();
    this.environment = new THREE.Group();
    this.scene.add(this.environment);
    this.obstacles = [];
    this.cameraWalls = [];
    this.animated = [];
    this.particles = [];
    this.rings = [];
    this.numbers = [];
    this.decals = [];
    this.projectiles = [];
    this.shake = 0;
    this.hitStop = 0;
    this.setChapter(CHAPTERS[0]);
    this.resize();
  }
  material(color) {
    if (!this.materials.has(color))
      this.materials.set(color, createSurfaceMaterial("concrete", color));
    return this.materials.get(color);
  }
  mesh(geometry, color, position, parent = this.environment) {
    const mesh = new THREE.Mesh(geometry, this.material(color));
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  group(x = 0, y = 0, z = 0, parent = this.environment) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    parent.add(group);
    return group;
  }
  box(x, y, z, w, h, d, color, parent = this.environment) {
    return this.mesh(
      parent.userData.actorGeometry
        ? roundedBox(w, h, d)
        : new THREE.BoxGeometry(w, h, d),
      color,
      [x, y, z],
      parent,
    );
  }
  ball(x, y, z, radius, color, parent = this.environment, segments = 10) {
    return this.mesh(
      new THREE.SphereGeometry(radius, segments, 7),
      color,
      [x, y, z],
      parent,
    );
  }
  cylinder(
    x,
    y,
    z,
    top,
    bottom,
    height,
    color,
    parent = this.environment,
    segments = 10,
  ) {
    return this.mesh(
      new THREE.CylinderGeometry(top, bottom, height, segments),
      color,
      [x, y, z],
      parent,
    );
  }
  beam(from, to, width, color, parent = this.environment) {
    const a = new THREE.Vector3(...from),
      b = new THREE.Vector3(...to),
      mesh = this.mesh(
        new THREE.CylinderGeometry(width, width, a.distanceTo(b), 6),
        color,
        a.clone().add(b).multiplyScalar(0.5).toArray(),
        parent,
      );
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      b.sub(a).normalize(),
    );
    return mesh;
  }
  ramp(points, color) {
    const vertices = [];
    for (const i of [0, 1, 2, 0, 2, 3]) vertices.push(...points[i]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    geometry.computeVertexNormals();
    const mesh = this.mesh(geometry, color, [0, 0.02, 0]);
    mesh.material = this.material(color).clone();
    mesh.material.side = THREE.DoubleSide;
    return mesh;
  }
  obstacle(x, z, w, d, height, color, base = 0) {
    const mesh = this.box(x, base + height / 2, z, w, height, d, color);
    this.obstacles.push({ x, z, w: w / 2, d: d / 2, base, height });
    if (height > 1.6) this.cameraWalls.push(mesh);
    return mesh;
  }
  label(
    text,
    x,
    y,
    z,
    width = 5,
    parent = this.environment,
    background = "#263f35",
    foreground = "#fff1cf",
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 192;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, 1024, 192);
    ctx.fillStyle = foreground;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 76px sans-serif";
    ctx.fillText(text, 512, 100, 970);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, (width * 192) / 1024),
      new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }),
    );
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  marker(position, parent = this.environment) {
    const mesh = this.mesh(
      new THREE.OctahedronGeometry(0.25),
      P.yellow,
      [position.x, this.heightAt(position) + 3.6, position.z],
      parent,
    );
    this.animated.push({ mesh, y: mesh.position.y });
    return mesh;
  }
  prop(
    kind,
    x,
    z,
    { y = this.heightAt({ x, z }), rotation = 0, scale = 1, variant = 0 } = {},
  ) {
    return placeProp(this.environment, kind, {
      x,
      y,
      z,
      rotation,
      scale,
      variant,
    });
  }
  tree(x, z, y = 0) {
    this.prop("tree", x, z, {
      y,
      scale: 1.35,
      variant: Math.round(Math.abs(x + z)) % 4,
    });
    this.obstacles.push({ x, z, w: 0.45, d: 0.45, base: y, height: 3 });
  }
  bench(x, z) {
    this.prop("bench", x, z);
    this.obstacles.push({
      x,
      z,
      w: 1.2,
      d: 0.4,
      base: this.heightAt({ x, z }),
      height: 1.2,
    });
  }
  table(x, z) {
    this.prop("desk", x, z);
    this.obstacles.push({
      x,
      z,
      w: 1.2,
      d: 0.625,
      base: this.heightAt({ x, z }),
      height: 0.85,
    });
  }
  person(kind, x, z) {
    const model = createCharacterRig(kind);
    model.root.position.set(x, this.heightAt({ x, z }), z);
    this.scene.add(model.root);
    this.prepareActor(model);
    return model;
  }

  prepareActor(model) {
    model.flashMaterials = [];
    model.root.traverse((mesh) => {
      if (mesh.isMesh && mesh.material.isMeshStandardMaterial) {
        mesh.material = mesh.material.clone();
        model.flashMaterials.push(mesh.material);
      }
    });
  }
  enemy(kind, x, z, chapter = 1, name = "") {
    const root = this.group(x, 0, z, this.scene),
      body = this.group(0, 0, 0, root),
      arms = [];
    body.userData.actorGeometry = true;
    let humanoid = null;
    if (kind === "boss" && chapter === 3) {
      humanoid = this.person("tio", 0, 0);
      this.scene.remove(humanoid.root);
      body.add(humanoid.root);
      humanoid.root.scale.setScalar(1.65);
      this.box(1.65, 2.2, -0.25, 0.9, 1.8, 0.3, P.ink, body);
      this.box(1.65, 2.25, -0.42, 0.73, 1.3, 0.02, P.green, body);
      this.label("BOM DIA", 1.65, 2.25, -0.44, 0.7, body);
    } else if (kind === "boss" && chapter === 2) {
      this.box(0, 2.4, 0, 2.6, 4, 0.65, P.ink, body);
      this.box(0, 2.4, -0.34, 2.25, 3.5, 0.03, 0x4c7c75, body);
      this.label("AO VIVO", 0, 1.25, -0.38, 1.9, body, "#9d4434");
      for (const side of [-1, 1]) {
        const arm = this.group(side * 1.5, 2.4, 0, body);
        this.box(0, -0.7, 0, 0.4, 1.8, 0.4, P.coral, arm);
        arms.push(arm);
        this.box(side * 0.7, 0.3, 0, 0.5, 0.6, 0.8, P.ink, body);
      }
      this.mesh(
        new THREE.TorusGeometry(2.4, 0.13, 6, 32),
        P.yellow,
        [0, 2.7, 0.5],
        body,
      );
    } else if (kind === "boss") {
      this.cylinder(0, 1.6, 0, 1.3, 1.7, 2.3, P.dark, body);
      this.box(0, 3.15, 0, 2.25, 1.9, 1.5, P.paper, body);
      this.box(0, 3.9, -0.77, 1.7, 0.1, 0.06, P.ink, body);
      for (const x of [-0.65, 0.65])
        this.cylinder(
          x,
          2.6,
          -0.77,
          0.09,
          0.09,
          0.15,
          P.yellow,
          body,
        ).rotation.x = Math.PI / 2;
      this.box(0, 1.45, -1.55, 0.7, 0.9, 0.15, P.paper, body);
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3,
          arm = this.group(
            Math.cos(angle) * 1.1,
            1.8,
            Math.sin(angle) * 1.1,
            body,
          );
        arm.rotation.y = -angle;
        arm.userData.actorGeometry = true;
        this.ball(0, 0, 0, 0.23, P.ink, arm, 8);
        this.ball(1.1, 0, 0, 0.21, P.ink, arm, 8);
        this.box(1, 0, 0, 2.2, 0.28, 0.28, P.coral, arm);
        this.box(2, 0.15, 0, 0.9, 0.65, 0.15, P.paper, arm);
        arms.push(arm);
      }
      this.cylinder(0, 4.25, 0, 1.45, 1.25, 0.25, P.yellow, body);
    } else if (chapter === 1) {
      for (let i = 0; i < 6; i++) {
        const paper = this.box(
          Math.sin(i * 7) * 0.1,
          0.75 + i * 0.28,
          0,
          1.2,
          0.25,
          0.8,
          i % 2 ? P.paper : P.stone,
          body,
        );
        paper.rotation.y = i * 0.13;
      }
      for (const side of [-1, 1]) {
        const arm = this.group(side * 0.8, 1.6, 0, body);
        this.box(0, -0.3, 0, 0.25, 0.7, 0.25, P.ink, arm);
        arms.push(arm);
        this.box(side * 0.35, 0.35, 0, 0.3, 0.6, 0.3, P.ink, body);
      }
    } else {
      this.box(0, 1.5, 0, 1.3, 2.1, 0.4, P.ink, body);
      this.box(
        0,
        1.5,
        -0.22,
        1.08,
        1.75,
        0.03,
        chapter === 2 ? 0x719c97 : 0x69966b,
        body,
      );
      for (const side of [-1, 1]) {
        const arm = this.group(side * 0.8, 1.6, 0, body);
        this.box(0, -0.3, 0, 0.2, 0.7, 0.2, P.ink, arm);
        arms.push(arm);
        this.box(side * 0.35, 0.3, 0, 0.24, 0.6, 0.3, P.ink, body);
        if (chapter === 3)
          this.mesh(
            new THREE.TorusGeometry(0.3, 0.09, 6, 10),
            P.yellow,
            [side * 0.9, 1.3, 0],
            body,
          );
      }
    }
    if (!humanoid)
      for (const side of [-1, 1]) {
        const eyeY = kind === "boss" ? 3.15 : 1.85,
          eyeZ = kind === "boss" ? (chapter === 2 ? -0.38 : -1.05) : -0.46;
        this.ball(side * 0.37, eyeY, eyeZ, 0.28, P.paper, body);
        this.ball(side * 0.37, eyeY, eyeZ - 0.22, 0.1, P.ink, body);
      }
    const label = this.label(
      name.toUpperCase(),
      0,
      kind === "boss" ? 5.9 : 3.2,
      0,
      kind === "boss" ? 4.5 : 3.4,
      root,
    );
    label.userData.nameplate = true;
    const health = this.group(0, kind === "boss" ? 5.3 : 2.8, 0, root);
    health.userData.nameplate = true;
    const barWidth = kind === "boss" ? 3.3 : 1.8;
    this.box(0, 0, 0, barWidth, 0.14, 0.035, 0x302724, health);
    const healthFill = this.box(
      0,
      0,
      0.04,
      barWidth,
      0.12,
      0.01,
      P.yellow,
      health,
    );
    const ring = this.makeRing(kind === "boss" ? 5.5 : 2.7, 0xe94e36);
    ring.visible = false;
    body.traverse((mesh) => {
      if (mesh.isMesh && mesh.material.isMeshStandardMaterial && !humanoid) {
        mesh.material = createSurfaceMaterial(
          mesh.material.color.getHex() === P.paper
            ? "paper"
            : mesh.material.color.getHex() === P.coral
              ? "fabric"
              : "metal",
          mesh.material.color.getHex(),
        );
      }
    });
    const model = {
      root,
      body,
      arms,
      humanoid,
      ring,
      health,
      healthFill,
      barWidth,
      kind,
      chapter,
      action: null,
      hurt: 0,
    };
    this.prepareActor(model);
    return model;
  }
  setHealth(model, hp, max) {
    const ratio = Math.max(0, hp / max);
    model.healthFill.scale.x = ratio;
    model.healthFill.position.x = (-(1 - ratio) * model.barWidth) / 2;
  }
  startAnimation(
    model,
    kind,
    duration = RIG_CLIPS[kind]?.duration || 0.56,
    combo = 0,
  ) {
    model.action = { kind, elapsed: 0, duration, combo, restart: true };
  }
  flashActor(model, duration = 0.18) {
    model.hurt = duration;
  }
  actorFlash(model, dt) {
    model.hurt = Math.max(0, model.hurt - dt);
    for (const material of model.flashMaterials) {
      material.emissive.setHex(model.hurt > 0 ? 0xff7062 : 0x000000);
      material.emissiveIntensity = model.hurt > 0 ? 2.3 : 0;
    }
  }
  animatePerson(model, time, speed, dt = 0, reduced = false, pose = {}) {
    this.actorFlash(model, dt);
    model.animator ??= new CharacterAnimator(model);
    this.actorAnimators.set(model.root, model.animator);
    const action = model.action,
      kind =
        action?.kind ||
        (model.hurt > 0
          ? "hurt"
          : pose.defending
            ? "guard"
            : speed > 1.2
              ? "run"
              : speed > 0.02
                ? "walk"
                : pose.talking
                  ? "talk"
                  : pose.working
                    ? "operate"
                    : "idle");
    model.animator.update(kind, dt, speed, {
      reduced,
      restart: action?.restart || false,
    });
    if (action) {
      action.restart = false;
      action.elapsed += dt;
      if (action.elapsed >= action.duration && action.kind !== "death")
        model.action = null;
    }
    if (!action && speed > 0) {
      model.root.updateMatrixWorld(true);
      for (const leg of model.legs) {
        const foot = leg.children.find((o) => o.isBone)?.children.at(-1);
        if (!foot) continue;
        const point = foot.getWorldPosition(new THREE.Vector3());
        const surface = this.heightAt(point),
          center = this.heightAt(model.root.position);
        leg.position.y =
          0.72 + Math.max(-0.18, Math.min(0.18, surface - center));
      }
    }
  }
  animateEnemy(enemy, dt, time, reduced = false) {
    const m = enemy.model;
    if (m.humanoid) {
      if (enemy.hp <= 0 && m.humanoid.action?.kind !== "death")
        this.startAnimation(m.humanoid, "death", 0.7);
      else if (m.action && m.humanoid.action?.kind !== m.action.kind)
        this.startAnimation(m.humanoid, m.action.kind, m.action.duration);
      this.animatePerson(
        m.humanoid,
        time,
        enemy.phase === "chase" ? 0.5 : 0,
        dt,
        reduced,
      );
      m.humanoid.root.scale.setScalar(1.65);
    }
    this.actorFlash(m, dt);
    m.body.rotation.set(0, 0, 0);
    m.body.position.y = reduced ? 0 : Math.sin(time * 5 + enemy.id) * 0.07;
    if (enemy.hp <= 0) {
      const p = 1 - Math.max(0, enemy.deathTime) / 0.65;
      m.body.rotation.z = p * 1.5;
      m.body.position.y = -p * 0.9;
      m.root.scale.set(1 + 0.25 * p, Math.max(0.15, 1 - p * 0.8), 1);
      return;
    }
    m.root.scale.set(1, 1, 1);
    if (m.action?.kind === "victory") {
      m.action.elapsed += dt;
      const p = Math.sin(
        Math.min(1, m.action.elapsed / m.action.duration) * Math.PI,
      );
      m.body.position.y += p * 0.2;
      for (const [i, arm] of m.arms.entries())
        arm.rotation.z = (i % 2 ? 1 : -1) * p * 0.9;
      if (m.action.elapsed >= m.action.duration) m.action = null;
      return;
    }
    if (enemy.stagger > 0) {
      m.body.rotation.x = -0.3;
      m.body.position.z = 0.15;
      return;
    }
    m.body.position.z = 0;
    if (enemy.phase === "warning") {
      const p = 1 - Math.max(0, enemy.timer) / (enemy.warningDuration || 1);
      m.body.rotation.x = -p * 0.3;
      m.body.position.y = p * (m.chapter === 2 ? 0.3 : 0.45);
      for (const [i, arm] of m.arms.entries())
        arm.rotation.z = (i % 2 ? 1 : -1) * (0.1 + p * 1.4);
      if (m.humanoid) {
        m.humanoid.arms[0].rotation.x = -p * 2.5;
        m.humanoid.arms[1].rotation.x = -p * 2.5;
      }
    } else if (enemy.phase === "recovery") {
      const p = Math.max(0, 1 - (enemy.attack.recovery - enemy.timer) / 0.35);
      m.body.rotation.x = p * 0.55;
      m.body.position.y = -p * 0.3;
      for (const [i, arm] of m.arms.entries())
        arm.rotation.z = (i % 2 ? 1 : -1) * p * 0.8;
      if (m.humanoid) {
        m.humanoid.arms[0].rotation.x = -p * 0.7;
        m.humanoid.arms[1].rotation.x = -p * 0.7;
      }
    } else
      for (const [i, arm] of m.arms.entries())
        arm.rotation.z = Math.sin(time * 6 + i) * 0.17;
  }
  telegraph(attack, position, angle) {
    let geometry;
    if (attack.shape === "line") {
      geometry = new THREE.PlaneGeometry(attack.width * 2, attack.length);
      geometry.translate(0, attack.length / 2, 0);
    } else if (attack.shape === "ring")
      geometry = new THREE.RingGeometry(
        attack.innerRadius || 1,
        attack.radius,
        48,
      );
    else if (attack.shape === "cone")
      geometry = new THREE.CircleGeometry(
        attack.length || attack.radius,
        32,
        Math.PI / 2 - (attack.halfAngle || 0.7),
        (attack.halfAngle || 0.7) * 2,
      );
    else geometry = new THREE.CircleGeometry(attack.radius, 40);
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color: 0xc6412d,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    mesh.rotation.set(-Math.PI / 2, 0, angle);
    mesh.position.set(position.x, this.heightAt(position) + 0.08, position.z);
    this.scene.add(mesh);
    return mesh;
  }
  makeRing(radius, color) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.08, radius, 48),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.08;
    this.scene.add(ring);
    return ring;
  }
  burst(position, color = P.yellow, count = 12) {
    for (let i = 0; i < count; i++) {
      const mesh = this.box(
        position.x,
        (position.y ?? this.heightAt(position)) + 1.2,
        position.z,
        0.13,
        0.13,
        0.13,
        color,
        this.scene,
      );
      this.particles.push({
        mesh,
        life: 0.55,
        velocity: new THREE.Vector3(
          Math.sin(i * 7) * 4,
          2 + (i % 3),
          Math.cos(i * 7) * 4,
        ),
      });
    }
  }
  pulse(position, radius, color) {
    const ring = this.makeRing(radius, color);
    ring.position.set(position.x, this.heightAt(position) + 0.09, position.z);
    this.rings.push({ mesh: ring, life: 0.5, maxLife: 0.5 });
  }
  slash(position, angle, combo = 0, radius = 3.3, halfAngle = Math.PI * 0.36) {
    const vertices = [];
    for (let i = 0; i < 28; i++) {
      for (const [t, r] of [
        [i / 28, 1],
        [(i + 1) / 28, 1],
        [i / 28, 0.75],
        [(i + 1) / 28, 1],
        [(i + 1) / 28, 0.75],
        [i / 28, 0.75],
      ]) {
        const a = (t - 0.5) * 2 * halfAngle;
        vertices.push(
          Math.sin(a) * radius * r,
          0.3 * Math.sin(a) * (combo ? 1 : -1),
          -Math.cos(a) * radius * r,
        );
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color: 0xffe5a0,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    mesh.position.set(position.x, this.heightAt(position) + 1.4, position.z);
    mesh.rotation.y = angle;
    this.scene.add(mesh);
    this.rings.push({ mesh, life: 0.22, maxLife: 0.22, slash: true });
  }
  damageNumber(position, value, color = "#fff1bb") {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.font = "900 75px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 11;
    ctx.strokeStyle = "#211d19";
    ctx.strokeText(String(value), 128, 64);
    ctx.fillStyle = color;
    ctx.fillText(String(value), 128, 64);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
      }),
    );
    mesh.position.set(
      position.x,
      (position.y ?? this.heightAt(position)) + 3,
      position.z,
    );
    mesh.scale.set(2.4, 1.2, 1);
    mesh.renderOrder = 30;
    this.scene.add(mesh);
    this.numbers.push({ mesh, life: 0.9 });
  }
  blood(position, count = 13) {
    const base = this.heightAt(position);
    for (let i = 0; i < count; i++) {
      const radius = 0.09 + (i % 3) * 0.035,
        mesh = this.ball(
          position.x,
          base + 1.4,
          position.z,
          radius,
          0x9b1e21,
          this.scene,
          5,
        );
      this.particles.push({
        mesh,
        life: 0.75,
        velocity: new THREE.Vector3(
          Math.sin(i * 4.9) * 3.2,
          1.5 + (i % 4) * 0.55,
          Math.cos(i * 4.9) * 3.2,
        ),
        blood: true,
        ground: base,
      });
    }
    const decal = new THREE.Mesh(
      new THREE.CircleGeometry(0.65, 12),
      new THREE.MeshBasicMaterial({
        color: 0x851f23,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
      }),
    );
    decal.rotation.x = -Math.PI / 2;
    decal.position.set(position.x, base + 0.035, position.z);
    decal.scale.set(1, 0.65, 1);
    this.scene.add(decal);
    this.decals.push({ mesh: decal, life: 9 });
    if (this.decals.length > 32) {
      const old = this.decals.shift();
      this.disposeEffect(old.mesh);
    }
  }
  impact(
    position,
    damage,
    { player = false, blood = true, blocked = false, reduced = false } = {},
  ) {
    this.damageNumber(
      position,
      blocked ? "BLOQUEIO" : `−${damage}`,
      player ? "#ff9689" : "#fff1bb",
    );
    if (blood && !blocked) this.blood(position);
    else this.burst(position, blocked ? 0xa9e4dd : P.yellow, 10);
    this.hitStop = Math.min(0.06, Math.max(this.hitStop, 0.05));
    if (!reduced) this.shake = Math.max(this.shake, player ? 0.32 : 0.1);
  }
  projectile(from, to, color = P.yellow, duration = 0.3) {
    const mesh = this.ball(
      from.x,
      (from.y ?? this.heightAt(from)) + 1.7,
      from.z,
      0.23,
      color,
      this.scene,
      6,
    );
    this.projectiles.push({
      mesh,
      from: mesh.position.clone(),
      to: new THREE.Vector3(to.x, this.heightAt(to) + 0.3, to.z),
      life: duration,
      maxLife: duration,
    });
  }
  disposeEffect(mesh) {
    this.scene.remove(mesh);
    mesh.geometry?.dispose();
    if (mesh.material.map) mesh.material.map.dispose();
    if (![...this.materials.values()].includes(mesh.material))
      mesh.material.dispose();
  }
  clearEffects() {
    for (const list of [
      this.particles,
      this.rings,
      this.numbers,
      this.decals,
      this.projectiles,
    ]) {
      for (const item of list) this.disposeEffect(item.mesh);
      list.length = 0;
    }
    this.hitStop = 0;
    this.shake = 0;
  }
  update(dt, time) {
    this.effectTime = (this.effectTime || 0) + dt;
    if (this.gateDoor && !this.practice) {
      const hinge = this.gateDoor.getObjectByName("hinge");
      hinge.rotation.y +=
        ((this.gateDoor.userData.open ? -Math.PI * 0.5 : 0) -
          hinge.rotation.y) *
        Math.min(1, dt * 8);
    }
    for (const prop of this.environmentProps || []) {
      if (!prop.userData.active) continue;
      for (const [node, angle] of [
        ["doorLeft", -1.4],
        ["doorRight", 1.4],
      ]) {
        const hinge = prop.getObjectByName(node);
        if (hinge)
          hinge.rotation.y += (angle - hinge.rotation.y) * Math.min(1, dt * 6);
      }
    }
    for (const a of this.animated) {
      a.mesh.rotation.y += dt;
      a.mesh.position.y = a.y + Math.sin(time * 2) * 0.15;
    }
    for (const p of this.particles) {
      p.life -= dt;
      p.velocity.y -= dt * 13;
      p.mesh.position.addScaledVector(p.velocity, dt);
      p.mesh.rotation.x += dt * 4;
      if (p.blood && p.mesh.position.y < (p.ground ?? 0) + 0.05) {
        p.mesh.position.y = (p.ground ?? 0) + 0.05;
        p.velocity.set(0, 0, 0);
      }
      p.mesh.scale.setScalar(Math.max(0.05, p.life * 1.7));
    }
    for (const r of this.rings) {
      r.life -= dt;
      if (!r.slash) r.mesh.scale.setScalar(1 + (r.maxLife - r.life) * 0.8);
      r.mesh.material.opacity =
        Math.max(0, r.life / r.maxLife) * (r.slash ? 0.95 : 0.3);
    }
    for (const n of this.numbers) {
      n.life -= dt;
      n.mesh.position.y += dt * 1.5;
      n.mesh.material.opacity = Math.min(1, n.life * 3);
    }
    for (const d of this.decals) {
      d.life -= dt;
      d.mesh.material.opacity = Math.min(0.65, Math.max(0, d.life / 2));
    }
    for (const p of this.projectiles) {
      p.life -= dt;
      p.mesh.position.lerpVectors(
        p.from,
        p.to,
        Math.min(1, 1 - p.life / p.maxLife),
      );
    }
    for (const list of [
      this.particles,
      this.rings,
      this.numbers,
      this.decals,
      this.projectiles,
    ])
      for (let i = list.length - 1; i >= 0; i--)
        if (list[i].life <= 0) {
          this.disposeEffect(list[i].mesh);
          list.splice(i, 1);
        }
    this.shake = Math.max(0, this.shake - dt * 1.8);
  }
  heightAt(position) {
    return floorAt(this.level, position.x, position.z) ?? 0;
  }
  canWalk(
    x,
    z,
    state = { permit: true, stage: "coffee", stamp: true },
    radius = BODY_RADIUS,
  ) {
    for (const [dx, dz] of [
      [0, 0],
      [radius, 0],
      [-radius, 0],
      [0, radius],
      [0, -radius],
      [radius * 0.707, radius * 0.707],
      [-radius * 0.707, radius * 0.707],
      [radius * 0.707, -radius * 0.707],
      [-radius * 0.707, -radius * 0.707],
    ])
      if (floorAt(this.level, x + dx, z + dz, state) === null) return false;
    const y = this.heightAt({ x, z });
    return !this.obstacles.some(
      (o) =>
        circleOverlapsBox(x, z, radius, o) &&
        y < o.base + o.height - 0.1 &&
        y + 2 > o.base,
    );
  }
  move(position, dx, dz, access = true) {
    const state =
      typeof access === "object"
        ? access
        : { permit: access, stage: access ? "coffee" : "permit", stamp: false };
    const steps = Math.max(
      1,
      Math.ceil(Math.max(Math.abs(dx), Math.abs(dz)) / 0.18),
    );
    for (let i = 0; i < steps; i++) {
      const before = this.heightAt(position);
      if (
        this.canWalk(position.x + dx / steps, position.z, state) &&
        Math.abs(
          this.heightAt({ x: position.x + dx / steps, z: position.z }) - before,
        ) < 0.25
      )
        position.x += dx / steps;
      if (
        this.canWalk(position.x, position.z + dz / steps, state) &&
        Math.abs(
          this.heightAt({ x: position.x, z: position.z + dz / steps }) -
            this.heightAt(position),
        ) < 0.25
      )
        position.z += dz / steps;
    }
    return position;
  }
  lineOfSight(a, b) {
    const from = { x: a.x, y: (a.y ?? this.heightAt(a)) + 1.2, z: a.z };
    const to = { x: b.x, y: (b.y ?? this.heightAt(b)) + 1.2, z: b.z };
    return !this.obstacles.some((o) => segmentBoxEntry(from, to, o) !== null);
  }
  canTravel(from, to, state, radius = BODY_RADIUS) {
    const steps = Math.max(
      1,
      Math.ceil(Math.hypot(to.x - from.x, to.z - from.z) / 0.18),
    );
    let previous = this.heightAt(from);
    for (let i = 1; i <= steps; i++) {
      const p = {
          x: from.x + ((to.x - from.x) * i) / steps,
          z: from.z + ((to.z - from.z) * i) / steps,
        },
        height = this.heightAt(p);
      if (
        !this.canWalk(p.x, p.z, state, radius) ||
        Math.abs(height - previous) > 0.25
      )
        return false;
      previous = height;
    }
    return true;
  }
  nextWaypoint(from, to, state, zone) {
    if (this.canTravel(from, to, state, 0.4)) return to;
    const spacing = 0.8,
      key = (x, z) => `${x},${z}`,
      start = {
        x: Math.round(from.x / spacing),
        z: Math.round(from.z / spacing),
      },
      end = { x: Math.round(to.x / spacing), z: Math.round(to.z / spacing) },
      queue = [start],
      seen = new Map([[key(start.x, start.z), null]]);
    let goal = null;
    for (let i = 0; i < queue.length && i < 1500; i++) {
      const node = queue[i];
      if (Math.hypot(node.x - end.x, node.z - end.z) < 1.5) {
        goal = node;
        break;
      }
      for (const [dx, dz] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const next = { x: node.x + dx, z: node.z + dz },
          id = key(next.x, next.z),
          x = next.x * spacing,
          z = next.z * spacing;
        if (
          seen.has(id) ||
          !contains({ ...zone, type: zone.radius ? "circle" : "rect" }, x, z) ||
          !this.canWalk(x, z, state, 0.55)
        )
          continue;
        seen.set(id, node);
        queue.push(next);
      }
    }
    if (!goal) return { x: from.x, z: from.z };
    let current = goal,
      parent = seen.get(key(current.x, current.z));
    while (parent && seen.get(key(parent.x, parent.z))) {
      current = parent;
      parent = seen.get(key(current.x, current.z));
    }
    return { x: current.x * spacing, z: current.z * spacing };
  }
  inArena(position, boss = false) {
    const zone = boss ? this.level.bossArena : this.level.firstArena;
    return contains(
      { ...zone, type: zone.radius ? "circle" : "rect" },
      position.x,
      position.z,
    );
  }
  sync(state) {
    if (this.practice) return;
    this.gate.visible = false;
    if (this.gateDoor) this.gateDoor.userData.open = state.permit;
    this.evidenceObject.visible = !state.stamp;
    this.collectionObject.visible = state.stage !== "complete";
    this.sideObject.visible = state.sideQuest === "active";
    this.stampMarker.visible = !state.stamp;
    this.nairMarker.visible = !state.talked;
    this.questMarker.visible = ["permit", "coffee"].includes(state.stage);
    const p =
      state.stage === "coffee" ? this.level.collection : this.level.gatekeeper;
    this.questMarker.position.set(p.x, this.heightAt(p) + 3.6, p.z);
    this.animated.find((a) => a.mesh === this.questMarker).y =
      this.heightAt(p) + 3.6;
    if (this.shortcutGate)
      this.shortcutGate.visible = !(
        state.stamp || state.environment["3:bridge"]
      );
    for (const prop of this.environmentProps || [])
      prop.userData.active = !!state.environment[prop.userData.environmentId];
    for (const prop of this.environmentProps || [])
      prop.traverse((mesh) => {
        if (mesh.isMesh) {
          mesh.material.emissive?.setHex(
            state.environment[prop.userData.environmentId] ? 0x19382a : 0,
          );
        }
      });
    for (const npc of this.npcs) {
      npc.working = npc.id === "estagiario" && state.sideQuest === "active";
    }
  }
  disposeGroup(group) {
    if (!group) return;
    group.traverse((mesh) => {
      this.actorAnimators.get(mesh)?.dispose();
      this.actorAnimators.delete(mesh);
      if (!mesh.isMesh) return;
      mesh.geometry.dispose();
      if (mesh.material.map) {
        if (!mesh.material.map.userData.shared) mesh.material.map.dispose();
        mesh.material.dispose();
      } else if (![...this.materials.values()].includes(mesh.material))
        mesh.material.dispose();
    });
    group.parent?.remove(group);
  }
  setChapter(content) {
    this.practice = false;
    this.disposeGroup(this.environment);
    this.environment = new THREE.Group();
    this.scene.add(this.environment);
    this.level = levelFor(content.number);
    this.chapter = content.number;
    this.obstacles = [];
    this.cameraWalls = [];
    this.animated = [];
    this.shortcutGate = null;
    this.environmentProps = [];
    this.gateDoor = null;
    this.scene.background.setHex(
      content.number === 2
        ? 0x273c45
        : content.number === 3
          ? 0xe9b791
          : 0xe7a789,
    );
    this.scene.fog.color.copy(this.scene.background);
    this.ambient.intensity = content.number === 2 ? 1.25 : 2;
    this.sun.intensity = content.number === 2 ? 1.6 : 2.8;
    buildLevelGeometry(this);
    for (const object of ENVIRONMENT_OBJECTS[content.number] || []) {
      const point = object.point,
        root =
          (object.kind === "camera"
            ? this.environment.children.find(
                (o) =>
                  o.name === "camera" &&
                  o.position.x === point.x &&
                  o.position.z === point.z,
              )
            : null) ||
          this.prop(
            object.kind === "cabinet"
              ? "cabinet"
              : object.kind === "camera"
                ? "camera"
                : "console",
            point.x,
            point.z,
            { scale: object.kind === "console" ? 0.65 : 0.9 },
          );
      const footprint = CATALOG[root.name]?.footprint || [1, 1],
        scale = root.scale.x;
      this.obstacles.push({
        x: point.x,
        z: point.z,
        w: (footprint[0] * scale) / 2,
        d: (footprint[1] * scale) / 2,
        base: this.heightAt(point),
        height:
          object.kind === "camera"
            ? 0.6
            : object.kind === "cabinet"
              ? 1.62
              : 1.5,
      });
      root.userData.environmentId = `${content.number}:${object.id}`;
      this.environmentProps.push(root);
      this.label(
        object.name,
        point.x,
        this.heightAt(point) + 2.6,
        point.z,
        3.5,
      );
    }
    const gate = this.level.gate,
      y = this.heightAt(gate);
    this.gate = this.box(
      gate.x,
      y + 1.2,
      gate.z,
      gate.w,
      2.4,
      gate.d,
      P.yellow,
    );
    this.gate.visible = false;
    this.gateDoor = createArchitecture("door");
    this.gateDoor.position.set(gate.x, y, gate.z);
    this.gateDoor.scale.x = Math.max(gate.w, gate.d) / 1.55;
    if (gate.d > gate.w) this.gateDoor.rotation.y = Math.PI / 2;
    this.environment.add(this.gateDoor);
    this.label(content.subtitle, gate.x, y + 2.95, gate.z, 3.8);
    this.npcs = [
      ["nair", "witness", content.npc.witness],
      ["assessor", "gatekeeper", content.npc.gatekeeper],
      ["estagiario", "helper", content.npc.helper],
    ].map(([id, point, name]) => {
      const p = this.level[point],
        model = this.person(id, p.x, p.z);
      model.root.position.y = this.heightAt(p);
      model.root.rotation.y = Math.PI;
      this.environment.add(model.root);
      const label = this.label(
        name.toUpperCase(),
        p.x,
        this.heightAt(p) + 3.2,
        p.z,
        4,
      );
      label.userData.npcLabel = true;
      return { id, name, x: p.x, z: p.z, model };
    });
    const helper = this.level.helper;
    this.prop("desk", helper.x, helper.z - 1);
    this.obstacles.push({
      x: helper.x,
      z: helper.z - 1,
      w: 1.2,
      d: 0.625,
      base: this.heightAt(helper),
      height: 1.05,
    });
    const evidence = this.level.evidence;
    this.evidenceObject = this.group(
      evidence.x,
      this.heightAt(evidence) + 1,
      evidence.z,
    );
    this.box(
      0,
      0,
      0,
      0.9,
      0.25,
      0.65,
      content.number === 1 ? P.dark : P.paper,
      this.evidenceObject,
    );
    if (content.number === 1)
      this.cylinder(0, 0.35, 0, 0.15, 0.12, 0.5, P.coral, this.evidenceObject);
    else
      this.label(
        content.number === 2 ? "VÍDEO ORIGINAL" : "MENSAGEM ORIGINAL",
        0,
        0.4,
        0.35,
        2,
        this.evidenceObject,
      );
    this.label(
      content.prop,
      evidence.x,
      this.heightAt(evidence) + 2.8,
      evidence.z,
      5,
    );
    this.stampMarker = this.marker(evidence);
    const item = this.level.sideItem;
    this.sideObject = this.group(item.x, this.heightAt(item) + 1.05, item.z);
    this.box(
      0,
      0,
      0,
      0.9,
      0.3,
      0.65,
      content.number === 1 ? P.paper : P.ink,
      this.sideObject,
    );
    this.label(content.sideItem.toUpperCase(), 0, 0.8, 0, 3.6, this.sideObject);
    if (content.number === 3)
      for (const x of [-0.3, 0.3])
        this.cylinder(x, 0.5, 0, 0.04, 0.04, 0.8, P.ink, this.sideObject);
    const c = this.level.collection;
    this.collectionObject = this.group(c.x, this.heightAt(c) + 0.6, c.z);
    if (content.number === 3)
      for (let i = 0; i < 3; i++) {
        this.box(
          (i - 1) * 1.1,
          0,
          0,
          0.9,
          1.1,
          0.65,
          P.yellow,
          this.collectionObject,
        );
        this.label(
          "CAFÉ",
          (i - 1) * 1.1,
          0.1,
          0.34,
          0.8,
          this.collectionObject,
        );
      }
    else {
      this.box(0, 0, 0, 1.8, 0.2, 1.1, P.paper, this.collectionObject);
      this.label(
        content.number === 1 ? "37-B / SALA DE MÍDIA" : "CLIENTE: BOMDIA37",
        0,
        0.4,
        0.6,
        3,
        this.collectionObject,
      );
    }
    this.nairMarker = this.marker(this.level.witness);
    this.questMarker = this.marker(this.level.gatekeeper);
  }
  resize() {
    this.renderer.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }
  showTarget(position) {
    if (!this.lockMarker) {
      this.lockMarker = new THREE.Mesh(
        new THREE.RingGeometry(0.65, 0.75, 24),
        new THREE.MeshBasicMaterial({
          color: 0xfff4d9,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
      this.lockMarker.rotation.x = -Math.PI / 2;
      this.scene.add(this.lockMarker);
    }
    this.lockMarker.visible = !!position;
    if (position)
      this.lockMarker.position.set(
        position.x,
        this.heightAt(position) + 0.07,
        position.z,
      );
  }
  render() {
    this.scene.traverse((mesh) => {
      if (mesh.userData.nameplate) {
        const root = mesh.parent;
        mesh.rotation.y =
          Math.atan2(
            this.camera.position.x - root.position.x,
            this.camera.position.z - root.position.z,
          ) - root.rotation.y;
      }
    });
    this.renderer.render(this.scene, this.camera);
  }
}
