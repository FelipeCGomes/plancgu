/* Cronograma oficial do Edital CGU 2026.
   Fonte: Edital nº 1 – CGU – AFFC, de 8/10/2026, Anexo I.
   Datas previstas e sujeitas a alteração por edital posterior.
*/
(() => {
  const EVENTS=[
    {start:"2026-10-08",end:"2026-10-08",title:"Publicação do Edital nº 1 – CGU – AFFC",kind:"edital",detail:"Edital de abertura do concurso."},
    {start:"2026-10-10",end:"2026-10-16",title:"Inscrição com solicitação de isenção",kind:"inscricao",detail:"Das 10h do primeiro dia às 18h do último dia (Brasília)."},
    {start:"2026-10-10",end:"2026-11-04",title:"Período de inscrições",kind:"inscricao",detail:"Das 10h de 10/10 às 18h de 04/11/2026 (Brasília)."},
    {start:"2026-10-16",end:"2026-10-18",title:"Consulta provisória de atendimento especializado",kind:"atendimento",detail:"Consulta prevista no cronograma oficial."},
    {start:"2026-10-17",end:"2026-10-18",title:"Recursos – atendimento especializado",kind:"recurso",detail:"Prazo de recurso contra indeferimento."},
    {start:"2026-10-26",end:"2026-10-28",title:"Consulta provisória da isenção",kind:"isencao",detail:"Das 10h do primeiro dia às 18h do último dia."},
    {start:"2026-10-27",end:"2026-10-28",title:"Recursos – isenção",kind:"recurso",detail:"Prazo de recurso contra indeferimento da isenção."},
    {start:"2026-11-04",end:"2026-11-04",title:"Último dia de inscrição + resultado final da isenção",kind:"deadline",detail:"Inscrições encerram às 18h. Consulta final da isenção na mesma data."},
    {start:"2026-11-05",end:"2026-11-06",title:"Verificação da foto / novo envio",kind:"foto",detail:"Das 10h do primeiro dia às 18h do último dia."},
    {start:"2026-11-06",end:"2026-11-06",title:"Último dia para pagamento da taxa",kind:"deadline",detail:"Taxa de inscrição: R$ 170,00, via PagTesouro/Pix conforme o edital."},
    {start:"2026-11-26",end:"2026-11-26",title:"Situação final do atendimento especializado",kind:"atendimento",detail:"Consulta à situação final."},
    {start:"2026-12-02",end:"2026-12-02",title:"Edital para consulta aos locais e horários de prova",kind:"local",detail:"A partir dessa divulgação, consultar individualmente o local e o horário no Cebraspe."},
    {start:"2026-12-13",end:"2026-12-13",title:"PROVAS OBJETIVAS + DISCURSIVA",kind:"prova",detail:"Objetivas: turno da manhã, duração de 5h. Discursiva: turno da tarde, duração de 3h30. O horário exato será informado no edital de locais."},
    {start:"2026-12-15",end:"2026-12-17",title:"Consulta individual aos gabaritos preliminares",kind:"resultado",detail:"Das 19h do primeiro dia às 18h do último dia."},
    {start:"2026-12-15",end:"2026-12-15",title:"Padrão preliminar da prova discursiva",kind:"resultado",detail:"Divulgação do padrão preliminar de respostas."},
    {start:"2026-12-16",end:"2026-12-17",title:"Recursos de questões, gabaritos e padrão discursivo",kind:"recurso",detail:"Das 10h do primeiro dia às 18h do último dia."},
    {start:"2026-12-18",end:"2026-12-18",title:"Divulgação dos gabaritos oficiais preliminares",kind:"resultado",detail:"Conforme Anexo I do edital."},
    {start:"2027-01-14",end:"2027-01-14",title:"Resultado final das provas objetivas",kind:"resultado",detail:"Também inclui resultado provisório da caracterização da deficiência – etapa documental."},
    {start:"2027-01-20",end:"2027-01-21",title:"Recursos – caracterização da deficiência",kind:"recurso",detail:"Das 10h do primeiro dia às 18h do último dia."},
    {start:"2027-02-04",end:"2027-02-04",title:"Convocações para procedimentos complementares",kind:"resultado",detail:"PcD presencial, confirmação de autodeclaração e verificações documentais, conforme edital."},
    {start:"2027-03-23",end:"2027-03-23",title:"Resultado provisório da prova discursiva",kind:"resultado",detail:"Com resultados finais dos procedimentos complementares."},
    {start:"2027-03-24",end:"2027-03-25",title:"Recursos – prova discursiva",kind:"recurso",detail:"Das 10h do primeiro dia às 18h do último dia."},
    {start:"2027-04-15",end:"2027-04-15",title:"RESULTADO FINAL DO CONCURSO",kind:"final",detail:"Resultado final da prova discursiva e resultado final no concurso público."}
  ];
  const START="2026-10-08",END="2027-04-15";
  function d(v){return new Date(v+"T12:00:00");}
  function ymdNow(){const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;}
  function fmt(v){return d(v).toLocaleDateString("pt-BR");}
  function pct(){const a=d(START).getTime(),b=d(END).getTime(),n=d(ymdNow()).getTime();return Math.max(0,Math.min(100,100*(n-a)/(b-a)));}
  function eventStatus(e){const n=ymdNow();if(n>e.end)return ["Concluído","done"];if(n>=e.start&&n<=e.end)return ["Em andamento","current"];return ["Próximo","future"];}
  function dateLabel(e){return e.start===e.end?fmt(e.start):`${fmt(e.start)} a ${fmt(e.end)}`;}
  function insertPage(){
    if(document.getElementById("page-cronograma"))return;
    const nav=document.querySelector(".nav");
    const reviewBtn=[...nav.querySelectorAll("button")].find(b=>b.dataset.page==="revisar");
    const btn=document.createElement("button");btn.dataset.page="cronograma";btn.innerHTML="🗓 Cronograma do edital";btn.onclick=function(){switchPage("cronograma",this)};
    nav.insertBefore(btn,reviewBtn||null);
    const main=document.querySelector(".main");
    const page=document.createElement("section");page.className="page";page.id="page-cronograma";
    page.innerHTML=`<div class="hero"><div><h2>Cronograma oficial do Edital CGU 2026</h2><p>Datas previstas do Anexo I do Edital nº 1 – CGU – AFFC, de 08/10/2026.</p></div><div><span class="badge p3">Cargo 3 · Infraestrutura de TI</span></div></div><div id="editalTimelineHost"></div>`;
    const revisar=document.getElementById("page-revisar");main.insertBefore(page,revisar||null);
  }
  function render(){
    const host=document.getElementById("editalTimelineHost");if(!host)return;
    const progress=pct(),now=ymdNow();
    const next=EVENTS.find(e=>e.end>=now);
    const milestones=[
      ["Edital",START],["Fim inscrições","2026-11-04"],["Pagamento","2026-11-06"],["Locais","2026-12-02"],["Prova","2026-12-13"],["Resultado final",END]
    ];
    host.innerHTML=`
      <div class="timeline-progress-card">
        <div class="timeline-progress-head"><div><b>Progresso do cronograma</b><span>08/10/2026 → 15/04/2027</span></div><strong>${progress.toFixed(1).replace(".",",")}%</strong></div>
        <div class="timeline-track"><span style="width:${progress}%"></span>${milestones.map(([l,v])=>{const p=100*(d(v)-d(START))/(d(END)-d(START));return `<i style="left:${p}%" title="${l}: ${fmt(v)}"></i>`}).join("")}</div>
        <div class="timeline-milestones">${milestones.map(([l,v])=>`<span><b>${l}</b><small>${fmt(v)}</small></span>`).join("")}</div>
        ${next?`<div class="timeline-next"><b>Próximo marco:</b> ${escapeHtml(next.title)} · ${escapeHtml(dateLabel(next))}</div>`:""}
      </div>
      <div class="timeline-alert"><b>⚠ Cronograma previsto</b><span>O próprio edital informa que as datas podem ser alteradas pela CGU/Cebraspe. O painel deve ser atualizado se sair retificação ou novo edital.</span></div>
      <div class="timeline-grid">${EVENTS.map(e=>{const [label,cls]=eventStatus(e);return `<article class="timeline-item ${cls}"><div class="timeline-date">${escapeHtml(dateLabel(e))}</div><div class="timeline-body"><div class="timeline-title">${escapeHtml(e.title)}</div><div class="timeline-detail">${escapeHtml(e.detail)}</div></div><span class="timeline-status ${cls}">${label}</span></article>`}).join("")}</div>
      <div class="timeline-source"><b>Fonte:</b> Edital nº 1 – CGU – AFFC, de 8 de outubro de 2026, Anexo I. Para local e horário individual da prova, consulte a Área do Candidato após o edital previsto para 02/12/2026.</div>`;
  }
  function style(){if(document.getElementById("timelineStyle"))return;const s=document.createElement("style");s.id="timelineStyle";s.textContent=`
    .timeline-progress-card{background:#fff;border:1px solid #dbe4f0;border-radius:14px;padding:16px;margin-bottom:12px}.timeline-progress-head{display:flex;justify-content:space-between;gap:12px;align-items:center}.timeline-progress-head b{display:block;color:#17365D;font-size:15px}.timeline-progress-head span{font-size:10px;color:#64748b}.timeline-progress-head strong{font-size:24px;color:#17365D}.timeline-track{height:12px;background:#e5e7eb;border-radius:99px;position:relative;margin:18px 4px 9px}.timeline-track>span{display:block;height:100%;background:#2f75b5;border-radius:99px}.timeline-track i{position:absolute;top:-4px;width:3px;height:20px;background:#7c3aed;border-radius:3px}.timeline-milestones{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}.timeline-milestones span{text-align:center;font-size:9px;color:#475569}.timeline-milestones b,.timeline-milestones small{display:block}.timeline-milestones small{font-size:8px;color:#94a3b8}.timeline-next{margin-top:12px;padding:9px 10px;border-radius:9px;background:#eff6ff;color:#1e3a5f;font-size:10px}.timeline-alert{display:flex;gap:8px;align-items:flex-start;padding:10px 12px;border:1px solid #fde68a;background:#fffbeb;color:#92400e;border-radius:10px;margin-bottom:12px;font-size:10px}.timeline-alert span{line-height:1.45}.timeline-grid{display:grid;gap:8px}.timeline-item{display:grid;grid-template-columns:145px 1fr auto;gap:12px;align-items:center;border:1px solid #e2e8f0;background:#fff;border-radius:11px;padding:11px 12px}.timeline-item.current{border-color:#93c5fd;background:#eff6ff}.timeline-item.done{opacity:.72}.timeline-date{font-weight:900;color:#17365D;font-size:10px}.timeline-title{font-weight:900;color:#0f172a;font-size:11px}.timeline-detail{font-size:9px;color:#64748b;margin-top:3px;line-height:1.4}.timeline-status{font-size:9px;font-weight:900;padding:4px 8px;border-radius:999px;white-space:nowrap}.timeline-status.done{background:#dcfce7;color:#166534}.timeline-status.current{background:#dbeafe;color:#1d4ed8}.timeline-status.future{background:#f1f5f9;color:#475569}.timeline-source{margin-top:12px;padding:10px;border:1px dashed #cbd5e1;border-radius:9px;font-size:9px;color:#64748b}.timeline-source b{color:#334155}@media(max-width:760px){.timeline-item{grid-template-columns:1fr}.timeline-status{justify-self:start}.timeline-milestones{grid-template-columns:repeat(3,1fr);row-gap:8px}}`;
    document.head.appendChild(s)}
  insertPage();style();render();
  const baseSwitch=switchPage;
  switchPage=function(name,btn){const r=baseSwitch(name,btn);if(name==="cronograma"){document.getElementById("topTitle").textContent="Cronograma do edital";render();}return r;};
  window.CGU_renderEditalTimeline=render;
})();