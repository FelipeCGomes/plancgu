/* Motor adaptativo da tela Aulas do dia.
   Usa desempenho real, peso da prova, prioridade e cobertura para recalcular o foco. */

const ADAPTIVE_LESSON_MAP={
  "Ordem Constitucional e Direitos":["pf1","pf2","df1","df2","df21","df25","df26","df27","adm1","adm2"],
  "Governança e Responsabilidades":["gov8","gov9","gov10","gov11","gov12"],
  "Riscos e Controles Essenciais":["risk1","risk2","risk3","risk4"],
  "Integridade Pública":["int1","int2","int3"],
  "Acesso à Informação":["lai1","lai2","lai3","lai4","lai5"],
  "Transparência e Proteção de Dados":["lgpd1","lgpd2","lgpd3","lgpd4"],
  "Conflitos de Interesses e Imparcialidade":["lei9784_5","coi11","coi12"],
  "Planejamento e Recursos":["orc1","orc5","orc9","orc13"]
};

function adaptivePriorityScore(x){
  const priorityBase={"Crítica":120,"Alta":85,"Média":50,"Baixa":25}[x.priority]||25;
  const examBase={P3:75,P2:35,P1:10}[x.exam]||0;
  const m=x.m;
  let score=priorityBase+examBase;

  if(x.exam==="P3")score+=20; // também alimenta o estudo de caso de 70 pontos
  if(x.exam==="P2")score+=10; // também alimenta a discursiva complementar

  if(!m.q){
    score+=x.priority==="Crítica"?45:x.priority==="Alta"?30:15;
  }else{
    const gap=m.meta-m.liquido;
    if(gap>0){
      score+=100+Math.min(80,gap*2);
    }else{
      if(m.q<15)score+=18; // amostra ainda pequena
      if(m.q>=15 && m.liquido>=m.meta+15)score-=55;
      else if(m.q>=15 && m.liquido>=m.meta)score-=25;
    }
  }

  if(m.status==="Revisar")score+=35;
  if(m.s.done && m.status==="Atendeu")score-=70;
  if(m.s.done && m.status==="Revisar")score+=20;
  return score;
}

function adaptiveRankedTopics(){
  return topicsFlat()
    .map(x=>({...x,adaptiveScore:adaptivePriorityScore(x)}))
    .sort((a,b)=>b.adaptiveScore-a.adaptiveScore || PRIORITY_RANK[a.priority]-PRIORITY_RANK[b.priority]);
}

function adaptiveReason(x){
  const m=x.m;
  if(!m.q)return `Ainda sem amostra de questões; ${x.exam} / ${x.priority.toLowerCase()} prioridade.`;
  const gap=m.meta-m.liquido;
  if(gap>0)return `% líquido ${fmtPct(m.liquido)} — ${gap.toFixed(1).replace('.',',')} p.p. abaixo da meta de ${m.meta}%.`;
  if(m.q<15)return `Meta atingida, mas a amostra ainda é pequena (${m.q} questões).`;
  if(m.liquido>=m.meta+15)return `Desempenho confortável (${fmtPct(m.liquido)}); reduzido na fila para abrir espaço a pontos fracos.`;
  return `Na meta (${fmtPct(m.liquido)}), mas ainda merece consolidação.`;
}

function adaptiveAllocation(main){
  const m=main.m;
  if(m.q && m.status==="Revisar"){
    const gap=m.meta-m.liquido;
    if(gap>=20)return {video:60,questions:90,review:30,label:"recuperação intensiva"};
    if(gap>=10)return {video:75,questions:75,review:30,label:"recuperação"};
    return {video:60,questions:90,review:30,label:"ajuste fino por questões"};
  }
  if(!m.q)return {video:105,questions:60,review:15,label:"cobertura de conteúdo novo"};
  if(m.liquido>=m.meta+15)return {video:75,questions:90,review:15,label:"manutenção e ganho por questões"};
  return {video:90,questions:75,review:15,label:"consolidação"};
}

function adaptiveKnownLesson(x){
  const ids=ADAPTIVE_LESSON_MAP[x.g.nome]||[];
  for(const id of ids){
    const lesson=LESSONS.find(l=>l.id===id);
    if(lesson && !lessonDone(id))return lesson;
  }
  return null;
}

function adaptiveMaterialHtml(x,minutes,rankLabel){
  const known=adaptiveKnownLesson(x);
  if(known){
    return `<div style="margin-bottom:8px"><div class="small"><b>${rankLabel}</b> · ${escapeHtml(adaptiveReason(x))}</div></div>${lessonCardHtml(known)}`;
  }
  const custom=(x.m.s.aula||"").trim();
  const material=custom || `Gran > ${x.d.nome} > ${x.g.nome}`;
  return `<div class="lesson-card">
    <div class="lesson-top">
      <div class="lesson-title">${escapeHtml(material)}</div>
      <span class="badge ${priClass(x.priority)}">${x.priority}</span><span class="badge ${examClass(x.exam)}">${x.exam}</span>
    </div>
    <div class="lesson-meta"><b>${escapeHtml(x.g.nome)}</b> · reservar até ${minutes} min</div>
    <div class="topic-text" style="margin-bottom:0">${escapeHtml(x.t)}</div>
    <div class="small" style="margin-top:8px"><b>Por que entrou hoje:</b> ${escapeHtml(adaptiveReason(x))}</div>
  </div>`;
}

