/* Sincroniza o Plano de estudo com o checkbox Concluído do Edital.
   Conceitos separados:
   - Concluído = conteúdo/aula do bloco foi finalizado.
   - Atendeu/Revisar = desempenho líquido comparado à meta.
   - Avançar para outra matéria = continua exigindo aula/bloco + questões registradas.
*/
(() => {
  if (typeof finishAdaptiveFlowIfReady !== "function") return;

  function completionTopicId(flow){
    if(!flow) return null;
    // Se nesta rodada as questões foram direcionadas explicitamente para outro tópico,
    // esse tópico é o melhor vínculo para a conclusão mostrada no Edital.
    return flow?.lastBatch?.topicId || flow?.topicId || null;
  }

  function setStudyCompletion(topicId, done){
    if(!topicId || typeof getTS!=="function" || typeof setTS!=="function") return;
    const current=getTS(topicId)||{};
    if(done){
      if(current.done && current.completionSource==="study-plan") return;
      setTS(topicId,{
        done:true,
        completedAtMs:Date.now(),
        completionSource:"study-plan",
        updatedAtMs:Date.now()
      });
    }else if(current.completionSource==="study-plan"){
      setTS(topicId,{
        done:false,
        completedAtMs:null,
        completionSource:null,
        updatedAtMs:Date.now()
      });
    }
    try{save();}catch(e){console.warn("Falha ao salvar conclusão do tópico:",e)}
  }

  // Backup: quando o fluxo completo fecha, garante a marcação no Edital.
  const baseFinish = finishAdaptiveFlowIfReady;
  finishAdaptiveFlowIfReady = function(){
    const flow = typeof readAdaptiveFlow === "function" ? readAdaptiveFlow() : null;
    const ready = !!flow && typeof adaptiveFlowReady === "function" && adaptiveFlowReady(flow);
    const topicId = ready ? completionTopicId(flow) : null;
    const finished = baseFinish();
    if(finished && topicId) setStudyCompletion(topicId,true);
    return finished;
  };

  // Bloco customizado: clicar em "Marcar bloco assistido" já representa conclusão do conteúdo.
  // A matéria só será liberada para avançar quando as questões também forem registradas.
  if(typeof markAdaptiveCustomDone==="function"){
    const baseCustom=markAdaptiveCustomDone;
    markAdaptiveCustomDone=function(v){
      const before=typeof readAdaptiveFlow==="function"?readAdaptiveFlow():null;
      const topicId=completionTopicId(before);
      baseCustom(v);
      if(topicId) setStudyCompletion(topicId,!!v);
      if(typeof renderAll==="function") renderAll();
    };
  }

  // Aulas conhecidas: o tópico só fica Concluído quando todas as aulas daquele bloco estiverem assistidas.
  if(typeof toggleLesson==="function"){
    const baseToggle=toggleLesson;
    toggleLesson=function(id,v){
      const before=typeof readAdaptiveFlow==="function"?readAdaptiveFlow():null;
      const topicId=completionTopicId(before);
      baseToggle(id,v);
      if(before && Array.isArray(before.lessonIds) && before.lessonIds.length){
        const allDone=before.lessonIds.every(lessonId=>typeof lessonDone==="function"&&lessonDone(lessonId));
        if(topicId) setStudyCompletion(topicId,allDone);
        if(typeof renderAll==="function") renderAll();
      }
    };
  }

  // Repara automaticamente sessões em que o usuário já havia marcado o bloco/aulas
  // antes desta correção entrar em vigor.
  try{
    const currentFlow=typeof readAdaptiveFlow==="function"?readAdaptiveFlow():null;
    if(currentFlow && typeof adaptiveLessonsDone==="function" && adaptiveLessonsDone(currentFlow)){
      const topicId=completionTopicId(currentFlow);
      if(topicId){
        setStudyCompletion(topicId,true);
        if(typeof renderAll==="function") renderAll();
      }
    }
  }catch(e){console.warn("Reconciliação de conclusão:",e)}
})();
