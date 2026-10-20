/* Backup completo da versão atômica. */
(() => {
  exportBackup=function(){
    const dailyPlans=typeof window.CGU_readDailyPlans==="function"?window.CGU_readDailyPlans():{};
    const blob=new Blob([JSON.stringify({version:8,state,settings,lessonState,dailyPlans,exportedAt:new Date().toISOString()},null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="cgu3-backup-v8.json";a.click();URL.revokeObjectURL(a.href);
  };
  importBackup=function(inp){
    const f=inp.files&&inp.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=e=>{try{
      const o=JSON.parse(e.target.result);state=o.state||{};settings={...DEFAULT_META,...(o.settings||{})};lessonState=o.lessonState||{};
      if(typeof window.CGU_writeDailyPlans==="function")window.CGU_writeDailyPlans(o.dailyPlans||{});
      if(typeof ensureKnownHistory==="function")ensureKnownHistory();
      save();renderAll();toast("Backup completo restaurado");
    }catch(err){alert("Backup inválido")}};
    r.readAsText(f);inp.value="";
  };
})();
