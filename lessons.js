const KEY="gran-cgu-controladoria-geral-da-uniao";

const LESSONS=[
  {id:"pf1",exam:"P1",priority:"Alta",course:"Estado, Democracia, Direitos e Ciência Política",title:"1 - Princípios Fundamentais",sec:2065},
  {id:"pf2",exam:"P1",priority:"Alta",course:"Estado, Democracia, Direitos e Ciência Política",title:"2 - Princípios Fundamentais II",sec:2562},
  {id:"gov8",exam:"P2",priority:"Alta",course:"Governança, Riscos e Integridade",title:"8 - Governança Pública",sec:1551},
  {id:"gov9",exam:"P2",priority:"Alta",course:"Governança, Riscos e Integridade",title:"9 - Governança Pública II",sec:1812},
  {id:"gov10",exam:"P2",priority:"Alta",course:"Governança, Riscos e Integridade",title:"10 - Governança Pública III",sec:2247},
  {id:"gov11",exam:"P2",priority:"Alta",course:"Governança, Riscos e Integridade",title:"11 - Governança Pública IV",sec:2394},
  {id:"gov12",exam:"P2",priority:"Alta",course:"Governança, Riscos e Integridade",title:"12 - Accountability",sec:1644},
  {id:"risk1",exam:"P2",priority:"Crítica",course:"Governança, Riscos e Integridade",title:"1 - Gestão de Riscos",sec:2101},
  {id:"risk2",exam:"P2",priority:"Crítica",course:"Governança, Riscos e Integridade",title:"2 - Gestão de Riscos II",sec:2394},
  {id:"risk3",exam:"P2",priority:"Crítica",course:"Governança, Riscos e Integridade",title:"3 - Gestão de Riscos III",sec:1752},
  {id:"risk4",exam:"P2",priority:"Crítica",course:"Governança, Riscos e Integridade",title:"4 - Gestão de Riscos IV",sec:1388},
  {id:"int1",exam:"P2",priority:"Alta",course:"Governança, Riscos e Integridade",title:"1 - Programas de Integridade e Compliance",sec:1565},
  {id:"int2",exam:"P2",priority:"Alta",course:"Governança, Riscos e Integridade",title:"2 - Programas de Integridade e Compliance II",sec:2121},
  {id:"int3",exam:"P2",priority:"Alta",course:"Governança, Riscos e Integridade",title:"3 - Programas de Integridade e Compliance III",sec:1367},
  {id:"lai1",exam:"P2",priority:"Alta",course:"Transparência, Ouvidoria e Participação Social",title:"1 - LAI - Art. 1º ao 5º",sec:2266},
  {id:"lai2",exam:"P2",priority:"Alta",course:"Transparência, Ouvidoria e Participação Social",title:"2 - LAI - Art. 6º ao 9º",sec:2202},
  {id:"lai3",exam:"P2",priority:"Alta",course:"Transparência, Ouvidoria e Participação Social",title:"3 - LAI - Art. 10 ao 20",sec:2036},
  {id:"lai4",exam:"P2",priority:"Alta",course:"Transparência, Ouvidoria e Participação Social",title:"4 - LAI - Art. 21 ao 31",sec:2132},
  {id:"lai5",exam:"P2",priority:"Alta",course:"Transparência, Ouvidoria e Participação Social",title:"5 - LAI - Art. 32 ao 46",sec:1494},
  {id:"lgpd1",exam:"P2",priority:"Alta",course:"Transparência, Ouvidoria e Participação Social",title:"1 - LGPD",sec:1791},
  {id:"lgpd2",exam:"P2",priority:"Alta",course:"Transparência, Ouvidoria e Participação Social",title:"2 - LGPD II",sec:1536},
  {id:"lgpd3",exam:"P2",priority:"Alta",course:"Transparência, Ouvidoria e Participação Social",title:"3 - LGPD III",sec:1670},
  {id:"lgpd4",exam:"P2",priority:"Alta",course:"Transparência, Ouvidoria e Participação Social",title:"4 - LGPD IV",sec:1713},
  {id:"lei9784_5",exam:"P1",priority:"Alta",course:"Ética Pública e Responsabilidade Profissional",title:"5 - Lei 9.784/99 - Impedimento e Suspeição",sec:1221},
  {id:"coi11",exam:"P1",priority:"Alta",course:"Ética Pública e Responsabilidade Profissional",title:"11 - Lei de Conflito de Interesses (Lei 12.813/2013)",sec:2029},
  {id:"coi12",exam:"P1",priority:"Alta",course:"Ética Pública e Responsabilidade Profissional",title:"12 - Lei de Conflito de Interesses - Exercícios",sec:1829},
  {id:"orc1",exam:"P1",priority:"Média",course:"Administração Pública e Políticas Públicas",title:"1 - Orçamento Público - Conceito",sec:2161},
  {id:"orc5",exam:"P1",priority:"Média",course:"Administração Pública e Políticas Públicas",title:"5 - PPA",sec:1829},
  {id:"orc9",exam:"P1",priority:"Média",course:"Administração Pública e Políticas Públicas",title:"9 - LDO",sec:2133},
  {id:"orc13",exam:"P1",priority:"Média",course:"Administração Pública e Políticas Públicas",title:"13 - LOA",sec:1850},
  {id:"adm1",exam:"P1",priority:"Média",course:"Estado, Democracia, Direitos e Ciência Política",title:"Administração Pública - 1 - Princípios",sec:1903},
  {id:"adm2",exam:"P1",priority:"Média",course:"Estado, Democracia, Direitos e Ciência Política",title:"Administração Pública - 2 - Princípios II",sec:997},
  {id:"df1",exam:"P1",priority:"Média",course:"Estado, Democracia, Direitos e Ciência Política",title:"Direitos Fundamentais - 1 - Teoria Geral",sec:1776},
  {id:"df2",exam:"P1",priority:"Média",course:"Estado, Democracia, Direitos e Ciência Política",title:"Direitos Fundamentais - 2 - Teoria Geral II",sec:1484},
  {id:"df21",exam:"P1",priority:"Média",course:"Estado, Democracia, Direitos e Ciência Política",title:"Direitos Fundamentais - 21 - Direitos Sociais",sec:1806},
  {id:"df25",exam:"P1",priority:"Média",course:"Estado, Democracia, Direitos e Ciência Política",title:"Direitos Fundamentais - 25 - Direitos Políticos",sec:1900},
  {id:"df26",exam:"P1",priority:"Média",course:"Estado, Democracia, Direitos e Ciência Política",title:"Direitos Fundamentais - 26 - Direitos Políticos II",sec:2467},
  {id:"df27",exam:"P1",priority:"Média",course:"Estado, Democracia, Direitos e Ciência Política",title:"Direitos Fundamentais - 27 - Partidos Políticos",sec:2604}
];

