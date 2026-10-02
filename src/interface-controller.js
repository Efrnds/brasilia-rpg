import { CHARACTERS, skillFor, objective, upgrade } from "./domain.js";
import { chapterContent } from "./content.js";

import { SPECIALIZATIONS } from "./rpg.js";
import { evidenceConnections } from "./investigation.js";

import { encounterSummary } from "./encounters.js";
import { nextTutorial } from "./tutorial.js";
import { EXTRA_CASES } from "./expansion.js";
import { element } from "./ui.js";

const $ = (id) => document.getElementById(id);
export function createInterfaceController(ctx) {
  function buildSkills() {
    $("skill-buttons").replaceChildren();
    ctx.state.loadout.forEach((_, index) => {
      const skill = skillFor(ctx.state, index);
      const button = document.createElement("button");
      button.className = "skill-button";
      button.dataset.skill = index;
      button.innerHTML = `<kbd>${index + 1}</kbd><span class="cooldown"></span><strong>${skill.name}</strong><small>${skill.hint}</small>`;
      button.title = `${skill.name}: ${skill.cost} de fôlego; polarização ${skill.pol > 0 ? "+" : ""}${skill.pol}; recarga ${skill.cooldown}s.`;
      button.addEventListener("click", () => ctx.performSkill(index));
      $("skill-buttons").append(button);
    });
  }

  function openDialogue(name, role, text, choices, closable = true) {
    ctx.dialogueReturn =
      ctx.mode === "selection"
        ? "selection"
        : ctx.mode === "pause"
          ? "pause"
          : "play";
    ctx.dialogueClosable = closable;
    if (ctx.state && ctx.gameplayActive && name !== "Nova investigação") {
      ctx.state.dialogueHistory.push(`${name}: ${text}`);
      ctx.state.dialogueHistory = ctx.state.dialogueHistory.slice(-60);
    }
    $("speaker-name").textContent = name;
    $("speaker-role").textContent = role;
    $("dialogue-text").textContent = text;
    $("dialogue-choices").replaceChildren();
    for (const [label, action, primary = false] of choices) {
      const button = document.createElement("button");
      button.className = primary ? "primary" : "secondary";
      button.textContent = label;
      button.addEventListener("click", action);
      $("dialogue-choices").append(button);
    }
    const npc = ctx.world.npcs.find((n) => n.name === name);
    if (npc) {
      ctx.faceTarget(npc.model.root.position);
      ctx.world.startAnimation(npc.model, "talk", 1.5);
    }
    ctx.show("dialogue");
    ctx.audio.play("talk");
  }

  function drawMinimap() {
    const paint = $("minimap").getContext("2d"),
      w = 150,
      h = 170;
    paint.fillStyle = "#243d33";
    paint.fillRect(0, 0, w, h);
    const bounds = ctx.world.level.bounds;
    const scale = Math.min(
      138 / (bounds.maxX - bounds.minX),
      158 / (bounds.maxZ - bounds.minZ),
    );
    const point = (p) => ({
      x: 6 + (p.x - bounds.minX) * scale,
      y: 6 + (p.z - bounds.minZ) * scale,
    });
    paint.fillStyle = "#8c9981";
    for (const surface of ctx.world.level.surfaces) {
      const locked =
        (surface.lock === "permit" && !ctx.state.permit) ||
        (surface.lock === "boss" &&
          !["boss", "coffee", "complete"].includes(ctx.state.stage)) ||
        (surface.requiresEvidence && !ctx.state.stamp);
      paint.fillStyle = locked
        ? "#45514a"
        : surface.y > 0 || surface.ramp
          ? "#b7ab89"
          : "#8c9981";
      const p = point(surface);
      if (surface.type === "circle") {
        paint.beginPath();
        paint.arc(p.x, p.y, surface.radius * scale, 0, Math.PI * 2);
        paint.fill();
      } else
        paint.fillRect(
          p.x - (surface.w * scale) / 2,
          p.y - (surface.d * scale) / 2,
          surface.w * scale,
          surface.d * scale,
        );
    }
    const dot = (p, color, radius, symbol = "●") => {
      const loc = point(p);
      paint.fillStyle = color;
      paint.font = `bold ${radius * 3}px sans-serif`;
      paint.textAlign = "center";
      paint.textBaseline = "middle";
      paint.fillText(symbol, loc.x, loc.y);
    };
    for (const n of ctx.world.npcs) dot(n, "#e6dbc0", 2.5, "○");
    if (!ctx.state.stamp) dot(ctx.world.level.evidence, "#f5e5bb", 2.5, "□");
    if (ctx.state.sideQuest === "active")
      dot(ctx.world.level.sideItem, "#a6d6c5", 3.2, "+");
    let target = {
      investigate: ctx.world.level.witness,
      permit: ctx.world.level.gatekeeper,
      arena: ctx.world.level.mobs[0],
      boss: ctx.world.level.boss,
      coffee: ctx.world.level.collection,
      complete: ctx.world.level.collection,
    }[ctx.state.stage];
    if (ctx.extraCase)
      target =
        EXTRA_CASES[ctx.extraCase].points.find(
          (p) =>
            !ctx.extraProgress.includes(p.id) &&
            p.requires.every((id) => ctx.extraProgress.includes(id)),
        ) || ctx.world.level.collection;
    dot(target, "#f4c74b", 4, "◇");
    for (const e of ctx.livingEnemies())
      dot(e.model.root.position, "#f49a77", 3, "×");
    for (const o of ctx.world.obstacles) {
      const p = point(o);
      paint.fillStyle = "#354139";
      paint.fillRect(
        p.x - o.w * scale,
        p.y - o.d * scale,
        o.w * 2 * scale,
        o.d * 2 * scale,
      );
    }
    if (!ctx.practice) {
      const p = point(ctx.world.level.gate);
      paint.fillStyle = ctx.state.permit ? "#a8c89a" : "#db9984";
      paint.font = "bold 11px sans-serif";
      paint.fillText(ctx.state.permit ? "/" : "⊥", p.x, p.y);
    }
    const p = point(ctx.state.position);
    paint.save();
    paint.translate(p.x, p.y);
    paint.rotate(-ctx.player.root.rotation.y);
    paint.fillStyle = "#fff5db";
    paint.beginPath();
    paint.moveTo(0, -5);
    paint.lineTo(-4, 4);
    paint.lineTo(4, 4);
    paint.closePath();
    paint.fill();
    paint.restore();
    paint.fillStyle = "#fff3db";
    paint.font = "9px sans-serif";
    paint.textAlign = "left";
    paint.fillText(
      `N ↑ · altura ${ctx.world.heightAt(ctx.state.position).toFixed(1)} m`,
      5,
      158,
    );
    paint.fillText("◇ destino  □ prova  × perigo", 5, 169);
  }

  function updateHUD() {
    if (!ctx.state) return;
    ctx.world.sync(ctx.state);
    const content = chapterContent(ctx.state);
    $("quest-chapter").textContent =
      `0${ctx.state.chapter} / ${content.title.toUpperCase()}`;
    $("map-area").textContent = content.area;
    $("objective").textContent = objective(ctx.state);
    $("optional-objective").textContent = ctx.state.stamp
      ? `Prova obtida: ${content.item}.`
      : `Opcional: ${content.optional}`;
    if (ctx.state.sideQuest === "active")
      $("optional-objective").textContent +=
        ` Apoio: encontre ${content.sideItem}.`;
    else if (ctx.state.sideQuest === "retrieved")
      $("optional-objective").textContent += ` Devolva ${content.sideItem}.`;
    if (ctx.practice) {
      $("quest-chapter").textContent = "TREINO LIVRE";
      $("map-area").textContent = "PÁTIO DE TREINO";
      $("objective").textContent = "Teste golpes, cobertura e a passarela.";
      $("optional-objective").textContent =
        "Treino não altera o checkpoint da campanha.";
    }
    if (ctx.extraCase) {
      $("quest-chapter").textContent = EXTRA_CASES[ctx.extraCase].subtitle;
      $("map-area").textContent = EXTRA_CASES[ctx.extraCase].title;
      $("objective").textContent = EXTRA_CASES[ctx.extraCase].goal;
      $("optional-objective").textContent =
        `Registros ${ctx.extraProgress.length}/${EXTRA_CASES[ctx.extraCase].points.length}`;
    }
    const tutorial = nextTutorial(ctx.state);
    $("tutorial-panel").classList.toggle("hidden", !tutorial || ctx.practice);
    $("tutorial-text").textContent = tutorial?.text || "";
    $("player-name").textContent = CHARACTERS[ctx.state.character].name;
    $("player-level").textContent = `NÍVEL ${ctx.state.level}`;
    $("hp-text").textContent =
      `${Math.ceil(ctx.state.hp)} / ${ctx.state.maxHp}`;
    $("hp-fill").style.width = `${(ctx.state.hp / ctx.state.maxHp) * 100}%`;
    $("stamina-text").textContent = `${Math.floor(ctx.state.stamina)} / 100`;
    $("stamina-fill").style.width = `${ctx.state.stamina}%`;
    $("pol-text").textContent = `${ctx.state.polarization} / 100`;
    $("pol-fill").style.width = `${ctx.state.polarization}%`;
    for (const button of $("skill-buttons").children) {
      const i = Number(button.dataset.skill),
        skill = skillFor(ctx.state, i);
      button.disabled =
        ctx.mode !== "play" ||
        ctx.state.cooldowns[i] > 0 ||
        (skill.ultimate && ctx.state.ultimateUsed) ||
        (skill.heal && ctx.state.heals <= 0);
      button.querySelector(".cooldown").textContent =
        ctx.state.cooldowns[i] > 0
          ? `${Math.ceil(ctx.state.cooldowns[i])}s`
          : skill.ultimate && ctx.state.ultimateUsed
            ? "USADO"
            : skill.heal
              ? `×${ctx.state.heals}`
              : "";
      if (skill.heal)
        button.querySelector("small").textContent =
          `Cura • ${ctx.state.sideQuest === "complete" ? "4" : "3"} cargas por encontro`;
    }
    const boss = ctx.enemies.find((e) => e.kind === "boss");
    $("enemy-title").textContent = content.bossName.toUpperCase();
    $("boss-bar").classList.toggle("hidden", ctx.state.stage !== "boss");
    $("enemy-hp").style.width = `${(boss.hp / boss.maxHp) * 100}%`;
    $("enemy-warning").textContent = encounterSummary(boss, ctx.state);
    ctx.drawMinimap();
  }

  function openJournal() {
    if (ctx.mode !== "play") return;
    if (ctx.extraCase) {
      const content = EXTRA_CASES[ctx.extraCase];
      $("journal-title").textContent = content.title;
      $("journal-current").textContent = content.goal;
      $("journal-steps").replaceChildren(
        ...content.points.map((p) =>
          element(
            "li",
            `${p.title}: ${ctx.extraProgress.includes(p.id) ? p.text : "registro ainda não examinado"}`,
            ctx.extraProgress.includes(p.id) ? "done" : "",
          ),
        ),
      );
      $("inventory-text").textContent =
        "Registros deste caso ficam separados dos checkpoints da campanha.";
      $("journal-build").textContent =
        "Conclua a investigação e retorne ao gabinete.";
      ctx.show("journal");
      return;
    }
    if (ctx.practice) {
      $("journal-title").textContent = "Pátio de treino";
      $("journal-current").textContent = "Teste alcance, cobertura e a rampa.";
      $("journal-steps").replaceChildren(
        element(
          "li",
          `${ctx.state.statistics.hits} acertos em ${ctx.state.statistics.attacks} golpes`,
        ),
      );
      $("inventory-text").textContent =
        "Treino não entrega recompensas nem substitui campanha.";
      $("journal-build").textContent =
        "Ajuste habilidades e equipamento fora da arena pela pausa.";
      ctx.show("journal");
      return;
    }
    const content = chapterContent(ctx.state);
    $("journal-title").textContent = `${ctx.state.chapter}. ${content.title}`;
    $("journal-current").textContent = objective(ctx.state);
    const steps = [
      [`Ouvir ${content.npc.witness}.`, ctx.state.talked],
      ["Obter acesso ao pátio.", ctx.state.permit],
      [
        "Resolver o confronto ou negociar.",
        ["boss", "coffee", "complete"].includes(ctx.state.stage),
      ],
      [content.objective.coffee, ctx.state.stage === "complete"],
    ];
    steps.push([
      `Opcional: recuperar ${content.sideItem} para ${content.npc.helper}.`,
      ctx.state.sideQuest === "complete",
    ]);
    $("journal-steps").replaceChildren();
    for (const [text, done] of steps) {
      const li = document.createElement("li");
      li.textContent = text;
      if (done) li.className = "done";
      $("journal-steps").append(li);
    }
    $("inventory-text").textContent =
      [
        ctx.state.stamp ? content.item : "",
        ...ctx.state.history.map(
          (h) =>
            `Capítulo ${h.chapter}: ${h.evidence ? "prova original" : "registro de confronto"}`,
        ),
        ctx.state.upgrades.length
          ? `${ctx.state.upgrades.filter((u) => u === "vitality").length} melhoria(s) de vida; ${ctx.state.upgrades.filter((u) => u === "power").length} melhoria(s) de dano`
          : "",
        ["coffee", "complete"].includes(ctx.state.stage) ? content.clue : "",
      ]
        .filter(Boolean)
        .join(" • ") || "Pasta vazia. Explore para encontrar evidências.";
    for (const connection of evidenceConnections(ctx.state))
      $("journal-steps").append(
        element("li", connection, "evidence-connection"),
      );
    for (const proof of ctx.state.proofs)
      $("journal-steps").append(element("li", proof, "evidence-connection"));
    $("journal-build").textContent =
      `Polarização: ${ctx.state.polarization}/100. Cura: ${ctx.state.heals} cargas. ${ctx.state.negotiated ? "Acesso negociado." : content.optional}`;
    ctx.show("journal");
  }

  function showUpgrade() {
    const support = SPECIALIZATIONS[ctx.state.character].support,
      power = SPECIALIZATIONS[ctx.state.character].power;
    $("upgrade-vitality").querySelector("strong").textContent = support.name;
    $("upgrade-vitality").querySelector("span").textContent =
      `+25 vida. ${support.description}`;
    $("upgrade-power").querySelector("strong").textContent = power.name;
    $("upgrade-power").querySelector("span").textContent =
      `+25% dano. ${power.description}`;
    $("upgrade-chapter").textContent =
      `NÍVEL ${ctx.state.level + 1} / PAUTA RESOLVIDA`;
    ctx.show("upgrade");
  }

  function chooseUpgrade(choice) {
    if (upgrade(ctx.state, choice)) {
      ctx.saveCheckpoint();
      ctx.show("play");
      ctx.notify(`Nível ${ctx.state.level}! ${objective(ctx.state)}`);
      ctx.updateHUD();
    }
  }
  return {
    buildSkills,
    openDialogue,
    drawMinimap,
    updateHUD,
    openJournal,
    showUpgrade,
    chooseUpgrade,
  };
}
