/* Complementos da ficha P4 sem alterar a formula oficial ja implementada.
   - dupla correcao de conteudo e convergencia (Edital 9.7.4.1.1 a 9.7.4.1.3)
   - origem da correcao e tempo gasto
   - densidade de erros por 10 linhas
   - rubrica formativa renomeada para refletir a linguagem do edital
*/
(() => {
  const PLAN_KEY=KEY+"-daily-plans-v1", META_KEY="__discursiveTrackerV1";
  let activeEditId=null, internal=false;
  const CFG={q1:{max:30,lines:30},q2:{max:70,lines:60}};
  const SOURCE_LABEL={autocorrecao:"Autocorreção",chatgpt:"ChatGPT",professor:"Professor / curso",simulado:"Simulado / espelho",cebraspe:"Correção Cebraspe",outro:"Outro"};

  function readPlans(){if(typeof window.CGU_readDailyPlans==="function")return window.CGU_readDailyPlans();try{return JSON.parse(localStorage.getItem(PLAN_KEY)||"{}")||{}}catch(e){return {}}}
  function writePlans(p){if(typeof window.CGU_writeDailyPlans==="function")window.CGU_writeDailyPlans(p);else{try{localStorage.setItem(PLAN_KEY,JSON.stringify(p||{}))}catch(e){}window.dispatchEvent(new CustomEvent("cgu-plan-changed"))}try{save()}catch(e){}}
  function entries(){const p=readPlans(),b=p[META_KEY]||{};return Array.isArray(b.entries)?b.entries:[]}
  function entryById(id){return entries().find(e=>e.id===id)||null}
  function type(){return document.getElementById("p4-type")?.value||"q1"}
  function cfg(){return CFG[type()]||CFG.q1}
  function val(id){return document.getElementById(id)?.value??""}
  function num(id){const x=Number(val(id));return Number.isFinite(x)?Math.max(0,x):0}
  function present(v){return v!==""&&v!==null&&v!==undefined&&Number.isFinite(Number(v))}
  function fmt(v,d=1){return v==null||!isFinite(v)?"—":Number(v).toFixed(d).replace(".",",")}
  function esc(s){return typeof escapeHtml==="function"?escapeHtml(s):String(s??"")}

  function evaluation(){
    const c=cfg(),limit=c.max*.25;
    const a1=present(val("p4-eval1"))?Math.min(c.max,Number(val("p4-eval1"))):null;
    const a2=present(val("p4-eval2"))?Math.min(c.max,Number(val("p4-eval2"))):null;
    const a3=present(val("p4-eval3"))?Math.min(c.max,Number(val("p4-eval3"))):null;
    if(a1!=null&&a2!=null){
      const d=Math.abs(a1-a2);
      if(d<=limit)return {nc:(a1+a2)/2,status:"Convergente",detail:`A1/A2 diferem ${fmt(d,1)} ponto(s); limite ${fmt(limit,1)}.`,need3:false,a1,a2,a3};
      if(a3==null)return {nc:null,status:"3ª correção necessária",detail:`A1/A2 diferem ${fmt(d,1)}, acima do limite de ${fmt(limit,1)}.`,need3:true,a1,a2,a3};
      const pairs=[[a1,a2,"A1/A2"],[a1,a3,"A1/A3"],[a2,a3,"A2/A3"]].map(([x,y,l])=>({x,y,l,d:Math.abs(x-y)})).sort((x,y)=>x.d-y.d);
      const best=pairs[0];
      if(best.d<=limit)return {nc:(best.x+best.y)/2,status:"Convergente após 3ª",detail:`Usadas ${best.l}; diferença ${fmt(best.d,1)} ponto(s).`,need3:false,a1,a2,a3};
      return {nc:null,status:"Sem convergência",detail:`O par mais próximo ainda difere ${fmt(best.d,1)} ponto(s).`,need3:true,a1,a2,a3};
    }
    return {nc:null,status:"NC manual",detail:"Preencha A1 e A2 apenas quando quiser simular a dupla correção oficial.",need3:false,a1,a2,a3};
  }

  function extrasFromForm(){return {source:val("p4-source")||"autocorrecao",minutes:num("p4-minutes"),eval1:val("p4-eval1"),eval2:val("p4-eval2"),eval3:val("p4-eval3")}}

  function persistExtras(id,extra){
    if(!id)return;const p=readPlans(),b=p[META_KEY]||{},arr=Array.isArray(b.entries)?b.entries:[];
    b.entries=arr.map(e=>e.id===id?{...e,...extra,updatedAtMs:Date.now()}:e);b.version=2;b.updatedAtMs=Date.now();p[META_KEY]=b;writePlans(p);
  }

  function setLabel(id,text){const el=document.getElementById(id);const label=el?.closest(".field")?.querySelector("label");if(label)label.textContent=text}

  function enhanceForm(data){
    const form=document.getElementById("p4Form");if(!form||internal)return;
    internal=true;
    try{
      const c=cfg(),grid=form.querySelector(".p4-form-grid");
      if(grid&&!document.getElementById("p4-source")){
        const source=data?.source||"autocorrecao",minutes=data?.minutes??"";
        grid.insertAdjacentHTML("beforeend",`<div class="field p4-extra-source"><label>Origem da correção</label><select id="p4-source">${Object.entries(SOURCE_LABEL).map(([k,l])=>`<option value="${k}" ${source===k?"selected":""}>${esc(l)}</option>`).join("")}</select></div><div class="field p4-extra-time"><label>Tempo gasto</label><input id="p4-minutes" type="number" min="0" value="${minutes}" placeholder="min"><small>opcional</small></div>`);
      }
      const score=form.querySelector(".p4-score-grid");
      if(score&&!document.getElementById("p4-evaluators")){
        score.insertAdjacentHTML("afterend",`<details id="p4-evaluators" class="p4-evaluators" ${(data?.eval1!==undefined||data?.eval2!==undefined)?"open":""}><summary>Dupla correção de conteúdo · regra oficial</summary><div class="p4-enh-note">Opcional no treino. Preenchendo A1 e A2, o painel verifica a convergência de 25% da nota máxima e calcula o NC médio. Se ultrapassar o limite, solicita A3.</div><div class="p4-eval-grid"><div class="field"><label>Avaliador 1</label><input id="p4-eval1" type="number" min="0" max="${c.max}" step="0.1" value="${data?.eval1??""}"></div><div class="field"><label>Avaliador 2</label><input id="p4-eval2" type="number" min="0" max="${c.max}" step="0.1" value="${data?.eval2??""}"></div><div class="field"><label>Avaliador 3</label><input id="p4-eval3" type="number" min="0" max="${c.max}" step="0.1" value="${data?.eval3??""}"><small>só se houver divergência</small></div><div id="p4-convergence" class="p4-convergence"></div></div></details>`);
        ["p4-eval1","p4-eval2","p4-eval3"].forEach(id=>document.getElementById(id)?.addEventListener("input",()=>{updateConvergence();window.CGU_p4Live?.()}));
      }
      setLabel("p4-r-command","Atendimento ao comando");setLabel("p4-r-structure","Apresentação / estrutura textual");setLabel("p4-r-development","Desenvolvimento do tema");setLabel("p4-r-knowledge","Conhecimento técnico / tema");setLabel("p4-r-cohesion","Coerência / coesão");
      const rn=form.querySelector(".p4-rubric-note");if(rn)rn.innerHTML='Escala 0–5 para diagnóstico. Os nomes seguem os elementos do edital, mas <b>não existem pesos internos oficiais publicados</b>; esta rubrica não altera o NC.';
      updateTypeLimits();updateConvergence();enhanceLive();
    }finally{internal=false}
  }

  function updateTypeLimits(){const c=cfg();["p4-eval1","p4-eval2","p4-eval3"].forEach(id=>{const e=document.getElementById(id);if(e)e.max=c.max})}
  function updateConvergence(){
    const box=document.getElementById("p4-convergence");if(!box)return;const r=evaluation();
    if(r.nc!=null){const nc=document.getElementById("p4-nc");if(nc){nc.value=Number(r.nc.toFixed(2));nc.dispatchEvent(new Event("input",{bubbles:true}))}}
    box.className=`p4-convergence ${r.need3?"warn":"ok"}`;box.innerHTML=`<span>Convergência do NC</span><b>${esc(r.status)}</b><small>${esc(r.detail)}</small>${r.nc!=null?`<strong>NC calculado: ${fmt(r.nc,2)}/${cfg().max}</strong>`:""}`;
  }

  function enhanceLive(){
    const host=document.getElementById("p4LiveResult");if(!host)return;host.querySelectorAll(".p4-extra-live").forEach(e=>e.remove());
    const tl=num("p4-lines"),ne=num("p4-spelling")+num("p4-syntax")+num("p4-vocab")+num("p4-other"),minutes=num("p4-minutes"),rate=tl?10*ne/Math.min(tl,cfg().lines):null;
    host.insertAdjacentHTML("beforeend",`<div class="p4-extra-live"><span>Erros / 10 linhas</span><b>${fmt(rate,2)}</b><small>densidade de erros</small></div>${minutes?`<div class="p4-extra-live"><span>Tempo gasto</span><b>${minutes} min</b><small>${tl?fmt(minutes/tl,1)+" min/linha":"—"}</small></div>`:""}`);
  }

  function enhanceRules(){const rules=document.getElementById("p4Rules");if(!rules||rules.querySelector(".p4-double-rule"))return;rules.insertAdjacentHTML("beforeend",`<div class="p4-rule p4-double-rule"><b>Dupla correção de conteúdo</b><span>O edital determina pelo menos dois examinadores. As notas são convergentes se diferirem em até 25% da nota máxima.</span><code>Q1: 7,5 pts · Q2: 17,5 pts</code></div><div class="p4-rule-note p4-double-rule"><b>Divergência:</b> acima desse limite ocorre terceira correção; considera-se a média das duas notas mais próximas, desde que convergentes.</div>`)}

  function enhanceHistory(){
    const cards=[...document.querySelectorAll("#p4History .p4-entry")],arr=[...entries()].sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))||Number(b.updatedAtMs||0)-Number(a.updatedAtMs||0));
    cards.forEach((card,i)=>{const e=arr[i];if(!e||card.dataset.extraDone)return;card.dataset.extraDone="1";const badges=card.querySelector(".p4-entry-badges");if(badges){if(e.source)badges.insertAdjacentHTML("beforeend",`<span class="p4-pill">${esc(SOURCE_LABEL[e.source]||e.source)}</span>`);if(e.minutes)badges.insertAdjacentHTML("beforeend",`<span class="p4-pill">${e.minutes} min</span>`);if(present(e.eval1)&&present(e.eval2)){const oldType=document.getElementById("p4-type")?.value;const max=e.type==="q2"?70:30,lim=max*.25,d=Math.abs(Number(e.eval1)-Number(e.eval2));badges.insertAdjacentHTML("beforeend",`<span class="p4-pill ${d<=lim?"ok":"warn"}">${d<=lim?"A1/A2 convergentes":"A1/A2 divergentes"}</span>`)}}
    })
  }

  const baseLive=window.CGU_p4Live;
  if(baseLive)window.CGU_p4Live=function(){const r=baseLive.apply(this,arguments);enhanceLive();return r};
  const baseType=window.CGU_p4TypeChanged;
  if(baseType)window.CGU_p4TypeChanged=function(){const r=baseType.apply(this,arguments);updateTypeLimits();updateConvergence();enhanceLive();return r};
  const baseEdit=window.CGU_p4Edit;
  if(baseEdit)window.CGU_p4Edit=function(id){activeEditId=id;const r=baseEdit.apply(this,arguments);setTimeout(()=>enhanceForm(entryById(id)),0);return r};
  const baseCancel=window.CGU_p4CancelEdit;
  if(baseCancel)window.CGU_p4CancelEdit=function(){activeEditId=null;const r=baseCancel.apply(this,arguments);setTimeout(()=>enhanceForm(null),0);return r};
  const baseDelete=window.CGU_p4Delete;
  if(baseDelete)window.CGU_p4Delete=function(id){if(activeEditId===id)activeEditId=null;return baseDelete.apply(this,arguments)};
  const baseSave=window.CGU_p4Save;
  if(baseSave)window.CGU_p4Save=function(){
    const extra=extrasFromForm(),ev=evaluation(),training=!!document.getElementById("p4-training")?.checked,before=new Set(entries().map(e=>e.id));
    if(!training&&ev.need3&&ev.a1!=null&&ev.a2!=null){alert("As notas A1 e A2 não convergiram. Informe a 3ª correção antes de usar este registro como simulado válido.");return}
    if(ev.nc!=null){const nc=document.getElementById("p4-nc");if(nc)nc.value=Number(ev.nc.toFixed(2))}
    const editId=activeEditId;const r=baseSave.apply(this,arguments);activeEditId=null;
    setTimeout(()=>{const arr=entries();let id=editId;if(!id){const created=arr.filter(e=>!before.has(e.id)).sort((a,b)=>Number(b.updatedAtMs||0)-Number(a.updatedAtMs||0));id=created[0]?.id||[...arr].sort((a,b)=>Number(b.updatedAtMs||0)-Number(a.updatedAtMs||0))[0]?.id}if(id)persistExtras(id,extra);setTimeout(()=>{window.CGU_renderDiscursiveTracker?.();enhanceRules();enhanceHistory()},0)},0);return r;
  };

  function installStyle(){if(document.getElementById("p4EnhanceStyle"))return;const s=document.createElement("style");s.id="p4EnhanceStyle";s.textContent=`.p4-extra-source{grid-column:span 2}.p4-evaluators{border:1px dashed #cbd5e1;border-radius:9px;padding:9px;margin-top:10px}.p4-evaluators summary{cursor:pointer;font-size:10px;font-weight:900;color:#17365D}.p4-enh-note{font-size:8px;color:#64748b;line-height:1.4;margin:7px 0}.p4-eval-grid{display:grid;grid-template-columns:1fr 1fr 1fr 1.5fr;gap:7px;align-items:end}.p4-convergence{border:1px solid #e5e7eb;border-radius:8px;background:#fff;padding:7px}.p4-convergence span,.p4-convergence b,.p4-convergence small,.p4-convergence strong{display:block}.p4-convergence span{font-size:7px;color:#64748b;text-transform:uppercase;font-weight:900}.p4-convergence b{font-size:10px;color:#17365D;margin:2px 0}.p4-convergence small{font-size:7px;color:#64748b;line-height:1.3}.p4-convergence strong{font-size:8px;margin-top:4px}.p4-convergence.ok{border-color:#86efac;background:#f0fdf4}.p4-convergence.warn{border-color:#fdba74;background:#fff7ed}.p4-extra-live{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:7px}.p4-extra-live span,.p4-extra-live b,.p4-extra-live small{display:block}.p4-extra-live span{font-size:7px;text-transform:uppercase;color:#64748b;font-weight:900}.p4-extra-live b{font-size:14px;color:#17365D;margin:3px 0}.p4-extra-live small{font-size:7px;color:#64748b}@media(max-width:1050px){.p4-eval-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:650px){.p4-extra-source{grid-column:1/-1}.p4-eval-grid{grid-template-columns:1fr 1fr}}`;document.head.appendChild(s)}

  installStyle();enhanceRules();enhanceForm(activeEditId?entryById(activeEditId):null);enhanceHistory();
  const form=document.getElementById("p4Form");if(form)new MutationObserver(()=>{if(!internal)setTimeout(()=>enhanceForm(activeEditId?entryById(activeEditId):null),0)}).observe(form,{childList:true,subtree:false});
  const rules=document.getElementById("p4Rules");if(rules)new MutationObserver(()=>setTimeout(enhanceRules,0)).observe(rules,{childList:true});
  const hist=document.getElementById("p4History");if(hist)new MutationObserver(()=>setTimeout(enhanceHistory,0)).observe(hist,{childList:true});
})();