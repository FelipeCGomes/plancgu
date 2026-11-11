/* CGU Cargo 3 — reta final de 34 dias (10/11 a 13/12/2026).
   Fonte: tópicos atômicos e métricas já salvas no aplicativo.
   Plano estratégico estimativo: frequência por tópico NÃO é publicada pelo Cebraspe.
   Persistência na mesma dailyPlans/__sprint34V1, já sincronizada no Firestore.
*/
(() => {
  const META="__sprint34V1", START="2026-11-10", EXAM="2026-12-13", DURATION=34;
  const WEIGHT={P1:1,P2:1,P3:2}, LIMIT={P1:40,P2:40,P3:90}, HALF_LIMIT={P1:20,P2:20,P3:45};
  // Metas competitivas pessoais; os máximos oficiais não são alterados.
  const FINAL_GOAL={objective:210,objectiveCenter:220,p4:85,blockPlan:{P1:30,P2:32,P3:148},blockMax:{P1:40,P2:40,P3:180}};
  const PAIRS=[
    {name:"Segurança da infraestrutura + gestão de riscos",a:["P3","Riscos e Arquitetura de Segurança"],b:["P2","Riscos e Controles Essenciais"],case:"Aplicar defesa em profundidade, risco residual e controles proporcionais em serviço digital da CGU."},
    {name:"Operação de segurança + transparência e privacidade",a:["P3","Vulnerabilidades e Operação de Segurança"],b:["P2","Transparência e Proteção de Dados"],case:"Tratar incidente, evidências, comunicação e proteção de dados sem interromper o serviço."},
    {name:"Computação em nuvem + auditoria governamental",a:["P3","Modelos e Arquitetura de Nuvem"],b:["P2","Ciclo do Trabalho"],case:"Descrever contratação, controle, migração de serviço crítico e evidências de auditoria."},
    {name:"Observabilidade + evidência e conclusão",a:["P3","Confiabilidade e Observabilidade"],b:["P2","Evidência e Conclusão"],case:"Relacionar logs, métricas, rastreamento, indicadores, achados e recomendações."},
    {name:"Dados e inteligência artificial responsável",a:["P3","Plataformas de Bancos de Dados"],b:["P2","Uso Responsável de Inteligência Artificial"],case:"Avaliar integridade, disponibilidade, rastreabilidade e governança de dados."},
    {name:"Identidades e controles do setor público",a:["P3","Identidades e Proteção Criptográfica"],b:["P2","Riscos e Controles Essenciais"],case:"Propor menor privilégio, IAM, proteção criptográfica, auditoria de acessos e tratamento de risco."},
    {name:"Gestão digital + políticas públicas",a:["P3","Governança e Controle"],b:["P1","Serviços e Transformação Digital"],case:"Conectar confiabilidade de TI com controles, qualidade de serviço e geração de valor público."},
    {name:"Continuidade + governança e responsabilização",a:["P3","Continuidade e Recuperação"],b:["P2","Governança e Responsabilidades"],case:"Projetar resposta, continuidade, testes de recuperação, responsabilidades e prestação de contas."}
  ];
  // Propostas autorais de treino, baseadas nos grupos existentes de P2/P3 do Edital.
  // Não são previsões oficiais de temas do Cebraspe.
  const WRITING_THEMES={
    q1:[
    {
        "title": "Gestão de riscos e controles na administração pública",
        "subject": "Fundamentos de Governança, Riscos e Integridade",
        "context": "Um órgão público identificou decisões operacionais sem segregação de funções e controles documentados. A ausência de clareza sobre riscos pode comprometer resultados e prestação de contas.",
        "proposal": "Discuta como gestão de riscos e controles proporcionais fortalecem a governança pública, a prevenção de irregularidades e a prestação de contas.",
        "keywords": [
            "risco",
            "causa e consequência",
            "controle preventivo",
            "responsabilização"
        ]
    },
    {
        "title": "Transparência pública e proteção de dados pessoais",
        "subject": "Fundamentos de Transparência, Ouvidoria e Participação",
        "context": "A divulgação de informações públicas aumenta o controle social, mas alguns registros contêm dados pessoais que exigem salvaguardas e justificativa de tratamento.",
        "proposal": "Analise como conciliar transparência ativa e passiva com a proteção de dados pessoais, indicando critérios e cuidados institucionais.",
        "keywords": [
            "publicidade",
            "finalidade",
            "necessidade",
            "salvaguardas"
        ]
    },
    {
        "title": "Auditoria baseada em riscos e qualidade das evidências",
        "subject": "Fundamentos de Auditoria Governamental",
        "context": "Uma equipe de auditoria precisa selecionar processos para avaliação e comunicar achados úteis à gestão. Informações incompletas podem levar a conclusões inadequadas.",
        "proposal": "Explique como o planejamento baseado em riscos e a qualidade das evidências contribuem para conclusões e recomendações de auditoria confiáveis.",
        "keywords": [
            "escopo",
            "critérios",
            "suficiência",
            "monitoramento"
        ]
    },
    {
        "title": "Integridade pública e prevenção de conflitos de interesses",
        "subject": "Fundamentos de Governança, Riscos e Integridade",
        "context": "Relações entre agentes públicos e interesses privados podem criar situações que demandam identificação, prevenção e resposta institucional.",
        "proposal": "Discuta o papel da cultura de integridade e dos mecanismos de prevenção de conflitos de interesses na proteção do interesse público.",
        "keywords": [
            "imparcialidade",
            "ética",
            "liderança",
            "prevenção"
        ]
    },
    {
        "title": "Ouvidoria, participação social e melhoria de serviços",
        "subject": "Fundamentos de Transparência, Ouvidoria e Participação",
        "context": "Manifestações dos cidadãos podem indicar falhas recorrentes em serviços, mas precisam ser tratadas com acolhimento, encaminhamento adequado e resposta compreensível.",
        "proposal": "Analise a contribuição da ouvidoria e do controle social para a melhoria dos serviços públicos e a confiança na administração.",
        "keywords": [
            "escuta",
            "acessibilidade",
            "encaminhamento",
            "retorno ao usuário"
        ]
    },
    {
        "title": "Inteligência artificial responsável na gestão pública",
        "subject": "Fundamentos de Evidências, Dados e Inteligência Artificial",
        "context": "Sistemas de apoio à análise podem ampliar a capacidade de examinar informações, mas seus resultados dependem da qualidade dos dados, de supervisão e de controles.",
        "proposal": "Discuta oportunidades e riscos do uso de inteligência artificial no setor público, indicando medidas para assegurar rastreabilidade e responsabilidade.",
        "keywords": [
            "qualidade dos dados",
            "supervisão humana",
            "viés",
            "rastreabilidade"
        ]
    },
    {
        "title": "Indicadores e evidências para a tomada de decisão",
        "subject": "Fundamentos de Evidências, Dados e Inteligência Artificial",
        "context": "Um painel institucional apresentou melhora em um indicador, mas há dúvidas sobre o denominador utilizado e a comparabilidade dos dados.",
        "proposal": "Explique a importância da qualidade dos indicadores e do exame de limitações e explicações alternativas na tomada de decisão pública.",
        "keywords": [
            "denominador",
            "comparabilidade",
            "inferência",
            "evidência"
        ]
    },
    {
        "title": "Responsabilização e garantias do processo administrativo",
        "subject": "Fundamentos de Direito Público Aplicado",
        "context": "Diante de um possível problema na gestão, a administração deve distinguir indícios, irregularidades e responsabilidades, respeitando as garantias do processo.",
        "proposal": "Analise como motivação, contraditório e proporcionalidade orientam apurações e decisões administrativas legítimas.",
        "keywords": [
            "motivação",
            "contraditório",
            "imparcialidade",
            "proporcionalidade"
        ]
    },
    {
        "title": "Integração entre auditoria, ouvidoria e transparência",
        "subject": "Fundamentos de Auditoria Governamental",
        "context": "Informações de usuários e dados de transparência podem indicar riscos que mereçam avaliação, sem substituir a necessidade de verificação e evidências adequadas.",
        "proposal": "Discuta como a atuação integrada das funções de controle da CGU pode prevenir falhas e contribuir para a melhoria da gestão.",
        "keywords": [
            "integração",
            "risco",
            "verificação",
            "recomendação"
        ]
    },
    {
        "title": "Controles internos e segregação de funções",
        "subject": "Fundamentos de Governança, Riscos e Integridade",
        "context": "Em um processo institucional, uma única pessoa solicita, aprova e valida operações. Essa concentração pode ampliar vulnerabilidades e dificultar a detecção de desvios.",
        "proposal": "Explique a importância da segregação de funções, da supervisão e da proporcionalidade dos controles internos para a governança.",
        "keywords": [
            "prevenção",
            "detecção",
            "segregação",
            "monitoramento"
        ]
    },
    {
        "title": "Transparência, informação confiável e desinformação",
        "subject": "Fundamentos de Transparência, Ouvidoria e Participação",
        "context": "A divulgação de informações sem contexto pode gerar interpretações equivocadas, ainda que os dados sejam verdadeiros e tenham origem institucional.",
        "proposal": "Analise a importância da integridade, do contexto e da comunicação clara das informações para a transparência e o controle social.",
        "keywords": [
            "fonte",
            "contexto",
            "verificação",
            "comunicação"
        ]
    },
    {
        "title": "Planejamento e monitoramento da auditoria",
        "subject": "Fundamentos de Auditoria Governamental",
        "context": "Após identificar uma falha de controle, uma unidade precisa comunicar os resultados e acompanhar se as recomendações produzem melhorias efetivas.",
        "proposal": "Discorra sobre as etapas de planejamento, execução, comunicação e monitoramento em um trabalho de auditoria governamental.",
        "keywords": [
            "planejamento",
            "achado",
            "recomendação",
            "acompanhamento"
        ]
    }
],
    q2:[
    {
        "title": "Incidente em serviço público hospedado na nuvem",
        "subject": "Nuvem e Cibersegurança",
        "context": "Um sistema público hospedado em nuvem apresenta acessos incomuns e indisponibilidade parcial. O órgão e o provedor precisam delimitar responsabilidades e preservar registros.",
        "proposal": "Como responsável técnico, descreva as medidas de detecção, contenção, recuperação, comunicação e aperfeiçoamento dos controles, considerando a responsabilidade compartilhada.",
        "keywords": [
            "logs",
            "IAM",
            "contenção",
            "responsabilidade compartilhada"
        ]
    },
    {
        "title": "Indisponibilidade de aplicações em contêineres",
        "subject": "Virtualização e Contêineres",
        "context": "Uma atualização de aplicação em contêineres ocasiona erros recorrentes e aumento de latência. Há necessidade de preservar a continuidade do serviço.",
        "proposal": "Apresente o diagnóstico técnico, a estratégia de reversão, a verificação da saúde dos serviços e as medidas para reduzir reincidência.",
        "keywords": [
            "orquestração",
            "health checks",
            "rollback",
            "observabilidade"
        ]
    },
    {
        "title": "Ataque de ransomware e recuperação de serviço",
        "subject": "Continuidade e Resposta a Incidentes",
        "context": "Uma unidade identifica indícios de criptografia maliciosa em servidores que sustentam um serviço essencial. Não há certeza sobre a integridade das cópias de segurança.",
        "proposal": "Indique as medidas de resposta ao incidente, preservação de evidências, validação dos backups e recuperação segura do serviço.",
        "keywords": [
            "isolamento",
            "evidências",
            "backup",
            "RTO e RPO"
        ]
    },
    {
        "title": "Acesso privilegiado indevido em ambiente híbrido",
        "subject": "Identidades e Proteção Criptográfica",
        "context": "Foram detectadas alterações administrativas feitas por uma conta privilegiada fora do horário esperado, em recursos locais e de nuvem.",
        "proposal": "Descreva como investigar os acessos, reduzir privilégios, reforçar autenticação, registrar evidências e prevenir novas ocorrências.",
        "keywords": [
            "IAM",
            "MFA",
            "menor privilégio",
            "trilhas de auditoria"
        ]
    },
    {
        "title": "Queda de desempenho em rede corporativa",
        "subject": "Redes e Comunicação",
        "context": "Usuários de diferentes unidades relatam alta latência e perda intermitente de conectividade com aplicações internas e serviços na nuvem.",
        "proposal": "Organize um plano de diagnóstico de rede, identificação de gargalos, correção e monitoramento contínuo, com justificativa das métricas selecionadas.",
        "keywords": [
            "latência",
            "roteamento",
            "DNS",
            "QoS"
        ]
    },
    {
        "title": "Recuperação de banco de dados após falha",
        "subject": "Plataformas de Bancos de Dados",
        "context": "Uma falha interrompe a operação de uma base transacional crítica. Existem réplicas e registros de transações, mas é necessário conferir consistência.",
        "proposal": "Explique como validar a integridade dos dados, utilizar logs e mecanismos de recuperação, restabelecer disponibilidade e prevenir perda de transações.",
        "keywords": [
            "replicação",
            "transações",
            "consistência",
            "logs"
        ]
    },
    {
        "title": "Falhas em implantação com infraestrutura como código",
        "subject": "Infraestrutura como Código",
        "context": "Uma mudança automatizada alterou configurações de rede e permissões, gerando divergência entre ambientes de homologação e produção.",
        "proposal": "Proponha controles de versionamento, revisão, testes, detecção de deriva de configuração e procedimento de reversão.",
        "keywords": [
            "versionamento",
            "idempotência",
            "pipeline",
            "reversão"
        ]
    },
    {
        "title": "Gestão de vulnerabilidades em sistemas expostos",
        "subject": "Vulnerabilidades e Operação de Segurança",
        "context": "O inventário identificou serviços expostos com versões desatualizadas. Algumas correções podem afetar a continuidade das operações.",
        "proposal": "Defina critérios de priorização, compensações temporárias, plano de correção, validação e acompanhamento dos riscos remanescentes.",
        "keywords": [
            "inventário",
            "exposição",
            "priorização",
            "mitigação"
        ]
    },
    {
        "title": "Métricas e observabilidade em serviço digital",
        "subject": "Confiabilidade e Observabilidade",
        "context": "Um serviço apresenta alertas excessivos e indisponibilidades não detectadas em tempo. A equipe possui logs e métricas, mas não os relaciona a objetivos do serviço.",
        "proposal": "Defina como melhorar monitoramento, indicadores, rastreamento, alarmes e resposta operacional, demonstrando como avaliar resultados.",
        "keywords": [
            "logs",
            "métricas",
            "SLO",
            "rastreamento distribuído"
        ]
    },
    {
        "title": "Migração de aplicações legadas para nuvem",
        "subject": "Migração e Modernização",
        "context": "Um órgão pretende migrar aplicações com dependências entre serviços e exigências de disponibilidade e proteção de dados.",
        "proposal": "Descreva análise de dependências, escolha da estratégia de migração, testes, controles de segurança, plano de transição e reversão.",
        "keywords": [
            "dependências",
            "portabilidade",
            "continuidade",
            "rollback"
        ]
    },
    {
        "title": "Proteção de dados em armazenamento e backup",
        "subject": "Privacidade e Proteção Operacional",
        "context": "Foram encontrados dados pessoais em cópias de segurança, registros de aplicação e ambientes de testes, com permissões amplas.",
        "proposal": "Apresente medidas de minimização, controle de acesso, proteção criptográfica, retenção e auditoria dos ambientes envolvidos.",
        "keywords": [
            "minimização",
            "criptografia",
            "retenção",
            "controle de acesso"
        ]
    },
    {
        "title": "Continuidade de serviços digitais críticos",
        "subject": "Continuidade e Recuperação",
        "context": "Um serviço essencial depende de infraestrutura concentrada em um único ambiente e não possui exercícios recentes de recuperação.",
        "proposal": "Proponha análise de impacto, metas de recuperação, arquitetura de redundância, testes de continuidade e indicadores de sucesso.",
        "keywords": [
            "BIA",
            "RTO",
            "RPO",
            "redundância"
        ]
    }
]
  };

  // 34 versículos, um por dia, da Almeida 1911 (domínio público), grafia atualizada.
  // Textos curtos: quando não contém o versículo integral, o card indica "Trecho".
  const SPRINT_VERSES=[
    {"book":"Josué","chapter":1,"verse":9,"quote":"Esforça-te, e tem bom ânimo; não pasmes, nem te espantes.","slug":"josue"},
    {"book":"Provérbios","chapter":3,"verse":5,"quote":"Confia no Senhor com todo o teu coração, e não te estribes no teu próprio entendimento.","slug":"proverbios"},
    {"book":"Tiago","chapter":1,"verse":5,"quote":"Se algum de vós tem falta de sabedoria, peça-a a Deus.","slug":"tiago"},
    {"book":"Salmos","chapter":90,"verse":12,"quote":"Ensina-nos a contar os nossos dias, de tal maneira que alcancemos corações sábios.","slug":"salmos"},
    {"book":"Filipenses","chapter":4,"verse":13,"quote":"Posso todas as coisas naquele que me fortalece.","slug":"filipenses"},
    {"book":"Salmos","chapter":37,"verse":5,"quote":"Entrega o teu caminho ao Senhor; confia nele, e ele o fará.","slug":"salmos"},
    {"book":"Salmos","chapter":27,"verse":14,"quote":"Espera no Senhor, anima-te, e ele fortalecerá o teu coração; espera pois no Senhor.","slug":"salmos"},
    {"book":"Isaías","chapter":40,"verse":31,"quote":"Os que esperam no Senhor renovarão as forças.","slug":"isaias"},
    {"book":"Salmos","chapter":121,"verse":2,"quote":"O meu socorro vem do Senhor, que fez o céu e a terra.","slug":"salmos"},
    {"book":"2 Timóteo","chapter":1,"verse":7,"quote":"Deus não nos deu o espírito de temor, mas de fortaleza, e de amor, e de moderação.","slug":"2-timoteo"},
    {"book":"Provérbios","chapter":16,"verse":3,"quote":"Confia do Senhor as tuas obras, e teus pensamentos serão estabelecidos.","slug":"proverbios"},
    {"book":"Salmos","chapter":46,"verse":1,"quote":"Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.","slug":"salmos"},
    {"book":"Provérbios","chapter":3,"verse":13,"quote":"Bem-aventurado o homem que acha sabedoria, e o homem que produz inteligência.","slug":"proverbios"},
    {"book":"Filipenses","chapter":4,"verse":6,"quote":"De nada estejais solícitos: antes as vossas petições sejam em tudo conhecidas diante de Deus pela oração.","slug":"filipenses"},
    {"book":"Isaías","chapter":41,"verse":10,"quote":"Não temas, porque eu estou contigo; não te assombres, porque eu sou teu Deus.","slug":"isaias"},
    {"book":"Hebreus","chapter":12,"verse":1,"quote":"Corramos com paciência a carreira que nos está proposta.","slug":"hebreus"},
    {"book":"Salmos","chapter":37,"verse":7,"quote":"Descansa no Senhor, e espera nele.","slug":"salmos"},
    {"book":"Colossenses","chapter":3,"verse":23,"quote":"Tudo quanto fizerdes, fazei-o do coração, como ao Senhor, e não aos homens.","slug":"colossenses"},
    {"book":"Salmos","chapter":23,"verse":1,"quote":"O Senhor é o meu pastor, nada me faltará.","slug":"salmos"},
    {"book":"Tiago","chapter":1,"verse":12,"quote":"Bem-aventurado o varão que sofre a tentação; porque, quando for provado, receberá a coroa da vida.","slug":"tiago"},
    {"book":"Salmos","chapter":46,"verse":10,"quote":"Aquietai-vos, e sabei que eu sou Deus.","slug":"salmos"},
    {"book":"Provérbios","chapter":16,"verse":9,"quote":"O coração do homem considera o seu caminho, mas o Senhor lhe dirige os passos.","slug":"proverbios"},
    {"book":"Salmos","chapter":27,"verse":1,"quote":"O Senhor é a minha luz e a minha salvação; a quem temerei?","slug":"salmos"},
    {"book":"Filipenses","chapter":4,"verse":7,"quote":"A paz de Deus, que excede todo o entendimento, guardará os vossos corações.","slug":"filipenses"},
    {"book":"1 Coríntios","chapter":15,"verse":58,"quote":"Sede firmes e constantes, sempre abundantes na obra do Senhor.","slug":"1-corintios"},
    {"book":"Romanos","chapter":8,"verse":28,"quote":"Todas as coisas contribuem juntamente para o bem daqueles que amam a Deus.","slug":"romanos"},
    {"book":"Salmos","chapter":121,"verse":7,"quote":"O Senhor te guardará de todo o mal: guardará a tua alma.","slug":"salmos"},
    {"book":"Mateus","chapter":6,"verse":34,"quote":"Não vos inquieteis pois pelo dia de amanhã, porque o dia de amanhã cuidará de si mesmo.","slug":"mateus"},
    {"book":"Provérbios","chapter":3,"verse":6,"quote":"Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.","slug":"proverbios"},
    {"book":"2 Timóteo","chapter":1,"verse":6,"quote":"Despertes o dom de Deus que existe em ti.","slug":"2-timoteo"},
    {"book":"Salmos","chapter":90,"verse":17,"quote":"Confirma sobre nós a obra das nossas mãos.","slug":"salmos"},
    {"book":"Filipenses","chapter":4,"verse":8,"quote":"Tudo o que é verdadeiro, tudo o que é honesto, tudo o que é justo, tudo o que é puro.","slug":"filipenses"},
    {"book":"Salmos","chapter":23,"verse":4,"quote":"Não temeria mal algum, porque tu estás comigo.","slug":"salmos"},
    {"book":"Salmos","chapter":121,"verse":8,"quote":"O Senhor guardará a tua entrada e a tua saída, desde agora e para sempre.","slug":"salmos"}
  ];
  const PREF={satHours:6,sunHours:5};
  let selected=START, dayFilter="todos", ready=false, cachedDeferrals=null, cachedSettings=null, cachedGoal=null;

  function n(v){const r=Number(v);return Number.isFinite(r)?Math.max(0,r):0}
  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function dateObj(s){return new Date(s+"T12:00:00")}
  function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
  function dateAt(i){const d=dateObj(START);d.setDate(d.getDate()+i);return iso(d)}
  function today(){return iso(new Date())}
  function fmtDate(d){return dateObj(d).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",weekday:"short"})}
  function warn(message){window.CGUFeedback?.cancel?.();alert(message)}
  function fmt(v,d=0){return Number(v).toLocaleString("pt-BR",{minimumFractionDigits:d,maximumFractionDigits:d})}
  function clockHours(min){const h=Math.floor(min/60),m=min%60;return m?h+"h"+String(m).padStart(2,"0"):h+"h"}
  function esc(s){return typeof escapeHtml==="function"?escapeHtml(s):String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
  function plans(){return window.CGU_readDailyPlans?.()||{}}
  function load(){
    const p=plans(),b=p[META]||{},legacy=p.__sprint28V1||{};
    return {version:2,days:b.days||{},mocks:b.mocks||{},settings:{...PREF,...(legacy.settings||{}),...(b.settings||{})},
      competition:{total:null,ac:null,absence:25,below:65,...(legacy.competition||{}),...(b.competition||{})},updatedAtMs:Number(b.updatedAtMs)||0};
  }
  function write(b){
    const p=plans();p[META]={...b,version:2,updatedAtMs:Date.now()};
    if(typeof window.CGU_writeDailyPlans==="function")window.CGU_writeDailyPlans(p);
    else{localStorage.setItem(KEY+"-daily-plans-v1",JSON.stringify(p));window.dispatchEvent(new Event("cgu-plan-changed"))}
  }
  function allRows(){return typeof topicsFlat==="function"?topicsFlat():[]}
  function metadata(x){return window.ATOMIC_META?.[x.id]||{}}
  function fullTitle(x){if(!x)return "Tópico ainda não disponível";const m=metadata(x);return m.code?m.code+" · "+m.title:x.t||x.g.nome}
  function byId(id){return allRows().find(x=>x.id===id)||null}
  function priority(x){return ({Crítica:4,Alta:3,Média:2,Baixa:1}[x?.priority]||1)}
  function blocked(x,ymd){
    const d=cachedDeferrals||plans().__deferrals||{},t=d.topics?.[x.id],s=d.subjects?.[x.d.id];
    return !!((t?.until&&ymd<t.until&&!t.cancelledAtMs)||(s?.until&&ymd<s.until&&!s.cancelledAtMs));
  }
  function goalSnapshot(bucket=load()){
    // As metas por bloco (30+32+148=210) são uma distribuição tática, NÃO nota mínima oficial.
    const rows=allRows();
    const blocks={};
    for(const exam of ["P1","P2","P3"]){
      const part=rows.filter(r=>r.exam===exam);
      const q=part.reduce((a,r)=>a+n(r.m?.q),0);
      const a=part.reduce((sum,r)=>sum+n(r.m?.a),0);
      const e=part.reduce((sum,r)=>sum+n(r.m?.e),0);
      const max=FINAL_GOAL.blockMax[exam];
      blocks[exam]={exam,max,goal:FINAL_GOAL.blockPlan[exam],q,
        // Estimativa somente com amostra mínima; não equivale à nota prevista.
        score:q>=10?(a-e)*max/q:null,source:"amostra"};
    }
    const full=Object.entries(bucket.mocks||{})
      .flatMap(([date,obj])=>Object.values(obj||{}).filter(r=>r?.type==="integral"&&r?.parts?.P1&&r?.parts?.P2&&r?.parts?.P3).map(r=>({date,...r})))
      .sort((a,b)=>b.date.localeCompare(a.date)||String(b.at||"").localeCompare(String(a.at||"")))[0];
    if(full)for(const exam of ["P1","P2","P3"]){
      blocks[exam].score=Number(full.parts[exam].net);
      blocks[exam].source="simulado";
    }
    const objectiveReady=Object.values(blocks).every(p=>p.score!==null&&Number.isFinite(p.score));
    const objective=objectiveReady?Object.values(blocks).reduce((sum,p)=>sum+p.score,0):null;

    const entries=window.CGU_P4Store?.read?.()?.entries||
      plans().__discursiveTrackerV1?.entries||[];
    function p4Average(type){
      const max=type==="q1"?30:70,limit=type==="q1"?30:60,factor=type==="q1"?6:14;
      const valid=entries.filter(e=>e.type===type&&!e.training);
      if(!valid.length)return null;
      const scores=valid.map(e=>{
        const lines=Math.min(limit,n(e.lines));
        if(!lines||e.escapeTheme||e.noText)return 0;
        const ne=n(e.spelling)+n(e.syntax)+n(e.vocab)+n(e.otherLang);
        return Math.max(0,Math.min(max,n(e.nc))-factor*ne/lines);
      });
      return scores.reduce((sum,v)=>sum+v,0)/scores.length;
    }
    const q1=p4Average("q1"),q2=p4Average("q2");
    const p4=q1===null||q2===null?null:q1+q2;
    return {blocks,objective,objectiveSource:full?"simulado":"amostra",p4,q1,q2};
  }
  function importance(x){
    if(!x)return 0;
    const m=x.m||{},gap=Math.max(0,n(m.meta)-Number(m.liquido||0)),p4=x.exam==="P3"?42:x.exam==="P2"?28:0;
    let score=priority(x)*35+({P3:120,P2:52,P1:36}[x.exam]||0)+p4;
    // A lacuna para 210/260 eleva a urgência do bloco, respeitando P3 de peso 2.
    const signal=cachedGoal?.blocks?.[x.exam];
    if(signal?.score!==null&&signal?.score!==undefined){
      const deficit=Math.max(0,signal.goal-signal.score);
      score+=Math.min(65,deficit*2.2);
    }
    // Q1 vem de P2 e Q2 vem de P3: recuperar lacunas de P4 sem inventar peso.
    if(x.exam==="P2"&&cachedGoal?.q1!=null)score+=Math.min(34,Math.max(0,25.5-cachedGoal.q1)*4);
    if(x.exam==="P3"&&cachedGoal?.q2!=null)score+=Math.min(42,Math.max(0,59.5-cachedGoal.q2)*2);
    if(!m.s?.done)score+=95;
    if(!m.q)score+=50;
    else if(m.status==="Revisar")score+=75+Math.min(75,gap*1.5);
    if(m.q>0&&m.q<15)score+=16;
    if(m.s?.done&&m.status==="Atendeu")score-=330;
    return score;
  }
  function choose(exam,date,used,chosen,group){
    const list=allRows().filter(x=>(!exam||x.exam===exam)&&!blocked(x,date)&&!chosen.includes(x.id));
    if(!list.length)return null;
    const preferred=group?list.filter(x=>x.g.nome===group):[];
    const pool=preferred.length?preferred:list;
    return [...pool].sort((a,b)=>{
      const score=x=>importance(x)-((used[x.id]||0)*190)-((used["s:"+x.d.id]||0)*18);
      return score(b)-score(a)||a.id.localeCompare(b.id);
    })[0]||null;
  }
  function noteUsed(x,used,chosen){
    if(!x)return;chosen.push(x.id);used[x.id]=(used[x.id]||0)+1;used["s:"+x.d.id]=(used["s:"+x.d.id]||0)+1;
  }
  function pairFor(ordinal,date,used){
    const pair=PAIRS[(ordinal+Math.floor(ordinal/7))%PAIRS.length];
    const a=choose(pair.a[0],date,used,[],pair.a[1])||choose("P3",date,used,[]);
    const b=choose(pair.b[0],date,used,a?[a.id]:[],pair.b[1])||choose("P2",date,used,a?[a.id]:[]);
    return {name:pair.name,case:pair.case,a:a?.id||null,b:b?.id||null};
  }
  function task(id,kind,title,minutes,extra={}){return {id,kind,title,minutes,...extra}}
  function fit(tasks,total){
    const sum=tasks.reduce((s,t)=>s+t.minutes,0);
    if(sum===total||!sum)return tasks;
    const fixed=tasks.filter(x=>x.fixed),variable=tasks.filter(x=>!x.fixed),space=total-fixed.reduce((s,t)=>s+t.minutes,0);
    if(space<0)return tasks;
    const variableTotal=variable.reduce((s,t)=>s+t.minutes,0);
    let remainder=space;
    variable.forEach((t,i)=>{
      const v=i===variable.length-1?remainder:Math.max(5,Math.round((t.minutes/variableTotal)*space/5)*5);
      t.minutes=v;remainder-=v;
    });
    return tasks;
  }
  function generate(date,index,used,prior){
    // Um dia já iniciado mantém os tópicos fixos e as conclusões registradas.
    if(prior?.locked&&Array.isArray(prior.tasks)){
      prior.tasks.forEach(t=>{
        if(t.kind==="study"&&t.topicId){const x=byId(t.topicId);if(x)noteUsed(x,used,[])}
      });
      return {...prior,date,index};
    }
    const weekday=dateObj(date).getDay(),sat=weekday===6,sun=weekday===0,holiday=date==="2026-11-20";
    const cfg=cachedSettings||load().settings;
    if(date===EXAM)return {date,index,type:"exam",title:"Prova CGU · execução e tranquilidade",minutes:0,tasks:[],pair:null,locked:false,
      tip:"Prova de 13/12/2026. Priorize documentos, alimentação, transporte, sono e administração do tempo. Não realize simulados neste dia."};
    const chosen=[],tasks=[];let type="weekday",title="",tip="",minutes=200,pair=null;

    // 11/12: último diagnóstico, definido pelo usuário. Não é um novo simulado integral.
    if(date==="2026-12-11"){
      type="diagnostic";title="Diagnóstico final · metade da objetiva + textos formativos";
      tip="Exatamente 85 itens (P1 20, P2 20, P3 45) em 140 minutos, redação Q1 com 15 linhas em 20 minutos e estudo de caso Q2 com 30 linhas em 40 minutos. São treinos; não alteram a projeção de P4. Encerre às 20h.";
      tasks.push(task("half-mock","halfMock","Meio simulado objetivo · 85 itens",140,{
        timeLabel:"04:00–05:20 + 18:00–19:00",
        fixed:true,description:"20 itens P1 + 20 P2 + 45 P3, respeitando pesos 1/1/2. Corrija e registre aqui os resultados separados por prova, não em um único tópico."}));
      tasks.push(task("writing-q1","writing","Q1 formativa · exatamente 15 linhas",20,{
        timeLabel:"19:00–19:20",fixed:true,writingType:"q1",targetLines:15,training:true,
        description:"Texto curto de 15 linhas. Treinar comando, tese, dois argumentos e conclusão. Marcar como treino formativo no registro P4."}));
      tasks.push(task("writing-q2","writing","Q2 formativa · exatamente 30 linhas",40,{
        timeLabel:"19:20–20:00",fixed:true,writingType:"q2",targetLines:30,training:true,
        description:"Estudo de caso com 30 linhas: situação, diagnóstico, ações técnicas, controles, verificação e conclusão. Não projetar nota de prova completa."}));
      return {date,index,type,title,tip,pair:null,minutes,tasks,locked:false};
    }

    // 12/12: preservação de memória, sono e desempenho. Nada novo.
    if(date==="2026-12-12"){
      type="taper";minutes=60;title="Véspera · 60 minutos leves e descanso";
      tip="No máximo 60 minutos, preferencialmente pela manhã. Sem questões cronometradas, sem redação e sem matéria nova. Confira comprovantes, documentos, local, trajeto e horário; preserve sono.";
      tasks.push(task("light-review","review","Revisão de erros recorrentes e alertas Cebraspe",40,{
        timeLabel:"Manhã · 40 min",description:"Releia apenas os pontos mais frágeis, fórmulas, erros de sinal e pegadinhas. Pare mesmo que ainda haja conteúdo."}));
      tasks.push(task("light-p4","bridge","Estrutura mental da Q1 e Q2 + logística",20,{
        timeLabel:"Manhã · 20 min",description:"Repassar 3 passos de cada resposta e organizar documentos e deslocamento. Nenhuma atividade à noite."}));
      return {date,index,type,title,tip,pair:null,minutes,tasks,locked:false};
    }

    if(!sat&&!sun&&!holiday){
      const morningLane=["P3","P3","P2","P3","P3"][weekday-1]||"P3";
      const eveningLane=["P3","P3","P3","P1","P2"][weekday-1]||"P3";
      const morning=choose(morningLane,date,used,chosen)||choose("P3",date,used,chosen)||choose(null,date,used,chosen);
      noteUsed(morning,used,chosen);
      const evening=choose(eveningLane,date,used,chosen)||choose("P3",date,used,chosen)||choose(null,date,used,chosen);
      noteUsed(evening,used,chosen);
      pair=pairFor(index,date,used);
      title="Intensivão · 04:00–05:20 + 18:00–20:00";
      tip="Manhã: revisão curta, aula de maior retorno e questões. Noite: segundo subitem, questões e aplicação/treino P4. A prioridade muda conforme o Edital e a última rodada. P3 predomina pelo peso 180/260 e aplicação em Q2.";
      tasks.push(task("morning-review","review","Recuperação ativa do último estudo",10,{timeLabel:"04:00–04:10",
        description:"Sem abrir aula: lembrar conceitos, revisar flashcards e um erro importante."}));
      if(morning){
        tasks.push(task("morning-study","study","Manhã · aula focal",45,{timeLabel:"04:10–04:55",topicId:morning.id,
          description:"Compreensão do conceito, comparação, um exemplo de C/E e anotação de lacuna."}));
        tasks.push(task("morning-questions","questions","Manhã · questões do mesmo subitem",25,{timeLabel:"04:55–05:20",topicId:morning.id,
          description:"Registre total, acertos e brancos; nota líquida ponderada será recalculada. Se necessário, use parte da noite para completar a amostra mínima."}));
      }
      if(evening){
        tasks.push(task("evening-study","study","Noite · segundo subitem estratégico",50,{timeLabel:"18:00–18:50",topicId:evening.id,
          description:"Preferência por lacuna de alto impacto; alternância de assuntos para cobertura ampla do edital."}));
        tasks.push(task("evening-questions","questions","Noite · questões e análise dos erros",30,{timeLabel:"18:50–19:20",topicId:evening.id,
          description:"Faça a rodada mínima e identifique o motivo dos erros. Lançar somente o que foi respondido."}));
      }
      const practice=weekday===2?"q1":weekday===4?"q2":null;
      if(practice){
        const targetLines=practice==="q1"?Math.min(30,15+5*Math.floor(index/7)):Math.min(60,30+10*Math.floor(index/7));
        tasks.push(task("evening-practice","writing",
          practice==="q1"?"Treino Q1 · Conhecimentos Complementares":"Treino Q2 · estudo de caso aplicado",40,
          {timeLabel:"19:20–20:00",writingType:practice,targetLines,training:true,
            description:practice==="q1"?"Argumentação, conectivos, objetivo público e conclusão. Treino curto não entra na projeção oficial de P4.":
              (pair?.case||"Resolver um problema técnico")+". Estruture diagnóstico, medidas e validação; registrar como treino formativo."}));
      }else{
        tasks.push(task("evening-practice","bridge","Casadinha interdisciplinar P3 + P2/P1",40,{
          timeLabel:"19:20–20:00",topicId:morning?.id,
          description:(pair?.case||"Integração entre competências")+". Faça 2 comparações, uma hipótese de item C/E e um esqueleto de resposta técnica."}));
      }
    }else if(sat){
      type="saturday";minutes=clamp(n(cfg.satHours)||6,4,9)*60;
      pair=pairFor(index,date,used);
      const a=byId(pair.a)||choose("P3",date,used,chosen),b=byId(pair.b)||choose("P2",date,used,chosen);
      if(date==="2026-11-28"){
        minutes=Math.max(minutes,360);
        title="Simulado objetivo integral · 170 itens";
        tip="Simulado P1 40 + P2 40 + P3 90 (300 minutos), seguido de correção. Registre o resultado no próprio simulado. Não atribuir 170 questões a um tópico.";
        tasks.push(task("full-mock","fullMock","Simulado integral P1 + P2 + P3",300,{
          fixed:true,description:"5 horas sob condições reais, com descontos dos erros e controle do tempo."}));
        tasks.push(task("review","review","Correção e classificação dos erros",60,{
          description:"Identifique 3 gargalos reais e converta-os em prioridades para a semana seguinte."}));
      }else if(date==="2026-12-05"){
        minutes=Math.max(minutes,360);
        title="Simulado P4 integral · 30 + 60 linhas";
        tip="Simule Q1 completa (30 linhas) e Q2 completa (60 linhas), em até 3h30; só simulados não formativos devem compor a projeção competitiva da P4.";
        tasks.push(task("full-disc","fullDisc","Discursivas P4 · Q1 + Q2 completos",210,{
          fixed:true,description:"Escrever Q1 até 30 linhas (30 pontos) e Q2 até 60 linhas (70 pontos), corrigir conforme o edital e registrar ambas."}));
        const m=choose("P3",date,used,chosen);noteUsed(m,used,chosen);
        if(m)tasks.push(task("study","study","Reforço P3 aplicado ao estudo de caso",90,{topicId:m.id,description:"Aplicação com diagnóstico e controles técnicos."}));
        tasks.push(task("review","review","Analisar erros de conteúdo e estrutura das duas respostas",60,{description:"Identificar lacunas de comando, lógica e linguagem."}));
      }else{
        const fullQ2=date==="2026-11-21";
        title=fullQ2?"Sábado · primeiro Q2 completo e avaliado":"Sábado de avanço + casadinha + Q2";
        tip="Mais que revisão: simulado misto P2/P3, aulas novas e estudo de caso técnico. Em 21/11, realizar Q2 completa para aferir a meta discursiva de 85/100. Divida o total em manhã, tarde e noite conforme sua disponibilidade.";
        tasks.push(task("pair","pairMock","Simulado casadinha · "+pair.name,fullQ2?90:120,{pair,description:pair.case}));
        tasks.push(task("review","review","Corrigir a casadinha e mapear falhas",fullQ2?30:45,{description:"Classificar erros por lacuna, leitura ou gestão do tempo."}));
        if(a){tasks.push(task("study-a","study","Aula técnica P3 pendente",fullQ2?90:75,{topicId:a.id,description:"Avançar em teoria essencial e exemplo aplicável."}));noteUsed(a,used,chosen)}
        if(b){tasks.push(task("study-b","study","Aula P2 e repertório Q1",60,{topicId:b.id,description:"Estruturar fundamentos institucionais e de controle."}));noteUsed(b,used,chosen)}
        tasks.push(task("writing","writing",fullQ2?"Q2 completa · aferição rumo aos 85/100":"Situação-problema Q2 aplicada",fullQ2?90:60,{writingType:"q2",targetLines:fullQ2?60:50,training:!fullQ2,
          description:pair.case+" Entregar diagnóstico, ações, governança e validação."}));
      }
    }else{
      type=holiday?"holiday":"sunday";minutes=clamp(n(cfg.sunHours)||5,3,8)*60;
      pair=pairFor(index,date,used);
      const a=choose("P3",date,used,chosen,pair.a?byId(pair.a)?.g.nome:null)||choose("P3",date,used,chosen);
      if(a){noteUsed(a,used,chosen);tasks.push(task("study-a","study","Aula P3 nova ou de recuperação",110,{topicId:a.id,description:"Teoria e esquema prático do assunto."}))}
      const b=choose("P2",date,used,chosen,pair.b?byId(pair.b)?.g.nome:null)||choose("P1",date,used,chosen);
      if(b){noteUsed(b,used,chosen);tasks.push(task("study-b","study","Aula P2 e preparação Q1",70,{topicId:b.id,description:"Integridade, transparência, governança ou auditoria conforme lacunas."}))}
      tasks.push(task("pair","pairMock","Casadinha P2/P3 · "+pair.name,60,{pair,description:pair.case}));
      const validQ1=date>="2026-11-22"&&!holiday;
      tasks.push(task("writing","writing",validQ1?"Q1 completa · aferição rumo aos 85/100":"Redação Q1 · treino",60,{writingType:"q1",targetLines:30,training:!validQ1,
        description:"Redação completa em treino; registrar na P4 se houver correção."}));
      tasks.push(task("case-outline","bridge","Esqueleto de caso Q2",30,{description:pair.case+" Diagnóstico, controle, execução e evidências."}));
      title=holiday?"Feriado de avanço + redação":"Domingo de estudo + redação";
      tip="Conteúdo novo P3 e P2, casadinha e produção textual. Não usar o dia só para revisar.";
    }
    fit(tasks,minutes);
    return {date,index,type,title,tip,pair,minutes,tasks,locked:false};
  }
  function makeSchedule(){
    const p=plans(),b=p[META]||{},used={},days=[];
    cachedDeferrals=p.__deferrals||{};
    cachedSettings={...PREF,...(b.settings||{})};
    cachedGoal=goalSnapshot({mocks:b.mocks||{}});
    try{
      for(let i=0;i<DURATION;i++){
        const date=dateAt(i),p=generate(date,i,used,b.days?.[date]);
        days.push(p);
      }
      return days;
    }finally{cachedDeferrals=null;cachedSettings=null;cachedGoal=null}
  }
  // Um dia iniciado não pode trocar as aulas após F5 nem depois de lançar questões no Edital.
  // Fixar só o dia real após a carga inicial do Firebase evita sobrescrever um plano remoto
  // com a versão provisória do cache que é mostrada antes da autenticação.
  function pinDateAfterHydration(ymd){
    if(ymd<START||ymd>=EXAM)return false;
    const b=load();
    if(b.days[ymd]?.locked&&Array.isArray(b.days[ymd].tasks))return false;
    const scheduled=makeSchedule().find(d=>d.date===ymd);
    if(!scheduled)return false;
    const previous=b.days[ymd]||{};
    b.days[ymd]={
      ...scheduled,
      locked:true,
      checks:{...(previous.checks||{})},
      openedAtMs:Number(previous.openedAtMs)||Date.now(),
      updatedAtMs:Date.now()
    };
    write(b);
    return true;
  }
  function freezeTodayAfterCloud(){
    return pinDateAfterHydration(today());
  }
  function p4Entries(){return window.CGU_P4Store?.read?.()?.entries||[]}
  function written(date,type){
    const entries=p4Entries();
    return entries.some(x=>x.date===date&&x.type===type);
  }
  function completed(t,day,b){
    if(!t)return false;
    if(t.kind==="writing")return !!(b.days[day.date]?.checks?.[t.id]||written(day.date,t.writingType));
    if(t.kind==="fullDisc")return !!(b.days[day.date]?.checks?.[t.id]||(written(day.date,"q1")&&written(day.date,"q2")));
    if(t.kind==="fullMock"||t.kind==="halfMock"||t.kind==="pairMock")return !!(b.mocks[day.date]?.[t.id]);
    if(t.kind==="study"){
      const s=t.topicId?getTS(t.topicId):null;
      return !!(b.days[day.date]?.checks?.[t.id]||s?.done);
    }
    return !!b.days[day.date]?.checks?.[t.id];
  }
  function progress(s,b){
    const tasks=s.flatMap(d=>d.tasks);
    const done=s.reduce((sum,d)=>sum+d.tasks.filter(t=>completed(t,d,b)).length,0);
    return {done,total:tasks.length,pct:tasks.length?100*done/tasks.length:0};
  }
  function taskTitle(t){
    const x=byId(t.topicId);
    return x?'<div class="s28-topic">'+esc(fullTitle(x))+'</div><div class="s28-topic-meta">'+esc(x.d.nome)+' · '+x.exam+' · '+esc(x.priority||"")+' · '+(x.m?.status||"Pendente")+(x.m?.q?' · '+fmt(x.m.liquido,1)+'% líquido':" · sem questões")+'</div>':"";
  }
  function resultsFor(day,t,b){
    const result=b.mocks[day.date]?.[t.id];
    if(!result)return "";
    if(t.kind==="halfMock"){
      return '<div class="s28-result">Meio simulado: <b>'+fmt(result.total)+'/130 pontos líquidos</b> · P1 '+fmt(result.parts.P1.net)+'/20 · P2 '+fmt(result.parts.P2.net)+'/20 · P3 '+fmt(result.parts.P3.net)+'/90. Resultado formativo, não equivale à nota oficial nem altera as notas por tópico.</div>';
    }
    if(t.kind==="fullMock"){
      const pass=result.parts.P1.net>=8&&result.parts.P2.net>=12&&result.parts.P3.net>=54&&result.total>=78;
      const nfc=result.total/26+8.5;
      return '<div class="s28-result">Simulado registrado: <b>'+fmt(result.total)+' / 260 pts líquidos</b> (P1 '+fmt(result.parts.P1.net)+'; P2 '+fmt(result.parts.P2.net)+'; P3 '+fmt(result.parts.P3.net)+'). '+
        (pass?'✓ Acima dos mínimos objetivos eliminatórios.':'⚠ Abaixo de pelo menos um mínimo eliminatório por bloco ou total. ')+
        'Piso pessoal: 210/260 · alvo central 220/260. NFC hipotética se P4 fosse 85/100: <b>'+fmt(nfc,2)+'/20</b> (não é classificação projetada).</div>';
    }
    return '<div class="s28-result">Casadinha registrada: '+result.parts.map(p=>esc(p.exam)+' '+fmt(p.net)+'/'+fmt(p.max)+' pts').join(" · ")+'</div>';
  }
  function qMin(topicId){return Math.max(10,n(window.CGU_questionRoundMinimum?.(topicId)||10))}
  function roundFields(prefix,id,defaultQ){
    const min=qMin(id);
    return '<div class="s28-fields" data-s28-fields="'+esc(prefix)+'">'+
      '<div><label>Total</label><input type="number" min="'+min+'" step="1" data-s28-q placeholder="Mín. '+min+'"></div>'+
      '<div><label>Acertos</label><input type="number" min="0" step="1" data-s28-a placeholder="Acertos"></div>'+
      '<div><label>Em branco</label><input type="number" min="0" step="1" data-s28-b placeholder="0"></div>'+
      '<div><label>Erros</label><small>Calculados ao salvar</small></div></div>';
  }
  function mockFields(day,t){
    if(t.kind==="fullMock"||t.kind==="halfMock"){
      const limits=t.kind==="halfMock"?HALF_LIMIT:LIMIT;
      return '<div class="s28-pair-grid s28-full-grid">'+["P1","P2","P3"].map(exam=>
        '<div class="s28-pair-part" data-s28-exam="'+exam+'"><b>'+exam+' — '+limits[exam]+' itens · peso '+WEIGHT[exam]+'</b>'+
        '<div class="s28-fields form-full">'+
        '<div><label>Acertos</label><input type="number" step="1" min="0" max="'+limits[exam]+'" data-s28-a placeholder="0 a '+limits[exam]+'"></div>'+
        '<div><label>Brancos</label><input type="number" step="1" min="0" max="'+limits[exam]+'" data-s28-b value="0"></div>'+
        '<div><label>Erros</label><small>Automático</small></div></div></div>'
      ).join("")+'</div>';
    }
    const ids=[t.pair?.a,t.pair?.b].filter(Boolean);
    return '<div class="s28-pair-grid">'+ids.map((id,i)=>{
      const x=byId(id);return '<div class="s28-pair-part" data-s28-pair="'+i+'"><b>'+(x?esc(x.exam)+' · '+esc(x.g.nome):"Subitem indisponível")+'</b><small>'+esc(fullTitle(x))+'</small>'+roundFields(day.date+"-"+t.id+"-"+i,id,Math.max(20,qMin(id)))+'</div>';
    }).join("")+'</div>';
  }

  function candidateRecallTopic(day,b){
    const previous=makeSchedule().filter(d=>d.date<day.date).reverse();
    // Primeiro: aula realmente marcada como concluída num dia anterior do calendário.
    for(const p of previous){
      for(const taskItem of [...p.tasks].reverse()){
        if(taskItem.kind!=="study"||!taskItem.topicId)continue;
        if(b.days[p.date]?.checks?.[taskItem.id]){
          const x=byId(taskItem.topicId);
          if(x)return {x,source:"Aula concluída no Intensivão em "+fmtDate(p.date)};
        }
      }
    }
    // Segundo: estudo do subitem confirmado no Edital até a data selecionada.
    const studied=allRows().map(x=>({x,ms:Number(getTS(x.id)?.completedAtMs)||0}))
      .filter(r=>r.ms>0&&r.ms<=dateObj(day.date).getTime()+12*3600*1000&&getTS(r.x.id)?.done)
      .sort((a,b)=>b.ms-a.ms);
    if(studied.length)return {x:studied[0].x,source:"Último estudo concluído no Edital"};
    // Terceiro: questões efetivamente registradas, sem supor que uma aula foi concluída.
    const withRounds=allRows().map(x=>{
      const rs=getTS(x.id)?.questionRounds||[];
      const eligible=rs.filter(r=>r.at&&r.at.slice(0,10)<day.date);
      const last=eligible.length?eligible[eligible.length-1]:null;
      return {x,last};
    }).filter(r=>r.last).sort((a,b)=>String(b.last.at).localeCompare(String(a.last.at)));
    if(withRounds.length)return {x:withRounds[0].x,source:"Última rodada de questões registrada"};
    const planned=previous.flatMap(p=>p.tasks.filter(t=>t.kind==="study").map(t=>({date:p.date,x:byId(t.topicId)})))
      .filter(x=>x.x).reverse();
    if(planned.length)return {x:planned[0].x,source:"Sugestão: aula prevista anteriormente, ainda sem conclusão registrada"};
    const morning=makeSchedule().find(d=>d.date===day.date)?.tasks.find(t=>t.id==="morning-study");
    return {x:byId(morning?.topicId),source:"Primeiro dia: aquecimento com o tópico previsto para hoje"};
  }
  function focusFragments(x){
    if(!x)return ["o conteúdo do edital","o exemplo estudado"];
    const topic=String(x.t||metadata(x).title||x.g.nome)
      .replace(/^\s*\d+(?:\.\d+){1,2}\s*/,"").trim();
    const chunks=topic.split(/[;,.]/).map(p=>p.trim()).filter(p=>p.length>8);
    const shorten=t=>t.length>92?t.slice(0,89).trim()+"…":t;
    return [shorten(chunks[0]||x.g.nome),shorten(chunks[1]||chunks[0]||x.g.nome)];
  }
  function activeRecallHtml(day,b){
    const {x,source}=candidateRecallTopic(day,b);
    if(!x)return '<div class="s28-study-guide"><b>Como revisar em 10 minutos</b><p>2 min: lembre um conceito de ontem. 4 min: explique-o sem ler. 3 min: faça um item certo/errado. 1 min: confira o que esqueceu.</p><small>Ainda não há tópico cadastrado para orientar esta revisão.</small></div>';
    const [concept,second]=focusFragments(x),m=x.m||{},round=m.lastRound||(getTS(x.id)?.questionRounds||[]).at(-1);
    const err=Number(round?.erros??m.e)||0,obs=String(getTS(x.id)?.obs||"").trim();
    const errorText=err>0
      ?'Última rodada disponível: '+err+' erro(s). Reabra uma das questões erradas e explique por que a alternativa era falsa ou verdadeira. O sistema conhece a contagem, não o enunciado.'
      :'Não há erro identificado na última rodada. Escolha a afirmação que gerou mais dúvida e explique como a banca poderia alterá-la.';
    return '<div class="s28-study-guide" data-guide="recall">'+
      '<div class="s28-guide-top"><b>🧠 O que revisar hoje</b><span>'+esc(source)+'</span></div>'+
      '<div class="s28-guide-subject">'+esc(fullTitle(x))+' <small>'+esc(x.d.nome)+' · '+x.exam+'</small></div>'+
      '<div class="s28-guide-plan"><div><strong>0–2 min</strong><span>Feche o material e tente definir: '+esc(concept)+'.</span></div>'+
      '<div><strong>2–5 min</strong><span>Explique a relação entre '+esc(concept)+' e '+esc(second)+'. Se não lembrar, diga o que precisa verificar.</span></div>'+
      '<div><strong>5–8 min</strong><span>Crie um item C/E sobre esse assunto, julgue-o e justifique em voz alta.</span></div>'+
      '<div><strong>8–10 min</strong><span>Abra as anotações e confira as lacunas. '+esc(errorText)+'</span></div></div>'+
      (obs?'<div class="s28-guide-weak"><b>Seu ponto fraco anotado:</b> '+esc(obs)+'</div>':'')+
      '<details class="s28-guide-extra"><summary>Como saber se revisei bem?</summary><p>Sem consultar: consigo explicar o conceito em uma frase, dar um exemplo de aplicação e justificar pelo menos um item C/E? Se não, anote a lacuna e revise-a na próxima rodada.</p></details>'+
      '</div>';
  }
  function writingTheme(day,type){
    const bank=WRITING_THEMES[type]||WRITING_THEMES.q1;
    return bank[(day.index+(type==="q2"?5:0))%bank.length];
  }
  function writingTaskGuide(day,t,type){
    const info=writingTheme(day,type),target=n(t?.targetLines)||(type==="q1"?30:60);
    const q1=type==="q1";
    const intro=Math.max(2,Math.round(target*(q1?.2:.16)));
    const conclusion=Math.max(2,Math.round(target*(q1?.2:.20)));
    const development=target-intro-conclusion;
    const segments=q1
      ?'<b>Roteiro de '+target+' linhas:</b> '+intro+' de introdução; '+development+' de desenvolvimento (dois argumentos); '+conclusion+' de conclusão com consequência ou encaminhamento.'
      :'<b>Roteiro de '+target+' linhas:</b> '+intro+' de apresentação do problema; '+Math.round(development*.45)+' de diagnóstico; '+(development-Math.round(development*.45))+' de medidas técnicas; '+conclusion+' de validação e conclusão.';
    const guidance=q1
      ?'<b>Como começar:</b> “No contexto da administração pública, '+esc(info.title.toLowerCase())+' exige atenção a '+esc(info.keywords[0])+' e '+esc(info.keywords[1])+'. Nesse sentido, ...”<br>Use “Inicialmente”, “Além disso” e “Portanto” para organizar os parágrafos.'
      :'<b>Como começar:</b> “A situação apresentada exige identificar as causas da falha, seus impactos e os controles envolvidos. Inicialmente, devem ser ...”<br>Não pare no diagnóstico: indique quem executa, como validar e como acompanhar o resultado.';
    const introLabel=q1?"Texto motivador":"Situação-problema";
    const ask=q1?"Proposta de redação":"Comando do estudo de caso";
    return '<div class="s28-study-guide s28-writing-guide" data-guide="'+type+'">'+
      '<div class="s28-guide-top"><b>✍️ Tema sugerido '+type.toUpperCase()+'</b><span>Proposta de treino, não previsão oficial</span></div>'+
      '<div class="s28-guide-subject">'+esc(info.title)+' <small>'+esc(info.subject)+'</small></div>'+
      '<p><b>'+introLabel+':</b> '+esc(info.context)+'</p>'+
      '<p><b>'+ask+':</b> '+esc(info.proposal)+'</p>'+
      '<div class="s28-guide-keywords"><b>Palavras-chave:</b> '+info.keywords.map(v=>'<span>'+esc(v)+'</span>').join('')+'</div>'+
      '<details class="s28-guide-extra" open><summary>Orientação do professor: como estruturar</summary><p>'+segments+'</p><p>'+guidance+'</p>'+
      '<p class="s28-guide-tip">Antes de escrever, sublinhe o verbo do comando (discuta, analise, descreva ou proponha). Ao terminar, confirme se respondeu a todas as partes da proposta. Os pontos e linhas serão registrados na aba P4.</p></details>'+
      '</div>';
  }
  function guideHtml(day,t,b){
    if(t.id==="morning-review")return activeRecallHtml(day,b);
    if(t.kind==="writing")return writingTaskGuide(day,t,t.writingType);
    if(t.kind==="fullDisc"){
      return '<div class="s28-guide-dual">'+
        writingTaskGuide(day,{targetLines:30},"q1")+
        writingTaskGuide(day,{targetLines:60},"q2")+'</div>';
    }
    if(t.id==="case-outline"||t.id==="light-p4"){
      return writingTaskGuide(day,{targetLines:30},"q2");
    }
    return "";
  }

  function renderTask(day,t,b){
    const done=completed(t,day,b),x=t.topicId?byId(t.topicId):null,exam=x?.exam||"";
    let actions="";
    if(t.kind==="study"||t.kind==="review"||t.kind==="bridge"){
      actions='<button class="primary" type="button" onclick="CGU28_toggle(\''+day.date+'\',\''+t.id+'\')">'+(done?"✓ Concluído — reabrir":"✓ Marcar atividade concluída")+'</button>';
    }else if(t.kind==="questions"){
      actions=done?'<span class="s28-result">Rodada registrada</span>':'<div>'+roundFields(day.date+"-"+t.id,t.topicId,Math.max(qMin(t.topicId),10))+'<div class="s28-actions"><button class="primary" type="button" onclick="CGU28_saveQuestions(\''+day.date+'\',\''+t.id+'\')">Registrar rodada neste tópico</button></div></div>';
    }else if(t.kind==="pairMock"||t.kind==="fullMock"||t.kind==="halfMock"){
      actions=done?resultsFor(day,t,b):mockFields(day,t)+'<div class="s28-actions"><button class="primary" type="button" onclick="CGU28_saveMock(\''+day.date+'\',\''+t.id+'\')">Salvar resultado do simulado</button></div>';
    }else if(t.kind==="writing"||t.kind==="fullDisc"){
      const p4Click=t.kind==="writing"
        ?`CGU28_openP4('${t.writingType}','${day.date}',${t.targetLines||0},${t.training!==false})`
        :"CGU28_openP4()";
      const target=t.kind==="writing"&&t.targetLines
        ?'<b class="s28-formative">Meta de escrita: '+t.targetLines+' linhas · '+(t.training?'treino formativo, fora da projeção P4':'produção de prova integral')+'</b>'
        :'';
      actions=target+'<span class="s28-subline">'+(done?'✓ Atividade já registrada ou rascunho marcado.':'A produção só recebe nota quando registrada na aba Discursivas/P4; rascunho não entra na projeção.')+'</span>'+
      '<div class="s28-actions"><button type="button" class="primary" onclick="'+p4Click+'">Abrir formulário P4</button>'+
      '<button type="button" onclick="CGU28_toggle(\''+day.date+'\',\''+t.id+'\')">'+(b.days[day.date]?.checks?.[t.id]?"Desmarcar rascunho":"Marcar rascunho feito")+'</button></div>';
    }
    const last=x?.m?.q?' · última amostra: '+fmt(x.m.q)+' questões · '+fmt(x.m.liquido,1)+'% líquido · peso '+WEIGHT[exam]:'';
    return '<article class="s28-task '+(done?'done':'')+'" data-task="'+t.id+'">'+
      '<header><strong>'+(done?'✓ ':'')+esc(t.title)+'</strong><small>'+(t.timeLabel?esc(t.timeLabel)+' · ':'')+t.minutes+' min'+last+'</small></header>'+
      (t.topicId?taskTitle(t):'')+'<p>'+esc(t.description||"")+'</p>'+
      (t.kind==="pairMock"?'<div class="s28-subline">Conexão para Q2: '+esc(t.pair?.case||"")+'</div>':'')+
      guideHtml(day,t,b)+
      '<div class="s28-actions">'+actions+'</div></article>';
  }
  function sessionTasks(day,key){
    if(day.type!=="weekday")return [];
    return day.tasks.filter(t=>{
      const time=String(t.timeLabel||"");
      return key==="morning"?time.startsWith("04:"):time.startsWith("18:")||time.startsWith("19:");
    });
  }
  function renderSession(day,b,key){
    const tasks=sessionTasks(day,key);
    if(!tasks.length)return "";
    const done=tasks.filter(t=>completed(t,day,b)).length,allDone=done===tasks.length;
    const morning=key==="morning";
    const title=morning?"Manhã · 04h00–05h20":"Noite · 18h00–20h00";
    const status=allDone?"✓ Concluído":done?done+"/"+tasks.length+" concluídas":"A realizar";
    return '<details class="s34-session '+(allDone?"done":"")+'" data-session="'+key+'" '+(allDone?"":"open")+'>'+
      '<summary><span class="s34-session-title">'+title+'</span>'+
      '<span class="s34-session-count">'+status+'</span>'+
      '<small>'+(allDone?"Bloco finalizado; clique para consultar as atividades.":morning?"O que falta no bloco da manhã":"Estas são atividades previstas para a noite, não novas tarefas da manhã.")+'</small></summary>'+
      '<div class="s34-session-body">'+tasks.map(t=>renderTask(day,t,b)).join("")+'</div>'+
      '</details>';
  }
  function renderDay(days,b){
    const day=days.find(d=>d.date===selected)||days[0],host=document.getElementById("s28Daily");if(!host)return;
    if(!day)return;
    const done=day.tasks.filter(t=>completed(t,day,b)).length;
    const display=day.type==="weekday"
      ?renderSession(day,b,"morning")+renderSession(day,b,"evening")
      :(day.tasks.length?day.tasks.map(t=>renderTask(day,t,b)).join(""):'<div class="s28-result">Dia da prova: revise apenas o indispensável e priorize sua execução. Boa prova.</div>');
    host.innerHTML='<div class="s28-detail-head"><div><strong>Dia '+(day.index+1)+' · '+esc(fmtDate(day.date))+'</strong><small>'+esc(day.title)+' · '+(day.minutes?clockHours(day.minutes)+" programadas":"dia de prova")+'</small></div><span class="badge '+(done===day.tasks.length?"p3":"high")+'">'+done+'/'+day.tasks.length+' tarefas</span></div>'+
      '<div class="s28-logic">'+esc(day.tip)+'</div>'+
      display;
  }
  function renderDays(days,b){
    const host=document.getElementById("s28Timeline");if(!host)return;
    const oldScroll=host.scrollTop;
    const visible=days.filter(day=>{
      if(dayFilter==="pendentes")return day.tasks.length&&day.tasks.some(t=>!completed(t,day,b));
      if(dayFilter==="simulados")return day.tasks.some(t=>/Mock/.test(t.kind));
      if(dayFilter==="discursivas")return day.tasks.some(t=>["writing","fullDisc"].includes(t.kind));
      return true;
    });
    host.innerHTML=visible.map(day=>{
      const done=day.tasks.filter(t=>completed(t,day,b)).length;
      return '<button type="button" class="s28-day-btn '+(day.date===selected?'selected ':'')+(day.tasks.length&&done===day.tasks.length?'completed ':'')+(day.type==="exam"?'exam':'')+'" onclick="CGU28_select(\''+day.date+'\')">'+
        '<span><span class="s28-date">D'+(day.index+1)+' · '+esc(fmtDate(day.date))+'</span><span class="s28-day-type">'+esc(day.title)+'</span></span>'+
        '<span class="s28-day-state">'+(day.type==="exam"?"PROVA":done+'/'+day.tasks.length)+'</span></button>';
    }).join("")||'<div class="s28-subline">Nenhum dia corresponde ao filtro.</div>';
    host.scrollTop=oldScroll;
  }
  function renderDailyVerse(){
    const host=document.getElementById("s28VerseCard");
    if(!host)return;
    const chosenDay=selected>=START&&selected<=EXAM?selected:today();
    const delta=Math.round((dateObj(chosenDay)-dateObj(START))/86400000);
    const index=Math.max(0,Math.min(SPRINT_VERSES.length-1,delta));
    const v=SPRINT_VERSES[index];
    const reference=v.book+" "+v.chapter+":"+v.verse;
    const chapterUrl="https://bibliaalmeida.com/"+v.slug+"/"+v.chapter+"/";
    host.innerHTML='<div class="s28-verse-icon" aria-hidden="true">📖</div>'+
      '<div class="s28-verse-body">'+
        '<div class="s28-verse-header"><span>Palavra para o dia de estudo</span><span>Dia '+(index+1)+' de 34 · '+esc(fmtDate(dateAt(index)))+'</span></div>'+
        '<blockquote>“'+esc(v.quote)+'”</blockquote>'+
        '<div class="s28-verse-footer"><strong>'+esc(reference)+'</strong>'+
        '<span>Almeida 1911 · trecho do versículo</span>'+
        '<a href="'+chapterUrl+'" target="_blank" rel="noopener noreferrer" aria-label="Ler '+esc(reference)+' no capítulo completo">Ler capítulo completo</a></div>'+
      '</div>';
  }
  function renderGoalTracker(bucket){
    const host=document.getElementById("s28GoalTracker");if(!host)return;
    const g=goalSnapshot(bucket);
    const objScore=g.objective===null?"Sem estimativa":fmt(g.objective,1)+" / 260";
    const p4Score=g.p4===null?"Incompleta":fmt(g.p4,1)+" / 100";
    const gapObj=g.objective===null?"Aguardando P1, P2 e P3 (mínimo 10 questões em cada prova).":
      "Diferença para 210: "+fmt(Math.max(0,210-g.objective),1)+" pts · "+
      (g.objectiveSource==="simulado"?"último simulado completo":"extrapolação das amostras; não é previsão");
    const gapP4=g.p4===null?"Registre uma Q1 e uma Q2 válidas; treinos formativos são excluídos.":
      "Diferença para 85: "+fmt(Math.max(0,85-g.p4),1)+" pts · médias das correções válidas";
    host.innerHTML=
      '<div class="s28-goal-tile"><span>Meta competitiva · objetiva</span><b>210/260</b><small>Alvo central 220 · P1 + P2 + P3</small></div>'+
      '<div class="s28-goal-tile"><span>Meta competitiva · discursiva</span><b>85/100</b><small>P4 = Q1 de 30 + Q2 de 70 pontos</small></div>'+
      '<div class="s28-goal-tile"><span>Diagnóstico objetivo</span><b>'+objScore+'</b><small>'+gapObj+'</small></div>'+
      '<div class="s28-goal-tile"><span>Diagnóstico P4</span><b>'+p4Score+'</b><small>'+gapP4+'</small></div>'+
      '<p class="s28-goal-note">Divisão tática ilustrativa para buscar 210 pontos: P1 <b>30/40</b>, P2 <b>32/40</b>, P3 <b>148/180</b>. P3 e Q2 conservam os máximos oficiais de 180 e 70; 210 e 85 são metas das provas completas. Os diagnósticos não representam nota oficial ou previsão de colocação.</p>';
  }
  function renderKpis(days,b){
    renderGoalTracker(b);
    const all=allRows(),critical=all.filter(x=>x.priority==="Crítica"&&!x.m.s.done).length;
    const below=all.filter(x=>x.m.status==="Revisar").length,unseen=all.filter(x=>!x.m.s.done).length;
    const p=progress(days,b),host=document.getElementById("s28KPIs");
    const hours=days.reduce((s,d)=>s+d.minutes,0);
    if(host)host.innerHTML=[
      [p.done+'/'+p.total,"Tarefas concluídas no ciclo"],
      [unseen,"Subitens ainda não concluídos no Edital"],
      [critical+" / "+below,"Críticos pendentes / temas para revisar"],
      [fmt(hours/60,1)+"h","Carga prevista até a prova"]
    ].map(([v,l])=>'<div class="s28-kpi"><b>'+v+'</b><span>'+l+'</span></div>').join("");
    const bar=document.getElementById("s28Progress");if(bar){bar.style.width=fmt(p.pct)+"%";bar.setAttribute("aria-valuenow",String(Math.round(p.pct)))}
  }
  function competitionHtml(c){
    const total=n(c.total),ac=n(c.ac),base=ac||total,isAC=ac>0;
    if(!base)return '<div class="s28-subline">Informe o número de inscritos do Cargo 3 para ver três cenários hipotéticos. Se conhecer o número da ampla concorrência, preencha-o separadamente.</div>';
    const scenarios=[
      {title:"Concorrência mais forte",absence:clamp(n(c.absence)-10,0,90),below:clamp(n(c.below)-15,0,95)},
      {title:"Cenário central ajustável",absence:clamp(n(c.absence),0,90),below:clamp(n(c.below),0,95)},
      {title:"Cenário mais favorável",absence:clamp(n(c.absence)+10,0,90),below:clamp(n(c.below)+15,0,95)}
    ];
    return '<div class="s28-comp-results">'+scenarios.map(z=>{
      const present=Math.round(base*(1-z.absence/100)),notReady=Math.round(present*z.below/100),competitive=present-notReady;
      return '<div><b>'+fmt(competitive)+' hipotéticos</b><strong style="font-size:10px">'+z.title+'</strong><small>Presentes: '+fmt(present)+' (abstenção suposta '+fmt(z.absence)+'%)</small><small>Perfil abaixo da preparação competitiva: '+fmt(notReady)+' ('+fmt(z.below)+'% dos presentes)</small><small>'+(!isAC?'Total de cargos, não AC isolada':'Base de AC informada')+' · 6 vagas imediatas AC</small></div>';
    }).join("")+'</div>'+
    '<p class="s28-comp-notice"><b>Aviso estatístico:</b> estes valores são cenários matemáticos baseados nas hipóteses escolhidas — NÃO são dados observados de abstenção, preparo ou concorrência real. '+(!isAC?'Como há apenas o total do cargo, não é possível calcular a concorrência real da ampla concorrência. ':'')+'Não representam probabilidade de classificação nem nota de corte. O edital prevê 6 vagas imediatas AC e 36 candidatos AC na referência inicial de correção discursiva (sujeita às regras de empates e aprovação adicional).</p>';
  }
  function competitionDraft(){
    const total=document.getElementById("s28Inscritos"),ac=document.getElementById("s28InscritosAC"),abs=document.getElementById("s28Abs"),below=document.getElementById("s28Below");
    return {total:total?.value===""?null:clamp(n(total?.value),0,2000000),
      ac:ac?.value===""?null:clamp(n(ac?.value),0,2000000),
      absence:clamp(n(abs?.value),0,90),below:clamp(n(below?.value),0,95)};
  }
  function renderCompetition(b){
    const c=b.competition,host=document.getElementById("s28CompInputs");
    if(!host)return;
    host.innerHTML='<div class="s28-comp-grid">'+
      '<label>Inscritos no Cargo 3<input id="s28Inscritos" type="number" min="0" step="1" placeholder="Total divulgado" value="'+(c.total??'')+'" oninput="CGU28_previewComp()"></label>'+
      '<label>Inscritos AC (se conhecidos)<input id="s28InscritosAC" type="number" min="0" step="1" placeholder="Opcional" value="'+(c.ac??'')+'" oninput="CGU28_previewComp()"></label>'+
      '<label>Abstenção hipotética (%)<input id="s28Abs" type="number" min="0" max="90" step="1" value="'+c.absence+'" oninput="CGU28_previewComp()"></label>'+
      '<label>Preparo abaixo do competitivo (%)<input id="s28Below" type="number" min="0" max="95" step="1" value="'+c.below+'" oninput="CGU28_previewComp()"></label></div>'+
      '<div class="s28-actions"><button type="button" class="primary" onclick="CGU28_saveComp()">Salvar parâmetros</button></div>';
    document.getElementById("s28CompOutput").innerHTML=competitionHtml(c);
  }
  function render({keepScroll=true,keepComp=true}={}){
    if(!document.getElementById("page-sprint28"))return;
    const scroll=window.scrollY,b=load(),days=makeSchedule();
    renderDailyVerse();renderKpis(days,b);renderDays(days,b);renderDay(days,b);
    const sh=document.getElementById("s28Sat"),su=document.getElementById("s28Sun");
    if(sh)sh.value=b.settings.satHours;if(su)su.value=b.settings.sunHours;
    if(!keepComp)renderCompetition(b);
    if(keepScroll)requestAnimationFrame(()=>window.scrollTo({top:scroll,left:0,behavior:"instant"}));
  }
  function ensureDay(b,date){
    const current=b.days[date],generated=makeSchedule().find(d=>d.date===date);
    if(!generated)throw Error("Dia não encontrado");
    if(!current?.locked)b.days[date]={...generated,locked:true,checks:{...(current?.checks||{})}};
    return b.days[date];
  }
  function taskIn(b,date,id){return ensureDay(b,date).tasks.find(t=>t.id===id)}
  function feedbackStart(text){window.CGUFeedback?.begin?.(text||"Atualizando plano...")}
  function feedbackEnd(){window.CGUFeedback?.complete?.()}
  function updateAfter(b,notice,taskId=null){
    write(b);
    const days=makeSchedule();
    renderKpis(days,b);
    renderDays(days,b);
    const day=days.find(d=>d.date===selected);
    if(day&&taskId){
      // Atualiza só o card alterado: outros formulários preenchidos continuam intactos.
      const oldCard=[...(document.querySelectorAll("#s28Daily [data-task]"))]
        .find(el=>el.dataset.task===taskId);
      const changed=day.tasks.find(t=>t.id===taskId);
      if(oldCard&&changed){
        oldCard.outerHTML=renderTask(day,changed,b);
        const badge=document.querySelector("#s28Daily .s28-detail-head .badge");
        if(badge)badge.textContent=day.tasks.filter(t=>completed(t,day,b)).length+"/"+day.tasks.length+" tarefas";
        // O cabeçalho da manhã/noite também precisa refletir a conclusão, sem recarregar a tela.
        const parent=oldCard.closest(".s34-session");
        if(parent){
          const key=parent.dataset.session,part=sessionTasks(day,key);
          const done=part.filter(t=>completed(t,day,b)).length;
          const finished=done===part.length;
          parent.classList.toggle("done",finished);
          const count=parent.querySelector(".s34-session-count");
          if(count)count.textContent=finished?"✓ Concluído":done?done+"/"+part.length+" concluídas":"A realizar";
          const hint=parent.querySelector("summary small");
          if(hint)hint.textContent=finished?"Bloco finalizado; clique para consultar as atividades.":key==="morning"?"O que falta no bloco da manhã":"Estas são atividades previstas para a noite, não novas tarefas da manhã.";
        }
      }else renderDay(days,b);
    }else renderDay(days,b);
    feedbackEnd();
    if(notice&&typeof toast==="function")toast(notice);
  }
  function saveTopicRound(id,q,a,b,source){
    const old=getTS(id)||{},e=q-a-b;const hist=Array.isArray(old.questionRounds)?old.questionRounds:[];
    const oldQ=n(old.questoes),oldA=n(old.acertos),oldB=n(old.brancos),oldE=n(old.erros);
    const canonicalQ=Math.max(oldQ,oldA+oldB+oldE);
    const now=Date.now(),at=new Date(now).toISOString();
    setTS(id,{questoes:canonicalQ+q,acertos:oldA+a,brancos:oldB+b,erros:oldE+e,
      questionRounds:[...hist,{id:"qr-s34-"+now+"-"+Math.random().toString(36).slice(2,6),at,questoes:q,acertos:a,erros:e,brancos:b,liquidoRodada:q?100*(a-e)/q:null,source}],
      lastQuestionDate:at,lastQuestionSource:source,lastQuestionBatch:{questoes:q,acertos:a,erros:e,brancos:b,data:at.slice(0,10)},updatedAtMs:now,atomicConfirmed:true});
    return {q,a,b,e,exam:byId(id)?.exam||"P3",net:(a-e)*WEIGHT[byId(id)?.exam||"P3"],max:q*WEIGHT[byId(id)?.exam||"P3"]};
  }
  function fields(el,fixedQ){
    const qEl=el?.querySelector("[data-s28-q]"),aEl=el?.querySelector("[data-s28-a]"),bEl=el?.querySelector("[data-s28-b]");
    const q=fixedQ||Number(qEl?.value),a=Number(aEl?.value),b=Number(bEl?.value);
    if(!Number.isInteger(q)||q<=0||aEl?.value===""||!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a+b>q)return null;
    return {q,a,b,e:q-a-b};
  }
  function daysBy(date){return makeSchedule().find(x=>x.date===date)}
  window.CGU28_select=function(date){selected=date;render({keepScroll:true});};
  window.CGU28_filter=function(v){
    dayFilter=v;document.querySelectorAll(".s28-chip").forEach(c=>c.classList.toggle("on",c.dataset.filter===v));render();
  };
  window.CGU28_toggle=function(date,key){
    const b=load(),t=taskIn(b,date,key);if(!t)return;
    const day=b.days[date],was=!!day.checks?.[key],next=!was;
    feedbackStart("Atualizando atividade...");
    day.checks={...(day.checks||{}),[key]:next};day.updatedAtMs=Date.now();
    if(t.kind==="study"&&t.topicId){
      const old=getTS(t.topicId)||{};
      if(next)setTS(t.topicId,{done:true,completedAtMs:Date.now(),completionSource:"sprint34",updatedAtMs:Date.now()});
      else if(old.completionSource==="sprint34")setTS(t.topicId,{done:false,completedAtMs:null,completionSource:"sprint34-reopened",updatedAtMs:Date.now()});
      try{save()}catch(e){}
    }
    updateAfter(b,next?"Atividade concluída.":"Atividade reaberta.",key);
  };
  window.CGU28_saveQuestions=function(date,key){
    const b=load(),t=taskIn(b,date,key);if(!t?.topicId)return;
    const card=document.querySelector('#s28Daily [data-task="'+key+'"]'),data=fields(card);
    if(!data){warn("Preencha o total, acertos e brancos corretamente; erros são o restante.");return;}
    const min=qMin(t.topicId);if(data.q<min){warn("Mínimo do tópico: "+min+" questões nesta rodada.");return;}
    feedbackStart("Registrando rodada...");
    saveTopicRound(t.topicId,data.q,data.a,data.b,"reta-final-34");
    b.days[date].checks={...(b.days[date].checks||{}),[key]:true};
    try{save()}catch(e){}
    updateAfter(b,"Rodada registrada no tópico e sincronizável com o Edital.",key);
    window.dispatchEvent(new CustomEvent("cgu-question-recorded",{detail:{topicId:t.topicId,source:"reta-final-34"}}));
  };
  window.CGU28_saveMock=function(date,key){
    const b=load(),t=taskIn(b,date,key);if(!t)return;
    const card=document.querySelector('#s28Daily [data-task="'+key+'"]');
    if(!card)return;
    if(t.kind==="fullMock"||t.kind==="halfMock"){
      const limits=t.kind==="halfMock"?HALF_LIMIT:LIMIT;
      const parts={};let sum=0;
      for(const exam of ["P1","P2","P3"]){
        const el=card.querySelector('[data-s28-exam="'+exam+'"]'),aEl=el?.querySelector("[data-s28-a]"),bEl=el?.querySelector("[data-s28-b]");
        if(!aEl||aEl.value===""){warn("Preencha os acertos de "+exam+" antes de salvar o simulado.");return;}
        const a=Number(aEl.value),b=Number(bEl?.value),q=limits[exam],e=q-a-b;
        if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||e<0){warn("Confira os acertos e brancos em "+exam+".");return;}
        const net=(a-e)*WEIGHT[exam];parts[exam]={q,a,b,e,net,max:q*WEIGHT[exam]};sum+=net;
      }
      feedbackStart(t.kind==="halfMock"?"Salvando meio simulado...":"Salvando simulado integral...");
      b.mocks[date]={...(b.mocks[date]||{}),[key]:{type:t.kind==="halfMock"?"diagnostico-meio":"integral",parts,total:sum,max:t.kind==="halfMock"?130:260,at:new Date().toISOString()}};
      updateAfter(b,(t.kind==="halfMock"?"Meio simulado ":"Simulado integral ")+"salvo: "+fmt(sum)+" / "+(t.kind==="halfMock"?130:260)+" pontos. Sem alterar notas dos tópicos.",key);
    }else if(t.kind==="pairMock"){
      const ids=[t.pair?.a,t.pair?.b].filter(Boolean),input=[];
      for(let i=0;i<ids.length;i++){
        const el=card.querySelector('[data-s28-pair="'+i+'"]'),d=fields(el),min=qMin(ids[i]);
        if(!d){warn("Preencha total, acertos e brancos dos dois subitens da casadinha.");return;}
        if(d.q<min){warn("O subitem "+(i+1)+" precisa de pelo menos "+min+" questões.");return;}
        input.push({id:ids[i],...d});
      }
      if(!input.length)return;
      feedbackStart("Salvando casadinha...");
      const parts=input.map(x=>saveTopicRound(x.id,x.q,x.a,x.b,"reta-final-casadinha"));
      b.mocks[date]={...(b.mocks[date]||{}),[key]:{type:"casadinha",parts,topicIds:ids,at:new Date().toISOString()}};
      try{save()}catch(e){}
      updateAfter(b,"Casadinha salva: duas rodadas vinculadas aos respectivos subitens.",key);
      ids.forEach(id=>window.dispatchEvent(new CustomEvent("cgu-question-recorded",{detail:{topicId:id,source:"reta-final-casadinha"}})));
    }
  };
  window.CGU28_openP4=function(type,date,targetLines,training=true){
    const b=document.querySelector('.nav button[data-page="discursiva"]');
    if(!b||typeof switchPage!=="function"){
      if(typeof toast==="function")toast("Aba Discursivas/P4 não disponível.");
      return;
    }
    switchPage("discursiva",b);
    if(!type||!date)return;
    requestAnimationFrame(()=>{
      const theme=document.getElementById("p4-theme");
      if(theme?.value?.trim()){
        if(typeof toast==="function")toast("Já existe um rascunho aberto na P4; salve-o antes de iniciar o próximo treino.");
        return;
      }
      const dateInput=document.getElementById("p4-date"),typeInput=document.getElementById("p4-type");
      const trainingInput=document.getElementById("p4-training"),lines=document.getElementById("p4-lines");
      if(dateInput)dateInput.value=date;
      if(typeInput)typeInput.value=type;
      if(trainingInput)trainingInput.checked=!!training;
      if(lines){lines.value="";lines.placeholder="Registre linhas realmente escritas (alvo: "+targetLines+")";}
      if(typeof window.CGU_p4TypeChanged==="function")window.CGU_p4TypeChanged();
      const day=makeSchedule().find(x=>x.date===date);
      const suggestion=day?writingTheme(day,type):null;
      if(theme&&suggestion&&!theme.value.trim())theme.value=suggestion.title;
      const form=document.getElementById("p4Form");
      if(form){
        let banner=document.getElementById("s34WritingTarget");
        if(!banner){banner=document.createElement("div");banner.id="s34WritingTarget";banner.className="s28-writing-banner";form.prepend(banner);}
        banner.textContent=(training?"Treino formativo ":"Simulado completo ")+(type==="q1"?"Q1":"Q2")+" do dia "+date.split("-").reverse().join("/")+
          " · tema sugerido: "+(suggestion?.title||"a definir")+
          " · objetivo "+targetLines+" linhas. Registre apenas as linhas realmente escritas e a correção efetiva."+
          (training?" A nota será excluída da projeção competitiva.":" A nota corrigida poderá compor a projeção válida da P4.");
      }
      theme?.focus({preventScroll:true});
    });
  };
  window.CGU28_saveHours=function(){
    const a=clamp(n(document.getElementById("s28Sat")?.value)||6,4,9),s=clamp(n(document.getElementById("s28Sun")?.value)||5,3,8);
    const b=load();b.settings.satHours=a;b.settings.sunHours=s;
    feedbackStart("Atualizando horários...");
    updateAfter(b,"Cargas dos próximos dias não iniciados ajustadas.");
  };
  window.CGU28_previewComp=function(){
    const el=document.getElementById("s28CompOutput");if(el)el.innerHTML=competitionHtml(competitionDraft());
  };
  window.CGU28_saveComp=function(){
    const b=load(),c=competitionDraft();
    if(c.ac!=null&&c.total!=null&&c.ac>c.total){warn("Inscritos AC não podem superar o total de inscritos no cargo.");return;}
    b.competition=c;feedbackStart("Salvando estimativas...");
    write(b);feedbackEnd();window.CGU28_previewComp();if(typeof toast==="function")toast("Parâmetros hipotéticos salvos no Firebase.");
  };
  function setup(){
    if(ready)return;ready=true;
    const nav=document.querySelector(".sidebar .nav");
    if(nav&&!nav.querySelector('[data-page="sprint28"]')){
      const btn=document.createElement("button");btn.dataset.page="sprint28";btn.type="button";btn.textContent="🏁 Reta final · 34 dias";
      btn.onclick=function(){switchPage("sprint28",this)};
      const before=nav.querySelector('[data-page="revisar"]');nav.insertBefore(btn,before||null);
    }
    const main=document.querySelector(".main");
    if(!main||document.getElementById("page-sprint28"))return;
    const page=document.createElement("section");page.id="page-sprint28";page.className="page";
    page.innerHTML='<div class="hero s28-header"><div><h2>Intensivão · 34 dias</h2><p>10/11 a 13/12/2026 · Cargo 3 AFFC — Infraestrutura de TI</p></div><span class="badge p3">🎯 Meta objetiva: 210/260 · Meta P4: 85/100</span></div>'+
      '<div id="s28VerseCard" class="s28-verse-card" role="region" aria-label="Versículo bíblico do dia de estudo"></div>'+
      '<div id="s28GoalTracker" class="s28-goalstrip"></div><div id="s28KPIs" class="s28-kpis"></div><div class="s28-progress" aria-label="Progresso de tarefas"><i id="s28Progress" role="progressbar" aria-valuemin="0" aria-valuemax="100"></i></div>'+
      '<div class="s28-card" style="margin-bottom:12px"><h3>Jornada realista e adaptável</h3><div class="s28-subline">Segunda a sexta: <b>04:00–05:20</b> e <b>18:00–20:00</b> (3h20 por dia). Manhã com revisão ativa, aula e questões; noite com segundo subitem, questões e aplicação ou treino Q1/Q2. Sábados e domingos: conteúdos novos, simulados combinados, treino Q1/Q2 e correção. Véspera da prova: carga reduzida para descanso. Os simulados integrais preservam suas durações oficiais mínimas. Tarefas já iniciadas não são substituídas automaticamente; as futuras podem mudar conforme seu desempenho. Todos os temas vêm do Edital cadastrado.</div>'+
      '<div class="s28-config"><div><label>Horas por sábado (exceto véspera)</label><input id="s28Sat" type="number" min="4" max="9" step="1"></div><div><label>Horas por domingo</label><input id="s28Sun" type="number" min="3" max="8" step="1"></div><button class="s28-action" type="button" onclick="CGU28_saveHours()">Salvar horas</button></div>'+
      '<div class="s28-subline">Nota: 34º dia é a prova. O volume é referência, não obrigação inflexível. A seleção estratégica não equivale a previsão oficial de temas.</div></div>'+
      '<div class="s28-layout"><div class="s28-card"><h3>Calendário adaptativo</h3>'+
      '<div class="s28-toolbar"><button data-filter="todos" class="s28-chip on" onclick="CGU28_filter(\'todos\')">Todos</button><button data-filter="pendentes" class="s28-chip" onclick="CGU28_filter(\'pendentes\')">Pendentes</button><button data-filter="simulados" class="s28-chip" onclick="CGU28_filter(\'simulados\')">Simulados</button><button data-filter="discursivas" class="s28-chip" onclick="CGU28_filter(\'discursivas\')">P4</button></div>'+
      '<div id="s28Timeline" class="s28-day-list"></div></div><div class="s28-card"><h3>Execução do dia</h3><div id="s28Daily"></div></div></div>'+
      '<div class="s28-card" style="margin-top:12px"><h3>Estimativa de concorrência · cenários, não previsão</h3><div class="s28-subline">Cargo 3: <b>6 vagas imediatas AC</b>, <b>25 aprovados AC no quadro de referência final</b> e <b>36 candidatos AC na referência para correção discursiva</b> (podendo haver situações específicas previstas no edital). Número de inscritos, abstenção e perfil de preparo não são conhecidos automaticamente. Sem dados observados, não existe cálculo confiável de concorrentes efetivos nem probabilidade de ficar entre os seis.</div>'+
      '<div id="s28CompInputs"></div><div id="s28CompOutput"></div>'+
      '<p class="s28-comp-notice">Fonte oficial: <a href="https://www.cebraspe.org.br/concursos/cgu_26_affc" target="_blank" rel="noopener noreferrer">Cebraspe · CGU 26 AFFC</a>. Percentuais de abstenção e preparo nesta calculadora são inteiramente configuráveis e ilustrativos.</p></div>'+
      '<div class="s28-card" style="margin-top:12px"><h3>Regras da seleção estratégica</h3><div class="s28-subline">1) Primeiro, subitens <b>não concluídos</b>, críticos e sem amostra. 2) <b>P3 recebe maior peso</b> pelo limite de 180/260 pontos e também alimenta o estudo de caso Q2 (70 pontos). 3) P2 integra teoria e redação Q1 (30 pontos). 4) Baixo líquido na <b>última rodada</b> eleva a necessidade de recuperação; 5) Casadinhas P2/P3 e P1/P3 geram simulados interdisciplinares. 6) Os temas mais prováveis são <b>hipóteses de prioridade</b>, nunca frequências oficiais divulgadas. Piso estratégico de 210/260 na objetiva, centro 220/260 e meta discursiva P4 de 85/100. A divisão interna de referência é P1 30, P2 32 e P3 148 pontos; não é requisito do edital. Nenhuma dessas metas garante a classificação.</div></div>';
    if(today()<START){
      const reminder=document.createElement("div");reminder.className="s28-logic";
      reminder.textContent="O intensivão começa amanhã, 10/11, às 04:00. A manhã termina às 05:20 e o bloco noturno vai de 18:00 a 20:00.";
      (page.querySelector("#s28VerseCard")||page.querySelector(".hero"))?.insertAdjacentElement("afterend",reminder);
    }
    const review=document.getElementById("page-revisar");
    if(review)review.insertAdjacentElement("beforebegin",page);else main.appendChild(page);
    const original=window.switchPage;
    if(typeof original==="function"&&!original.__s28Wrapped){
      const wrapped=function(name,btn){
        const r=original.apply(this,arguments);
        if(name==="sprint28"){
          const top=document.getElementById("topTitle");if(top)top.textContent="Intensivão · 34 dias";
          render({keepScroll:false,keepComp:false});
        }else if(name==="dashboard"){
          // O Dashboard possui cards e filas calculados no momento da renderização.
          // Recalcular ao entrar mantém os resultados da última rodada do Intensivão
          // sincronizados sem forçar renderAll nem refazer o restante das páginas.
          if(typeof renderDashboard==="function")renderDashboard();
        }
        return r;
      };
      wrapped.__s28Wrapped=true;
      window.switchPage=wrapped;
    }
    // Protege as produções reduzidas de 11/12 de entrar como simulado válido da P4.
    const originalP4Save=window.CGU_p4Save;
    if(typeof originalP4Save==="function"&&!originalP4Save.__s34TrainingProtected){
      const protectedP4Save=function(){
        const date=document.getElementById("p4-date")?.value;
        const type=document.getElementById("p4-type")?.value;
        const lines=Number(document.getElementById("p4-lines")?.value);
        const shortDecemberTraining=date==="2026-12-11"&&
          ((type==="q1"&&lines>0&&lines<=15)||(type==="q2"&&lines>0&&lines<=30));
        if(shortDecemberTraining){
          const training=document.getElementById("p4-training");
          if(training)training.checked=true;
        }
        return originalP4Save.apply(this,arguments);
      };
      protectedP4Save.__s34TrainingProtected=true;
      window.CGU_p4Save=protectedP4Save;
    }
    if(today()>=START&&today()<=EXAM)selected=today();
    render({keepScroll:false,keepComp:false});
    // O intensivão assume a navegação padrão do projeto na reta final.
    if(today()<=EXAM){
      const activeBtn=nav?.querySelector('[data-page="sprint28"]');
      if(activeBtn)window.switchPage("sprint28",activeBtn);
    }
    const afterDataHydration=()=>{
      freezeTodayAfterCloud();
      if(document.getElementById("page-sprint28")?.classList.contains("active"))render({keepComp:false});
    };
    window.addEventListener("cgu-cloud-ready",afterDataHydration);
    window.addEventListener("cgu-data-hydrated",afterDataHydration);
    // A nuvem pode terminar antes da carga sequencial dos módulos do Intensivão.
    if(window.CGU_cloudHydrated)afterDataHydration();
    window.addEventListener("cgu-question-recorded",ev=>{if(document.getElementById("page-sprint28")?.classList.contains("active")&&!String(ev.detail?.source||"").startsWith("reta-final-"))requestAnimationFrame(()=>render())});
    window.addEventListener("cgu-p4-changed",()=>{if(document.getElementById("page-sprint28")?.classList.contains("active"))requestAnimationFrame(()=>render())});
  }
  window.CGU28_render=render;
  window.CGU28_freezeToday=freezeTodayAfterCloud;
  setup();
})();