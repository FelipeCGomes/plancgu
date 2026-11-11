// Teste de navegação em DOM real (jsdom), sem Firebase nem credenciais reais.
// Executar após npm i --no-save jsdom@26: node --test tests/ui.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve, dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {JSDOM, ResourceLoader, VirtualConsole} from "jsdom";

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const source=()=>readFileSync(resolve(ROOT,"index.html"),"utf8")
  // A suíte é offline e não tenta autenticar, ler ou modificar Firebase.
  .replace(/<script src="firebase\.js[^"]*" defer><\/script>/,"")
  .replace(/<script src="auth\.js[^"]*" defer><\/script>/,"");

class LocalResources extends ResourceLoader {
  fetch(url){
    const u=new URL(url);
    if(u.hostname!=="cgu.test")return null;
    const path=decodeURIComponent(u.pathname).replace(/^\/+/,"");
    try{return Promise.resolve(readFileSync(resolve(ROOT,path)))}
    catch(e){return Promise.reject(new Error("Recurso local não encontrado: "+path))}
  }
}

async function openApp(storage={}){
  const errors=[],vc=new VirtualConsole();
  vc.on("jsdomError",e=>{
    if(!String(e.message).includes("Could not parse CSS stylesheet"))errors.push("JSDOM: "+String(e.cause?.stack||e.detail?.stack||e.stack||e.message));
  });
  const dom=new JSDOM(source(),{
    url:"https://cgu.test/index.html",
    runScripts:"dangerously",
    resources:new LocalResources(),
    pretendToBeVisual:true,
    virtualConsole:vc,
    beforeParse(w){
      for(const [k,v] of Object.entries(storage))w.localStorage.setItem(k,v);
      w.scrollTo=()=>{};
      w.Element.prototype.scrollIntoView=()=>{};
      w.alert=s=>errors.push("ALERT: "+s);
      w.confirm=()=>true;
      w.requestIdleCallback=fn=>setTimeout(fn,0);
      w.matchMedia=()=>({matches:false,addListener:()=>{},removeListener:()=>{}});
      w.addEventListener("error",e=>errors.push("window: "+String(e.error?.stack||e.message)));
    }
  });
  await new Promise((done,fail)=>{
    const timer=setTimeout(()=>fail(new Error("Não carregou todos os módulos em 30 segundos. "+errors.join(" | "))),30000);
    dom.window.addEventListener("cgu-app-ready",()=>{clearTimeout(timer);done()},{once:true});
  });
  return {dom,window:dom.window,document:dom.window.document,errors};
}
function nav(w,name){
  const b=w.document.querySelector('.nav button[data-page="'+name+'"]');
  assert.ok(b,"Aba "+name+" ausente do menu");
  w.switchPage(name,b);
  assert.ok(w.document.getElementById("page-"+name)?.classList.contains("active"),"Aba "+name+" não ficou ativa");
}
function savedStorage(w){
  return Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)]));
}

