/* Feedback visual global: splash de navegação e modal de atualização.
   Não bloqueia a sincronização Firestore nem provoca renderização das telas.
   "Atualizado" aqui significa persistência no estado local; o indicador Firebase
   continua sendo a confirmação independente da nuvem.
*/
(() => {
  const splash=document.getElementById("cguSplash");
  const modal=document.getElementById("cguUpdateModal");
  if(!splash||!modal)return;

  const splashText=splash.querySelector("[data-splash-message]");
  const modalText=modal.querySelector("[data-update-message]");
  const modalHint=modal.querySelector("[data-update-hint]");
  let splashSince=performance.now(),splashSeq=0,splashTimer=0;
  let actionSeq=0,actionSince=0,actionTimer=0,actionPending=false;
  let modulesReady=false;

  function showSplash(message){
    splashSeq++;
    clearTimeout(splashTimer);
    splashSince=performance.now();
    if(splashText)splashText.textContent=message||"Preparando seu plano de estudos";
    splash.classList.remove("is-hidden");
    splash.setAttribute("aria-hidden","false");
    return splashSeq;
  }

  function hideSplash(token){
    if(token!==undefined&&token!==splashSeq)return;
    clearTimeout(splashTimer);
    const seq=splashSeq;
    const delay=Math.max(0,390-(performance.now()-splashSince));
    splashTimer=setTimeout(()=>{
      if(seq!==splashSeq)return;
      splash.classList.add("is-hidden");
      splash.setAttribute("aria-hidden","true");
    },delay);
  }

  function beginAction(message){
    if(!document.body.contains(modal))return;
    actionSeq++;actionPending=true;actionSince=performance.now();
    clearTimeout(actionTimer);
    modal.classList.remove("is-hidden","is-complete");
    modal.setAttribute("aria-hidden","false");
    if(modalText)modalText.textContent=message||"Atualizando informações...";
    if(modalHint)modalHint.textContent="Sem sair desta tela";
    const seq=actionSeq;
    // Segurança: validações abortadas ou erros não prendem a interface.
    actionTimer=setTimeout(()=>{
      if(seq!==actionSeq||!actionPending)return;
      dismissAction(seq);
    },2600);
  }

  function dismissAction(seq){
    if(seq!==undefined&&seq!==actionSeq)return;
    clearTimeout(actionTimer);
    actionPending=false;
    modal.classList.add("is-hidden");
    modal.setAttribute("aria-hidden","true");
  }

  function actionSaved(){
    if(!actionPending)return;
    const seq=actionSeq;
    clearTimeout(actionTimer);
    modal.classList.add("is-complete");
    if(modalText)modalText.textContent="Atualizado no aplicativo";
    if(modalHint)modalHint.textContent="Sincronização com Firebase em segundo plano";
    actionTimer=setTimeout(()=>dismissAction(seq),Math.max(380-(performance.now()-actionSince),230));
  }

  function actionLabel(button){
    const label=(button?.textContent||"").replace(/\s+/g," ").trim().toLowerCase();
    if(/questões|rodada/.test(label))return "Registrando questões...";
    if(/correção|discursiva/.test(label))return "Salvando correção...";
    if(/aula|tema|estud/.test(label))return "Atualizando estudo...";
    if(/revisão|treino/.test(label))return "Atualizando atividade...";
    if(/excluir|remover|apagar/.test(label))return "Atualizando histórico...";
    if(/adiar|realocar/.test(label))return "Reorganizando plano...";
    return "Atualizando informações...";
  }

  const mutatingHandler=/\b(?:CGU_(?:saveQuestionRound|registerPlanQuestions|markPlanStudied|intensiveSaveQuestions|intensiveMarkStudied|toggleWeekendTask|deferGran|p4Save|p4Delete)|toggleLesson|markDone|setPriority|setQuestion|updateSetting|importBackup)\s*\(/i;
  const mutatingLabel=/^(?:\+?\s*)?(?:salvar|registrar|somar|marcar|concluir|reabrir|excluir|adiar|realocar|apagar|restaurar|✓)/i;

  document.addEventListener("click",ev=>{
    if(!ev.isTrusted)return;
    const button=ev.target.closest?.("button");
    if(!button||button.disabled||button.closest("#cguSplash,#cguUpdateModal,#authGate"))return;
    if(button.dataset.page||button.id==="sidebarToggle"||button.id==="firebaseLogout")return;
    const handler=button.getAttribute("onclick")||"";
    const label=(button.textContent||"").trim();
    // Abertura de formulários, filtros, navegação e exportação não gravam dados.
    if(/CGU_(?:toggleQuestionRound|toggleQuestionHistory|p4Edit|p4CancelEdit|p4Live|p4TypeChanged)|exportBackup|switchPage|goSubject/.test(handler))return;
    if(mutatingHandler.test(handler)||mutatingLabel.test(label))beginAction(actionLabel(button));
  },true);

  document.addEventListener("change",ev=>{
    if(!ev.isTrusted)return;
    const el=ev.target;
    if(!el||el.closest?.("#authGate"))return;
    const handler=el.getAttribute?.("onchange")||"";
    if(el.id==="importFile"&&el.files?.length){
      beginAction("Importando dados...");
      return;
    }
    if(/\b(?:setPriority|setText|markDone|setQuestion|updateSetting|toggleLesson)\s*\(/.test(handler)){
      beginAction("Salvando alteração...");
    }
  },true);

  ["cgu-state-saved","cgu-plan-changed","cgu-p4-changed"].forEach(eventName=>{
    window.addEventListener(eventName,actionSaved);
  });

  function installNavigation(){
    const original=window.switchPage;
    if(typeof original!=="function"||original.__cguSplashWrapped)return;
    function switched(name,button){
      if(document.getElementById("page-"+name)?.classList.contains("active")){
        return original.apply(this,arguments);
      }
      const titles={
        dashboard:"Visão geral",hoje:"Plano de estudos",sprint28:"Intensivão · 34 dias",edital:"Edital por prioridade",
        revisar:"Revisar",discursiva:"Discursivas / P4",cronograma:"Cronograma do edital"
      };
      const token=showSplash("Abrindo "+(titles[name]||"a página")+"...");
      try{
        const result=original.apply(this,arguments);
        requestAnimationFrame(()=>requestAnimationFrame(()=>hideSplash(token)));
        return result;
      }catch(error){
        hideSplash(token);
        throw error;
      }
    }
    switched.__cguSplashWrapped=true;
    window.switchPage=switched;
  }

  function appReady(){
    modulesReady=true;
    installNavigation();
    hideSplash();
  }
  window.addEventListener("cgu-app-ready",appReady);
  // Caso um módulo falhe ao carregar, a tela de login e o app permanecem acessíveis.
  setTimeout(()=>{if(!modulesReady)hideSplash();},8000);

  window.CGUFeedback={
    begin:beginAction,complete:actionSaved,cancel:()=>dismissAction(),
    splash:showSplash,hideSplash,installNavigation
  };
})();
