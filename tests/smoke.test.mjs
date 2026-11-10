// Regressão offline do app CGU: node --test tests/smoke.test.mjs
// Somente dados fictícios. Não acessa Firebase real nem altera os dados do usuário.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, existsSync} from "node:fs";
import {resolve, dirname} from "node:path";
import {fileURLToPath} from "node:url";
import vm from "node:vm";

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const file=name=>readFileSync(resolve(ROOT,name),"utf8");
const parseContent=src=>JSON.parse(src.substring(src.indexOf("=")+1).trim().replace(/;\s*$/,""));

function mockTopics(){
  const datasets=["data-p1.js","data-p2.js","data-p3.js"].map(name=>parseContent(file(name)));
  const rows=[];
  for(const ds of datasets)for(const d of ds)for(const g of d.grupos){
    const atoms=g.topicos.flatMap(t=>{
      const parts=t.split(/\s+(?=\d+(?:\.\d+){1,2}\s+)/g).map(x=>x.trim()).filter(Boolean);
      const atomic=parts.filter(x=>/^\d+(?:\.\d+){1,2}\s+/.test(x));
      return atomic.length?atomic:[t];
    });
    atoms.forEach((t,i)=>{
      const slug=g.nome.toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-");
      rows.push({id:d.id+"_"+slug+"_"+i,d,g,t,exam:d.prova,priority:g.prioridade});
    });
  }
  assert.equal(new Set(rows.map(x=>x.id)).size,rows.length,"IDs atômicos repetidos");
  return rows;
}

function sprintHarness(){
  const rows=mockTopics(),topicState={},savedPlans={value:{}},alerts=[];
  const byId=id=>topicState[id]||{};
  const dom={form:null};
  const fakeDoc={
    getElementById:()=>null,
    querySelector:sel=>sel.includes("#s28Daily [data-task=")?dom.form:null,
    querySelectorAll:()=>[]
  };
  const events=[],snapshots=[];
  const appWindow={
    CGU_readDailyPlans:()=>savedPlans.value,
    CGU_writeDailyPlans:v=>{savedPlans.value=JSON.parse(JSON.stringify(v));snapshots.push(v)},
    CGU_questionRoundMinimum:()=>10,
    CGUFeedback:{begin:()=>{},complete:()=>{},cancel:()=>{}},
    addEventListener:()=>{},dispatchEvent:e=>events.push(e),
    scrollY:0
  };
  const topicsFlat=()=>rows.map(x=>{
    const s=byId(x.id),r=s.questionRounds?.at(-1);
    const q=r?.questoes||s.questoes||0,a=r?.acertos??s.acertos??0,e=r?.erros??s.erros??0,b=r?.brancos??s.brancos??0;
    const meta=x.exam==="P3"?80:x.exam==="P2"?75:70,liquido=q?100*(a-e)/q:null;
    return {...x,m:{q,a,e,b,meta,liquido,status:!q?"Pendente":liquido>=meta?"Atendeu":"Revisar",s:{done:!!s.done},histQ:s.questoes||0}};
  });
  const context={
    window:appWindow,document:fakeDoc,KEY:"cgu-regression-simulated",topicsFlat,
    getTS:byId,
    setTS:(id,p)=>topicState[id]={...byId(id),...p},
    save:()=>{},escapeHtml:v=>String(v),
    localStorage:{getItem:()=>null,setItem:()=>{}},
    toast:()=>{},alert:v=>alerts.push(v),
    CustomEvent:class{constructor(type,props){this.type=type;this.detail=props?.detail}},
    requestAnimationFrame:fn=>fn(),setTimeout,Date,console,Math
  };
  const source=file("sprint28.js").replace(/\s*setup\(\);\s*\}\)\(\);\s*$/,
    "\n  window.__test34={makeSchedule,load,progress,mockFields,resultsFor,goalSnapshot,verses:SPRINT_VERSES,dateAt,writingTheme,activeRecallHtml,guideHtml};\n})();");
  assert.ok(source.includes("window.__test34="),"Não foi possível neutralizar a montagem da interface para os testes");
  vm.runInNewContext(source,context,{filename:"sprint28.js",timeout:3000});
  return {api:context.window,__test:context.window.__test34,rows,topicState,savedPlans,alerts,events,dom};
}
function fields(total,correct,blank){
  const map={"[data-s28-q]":String(total),"[data-s28-a]":String(correct),"[data-s28-b]":String(blank)};
  return {querySelector:sel=>sel in map?{value:map[sel]}:null};
}
function halfCard(parts){
  return {querySelector(selector){
    const exam=selector.match(/data-s28-exam="(P[123])"/)?.[1];
    if(!exam)return null;
    return {querySelector:sel=>sel==="[data-s28-a]"?{value:String(parts[exam].a)}:
      sel==="[data-s28-b]"?{value:String(parts[exam].b)}:null};
  }};
}

