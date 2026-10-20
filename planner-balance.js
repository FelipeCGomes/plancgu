/* Plano adaptativo balanceado v3.
   Objetivo: evitar que um único assunto (ex.: Redes) monopolize o calendário.
   Mantém adaptação por desempenho, mas distribui o estudo entre P1, P2 e P3 e entre matérias.
*/
(() => {
  const PLAN_KEY = KEY + "-daily-plans-v1";
  const VERSION = 3;
  const START = "2026-10-19";
  // Distribuição semanal aproximada: P3 4/7, P2 2/7, P1 1/7.
  const EXAM_ROTATION = ["P3","P2","P3","P1","P3","P2","P3"];
  const GROUP_LESSONS = {
    "Ordem Constitucional e Direitos":["pf1","pf2","df1","df2","df21","df25","df26","df27","adm1","adm2"],
    "Governança e Responsabilidades":["gov8","gov9","gov10","gov11","gov12"],
    "Riscos e Controles Essenciais":["risk1","risk2","risk3","risk4"],
    "Integridade Pública":["int1","int2","int3"],
    "Acesso à Informação":["lai1","lai2","lai3","lai4","lai5"],
    "Transparência e Proteção de Dados":["lgpd1","lgpd2","lgpd3","lgpd4"],
    "Conflitos de Interesses e Imparcialidade":["lei9784_5","coi11","coi12"],
    "Planejamento e Recursos":["orc1","orc5","orc9","orc13"]
  };

  function readPlans(){ try{return JSON.parse(localStorage.getItem(PLAN_KEY)||"{}")||{}}catch(e){return {}} }
  function writePlans(v){
    try{localStorage.setItem(PLAN_KEY,JSON.stringify(v||{}));}catch(e){}
    window.dispatchEvent(new CustomEvent("cgu-plan-changed"));
  }
  window.CGU_readDailyPlans = readPlans;
  window.CGU_writeDailyPlans = writePlans;

  function ymdToday(){const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;}
  function selectedDate(){return document.getElementById("studyDate")?.value || ymdToday();}
  function dateObj(ymd){return new Date(ymd+"T12:00:00");}
  function dayIndex(ymd){return Math.floor((dateObj(ymd)-dateObj(START))/86400000);}
  function addDays(ymd,n){const d=dateObj(ymd);d.setDate(d.getDate()+n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
  function atomic(x){return window.ATOMIC_META?.[x.id]||{};}
  function topicTitle(x){const m=atomic(x);return m.code?`${m.code} · ${m.title}`:(m.title||x.g.nome);}
  function sameYmd(value,ymd){if(!value)return false;const d=new Date(value);if(isNaN(d))return false;return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`===ymd;}

  function needScore(x){
    let s=({"Crítica":130,"Alta":95,"Média":55,"Baixa":25}[x.priority]||25)+({P3:80,P2:38,P1:15}[x.exam]||0);
    const m=x.m;
    if(!m.q)s+=42;
    else if(m.status==="Revisar"){
      const gap=Math.max(0,m.meta-m.liquido);s+=95+Math.min(85,gap*2.2);
    }else{
      if(m.q<15)s+=18;
      if(m.liquido>=m.meta+15)s-=55;
    }
    if(m.s.done&&m.status==="Atendeu")s-=240;
    if(m.s.done&&m.status==="Revisar")s+=15;
    return s;
  }

  function eligible(exam,exclude=[]){
    const ex=new Set(exclude||[]);
    return topicsFlat().filter(x=>(!exam||x.exam===exam)&&!ex.has(x.id)&&!(x.m.s.done&&x.m.status==="Atendeu"));
  }

  function laneForDate(ymd){
    const idx=((dayIndex(ymd)%7)+7)%7;
    return EXAM_ROTATION[idx];
  }
  function laneOccurrence(ymd,lane){
    const idx=((dayIndex(ymd)%7)+7)%7;
    let n=0;for(let i=0;i<=idx;i++)if(EXAM_ROTATION[i]===lane)n++;
    return n-1;
  }

  function subjectRows(lane,exclude=[]){
    const rows=eligible(lane,exclude);
    const map=new Map();
    rows.forEach(x=>{
      if(!map.has(x.d.id))map.set(x.d.id,[]);
      map.get(x.d.id).push(x);
    });
    return [...map.entries()].map(([subjectId,items])=>{
      const sorted=items.map(x=>({...x,_need:needScore(x)})).sort((a,b)=>b._need-a._need);
      const unseen=items.filter(x=>!x.m.q).length/items.length;
      const review=items.filter(x=>x.m.status==="Revisar").length/items.length;
      return {subjectId,subject:items[0].d,items,sorted,score:sorted[0]._need+(unseen*18)+(review*22)};
    }).sort((a,b)=>b.score-a.score);
  }

  function priorSubject(ymd){
    const plans=readPlans();
    for(let back=1;back<=3;back++){
      const p=plans[addDays(ymd,-back)];
      const x=p?.activeTopicId?topicsFlat().find(r=>r.id===p.activeTopicId):null;
      if(x)return x.d.id;
      const last=(p?.completed||[]).slice(-1)[0];
      const y=last?topicsFlat().find(r=>r.id===last.topicId):null;
      if(y)return y.d.id;
    }
    return null;
  }

  function chooseForDate(ymd,exclude=[],avoidSubject=null){
    let lane=laneForDate(ymd);
    let subjects=subjectRows(lane,exclude);
    if(!subjects.length){
      // Fallback apenas se o bloco do dia estiver totalmente satisfeito.
      const all=eligible(null,exclude).map(x=>({...x,_need:needScore(x)})).sort((a,b)=>b._need-a._need);
      return all[0]||null;
    }

    const week=Math.floor(Math.max(0,dayIndex(ymd))/7);
    const occ=laneOccurrence(ymd,lane);
    const slots=EXAM_ROTATION.filter(x=>x===lane).length;
    let pos=(week*slots+occ)%subjects.length;

    const previous=avoidSubject||priorSubject(ymd);
    if(subjects.length>1 && subjects[pos].subjectId===previous)pos=(pos+1)%subjects.length;
    const chosenSubject=subjects[pos];
    return chosenSubject.sorted[0]||null;
  }

  function shouldRegenerate(ymd,p){
    if(!p)return true;
    if(Number(p.plannerVersion)!==VERSION)return true;
    if(!topicsFlat().some(x=>x.id===p.activeTopicId))return true;
    // Datas futuras ainda não iniciadas são sempre recalculadas com o estado atual.
    if(ymd>ymdToday() && !(p.completed||[]).length && !p.questionRegistered && !p.userTouched)return true;
    return false;
  }

  function ensurePlan(ymd){
    const plans=readPlans();let p=plans[ymd];
    if(shouldRegenerate(ymd,p)){
      const x=chooseForDate(ymd,[]);
      p={plannerVersion:VERSION,activeTopicId:x?.id||null,examLane:laneForDate(ymd),subjectId:x?.d.id||null,studied:false,questionRegistered:false,completed:[],userTouched:false,generatedAtMs:Date.now(),updatedAtMs:Date.now()};
      plans[ymd]=p;writePlans(plans);
    }
    let x=topicsFlat().find(r=>r.id===p.activeTopicId)||null;
    if(x){
      // Alterações feitas no Edital também alimentam o plano.
      if(x.m.s.done)p.studied=true;
      if(sameYmd(x.m.s.lastQuestionDate,ymd))p.questionRegistered=true;
      if(p.studied&&p.questionRegistered){
        const completed=[...(p.completed||[])];
        if(!completed.some(c=>c.topicId===x.id))completed.push({topicId:x.id,at:new Date().toISOString(),source:"state-sync"});
        const next=chooseForDate(ymd,completed.map(c=>c.topicId),x.d.id);
        p={...p,completed,activeTopicId:next?.id||null,subjectId:next?.d.id||null,studied:!!next?.m.s.done,questionRegistered:false,updatedAtMs:Date.now()};
        plans[ymd]=p;writePlans(plans);x=next;
      }
    }
    return {plans,p,x};
  }

  function savePlan(ymd,p,plans){p.plannerVersion=VERSION;p.updatedAtMs=Date.now();plans[ymd]=p;writePlans(plans);try{save();}catch(e){}}
  function allocation(x){
    const m=x.m;
    if(!m.q)return {video:105,questions:60,review:15,label:"cobertura de tema novo"};
    if(m.status==="Revisar"){
      const gap=m.meta-m.liquido;
      if(gap>=20)return {video:60,questions:90,review:30,label:"recuperação intensiva"};
      if(gap>=10)return {video:75,questions:75,review:30,label:"recuperação"};
      return {video:60,questions:90,review:30,label:"reforço por questões"};
    }
    return {video:90,questions:75,review:15,label:"consolidação"};
  }
  function minQuestions(x){if(!x.m.q)return 10;if(x.m.status==="Revisar")return (x.m.meta-x.m.liquido)>=20?20:15;return 15;}
  function situation(x){if(!x.m.q)return "Sem amostra de questões neste subitem.";if(x.m.status==="Revisar")return `${fmtPct(x.m.liquido)} líquido, abaixo da meta de ${x.m.meta}%.`;return `${fmtPct(x.m.liquido)} líquido, na meta; manter cobertura sem monopolizar o plano.`;}

  function qid(prefix,id){return `${prefix}-${String(id).replace(/[^a-zA-Z0-9_-]/g,"-")}`;}
  function targetOptions(x){return topicsFlat().filter(r=>r.d.id===x.d.id&&r.g.nome===x.g.nome).map(r=>`<option value="${escapeHtml(r.id)}" ${r.id===x.id?"selected":""}>${escapeHtml(topicTitle(r))}</option>`).join("");}
  function materialHtml(x,a){
    const custom=String(x.m.s.aula||"").trim();if(custom)return `<div class="planner-material"><b>Aula/material:</b> ${escapeHtml(custom)}</div>`;
    const ids=GROUP_LESSONS[x.g.nome]||[];
    const known=ids.map(id=>LESSONS.find(l=>l.id===id)).filter(Boolean).filter(l=>!lessonDone(l.id)).slice(0,2);
    if(known.length)return `<div class="planner-material"><b>Aulas Gran relacionadas:</b>${known.map(l=>`<div>• ${escapeHtml(l.title)} · ${secLabel(l.sec)}</div>`).join("")}</div>`;
    return `<div class="planner-material"><b>O que procurar no Gran:</b> uma aula que cubra exatamente <b>${escapeHtml(topicTitle(x))}</b>.<div class="small">Reserve até ${a.video} min de teoria.</div></div>`;
  }
  function questionBox(x,ymd){
    const min=minQuestions(x),m=x.m,b=Number(m.s.brancos)||0;
    return `<div class="lesson-question-box planner-qbox">
      <div class="lesson-question-head"><div class="lesson-question-title">📝 Questões deste tema</div><div class="min-question-badge">Mínimo: ${min}</div></div>
      <div class="planner-target"><label>Subitem exato das questões</label><select id="${qid("bal-target",x.id)}">${targetOptions(x)}</select><div class="small">O lançamento usa a mesma base do Edital, Dashboard e Revisar.</div></div>
      <div class="question-cumulative"><div><span>Acumulado</span><b>${m.q}</b></div><div><span>Acertos</span><b>${m.a}</b></div><div><span>Erros</span><b>${m.e}</b></div><div><span>Em branco</span><b>${b}</b></div><div><span>Líquido</span><b>${fmtPct(m.liquido)}</b></div></div>
      <div class="lesson-question-grid"><div><label>Total</label><input id="${qid("bal-q",x.id)}" type="number" min="${min}" placeholder="Mín.: ${min}"></div><div><label>Acertos</label><input id="${qid("bal-a",x.id)}" type="number" min="0" placeholder="Ex.: 12"></div><div><label>Em branco</label><input id="${qid("bal-b",x.id)}" type="number" min="0" value="0"></div><button type="button" onclick="CGU_registerPlanQuestions('${x.id}','${ymd}')">Salvar questões</button></div>
    </div>`;
  }

  function advance(ymd,plans,p,current){
    const completed=[...(p.completed||[])];if(!completed.some(c=>c.topicId===current.id))completed.push({topicId:current.id,at:new Date().toISOString()});
    const next=chooseForDate(ymd,completed.map(c=>c.topicId),current.d.id);
    p={...p,completed,activeTopicId:next?.id||null,subjectId:next?.d.id||null,studied:!!next?.m.s.done,questionRegistered:false,userTouched:true};
    savePlan(ymd,p,plans);
  }

  window.CGU_markPlanStudied=function(topicId,ymd,v){
    const {plans,p,x}=ensurePlan(ymd);if(!x||x.id!==topicId)return;
    p.studied=!!v;p.userTouched=true;
    setTS(topicId,{done:!!v,completedAtMs:v?Date.now():null,completionSource:"planner-balance-v3",updatedAtMs:Date.now()});
    savePlan(ymd,p,plans);
    if(v&&p.questionRegistered)advance(ymd,plans,p,x);
    renderAll();toast(v?"Tema marcado como estudado.":"Tema reaberto.");
  };

  window.CGU_registerPlanQuestions=function(activeId,ymd){
    const {plans,p,x}=ensurePlan(ymd);if(!x||x.id!==activeId)return;
    const targetId=document.getElementById(qid("bal-target",activeId))?.value||activeId;
    const target=topicsFlat().find(r=>r.id===targetId)||x,min=minQuestions(target);
    const q=Number(document.getElementById(qid("bal-q",activeId))?.value||0),a=Number(document.getElementById(qid("bal-a",activeId))?.value||0),b=Number(document.getElementById(qid("bal-b",activeId))?.value||0);
    if(!Number.isFinite(q)||q<min){alert(`Faça pelo menos ${min} questões para este subitem.`);return;}
    if(a<0||b<0||a+b>q){alert("Confira os valores: acertos + em branco não podem ultrapassar o total.");return;}
    const cur=normalizeTopic(target.id),erros=q-a-b;
    setTS(target.id,{questoes:cur.q+q,acertos:cur.a+a,erros:cur.e+erros,brancos:(cur.brancos||0)+b,lastQuestionDate:new Date().toISOString(),updatedAtMs:Date.now(),historico:false,atomicConfirmed:true});
    p.questionRegistered=true;p.userTouched=true;p.lastBatch={topicId:target.id,questoes:q,acertos:a,erros,brancos:b,at:new Date().toISOString()};
    savePlan(ymd,p,plans);
    if(p.studied)advance(ymd,plans,p,x);
    renderAll();if(typeof renderPerformancePanel==="function")renderPerformancePanel();toast(`${q} questões salvas em ${topicTitle(target)}.`);
  };

  function weeklyPreview(ymd){
    const rows=[];
    for(let i=0;i<7;i++){
      const d=addDays(ymd,i),x=chooseForDate(d,[]);
      rows.push(`<div class="planner-preview-row"><span>${dateObj(d).toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"2-digit"})}</span><b>${laneForDate(d)}</b><span>${x?escapeHtml(x.d.nome):"—"}</span></div>`);
    }
    return `<div class="planner-week"><b>Rotação dos próximos 7 dias</b>${rows.join("")}</div>`;
  }

  renderToday=function(){
    const host=document.getElementById("todayLessons");if(!host)return;
    const ymd=selectedDate(),d=dateObj(ymd),{p,x}=ensurePlan(ymd);
    document.getElementById("todayTitle").textContent=`Plano adaptativo balanceado · ${d.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"2-digit"})}`;
    if(!x){host.innerHTML='<div class="empty">Todos os temas elegíveis foram concluídos.</div>';return;}
    const a=allocation(x),am=atomic(x),studied=!!p.studied,qok=!!p.questionRegistered;
    const budget=document.querySelectorAll(".study-budget .budget-item b");if(budget.length>=3){budget[0].textContent=`${a.video} min`;budget[1].textContent=`${a.questions} min`;budget[2].textContent=`${a.review} min`;}
    host.innerHTML=`<div class="planner-focus"><div class="small">Faixa do dia: <b>${laneForDate(ymd)}</b> · ${escapeHtml(x.d.nome)} → ${escapeHtml(x.g.nome)}</div><h3>🎯 ${escapeHtml(topicTitle(x))}</h3><div class="planner-badges"><span class="badge ${priClass(x.priority)}">${x.priority}</span><span class="badge ${examClass(x.exam)}">${x.exam}</span><span class="badge">Cebraspe/CGU</span></div></div><div class="lesson-card planner-theme"><div class="topic-text">${escapeHtml(x.t)}</div><div class="atomic-reason"><b>Por que entrou hoje:</b> ${escapeHtml(am.reason||"")} ${escapeHtml(situation(x))}</div>${materialHtml(x,a)}<div class="custom-study-actions"><button class="primary" onclick="CGU_markPlanStudied('${x.id}','${ymd}',${!studied})">${studied?"✓ Tema estudado — reabrir":"✓ Marcar tema estudado"}</button></div>${questionBox(x,ymd)}</div><div class="focus-lock ${studied&&qok?"ok":""}"><b>Regra de avanço:</b> ${studied?"✓ estudo":"○ estudar"} + ${qok?"✓ questões":"○ registrar questões"}. Depois o sistema escolhe outro tema, preferindo outra matéria dentro da faixa do dia.</div>`;
    document.getElementById("todayRoutine").innerHTML=`<div class="plan-line"><div class="plan-time">0–${a.video}m</div><div><b>Teoria direcionada</b><div class="plan-kind">${escapeHtml(topicTitle(x))}</div></div><b>${a.video} min</b></div><div class="plan-line"><div class="plan-time">${a.video}–${a.video+a.questions}m</div><div><b>Questões Cebraspe</b><div class="plan-kind">mesmo subitem do edital</div></div><b>${a.questions} min</b></div><div class="plan-line"><div class="plan-time">${a.video+a.questions}–180m</div><div><b>Revisão ativa</b><div class="plan-kind">erros, resumo e pontos-chave</div></div><b>${a.review} min</b></div>`;
    document.getElementById("todayRelease").innerHTML=`<div class="small"><b>Lógica:</b> a data define uma faixa P1/P2/P3; dentro dela, o sistema combina prioridade, lacuna de desempenho e cobertura, mas evita repetir a mesma matéria quando há alternativas.</div>${weeklyPreview(ymd)}`;
  };

  const style=document.createElement("style");style.id="plannerBalanceStyle";style.textContent=`.planner-week{margin-top:12px;border-top:1px solid #e2e8f0;padding-top:10px}.planner-preview-row{display:grid;grid-template-columns:105px 35px 1fr;gap:8px;padding:5px 0;border-bottom:1px solid #f1f5f9;font-size:9px}.planner-preview-row b{color:#17365D}.planner-preview-row span:last-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}`;document.head.appendChild(style);

  // Planos futuros antigos sem interação não devem permanecer presos ao algoritmo anterior.
  const plans=readPlans(),today=ymdToday();let changed=false;
  Object.keys(plans).forEach(d=>{const p=plans[d];if(d>today&&Number(p?.plannerVersion)!==VERSION&&!(p?.completed||[]).length&&!p?.questionRegistered){delete plans[d];changed=true;}});
  if(changed)writePlans(plans);
  try{renderToday();}catch(e){console.warn("Plano balanceado:",e);}
})();
