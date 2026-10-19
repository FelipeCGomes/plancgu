# Deploy no Firebase — CGU Plan

O projeto já está configurado para o Firebase `cgu-plan`.

## 1. Baixar o projeto

No terminal:

```bash
git clone https://github.com/FelipeCGomes/plancgu.git
cd plancgu
```

Ou baixe o ZIP pelo GitHub e extraia em uma pasta.

## 2. Habilitar autenticação no Firebase

No Firebase Console:

1. Abra **Authentication**.
2. Clique em **Sign-in method**.
3. Habilite **Email/Password**.
4. Opcionalmente, habilite **Google**.
5. Em **Users**, crie o usuário que será usado para entrar no painel.

O site não possui cadastro público. Isso evita que qualquer visitante crie uma conta por conta própria.

## 3. Firestore

O arquivo `firestore.rules` já limita os dados ao UID autenticado:

```text
/users/{uid}/...
```

Cada usuário autenticado só consegue acessar os próprios documentos.

## 4. Instalar Firebase CLI

Com Node.js instalado:

```bash
npm install -g firebase-tools
firebase login
```

## 5. Fazer o deploy

No diretório do projeto:

```bash
firebase use cgu-plan
firebase deploy --only hosting,firestore:rules
```

No Windows, também é possível executar:

```text
deploy-firebase.bat
```

## 6. Como a sincronização funciona

- **Firestore**: fonte compartilhada entre computador e celular.
- **localStorage**: cache local e contingência quando a conexão não estiver disponível.
- No primeiro login, se o Firestore ainda estiver vazio, o progresso já existente no navegador é enviado para a nuvem.
- Se já existir progresso no Firestore e o navegador ainda não estiver vinculado àquela conta, a versão da nuvem prevalece para evitar sobrescrever dados por engano.
- Depois da primeira sincronização, as alterações são gravadas automaticamente no Firestore.

O estado principal é salvo no documento:

```text
users/{uid}/app/state
```

## 7. Arquivos principais do Firebase

- `firebase.js`: inicialização do Firebase, Authentication e Firestore.
- `auth.js`: tela de login usando Firebase Authentication.
- `cloud-sync.js`: sincronização entre localStorage e Firestore.
- `firestore.rules`: regras de segurança.
- `firebase.json`: Hosting + regras do Firestore.
- `.firebaserc`: projeto padrão `cgu-plan`.

## Observação de segurança

O `firebaseConfig` e a `apiKey` do aplicativo Web podem ficar no JavaScript do navegador. Eles identificam o projeto, mas **não substituem autenticação nem regras de segurança**. A proteção dos dados é feita pelo Firebase Authentication e por `firestore.rules`.
