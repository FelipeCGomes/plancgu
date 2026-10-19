/* Garante que o fluxo adaptativo também seja persistido quando é concluído ou alterado. */
(() => {
  if(typeof finishAdaptiveFlowIfReady!=="function")return;
  const baseFinish=finishAdaptiveFlowIfReady;
  finishAdaptiveFlowIfReady=function(){
    const finished=baseFinish();
    if(finished){
      try{save();}catch(e){}
    }
    return finished;
  };

  if(typeof markAdaptiveCustomDone==="function"){
    const baseCustom=markAdaptiveCustomDone;
    markAdaptiveCustomDone=function(v){
      baseCustom(v);
      try{save();}catch(e){}
    };
  }

  if(typeof markQuestionsAlreadyRegistered==="function"){
    const baseAlready=markQuestionsAlreadyRegistered;
    markQuestionsAlreadyRegistered=function(v){
      baseAlready(v);
      try{save();}catch(e){}
    };
  }
})();
