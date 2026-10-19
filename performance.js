/* Dashboard de desempenho vs meta.
   Separa mínimo eliminatório do edital de meta estratégica de competitividade. */

const PERFORMANCE_MIN_EDITAL={P1:20,P2:30,P3:30};
const PERFORMANCE_MAX_POINTS={P1:40,P2:40,P3:180};
const PERFORMANCE_MIN_SAMPLE=10;

function perfBar(value){
  if(value===null||value===undefined||!isFinite(value))return 0;
  return Math.max(0,Math.min(100,value));
}

function perfGap(current,target){
  if(current===null||current===undefined||!isFinite(current))return null;
  return current-target;
}

function perfGapText(gap){
  if(gap===null)return "Sem amostra";
  if(Math.abs(gap)<0.05)return "Na meta";
  return gap>0?`+${gap.toFixed(1).replace('.',',')} p.p.`:`${gap.toFixed(1).replace('.',',')} p.p.`;
}

function perfStatus(blocks){
  const missing=blocks.filter(x=>x.q<PERFORMANCE_MIN_SAMPLE);
  if(missing.length){
    return {label:"Amostra insuficiente",cls:"medium",text:`Ainda faltam questões em ${missing.map(x=>x.exam).join(', ')} para uma projeção confiável.`};
  }
  const gaps=blocks.map(x=>x.liquido-x.meta);
  const worst=Math.min(...gaps);
  if(worst>=0)return {label:"Competitivo",cls:"ok",text:"Os três blocos estão na meta estratégica atual. Mantenha consistência e valide em simulados completos."};
  if(worst>=-10)return {label:"Próximo da meta",cls:"medium",text:"Você está relativamente perto da meta, mas ainda há bloco(s) abaixo do alvo estratégico."};
  return {label:"Abaixo do ritmo",cls:"bad",text:"Há bloco com distância relevante da meta. O plano adaptativo deve priorizar essa recuperação."};
}

function perfObjectiveTarget(){
  const targetPts=Object.keys(PERFORMANCE_MAX_POINTS).reduce((sum,exam)=>sum+PERFORMANCE_MAX_POINTS[exam]*(examMeta(exam)/100),0);
  return 100*targetPts/260;
}

function perfBlockRow(exam){
  const s=blockStats(exam);
  const current=s.liquido;
  const target=examMeta(exam);
  const minimum=PERFORMANCE_MIN_EDITAL[exam];
  const gap=perfGap(current,target);
  const status=current===null?"Sem amostra":current>=target?"Na meta":current>=minimum?"Acima do mínimo, abaixo da meta":"Abaixo do mínimo";
  const statusClass=current===null?"medium":current>=target?"ok":current>=minimum?"medium":"bad";
  return `<div class="perf-row">
    <div class="perf-exam"><span class="badge ${examClass(exam)}">${exam}</span><div><b>${exam==='P1'?'Conhecimentos básicos':exam==='P2'?'Conhecimentos complementares':'Conhecimentos específicos'}</b><div class="small">${s.q} questões mapeadas</div></div></div>
    <div class="perf-values">
      <div><span>Atual</span><b>${fmtPct(current)}</b></div>
      <div><span>Mín. edital</span><b>${minimum}%</b></div>
      <div><span>Meta estratégica</span><b>${target}%</b></div>
      <div><span>Gap</span><b>${perfGapText(gap)}</b></div>
    </div>
    <div class="perf-track"><span class="perf-min" style="left:${minimum}%"></span><span class="perf-target" style="left:${target}%"></span><span class="perf-fill" style="width:${perfBar(current)}%"></span></div>
    <div class="perf-status ${statusClass}">${status}</div>
  </div>`;
}

