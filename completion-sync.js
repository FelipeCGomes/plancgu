/* Sincroniza o fechamento de um bloco do Plano de estudo com o checkbox Concluído do Edital.
   Conclusão e desempenho são conceitos independentes:
   - Concluído = bloco de estudo finalizado (aulas previstas + questões registradas).
   - Atendeu/Revisar = resultado líquido comparado à meta.
*/
(() => {
  if (typeof finishAdaptiveFlowIfReady !== "function") return;

  const baseFinish = finishAdaptiveFlowIfReady;

  finishAdaptiveFlowIfReady = function(){
    const flow = typeof readAdaptiveFlow === "function" ? readAdaptiveFlow() : null;
    const ready = !!flow && typeof adaptiveFlowReady === "function" && adaptiveFlowReady(flow);

    // Se as questões foram lançadas em outro tópico pelo seletor do Plano,
    // o tópico selecionado é o que recebe a conclusão. Caso contrário, usa o tópico do bloco.
    const completedTopicId = ready
      ? (flow?.lastBatch?.topicId || flow?.topicId || null)
      : null;

    const finished = baseFinish();

    if (finished && completedTopicId) {
      const current = typeof getTS === "function" ? getTS(completedTopicId) : {};
      if (!current.done) {
        setTS(completedTopicId, {
          done: true,
          completedAtMs: Date.now(),
          completionSource: "study-plan"
        });
      }
      try { save(); } catch (e) { console.warn("Falha ao salvar conclusão do tópico:", e); }
    }

    return finished;
  };

  // Ao desmarcar manualmente o checkbox no Edital, a decisão do usuário continua prevalecendo.
  // A automação só volta a marcar numa nova conclusão completa de bloco.
})();