function adaptiveSecondary(ranked,main){
  return ranked.find(x=>x.id!==main.id && (x.m.status==="Revisar" || x.exam!==main.exam || x.priority==="Crítica")) || ranked.find(x=>x.id!==main.id) || null;
}

// Substitui a versão fixa da tela diária por uma versão que recalcula a cada atualização de desempenho.
renderToday=function(){
  const host=document.getElementById("todayLessons"); if(!host)return;
  const dateEl=document.getElementById("studyDate");
  if(dateEl && !dateEl.dataset.init){
    const n=new Date();
    dateEl.value=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;
    dateEl.dataset.init="1";
  }
  const d=studyDateObj();
  const ranked=adaptiveRankedTopics();
  if(!ranked.length){host.innerHTML='<div class="empty">Nenhum tópico disponível.</div>';return;}

  const main=ranked[0];
  const second=adaptiveSecondary(ranked,main);
  const alloc=adaptiveAllocation(main);
  const topReview=ranked.filter(x=>x.m.status==="Revisar").slice(0,3);

  document.getElementById("todayTitle").textContent=`Plano adaptativo · ${d.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"2-digit"})}`;

  let html=`<div style="border:1px solid #bfdbfe;background:#eff6ff;border-radius:12px;padding:12px;margin-bottom:10px">
    <div style="font-weight:900;color:#17365D;margin-bottom:5px">🎯 Foco principal calculado pelo desempenho</div>
    <div class="small">O sistema cruzou peso da prova, prioridade do edital, % líquido, distância da meta, quantidade de questões e tópicos já concluídos.</div>
  </div>`;
  html+=adaptiveMaterialHtml(main,alloc.video,"Foco 1");

  if(second){
    const secondMinutes=Math.min(30,alloc.review);
    html+=`<div style="margin-top:10px"><div class="small"><b>Foco secundário / revisão:</b></div>${adaptiveMaterialHtml(second,secondMinutes,"Foco 2")}</div>`;
  }
  host.innerHTML=html;

  const videoEnd=alloc.video;
  const qEnd=videoEnd+alloc.questions;
  const total=alloc.video+alloc.questions+alloc.review;
  document.getElementById("todayRoutine").innerHTML=`
    <div style="border:1px solid #e5e7eb;border-radius:10px;padding:10px;margin-bottom:10px">
      <div class="small"><b>Modo de hoje:</b> ${escapeHtml(alloc.label)}.</div>
      <div class="small" style="margin-top:4px"><b>Motivo:</b> ${escapeHtml(adaptiveReason(main))}</div>
    </div>
    <div class="plan-line"><div class="plan-time">0–${videoEnd}m</div><div><b>Aula / teoria direcionada</b><div class="plan-kind">${escapeHtml(main.g.nome)}</div></div><b>${alloc.video} min</b></div>
    <div class="plan-line"><div class="plan-time">${videoEnd}–${qEnd}m</div><div><b>Questões Cebraspe</b><div class="plan-kind">mesmo assunto do foco principal; registrar resultado no Edital</div></div><b>${alloc.questions} min</b></div>
    <div class="plan-line"><div class="plan-time">${qEnd}–180m</div><div><b>Revisão ativa</b><div class="plan-kind">erros + foco secundário + resumo dos pontos críticos</div></div><b>${alloc.review} min</b></div>
  `;

  const reviewText=topReview.length
    ?topReview.map((x,i)=>`<div class="small" style="margin-top:5px"><b>${i+1}. ${escapeHtml(x.g.nome)}</b> — ${fmtPct(x.m.liquido)} / meta ${x.m.meta}%</div>`).join("")
    :'<div class="small">Nenhum tópico está abaixo da meta neste momento. O motor está priorizando cobertura e peso da prova.</div>';

  document.getElementById("todayRelease").innerHTML=`
    <div style="margin-top:16px;border-top:1px solid #e5e7eb;padding-top:12px">
      <div class="small"><b>Fila de recuperação atual</b></div>${reviewText}
    </div>
    <div style="margin-top:12px;border:1px solid #dcfce7;background:#f0fdf4;border-radius:10px;padding:10px">
      <div class="small"><b>Atualização automática:</b> ao lançar novas questões/acertos no Edital ou na aba Revisar, esta tela recalcula o plano. Se um tópico sair da meta, ele sobe na fila; se atingir a meta com amostra suficiente, perde prioridade para outro ponto fraco ou conteúdo ainda não coberto.</div>
    </div>`;

  // Atualiza os três cards do orçamento para refletir a distribuição realmente escolhida hoje.
  const budget=document.querySelectorAll("#page-hoje .budget-item b");
  if(budget.length>=3){
    budget[0].textContent=`${alloc.video} min`;
    budget[1].textContent=`${alloc.questions} min`;
    budget[2].textContent=`${alloc.review} min`;
  }
};

// Re-renderiza a tela caso ela já tenha sido desenhada pelo app-ui.js.
try{renderToday();}catch(e){console.warn("Motor adaptativo:",e)}
