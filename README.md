# Gerador de Payload AJO — WhatsApp (MRV)

Extensão de navegador (Manifest V3, painel lateral) que monta o **payload JSON de "mensagem
ativa" WhatsApp** consumido pelas Custom Actions do **Adobe Journey Optimizer (AJO)**.

A extensão reproduz, em 4 etapas, o assistente do antigo Custom Activity do SFMC e gera
exatamente a mesma estrutura de payload que o backend espera — sem precisar montar o JSON à mão.

## Stack

- **Vite + React 18 + Tailwind CSS 3** (build local, sem código externo)
- **Manifest V3** com `sidePanel` + service worker
- Build estável com Vite "puro" (sem plugins beta) → `npm run build` funciona em qualquer Node

## Como rodar (desenvolvimento)

```bash
npm install
npm run dev      # vite build --watch → gera/atualiza a pasta dist/ a cada alteração
```

Depois, carregue a pasta `dist/` no Chrome (veja abaixo). Com `npm run dev` ativo, basta
recarregar a extensão (botão ⟳ em `chrome://extensions`) para ver as mudanças.

## Build de produção

```bash
npm install
npm run build    # gera a pasta dist/ pronta para publicar
```

## Carregar no Chrome (modo desenvolvedor)

1. Acesse `chrome://extensions`
2. Ative o **Modo do desenvolvedor** (canto superior direito)
3. Clique em **Carregar sem compactação** e selecione a pasta **`dist/`**
4. Fixe a extensão e clique no ícone — o painel lateral abre ao lado da aba.

## Como usar

Ao abrir, a extensão mostra a **seleção de canal**: **MIA Bot WhatsApp** (mensagem ativa via
Broker/MIA) ou **Infobip** (templates de WhatsApp via API da Infobip). O canal escolhido fica
salvo; use o **‹** no topo para trocar.

### Fluxo MIA Bot WhatsApp

1. **Definição do Template** — nome do template, ID do namespace e o bot (Maria Rosa / Comercial).
   O `botNumber` é preenchido automaticamente a partir do bot escolhido.
2. **Destinatários** — a expressão do AJO com o celular (`userNumber`). Use os atalhos
   `+ Journey Data` / `+ Profile` e complete o nome do campo.
3. **Corpo da Mensagem** — marque os parâmetros que o template usa (texto / mídia / botão) e
   adicione os valores. Se não houver parâmetros, apenas avance.
4. **Confirmação dos Dados** — revise o JSON e clique em **Copiar Payload**.

O rascunho é salvo automaticamente; use **Reiniciar** para limpar.

### Fluxo Infobip (templates de WhatsApp)

Assistente que busca os templates aprovados na Infobip e gera o payload do Custom Action:

1. **Configuração da API** — `API Key`, `Base URL` (ex: `jrpzv9.api-us.infobip.com`) e
   `Sender Number`. Clique em **Salvar e Carregar Templates**. As credenciais ficam salvas
   localmente; se a API estiver indisponível, a extensão cai para **templates de exemplo (mock)**
   sem travar a UI.
2. **Template e Mapeamento** — escolha o template e mapeie cada variável (`{{1}}`, `{{2}}`…) com
   um atributo do AJO (ex: `{{profile.person.name.firstName}}`). Opcionalmente inclua um botão
   Quick Reply (`postbackData`).
3. **Payload** — clique em **Gerar Payload JSON** e copie.

> **Formato crítico:** o endpoint exige o payload como **lista de 1 posição contendo o JSON
> stringificado** (`[ "{\"messages\":[…]}" ]`), não um objeto puro. O destinatário é fixo em
> `{{profile.mobilePhone.number}}` (ajustável em
> [`src/utils/infobipPayloadGenerator.js`](src/utils/infobipPayloadGenerator.js)).

Cada canal guarda seu rascunho de forma independente (`ajo_payload_draft_whatsapp` /
`ajo_payload_draft_infobip`); as credenciais Infobip ficam em `infobip_config`; o canal ativo em
`ajo_channel`.

## Contrato do payload (fonte da verdade)

A geração espelha:

- `com_aep_message_processor/.../EnviarMensagemAtivaMiaPayloadDeserializationTests.cs` (lado AEP/AJO)
- `com_sf_custom_activity/backend/src/function/send-message.ts` (lado SFMC)

Estrutura gerada:

```json
{
  "templateName": "com_em_atendimento_qas",
  "namespaceId": "42ba822d_ff86_03d5_81f1_01d86d6d9e4d",
  "attachedBot": "BotComercial",
  "botNumber": "558007289000",
  "userNumber": "{{Event.journeyData.celular}}",
  "components": [
    { "type": "body", "parameters": [{ "type": "text", "text": "Henrique" }] },
    { "type": "header", "parameters": [{ "type": "image", "image": { "link": "https://..." } }] },
    {
      "type": "button",
      "buttonIndex": 0,
      "buttonSubtype": "quick_reply",
      "parameters": [{ "type": "payload", "payload": "OPCAO_SIM", "text": "Confirmar" }]
    }
  ]
}
```

Regras importantes (já aplicadas pelo gerador):

- **Mídia**: o link é sempre um objeto `{ "link": "..." }` (string crua é rejeitada pelo backend).
- **Botão**: um único campo **"Texto do botão"** que vira `payload` (quick_reply) ou `text` (url),
  conforme o "Tipo do botão" exibido. O rótulo visível do botão vem do próprio template aprovado,
  então só esse valor é necessário em runtime.
- **Texto**: todos os valores entram em **um único** componente `type: "body"`, na ordem.

### Mapa de bots

Editável em [`src/config/bots.js`](src/config/bots.js). Valores de **produção** (de `env.ts`):

| Label (UI)  | botName (`attachedBot`) | botNumber      |
| ----------- | ----------------------- | -------------- |
| Maria Rosa  | `MariaRosa`             | `553199009000` |
| Comercial   | `BotComercial`          | `558007289000` |

> O ambiente **QAS** usa `553173160076` para ambos — há a lista `BOTS_QAS` pronta no mesmo arquivo.

## Publicação na Chrome Web Store

- **Sem código externo**: todo o JS/CSS é compilado localmente em `dist/` — nenhum `<script src="https://...">`.
- **Justificativa das permissões** (cole no painel do desenvolvedor):
  - `sidePanel`: "Permite configurar o payload no painel lateral, sem sair da aba do AJO."
  - `clipboardWrite`: "Permite copiar o JSON gerado com um clique."
  - `storage`: "Salva o rascunho do formulário e as credenciais da Infobip localmente."
  - `host_permissions` (`*.infobip.com`, `*.ibintegrations.com`): "Buscar os templates de WhatsApp aprovados na Infobip."
- **Política de privacidade**: veja [`PRIVACY.md`](PRIVACY.md) — processamento local; o canal Infobip envia apenas as credenciais à Infobip para listar templates.
- Para publicar como `.zip`: compacte o **conteúdo da pasta `dist/`** (com o `manifest.json` na raiz do zip).

## Estrutura

```
lima-payload-generator/
├── public/
│   ├── manifest.json          # Manifest V3 (copiado para dist/)
│   └── icons/                 # 16/48/128
├── src/
│   ├── components/            # Stepper, steps, primitivos de UI
│   ├── config/bots.js         # mapa bot → número (editar aqui)
│   ├── utils/payloadGenerator.js  # lógica pura de montagem do JSON
│   ├── utils/{storage,clipboard}.js
│   ├── App.jsx
│   ├── background.js          # service worker (abre o side panel)
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```
