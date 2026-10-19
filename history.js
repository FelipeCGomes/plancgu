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

function seedKnownHistory(){
  const seeds=[
    {
      id:historyTopicId("estado-democracia-direitos-e-ciencia-politica","Ordem Constitucional e Direitos"),
      values:{questoes:20,acertos:14,erros:6,brancos:0,obs:"Histórico até 18/10: Princípios Fundamentais — 20 questões, 14 acertos e 6 erros (40% líquido Cebraspe)."}
    },
    {
      id:historyTopicId("computacao-em-nuvem-virtualizacao-e-automacao","Virtualização e Contêineres"),
      values:{questoes:20,acertos:16,erros:2,brancos:2,obs:"Histórico até 18/10: Virtualização — 20 questões, 16 acertos, 2 erros e 2 em branco (80% bruto e 70% líquido Cebraspe)."}
    }
  ];
  seeds.forEach(({id,values})=>{
    if(!id)return;
    const current=state[id]||{};
    const hasUserData=Number(current.questoes)>0 || Number(current.acertos)>0 || Number(current.erros)>0 || Number(current.brancos)>0;
    if(!hasUserData) state[id]={...current,...values,historico:true};
  });
}

// Permite registrar questões em branco sem tratá-las como erro.
normalizeTopic=function(id){
  const s=getTS(id);
  let q=Math.max(0,Number(s.questoes)||0);
  const a=Math.max(0,Number(s.acertos)||0);
  const b=Math.max(0,Number(s.brancos)||0);
  let e;
  if(s.erros!==undefined && s.erros!==null) e=Math.max(0,Number(s.erros)||0);
  else e=Math.max(q-a-b,0);
  if(!q && (a||e||b))q=a+e+b;
  if(q<a+e+b)q=a+e+b;
  return {...s,acertos:a,questoes:q,erros:e,brancos:b};
};

setQuestion=function(id,field,val){
  const cur=normalizeTopic(id);
  let q=cur.questoes,a=cur.acertos,b=cur.brancos||0;
  if(field==="questoes")q=Math.max(0,Number(val)||0);
  if(field==="acertos")a=Math.max(0,Number(val)||0);
  if(field==="brancos")b=Math.max(0,Number(val)||0);
  if(a+b>q)q=a+b;
  setTS(id,{questoes:q,acertos:a,brancos:b,erros:Math.max(q-a-b,0)});
  save();renderAll();
};

const originalLoad=load;
load=function(){
  originalLoad();
  const marker="cgu3_history_seed_v1";
  if(localStorage.getItem(marker)!=="1"){
    seedKnownHistory();
    localStorage.setItem(marker,"1");
    save();
  }
};

const originalRenderDashboard=renderDashboard;
renderDashboard=function(){
  originalRenderDashboard();
  const block=document.getElementById("blockStats");
  if(block){
    block.insertAdjacentHTML("afterbegin",`
      <div style="border:1px solid #dbeafe;background:#eff6ff;border-radius:11px;padding:12px;margin-bottom:12px">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:7px">
          <b style="color:#17365D">Histórico até ${HISTORY_BASE.ate}</b>
          <span class="badge p1">85 questões</span>
          <span class="badge high">70,6% bruto</span>
        </div>
        <div class="small"><b>${HISTORY_BASE.acertos} acertos</b> · ${HISTORY_BASE.erros} erros · ${HISTORY_BASE.brancos} em branco. Destes, <b>40 já estão vinculados aos tópicos do edital</b>: Princípios Fundamentais e Virtualização. Os outros 45 permanecem como histórico sem tópico informado (${HISTORY_BASE.semTopico.acertos} acertos, ${HISTORY_BASE.semTopico.erros} erros e ${HISTORY_BASE.semTopico.brancos} em branco), para não atribuir questões à matéria errada.</div>
      </div>`);
  }
};
