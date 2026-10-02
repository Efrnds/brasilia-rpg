import { InputRouter } from "./input-controller.js";
import { createContentPreview } from "./content-preview.js";
import { diagnosticBundle, downloadReport } from "./feedback.js";
import { MOVEMENT } from "./tuning.js";
import { SceneFraming } from "./cinematics.js";

import { createInterfaceController } from "./interface-controller.js";
import { createEncounterController } from "./encounter-controller.js";
import { createInvestigationController } from "./investigation-controller.js";
import { buildExtraCase } from "./expansion.js";
import { completeTutorial } from "./tutorial.js";

import {
  element,
  addOverlay,
  button,
  labeledSelect,
  renderHistory,
  updateControls,
} from "./ui.js";
import {
  EQUIPMENT,
  SPECIALIZATIONS,
  skillCatalog,
  equipSkill,
  equipItem,
  useSupport,
} from "./rpg.js";
import { SaveRepository, SLOT_KEYS } from "./persistence.js";
import { InputBindings, INPUT_LABELS, keyLabel } from "./input.js";
import {
  EXTRA_SETTINGS,
  sanitizeSettings,
  applyAccessibility,
} from "./settings.js";
import { FrameDiagnostics } from "./diagnostics.js";
import { buildTraining } from "./training.js";
import { FollowCamera } from "./camera.js";
import { FixedSimulation } from "./simulation.js";
import { BASIC_ATTACK, DODGE } from "./combat.js";
import { World, THREE } from "./world.js";
import {
  CHARACTERS,
  createGame,
  tickState,
  dodge,
  receiveDamage,
  restoreEncounter,
  upgrade,
  snapshot,
  parseSave,
  distance,
  clamp,
  recoverCoffee,
  nextChapter,
  damageMultiplier,
} from "./domain.js";
import { chapterContent, campaignEnding } from "./content.js";
import { GameAudio } from "./audio.js";

const $ = (id) => document.getElementById(id);
const screens = [
  "menu",
  "selection",
  "pause",
  "settings",
  "help",
  "dialogue",
  "journal",
  "upgrade",
  "defeat",
  "interlude",
  "ending",
  "error",
  "loadout",
  "conversation-log",
  "case-library",
];
const audio = new GameAudio();
const saves = new SaveRepository(localStorage);
const input = new InputBindings();
const inputRouter = new InputRouter(input);
try {
  saves.select(Number(localStorage.getItem("brasilia-active-slot")) || 0);
} catch {}
let historyReturn = "play";
let contentPreview = null;
let awaitingBinding = null,
  lockedTarget = null,
  pendingSkill = null,
  bufferedDodge = 0,
  stepDistance = 0,
  extraCase = null,
  extraProgress = [],
  challenge = false;
const movementVelocity = new THREE.Vector2();
const diagnostics = new FrameDiagnostics(
  new URLSearchParams(location.search).get("debug") === "1",
);
let world,
  state = null,
  mode = "menu",
  selected = "luli",
  player,
  checkpointRaw = null;
let settingsReturn = "menu",
  helpReturn = "menu",
  lastFocus = null;
let gameplayActive = false,
  dialogueReturn = "play",
  dialogueClosable = true;
let ignorePointerUnlock = false;
let settings = {
  ...EXTRA_SETTINGS,
  volume: 35,
  sensitivity: 50,
  difficulty: "normal",
  quality: "balanced",
  reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
};
let saveWarning = "";
const keys = new Set();
let mouseHeld = false,
  defending = false,
  dragging = false,
  cameraYaw = 0,
  cameraPitch = 0.4;
let attackVisual = 0,
  pendingAttack = null,
  combo = 0,
  toastTime = 0,
  flashTime = 0,
  interactTarget = null;
let enemyId = 0,
  hudTimer = 0,
  lastTime = 0;
const enemies = [],
  playerModels = {};
const followCamera = new FollowCamera(),
  simulation = new FixedSimulation();
let bufferedAttack = 0,
  practice = false,
  practiceAggressive = false;
