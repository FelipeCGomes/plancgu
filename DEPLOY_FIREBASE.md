# Deploy no Firebase — CGU Plan

O projeto já está configurado para o Firebase `cgu-plan`.

## 1. Baixar o projeto

No terminal:

```bash
git clone https://github.com/FelipeCGomes/plancgu.git
cd plancgu
```

Ou baixe o ZIP pelo GitHub e extraia em uma pasta.

## 2. Autenticação

No Firebase Console:

1. Abra **Authentication**.
2. Clique em **Sign-in method**.
3. Habilite **Email/Password**.
4. Em **Users**, mantenha criada a conta privada do painel.
5. Não é necessário habilitar Google nesta versão.

A tela pública do painel mostra somente o campo **Senha**. O endereço da conta autorizada não é exibido no formulário.

A senha não fica armazenada no repositório. Ela é validada diretamente pelo Firebase Authentication.

## 3. Firestore — acesso single-user

O Firestore está travado diretamente no UID autorizado:

```text
V8uLmGwlxUVnHUjr5IDm5wjEp542
```

Além disso, a regra exige autenticação pelo provedor `password` e permite acesso somente ao próprio caminho:

```text
users/{uid}/...
```

Qualquer outro UID autenticado continua sem permissão de leitura ou gravação.

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
- Se já existir progresso no Firestore e o navegador ainda não estiver vinculado à conta, a versão da nuvem prevalece para evitar sobrescrever dados por engano.
- Depois da primeira sincronização, as alterações são gravadas automaticamente no Firestore.

O estado principal é salvo no documento:

```text
users/V8uLmGwlxUVnHUjr5IDm5wjEp542/app/state
```

## 7. Arquivos principais do Firebase

- `firebase.js`: inicialização do Firebase, validação pelo UID autorizado, Authentication e Firestore.
- `auth.js`: tela de login privado usando apenas a senha.
- `cloud-sync.js`: sincronização entre localStorage e Firestore.
- `firestore.rules`: regra de segurança travada ao UID autorizado.
- `firebase.json`: Hosting + regras do Firestore.
- `.firebaserc`: projeto padrão `cgu-plan`.

## Observação de segurança

O `firebaseConfig`, a API key Web e o UID podem ser públicos no cliente sem conceder acesso à conta. Eles não substituem a senha nem um token autenticado.

A proteção efetiva dos dados é feita em duas camadas: Firebase Authentication e regras do Firestore. Mesmo que alguém altere o JavaScript no navegador, o Firestore rejeita uma sessão cujo UID seja diferente do autorizado.
