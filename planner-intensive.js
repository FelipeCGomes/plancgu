/* Plano intensivo v1.
   - Sábado: 3h manhã (revisão + P4) + 2h tarde + 2h noite.
   - Domingo e feriados nacionais: 3h manhã + 2h tarde + 2h noite.
   - Dias úteis seguem com plano normal de 3h.
*/
(() => {
  const PLAN_KEY=KEY+"-daily-plans-v1";
  const META="__intensiveSessions";
  const HOLIDAYS={
    "2026-01-01":"Confraternização Universal",
    "2026-04-21":"Tiradentes",
    "2026-05-01":"Dia do Trabalho",
    "2026-09-07":"Independência do Brasil",
    "2026-10-12":"Nossa Senhora Aparecida",
    "2026-11-02":"Finados",
    "2026-11-15":"Proclamação da República",
    "2026-11-20":"Dia Nacional de Zumbi e da Consciência Negra",
    "2026-12-25":"Natal"
  };
  let internal=false;
  function readPlans(){if(typeof window.CGU_readDailyPlans==="function")return window.CGU_readDailyPlans();try{return JSON.parse(localStorage.getItem(PLAN_KEY)||"{}")||{}}catch(e){return {}}}
  function writePlans(v){if(typeof window.CGU_writeDailyPlans==="function")return window.CGU_writeDailyPlans(v);try{localStorage.setItem(PLAN_KEY,JSON.stringify(v||{}));}catch(e){}window.dispatchEvent(new CustomEvent("cgu-plan-changed"));}
  function dateObj(ymd){return new Date(ymd+"T12:00:00");}
  function todayYmd(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
  function selectedYmd(){return document.getElementById("studyDate")?.value||todayYmd();}
  function isSaturday(ymd){return dateObj(ymd).getDay()===6;}
  function isSunday(ymd){return dateObj(ymd).getDay()===0;}
  function isHoliday(ymd){return !!HOLIDAYS[ymd];}
  function intensive(ymd){return isSaturday(ymd)||isSunday(ymd)||isHoliday(ymd);}
  function title(x){const a=window.ATOMIC_META?.[x.id]||{};return a.code?`${a.code} · ${a.title}`:(a.title||x.g.nome);}
  function pri(p){return ({"Crítica":4,"Alta":3,"Média":2,"Baixa":1}[p]||0);}
  function blocked(x,ymd,plans){const m=plans?.__deferrals||{},t=m.topics?.[x.id],s=m.subjects?.[x.d.id];return !!((t?.until&&ymd<t.until&&!t.cancelledAtMs)||(s?.until&&ymd<s.until&&!s.cancelledAtMs));}
  function score(x){let s=pri(x.priority)*120+(x.exam==="P3"?90:x.exam==="P2"?45:20);if(!x.m.q)s+=45;if(x.m.status==="Revisar")s+=25+Math.max(0,x.m.meta-x.m.liquido)*2;if(x.m.q<15)s+=15;return s;}
  function chooseSlots(ymd,count,exclude=[]){
    const plans=readPlans(),ex=new Set(exclude),rows=topicsFlat().filter(x=>!x.m.s.done&&!ex.has(x.id)&&!blocked(x,ymd,plans)).map(x=>({...x,_s:score(x)})).sort((a,b)=>b._s-a._s);
    const out=[],usedSubjects=new Set();
    for(const x of rows){if(out.length>=count)break;if(usedSubjects.has(x.d.id)&&rows.some(y=>!usedSubjects.has(y.d.id)&&!out.some(o=>o.id===y.id)))continue;out.push(x);usedSubjects.add(x.d.id);}
    for(const x of rows){if(out.length>=count)break;if(!out.some(o=>o.id===x.id))out.push(x);}
    return out;
  }
  function ensure(ymd){
    const plans=readPlans(),all={...(plans[META]||{})},cur={...(all[ymd]||{})};
    const desired=isSaturday(ymd)?2:3;
    let ids=Array.isArray(cur.topicIds)?cur.topicIds.filter(id=>topicsFlat().some(x=>x.id===id&&!x.m.s.done)):[];
    const add=chooseSlots(ymd,desired,ids);
    add.forEach(x=>{if(ids.length<desired&&!ids.includes(x.id))ids.push(x.id)});
    cur.topicIds=ids.slice(0,desired);cur.type=isSaturday(ymd)?"sábado":isHoliday(ymd)?"feriado":"domingo";cur.holiday=HOLIDAYS[ymd]||null;cur.updatedAtMs=Date.now();
    all[ymd]=cur;plans[META]=all;writePlans(plans);return cur;
  }
  function slotId(ymd,i,suffix){return `int-${ymd}-${i}-${suffix}`.replace(/[^a-zA-Z0-9_-]/g,"-");}
  function stateFor(ymd,i){const p=readPlans()[META]?.[ymd];return p?.slots?.[i]||{};}
  function updateSlot(ymd,i,patch){const plans=readPlans(),all={...(plans[META]||{})},day={...(all[ymd]||{})},slots={...(day.slots||{})};slots[i]={...(slots[i]||{}),...patch,updatedAtMs:Date.now()};day.slots=slots;day.updatedAtMs=Date.now();all[ymd]=day;plans[META]=all;writePlans(plans);try{save();}catch(e){};}
  window.CGU_intensiveMarkStudied=function(topicId,ymd,i,v){setTS(topicId,{done:!!v,completedAtMs:v?Date.now():null,completionSource:"intensive-plan",updatedAtMs:Date.now()});updateSlot(ymd,i,{studied:!!v});try{save();}catch(e){}renderToday();if(typeof toast==="function")toast(v?"Bloco marcado como estudado.":"Bloco reaberto.");};
  window.CGU_intensiveSaveQuestions=function(topicId,ymd,i){
    const q=Number(document.getElementById(slotId(ymd,i,"q"))?.value||0),a=Number(document.getElementById(slotId(ymd,i,"a"))?.value||0),b=Number(document.getElementById(slotId(ymd,i,"b"))?.value||0);
    if(q<10){alert("Registre pelo menos 10 questões neste bloco.");return;}if(a<0||b<0||a+b>q){alert("Confira os valores: acertos + em branco não podem ultrapassar o total.");return;}
    const cur=normalizeTopic(topicId),e=q-a-b;setTS(topicId,{questoes:cur.q+q,acertos:cur.a+a,brancos:(cur.brancos||0)+b,erros:cur.e+e,lastQuestionDate:new Date().toISOString(),lastQuestionSource:"plano-intensivo",updatedAtMs:Date.now(),atomicConfirmed:true});updateSlot(ymd,i,{questionsDone:true,lastBatch:{questoes:q,acertos:a,erros:e,brancos:b}});try{save();}catch(err){}renderAll();if(typeof renderPerformancePanel==="function")renderPerformancePanel();if(typeof toast==="function")toast(`${q} questões registradas no bloco intensivo.`);};
  function qForm(x,ymd,i){const m=x.m,b=Number(m.s.brancos)||0;return `<div class="int-q"><div class="question-cumulative"><div><span>Acumulado</span><b>${m.q}</b></div><div><span>Acertos</span><b>${m.a}</b></div><div><span>Erros</span><b>${m.e}</b></div><div><span>Em branco</span><b>${b}</b></div><div><span>Líquido</span><b>${fmtPct(m.liquido)}</b></div></div><div class="int-q-grid"><div><label>Total</label><input id="${slotId(ymd,i,"q")}" type="number" min="10" placeholder="Mín. 10"></div><div><label>Acertos</label><input id="${slotId(ymd,i,"a")}" type="number" min="0"></div><div><label>Em branco</label><input id="${slotId(ymd,i,"b")}" type="number" min="0" value="0"></div><button type="button" onclick="CGU_intensiveSaveQuestions('${x.id}','${ymd}',${i})">Salvar questões</button></div></div>`;}
  function block(x,ymd,i,label,duration){const st=stateFor(ymd,i);return `<div class="int-block"><div class="int-head"><div><span>${escapeHtml(label)} · ${duration}</span><b>${escapeHtml(title(x))}</b><small>${escapeHtml(x.d.nome)} · ${x.exam} · ${x.priority}</small></div><div><span class="badge ${priClass(x.priority)}">${x.priority}</span><span class="badge ${examClass(x.exam)}">${x.exam}</span></div></div><div class="int-actions"><button type="button" class="${x.m.s.done?"done":""}" onclick="CGU_intensiveMarkStudied('${x.id}','${ymd}',${i},${!x.m.s.done})">${x.m.s.done?"✓ Estudado":"Marcar aula estudada"}</button></div>${qForm(x,ymd,i)}</div>`;}
  function setHeader(hours){const h=document.querySelector("#page-hoje .hero h2");if(h)h.textContent=`Plano de estudo do dia — ${hours} horas`;}
  function renderSundayHoliday(ymd,session){
    const ids=session.topicIds||[],rows=ids.map(id=>topicsFlat().find(x=>x.id===id)).filter(Boolean),host=document.getElementById("todayLessons"),routine=document.getElementById("todayRoutine"),budget=document.querySelector("#page-hoje .study-budget"),titleEl=document.getElementById("todayTitle");if(!host||!routine)return;
    setHeader(7);if(titleEl)titleEl.textContent=`Plano intensivo · ${session.holiday?`feriado — ${session.holiday}`:"domingo"}`;
    if(budget)budget.innerHTML=`<div class="budget-item"><span class="small">Manhã</span><b>3h</b><span class="small">teoria + questões + revisão</span></div><div class="budget-item"><span class="small">Tarde</span><b>2h</b><span class="small">aula direcionada + questões</span></div><div class="budget-item"><span class="small">Noite</span><b>2h</b><span class="small">aula direcionada + questões</span></div>`;
    host.innerHTML=`<div class="int-banner"><b>⚡ Dia intensivo de 7 horas</b><span>${session.holiday?`Feriado nacional: ${escapeHtml(session.holiday)}.`:"Domingo."} O sistema distribui temas diferentes para acelerar a cobertura sem abandonar desempenho e prioridade.</span></div>${rows[0]?block(rows[0],ymd,0,"Manhã","3h"):""}${rows[1]?block(rows[1],ymd,1,"Tarde","2h"):""}${rows[2]?block(rows[2],ymd,2,"Noite","2h"):""}`;
    routine.innerHTML=`<div class="plan-line"><div class="plan-time">Manhã</div><div><b>Bloco 1 · 3h</b><div class="plan-kind">120 min teoria + 45 min questões + 15 min revisão</div></div><b>180 min</b></div><div class="plan-line"><div class="plan-time">Tarde</div><div><b>Bloco 2 · 2h</b><div class="plan-kind">90 min teoria + 30 min questões</div></div><b>120 min</b></div><div class="plan-line"><div class="plan-time">Noite</div><div><b>Bloco 3 · 2h</b><div class="plan-kind">90 min teoria + 30 min questões</div></div><b>120 min</b></div><div class="int-logic">Total do dia: <b>7 horas</b>. O motor evita repetir a mesma matéria quando existem alternativas de prioridade semelhante.</div>`;
  }
  function appendSaturday(ymd,session){const rows=(session.topicIds||[]).map(id=>topicsFlat().find(x=>x.id===id)).filter(Boolean),host=document.getElementById("todayLessons"),routine=document.getElementById("todayRoutine"),budget=document.querySelector("#page-hoje .study-budget");setHeader(7);if(budget)budget.innerHTML=`<div class="budget-item"><span class="small">Manhã</span><b>3h</b><span class="small">revisão semanal + P4</span></div><div class="budget-item"><span class="small">Tarde</span><b>2h</b><span class="small">aula nova + questões</span></div><div class="budget-item"><span class="small">Noite</span><b>2h</b><span class="small">aula nova + questões</span></div>`;if(host){host.insertAdjacentHTML("beforeend",`<div class="int-extra-title"><b>Mais 4 horas de avanço do edital</b><span>Após o bloco estratégico da manhã, entram dois temas novos escolhidos pela prioridade e pelo desempenho.</span></div>${rows[0]?block(rows[0],ymd,0,"Tarde","2h"):""}${rows[1]?block(rows[1],ymd,1,"Noite","2h"):""}`)}if(routine)routine.insertAdjacentHTML("beforeend",`<div class="plan-line int-line"><div class="plan-time">Tarde</div><div><b>Aula direcionada</b><div class="plan-kind">90 min teoria + 30 min questões</div></div><b>120 min</b></div><div class="plan-line int-line"><div class="plan-time">Noite</div><div><b>Aula direcionada</b><div class="plan-kind">90 min teoria + 30 min questões</div></div><b>120 min</b></div><div class="int-logic">Sábado total: <b>7 horas</b> — 3h consolidação/P4 + 4h de avanço em conteúdos novos.</div>`);}
  function style(){if(document.getElementById("intensiveStyle"))return;const s=document.createElement("style");s.id="intensiveStyle";s.textContent=`.int-banner,.int-extra-title{padding:11px;border:1px solid #bfdbfe;background:#eff6ff;border-radius:10px;margin:10px 0;color:#1e3a5f}.int-banner b,.int-banner span,.int-extra-title b,.int-extra-title span{display:block}.int-banner span,.int-extra-title span{font-size:9px;margin-top:3px;line-height:1.45}.int-block{border:1px solid #dbe4f0;border-radius:11px;background:#fff;padding:11px;margin-top:10px}.int-head{display:flex;justify-content:space-between;gap:10px}.int-head span:first-child{font-size:9px;color:#64748b;font-weight:800;text-transform:uppercase}.int-head b,.int-head small{display:block}.int-head b{font-size:12px;color:#17365D;margin-top:3px}.int-head small{font-size:9px;color:#64748b;margin-top:3px}.int-head>div:last-child{display:flex;gap:5px;align-items:flex-start}.int-actions{margin-top:8px}.int-actions button{border:1px solid #17365D;background:#17365D;color:#fff;border-radius:8px;padding:7px 10px;font-weight:900;cursor:pointer}.int-actions button.done{background:#f0fdf4;color:#166534;border-color:#86efac}.int-q{margin-top:8px;padding-top:8px;border-top:1px solid #eef2f7}.int-q-grid{display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:7px;align-items:end}.int-q-grid label{display:block;font-size:8px;text-transform:uppercase;color:#64748b;font-weight:800;margin-bottom:3px}.int-q-grid input{width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:8px}.int-q-grid button{border:0;background:#17365D;color:#fff;border-radius:8px;padding:9px 11px;font-weight:900}.int-logic{margin-top:10px;padding:8px 10px;border:1px dashed #cbd5e1;border-radius:8px;font-size:9px;color:#64748b}.int-line{border-top:1px solid #eef2f7}@media(max-width:700px){.int-q-grid{grid-template-columns:1fr 1fr}.int-q-grid button{grid-column:1/-1}.int-head{display:block}.int-head>div:last-child{margin-top:7px}}`;
    document.head.appendChild(s)}
  style();
  const baseRender=renderToday;
  renderToday=function(){if(internal)return baseRender.apply(this,arguments);internal=true;try{const ymd=selectedYmd();let r=baseRender.apply(this,arguments);if(!intensive(ymd)){setHeader(3);return r;}const s=ensure(ymd);if(isSaturday(ymd))appendSaturday(ymd,s);else renderSundayHoliday(ymd,s);return r;}finally{internal=false;}};
  try{renderToday();}catch(e){console.warn("Plano intensivo:",e)}
})();