test("Todos os arquivos JS do carregador existem e têm sintaxe válida",()=>{
  const idx=file("index.html"),loader=file("data.js");
  const direct=[...idx.matchAll(/<script[^>]+src="([^"]+)"/g)].map(x=>x[1].split("?")[0]);
  const dynamic=[...loader.matchAll(/loadScript\("([^"]+)"/g)].map(x=>x[1].split("?")[0]);
  const css=[...loader.matchAll(/addCss\("([^"]+)"/g)].map(x=>x[1].split("?")[0]);
  assert.ok(direct.length>=9,"Carregamento inicial incompleto");
  assert.ok(dynamic.length>=30,"Módulos dinâmicos inesperadamente ausentes");
  assert.equal(new Set([...direct,...dynamic]).size,direct.length+dynamic.length,"Script duplicado no carregamento");
  for(const p of [...direct,...dynamic]){assert.ok(existsSync(resolve(ROOT,p)),p+" ausente");assert.doesNotThrow(()=>new vm.Script(file(p),{filename:p}),p+" com erro de sintaxe")}
  for(const p of css)assert.ok(existsSync(resolve(ROOT,p)),p+" CSS ausente");
});

test("Os subitens atômicos do edital têm IDs únicos e provas válidas",()=>{
  const rows=mockTopics();
  assert.ok(rows.length>=150, "Menos tópicos do que o esperado");
  for(const x of rows)assert.ok(["P1","P2","P3"].includes(x.exam));
});

test("Ciclo 34 dias: horários, feriado, meio simulado e descanso sem sobrecarga",()=>{
  const {__test}=sprintHarness(),days=__test.makeSchedule();
  assert.equal(days.length,34);
  assert.equal(days.at(0).date,"2026-11-10");
  assert.equal(days.at(-1).date,"2026-12-13");
  for(const d of days){
    assert.equal(d.tasks.reduce((s,t)=>s+t.minutes,0),d.minutes,"Minutagem divergente: "+d.date);
    if(d.type==="weekday")assert.equal(d.minutes,200);
  }
  assert.equal(days.find(d=>d.date==="2026-11-20").type,"holiday");
  assert.equal(days.find(d=>d.date==="2026-11-28").tasks.find(t=>t.kind==="fullMock").minutes,300);
  assert.equal(days.find(d=>d.date==="2026-12-05").tasks.find(t=>t.kind==="fullDisc").minutes,210);
  assert.equal(days.find(d=>d.date==="2026-11-21").tasks.find(t=>t.kind==="writing").targetLines,60);
  assert.equal(days.find(d=>d.date==="2026-11-21").tasks.find(t=>t.kind==="writing").training,false);
  assert.equal(days.find(d=>d.date==="2026-11-22").tasks.find(t=>t.kind==="writing").training,false);
  assert.equal(days.find(d=>d.date==="2026-11-15").tasks.find(t=>t.kind==="writing").training,true);
  const last=days.find(d=>d.date==="2026-12-11");
  assert.equal(last.minutes,200);
  assert.deepEqual(Array.from(last.tasks.filter(t=>t.kind==="writing"),t=>t.targetLines),[15,30]);
  assert.equal(last.tasks.find(t=>t.kind==="halfMock").minutes,140);
  assert.equal(days.find(d=>d.date==="2026-12-12").minutes,60);
  assert.equal(days.at(-1).tasks.length,0);
});

test("34 versículos únicos vinculados às datas do intensivão",()=>{
  const {__test}=sprintHarness();
  const verses=Array.from(__test.verses);
  assert.equal(verses.length,34);
  assert.equal(new Set(verses.map(v=>v.book+" "+v.chapter+":"+v.verse)).size,34);
  assert.equal(__test.dateAt(0),"2026-11-10");
  assert.equal(__test.dateAt(33),"2026-12-13");
  assert.equal(verses[0].book,"Josué");
  assert.equal(verses[0].chapter,1);
  assert.equal(verses[0].verse,9);
  assert.equal(verses[33].book,"Salmos");
  assert.equal(verses[33].chapter,121);
  assert.equal(verses[33].verse,8);
  for(const verse of verses){
    assert.ok(verse.quote.length>=20, "Trecho muito curto: "+verse.book);
    assert.ok(verse.slug&&verse.chapter>0&&verse.verse>0);
  }
});

test("Professor de revisão: usa o tópico do dia e não inventa erros",()=>{
  const h=sprintHarness();
  const d=h.__test.makeSchedule()[0];
  const review=d.tasks.find(t=>t.id==="morning-review");
  const html=h.__test.guideHtml(d,review,{days:{},mocks:{}});
  assert.match(html,/O que revisar hoje/);
  assert.match(html,/0–2 min/);
  assert.match(html,/2–5 min/);
  assert.match(html,/5–8 min/);
  assert.match(html,/8–10 min/);
  assert.match(html,/ainda sem conclusão registrada|Primeiro dia/i);
  assert.match(html,/item C\/E/);
  assert.doesNotMatch(html,/Última rodada disponível: \d+ erro/);
});
test("Propostas de Q1 e Q2 usam conteúdo do Edital e roteiro proporcional às linhas",()=>{
  const h=sprintHarness(),days=h.__test.makeSchedule();
  const q1Day=days.find(d=>d.tasks.some(t=>t.kind==="writing"&&t.writingType==="q1"));
  const q2Day=days.find(d=>d.tasks.some(t=>t.kind==="writing"&&t.writingType==="q2"));
  const q1Task=q1Day.tasks.find(t=>t.kind==="writing"&&t.writingType==="q1");
  const q2Task=q2Day.tasks.find(t=>t.kind==="writing"&&t.writingType==="q2");
  const q1Html=h.__test.guideHtml(q1Day,q1Task,{days:{},mocks:{}});
  const q2Html=h.__test.guideHtml(q2Day,q2Task,{days:{},mocks:{}});
  for(const v of ["Tema sugerido Q1","Texto motivador","Proposta de redação","Palavras-chave","Como começar"]){
    assert.ok(q1Html.includes(v),v+" não aparece na Q1");
  }
  for(const v of ["Tema sugerido Q2","Situação-problema","Comando do estudo de caso","diagnóstico","Palavras-chave"]){
    assert.ok(q2Html.includes(v),v+" não aparece na Q2");
  }
  assert.match(q1Html,new RegExp("Roteiro de "+q1Task.targetLines+" linhas"));
  assert.match(q2Html,new RegExp("Roteiro de "+q2Task.targetLines+" linhas"));
  assert.equal(h.__test.writingTheme(q1Day,"q1").subject.includes("Fundamentos"),true);
  assert.equal(h.__test.writingTheme(q2Day,"q2").subject.length>10,true);
});
test("Questões lançadas no Intensivão preservam histórico e peso do tópico",()=>{
  const h=sprintHarness(),day=h.__test.makeSchedule()[0],t=day.tasks.find(x=>x.kind==="questions");
  assert.ok(t?.topicId);
  h.dom.form=fields(20,18,0);
  h.api.CGU28_saveQuestions(day.date,t.id);
  const state=h.topicState[t.topicId];
  assert.equal(state.questoes,20);assert.equal(state.acertos,18);
  assert.equal(state.erros,2);assert.equal(state.brancos,0);
  assert.equal(state.questionRounds.length,1);
  assert.equal(state.questionRounds[0].liquidoRodada,80);
  assert.equal(h.savedPlans.value.__sprint34V1.days[day.date].checks[t.id],true);
  assert.ok(h.events.some(e=>e.type==="cgu-question-recorded"));
});

test("Estudo concluído sincroniza a marcação do subitem e permite reabrir",()=>{
  const h=sprintHarness(),day=h.__test.makeSchedule()[0],t=day.tasks.find(x=>x.kind==="study");
  h.api.CGU28_toggle(day.date,t.id);assert.equal(h.topicState[t.topicId].done,true);
  h.api.CGU28_toggle(day.date,t.id);assert.equal(h.topicState[t.topicId].done,false);
});

test("Meio simulado de 85 itens usa P1 20/P2 20/P3 45, sem contaminar tópicos",()=>{
  const h=sprintHarness(),parts={P1:{a:17,b:0},P2:{a:16,b:0},P3:{a:38,b:0}};
  h.dom.form=halfCard(parts);
  h.api.CGU28_saveMock("2026-12-11","half-mock");
  const record=h.savedPlans.value.__sprint34V1.mocks["2026-12-11"]["half-mock"];
  assert.equal(record.max,130);
  assert.equal(record.parts.P1.q,20);assert.equal(record.parts.P2.q,20);assert.equal(record.parts.P3.q,45);
  assert.equal(record.parts.P1.net,14);assert.equal(record.parts.P2.net,12);assert.equal(record.parts.P3.net,62);
  assert.equal(record.total,88);
  assert.equal(Object.keys(h.topicState).length,0,"Meio simulado alterou a nota por tópico");
});

test("P4 mantém cópia dedicada e legado em dailyPlans ao salvar",()=>{
  const db=new Map(),p={};
  const storage={getItem:k=>db.get(k)||null,setItem:(k,v)=>db.set(k,v)};
  const win={CGU_readDailyPlans:()=>p.value||{},CGU_writeDailyPlans:v=>p.value=v,addEventListener:()=>{},dispatchEvent:()=>{}};
  const ctx={KEY:"cgu-p4-test",window:win,localStorage:storage,CustomEvent:class{constructor(n){this.type=n}},Date,console};
  vm.runInNewContext(file("discursive-persistence.js"),ctx);
  win.CGU_P4Store.write({version:1,entries:[{id:"fake-p4",date:"2026-12-11",type:"q1",training:true,lines:15}],updatedAtMs:Date.now()});
  const d=JSON.parse(db.get("cgu-p4-test-discursive-p4-v1"));
  assert.equal(d.entries.length,1);
  assert.equal(p.value.__discursiveTrackerV1.entries[0].id,"fake-p4");
  assert.equal(win.CGU_P4Store.read().entries[0].training,true);
});

test("Firestore recebe no snapshot o estado e o calendário da reta final",()=>{
  const k="cloud-check",storage=new Map(),record=[];
  const plans={__sprint34V1:{version:2,days:{"2026-11-10":{locked:true}},mocks:{},updatedAtMs:123}};
  storage.set(k+"-daily-plans-v1",JSON.stringify(plans));
  const listeners={};
  const win={addEventListener:(name,fn)=>(listeners[name]??=[]).push(fn),dispatchEvent:()=>{},
    FirebaseCGU:{scheduleSync:s=>record.push(s)}};
  const ctx={window:win,localStorage:{getItem:ky=>storage.get(ky)||null,setItem:(ky,v)=>storage.set(ky,v)},
    KEY:k,state:{mock:{questoes:20,acertos:18,brancos:0,erros:2}},settings:{P3:80},
    lessonState:{},DEFAULT_META:{P1:70,P2:75,P3:80},save:()=>{},ensureKnownHistory:()=>{},
    Date,console,CustomEvent:class{constructor(type,props){this.type=type;this.detail=props?.detail}}};
  vm.runInNewContext(file("cloud-sync.js"),ctx);
  assert.ok(listeners["cgu-plan-changed"]);
  listeners["cgu-plan-changed"][0]();
  assert.equal(record.at(-1).dailyPlans.__sprint34V1.days["2026-11-10"].locked,true);
  ctx.save();
  assert.equal(record.at(-1).state.mock.questoes,20);
  assert.equal(record.at(-1).state.mock.erros,2);
});

test("Metas competitivas: 210/260 objetiva e 85/100 P4, sem alterar máximos oficiais",()=>{
  const h=sprintHarness();
  const g=h.__test.goalSnapshot();
  assert.equal(Object.values(g.blocks).reduce((sum,v)=>sum+v.goal,0),210);
  assert.equal(g.blocks.P1.max,40);
  assert.equal(g.blocks.P2.max,40);
  assert.equal(g.blocks.P3.max,180);
  assert.equal(g.objective,null,"Sem amostras completas, não deve inventar nota.");
  assert.equal(g.p4,null,"Sem Q1 e Q2 válidas, não deve inventar média.");

  // Q1 = 25,5/30; Q2 = 59,5/70; juntas alcançam o alvo de 85/100.
  h.savedPlans.value.__discursiveTrackerV1={entries:[
    {id:"q1-valid",date:"2026-11-22",type:"q1",training:false,lines:30,nc:25.5,spelling:0,syntax:0,vocab:0,otherLang:0},
    {id:"q2-valid",date:"2026-11-22",type:"q2",training:false,lines:60,nc:59.5,spelling:0,syntax:0,vocab:0,otherLang:0},
    {id:"short-train",date:"2026-12-11",type:"q1",training:true,lines:15,nc:30}
  ]};
  const after=h.__test.goalSnapshot();
  assert.equal(after.q1,25.5);
  assert.equal(after.q2,59.5);
  assert.equal(after.p4,85);
});

test("A rota principal mostra 34 dias e a projeção não mistura pesos",()=>{
  const idx=file("index.html"),sprint=file("sprint28.js"),score=file("weighted-score-ui.js");
  assert.ok(idx.includes('data-page="sprint28"'));
  assert.ok(idx.includes("Plano intensivão · 34 dias"));
  assert.ok(sprint.includes("else if(name===\"dashboard\")"),"Dashboard precisa atualizar ao entrar");
  assert.ok(score.includes("P1:40,P2:40,P3:180"));
  assert.ok(score.includes("items.every(x=>x.q>=10)"),"Projeção requer amostra mínima em cada bloco");
});
