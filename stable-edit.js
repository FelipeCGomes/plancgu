/* Edição estável do Edital por Prioridade.
   Evita renderizar a página inteira a cada campo alterado.
   O estado continua sendo salvo/sincronizado imediatamente, mas a posição,
   o foco e o card aberto permanecem onde o usuário está trabalhando. */
(() => {
  function editalAtivo(){
    return !!document.getElementById("page-edital")?.classList.contains("active");
  }

  function rowById(id){
    return typeof topicsFlat==="function" ? topicsFlat().find(x=>x.id===id) : null;
  }

  function fieldByLabel(host,label){
    return [...(host?.querySelectorAll(".field")||[])].find(f=>
      (f.querySelector("label")?.textContent||"").trim().toLowerCase()===label.toLowerCase()
    );
  }

  function setMetric(host,label,text,cls){
    const f=fieldByLabel(host,label); if(!f)return;
    const m=f.querySelector(".metric"); if(!m)return;
    m.textContent=text;
    if(cls!==undefined){
      m.classList.remove("status-ok","status-review","status-pending");
      if(cls)m.classList.add(cls);
    }
  }

  function updateSubjectHeader(x){
    const card=document.getElementById("sub-"+x.d.id); if(!card)return;
    const s=subjectStats(x.d);
    const vals=card.querySelectorAll(".subject-stats span b");
    if(vals[0])vals[0].textContent=`${s.done}/${s.total}`;
    if(vals[1])vals[1].textContent=String(s.q);
    if(vals[2])vals[2].textContent=fmtPct(s.liquido);
  }

  function updateTopicLocal(id){
    const x=rowById(id); if(!x)return;
    const host=document.querySelector(`.topic[data-topic-id="${CSS.escape(id)}"]`); if(!host)return;
    const m=x.m,s=m.s;

    setMetric(host,"Erros",String(m.e));
    setMetric(host,"% bruto",fmtPct(m.bruto));
    setMetric(host,"% líquido",fmtPct(m.liquido));
    setMetric(host,"Meta / status",`${m.meta}% · ${m.status}`,statusClass(m.status));

    const done=host.querySelector('.done-wrap input[type="checkbox"]');
    if(done)done.checked=!!s.done;

    const badges=host.querySelectorAll(".topic-top .badge");
    if(badges[0]){
      badges[0].textContent=x.priority;
      badges[0].className=`badge ${priClass(x.priority)}`;
    }

    let last=host.querySelector(".topic-last");
    const ms=Number(s.updatedAtMs)||0;
    if(ms){
      const txt="Última atualização: "+new Date(ms).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
      if(last)last.textContent=txt;
      else{
        last=document.createElement("div");
        last.className="topic-last"; last.textContent=txt;
        const notes=host.querySelector(".note-row");
        if(notes)host.insertBefore(last,notes); else host.appendChild(last);
      }
    }
    updateSubjectHeader(x);
  }

  function saveStable(){
    try{save();}catch(e){console.warn("Falha ao salvar edição:",e);}
  }

  const baseSetQuestion=setQuestion;
  setQuestion=function(id,field,val){
    if(!editalAtivo())return baseSetQuestion(id,field,val);
    const cur=normalizeTopic(id);
    let q=cur.questoes,a=cur.acertos,b=Number(cur.brancos)||0;
    if(field==="questoes")q=Math.max(0,Number(val)||0);
    if(field==="acertos")a=Math.max(0,Number(val)||0);
    if(field==="brancos")b=Math.max(0,Number(val)||0);
    if(a+b>q)q=a+b;
    setTS(id,{questoes:q,acertos:a,brancos:b,erros:Math.max(q-a-b,0),updatedAtMs:Date.now(),atomicConfirmed:true});
    saveStable();
    updateTopicLocal(id);
  };

  const basePriority=setPriority;
  setPriority=function(id,val){
    if(!editalAtivo())return basePriority(id,val);
    setTS(id,{prioridade:val,updatedAtMs:Date.now()});
    saveStable();
    updateTopicLocal(id);
  };

  const baseDone=markDone;
  markDone=function(id,v){
    if(!editalAtivo())return baseDone(id,v);
    setTS(id,{done:!!v,completedAtMs:v?Date.now():null,completionSource:"edital",updatedAtMs:Date.now()});
    saveStable();
    updateTopicLocal(id);
  };

  const baseText=setText;
  setText=function(id,k,v){
    if(!editalAtivo())return baseText(id,k,v);
    setTS(id,{[k]:v,updatedAtMs:Date.now()});
    saveStable();
    updateTopicLocal(id);
  };

  // Ao sair do Edital, atualiza a tela de destino com os dados já salvos,
  // sem interromper a digitação enquanto o usuário está no formulário.
  const baseSwitch=switchPage;
  switchPage=function(name,btn){
    const wasEdital=editalAtivo();
    const result=baseSwitch(name,btn);
    if(wasEdital && name!=="edital"){
      try{
        if(name==="dashboard")renderDashboard();
        else if(name==="revisar")renderReview();
        else if(name==="hoje")renderToday();
        if(typeof renderPerformancePanel==="function"&&name==="dashboard")renderPerformancePanel();
      }catch(e){console.warn("Atualização ao sair do Edital:",e);}
    }
    return result;
  };

  // Se algum módulo externo precisar redesenhar o Edital, preserva a rolagem.
  const baseRenderEdital=renderEdital;
  renderEdital=function(){
    const y=window.scrollY;
    const active=document.activeElement;
    const editing=editalAtivo() && active && active.closest?.("#page-edital .topic");
    if(editing)return; // não destrói o formulário enquanto existe edição ativa
    const r=baseRenderEdital();
    requestAnimationFrame(()=>window.scrollTo({top:y,left:0,behavior:"instant"}));
    return r;
  };
})();