const FUTURE_P3=[
  {course:"Cibersegurança, Privacidade e Continuidade de Serviços",topic:"1 Riscos e arquitetura de segurança → 2 Identidades e proteção criptográfica",priority:"Crítica"},
  {course:"Computação em Nuvem, Virtualização e Automação",topic:"1 Modelos e arquitetura de nuvem → 2 Virtualização e contêineres",priority:"Crítica"},
  {course:"Operação, Governança e Gestão de Serviços Digitais",topic:"1 Confiabilidade e observabilidade → 3 Gestão de serviços e mudanças",priority:"Crítica"},
  {course:"Redes, Sistemas e Plataformas de Dados",topic:"1 Redes e comunicação → 2 Sistemas e diretórios",priority:"Alta"},
  {course:"Cibersegurança, Privacidade e Continuidade de Serviços",topic:"4 Resposta a incidentes → 6 Continuidade e recuperação",priority:"Crítica"},
  {course:"Computação em Nuvem, Virtualização e Automação",topic:"4 Infraestrutura como código → 5 Migração e modernização",priority:"Crítica"},
  {course:"Operação, Governança e Gestão de Serviços Digitais",topic:"5 Contratações e gestão de fornecedores",priority:"Crítica"},
  {course:"Redes, Sistemas e Plataformas de Dados",topic:"4 Plataformas de bancos de dados → 5 SQL e sustentação de dados",priority:"Alta"}
];
let lessonState={};

const PRE_RELEASE_DAILY={
  "2026-10-19":["pf1","pf2","gov8"],
  "2026-10-20":["gov9","gov12","risk1"],
  "2026-10-21":["risk2","risk3","risk4","int1"]
};
