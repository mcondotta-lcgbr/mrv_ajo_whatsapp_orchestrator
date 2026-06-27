import { findBot } from '../config/bots.js'

// Builds the final WhatsApp "mensagem ativa" payload exactly as the backend expects it.
//
// Source of truth:
//  - com_aep_message_processor .../EnviarMensagemAtivaMiaPayloadDeserializationTests.cs (AEP/AJO side)
//  - com_sf_custom_activity/backend/src/function/send-message.ts (SFMC side, identical shape)
//
// Output shape:
// {
//   templateName, namespaceId, attachedBot, botNumber, userNumber,
//   components: [
//     { type: "body",   parameters: [{ type: "text", text }] },                              // text
//     { type: "header", parameters: [{ type: "image", image: { link } }] },                  // media
//     { type: "button", buttonIndex, buttonSubtype, parameters: [{ type, payload?, text? }] } // button
//   ]
// }

const isFilled = (v) => typeof v === 'string' && v.trim() !== ''

// quick_reply buttons carry a `payload`; url buttons carry `text`.
export function buttonParamType(buttonSubtype) {
  return buttonSubtype === 'url' ? 'text' : 'payload'
}

export function generatePayload(form) {
  const bot = findBot(form.botName)

  const payload = {
    templateName: (form.templateName || '').trim(),
    namespaceId: (form.namespaceId || '').trim(),
    attachedBot: form.botName || '',
    botNumber: bot ? bot.botNumber : '',
    userNumber: (form.userNumber || '').trim(),
    components: [],
  }

  // 1) TEXT — a single "body" component holding every positional text value, in order.
  if (form.hasText) {
    const texts = (form.textParams || []).filter(isFilled).map((t) => t.trim())
    if (texts.length > 0) {
      payload.components.push({
        type: 'body',
        parameters: texts.map((text) => ({ type: 'text', text })),
      })
    }
  }

  // 2) MEDIA — one component per media item. The link MUST be an object { link }.
  if (form.hasMedia) {
    for (const m of form.mediaParams || []) {
      if (!isFilled(m.link)) continue
      const parameterType = m.parameterType || 'image'
      payload.components.push({
        type: m.componentType || 'header',
        parameters: [
          {
            type: parameterType,
            [parameterType]: { link: m.link.trim() },
          },
        ],
      })
    }
  }

  // 3) BUTTON — one "button" component per button. A single "Texto do botão" value maps
  //    to `payload` for quick_reply or `text` for url (per buttonParamType). The button
  //    label itself comes from the approved WhatsApp template, so only this value is needed.
  if (form.hasButton) {
    for (const b of form.buttonParams || []) {
      const type = buttonParamType(b.buttonSubtype)
      // Prefer the unified `value`; fall back to legacy text/payload fields for old drafts.
      const legacy = type === 'payload' ? b.payload : b.text
      const value = (b.value ?? legacy ?? '').toString().trim()

      const parameter = { type }
      if (value) parameter[type] = value

      payload.components.push({
        type: 'button',
        buttonIndex: Number.parseInt(b.buttonIndex, 10) || 0,
        buttonSubtype: b.buttonSubtype || 'quick_reply',
        parameters: [parameter],
      })
    }
  }

  return payload
}

export function payloadToString(payload) {
  return JSON.stringify(payload, null, 2)
}
