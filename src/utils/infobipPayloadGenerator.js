// Builds the Infobip "send WhatsApp template" payload for an AJO Custom Action.
// Source of truth: dev instruction "Infobip Payload Builder".
//
// CRITICAL CONTRACT: the destination endpoint expects the payload as a STRINGIFIED JSON
// inside a one-element array — i.e. [ JSON.stringify(payloadObj) ] — NOT a raw object.
const DEFAULT_DESTINATION = '{{profile.mobilePhone.number}}'

// The body uses positional NUMBERED keys ("1", "2", ...) from the mapped values, in order.
export function buildInfobipPayloadObject({
  sender,
  templateName,
  language,
  mappedValues = [],
  destination = DEFAULT_DESTINATION,
  includeButton = false,
  postbackData = 'SAIR',
}) {
  const body = { type: 'TEXT' }
  mappedValues.forEach((val, idx) => {
    body[String(idx + 1)] = val
  })

  const content = { body }
  if (includeButton) {
    content.buttons = [{ type: 'QUICK_REPLY', postbackData: postbackData || 'SAIR' }]
  }

  return {
    messages: [
      {
        channel: 'WHATSAPP',
        sender: sender || '',
        destinations: [{ to: destination || DEFAULT_DESTINATION }],
        template: {
          templateName: templateName || '',
          language: language || '',
        },
        content,
      },
    ],
  }
}

// The actual contract shape: a 1-element array whose only item is the stringified object.
export function buildInfobipPayloadList(opts) {
  return [JSON.stringify(buildInfobipPayloadObject(opts))]
}

// Pretty string for the output textarea: the list, with the escaped JSON string inside.
export function infobipOutputString(opts) {
  return JSON.stringify(buildInfobipPayloadList(opts), null, 2)
}
