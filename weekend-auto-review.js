/* Atualização automática da revisão de sábado.
   Sempre que uma nova rodada de questões é registrada, recalcula o plano de sábado.
   Como a lista do sábado usa apenas tópicos com status "Revisar", um tópico some
   automaticamente quando a última rodada atinge a meta operacional do bloco. */
(() => {
  function selectedYmd(){
    const el=document.getElementById("studyDate");
    if(el?.value)return el.value;
    const d=new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  function isSaturday(ymd){
    if(!ymd)return false;
    const d=new Date(ymd+"T12:00:00");
    return !Number.isNaN(d.getTime()) && d.getDay()===6;
  }
  function refreshSaturday(){
    const ymd=selectedYmd();
    if(!isSaturday(ymd))return;
    try{renderToday();}catch(e){console.warn("Falha ao atualizar revisão de sábado",e);}
  }

  window.addEventListener("cgu-question-recorded",()=>setTimeout(refreshSaturday,0));
  window.addEventListener("cgu-cloud-ready",()=>setTimeout(refreshSaturday,0));
})();