const cameraTarget = new THREE.Vector3();
const framing = new SceneFraming();
const runtime = {
  get attackVisual() {
    return attackVisual;
  },
  set attackVisual(value) {
    attackVisual = value;
  },
  get audio() {
    return audio;
  },
  set audio(value) {
    audio = value;
  },
  get bufferedAttack() {
    return bufferedAttack;
  },
  set bufferedAttack(value) {
    bufferedAttack = value;
  },
  get challenge() {
    return challenge;
  },
  set challenge(value) {
    challenge = value;
  },
  get checkpointRaw() {
    return checkpointRaw;
  },
  set checkpointRaw(value) {
    checkpointRaw = value;
  },
  get combo() {
    return combo;
  },
  set combo(value) {
    combo = value;
  },
  get defending() {
    return defending;
  },
  set defending(value) {
    defending = value;
  },
  get dialogueClosable() {
    return dialogueClosable;
  },
  set dialogueClosable(value) {
    dialogueClosable = value;
  },
  get dialogueReturn() {
    return dialogueReturn;
  },
  set dialogueReturn(value) {
    dialogueReturn = value;
  },
  get enemies() {
    return enemies;
  },
  set enemies(value) {
    enemies = value;
  },
  get enemyId() {
    return enemyId;
  },
  set enemyId(value) {
    enemyId = value;
  },
  get extraCase() {
    return extraCase;
  },
  set extraCase(value) {
    extraCase = value;
  },
  get extraProgress() {
    return extraProgress;
  },
  set extraProgress(value) {
    extraProgress = value;
  },
  get flashTime() {
    return flashTime;
  },
  set flashTime(value) {
    flashTime = value;
  },
  get gameplayActive() {
    return gameplayActive;
  },
  set gameplayActive(value) {
    gameplayActive = value;
  },
  get input() {
    return input;
  },
  set input(value) {
    input = value;
  },
  get interactTarget() {
    return interactTarget;
  },
  set interactTarget(value) {
    interactTarget = value;
  },
  get lockedTarget() {
    return lockedTarget;
  },
  set lockedTarget(value) {
    lockedTarget = value;
  },
  get mode() {
    return mode;
  },
  set mode(value) {
    mode = value;
  },
  get pendingAttack() {
    return pendingAttack;
  },
  set pendingAttack(value) {
    pendingAttack = value;
  },
  get pendingSkill() {
    return pendingSkill;
  },
  set pendingSkill(value) {
    pendingSkill = value;
  },
  get player() {
    return player;
  },
  set player(value) {
    player = value;
  },
  get practice() {
    return practice;
  },
  set practice(value) {
    practice = value;
  },
  get practiceAggressive() {
    return practiceAggressive;
  },
  set practiceAggressive(value) {
    practiceAggressive = value;
  },
  get selected() {
    return selected;
  },
  set selected(value) {
    selected = value;
  },
  get settings() {
    return settings;
  },
  set settings(value) {
    settings = value;
  },
  get state() {
    return state;
  },
  set state(value) {
    state = value;
  },
  get framing() {
    return framing;
  },
  get world() {
    return world;
  },
  set world(value) {
    world = value;
  },
};
Object.defineProperties(runtime, {
  startReplay: { get: () => startReplay },
  safeRead: { get: () => safeRead },
  startChallenge: { get: () => startChallenge },
  persist: { get: () => persist },
  basicAttack: { get: () => basicAttack },
  beginWarning: { get: () => beginWarning },
  buildSkills: { get: () => buildSkills },
  chooseUpgrade: { get: () => chooseUpgrade },
  collectEvidence: { get: () => collectEvidence },
  combatFeedback: { get: () => combatFeedback },
  damageEnemy: { get: () => damageEnemy },
  drawMinimap: { get: () => drawMinimap },
  faceTarget: { get: () => faceTarget },
  finish: { get: () => finish },
  interact: { get: () => interact },
  interactEnvironment: { get: () => interactEnvironment },
  interactionAt: { get: () => interactionAt },
  livingEnemies: { get: () => livingEnemies },
  loadEncounter: { get: () => loadEncounter },
  makeEnemy: { get: () => makeEnemy },
  nearestEnemy: { get: () => nearestEnemy },
  notify: { get: () => notify },
  openDialogue: { get: () => openDialogue },
  openJournal: { get: () => openJournal },
  performSkill: { get: () => performSkill },
  refreshSlots: { get: () => refreshSlots },
  resolveAttack: { get: () => resolveAttack },
  resolveSkill: { get: () => resolveSkill },
  returnMenu: { get: () => returnMenu },
  runInvestigation: { get: () => runInvestigation },
  saveCheckpoint: { get: () => saveCheckpoint },
  show: { get: () => show },
  showUpgrade: { get: () => showUpgrade },
  start: { get: () => start },
  startTraining: { get: () => startTraining },
  tickFeedback: { get: () => tickFeedback },
  updateContinue: { get: () => updateContinue },
  updateEnemies: { get: () => updateEnemies },
  updateHUD: { get: () => updateHUD },
});
const interface_controller = createInterfaceController(runtime);
const buildSkills = (...args) => interface_controller.buildSkills(...args);
const openDialogue = (...args) => interface_controller.openDialogue(...args);
const drawMinimap = (...args) => interface_controller.drawMinimap(...args);
const updateHUD = (...args) => interface_controller.updateHUD(...args);
const openJournal = (...args) => interface_controller.openJournal(...args);
const showUpgrade = (...args) => interface_controller.showUpgrade(...args);
const chooseUpgrade = (...args) => interface_controller.chooseUpgrade(...args);
const encounter_controller = createEncounterController(runtime);
const makeEnemy = (...args) => encounter_controller.makeEnemy(...args);
const loadEncounter = (...args) => encounter_controller.loadEncounter(...args);
const livingEnemies = (...args) => encounter_controller.livingEnemies(...args);
const damageEnemy = (...args) => encounter_controller.damageEnemy(...args);
const nearestEnemy = (...args) => encounter_controller.nearestEnemy(...args);
const faceTarget = (...args) => encounter_controller.faceTarget(...args);
const basicAttack = (...args) => encounter_controller.basicAttack(...args);
const resolveAttack = (...args) => encounter_controller.resolveAttack(...args);
const performSkill = (...args) => encounter_controller.performSkill(...args);
const resolveSkill = (...args) => encounter_controller.resolveSkill(...args);
const beginWarning = (...args) => encounter_controller.beginWarning(...args);
const updateEnemies = (...args) => encounter_controller.updateEnemies(...args);
const investigation_controller = createInvestigationController(runtime);
const runInvestigation = (...args) =>
  investigation_controller.runInvestigation(...args);
const collectEvidence = (...args) =>
  investigation_controller.collectEvidence(...args);
const interactEnvironment = (...args) =>
  investigation_controller.interactEnvironment(...args);
const interact = (...args) => investigation_controller.interact(...args);
const interactionAt = (...args) =>
  investigation_controller.interactionAt(...args);

