/* Plano de estudo v2.
   - trabalha por subitem atômico do edital;
   - cada data possui seu próprio foco;
   - questões gravam diretamente no mesmo state[topicId] usado por Edital/Dashboard/Revisar;
   - o foco só avança depois de estudo + questões da rodada. */
(() => {
  const PLAN_KEY=KEY+"-daily-plans-v1";
  const GROUP_LESSONS={
    "Ordem Constitucional e Direitos":["pf1","pf2","df1","df2","df21","df25","df26","df27","adm1","adm2"],
    "Governança e Responsabilidades":["gov8","gov9","gov10","gov11","gov12"],
    "Riscos e Controles Essenciais":["risk1","risk2","risk3","risk4"],
    "Integridade Pública":["int1","int2","int3"],
    "Acesso à Informação":["lai1","lai2","lai3","lai4","lai5"],
    "Transparência e Proteção de Dados":["lgpd1","lgpd2","lgpd3","lgpd4"],
    "Conflitos de Interesses e Imparcialidade":["lei9784_5","coi11","coi12"],
    "Planejamento e Recursos":["orc1","orc5","orc9","orc13"]
  };

  function readPlans(){try{return JSON.parse(localStorage.getItem(PLAN_KEY)||"{}")||{}}catch(e){return {}}}
  function writePlans(plans){try{localStorage.setItem(PLAN_KEY,JSON.stringify(plans||{}));}catch(e){};window.dispatchEvent(new CustomEvent("cgu-plan-changed"));}
  window.CGU_readDailyPlans=readPlans;
  window.CGU_writeDailyPlans=writePlans;

  function dateValue(){
    const el=document.getElementById("studyDate");
    if(el?.value)return el.value;
    const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;
  }
  function dateObj(ymd){return new Date(ymd+"T12:00:00");}
  function dayIndex(ymd){return Math.floor((dateObj(ymd)-new Date("2026-10-19T12:00:00"))/86400000);}
  function sameYmd(value,ymd){if(!value)return false;try{const d=new Date(value);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`===ymd;}catch(e){return false}}
  function atomic(x){return window.ATOMIC_META?.[x.id]||{};}
  function title(x){const m=atomic(x);return m.code?`${m.code} · ${m.title}`:(m.title||x.g.nome);}

  function score(x){
    const p={"Crítica":130,"Alta":95,"Média":55,"Baixa":25}[x.priority]||25;
    const e={P3:85,P2:38,P1:12}[x.exam]||0;
    let s=p+e,m=x.m;
    if(!m.q)s+=35;
    else if(m.status==="Revisar"){
      const gap=m.meta-m.liquido;s+=105+Math.min(90,Math.max(0,gap)*2);
    }else{
      if(m.q<15)s+=20;
      if(m.liquido>=m.meta+15)s-=60;
    }
    if(m.s.done&&m.status==="Atendeu")s-=220;
    if(m.s.done&&m.status==="Revisar")s+=25;
    return s;
  }
  function ranked(exclude=[]){
    const ex=new Set(exclude||[]);
    return topicsFlat().filter(x=>!ex.has(x.id) && !(x.m.s.done&&x.m.status==="Atendeu"))
      .map(x=>({...x,_score:score(x)})).sort((a,b)=>b._score-a._score || PRIORITY_RANK[a.priority]-PRIORITY_RANK[b.priority]);
  }
  function chooseForDate(ymd,exclude=[]){
    const list=ranked(exclude);if(!list.length)return null;
    const top=list.slice(0,Math.min(6,list.length));
    const idx=((dayIndex(ymd)%top.length)+top.length)%top.length;
    return top[idx]||top[0];
  }

  function ensurePlan(ymd){
    const plans=readPlans();let p=plans[ymd];
    if(!p||!topicsFlat().some(x=>x.id===p.activeTopicId)){
      const first=chooseForDate(ymd,[]);
      p={activeTopicId:first?.id||null,studied:false,questionRegistered:false,completed:[],updatedAtMs:Date.now()};
      plans[ymd]=p;writePlans(plans);
    }
    const x=topicsFlat().find(r=>r.id===p.activeTopicId);
    if(x){
      // Se o tema já foi concluído globalmente, o bloco de teoria está satisfeito; numa revisão faltam as questões da rodada.
      if(x.m.s.done)p.studied=true;
      if(sameYmd(x.m.s.lastQuestionDate,ymd))p.questionRegistered=true;
    }
    return {plans,p,x};
  }

  function savePlan(ymd,p,plans){p.updatedAtMs=Date.now();plans[ymd]=p;writePlans(plans);try{save();}catch(e){}}

  function allocation(x){
    const m=x.m;
    if(!m.q)return {video:105,questions:60,review:15,label:"cobertura de conteúdo novo"};
    if(m.status==="Revisar"){
      const gap=m.meta-m.liquido;
      if(gap>=20)return {video:60,questions:90,review:30,label:"recuperação intensiva"};
      if(gap>=10)return {video:75,questions:75,review:30,label:"recuperação"};
      return {video:60,questions:90,review:30,label:"ajuste por questões"};
    }
    return {video:90,questions:75,review:15,label:"consolidação"};
  }
  function minQuestions(x){
    const m=x.m;if(!m.q)return 10;
    if(m.status==="Revisar")return (m.meta-m.liquido)>=20?20:15;
    return 15;
  }
  function reason(x){
    const m=x.m;
    if(!m.q)return "Tema ainda sem amostra de questões.";
    if(m.status==="Revisar")return `% líquido ${fmtPct(m.liquido)}, abaixo da meta de ${m.meta}%.`;
    return `Na meta (${fmtPct(m.liquido)}), selecionado para consolidação/cobertura do edital.`;
  }

  function knownLessons(x){
    const ids=GROUP_LESSONS[x.g.nome]||[];
    return ids.map(id=>LESSONS.find(l=>l.id===id)).filter(Boolean).filter(l=>!lessonDone(l.id)).slice(0,2);
  }
  function materialHtml(x,a){
    const custom=String(x.m.s.aula||"").trim();
    if(custom)return `<div class="planner-material"><b>Aula/material informado:</b> ${escapeHtml(custom)}</div>`;
    const known=knownLessons(x);
    if(known.length)return `<div class="planner-material"><b>Aulas disponíveis no Gran relacionadas ao bloco:</b>${known.map(l=>`<div>• ${escapeHtml(l.title)} · ${secLabel(l.sec)}</div>`).join("")}</div>`;
    return `<div class="planner-material"><b>O que procurar no Gran:</b> aula que cubra exatamente <b>${escapeHtml(title(x))}</b>.<div class="small" style="margin-top:4px">Use até ${a.video} min de teoria. Não foi inventado número/título de aula que não esteja cadastrado no projeto.</div></div>`;
  }

  function qid(prefix,id){return `${prefix}-${String(id).replace(/[^a-zA-Z0-9_-]/g,"-")}`;}
  function targetOptions(x){
    return topicsFlat().filter(r=>r.d.id===x.d.id&&r.g.nome===x.g.nome).map(r=>`<option value="${escapeHtml(r.id)}" ${r.id===x.id?"selected":""}>${escapeHtml(title(r))}</option>`).join("");
  }
  function questionBox(x,ymd){
    const min=minQuestions(x),m=x.m,b=Number(m.s.brancos)||0;
    return `<div class="lesson-question-box planner-qbox">
      <div class="lesson-question-head"><div class="lesson-question-title">📝 Questões desta rodada</div><div class="min-question-badge">Mínimo: ${min}</div></div>
      <div class="planner-target"><label>Tema exato das questões</label><select id="${qid("plan-target",x.id)}">${targetOptions(x)}</select><div class="small">O lançamento vai direto para este subitem do Edital e aparece nas demais telas.</div></div>
      <div class="question-cumulative"><div><span>Acumulado</span><b>${m.q}</b></div><div><span>Acertos</span><b>${m.a}</b></div><div><span>Erros</span><b>${m.e}</b></div><div><span>Em branco</span><b>${b}</b></div><div><span>Líquido</span><b>${fmtPct(m.liquido)}</b></div></div>
      <div class="lesson-question-grid">
        <div><label>Total</label><input id="${qid("plan-q",x.id)}" type="number" min="${min}" inputmode="numeric" placeholder="Mín.: ${min}"></div>
        <div><label>Acertos</label><input id="${qid("plan-a",x.id)}" type="number" min="0" inputmode="numeric" placeholder="Ex.: 12"></div>
        <div><label>Em branco</label><input id="${qid("plan-b",x.id)}" type="number" min="0" inputmode="numeric" placeholder="0"></div>
        <button type="button" onclick="CGU_registerPlanQuestions('${x.id}','${ymd}')">Salvar questões</button>
      </div>
    </div>`;
  }

  function advance(ymd,plans,p,currentId){
    const completed=[...(p.completed||[])];
    if(!completed.some(c=>c.topicId===currentId))completed.push({topicId:currentId,at:new Date().toISOString()});
    const next=chooseForDate(ymd,completed.map(c=>c.topicId));
    p.completed=completed;p.activeTopicId=next?.id||null;p.studied=!!next?.m.s.done;p.questionRegistered=false;
    savePlan(ymd,p,plans);
  }

  window.CGU_markPlanStudied=function(topicId,ymd,v){
    const {plans,p,x}=ensurePlan(ymd);if(!x||x.id!==topicId)return;
    p.studied=!!v;
    setTS(topicId,{done:!!v,completedAtMs:v?Date.now():null,completionSource:"study-plan-v2",updatedAtMs:Date.now()});
    savePlan(ymd,p,plans);
    if(v&&p.questionRegistered)advance(ymd,plans,p,topicId);
    renderAll();toast(v?"Tema marcado como estudado.":"Tema reaberto.");
  };

  window.CGU_registerPlanQuestions=function(activeId,ymd){
    const {plans,p,x}=ensurePlan(ymd);if(!x||x.id!==activeId)return;
    const targetId=document.getElementById(qid("plan-target",activeId))?.value||activeId;
    const target=topicsFlat().find(r=>r.id===targetId)||x;
    const min=minQuestions(target);
    const q=Number(document.getElementById(qid("plan-q",activeId))?.value||0),a=Number(document.getElementById(qid("plan-a",activeId))?.value||0),b=Number(document.getElementById(qid("plan-b",activeId))?.value||0);
    if(!Number.isFinite(q)||q<min){alert(`Faça pelo menos ${min} questões para este tema.`);return;}
    if(a<0||b<0||a+b>q){alert("Confira os valores: acertos + em branco não podem ultrapassar o total.");return;}
    const cur=normalizeTopic(target.id),erros=q-a-b;
    setTS(target.id,{questoes:cur.q+q,acertos:cur.a+a,erros:cur.e+erros,brancos:(cur.brancos||0)+b,lastQuestionDate:new Date().toISOString(),updatedAtMs:Date.now(),historico:false,atomicConfirmed:true});
    p.questionRegistered=true;p.lastBatch={topicId:target.id,questoes:q,acertos:a,erros,brancos:b,at:new Date().toISOString()};
    savePlan(ymd,p,plans);
    if(p.studied)advance(ymd,plans,p,activeId);
    renderAll();if(typeof renderPerformancePanel==="function")renderPerformancePanel();
    toast(`${q} questões salvas em ${title(target)}.`);
  };

  function completedHtml(p){
    const rows=(p.completed||[]).map(c=>topicsFlat().find(x=>x.id===c.topicId)).filter(Boolean);
    if(!rows.length)return "";
    return `<div class="planner-completed"><b>Concluídos neste dia</b>${rows.map(x=>`<div>✓ ${escapeHtml(title(x))}</div>`).join("")}</div>`;
  }

  renderToday=function(){
    const host=document.getElementById("todayLessons");if(!host)return;
    const ymd=dateValue(),d=dateObj(ymd),{plans,p,x}=ensurePlan(ymd);
    document.getElementById("todayTitle").textContent=`Plano por tema · ${d.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"2-digit"})}`;
    if(!x){host.innerHTML='<div class="empty">Todos os temas prioritários foram concluídos.</div>';return;}
    const a=allocation(x),am=atomic(x),studied=!!p.studied,qok=!!p.questionRegistered;
    const budget=document.querySelectorAll(".study-budget .budget-item b");if(budget.length>=3){budget[0].textContent=`${a.video} min`;budget[1].textContent=`${a.questions} min`;budget[2].textContent=`${a.review} min`;}

    host.innerHTML=`
      <div class="planner-focus"><div class="small">${escapeHtml(x.d.nome)} → ${escapeHtml(x.g.nome)}</div><h3>🎯 ${escapeHtml(title(x))}</h3><div class="planner-badges"><span class="badge ${priClass(x.priority)}">${x.priority}</span><span class="badge ${examClass(x.exam)}">${x.exam}</span><span class="badge">Prioridade Cebraspe/CGU</span></div></div>
      <div class="lesson-card planner-theme">
        <div class="topic-text">${escapeHtml(x.t)}</div>
        <div class="atomic-reason"><b>Por que estudar:</b> ${escapeHtml(am.reason||reason(x))}</div>
        <div class="small" style="margin:7px 0"><b>Situação:</b> ${escapeHtml(reason(x))}</div>
        ${materialHtml(x,a)}
        <div class="custom-study-actions"><button class="primary" onclick="CGU_markPlanStudied('${x.id}','${ymd}',${!studied})">${studied?"✓ Tema estudado — reabrir":"✓ Marcar tema estudado"}</button></div>
        ${questionBox(x,ymd)}
      </div>
      <div class="focus-lock ${studied&&qok?"ok":""}"><b>Regra de avanço:</b> ${studied?"✓ teoria/tema":"○ concluir tema"} + ${qok?"✓ questões desta rodada":"○ registrar questões"}. Só então o plano libera o próximo tema.</div>
      ${completedHtml(p)}
    `;

    const next=ranked([x.id,...(p.completed||[]).map(c=>c.topicId)]).slice(0,4);
    document.getElementById("todayRoutine").innerHTML=`
      <div class="planner-mode"><b>Modo:</b> ${escapeHtml(a.label)}<br><span class="small">${escapeHtml(reason(x))}</span></div>
      <div class="plan-line"><div class="plan-time">0–${a.video}m</div><div><b>Teoria direcionada</b><div class="plan-kind">${escapeHtml(title(x))}</div></div><b>${a.video} min</b></div>
      <div class="plan-line"><div class="plan-time">${a.video}–${a.video+a.questions}m</div><div><b>Questões Cebraspe</b><div class="plan-kind">somente deste subitem do edital</div></div><b>${a.questions} min</b></div>
      <div class="plan-line"><div class="plan-time">${a.video+a.questions}–180m</div><div><b>Revisão ativa</b><div class="plan-kind">erros, conceitos-chave e resumo</div></div><b>${a.review} min</b></div>
      <div class="planner-next"><b>Próximos candidatos de foco</b>${next.map(n=>`<div>${escapeHtml(title(n))} · ${n.exam} · ${n.priority}</div>`).join("")}</div>`;
    const release=document.getElementById("todayRelease");if(release)release.innerHTML='<div class="small" style="margin-top:12px">Ao trocar a data no calendário, o sistema usa o plano específico daquele dia. Todos os lançamentos continuam na mesma base do Edital, Dashboard e Revisar.</div>';
  };

  const style=document.createElement("style");style.id="plannerV2Style";style.textContent=`
    .planner-focus{border:1px solid #bfdbfe;background:#eff6ff;border-radius:12px;padding:12px;margin-bottom:10px}.planner-focus h3{margin:3px 0 7px;color:#17365D}.planner-badges{display:flex;gap:6px;flex-wrap:wrap}.planner-theme{padding:14px}.planner-material{margin:8px 0;padding:9px 10px;border:1px solid #dbeafe;background:#f8fbff;border-radius:9px;font-size:10px;line-height:1.45;color:#334155}.planner-target{margin:8px 0}.planner-target label{display:block;font-size:9px;text-transform:uppercase;font-weight:900;color:#475569;margin-bottom:4px}.planner-target select{width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:8px;background:#fff;color:#17365D;font-weight:800}.planner-completed{margin-top:10px;padding:10px;border:1px solid #bbf7d0;background:#f0fdf4;border-radius:10px;font-size:10px;color:#166534}.planner-completed>div{margin-top:4px}.planner-mode{padding:9px 10px;border:1px solid #e2e8f0;border-radius:9px;background:#f8fafc;margin-bottom:8px}.planner-next{margin-top:14px;border-top:1px solid #e5e7eb;padding-top:10px;font-size:10px}.planner-next>div{margin-top:5px;color:#475569}
  `;document.head.appendChild(style);

  try{localStorage.removeItem(KEY+"-adaptive-flow-v2");}catch(e){}
  try{renderToday();}catch(e){console.warn("Plano v2:",e);}
})();
