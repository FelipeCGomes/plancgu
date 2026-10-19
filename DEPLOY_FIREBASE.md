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
4. Em **Users**, mantenha criada apenas a conta privada já cadastrada para este painel.
5. Não é necessário habilitar Google para esta versão.

A tela pública do painel mostra somente o campo **Senha**. O endereço da conta autorizada não é exibido no formulário nem em texto legível no HTML.

A senha não fica armazenada no repositório. Ela é validada diretamente pelo Firebase Authentication.

## 3. Firestore

O arquivo `firestore.rules` limita os dados ao UID autenticado e exige login pelo provedor `password`:

```text
/users/{uid}/...
```

Uma sessão autenticada não consegue ler os documentos de outro UID.

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

- `firebase.js`: inicialização do Firebase, validação da conta autorizada, Authentication e Firestore.
- `auth.js`: tela de login privado usando apenas a senha.
- `cloud-sync.js`: sincronização entre localStorage e Firestore.
- `firestore.rules`: regras de segurança.
- `firebase.json`: Hosting + regras do Firestore.
- `.firebaserc`: projeto padrão `cgu-plan`.

## Observação de segurança

O `firebaseConfig` e a `apiKey` do aplicativo Web podem ficar no JavaScript do navegador. Eles identificam o projeto, mas não concedem acesso aos dados.

O e-mail autorizado foi retirado da interface e não aparece como texto simples nos arquivos principais. Ainda assim, como Firebase Hosting entrega código JavaScript ao navegador, nenhuma informação usada pelo cliente deve ser tratada como segredo absoluto. A proteção real continua sendo o Firebase Authentication e as regras do Firestore.
