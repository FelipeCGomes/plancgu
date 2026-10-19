/* Complemento da tela Plano de estudo: mínimo de questões + indicação objetiva da aula. */

const ADAPTIVE_AULA_GUIDE={
  "Redes e Comunicação":{
    titulo:"Redes e Comunicação — TCP/IP e OSI, IPv4/IPv6, DNS, DHCP e roteamento",
    foco:"Comece por modelos TCP/IP e OSI; depois IPv4 e IPv6, DNS, DHCP, roteamento, segmentação, balanceamento e qualidade de serviço.",
    depois:"Se o Gran dividir o assunto em mais de uma aula, avance depois para redes locais/sem fio/WAN, comunicação nuvem ↔ ambiente local e diagnóstico de falhas, latência e gargalos."
  },
  "Sistemas e Diretórios":{
    titulo:"Windows e Linux — processos, serviços, permissões, usuários, grupos e diretórios",
    foco:"Priorize administração de Windows e Linux, processos/serviços, permissões, usuários, grupos e diretórios.",
    depois:"Depois avance para configuração, atualizações/correções, servidores de aplicação, serviços web, diagnóstico e conformidade."
  },
  "Armazenamento":{
    titulo:"Armazenamento — bloco, arquivo e objeto; desempenho, disponibilidade e proteção",
    foco:"Estude primeiro armazenamento em bloco, arquivo e objeto, local e em nuvem, comparando capacidade, desempenho e disponibilidade.",
    depois:"Depois avance para segregação de acesso, retenção/descarte e escolha de arquitetura conforme a carga de trabalho."
  },
  "Plataformas de Bancos de Dados":{
    titulo:"Bancos de dados — relacional, NoSQL, transações, replicação, índices e desempenho",
    foco:"Comece por bancos relacionais, documentais, chave-valor, cache e busca textual; depois transações, concorrência, logs e replicação.",
    depois:"Finalize com índices, planos de execução, diagnóstico de desempenho, segurança e recuperação."
  },
  "SQL e Sustentação de Dados":{
    titulo:"SQL — DDL/DML, transações, joins, agregações, privilégios e bloqueios",
    foco:"Priorize definição/manipulação de dados, controle de acesso, transações, filtros, junções e agregações.",
    depois:"Depois avance para privilégios, bloqueios, consistência, integrações e dependências de serviços de dados."
  },
  "Modelos e Arquitetura de Nuvem":{
    titulo:"Nuvem — IaaS, PaaS, SaaS, modelos de implantação e responsabilidade compartilhada",
    foco:"Estude IaaS/PaaS/SaaS, modelos de implantação e responsabilidade compartilhada.",
    depois:"Depois avance para redes virtuais, integração híbrida, elasticidade, escalabilidade, portabilidade e dependências entre serviços."
  },
  "Virtualização e Contêineres":{
    titulo:"Virtualização e Contêineres — VMs, Docker/Kubernetes, isolamento, redes e persistência",
    foco:"Comece por máquinas virtuais versus contêineres, isolamento, recursos, persistência e redes.",
    depois:"Depois avance para orquestração, escalonamento, atualização, recuperação, segurança e disponibilidade."
  },
  "Arquiteturas de Serviços":{
    titulo:"Arquiteturas de Serviços — balanceamento, serverless, filas e tolerância a falhas",
    foco:"Priorize balanceamento, serviços gerenciados, eventos/serverless, filas e comunicação entre serviços.",
    depois:"Depois avance para tolerância a falhas, continuidade e decisão entre operação própria e serviços contratados."
  },
  "Infraestrutura como Código":{
    titulo:"Infraestrutura como Código — versionamento, configuração, idempotência e CI/CD",
    foco:"Estude versionamento, gestão de configuração, automação, estado desejado, repetibilidade e idempotência.",
    depois:"Depois avance para segregação de ambientes, proteção de credenciais, CI/CD, validação e rollback."
  },
  "Migração e Modernização":{
    titulo:"Migração para nuvem — dependências, portabilidade, sincronização, testes e rollback",
    foco:"Comece por dependências, compatibilidade, portabilidade e transição entre ambiente local e nuvem.",
    depois:"Depois avance para transferência/sincronização de dados, testes, continuidade, reversibilidade, dimensionamento e custos."
  },
  "Riscos e Arquitetura de Segurança":{
    titulo:"Segurança — ameaças, vulnerabilidades, zero trust, firewall, IPS/WAF e DDoS",
    foco:"Comece por ameaças, vulnerabilidades, superfície de ataque, defesa em profundidade e zero trust.",
    depois:"Depois avance para segmentação, firewall, IPS, WAF, proteção contra DDoS, acesso remoto seguro e controles em nuvem."
  },
  "Identidades e Proteção Criptográfica":{
    titulo:"IAM e Criptografia — MFA, SSO, privilégios, federação, chaves e certificados",
    foco:"Priorize autenticação/autorização, MFA, SSO, acessos privilegiados, menor privilégio e segregação de funções.",
    depois:"Depois avance para federação, segredos, chaves, certificados, assinatura digital e criptografia em trânsito/repouso."
  },
  "Vulnerabilidades e Operação de Segurança":{
    titulo:"Operação de Segurança — vulnerabilidades, endpoints, SIEM/SOC, threat intel e DLP",
    foco:"Comece por inventário/exposição de ativos e gestão de vulnerabilidades, correções e testes autorizados.",
    depois:"Depois avance para endpoint protection, correlação de eventos, SOC, inteligência de ameaças e prevenção de vazamento."
  },
  "Resposta a Incidentes":{
    titulo:"Resposta a Incidentes — detecção, contenção, recuperação, evidências e causa raiz",
    foco:"Estude o ciclo de detecção, análise, contenção, recuperação e comunicação.",
    depois:"Depois avance para responsabilidades, preservação de evidências, registros/trilhas, causa raiz e melhoria de controles."
  },
  "Privacidade e Proteção Operacional":{
    titulo:"Privacidade Operacional — minimização, segregação, retenção e pseudonimização",
    foco:"Priorize minimização, segregação, controle de acesso e proteção de dados pessoais em armazenamento, cópias, logs e integrações.",
    depois:"Depois avance para retenção/descarte, pseudonimização, reidentificação e proteção de contêineres/interfaces com IA."
  },
  "Continuidade e Recuperação":{
    titulo:"Continuidade — BIA, backup, DR, restauração, RTO e RPO",
    foco:"Comece por análise de impacto, redundância, recuperação de desastre e estratégias de backup.",
    depois:"Depois avance para retenção/isolamento, testes de restauração, RTO/RPO e dependência de fornecedores críticos."
  },
  "Confiabilidade e Observabilidade":{
    titulo:"Observabilidade — logs, métricas, traces, SLI/SLO, disponibilidade e diagnóstico",
    foco:"Priorize logs, métricas, rastreamento distribuído, indicadores e objetivos de serviço.",
    depois:"Depois avance para capacidade, latência, disponibilidade, tolerância a falhas, monitoramento e correlação de eventos."
  },
  "Capacidade, Custos e Infraestrutura de IA":{
    titulo:"Infraestrutura de IA — capacidade, aceleradores, disponibilidade, cotas e custos de nuvem",
    foco:"Comece por dimensionamento de CPU/memória/armazenamento/aceleradores e disponibilidade de modelos/agentes.",
    depois:"Depois avance para limites de consumo, latência, isolamento, custos, cotas, FinOps e efeitos da degradação."
  },
  "Gestão de Serviços e Mudanças":{
    titulo:"Gestão de Serviços — incidentes, problemas, configuração, mudanças, rollback e DevSecOps",
    foco:"Priorize demandas, capacidade, níveis de serviço, incidentes, problemas, configuração e mudanças.",
    depois:"Depois avance para reversão, integração dev/ops/security, Scrum/Kanban, acompanhamento e melhoria contínua."
  },
  "Governança e Controle":{
    titulo:"Governança de TI — PDTIC, transformação digital, riscos, indicadores e controles",
    foco:"Comece por alinhamento institucional, responsabilidades, portfólio, prioridades e indicadores.",
    depois:"Depois avance para PDTIC, transformação digital, dados abertos, riscos, evidências e articulação gestão/fiscalização/auditoria."
  },
  "Contratações e Gestão de Fornecedores":{
    titulo:"Contratações de TI — ETP, TR, TCO, pesquisa de preços, SLA e fiscalização",
    foco:"Priorize necessidade, estudo técnico preliminar, termo de referência, viabilidade, capacidade e custo total de propriedade.",
    depois:"Depois avance para pesquisa de preços, SLA, aceite, fiscalização, pagamento, portabilidade, continuidade e plano de saída."
  }
};