test("App completo: abertura, navegação, rodadas, revisão, P4, 34 dias e recarga offline", {timeout:90000},async()=>{
  let first=await openApp();
  try{
    const {window:w,document:d,errors}=first;
    const pages=["dashboard","edital","revisar","discursiva","sprint28","cronograma"];
    for(const name of pages){
      nav(w,name);
      assert.ok(d.getElementById("page-"+name));
    }
    for(const name of ["CGU_saveQuestionRound","CGU28_saveQuestions","CGU28_saveMock","CGU_p4Save","CGU_questionRoundMinimum"])
      assert.equal(typeof w[name],"function",name+" não instalado");

    nav(w,"sprint28");
    assert.match(d.getElementById("page-sprint28").textContent,/Meta objetiva: 210\/260 · Meta P4: 85\/100/);
    assert.equal(d.querySelectorAll("#s28GoalTracker .s28-goal-tile").length,4);
    const verseCard=d.getElementById("s28VerseCard");
    assert.ok(verseCard, "Card de versículo do dia ausente");
    const header=d.querySelector("#page-sprint28 > .hero");
    assert.equal(header?.nextElementSibling?.id,"s28VerseCard","Card não está logo abaixo do título");
    w.CGU28_select("2026-11-10");
    assert.match(verseCard.textContent,/Josué 1:9/);
    w.CGU28_select("2026-11-11");
    assert.match(verseCard.textContent,/Provérbios 3:5/);
    w.CGU28_select("2026-12-13");
    assert.match(verseCard.textContent,/Salmos 121:8/);
    assert.ok(verseCard.querySelector('a[href*="bibliaalmeida.com/salmos/121/"]'));
    assert.match(d.getElementById("s28Daily").textContent,/Dia/);
    w.CGU28_select("2026-11-10");
    assert.equal(d.querySelectorAll('#s28Daily .s34-session').length,2,"Manhã e noite precisam ser blocos distintos");
    const morningInitial=d.querySelector('#s28Daily .s34-session[data-session="morning"]');
    const eveningInitial=d.querySelector('#s28Daily .s34-session[data-session="evening"]');
    assert.ok(morningInitial?.textContent.includes("Manhã · 04h00–05h20"));
    assert.ok(eveningInitial?.textContent.includes("Noite · 18h00–20h00"));
    assert.equal(morningInitial.open,true,"Manhã pendente deve iniciar expandida");
    w.CGU28_toggle("2026-11-10","morning-review");
    w.CGU28_toggle("2026-11-10","morning-study");
    const morningContent=d.querySelector('#s28Daily [data-task="morning-study"] .s28-topic')?.textContent;
    assert.ok(morningContent?.length>10);
    assert.match(d.querySelector('#s28Daily .s34-session[data-session="morning"] .s34-session-count').textContent,/2\/3/);
    assert.ok(d.querySelector('#s28Daily .s34-session[data-session="evening"]'));
    assert.ok(d.querySelector('#s28Daily [data-guide="recall"]'),"Roteiro de recuperação ativa ausente");
    const q1Guide=d.querySelector('#s28Daily [data-guide="q1"]');
    assert.ok(q1Guide,"Sugestão temática para Q1 ausente");
    assert.match(q1Guide.textContent,/Texto motivador/);
    assert.match(q1Guide.textContent,/Proposta de redação/);
    const suggestedTheme=q1Guide.querySelector(".s28-guide-subject")?.firstChild?.textContent?.trim();
    assert.ok(suggestedTheme?.length>8);
    w.CGU28_openP4("q1","2026-11-10",15,true);
    await new Promise(done=>setTimeout(done,80));
    assert.equal(d.getElementById("p4-theme")?.value,suggestedTheme,"Tema não foi levado ao formulário P4");
    assert.equal(d.getElementById("p4-training")?.checked,true,"Treino curto não está formativo");
    nav(w,"sprint28");
    w.CGU28_select("2026-11-12");
    const q2Guide=d.querySelector('#s28Daily [data-guide="q2"]');
    assert.ok(q2Guide,"Sugestão temática para estudo de caso Q2 ausente");
    assert.match(q2Guide.textContent,/Comando do estudo de caso/);
    w.CGU28_select("2026-12-11");
    const day=d.getElementById("s28Daily");
    assert.match(day.textContent,/85 itens/);
    assert.match(day.textContent,/15 linhas/);
    assert.match(day.textContent,/30 linhas/);
    w.CGU28_select("2026-11-10");

    nav(w,"edital");
    const wrapper=d.querySelector('#editalList .question-rounds[data-rounds-for]');
    assert.ok(wrapper,"Não há formulário de rodada no Edital");
    const topicId=wrapper.dataset.roundsFor;
    const toggle=wrapper.querySelector('button[onclick*="CGU_toggleQuestionRound"]');
    assert.ok(toggle,"Botão Adicionar rodada ausente");
    w.CGU_toggleQuestionRound(topicId,toggle);
    const form=wrapper.querySelector(".question-round-form");
    assert.ok(form&&!form.hidden,"Formulário não abriu");
    const before=(w.getTS(topicId).questionRounds||[]).length;
    const q=form.querySelector('[data-round-field="q"]'),a=form.querySelector('[data-round-field="a"]'),b=form.querySelector('[data-round-field="b"]');
    assert.ok(q&&a&&b);
    q.value="20";a.value="10";b.value="0";
    const submit=form.querySelector('button[onclick*="CGU_saveQuestionRound"]');
    assert.ok(submit,"Botão salvar rodada ausente");
    w.CGU_saveQuestionRound(topicId,submit);
    assert.equal((w.getTS(topicId).questionRounds||[]).length,before+1);
    assert.equal(w.getTS(topicId).questionRounds.at(-1).erros,10);

    nav(w,"revisar");
    assert.ok(d.querySelector("#reviewList")?.textContent.includes("Revisar")||d.querySelector("#reviewList .review-card"),"Aba Revisar não atualizou");
    nav(w,"dashboard");
    assert.ok(d.getElementById("cguWeightedExam"),"Projeção por P1/P2/P3 ausente");

    nav(w,"discursiva");
    const must=["p4-date","p4-type","p4-training","p4-theme","p4-nc","p4-lines"];
    for(const id of must)assert.ok(d.getElementById(id),"Campo P4 "+id+" ausente");
    d.getElementById("p4-date").value="2026-11-14";
    d.getElementById("p4-type").value="q1";
    d.getElementById("p4-training").checked=true;
    d.getElementById("p4-theme").value="Regressão fictícia da aplicação";
    d.getElementById("p4-lines").value="15";
    d.getElementById("p4-nc").value="20";
    w.CGU_p4Save();
    assert.ok(w.CGU_P4Store.read().entries.some(e=>e.theme==="Regressão fictícia da aplicação"));

    const previousState=savedStorage(w);
    assert.ok(Object.keys(previousState).some(k=>k.includes("discursive")));
    first.dom.window.close();
    first=null;

    const second=await openApp(previousState);
    try{
      nav(second.window,"discursiva");
      assert.ok(second.window.CGU_P4Store.read().entries.some(e=>e.theme==="Regressão fictícia da aplicação"),"P4 desapareceu após recarga");
      const roundAfter=second.window.getTS(topicId).questionRounds||[];
      assert.equal(roundAfter.length,before+1,"Rodada desapareceu após recarga");
      nav(second.window,"sprint28");
      second.window.CGU28_select("2026-11-10");
      assert.ok(second.document.getElementById("s28Daily"));
      assert.equal(second.document.querySelectorAll('#s28Daily .s34-session').length,2);
      assert.match(second.document.querySelector('#s28Daily .s34-session[data-session="morning"] .s34-session-count').textContent,/2\/3/);
      assert.equal(second.document.querySelector('#s28Daily [data-task="morning-study"] .s28-topic')?.textContent,morningContent,"A aula da manhã mudou após recarga");
      assert.equal(second.errors.filter(e=>!e.startsWith("ALERT:")).length,0,"Erros JS na recarga: "+second.errors.join(" | "));
    }finally{second.dom.window.close();}
    assert.equal(errors.filter(e=>!e.startsWith("ALERT:")).length,0,"Erros JS no teste: "+errors.join(" | "));
  }finally{if(first)first.dom.window.close();}
});
