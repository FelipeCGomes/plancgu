const HISTORY_BASE={
  ate:"18/10/2026",
  questoes:85,
  acertos:60,
  erros:21,
  brancos:4,
  bruto:70.6,
  mapeadas:40,
  semTopico:{questoes:45,acertos:30,erros:13,brancos:2}
};

function historyTopicId(subjectId,groupName){
  const d=EDITAL.find(x=>x.id===subjectId);
  if(!d)return null;
  const g=d.grupos.find(x=>x.nome===groupName);
  if(!g)return null;
  return tid(d,g,0);
}
function hasQuestionData(v){return Number(v?.questoes)>0||Number(v?.acertos)>0||Number(v?.erros)>0||Number(v?.brancos)>0;}
function isLegacyDemocracySeed(v){
  if(!v)return false;
  const exact=Number(v.questoes)===20&&Number(v.acertos)===14&&Number(v.erros)===6&&Number(v.brancos||0)===0;
  const tagged=!!v.historico||String(v.obs||"").includes("Histórico até 18/10")||String(v.obs||"").includes("Princípios Fundamentais");
  return exact&&tagged;
}
function migrateLegacyHistory(){
  const subject="estado-democracia-direitos-e-ciencia-politica";
  const oldId=historyTopicId(subject,"Ordem Constitucional e Direitos"),newId=historyTopicId(subject,"Democracia e Representação");
  if(!oldId||!newId)return false;
  const old=state[oldId]||{},dest=state[newId]||{};
  if(!isLegacyDemocracySeed(old))return false;
  const now=Date.now();
  if(!hasQuestionData(dest))state[newId]={...dest,questoes:20,acertos:14,erros:6,brancos:0,obs:"Histórico até 18/10: Democracia e Representação — 20 questões, 14 acertos e 6 erros (40% líquido Cebraspe).",historico:true,updatedAtMs:now};
  const cleaned={...old,questoes:0,acertos:0,erros:0,brancos:0,updatedAtMs:now};
  if(cleaned.historico)delete cleaned.historico;
  if(String(cleaned.obs||"").includes("Histórico até 18/10")||String(cleaned.obs||"").includes("Princípios Fundamentais"))cleaned.obs="";
  state[oldId]=cleaned;return true;
}
function ensureKnownHistory(){
  let changed=migrateLegacyHistory();
  const seeds=[
    {id:historyTopicId("estado-democracia-direitos-e-ciencia-politica","Democracia e Representação"),values:{questoes:20,acertos:14,erros:6,brancos:0,obs:"Histórico até 18/10: Democracia e Representação — 20 questões, 14 acertos e 6 erros (40% líquido Cebraspe).",historico:true}},
    {id:historyTopicId("computacao-em-nuvem-virtualizacao-e-automacao","Virtualização e Contêineres"),values:{questoes:20,acertos:16,erros:2,brancos:2,obs:"Histórico legado do grupo Virtualização e Contêineres — 20 questões, 16 acertos, 2 erros e 2 em branco. Com a verticalização atômica, revise se o lançamento pertence ao primeiro subitem.",historico:true}}
  ];
  seeds.forEach(({id,values})=>{if(!id)return;const current=state[id]||{};if(!hasQuestionData(current)){state[id]={...current,...values,updatedAtMs:Number(current.updatedAtMs)||Date.now()};changed=true;}});
  return changed;
}

normalizeTopic=function(id){
  const s=getTS(id);let q=Math.max(0,Number(s.questoes)||0);const a=Math.max(0,Number(s.acertos)||0),b=Math.max(0,Number(s.brancos)||0);let e;
  if(s.erros!==undefined&&s.erros!==null)e=Math.max(0,Number(s.erros)||0);else e=Math.max(q-a-b,0);
  if(!q&&(a||e||b))q=a+e+b;if(q<a+e+b)q=a+e+b;
  return {...s,acertos:a,questoes:q,erros:e,brancos:b};
};
setQuestion=function(id,field,val){
  const cur=normalizeTopic(id);let q=cur.questoes,a=cur.acertos,b=cur.brancos||0;
  if(field==="questoes")q=Math.max(0,Number(val)||0);if(field==="acertos")a=Math.max(0,Number(val)||0);if(field==="brancos")b=Math.max(0,Number(val)||0);
  if(a+b>q)q=a+b;
  setTS(id,{questoes:q,acertos:a,brancos:b,erros:Math.max(q-a-b,0),lastQuestionDate:new Date().toISOString(),updatedAtMs:Date.now(),atomicConfirmed:true});
  save();renderAll();if(typeof renderPerformancePanel==="function")renderPerformancePanel();
};

function knownOverallStats(){
  const rows=topicsFlat();
  const mapped={questoes:rows.reduce((s,x)=>s+x.m.q,0),acertos:rows.reduce((s,x)=>s+x.m.a,0),erros:rows.reduce((s,x)=>s+x.m.e,0),brancos:rows.reduce((s,x)=>s+(Number(x.m.s.brancos)||0),0)};
  return {mapped,total:{questoes:HISTORY_BASE.semTopico.questoes+mapped.questoes,acertos:HISTORY_BASE.semTopico.acertos+mapped.acertos,erros:HISTORY_BASE.semTopico.erros+mapped.erros,brancos:HISTORY_BASE.semTopico.brancos+mapped.brancos}};
}

const originalLoad=load;
load=function(){
  originalLoad();const changed=ensureKnownHistory();
  if(changed){try{localStorage.setItem(KEY,JSON.stringify({version:8,state,settings,lessonState}));}catch(e){}}
};
const originalRenderDashboard=renderDashboard;
renderDashboard=function(){
  originalRenderDashboard();const block=document.getElementById("blockStats");
  if(block){
    const old=document.getElementById("historySnapshot");if(old)old.remove();
    const stats=knownOverallStats(),gross=stats.total.questoes?100*stats.total.acertos/stats.total.questoes:null;
    block.insertAdjacentHTML("afterbegin",`<div id="historySnapshot" style="border:1px solid #dbeafe;background:#eff6ff;border-radius:11px;padding:12px;margin-bottom:12px"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:7px"><b style="color:#17365D">Base histórica + lançamentos atuais</b><span class="badge p1">${stats.total.questoes} questões conhecidas</span><span class="badge high">${fmtPct(gross)} bruto geral</span></div><div class="small"><b>${stats.total.acertos} acertos</b> · ${stats.total.erros} erros · ${stats.total.brancos} em branco. No edital, <b>${stats.mapped.questoes} questões estão vinculadas a temas específicos</b>. Outras ${HISTORY_BASE.semTopico.questoes} permanecem apenas no histórico geral.</div></div>`);
  }
};