function adaptiveAulaGuide(main){
  return ADAPTIVE_AULA_GUIDE[main.g.nome] || {
    titulo:`${main.g.nome} — aula correspondente ao tópico atual do edital`,
    foco:main.t,
    depois:"No Gran, procure a aula cujo título/conteúdo corresponda a este tópico. Se houver mais de uma, siga a ordem do curso até completar o tempo reservado."
  };
}

/* Quando ainda não existe uma aula exata cadastrada em LESSONS, não mostramos só a matéria:
   mostramos exatamente qual conteúdo/aula procurar no Gran. */
adaptiveCustomCard=function(main,flow,alloc){
  const guide=adaptiveAulaGuide(main);
  const material=(main.m.s.aula||"").trim();
  const shownTitle=material || guide.titulo;
  return `<div class="lesson-card ${flow.customDone?"done":""}">
    <div class="lesson-top">
      <div class="lesson-title">▶ Aula a assistir agora: ${escapeHtml(shownTitle)}</div>
      <span class="badge ${priClass(main.priority)}">${main.priority}</span><span class="badge ${examClass(main.exam)}">${main.exam}</span>
    </div>
    <div class="lesson-meta">Gran → ${escapeHtml(main.d.nome)} → ${escapeHtml(main.g.nome)} · reservar até ${alloc.video} min</div>
    <div style="margin-top:10px;padding:10px;border:1px solid #dbeafe;background:#eff6ff;border-radius:9px">
      <div class="small" style="color:#17365D"><b>O que procurar no Gran:</b> ${escapeHtml(guide.foco)}</div>
      <div class="small" style="margin-top:6px"><b>Sequência:</b> ${escapeHtml(guide.depois)}</div>
    </div>
    <div class="small" style="margin-top:8px"><b>Por que entrou hoje:</b> ${escapeHtml(adaptiveReason(main))}</div>
    <div class="custom-study-actions"><button class="primary" onclick="markAdaptiveCustomDone(${!flow.customDone})">${flow.customDone?"Reabrir bloco":"✓ Marcar bloco assistido"}</button></div>
    ${adaptiveQuestionControls(main,"custom",0,1,flow)}
  </div>`;
};