function safeRead(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function persist(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
try {
  const stored = JSON.parse(safeRead("brasilia-settings") || "null");
  if (stored && typeof stored === "object") {
    Object.assign(settings, sanitizeSettings(stored));
    if (stored.bindings)
      input.bindings = new InputBindings(stored.bindings).bindings;
    settings.volume = clamp(Number(stored.volume) || 0, 0, 100);
    settings.sensitivity = clamp(Number(stored.sensitivity) || 50, 10, 100);
    settings.difficulty =
      stored.difficulty === "relaxed" ? "relaxed" : "normal";
    settings.quality = ["performance", "balanced", "quality"].includes(
      stored.quality,
    )
      ? stored.quality
      : "balanced";
    settings.reducedMotion =
      typeof stored.reducedMotion === "boolean"
        ? stored.reducedMotion
        : settings.reducedMotion;
  }
} catch {
  /* A malformed preference file should not prevent a new campaign. */
}
audio.volume = settings.volume / 100;

function notify(text, duration = 3.5) {
  $("toast").textContent = text;
  $("toast").classList.remove("hidden");
  toastTime = duration;
}
function resetInputs() {
  bufferedDodge = 0;
  bufferedAttack = 0;
  movementVelocity.set(0, 0);
  keys.clear();
  mouseHeld = false;
  defending = false;
  dragging = false;
}
function show(next) {
  if (mode === "play" && next !== "play") lastFocus = document.activeElement;
  if (next !== "dialogue" && next !== "conversation-log") framing.clear();
  mode = next;
  resetInputs();
  if (next === "selection")
    for (const option of document.querySelectorAll("[data-character]"))
      option.setAttribute(
        "aria-pressed",
        String(option.dataset.character === selected),
      );
  for (const id of screens) $(id).classList.toggle("hidden", id !== next);
  $("hud").classList.toggle(
    "hidden",
    !state || !gameplayActive || ["menu", "selection", "error"].includes(next),
  );
  if (next !== "play") {
    if (document.pointerLockElement) {
      ignorePointerUnlock = true;
      document.exitPointerLock();
    }
    queueMicrotask(() =>
      $(next)
        ?.querySelector("button:not(:disabled),select,input,a")
        ?.focus({ preventScroll: true }),
    );
  } else {
    if (lastFocus && lastFocus.closest("#hud"))
      lastFocus.focus({ preventScroll: true });
    else $("world").focus({ preventScroll: true });
  }
  if (next === "menu") {
    updateContinue();
    refreshSlots();
  }
  $("export-save").disabled = practice;
  if (next === "pause")
    $("pause-save-status").textContent = practice
      ? "Treino livre. O checkpoint da campanha não é alterado."
      : saveWarning ||
        "Dados locais. Limpar os dados do navegador apaga o save; exporte uma cópia.";
}
function saveCheckpoint() {
  if (practice) return;
  checkpointRaw = JSON.stringify(snapshot(state));
  if (!persist(SLOT_KEYS[saves.slot], checkpointRaw)) {
    saveWarning =
      "O navegador não permitiu salvar. Exporte o checkpoint pelo menu de pausa.";
    notify(saveWarning, 5);
  }
}
function updateContinue() {
  const raw = safeRead(SLOT_KEYS[saves.slot]);
  $("continue-game").disabled = true;
  $("save-message").textContent =
    saveWarning || "Nenhum checkpoint salvo. Abra uma investigação.";
  if (raw) {
    try {
      const saved = parseSave(raw);
      $("continue-game").disabled = false;
      $("save-message").textContent =
        `Checkpoint: ${CHARACTERS[saved.character].name} • capítulo ${saved.chapter}${saved.stage === "complete" ? " concluído" : " em andamento"}.`;
    } catch (error) {
      $("save-message").textContent =
        error.message + " Você pode começar uma nova investigação.";
    }
  }
}
function start(nextState, raw = null, { training = false } = {}) {
  practice = training;
  extraCase = null;
  extraProgress = [];
  challenge = false;
  state = nextState;
  movementVelocity.set(0, 0);
  simulation.reset();
  bufferedAttack = 0;
  selected = state.character;
  gameplayActive = true;
  world.epilogue = false;
  if (contentPreview) {
    world.disposeGroup(contentPreview);
    contentPreview = null;
  }
  world.setChapter(chapterContent(state));
  if (practice) {
    buildTraining(world);
    state.position = { ...world.level.spawn };
  }
  for (const enemy of enemies) {
    world.disposeGroup(enemy.model.root);
    world.disposeGroup(enemy.model.ring);
  }
  enemies.length = 0;
  enemyId = 0;
  for (const point of world.level.mobs) makeEnemy("paper", point.x, point.z);
  makeEnemy("boss", world.level.boss.x, world.level.boss.z);
  world.clearEffects();
  pendingAttack = null;
  pendingSkill = null;
  lockedTarget = null;
  bufferedDodge = 0;
  stepDistance = 0;
  audio.setScene(state.chapter);
  attackVisual = 0;
  flashTime = 0;
  combo = 0;
  toastTime = 0;
  followCamera.reset(state.position, world.heightAt(state.position));
  cameraYaw = 0;
  cameraPitch = 0.4;
  for (const model of Object.values(playerModels)) model.root.visible = false;
  player = playerModels[state.character];
  player.action = null;
  player.hurt = 0;
  for (const material of player.flashMaterials) {
    material.opacity = 1;
    material.transparent = false;
    material.depthWrite = true;
    material.needsUpdate = true;
  }
  player.root.visible = true;
  player.root.position.set(
    state.position.x,
    world.heightAt(state.position),
    state.position.z,
  );
  player.root.rotation.y = 0;
  world.sync(state);
  loadEncounter();
  buildSkills();
  $("toast").classList.add("hidden");
  $("combat-caption").classList.add("hidden");
  $("damage-flash").style.opacity = 0;
  $("hit-feedback").classList.add("hidden");
  $("training-tools").classList.toggle("hidden", !practice);
  if (practice) checkpointRaw = null;
  else if (raw) checkpointRaw = raw;
  else saveCheckpoint();
  cameraTarget.set(
    state.position.x,
    world.heightAt(state.position) + 1.8,
    state.position.z,
  );
  world.camera.position.set(
    state.position.x,
    world.heightAt(state.position) + 6,
    state.position.z + 8,
  );
  world.camera.lookAt(cameraTarget);
  if (state.stage === "complete") finish(false);
  else if (state.stage === "coffee" && !state.upgrade) showUpgrade();
  else {
    show("play");
    notify(
      raw
        ? "Checkpoint restaurado. A pauta continua."
        : `${chapterContent(state).npc.witness} sabe o que aconteceu. Siga o ponto amarelo no mapa.`,
      5,
    );
  }
  updateHUD();
  audio.start();
}
function startExtraCase(id) {
  startTraining(selected);
  extraCase = id;
  extraProgress = [];
  const level = buildExtraCase(world, id);
  for (const enemy of enemies) enemy.model.root.visible = false;
  state.position = { ...level.spawn };
  followCamera.reset(state.position, world.heightAt(state.position));
  world.clearEffects();
  $("training-tools").classList.add("hidden");
  notify(level.goal, 5);
  updateHUD();
}
function startReplay(chapter) {
  let training;
  try {
    training = parseSave(safeRead(SLOT_KEYS[saves.slot]));
  } catch {
    training = createGame(selected);
  }
  training.chapter = chapter;
  training.stage = "boss";
  training.permit = true;
  training.stamp = true;
  training.position = { x: 0, z: 10 };
  restoreEncounter(training);
  start(training, null, { training: true });
  challenge = true;
  practiceAggressive = true;
  state.elapsed = 0;
  state.statistics = {
    attacks: 0,
    hits: 0,
    blocks: 0,
    dodges: 0,
    damage: 0,
    defeats: 0,
  };
  notify(
    `Repetição: ${chapterContent(state).bossName}. Seu save e recompensas estão preservados.`,
    5,
  );
}
function startChallenge() {
  startTraining(selected);
  challenge = true;
  practiceAggressive = true;
  $("training-enemies").textContent = "Pausar adversários";
  state.statistics = {
    attacks: 0,
    hits: 0,
    blocks: 0,
    dodges: 0,
    damage: 0,
    defeats: 0,
  };
  state.elapsed = 0;
  notify("Desafio: derrote os dois adversários sem alterar sua campanha.", 4);
}
function startTraining(character = selected) {
  const training = createGame(character);
  training.talked = true;
  training.permit = true;
  training.stamp = true;
  training.stage = "arena";
  practiceAggressive = false;
  $("training-enemies").textContent = "Ativar adversários";
  start(training, null, { training: true });
  notify(
    "Treino livre. F: ataque · Q: defesa · Espaço: esquiva. Sua campanha fica preservada.",
    5,
  );
}
function combatFeedback(text, kind = "hit") {
  const element = $("hit-feedback");
  element.textContent = text;
  element.dataset.kind = kind;
  element.classList.remove("hidden");
  element.dataset.remaining = ".65";
}
function selectTarget(cycle) {
  const candidates = livingEnemies()
    .filter(
      (e) =>
        distance(state.position, e.model.root.position) < 18 &&
        world.lineOfSight(state.position, e.model.root.position),
    )
    .sort(
      (a, b) =>
        distance(state.position, a.model.root.position) -
        distance(state.position, b.model.root.position),
    );
  lockedTarget = cycle
    ? candidates[(candidates.indexOf(lockedTarget) + 1) % candidates.length] ||
      null
    : lockedTarget
      ? null
      : candidates[0] || null;
  notify(
    lockedTarget
      ? `Alvo: ${lockedTarget.kind === "boss" ? chapterContent(state).bossName : lockedTarget.role}`
      : "Alvo liberado",
    1.5,
  );
}
function tryDodge() {
  if (
    state.actionRecovery > 0.16 ||
    pendingSkill ||
    (pendingAttack &&
      state.attackCooldown > BASIC_ATTACK.duration - BASIC_ATTACK.impact)
  )
    return;
  if (!dodge(state)) return;
  bufferedDodge = 0;
  completeTutorial(state, "dodge");
  world.startAnimation(player, "dodge", DODGE.duration);
  audio.play("dodge");
  pendingAttack = null;
  pendingSkill = null;
  movementVelocity.set(0, 0);
}
function updatePlayer(dt) {
  const move = new THREE.Vector2(
    (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0),
    (keys.has("KeyS") ? 1 : 0) - (keys.has("KeyW") ? 1 : 0),
  );
  if (move.lengthSq()) {
    move.normalize();
    completeTutorial(state, "move");
  }
  const cos = Math.cos(cameraYaw),
    sin = Math.sin(cameraYaw);
  const beforeMove = { ...state.position };
  const dx = move.x * cos + move.y * sin,
    dz = -move.x * sin + move.y * cos;
  defending =
    (keys.has("KeyQ") || mouseHeld === "right") &&
    state.dodge <= 0 &&
    state.stamina > 0 &&
    !pendingAttack &&
    state.guardBreak <= 0 &&
    !pendingSkill &&
    state.actionRecovery <= 0;
  const sprinting =
    keys.has("ShiftLeft") &&
    !defending &&
    !pendingAttack &&
    !pendingSkill &&
    state.stamina > 2 &&
    state.actionRecovery <= 0 &&
    move.lengthSq() > 0;
  tickState(state, dt, defending || sprinting);
  if (
    keys.has("ArrowLeft") ||
    keys.has("ArrowRight") ||
    keys.has("ArrowUp") ||
    keys.has("ArrowDown")
  )
    completeTutorial(state, "camera");
  if (keys.has("ArrowLeft")) cameraYaw += dt * 1.6;
  if (keys.has("ArrowRight")) cameraYaw -= dt * 1.6;
  if (keys.has("ArrowUp"))
    cameraPitch = clamp(cameraPitch + dt * 0.8, 0.12, 0.9);
  if (keys.has("ArrowDown"))
    cameraPitch = clamp(cameraPitch - dt * 0.8, 0.12, 0.9);
  let speed = defending ? MOVEMENT.guard : MOVEMENT.walk;
  if (sprinting) {
    speed = MOVEMENT.sprint;
    state.stamina = Math.max(0, state.stamina - dt * MOVEMENT.sprintDrain);
  }
  if (pendingAttack) speed *= 0.45;
  if (defending) completeTutorial(state, "guard");
  if (state.dodge > 0) speed = DODGE.speed;
  if (
    move.lengthSq() > 0 &&
    state.dodge <= 0 &&
    !pendingAttack &&
    !pendingSkill
  )
    player.root.rotation.y +=
      Math.atan2(
        Math.sin(Math.atan2(-dx, -dz) - player.root.rotation.y),
        Math.cos(Math.atan2(-dx, -dz) - player.root.rotation.y),
      ) * Math.min(1, dt * MOVEMENT.turn);
  if (state.dodge > 0)
    world.move(
      state.position,
      -Math.sin(player.root.rotation.y) * speed * dt,
      -Math.cos(player.root.rotation.y) * speed * dt,
      state,
    );
  else {
    const desired = new THREE.Vector2(dx * speed, dz * speed),
      change = desired
        .sub(movementVelocity)
        .clampLength(
          0,
          (move.lengthSq() ? MOVEMENT.acceleration : MOVEMENT.deceleration) *
            dt,
        );
    movementVelocity.add(change);
    world.move(
      state.position,
      movementVelocity.x * dt,
      movementVelocity.y * dt,
      state,
    );
  }
  stepDistance += distance(beforeMove, state.position);
  if (stepDistance > (sprinting ? 1.1 : 0.8)) {
    stepDistance = 0;
    const surface = world.level.surfaces.find(
      (s) =>
        Math.abs(state.position.x - s.x) < (s.w || s.radius * 2) / 2 &&
        Math.abs(state.position.z - s.z) < (s.d || s.radius * 2) / 2,
    );
    audio.play(
      state.chapter === 2
        ? "stepMetal"
        : surface?.id.includes("ponte")
          ? "stepWood"
          : state.chapter === 3
            ? "stepGrass"
            : "stepStone",
      state.position,
    );
  }
  player.root.position.set(
    state.position.x,
    world.heightAt(state.position),
    state.position.z,
  );
  if (pendingSkill) {
    pendingSkill.timer -= dt;
    if (pendingSkill.timer <= 0) {
      resolveSkill(pendingSkill.skill);
      pendingSkill = null;
    }
  }
  if (
    lockedTarget &&
    (lockedTarget.hp <= 0 ||
      distance(state.position, lockedTarget.model.root.position) > 18)
  )
    lockedTarget = null;
  if (lockedTarget && !pendingAttack)
    faceTarget(lockedTarget.model.root.position);
  attackVisual = Math.max(0, attackVisual - dt);
  if (pendingAttack) {
    pendingAttack.timer -= dt;
    if (pendingAttack.timer <= 0) {
      resolveAttack(pendingAttack);
      pendingAttack = null;
    }
  }
  bufferedDodge = Math.max(0, bufferedDodge - dt);
  if (bufferedDodge > 0) tryDodge();
  bufferedAttack = Math.max(0, bufferedAttack - dt);
  if (keys.has("KeyF") || mouseHeld === "left" || bufferedAttack > 0) {
    basicAttack();
    if (pendingAttack) bufferedAttack = 0;
  }
  world.animatePerson(
    player,
    state.elapsed,
    distance(beforeMove, state.position) / (dt * 5.2 || 1),
    dt,
    settings.reducedMotion,
    { defending },
  );

  interactTarget = interactionAt();
  $("interaction").classList.toggle("hidden", !interactTarget);
  if (interactTarget)
    $("interaction").querySelector("span").textContent = interactTarget.label;
  flashTime = Math.max(0, flashTime - dt);
  $("damage-flash").style.opacity = flashTime > 0 ? "1" : "0";
}
function updateCamera(dt) {
  if (framing.shot?.kind === "outro") {
    framing.update(world.camera, world, dt);
    return;
  }
  const result = followCamera.update(
    world.camera,
    world,
    state.position,
    cameraYaw,
    cameraPitch,
    dt,
    settings.reducedMotion || !settings.shake,
  );
  player.root.visible = true;
  const opacity = clamp((result.distance - 0.5) / 1.5, 0.12, 1);
  for (const material of player.flashMaterials) {
    const transparent = opacity < 0.99;
    if (material.transparent !== transparent) {
      material.transparent = transparent;
      material.needsUpdate = true;
    }
    material.opacity = opacity;
    material.depthWrite = !transparent;
  }
}
function enterEpilogue() {
  if (world.epilogue) return;
  buildExtraCase(world, "prologue");
  world.epilogue = true;
  for (const enemy of enemies) {
    enemy.model.root.visible = false;
    enemy.model.ring.visible = false;
  }
  state.position = { x: 0, z: 9 };
  player.root.position.set(0, 0, 9);
  player.root.rotation.y = 0;
  for (let i = 0; i < 37; i++)
    world.prop(
      "crate",
      -3 + (i % 7) * 0.75,
      1 + (Math.floor(i / 7) % 3) * 0.7,
      { y: Math.floor(i / 21) * 0.6, scale: 0.55 },
    );
  world.camera.position.set(-7, 5.5, 14);
  world.camera.lookAt(0, 1.7, 4);
}
function finish(save = true) {
  if (save && !recoverCoffee(state)) return;
  world.sync(state);
  if (save) saveCheckpoint();
  const content = chapterContent(state);
  if (state.chapter < 3) {
    $("interlude-chapter").textContent =
      `CAPÍTULO 0${state.chapter} / CONCLUÍDO`;
    $("interlude-title").textContent = content.transitionTitle;
    $("interlude-clue").textContent = content.clueText;
    $("interlude-text").textContent = content.transitionText;
    $("next-chapter-button").textContent = content.next;
    show("interlude");
    audio.play("pickup");
    return;
  }
  enterEpilogue();
  if (!state.finalDecision) {
    openDialogue(
      "Dona Nair",
      "DE VOLTA À COPA / CAFÉ PASSADO NA HORA",
      `${content.clueText} Como você quer apresentar o caso?`,
      [
        [
          "Publicar a investigação completa • polarização +5",
          () => decideFinal("publish"),
          true,
        ],
        [
          "Reunir os envolvidos e mediar • polarização −10",
          () => decideFinal("mediate"),
        ],
      ],
      false,
    );
    return;
  }
  world.startAnimation(player, "victory", 1.4);
  const ending = campaignEnding(state, state.finalDecision);
  $("ending-title").textContent = ending.title;
  $("ending-text").textContent = ending.text;
  const mins = Math.floor(state.elapsed / 60),
    secs = Math.floor(state.elapsed % 60)
      .toString()
      .padStart(2, "0");
  $("ending-stats").innerHTML =
    `<span>Desfecho<strong>${ending.type}</strong></span><span>Provas<strong>${state.history.filter((h) => h.evidence).length}/3</strong></span><span>Polarização<strong>${state.polarization}/100</strong></span><span>Tempo<strong>${mins}:${secs}</strong></span>`;
  $("ending-route").textContent = state.history
    .map(
      (h) =>
        `Capítulo ${h.chapter}: ${h.route === "negotiated" ? "acordo" : "confronto"}${h.evidence ? ", prova preservada" : ""}${h.helped ? ", tarefa de apoio concluída" : ""}`,
    )
    .join(" • ");
  show("ending");
  audio.play("win");
}
function returnMenu() {
  pendingAttack = null;
  gameplayActive = false;
  show("menu");
  if (practice) {
    practice = false;
    world.setChapter(chapterContent(createGame()));
  }
  if (player) player.root.visible = false;
  for (const e of enemies) {
    e.model.root.visible = false;
    e.model.ring.visible = false;
  }
}
function decideFinal(decision) {
  state.finalDecision = decision;
  state.polarization = clamp(
    state.polarization + (decision === "mediate" ? -10 : 5),
    0,
    100,
  );
  saveCheckpoint();
  finish(false);
}
function openSettings(from) {
  settingsReturn = from;
  $("volume").value = settings.volume;
  $("sensitivity").value = settings.sensitivity;
  $("difficulty").value = settings.difficulty;
  $("quality").value = settings.quality;
  $("reduced-motion").checked = settings.reducedMotion;
  updateSettings(false);
  show("settings");
}
function updateSettings(save = true) {
  settings.volume = Number($("volume").value);
  settings.sensitivity = Number($("sensitivity").value);
  settings.difficulty = $("difficulty").value;
  settings.quality = $("quality").value;
  settings.reducedMotion = $("reduced-motion").checked;
  audio.setVolumes(
    settings.volume / 100,
    settings.musicVolume / 100,
    settings.ambienceVolume / 100,
    settings.effectsVolume / 100,
  );
  if (world) {
    world.renderer.shadowMap.enabled = settings.quality !== "performance";
    world.renderer.setPixelRatio(
      settings.quality === "performance"
        ? 1
        : Math.min(devicePixelRatio, settings.quality === "quality" ? 2 : 1.3),
    );
    world.camera.fov = settings.fov;
    world.camera.updateProjectionMatrix();
    world.resize();
  }
  $("volume-value").textContent = `${settings.volume}%`;
  $("sensitivity-value").textContent = `${settings.sensitivity}%`;
  settings.bindings = { ...input.bindings };
  applyAccessibility(settings);
  updateControls(input);
  if (save && !persist("brasilia-settings", JSON.stringify(settings)))
    $("settings").querySelector(".fine-print").textContent =
      "Não foi possível salvar as configurações neste navegador.";
}
function refreshSlots() {
  const select = $("save-slots");
  if (!select) return;
  for (let i = 0; i < 3; i++)
    select.options[i].textContent = `Slot ${i + 1} · ${saves.summary(i)}`;
  select.value = String(saves.slot);
}
function openLoadout() {
  if (
    world.inArena(state.position, state.stage === "boss") &&
    livingEnemies().length
  ) {
    notify("Saia da arena para ajustar o equipamento.");
    return;
  }
  const paper = $("loadout").firstElementChild;
  paper.replaceChildren(element("h2", "Sua pasta de trabalho"));
  const catalog = skillCatalog(state.character, CHARACTERS);
  paper.append(
    element(
      "p",
      `Vida ${state.maxHp} · dano ${Math.round(CHARACTERS[state.character].damage * damageMultiplier(state))} · especialização ${SPECIALIZATIONS[state.character][state.specialization]?.name || "a escolher"}. Recursos são restaurados nos checkpoints de encontro.`,
    ),
  );
  for (let slot = 0; slot < 4; slot++)
    paper.append(
      labeledSelect(
        `Habilidade ${slot + 1}`,
        catalog.map((s, i) => [
          i,
          `${s.name} · ${s.hint} · ${s.cost} fôlego · ${s.cooldown}s`,
        ]),
        state.loadout[slot],
        (value) => {
          if (!equipSkill(state, slot, Number(value)))
            notify("Essa habilidade já está equipada.");
          buildSkills();
          saveCheckpoint();
          openLoadout();
        },
      ),
    );
  for (const slot of ["accessory", "instrument"]) {
    const ids = state.owned.filter((id) => EQUIPMENT[id].slot === slot);
    paper.append(
      labeledSelect(
        slot === "accessory" ? "Acessório" : "Instrumento",
        [
          ["", "Nenhum"],
          ...ids.map((id) => [
            id,
            `${EQUIPMENT[id].name} · ${EQUIPMENT[id].description}`,
          ]),
        ],
        state.equipment[slot] || "",
        (id) => {
          if (id) equipItem(state, id);
          else state.equipment[slot] = null;
          buildSkills();
          saveCheckpoint();
          openLoadout();
        },
      ),
    );
  }
  paper.append(
    element(
      "p",
      state.support
        ? `Apoio disponível: ${state.support === "nair" ? "Dona Nair · cura e proteção" : state.support === "lia" ? "Lia · prepara contra-ataque" : "Célia · recupera fôlego"}. Use ${keyLabel(input.code("support"))}.`
        : "Conclua uma tarefa para conquistar apoio.",
    ),
  );
  paper.append(button("Voltar", () => show("play"), "primary"));
  show("loadout");
}
function buildExtendedUi() {
  const skip = button("Pular encerramento", () => {
    framing.clear();
    for (const enemy of enemies)
      if (enemy.hp <= 0) {
        enemy.deathTime = 0;
        enemy.model.root.visible = false;
      }
  });
  skip.id = "cinematic-skip";
  skip.classList.add("hidden");
  $("hud").append(skip);
  addOverlay("loadout", "Sua pasta de trabalho");
  const log = addOverlay("conversation-log", "Conversas anteriores");
  log.append(
    element("div", "", "history-list"),
    button("Voltar", () => show(historyReturn), "primary"),
  );
  $("pause-settings").before(button("Habilidades e equipamento", openLoadout));
  $("dialogue-choices").after(
    button("Histórico da conversa", () => {
      historyReturn = mode;
      renderHistory(
        log.querySelector(".history-list"),
        state?.dialogueHistory || [],
      );
      show("conversation-log");
    }),
  );
  $("pause-settings").before(
    button("Exportar relato de problema", () => {
      downloadReport(
        diagnosticBundle(state, settings, diagnostics.report, {
          width: innerWidth,
          height: innerHeight,
          renderer:
            world.renderer.getContext?.().getParameter?.(0x1f01) || null,
        }),
      );
      notify(
        "Relato local exportado. Complete os passos antes de compartilhar.",
        4,
      );
    }),
  );
  const slotLabel = labeledSelect(
    "Checkpoint",
    [
      [0, "Slot 1"],
      [1, "Slot 2"],
      [2, "Slot 3"],
    ],
    saves.slot,
    (value) => {
      saves.select(Number(value));
      persist("brasilia-active-slot", String(saves.slot));
      updateContinue();
      refreshSlots();
    },
  );
  slotLabel.querySelector("select").id = "save-slots";
  document.querySelector(".menu-actions").prepend(slotLabel);
  const extras = element("div", "", "extra-case-menu");
  extras.append(
    button("Prólogo: a primeira xícara", () => startExtraCase("prologue")),
    button("Gabinete de investigação", () => startExtraCase("interlude")),
    button("Caso extra: a água sumiu", () => startExtraCase("aftermath")),
    button("Desafio de combate", startChallenge),
  );
  const replay = labeledSelect(
    "Repetir chefe",
    [
      [0, "Escolha um encontro"],
      [1, "O Centrão"],
      [2, "Influencer Político"],
      [3, "Tio do Zap"],
    ],
    0,
    (value) => {
      if (Number(value)) startReplay(Number(value));
    },
  );
  const library = addOverlay("case-library", "Casos extras e desafios");
  library.append(
    element(
      "p",
      "Histórias curtas, treino de builds e encontros repetidos. Sua campanha fica no slot escolhido.",
    ),
    extras,
    replay,
    button("Voltar", () => show("menu"), "primary"),
  );
  document.querySelector(".menu-actions").append(
    button("Casos extras e desafios", () => {
      let saved;
      try {
        saved = parseSave(safeRead(SLOT_KEYS[saves.slot]));
      } catch {}
      const finished = saved?.history.map((h) => h.chapter) || [];
      if (saved && ["coffee", "complete"].includes(saved.stage))
        finished.push(saved.chapter);
      for (const o of replay.querySelectorAll("option"))
        if (Number(o.value)) o.disabled = !finished.includes(Number(o.value));
      replay.querySelector("select").value = "0";
      show("case-library");
    }),
  );
  const paper = $("settings").firstElementChild,
    anchor = $("fullscreen");
  for (const [key, label, min, max] of [
    ["effectsVolume", "Efeitos", 0, 100],
    ["musicVolume", "Música", 0, 100],
    ["ambienceVolume", "Ambiente", 0, 100],
    ["sensitivityY", "Sensibilidade vertical", 10, 100],
    ["fov", "Campo de visão", 45, 80],
    ["textScale", "Tamanho do texto", 85, 140],
    ["hudScale", "Tamanho do HUD", 85, 140],
  ]) {
    const labelNode = element("label", label),
      range = element("input");
    range.type = "range";
    range.min = String(min);
    range.max = String(max);
    range.value = String(settings[key]);
    range.dataset.setting = key;
    range.addEventListener("input", () => {
      settings[key] = Number(range.value);
      updateSettings();
    });
    labelNode.append(range);
    anchor.before(labelNode);
  }
  for (const [key, label] of [
    ["showMinimap", "Mostrar minimapa"],
    ["invertX", "Inverter câmera horizontal"],
    ["invertY", "Inverter câmera vertical"],
    ["captureMouse", "Capturar mouse automaticamente (desligue para arrastar)"],
    ["shake", "Tremor de câmera"],
    ["flashes", "Clarões de impacto"],
    ["hitStop", "Pausa breve de impacto"],
    ["blood", "Sangue estilizado"],
    ["assistTiming", "Mais tempo para reagir aos avisos"],
  ]) {
    const labelNode = element("label", label, "check-label"),
      check = element("input");
    check.type = "checkbox";
    check.checked = settings[key];
    check.dataset.setting = key;
    check.addEventListener("change", () => {
      settings[key] = check.checked;
      updateSettings();
    });
    labelNode.prepend(check);
    anchor.before(labelNode);
  }
  anchor.before(
    button("Testar volumes", async () => {
      await audio.start();
      audio.play("confirm");
      audio.tone(220, 220, 0.3, "triangle", 0.06, 0, 0, "music");
      audio.tone(110, 110, 0.3, "sine", 0.06, 0, 0, "ambience");
    }),
  );
  const bindPanel = element("div", "", "bindings-panel");
  bindPanel.append(element("h3", "Teclas"));
  for (const [action, label] of Object.entries(INPUT_LABELS)) {
    const b = button(`${label}: ${keyLabel(input.code(action))}`, () => {
      awaitingBinding = { action, button: b };
      b.textContent = "Pressione a nova tecla…";
    });
    b.dataset.binding = action;
    bindPanel.append(b);
  }
  bindPanel.append(
    button("Restaurar teclas", () => {
      input.reset();
      for (const b of bindPanel.querySelectorAll("[data-binding]"))
        b.textContent = `${INPUT_LABELS[b.dataset.binding]}: ${keyLabel(input.code(b.dataset.binding))}`;
      updateSettings();
    }),
  );
  anchor.before(bindPanel);
  applyAccessibility(settings);
  refreshSlots();
}
function wire() {
  buildExtendedUi();
  $("tutorial-skip").onclick = () => {
    state.tutorial.skipped = true;
    saveCheckpoint();
    updateHUD();
  };
  $("new-game").onclick = () => show("selection");
  $("select-back").onclick = returnMenu;
  $("start-game").onclick = () => {
    if (safeRead(SLOT_KEYS[saves.slot]))
      openDialogue(
        "Nova investigação",
        "SLOT SELECIONADO",
        "Começar uma nova campanha substitui o checkpoint do slot selecionado. Se quiser guardar sua partida, continue e exporte uma cópia pela pausa.",
        [
          ["Começar nova campanha", () => start(createGame(selected)), true],
          ["Manter minha partida", () => show("selection")],
        ],
      );
    else start(createGame(selected));
  };
  for (const button of document.querySelectorAll("[data-character]"))
    button.onclick = () => {
      selected = button.dataset.character;
      for (const other of document.querySelectorAll("[data-character]"))
        other.setAttribute("aria-pressed", String(other === button));
    };
  $("continue-game").onclick = () => {
    try {
      const raw = safeRead(SLOT_KEYS[saves.slot]);
      start(parseSave(raw), raw);
    } catch (e) {
      saveWarning = e.message;
      updateContinue();
    }
  };
  $("menu-settings").onclick = () => openSettings("menu");
  $("pause-settings").onclick = () => openSettings("pause");
  $("menu-help").onclick = () => {
    helpReturn = "menu";
    show("help");
  };
  $("pause-help").onclick = () => {
    helpReturn = "pause";
    show("help");
  };
  $("help-back").onclick = () => show(helpReturn);
  $("settings-back").onclick = () => show(settingsReturn);
  for (const id of [
    "volume",
    "sensitivity",
    "difficulty",
    "quality",
    "reduced-motion",
  ])
    $(id).addEventListener("input", () => {
      updateSettings();
      if (id === "volume") {
        audio.start().then(() => audio.play("talk"));
      }
    });
  $("fullscreen").onclick = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      $("settings").querySelector(".fine-print").textContent =
        "Este navegador não permitiu tela cheia.";
    }
  };
  $("pause-button").onclick = () => {
    if (mode === "play") show("pause");
  };
  $("resume-game").onclick = () => {
    show("play");
    updateHUD();
  };
  $("journal-button").onclick = openJournal;
  $("journal-back").onclick = () => {
    show("play");
    updateHUD();
  };
  $("interact-button").onclick = interact;
  $("return-menu").onclick = returnMenu;
  $("upgrade-vitality").onclick = () => chooseUpgrade("vitality");
  $("upgrade-power").onclick = () => chooseUpgrade("power");
  $("training-start").onclick = () => startTraining();
  $("training-reset").onclick = () => {
    restoreEncounter(state);
    world.clearEffects();
    loadEncounter();
    updateHUD();
    notify("Alvos e recursos repostos.", 2);
  };
  $("training-character").onclick = () =>
    startTraining(state.character === "luli" ? "folfonaro" : "luli");
  $("training-enemies").onclick = () => {
    practiceAggressive = !practiceAggressive;
    $("training-enemies").textContent = practiceAggressive
      ? "Pausar adversários"
      : "Ativar adversários";
    for (const enemy of enemies) {
      enemy.phase = "idle";
      enemy.timer = 1;
      enemy.model.ring.visible = false;
    }
  };
  $("retry-game").onclick = () => {
    if (practice) {
      startTraining(state.character);
      return;
    }
    try {
      start(parseSave(checkpointRaw), checkpointRaw);
    } catch {
      start(createGame(selected));
    }
  };
  $("defeat-menu").onclick = returnMenu;
  $("ending-menu").onclick = returnMenu;
  $("reload").onclick = () => location.reload();
  $("interlude-menu").onclick = returnMenu;
  $("next-chapter-button").onclick = () => {
    if (nextChapter(state)) start(state);
  };
  $("export-save").onclick = () => {
    if (!checkpointRaw) return;
    const blob = new Blob([checkpointRaw], { type: "application/json" }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "brasilia-checkpoint.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $("pause-save-status").textContent =
      "Checkpoint exportado. Guarde o arquivo para restaurar sua partida.";
  };
  $("import-save").onclick = () => $("save-file").click();
  $("save-file").onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 100000)
        throw new Error("Arquivo grande demais para um checkpoint.");
      const raw = await file.text(),
        loaded = parseSave(raw);
      openDialogue(
        "Importar checkpoint",
        "ARQUIVO VALIDADO",
        `Restaurar a investigação de ${CHARACTERS[loaded.character].name}? Isso substitui o checkpoint atual.`,
        [
          [
            "Restaurar",
            () => {
              persist(SLOT_KEYS[saves.slot], raw);
              start(loaded, raw);
            },
            true,
          ],
          ["Cancelar", () => show("pause")],
        ],
      );
    } catch (e) {
      $("pause-save-status").textContent = e.message;
    }
    event.target.value = "";
  };
  window.addEventListener("resize", () => world.resize());
  inputRouter.listen(document, "keydown", (nativeEvent) => {
    if (awaitingBinding) {
      nativeEvent.preventDefault();
      if (nativeEvent.code === "Escape") {
        awaitingBinding.button.textContent = `${INPUT_LABELS[awaitingBinding.action]}: ${keyLabel(input.code(awaitingBinding.action))}`;
        awaitingBinding = null;
        return;
      }
      const result = input.rebind(awaitingBinding.action, nativeEvent.code);
      awaitingBinding.button.textContent = result.ok
        ? `${INPUT_LABELS[awaitingBinding.action]}: ${keyLabel(nativeEvent.code)}`
        : result.reason;
      if (result.ok) {
        awaitingBinding = null;
        updateSettings();
      }
      return;
    }
    const event = inputRouter.normalize(nativeEvent, mode === "play");
    if (event.code === "F4") {
      event.preventDefault();
      if (contentPreview) {
        world.disposeGroup(contentPreview);
        contentPreview = null;
      } else contentPreview = createContentPreview(world);
      return;
    }
    if (event.code === "F3") {
      event.preventDefault();
      diagnostics.toggle();
      return;
    }
    if (event.code === "Tab" && mode !== "play") {
      const active = $(mode);
      if (!active) return;
      const focusable = [
        ...active.querySelectorAll(
          "button:not(:disabled),a,input:not([hidden]),select",
        ),
      ];
      if (!focusable.length) return;
      const first = focusable[0],
        last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    if (event.code === "Escape") {
      event.preventDefault();
      if (mode === "play") show("pause");
      else if (mode === "pause" || mode === "journal" || mode === "loadout") {
        show("play");
        updateHUD();
      } else if (mode === "conversation-log") show(historyReturn);
      else if (mode === "settings") show(settingsReturn);
      else if (mode === "help") show(helpReturn);
      else if (mode === "selection" || mode === "case-library") returnMenu();
      else if (mode === "dialogue" && dialogueClosable) {
        show(dialogueReturn);
        updateHUD();
      }
      return;
    }
    if (mode !== "play") return;
    if (event.code === "Space" && event.target?.closest?.("button")) return;
    if (
      [
        "Space",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "KeyW",
        "KeyA",
        "KeyS",
        "KeyD",
        "KeyF",
        "KeyQ",
      ].includes(event.code)
    )
      event.preventDefault();
    keys.add(event.code);
    if (event.repeat) return;
    if (event.code === "KeyF") {
      bufferedAttack = BASIC_ATTACK.buffer;
      basicAttack();
      if (pendingAttack) bufferedAttack = 0;
    } else if (event.code === "KeyE") interact();
    else if (event.code === "KeyJ") openJournal();
    else if (/^Digit[1-4]$/.test(event.code))
      performSkill(Number(event.code.slice(-1)) - 1);
    else if (event.code === "Space") {
      bufferedDodge = 0.16;
      tryDodge();
    } else if (event.code === "KeyR") selectTarget(false);
    else if (event.code === "KeyT") selectTarget(true);
    else if (event.code === "KeyC") {
      const result = useSupport(state);
      if (result) {
        world.pulse(player.root.position, 3, 0x8caf80);
        world.startAnimation(player, "skill", 0.65);
        audio.play("skill");
        notify("Seu aliado preparou o apoio.", 2);
        updateHUD();
      } else
        notify(
          state.support
            ? "Apoio recarregando."
            : "Conclua uma tarefa para conquistar apoio.",
          2,
        );
    }
  });
  inputRouter.listen(document, "keyup", (e) =>
    keys.delete(input.canonical(e.code) || e.code),
  );
  $("world").addEventListener("mousedown", (event) => {
    if (mode !== "play") return;
    dragging = true;
    if (event.button === 0) {
      mouseHeld = "left";
      bufferedAttack = BASIC_ATTACK.buffer;
      basicAttack();
    }
    if (event.button === 2) mouseHeld = "right";
    if (
      settings.captureMouse &&
      !document.pointerLockElement &&
      $("world").requestPointerLock
    ) {
      try {
        const result = $("world").requestPointerLock();
        result?.catch(() => {});
      } catch {
        /* Dragging and arrow keys remain available without pointer lock. */
      }
    }
  });
  inputRouter.listen(document, "mouseup", () => {
    mouseHeld = false;
    dragging = false;
  });
  inputRouter.listen(document, "mousemove", (event) => {
    if (mode !== "play" || (!document.pointerLockElement && !dragging)) return;
    completeTutorial(state, "camera");
    const factor = 0.001 + settings.sensitivity * 0.000035;
    cameraYaw -= event.movementX * factor * (settings.invertX ? -1 : 1);
    cameraPitch = clamp(
      cameraPitch +
        event.movementY *
          (0.001 + settings.sensitivityY * 0.000035) *
          (settings.invertY ? -1 : 1),
      0.12,
      0.9,
    );
  });
  $("world").addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("pointerlockchange", () => {
    if (!document.pointerLockElement && ignorePointerUnlock) {
      ignorePointerUnlock = false;
      return;
    }
    if (document.pointerLockElement) ignorePointerUnlock = false;
    else if (mode === "play") show("pause");
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && mode === "play") show("pause");
  });
  window.addEventListener("blur", () => {
    if (mode === "play") show("pause");
  });
  $("world").addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    show("error");
    $("error-message").textContent =
      "O navegador perdeu o contexto gráfico. Recarregue para voltar ao último checkpoint.";
  });
}
function tickFeedback(dt) {
  const element = $("hit-feedback");
  const left = Math.max(0, Number(element.dataset.remaining || 0) - dt);
  element.dataset.remaining = String(left);
  element.classList.toggle("hidden", left <= 0);
}
function frame(time) {
  const cpuStart = performance.now();
  requestAnimationFrame(frame);
  const dt = Math.max(0, (time - lastTime) / 1000 || 0);
  lastTime = time;
  if (mode === "play" && state) {
    simulation.advance(dt, (step) => {
      tickFeedback(step);
      const frozen = world.hitStop > 0;
      world.hitStop = Math.max(0, world.hitStop - step);
      if (!frozen) {
        updatePlayer(step);
        if (mode === "play") updateEnemies(step);
      }
      return mode === "play";
    });
    updateCamera(Math.min(dt, 0.1));
    world.update(Math.min(dt, 0.1), state.elapsed);
    for (const npc of world.npcs)
      if (distance(npc, state.position) < 6 && !npc.working) {
        const angle = Math.atan2(
          npc.x - state.position.x,
          npc.z - state.position.z,
        );
        npc.model.root.rotation.y +=
          Math.atan2(
            Math.sin(angle - npc.model.root.rotation.y),
            Math.cos(angle - npc.model.root.rotation.y),
          ) * Math.min(1, dt * 5);
      }
    for (const npc of world.npcs)
      world.animatePerson(
        npc.model,
        state.elapsed + npc.x,
        0,
        Math.min(dt, 0.05),
        settings.reducedMotion,
        { working: npc.working },
      );
    if (toastTime > 0) {
      toastTime -= dt;
      if (toastTime <= 0) $("toast").classList.add("hidden");
    }
    hudTimer -= dt;
    if (hudTimer <= 0) {
      updateHUD();
      hudTimer = 0.1;
    }
  } else if (mode === "dialogue" && state) {
    framing.update(world.camera, world, Math.min(dt, 0.05));
    for (const enemy of enemies)
      if (enemy.model.root.visible)
        world.animateEnemy(
          enemy,
          Math.min(dt, 0.05),
          time / 1000,
          settings.reducedMotion,
        );
    for (const npc of world.npcs)
      world.animatePerson(
        npc.model,
        time / 1000,
        0,
        Math.min(dt, 0.05),
        settings.reducedMotion,
        {
          talking: npc.name === $("speaker-name").textContent,
          working: npc.working,
        },
      );
  } else if ((mode === "ending" || mode === "interlude") && player) {
    world.animatePerson(
      player,
      time / 1000,
      0,
      Math.min(dt, 0.05),
      settings.reducedMotion,
    );
    world.update(Math.min(dt, 0.05), time / 1000);
  } else if (
    ["menu", "selection"].includes(mode) ||
    (mode === "settings" && settingsReturn === "menu") ||
    (mode === "help" && helpReturn === "menu")
  ) {
    world.camera.position.set(28 + Math.sin(time / 12000) * 2, 23, 43);
    world.camera.lookAt(0, 1, -8);
    for (const npc of world.npcs)
      world.animatePerson(
        npc.model,
        time / 1000 + npc.x,
        0,
        Math.min(dt, 0.05),
        settings.reducedMotion,
        { working: npc.working },
      );
    world.update(dt, time / 1000);
  }
  if (mode !== "play") simulation.reset();
  if (state)
    audio.update(Math.min(dt, 0.1), {
      active: mode === "play",
      combat: ["arena", "boss"].includes(state.stage),
      position: state.position,
      yaw: cameraYaw,
    });
  if (!settings.hitStop) world.hitStop = 0;
  if (!settings.blood)
    for (const decal of world.decals) decal.mesh.visible = false;
  diagnostics.begin(world.renderer);
  $("cinematic-skip").classList.toggle(
    "hidden",
    framing.shot?.kind !== "outro" || mode !== "play",
  );
  world.showTarget(
    lockedTarget?.hp > 0 ? lockedTarget.model.root.position : null,
  );
  world.render();
  diagnostics.end();
  diagnostics.update(
    dt,
    performance.now() - cpuStart,
    world.renderer,
    simulation,
  );
}
try {
  const testing = new URLSearchParams(location.search).get("test") === "1";
  world = new World($("world"), testing ? window.__rendererFactory : undefined);
  world.renderer.shadowMap.enabled = settings.quality !== "performance";
  world.renderer.setPixelRatio(
    settings.quality === "performance"
      ? 1
      : Math.min(devicePixelRatio, settings.quality === "quality" ? 2 : 1.3),
  );
  world.resize();
  playerModels.luli = world.person("luli", 0, 25);
  playerModels.folfonaro = world.person("folfonaro", 0, 25);
  for (const model of Object.values(playerModels)) model.root.visible = false;
  for (const point of world.level.mobs) makeEnemy("paper", point.x, point.z);
  makeEnemy("boss", world.level.boss.x, world.level.boss.z);
  for (const e of enemies) e.model.root.visible = false;
  wire();
  $("loading").classList.add("hidden");
  show("menu");
  requestAnimationFrame(frame);
  if (testing) {
    window.__game = {
      get state() {
        return state;
      },
      get mode() {
        return mode;
      },
      get world() {
        return world;
      },
      get player() {
        return player;
      },
      get enemies() {
        return enemies;
      },
      start,
      show,
      interact,
      basicAttack,
      performSkill,
      teleport(x, z) {
        state.position = { x, z };
        player.root.position.set(x, world.heightAt({ x, z }), z);
        interactTarget = interactionAt();
        updateHUD();
      },
      damage: receiveDamage,
      get checkpoint() {
        return checkpointRaw;
      },
    };
  }
} catch (error) {
  $("loading").classList.add("hidden");
  $("error").classList.remove("hidden");
  $("error-message").textContent =
    "Não foi possível abrir a cena 3D. Habilite a aceleração gráfica e use um navegador com WebGL 2. Detalhe: " +
    error.message;
  $("reload").onclick = () => location.reload();
  console.error(error);
}
