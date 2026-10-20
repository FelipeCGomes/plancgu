/* Modelo atômico do edital.
   Cada subitem numerado (1.1, 1.2, 1.3, 4.2.1...) vira um tema independente,
   com métricas e prioridade estratégica próprias. Executa antes de app-core.js. */
(() => {
  const subjects=[...EDITAL_P1,...EDITAL_P2,...EDITAL_P3];
  const meta={};

  // Deve ser idêntico ao slug() de app-core.js para que todos os módulos apontem para o mesmo topicId.
  function slugLocal(s){return String(s||"").toLowerCase().replace(/[^a-z0-9]/g,'-').replace(/-+/g,'-');}
  function atomicId(d,g,i){return d.id+"_"+slugLocal(g.nome)+"_"+i;}

  function splitAtomic(text){
    const src=String(text||"").trim();
    if(!src)return [];
    const parts=src.split(/\s+(?=\d+(?:\.\d+){1,2}\s+)/g).map(x=>x.trim()).filter(Boolean);
    const atoms=parts.filter(x=>/^\d+(?:\.\d+){1,2}\s+/.test(x));
    return atoms.length?atoms:[src];
  }

  function codeOf(text){const m=String(text||"").match(/^(\d+(?:\.\d+){1,2})\s+/);return m?m[1]:"";}
  function titleOf(text){
    let s=String(text||"").replace(/^\d+(?:\.\d+){1,2}\s+/,"").trim();
    if(s.length>150)s=s.slice(0,147).trim()+"…";
    return s;
  }

  function strategicPriority(d,g,text){
    let score={"Crítica":82,"Alta":67,"Média":50,"Baixa":32}[g.prioridade]??45;
    score+=d.prova==="P3"?8:d.prova==="P2"?4:0;
    const s=String(text||"").toLowerCase();
    const critical=[
      /auditoria/,/risco/,/controle interno/,/seguran/,/vulnerab/,/criptograf/,/autentica/,/autoriza/,/identidad/,/incidente/,/continuidade/,/recupera/,/cópias de segurança|backup/,/firewall|waf|zero trust/,/roteamento|tcp\/ip|osi|ipv4|ipv6|dns|dhcp/,/virtualiza|contêiner|orquestra/,/infraestrutura como código|idempot/,/transaç|replicaç|índices|planos de execução/,/logs|métricas|rastreamento distribuído/,/níveis de serviço|incidentes, problemas|mudanças e reversão/,/contrataç|termo de referência|estudo técnico preliminar/
    ];
    const important=[
      /governan/,/integridade/,/transpar/,/acesso à informação|lai/,/responsabiliza/,/evidência/,/ouvidoria/,/lgpd|dados pessoais/,/direitos fundamentais|devido processo|administração pública/,/nuvem|iaas|paas|saas|serverless/,/sql|bancos de dados|armazenamento/,/disponibilidade|latência|capacidade|desempenho/
    ];
    if(critical.some(r=>r.test(s)))score+=12;
    else if(important.some(r=>r.test(s)))score+=7;
    if(score>=88)return "Crítica";
    if(score>=68)return "Alta";
    if(score>=48)return "Média";
    return "Baixa";
  }

  function reasonFor(d,g,text,priority){
    const s=String(text||"").toLowerCase();
    let reason=d.prova==="P3"
      ? "P3 tem maior retorno na objetiva e pode alimentar o estudo de caso."
      : d.prova==="P2"
        ? "P2 alimenta a objetiva e a discursiva de conhecimentos complementares."
        : "P1 tem menor peso relativo, mas é necessário para evitar eliminação e sustentar a classificação.";
    if(/auditoria|controle|governan|risco|integridade|transpar|responsabiliza/.test(s))reason+=" Tema fortemente aderente à atuação institucional da CGU.";
    else if(/tcp\/ip|osi|ipv4|ipv6|dns|dhcp|roteamento|virtualiza|contêiner|seguran|incidente|logs|métricas|sql|banco/.test(s))reason+=" Tema técnico com boa capacidade de cobrança em itens C/E e situações operacionais.";
    return reason+` Prioridade estratégica: ${priority}.`;
  }

  subjects.forEach(d=>d.grupos.forEach(g=>{
    const original=[...(g.topicos||[])];
    const expanded=[];
    original.forEach(t=>splitAtomic(t).forEach(a=>expanded.push(a)));
    g._originalTopicos=original;
    g._atomicCount=expanded.length;
    g.topicos=expanded;
    expanded.forEach((t,i)=>{
      const id=atomicId(d,g,i);
      const priority=strategicPriority(d,g,t);
      meta[id]={
        id,
        code:codeOf(t),
        title:titleOf(t),
        fullText:t,
        parentGroup:g.nome,
        subject:d.nome,
        exam:d.prova,
        priority,
        reason:reasonFor(d,g,t,priority),
        legacyMulti:g._atomicCount>1
      };
    });
  }));

  window.ATOMIC_META=meta;
  window.ATOMIC_MODEL_VERSION=1;
})();
