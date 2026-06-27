# Política de Privacidade — Gerador de Payload AJO

**Última atualização:** 2026-06-26

Esta extensão foi desenvolvida para uso interno da equipe de CRM/Journey da MRV.

## Coleta e uso de dados

- **O gerador roda localmente.** Os valores que você digita (template, namespace, número,
  parâmetros, mapeamentos) são usados apenas para montar o JSON exibido na tela, que você copia
  manualmente. O payload gerado **não é enviado a lugar nenhum** pela extensão.
- **Exceção — canal Infobip:** ao clicar em "Salvar e Carregar Templates", a extensão envia sua
  **API Key, Base URL e Sender** ao middleware da Infobip (`*.ibintegrations.com` / `*.infobip.com`)
  **somente** para buscar a lista de templates aprovados. Nenhum outro dado é transmitido.

## Armazenamento local

- A extensão usa `chrome.storage.local` para salvar um **rascunho** do formulário em andamento e,
  no canal Infobip, as **credenciais** (API Key, Base URL, Sender) para não precisar redigitá-las.
- Tudo fica somente no seu dispositivo e pode ser apagado a qualquer momento pelo botão
  **"Reiniciar"** dentro de cada canal ou removendo a extensão.

## Permissões

- `sidePanel` — exibir a interface no painel lateral, ao lado da aba do AJO.
- `storage` — salvar o rascunho do formulário e as credenciais da Infobip localmente.
- `clipboardWrite` — copiar o JSON gerado para a área de transferência com um clique.
- `host_permissions` (`*.infobip.com`, `*.ibintegrations.com`) — buscar os templates de WhatsApp
  aprovados na Infobip (apenas no canal Infobip).

## Contato

Dúvidas sobre privacidade: entre em contato com a equipe responsável pela extensão.