function adaptiveMinQuestions(main){
  const m=main.m;
  if(!m.q) return 10;
  if(m.status==="Revisar"){
    const gap=m.meta-m.liquido;
    if(gap>=20) return 20;
    if(gap>=10) return 15;
    return 15;
  }
  if(m.liquido>=m.meta+15) return 20;
  return 15;
}

function adaptiveQuestionTargetText(main){
  const min=adaptiveMinQuestions(main);
  const m=main.m;
  if(!m.q) return `Conteúdo novo: faça no mínimo ${min} questões para criar uma primeira amostra.`;
  if(m.status==="Revisar") return `Recuperação: faça no mínimo ${min} questões antes de liberar a próxima matéria.`;
  if(m.liquido>=m.meta+15) return `Manutenção: faça no mínimo ${min} questões para confirmar que o desempenho continua estável.`;
  return `Consolidação: faça no mínimo ${min} questões antes de avançar.`;
}

adaptiveQuestionForm=function(main,lessonId){
  const min=adaptiveMinQuestions(main);
  return `<div class="lesson-question-box">
    <div class="lesson-question-head">
      <div class="lesson-question-title">📝 Registrar questões desta rodada</div>
      <div class="min-question-badge">Mínimo hoje: ${min} questões</div>
    </div>
    <div class="min-question-help">${escapeHtml(adaptiveQuestionTargetText(main))}</div>
    <div class="lesson-question-grid">
      <div><label>Total</label><input id="${qInputId("q-total",lessonId)}" type="number" min="${min}" inputmode="numeric" placeholder="Mín.: ${min}"></div>
      <div><label>Acertos</label><input id="${qInputId("q-acertos",lessonId)}" type="number" min="0" inputmode="numeric" placeholder="Ex.: 12"></div>
      <div><label>Em branco</label><input id="${qInputId("q-brancos",lessonId)}" type="number" min="0" inputmode="numeric" placeholder="0"></div>
      <button type="button" onclick="registerAdaptiveQuestions('${main.id}','${lessonId||"custom"}')">Salvar questões</button>
    </div>
    <div class="small" style="margin-top:6px">Os erros são calculados automaticamente. O resultado atualiza Dashboard, Edital, Revisar e recalcula o próximo foco.</div>
  </div>`;
};

registerAdaptiveQuestions=function(topicId,lessonId){
  const main=topicById(topicId);
  if(!main){alert("Não foi possível localizar o tópico atual.");return}
  const min=adaptiveMinQuestions(main);
  const q=Number(document.getElementById(qInputId("q-total",lessonId))?.value||0);
  const a=Number(document.getElementById(qInputId("q-acertos",lessonId))?.value||0);
  const b=Number(document.getElementById(qInputId("q-brancos",lessonId))?.value||0);
  if(!Number.isFinite(q)||q<min){
    alert(`Para este bloco, faça pelo menos ${min} questões antes de avançar.`);
    return;
  }
  if(a<0||b<0||a+b>q){
    alert("Confira os valores: acertos + em branco não podem ultrapassar o total de questões.");
    return;
  }
  const cur=normalizeTopic(topicId);
  const novosErros=q-a-b;
  setTS(topicId,{
    questoes:cur.q+q,
    acertos:cur.a+a,
    erros:cur.e+novosErros,
    brancos:(cur.brancos||0)+b,
    lastQuestionDate:new Date().toISOString(),
    historico:false
  });
  const flow=readAdaptiveFlow();
  if(flow && flow.topicId===topicId){
    flow.questionRegistered=true;
    flow.questionSource="batch";
    flow.lastBatch={questoes:q,acertos:a,erros:novosErros,brancos:b,at:new Date().toISOString(),minimo:min};
    writeAdaptiveFlow(flow);
  }
  save();
  finishAdaptiveFlowIfReady();
  renderAll();
  toast(`${q} questões registradas: ${a} acertos, ${novosErros} erros${b?` e ${b} em branco`:""}.`);
};

try{renderToday();}catch(e){console.warn("Plano de estudo:",e)}
