import {
  distance,
  reportTheft,
  collectStamp,
  enterPalace,
  restoreEncounter,
  advanceSideQuest,
} from "./domain.js";
import { chapterContent } from "./content.js";

import { awardItem } from "./rpg.js";
import {
  CASES,
  EDIT_STEPS,
  NETWORK_STEPS,
  SIDE_TASKS,
  PROOF_NOTES,
  evaluateAnswer,
} from "./investigation.js";
import { environmentTargets } from "./environment.js";

import { completeTutorial } from "./tutorial.js";
import { EXTRA_CASES, EXTRA_QUESTIONS } from "./expansion.js";

const $ = (id) => document.getElementById(id);
export function createInvestigationController(ctx) {
  function runInvestigation(key, questions, onComplete) {
    const progress = Number(ctx.state.negotiation[key] || 0);
    if (progress >= questions.length) {
      onComplete();
      return;
    }
    const question = questions[progress];
    const options = question.answers.map(([id, text]) => [
      text,
      () => {
        if (evaluateAnswer(question, id)) {
          ctx.state.negotiation[key] = progress + 1;
          ctx.audio.play("confirm");
          ctx.saveCheckpoint();
          ctx.runInvestigation(key, questions, onComplete);
        } else {
          ctx.audio.play("cancel");
          ctx.notify(
            question.explanation || "Confira os registros antes de escolher.",
            4,
          );
          ctx.state.flags[`${key}:mistakes`] =
            (ctx.state.flags[`${key}:mistakes`] || 0) + 1;
          ctx.runInvestigation(key, questions, onComplete);
        }
      },
    ]);
    options.push(["Voltar à investigação", () => ctx.show("play")]);
    ctx.openDialogue(
      "Pasta de investigação",
      `${progress + 1}/${questions.length} · ${question.question}`,
      question.clue,
      options,
    );
  }

  function collectEvidence() {
    completeTutorial(ctx.state, "evidence");
    collectStamp(ctx.state);
    ctx.state.proofs.push(PROOF_NOTES[ctx.state.chapter]);
    ctx.world.sync(ctx.state);
    ctx.saveCheckpoint();
    ctx.audio.play("pickup");
    ctx.world.burst(ctx.state.position);
    ctx.notify(
      `${chapterContent(ctx.state).item} obtido. A pasta registra o contexto.`,
    );
    ctx.show("play");
    ctx.updateHUD();
  }

  function interactEnvironment(id) {
    const key = `${ctx.state.chapter}:${id}`;
    if (id === "bridge" && !ctx.state.stamp) {
      ctx.notify("A trava exige a mensagem original.", 3);
      return;
    }
    const apply = () => {
      ctx.state.environment[key] = true;
      if (id === "secret") {
        awardItem(
          ctx.state,
          ["badge", "headphones", "router"][ctx.state.chapter - 1],
        );
        ctx.state.secretFound.push(key);
        ctx.notify("Equipamento encontrado. Veja sua pasta.", 3);
      } else ctx.notify("Equipamento desativado; o encontro foi alterado.", 3);
      ctx.world.sync(ctx.state);
      ctx.audio.play("repair");
      ctx.saveCheckpoint();
      ctx.show("play");
      ctx.updateHUD();
    };
    if (id === "relay") ctx.runInvestigation("network", NETWORK_STEPS, apply);
    else if (id === "broadcast")
      ctx.runInvestigation("edit", EDIT_STEPS, apply);
    else apply();
  }

  function interact() {
    if (ctx.mode !== "play" || !ctx.interactTarget) return;
    if (ctx.extraCase) {
      const point = ctx.interactTarget;
      const taskId = `${ctx.extraCase}:${point.id}`,
        task = EXTRA_QUESTIONS[taskId];
      if (task && !ctx.state.flags[`extra:${taskId}`]) {
        ctx.runInvestigation(`extra:${taskId}`, [task], () => {
          ctx.state.flags[`extra:${taskId}`] = true;
          if (point.id === "valve" && ctx.world.extraValve) {
            ctx.world.extraValve.rotation.z = Math.PI * 0.5;
            ctx.world.pulse({ x: 7, z: -13 }, 2, 0x8caec4);
            ctx.audio.play("repair");
          }
          ctx.show("play");
          ctx.interact();
        });
        return;
      }
      ctx.openDialogue(
        point.title,
        EXTRA_CASES[ctx.extraCase].subtitle,
        point.text,
        [
          [
            "Registrar e continuar",
            () => {
              ctx.extraProgress.push(point.id);
              if (
                ctx.extraProgress.length ===
                EXTRA_CASES[ctx.extraCase].points.length
              ) {
                ctx.persist(`brasilia-extra:${ctx.extraCase}`, "complete");
                ctx.notify("Caso concluído. Sua campanha foi preservada.", 5);
                const actions = [
                  ["Voltar ao gabinete", () => ctx.returnMenu(), true],
                ];
                if (ctx.extraCase === "prologue")
                  actions.unshift([
                    "Iniciar a investigação principal",
                    () => ctx.show("selection"),
                    true,
                  ]);
                ctx.openDialogue(
                  "Dona Nair",
                  "CASO CONCLUÍDO",
                  point.text,
                  actions,
                );
              } else {
                ctx.show("play");
                ctx.updateHUD();
              }
            },
            true,
          ],
        ],
      );
      return;
    }
    const content = chapterContent(ctx.state);
    const id = ctx.interactTarget.id;
    if (id.startsWith("env:")) {
      ctx.interactEnvironment(id.slice(4));
      return;
    }
    if (id === "stamp") {
      if (ctx.state.chapter === 2)
        ctx.runInvestigation("edit", EDIT_STEPS, ctx.collectEvidence);
      else if (ctx.state.chapter === 3)
        ctx.runInvestigation("origin", [CASES[3]], ctx.collectEvidence);
      else ctx.collectEvidence();
      return;
    }
    if (id === "coffee") {
      ctx.finish(true);
      return;
    }
    if (id === "sideItem") {
      if (ctx.state.sideQuest === "active") {
        ctx.runInvestigation(
          `side:${ctx.state.chapter}`,
          [SIDE_TASKS[ctx.state.chapter]],
          () => {
            advanceSideQuest(ctx.state);
            ctx.saveCheckpoint();
            ctx.world.sync(ctx.state);
            ctx.audio.play("pickup");
            ctx.show("play");
            ctx.updateHUD();
            ctx.notify(
              `${content.sideItem} resolvido. Conte a ${content.npc.helper}.`,
            );
          },
        );
      }
      return;
    }
    if (id === "nair") {
      ctx.openDialogue(
        content.npc.witness,
        content.witnessRole,
        (ctx.state.talked ? content.repeatText : content.witnessText) +
          (ctx.state.chapter > 1 && ctx.state.history.at(-1)?.helped
            ? " A equipe que você ajudou enviou uma cópia dos registros e colocou seu contato na nossa lista."
            : "") +
          (ctx.state.polarization >= 75
            ? " Aqui a conversa já chegou como acusação. Confira o original antes de responder."
            : ""),
        [
          [
            ctx.state.talked
              ? "Pode deixar comigo."
              : ctx.state.character === "luli"
                ? "Quero ouvir quem recebeu a carga antes de fechar a pauta."
                : "Vou conferir o trajeto e cobrar o responsável pelo registro.",
            () => {
              if (reportTheft(ctx.state)) ctx.saveCheckpoint();
              ctx.show("play");
              ctx.updateHUD();
              ctx.notify(
                `Fale com ${content.npc.gatekeeper}. ${content.optional}`,
              );
            },
            true,
          ],
        ],
      );
      return;
    }
    if (id === "estagiario") {
      if (ctx.state.sideQuest === "retrieved") {
        ctx.openDialogue(
          content.npc.helper,
          "TAREFA OPCIONAL / DEVOLUÇÃO",
          content.sideThanks,
          [
            [
              "Concluir tarefa e receber equipamento e apoio",
              () => {
                advanceSideQuest(ctx.state);
                ctx.saveCheckpoint();
                ctx.show("play");
                ctx.updateHUD();
                ctx.notify(
                  "Apoio conquistado: 4 cargas de cura por encontro neste capítulo.",
                );
              },
              true,
            ],
          ],
        );
        return;
      }
      if (
        ctx.state.sideQuest === "available" ||
        ctx.state.sideQuest === "active"
      ) {
        ctx.openDialogue(
          content.npc.helper,
          "UMA TAREFA FORA DA PAUTA",
          content.sideRequest,
          [
            [
              ctx.state.sideQuest === "available"
                ? "Vou procurar para você."
                : "Já estou procurando.",
              () => {
                if (ctx.state.sideQuest === "available") {
                  advanceSideQuest(ctx.state);
                  ctx.saveCheckpoint();
                }
                ctx.show("play");
                ctx.updateHUD();
                ctx.notify(content.sideRequest);
              },
              true,
            ],
            [
              "Descansar antes de continuar",
              () => {
                restoreEncounter(ctx.state);
                ctx.show("play");
                ctx.updateHUD();
                ctx.notify("Vida, fôlego e cargas recuperados.");
              },
            ],
            ["Agora não.", () => ctx.show("play")],
          ],
        );
        return;
      }
      ctx.openDialogue(
        content.npc.helper,
        "APOIO / PAUSA PARA RESPIRAR",
        ctx.state.chapter === 1
          ? "Eu separo a papelada por ordem de desespero. A área vermelha no chão é um aviso de ataque. Saia dela antes do carimbo bater. Se precisar, tenho água e zero autoridade."
          : ctx.state.chapter === 2
            ? "O influencer prepara o corte antes de atacar. Fuja do círculo e espere ele perder o ritmo. O ring light explode perto dele: mantenha distância nessa hora. A verdade não precisa de thumbnail."
            : "O tio manda áudio, flor e corrente. Depois que perde metade da vida, chama reforços. Guarde um ataque em área para essa hora. E não confunda a mensagem original com um encaminhamento.",
        [
          [
            "Aceitar água e descansar",
            () => {
              restoreEncounter(ctx.state);
              ctx.show("play");
              ctx.notify("Vida, fôlego e cargas recuperados.");
            },
            true,
          ],
          ["Obrigado pela informação.", () => ctx.show("play")],
        ],
      );
      return;
    }
    if (id === "assessor") {
      if (!ctx.state.talked) {
        ctx.openDialogue(
          content.npc.gatekeeper,
          content.gateRole,
          `Antes de abrir o acesso, ouça ${content.npc.witness}. Uma investigação precisa de contexto. Sem isso, é só gente andando com convicção.`,
          [["Vou ouvir o relato.", () => ctx.show("play"), true]],
        );
        return;
      }
      if (ctx.state.permit) {
        ctx.openDialogue(
          content.npc.gatekeeper,
          "ACESSO LIBERADO",
          "Sua entrada está liberada. O registro que você procura está no fundo do pátio. Você já tem o que precisa para continuar.",
          [["Continuar a investigação", () => ctx.show("play"), true]],
        );
        return;
      }
      const choices = [];
      if (ctx.state.stamp)
        choices.push([
          `${content.negotiation} • polarização −10`,
          () => {
            ctx.runInvestigation(
              `case:${ctx.state.chapter}`,
              [CASES[ctx.state.chapter]],
              () => {
                enterPalace(ctx.state, true);
                completeTutorial(ctx.state, "negotiation");
                ctx.state.flags[`chapter:${ctx.state.chapter}:agreement`] =
                  true;
                ctx.world.sync(ctx.state);
                ctx.loadEncounter();
                ctx.saveCheckpoint();
                ctx.audio.play("win");
                ctx.showUpgrade();
                ctx.updateHUD();
              },
            );
            ctx.updateHUD();
          },
          true,
        ]);
      choices.push([
        `${content.combat} • polarização +8`,
        () => {
          enterPalace(ctx.state, false);
          completeTutorial(ctx.state, "negotiation");
          restoreEncounter(ctx.state);
          ctx.world.sync(ctx.state);
          ctx.loadEncounter();
          ctx.saveCheckpoint();
          ctx.show("play");
          ctx.notify(
            "Clique ou F para atacar. Saia dos avisos vermelhos e use as habilidades.",
            5,
          );
          ctx.updateHUD();
        },
        !ctx.state.stamp,
      ]);
      choices.push(["Vou investigar mais um pouco.", () => ctx.show("play")]);
      ctx.openDialogue(
        content.npc.gatekeeper,
        content.gateRole,
        ctx.state.stamp ? content.gateEvidenceText : content.gateText,
        choices,
      );
    }
  }

  function interactionAt() {
    if (ctx.extraCase) {
      const next = EXTRA_CASES[ctx.extraCase].points.filter(
        (p) =>
          !ctx.extraProgress.includes(p.id) &&
          p.requires.every((id) => ctx.extraProgress.includes(id)),
      );
      return (
        next
          .map((p) => ({ ...p, label: p.title, reach: 3.1 }))
          .find((p) => distance(ctx.state.position, p) < 3.1) || null
      );
    }
    if (ctx.practice) return null;
    const content = chapterContent(ctx.state);
    const targets = [
      ...environmentTargets(ctx.state),
      ...ctx.world.npcs.map((n) => ({
        ...n,
        label: `Conversar com ${n.name}`,
        reach: 3.2,
      })),
    ];
    if (!ctx.state.stamp)
      targets.push({
        id: "stamp",
        ...ctx.world.level.evidence,
        label: `Recolher: ${content.item}`,
        reach: 3.2,
      });
    if (ctx.state.sideQuest === "active")
      targets.push({
        id: "sideItem",
        ...ctx.world.level.sideItem,
        label: `Recolher: ${content.sideItem}`,
        reach: 3.1,
      });
    if (ctx.state.stage === "coffee")
      targets.push({
        id: "coffee",
        ...ctx.world.level.collection,
        label:
          content.number === 3
            ? "Recuperar os 37 pacotes"
            : `Examinar: ${content.clue}`,
        reach: 3.2,
      });
    let closest = null,
      nearest = Infinity;
    for (const target of targets) {
      const d = distance(ctx.state.position, target);
      if (
        d < target.reach &&
        d < nearest &&
        ctx.world.lineOfSight(
          {
            ...ctx.state.position,
            y: ctx.world.heightAt(ctx.state.position) + 0.5,
          },
          { ...target, y: ctx.world.heightAt(target) + 0.5 },
        )
      ) {
        nearest = d;
        closest = target;
      }
    }
    return closest;
  }
  return {
    runInvestigation,
    collectEvidence,
    interactEnvironment,
    interact,
    interactionAt,
  };
}
