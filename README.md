# CGU 2026 — Plano de Estudos Adaptativo

Painel de estudos para o Cargo 3 — AFFC / Infraestrutura de TI.

O projeto está preparado para Firebase Hosting, Firebase Authentication, Firestore por UID, sincronização entre computador e celular, cache local, dashboard de desempenho, plano diário adaptativo e registro de questões.

## Deploy

Veja o passo a passo completo em `DEPLOY_FIREBASE.md`.

Resumo:

```bash
git clone https://github.com/FelipeCGomes/plancgu.git
cd plancgu
npm install -g firebase-tools
firebase login
firebase use cgu-plan
firebase deploy --only hosting,firestore:rules
```

No Windows, depois do `firebase login`, também é possível executar `deploy-firebase.bat`.

## Antes do primeiro deploy

No Firebase Console, habilite pelo menos um provedor em Authentication > Sign-in method. O projeto suporta Email/Senha e Google. Para uso pessoal, crie seu usuário em Authentication > Users; o site não possui cadastro público.
