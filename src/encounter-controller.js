import { THREE } from "./world.js";
import {
  CHARACTERS,
  skillFor,
  objective,
  distance,
  clamp,
  clearEncounter,
  damageMultiplier,
  useSkill,
  receiveDamage,
  upgrade,
} from "./domain.js";
import { chapterContent } from "./content.js";
import { BASIC_ATTACK, inMeleeArc } from "./combat.js";

import { enemyRole, attackFor, attackHits } from "./encounters.js";
import { completeTutorial } from "./tutorial.js";

const $ = (id) => document.getElementById(id);
export function createEncounterController(ctx) {
  function makeEnemy(kind, x, z) {
    const content = chapterContent(ctx.state || { chapter: 1 });
    const model = ctx.world.enemy(
      kind,
      x,
      z,
      content.number,
      kind === "boss"
        ? content.bossName.toUpperCase()
        : content.mobNames[ctx.enemies.length % 2],
    );
    const maxHp = kind === "boss" ? content.bossHp : content.mobHp;
    const enemy = {
      role: enemyRole(content.number, ctx.enemies.length),
      spawn: { x, z },
      interruptResistance: 0,
      healCharges: 3,
      healTimer: 6,
      armsDisabled: 0,
      armHits: 0,
      id: ++ctx.enemyId,
      kind,
      model,
      hp: maxHp,
      maxHp,
      phase: "idle",
      timer: 1,
      slow: 0,
      sequence: 0,
      warningPoint: null,
      radius: kind === "boss" ? 5.5 : 2.7,
      hitFlash: 0,
      summoned: false,
      attack: null,
    };
    if (kind !== "boss" && enemy.role === "guard") {
      const shield = ctx.world.cylinder(
        -0.65,
        1.1,
        -0.35,
        0.45,
        0.45,
        0.12,
        0x7c8c79,
        model.body,
      );
      shield.rotation.x = Math.PI / 2;
    }
    if (kind !== "boss" && enemy.role === "support")
      ctx.world.mesh(
        new THREE.TorusGeometry(0.7, 0.07, 6, 20),
        0x90bfa3,
        [0, 2.8, 0],
        model.body,
      );
    ctx.enemies.push(enemy);
    return enemy;
  }

  function loadEncounter() {
    for (const enemy of ctx.enemies) {
      enemy.hp = enemy.maxHp;
      enemy.phase = "idle";
      enemy.timer = 1;
      enemy.slow = 0;
      enemy.stagger = 0;
      enemy.sequence = 0;
      enemy.model.ring.visible = false;
      enemy.hitFlash = 0;
      enemy.interruptResistance = 0;
      enemy.healCharges = 3;
      enemy.healTimer = 6;
      enemy.armsDisabled = 0;
      enemy.armHits = 0;
      for (const arm of enemy.model.arms) arm.visible = true;
      enemy.summoned = false;
      enemy.introduced = false;
      enemy.model.root.scale.setScalar(1);
      enemy.model.body.rotation.set(0, 0, 0);
      enemy.model.body.position.set(0, 0, 0);
      const enabled =
        (ctx.state.stage === "arena" && enemy.kind === "paper") ||
        (ctx.state.stage === "boss" && enemy.kind === "boss");
      enemy.model.root.visible = enabled;
      const point =
        enemy.kind === "boss"
          ? ctx.world.level.boss
          : ctx.world.level.mobs[(enemy.id - 1) % 2];
      enemy.model.root.position.set(
        point.x,
        ctx.world.heightAt(point),
        point.z,
      );
      enemy.deathTime = 0;
      enemy.model.action = null;
      enemy.model.hurt = 0;
      ctx.world.setHealth(enemy.model, enemy.hp, enemy.maxHp);
    }
  }

  function livingEnemies() {
    return ctx.enemies.filter((e) => e.model.root.visible && e.hp > 0);
  }

  function damageEnemy(enemy, amount, slow = 0, breakGuard = false) {
    if (enemy.hp <= 0) return;
    const face = {
        x: -Math.sin(enemy.model.root.rotation.y),
        z: -Math.cos(enemy.model.root.rotation.y),
      },
      toward = {
        x: ctx.state.position.x - enemy.model.root.position.x,
        z: ctx.state.position.z - enemy.model.root.position.z,
      };
    const blocked =
      face.x * toward.x + face.z * toward.z > 0 &&
      enemy.role === "guard" &&
      !breakGuard &&
      ["idle", "chase"].includes(enemy.phase);
    if (blocked) amount *= 0.45;
    const damage = Math.min(
      enemy.hp,
      Math.round(amount * damageMultiplier(ctx.state)),
    );
    enemy.hp -= damage;
    enemy.slow = Math.max(enemy.slow, slow);
    enemy.stagger = enemy.kind === "boss" ? 0.06 : 0.16;
    const interruptible =
      enemy.phase === "warning" && (enemy.interruptResistance || 0) <= 0;
    if (interruptible && ctx.state.equipment.accessory === "headphones")
      ctx.state.stamina = Math.min(100, ctx.state.stamina + 12);
    if (enemy.kind !== "boss" && interruptible) {
      enemy.interruptResistance = 2.5;
      enemy.phase = "chase";
      enemy.timer = 0.65;
      enemy.model.ring.visible = false;
    }
    ctx.world.flashActor(enemy.model);
    ctx.world.impact(enemy.model.root.position, damage, {
      reduced: ctx.settings.reducedMotion,
      blocked,
      blood:
        ctx.settings.blood && enemy.kind === "boss" && ctx.state.chapter === 3,
    });
    ctx.world.setHealth(enemy.model, enemy.hp, enemy.maxHp);
    ctx.combatFeedback(
      blocked ? `GUARDA · ${damage}` : `ACERTO · ${damage}`,
      blocked ? "block" : "hit",
    );
    ctx.state.statistics.damage += damage;
    ctx.audio.play(
      enemy.kind === "boss"
        ? ctx.state.chapter === 3
          ? "body"
          : "metal"
        : ctx.state.chapter === 1
          ? "paper"
          : "metal",
      enemy.model.root.position,
    );
    if (enemy.hp <= 0) {
      if (enemy.kind === "boss" && !ctx.livingEnemies().length)
        ctx.framing.focus(enemy.model.root, "outro");
      enemy.deathTime = 0.65;
      enemy.model.ring.visible = false;
      ctx.state.polarization = clamp(ctx.state.polarization - 2, 0, 100);
    }
  }

  function nearestEnemy(range) {
    let nearest = null,
      d = range;
    for (const enemy of ctx.livingEnemies()) {
      const next = distance(ctx.state.position, enemy.model.root.position);
      if (
        next < d &&
        ctx.world.lineOfSight(ctx.state.position, enemy.model.root.position)
      ) {
        nearest = enemy;
        d = next;
      }
    }
    return nearest;
  }

  function faceTarget(target) {
    ctx.player.root.rotation.y = Math.atan2(
      ctx.state.position.x - target.x,
      ctx.state.position.z - target.z,
    );
  }

  function basicAttack() {
    if (
      ctx.mode !== "play" ||
      ctx.state.attackCooldown > 0 ||
      ctx.state.actionRecovery > 0 ||
      ctx.state.dodge > 0 ||
      ctx.defending ||
      ctx.pendingSkill ||
      ctx.pendingAttack
    )
      return;
    const target =
      ctx.lockedTarget?.hp > 0 ? ctx.lockedTarget : ctx.nearestEnemy(4.5);
    if (target) ctx.faceTarget(target.model.root.position);
    ctx.combo = (ctx.combo + 1) % 2;
    ctx.state.attackCooldown = BASIC_ATTACK.duration;
    ctx.attackVisual = 0.45;
    ctx.world.startAnimation(
      ctx.player,
      "attack",
      BASIC_ATTACK.duration,
      ctx.combo,
    );
    ctx.pendingAttack = {
      timer: BASIC_ATTACK.impact,
      range: BASIC_ATTACK.range,
      damage:
        CHARACTERS[ctx.state.character].damage *
        (ctx.combo ? 1 : 1.15) *
        (ctx.state.comboBuff > 0 ? 1.5 : 1) *
        (ctx.state.guardResponse > 0 ? 1.25 : 1),
      angle: ctx.player.root.rotation.y,
    };
    completeTutorial(ctx.state, "attack");
    ctx.state.statistics.attacks++;
    ctx.state.comboBuff = 0;
    ctx.state.guardResponse = 0;
    ctx.audio.play("swing");
  }

  function resolveAttack(attack) {
    const origin = {
      ...ctx.state.position,
      y: ctx.world.heightAt(ctx.state.position),
    };
    let hits = 0;
    for (const enemy of ctx.livingEnemies()) {
      const pos = enemy.model.root.position;
      if (
        ctx.world.lineOfSight(origin, pos) &&
        inMeleeArc(origin, pos, attack.angle, {
          range: attack.range,
          targetRadius: enemy.kind === "boss" ? 0.9 : 0.45,
        })
      ) {
        ctx.damageEnemy(
          enemy,
          attack.damage,
          ctx.state.equipment.instrument === "folder" && !ctx.combo ? 2 : 0,
          ctx.state.specialization === "power" &&
            ctx.state.character === "luli" &&
            !ctx.combo,
        );
        hits++;
        ctx.state.statistics.hits++;
        if (enemy.kind === "boss" && ctx.state.chapter === 1 && !ctx.combo) {
          enemy.armHits++;
          if (enemy.armHits % 3 === 0 && enemy.armsDisabled < 3) {
            enemy.armsDisabled++;
            enemy.model.arms[enemy.armsDisabled - 1].visible = false;
            enemy.timer = 2;
            enemy.phase = "recovery";
            enemy.attack ??= { recovery: 2 };
            enemy.model.ring.visible = false;
            ctx.notify(
              "Uma comissão foi desativada. Aproveite a recuperação.",
              2,
            );
          }
        }
      }
    }
    ctx.world.slash(
      ctx.player.root.position,
      attack.angle,
      ctx.combo,
      attack.range,
      BASIC_ATTACK.halfAngle,
    );
    if (!hits) ctx.combatFeedback("ERROU", "miss");
  }

  function performSkill(index) {
    if (
      ctx.mode !== "play" ||
      ctx.state.dodge > 0 ||
      ctx.pendingSkill ||
      ctx.pendingAttack ||
      ctx.state.actionRecovery > 0 ||
      ctx.state.attackCooldown > 0
    )
      return;
    if (
      !["arena", "boss"].includes(ctx.state.stage) &&
      !skillFor(ctx.state, index)?.heal &&
      !skillFor(ctx.state, index)?.shield
    ) {
      ctx.notify("Guarde o discurso para o próximo encontro.");
      return;
    }
    const result = useSkill(ctx.state, index);
    if (!result.ok) {
      ctx.notify(result.reason, 2);
      return;
    }
    const { skill } = result;
    ctx.state.actionRecovery = 0.65;
    if (
      ctx.state.character === "luli" &&
      ctx.state.specialization === "support" &&
      ctx.state.guardResponse > 0 &&
      skill.damage
    ) {
      skill.damage = Math.round(skill.damage * 1.3);
      ctx.state.guardResponse = 0;
    }
    if (skill.shape !== "heal") {
      ctx.pendingSkill = { skill, timer: skill.cast || 0.3 };
      ctx.world.startAnimation(ctx.player, "skill", 0.65);
      ctx.updateHUD();
      return;
    }
    ctx.world.startAnimation(ctx.player, "skill", 0.65);
    const target = ctx.nearestEnemy(skill.range || 0);
    if (target) ctx.faceTarget(target.model.root.position);
    if (skill.dash)
      ctx.world.move(
        ctx.state.position,
        -Math.sin(ctx.player.root.rotation.y) * 2,
        -Math.cos(ctx.player.root.rotation.y) * 2,
        ctx.state,
      );
    if (skill.damage)
      for (const enemy of ctx.livingEnemies())
        if (
          ctx.world.lineOfSight(
            ctx.state.position,
            enemy.model.root.position,
          ) &&
          Math.abs(
            ctx.world.heightAt(ctx.state.position) -
              enemy.model.root.position.y,
          ) < 2 &&
          distance(ctx.state.position, enemy.model.root.position) < skill.range
        )
          ctx.damageEnemy(enemy, skill.damage, skill.slow || 0);
    if (skill.heal) {
      ctx.world.burst(ctx.state.position, 0x85bb83, 18);
      ctx.notify(
        `${skill.name}: vida recuperada. ${ctx.state.heals} cargas restantes.`,
        2.5,
      );
    }
    ctx.world.pulse(
      ctx.state.position,
      skill.range || 2.5,
      skill.heal ? 0x85bb83 : 0xf3c84c,
    );
    ctx.audio.play("skill");
    ctx.attackVisual = 0.5;
    ctx.updateHUD();
  }

  function resolveSkill(skill) {
    const angle = ctx.player.root.rotation.y,
      origin = {
        ...ctx.state.position,
        y: ctx.world.heightAt(ctx.state.position),
      };
    if (skill.dash)
      ctx.world.move(
        ctx.state.position,
        -Math.sin(angle) * 3,
        -Math.cos(angle) * 3,
        ctx.state,
      );
    for (const enemy of ctx.livingEnemies()) {
      const pos = enemy.model.root.position;
      const hit =
        skill.shape === "cone" || skill.shape === "melee"
          ? inMeleeArc(origin, pos, angle, {
              range: skill.range,
              halfAngle: skill.shape === "cone" ? 0.75 : 0.5,
            })
          : skill.shape === "line"
            ? inMeleeArc(origin, pos, angle, {
                range: skill.range,
                halfAngle: 0.25,
              })
            : distance(ctx.state.position, pos) < skill.range;
      if (
        hit &&
        ctx.world.lineOfSight(origin, pos) &&
        Math.abs(pos.y - origin.y) < 1.4 &&
        skill.damage
      ) {
        ctx.damageEnemy(
          enemy,
          skill.damage,
          skill.slow || 0,
          skill.interrupt || false,
        );
        if (skill.interrupt && enemy.interruptResistance <= 0) {
          enemy.interruptResistance = 2.5;
          enemy.phase = "recovery";
          enemy.attack ??= { recovery: 0.8 };
          enemy.timer = 0.8;
          enemy.model.ring.visible = false;
        }
      }
    }
    if (
      skill.shape === "cone" ||
      skill.shape === "melee" ||
      skill.shape === "line"
    )
      ctx.world.slash(
        ctx.player.root.position,
        angle,
        0,
        skill.range,
        skill.shape === "line" ? 0.25 : 0.75,
      );
    else
      ctx.world.pulse(
        ctx.state.position,
        skill.range || 3,
        skill.shield ? 0x87c1a3 : 0xf3c84c,
      );
    ctx.audio.play("skill");
  }

  function beginWarning(enemy) {
    enemy.phase = "warning";
    enemy.sequence++;
    const boss = enemy.kind === "boss",
      content = chapterContent(ctx.state);
    const attack = attackFor(enemy, content, ctx.state);
    enemy.attack = attack;
    enemy.timer =
      attack.windup * (boss && enemy.hp < enemy.maxHp / 2 ? 0.85 : 1);
    if (ctx.settings.assistTiming) enemy.timer *= 1.35;
    enemy.warningDuration = enemy.timer;
    enemy.radius = attack.radius;
    enemy.warningAngle = Math.atan2(
      enemy.model.root.position.x - ctx.state.position.x,
      enemy.model.root.position.z - ctx.state.position.z,
    );
    enemy.warningPoint = {
      x:
        attack.center === "boss"
          ? enemy.model.root.position.x
          : ctx.state.position.x,
      z:
        attack.center === "boss"
          ? enemy.model.root.position.z
          : ctx.state.position.z,
    };
    ctx.world.disposeGroup(enemy.model.ring);
    enemy.model.ring = ctx.world.telegraph(
      attack,
      enemy.warningPoint,
      enemy.warningAngle,
    );
    enemy.model.ring.visible = true;
    const name = `${attack.name}: ${attack.center === "boss" ? "afaste-se!" : "saia da área!"}`;
    $("combat-caption").textContent = name;
    $("combat-caption").classList.remove("hidden");
    if (boss)
      ctx.audio.play(`bossWarn${ctx.state.chapter}`, enemy.model.root.position);
    ctx.audio.play(
      attack.shape === "line"
        ? "warnLine"
        : attack.shape === "ring"
          ? "warnWave"
          : "warn",
      enemy.model.root.position,
    );
  }

  function updateEnemies(dt) {
    const content = chapterContent(ctx.state);
    for (const enemy of ctx.enemies)
      if (enemy.hp <= 0 && enemy.model.root.visible) {
        enemy.deathTime -= dt;
        ctx.world.animateEnemy(
          enemy,
          dt,
          ctx.state.elapsed,
          ctx.settings.reducedMotion,
        );
        if (enemy.deathTime <= 0) enemy.model.root.visible = false;
      }
    const alive = ctx.livingEnemies();
    const commissionBoss = alive.find(
      (e) => e.kind === "boss" && ctx.state.chapter === 1,
    );
    if (
      commissionBoss &&
      ctx.state.environment["1:commission"] &&
      commissionBoss.armsDisabled < 1
    ) {
      commissionBoss.armsDisabled = 1;
      commissionBoss.model.arms[0].visible = false;
    }
    if (ctx.practice && !ctx.practiceAggressive) {
      for (const enemy of alive) {
        enemy.stagger = Math.max(0, (enemy.stagger || 0) - dt);
        ctx.world.animateEnemy(
          enemy,
          dt,
          ctx.state.elapsed,
          ctx.settings.reducedMotion,
        );
      }
      return;
    }
    const bossIntro = alive.find(
      (e) =>
        e.kind === "boss" &&
        !e.introduced &&
        distance(ctx.state.position, e.model.root.position) < 13,
    );
    if (bossIntro) {
      bossIntro.introduced = true;
      ctx.framing.focus(bossIntro.model.root);
      ctx.world.startAnimation(bossIntro.model, "victory", 1.4);
      ctx.openDialogue(content.bossName, content.bossRole, content.bossText, [
        ["Pular entrada e abrir o debate", () => ctx.show("play"), true],
      ]);
      return;
    }
    for (const enemy of alive) {
      const pos = enemy.model.root.position,
        boss = enemy.kind === "boss",
        d = distance(ctx.state.position, pos);
      enemy.slow = Math.max(0, enemy.slow - dt);
      enemy.interruptResistance = Math.max(
        0,
        (enemy.interruptResistance || 0) - dt,
      );
      enemy.timer -= dt;
      if (
        !ctx.world.inArena(ctx.state.position, ctx.state.stage === "boss") &&
        enemy.phase !== "idle"
      ) {
        enemy.phase = "idle";
        enemy.model.ring.visible = false;
        enemy.timer = 1;
      }
      if (enemy.role === "support" && enemy.healCharges > 0) {
        enemy.healTimer -= dt;
        if (enemy.healTimer <= 0) {
          enemy.healTimer = 7;
          const ally = alive.find(
            (e) =>
              e !== enemy &&
              e.hp < e.maxHp &&
              distance(pos, e.model.root.position) < 7,
          );
          if (ally) {
            ally.hp = Math.min(ally.maxHp, ally.hp + 18);
            enemy.healCharges--;
            ctx.world.setHealth(ally.model, ally.hp, ally.maxHp);
            ctx.world.pulse(pos, 3, 0x87c1a3);
            ctx.world.damageNumber(ally.model.root.position, "+18", "#b0e9a7");
          }
        }
      }
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
      pos.y = ctx.world.heightAt(pos);
      ctx.world.animateEnemy(
        enemy,
        dt,
        ctx.state.elapsed,
        ctx.settings.reducedMotion,
      );
      if (enemy.stagger > 0) {
        enemy.stagger = Math.max(0, enemy.stagger - dt);
        continue;
      }
      enemy.model.root.rotation.y = Math.atan2(
        pos.x - ctx.state.position.x,
        pos.z - ctx.state.position.z,
      );
      if (
        enemy.phase === "idle" &&
        ctx.world.inArena(ctx.state.position, ctx.state.stage === "boss") &&
        d < (boss ? 15 : 12)
      ) {
        enemy.phase = "chase";
        enemy.timer = 0.5;
      }
      if (enemy.phase === "idle" && distance(pos, enemy.spawn) > 1) {
        const waypoint = ctx.world.nextWaypoint(
            pos,
            enemy.spawn,
            ctx.state,
            ctx.state.stage === "boss"
              ? ctx.world.level.bossArena
              : ctx.world.level.firstArena,
          ),
          len = Math.hypot(waypoint.x - pos.x, waypoint.z - pos.z) || 1;
        ctx.world.move(
          pos,
          ((waypoint.x - pos.x) / len) * dt * 2,
          ((waypoint.z - pos.z) / len) * dt * 2,
          ctx.state,
        );
      }
      if (enemy.phase === "chase") {
        if (
          d >
          (boss
            ? content.number === 2
              ? 6
              : 5
            : content.number === 2
              ? 6
              : 2.8)
        ) {
          const speed = (boss ? 1.9 : 2.4) * (enemy.slow > 0 ? 0.4 : 1);
          enemy.navTime = (enemy.navTime || 0) - dt;
          if (!enemy.waypoint || enemy.navTime <= 0) {
            enemy.waypoint = ctx.world.nextWaypoint(
              pos,
              ctx.state.position,
              ctx.state,
              ctx.state.stage === "boss"
                ? ctx.world.level.bossArena
                : ctx.world.level.firstArena,
            );
            enemy.navTime = 0.5;
          }
          const waypoint = enemy.waypoint;
          const length =
            Math.hypot(waypoint.x - pos.x, waypoint.z - pos.z) || 1;
          if (ctx.world.inArena(ctx.state.position, ctx.state.stage === "boss"))
            ctx.world.move(
              pos,
              ((waypoint.x - pos.x) / length) * speed * dt,
              ((waypoint.z - pos.z) / length) * speed * dt,
              ctx.state,
            );
        }
        const warningCount = alive.filter((e) => e.phase === "warning").length;
        if (
          d < (boss ? 10 : content.number === 2 ? 10 : 4.1) &&
          enemy.timer <= 0 &&
          !warningCount &&
          ctx.world.lineOfSight(pos, ctx.state.position) &&
          ctx.world.inArena(ctx.state.position, ctx.state.stage === "boss")
        )
          ctx.beginWarning(enemy);
      } else if (enemy.phase === "warning") {
        enemy.model.ring.material.opacity =
          0.15 + 0.5 * (1 - Math.max(0, enemy.timer) / enemy.warningDuration);
        if (enemy.timer <= 0) {
          enemy.phase = "recovery";
          enemy.timer = enemy.attack.recovery;
          enemy.model.ring.visible = false;
          ctx.world.pulse(enemy.warningPoint, enemy.radius, 0xe05b3d);
          ctx.world.burst(enemy.warningPoint, 0xe05b3d, 10);
          if (
            ctx.world.lineOfSight(pos, ctx.state.position) &&
            Math.abs(pos.y - ctx.world.heightAt(ctx.state.position)) < 2 &&
            attackHits(
              enemy.attack,
              enemy.warningPoint,
              {
                ...ctx.state.position,
                y: ctx.world.heightAt(ctx.state.position),
              },
              enemy.warningAngle,
            )
          ) {
            const toward = new THREE.Vector2(
              pos.x - ctx.state.position.x,
              pos.z - ctx.state.position.z,
            ).normalize();
            const facing = new THREE.Vector2(
              -Math.sin(ctx.player.root.rotation.y),
              -Math.cos(ctx.player.root.rotation.y),
            );
            const blocked = ctx.defending && facing.dot(toward) > 0.1;
            const taken = receiveDamage(
              ctx.state,
              enemy.attack.damage,
              blocked,
              ctx.settings.difficulty,
            );
            if (taken) {
              ctx.flashTime = 0.5;
              ctx.combatFeedback(
                blocked ? "BLOQUEADO" : `DANO · ${taken}`,
                blocked ? "block" : "hurt",
              );
              ctx.world.startAnimation(ctx.player, "hurt", 0.35);
              ctx.world.flashActor(ctx.player);
              ctx.world.impact(ctx.player.root.position, taken, {
                player: true,
                blocked,
                blood: ctx.settings.blood,
                reduced: ctx.settings.reducedMotion,
              });
              if (!ctx.settings.flashes) ctx.flashTime = 0;
              if (blocked && ctx.state.equipment.accessory === "headphones")
                ctx.state.stamina = clamp(ctx.state.stamina + 12, 0, 100);
              ctx.audio.play(blocked ? "block" : "hurt");
              if (blocked) ctx.notify("Défesa! Dano reduzido.", 1);
            }
          }
        }
      } else if (enemy.phase === "recovery" && enemy.timer <= 0) {
        enemy.phase = "chase";
        enemy.timer = 0.45;
        enemy.model.body.position.y = 0;
      }
      if (
        boss &&
        content.number === 3 &&
        enemy.hp < enemy.maxHp / 2 &&
        !enemy.summoned
      ) {
        enemy.summoned = true;
        for (const [i, minion] of ctx.enemies
          .filter((e) => e.kind === "paper")
          .entries()) {
          if (ctx.state.environment["3:relay"]) continue;
          minion.hp = 45;
          minion.model.root.visible = true;
          minion.model.root.position.set(
            pos.x + (i ? 4 : -4),
            pos.y,
            pos.z + 3,
          );
          minion.deathTime = 0;
          ctx.world.setHealth(minion.model, minion.hp, minion.maxHp);
          minion.phase = "chase";
          minion.timer = 1.5;
        }
        ctx.notify(
          "O Tio chamou reforços! Use uma habilidade em área para romper a corrente.",
          5,
        );
      }
    }
    if (!alive.some((e) => e.phase === "warning"))
      $("combat-caption").classList.add("hidden");
    if (ctx.state.hp <= 0) {
      ctx.state.statistics.defeats++;
      ctx.pendingAttack = null;
      ctx.audio.play("hurt");
      ctx.show("defeat");
      return;
    }
    if (ctx.practice) {
      if (
        ctx.challenge &&
        !alive.length &&
        !ctx.enemies.some((e) => e.deathTime > 0)
      ) {
        ctx.challenge = false;
        const score = {
          time: ctx.state.elapsed,
          damage: ctx.state.statistics.damage,
          hits: ctx.state.statistics.hits,
          attacks: ctx.state.statistics.attacks,
        };
        const scoreKey =
          ctx.state.stage === "boss"
            ? `brasilia-replay-best:${ctx.state.chapter}`
            : "brasilia-challenge-best";
        let best;
        try {
          best = JSON.parse(ctx.safeRead(scoreKey));
        } catch {}
        if (!best || score.time < best.time)
          ctx.persist(scoreKey, JSON.stringify(score));
        ctx.openDialogue(
          "Desafio concluído",
          "PAUSA NO PÁTIO",
          `${score.time.toFixed(1)} s · ${score.hits} acertos / ${score.attacks} golpes · ${score.damage} dano. Nenhuma recompensa da campanha foi duplicada.`,
          [
            [
              "Tentar novamente",
              () =>
                ctx.state.stage === "boss"
                  ? ctx.startReplay(ctx.state.chapter)
                  : ctx.startChallenge(),
              true,
            ],
            ["Voltar ao menu", ctx.returnMenu],
          ],
        );
      }
      return;
    }
    if (
      ctx.state.stage === "arena" &&
      !alive.length &&
      !ctx.enemies.some((e) => e.deathTime > 0)
    ) {
      clearEncounter(ctx.state);
      ctx.saveCheckpoint();
      ctx.loadEncounter();
      ctx.notify("Passagem liberada. Siga o mapa até a sala do chefe.", 5);
    } else if (
      ctx.state.stage === "boss" &&
      !alive.length &&
      !ctx.enemies.some((e) => e.deathTime > 0)
    ) {
      clearEncounter(ctx.state);
      ctx.saveCheckpoint();
      ctx.audio.play("win");
      if (!ctx.state.upgrade) ctx.showUpgrade();
      else {
        ctx.show("play");
        ctx.notify(content.objective.coffee);
      }
    }
  }
  return {
    makeEnemy,
    loadEncounter,
    livingEnemies,
    damageEnemy,
    nearestEnemy,
    faceTarget,
    basicAttack,
    resolveAttack,
    performSkill,
    resolveSkill,
    beginWarning,
    updateEnemies,
  };
}