function renderPerformancePanel(){
  const page=document.getElementById('page-dashboard');
  const kpis=document.getElementById('kpis');
  if(!page||!kpis)return;

  let panel=document.getElementById('performanceVsTarget');
  if(!panel){
    panel=document.createElement('section');
    panel.id='performanceVsTarget';
    panel.className='card perf-card';
    kpis.insertAdjacentElement('afterend',panel);
  }

  const blocks=['P1','P2','P3'].map(exam=>({exam,...blockStats(exam)}));
  const status=perfStatus(blocks);
  const mapped=blocks.reduce((s,x)=>s+x.q,0);
  const total=(typeof HISTORY_BASE!=='undefined'&&HISTORY_BASE.questoes)?HISTORY_BASE.questoes:mapped;
  const coverage=total?100*mapped/total:0;
  const strategic=perfObjectiveTarget();
  const haveAll=blocks.every(x=>x.q>=PERFORMANCE_MIN_SAMPLE);
  const currentWeightedMax=blocks.reduce((s,x)=>s+x.q*(x.exam==='P3'?2:1),0);
  const currentWeightedNet=blocks.reduce((s,x)=>s+(x.a-x.e)*(x.exam==='P3'?2:1),0);
  const currentWeighted=currentWeightedMax?100*currentWeightedNet/currentWeightedMax:null;

  panel.innerHTML=`
    <div class="perf-head">
      <div>
        <h3>Desempenho × meta para aprovação</h3>
        <div class="small">O mínimo do edital evita eliminação. A <b>meta estratégica</b> é o alvo de preparação para disputar classificação alta; não é nota de corte oficial.</div>
      </div>
      <div class="perf-signal ${status.cls}"><span>${status.label}</span><small>${status.text}</small></div>
    </div>

    <div class="perf-summary">
      <div><span>Amostra total conhecida</span><b>${total}</b><small>questões</small></div>
      <div><span>Mapeadas no edital</span><b>${mapped}</b><small>${coverage.toFixed(1).replace('.',',')}% da amostra</small></div>
      <div><span>Líquido ponderado mapeado</span><b>${fmtPct(currentWeighted)}</b><small>P3 pesa 2×</small></div>
      <div><span>Meta objetiva estratégica</span><b>${strategic.toFixed(1).replace('.',',')}%</b><small>pelas metas P1/P2/P3 atuais</small></div>
    </div>

    <div class="perf-legend"><span><i class="min"></i>Mínimo do edital</span><span><i class="target"></i>Meta estratégica</span><span><i class="current"></i>Seu desempenho</span></div>
    <div class="perf-list">${['P1','P2','P3'].map(perfBlockRow).join('')}</div>

    <div class="perf-note ${haveAll?'ok':'medium'}">
      <b>${haveAll?'Já existe amostra mínima nos três blocos.':'Ainda não dá para estimar sua chance de aprovação com confiança.'}</b>
      <span>${haveAll?'Use o resultado como indicador de ritmo, não como previsão de colocação.':'Para liberar uma leitura mais confiável, registre pelo menos 10 questões em P1, P2 e P3. Hoje o painel mostra onde você está, mas não inventa probabilidade.'}</span>
    </div>
    <div class="perf-discursive"><b>Discursiva:</b> ainda sem desempenho registrado neste painel. Para uma projeção final de Top 6, precisamos acompanhar também a questão de 30 pontos e o estudo de caso de 70 pontos; a meta de treino continua em <b>80%+</b>.</div>
  `;
}

(function installPerformanceDashboard(){
  const style=document.createElement('style');
  style.textContent=`
    .perf-card{margin:0 0 18px}.perf-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:14px}.perf-head h3{font-size:17px;margin-bottom:5px}.perf-signal{min-width:210px;border-radius:12px;padding:10px 12px;border:1px solid var(--border)}.perf-signal span{font-weight:900;display:block}.perf-signal small{display:block;margin-top:3px;line-height:1.35}.perf-signal.ok,.perf-note.ok{background:#f0fdf4;border-color:#bbf7d0;color:#166534}.perf-signal.medium,.perf-note.medium{background:#fffbeb;border-color:#fde68a;color:#92400e}.perf-signal.bad{background:#fef2f2;border-color:#fecaca;color:#991b1b}.perf-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-bottom:14px}.perf-summary>div{border:1px solid var(--border);border-radius:11px;padding:11px;background:#f8fafc}.perf-summary span,.perf-values span{display:block;font-size:9px;text-transform:uppercase;color:var(--muted);font-weight:800}.perf-summary b{font-size:20px;color:var(--navy);display:block;margin:3px 0}.perf-summary small{font-size:9px;color:var(--muted)}.perf-legend{display:flex;gap:14px;flex-wrap:wrap;font-size:10px;color:var(--muted);margin-bottom:8px}.perf-legend span{display:flex;align-items:center;gap:5px}.perf-legend i{width:12px;height:4px;border-radius:99px;display:inline-block}.perf-legend .min{background:#f59e0b}.perf-legend .target{background:#7c3aed}.perf-legend .current{background:#2f75b5}.perf-row{padding:12px 0;border-top:1px solid #eef2f7}.perf-exam{display:flex;gap:9px;align-items:center}.perf-exam b{font-size:12px;color:var(--navy)}.perf-values{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:9px 0}.perf-values>div{border:1px solid var(--border);border-radius:8px;padding:7px}.perf-values b{font-size:12px;color:var(--navy)}.perf-track{position:relative;height:10px;background:#e5e7eb;border-radius:99px;overflow:visible}.perf-fill{display:block;height:100%;background:#2f75b5;border-radius:99px}.perf-min,.perf-target{position:absolute;top:-3px;width:3px;height:16px;border-radius:3px;z-index:2}.perf-min{background:#f59e0b}.perf-target{background:#7c3aed}.perf-status{display:inline-block;margin-top:7px;border-radius:999px;padding:4px 8px;font-size:9px;font-weight:900}.perf-status.ok{background:#dcfce7;color:#166534}.perf-status.medium{background:#fef3c7;color:#92400e}.perf-status.bad{background:#fee2e2;color:#991b1b}.perf-note{border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-top:11px;font-size:11px}.perf-note b,.perf-note span{display:block}.perf-note span{margin-top:3px}.perf-discursive{margin-top:9px;padding:10px 12px;border:1px dashed #cbd5e1;border-radius:10px;font-size:10px;color:#475569;background:#fbfdff}
    @media(max-width:800px){.perf-head{display:block}.perf-signal{margin-top:10px;min-width:0}.perf-summary{grid-template-columns:1fr 1fr}.perf-values{grid-template-columns:1fr 1fr}}
    @media(max-width:420px){.perf-summary{grid-template-columns:1fr 1fr}.perf-summary b{font-size:18px}.perf-values{grid-template-columns:1fr 1fr}}
  `;
  document.head.appendChild(style);

  const previous=renderDashboard;
  renderDashboard=function(){
    previous();
    renderPerformancePanel();
  };
  try{renderPerformancePanel();}catch(e){console.warn('Dashboard de metas:',e)}
})();
