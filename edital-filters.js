/* Filtros em cascata do Edital: prova -> matéria -> tópico -> prioridade -> status. */
(() => {
  function getExam(){return document.getElementById('filterExam')?.value||''}
  function getSubject(){return document.getElementById('filterSubject')?.value||''}
  function getTopic(){return document.getElementById('filterTopic')?.value||''}
  function atomicLabel(d,g,t,i){
    const id=tid(d,g,i),m=window.ATOMIC_META?.[id]||{};
    return {id,label:m.code?`${m.code} · ${m.title}`:(m.title||t)};
  }
  function setOptions(select,items,allLabel,current){
    if(!select)return '';
    const valid=new Set(items.map(x=>x.value));
    const keep=valid.has(current)?current:'';
    select.innerHTML=`<option value="">${escapeHtml(allLabel)}</option>`+items.map(x=>`<option value="${escapeHtml(x.value)}" ${x.value===keep?'selected':''}>${escapeHtml(x.label)}</option>`).join('');
    return keep;
  }
  function subjectItems(exam){
    return EDITAL.filter(d=>!exam||d.prova===exam)
      .map(d=>({value:d.id,label:d.nome}))
      .sort((a,b)=>a.label.localeCompare(b.label,'pt-BR'));
  }
  function topicItems(exam,subjectId){
    const rows=[];
    EDITAL.forEach(d=>{
      if(exam&&d.prova!==exam)return;
      if(subjectId&&d.id!==subjectId)return;
      d.grupos.forEach(g=>g.topicos.forEach((t,i)=>{
        const a=atomicLabel(d,g,t,i);
        rows.push({value:a.id,label:subjectId?a.label:`${d.nome} · ${a.label}`});
      }));
    });
    return rows.sort((a,b)=>a.label.localeCompare(b.label,'pt-BR',{numeric:true}));
  }
  function syncOptions(source){
    const exam=getExam(),subject=document.getElementById('filterSubject'),topic=document.getElementById('filterTopic');
    const oldSubject=source==='exam'?'':getSubject();
    const selectedSubject=setOptions(subject,subjectItems(exam),'Todas as matérias',oldSubject);
    const oldTopic=(source==='exam'||source==='subject')?'':getTopic();
    setOptions(topic,topicItems(exam,selectedSubject),'Todos os tópicos',oldTopic);
  }
  function applyDomFilters(){
    const subjectId=getSubject(),topicId=getTopic();
    document.querySelectorAll('#editalList .subject-card').forEach(card=>{
      const id=(card.id||'').replace(/^sub-/,'');
      let subjectVisible=!subjectId||id===subjectId;
      let topicVisible=true;
      if(topicId){
        topicVisible=false;
        card.querySelectorAll('.topic[data-topic-id]').forEach(topic=>{
          const hit=topic.dataset.topicId===topicId;
          topic.hidden=!hit;
          if(hit)topicVisible=true;
        });
      }else{
        card.querySelectorAll('.topic[data-topic-id]').forEach(topic=>topic.hidden=false);
      }
      card.hidden=!(subjectVisible&&topicVisible);
    });
    const any=[...document.querySelectorAll('#editalList .subject-card')].some(x=>!x.hidden);
    const existing=document.getElementById('editalFilterEmpty');
    if(!any&&document.querySelector('#editalList .subject-card')){
      if(!existing){
        const el=document.createElement('div');el.id='editalFilterEmpty';el.className='empty';el.textContent='Nenhum conteúdo com esses filtros.';document.getElementById('editalList')?.appendChild(el);
      }
    }else existing?.remove();
  }

  window.CGU_syncEditalFilters=function(source){syncOptions(source);renderEdital();};
  window.CGU_editalSubjectChanged=function(){syncOptions('subject');renderEdital();};
  window.CGU_editalTopicChanged=function(){renderEdital();};

  const baseRender=renderEdital;
  renderEdital=function(){
    syncOptions('render');
    const r=baseRender.apply(this,arguments);
    applyDomFilters();
    return r;
  };

  try{syncOptions('init');renderEdital();}catch(e){console.warn('Filtros do Edital:',e)}
})();
