// Verifies generatePayload() against the real backend test fixtures.
//  - AEP:  EnviarMensagemAtivaMiaPayloadDeserializationTests.cs
//  - SFMC: send-message.spec.ts
import { generatePayload } from './src/utils/payloadGenerator.js'
import {
  buildInfobipPayloadObject,
  buildInfobipPayloadList,
} from './src/utils/infobipPayloadGenerator.js'

function canon(v) {
  if (Array.isArray(v)) return v.map(canon)
  if (v && typeof v === 'object') {
    return Object.keys(v)
      .sort()
      .reduce((o, k) => ((o[k] = canon(v[k])), o), {})
  }
  return v
}
const eq = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b))

let pass = 0
let fail = 0
function check(name, actual, expected) {
  if (eq(actual, expected)) {
    console.log(`✓ ${name}`)
    pass++
  } else {
    console.log(`✗ ${name}`)
    console.log('  expected:', JSON.stringify(canon(expected)))
    console.log('  actual:  ', JSON.stringify(canon(actual)))
    fail++
  }
}

// Case A — AEP-shaped payload: image header + quick_reply button (BotComercial).
// With the single "Texto do botão" field, quick_reply emits payload only (the label
// lives in the approved template). The AEP deserializer accepts this (text is optional).
check(
  'AEP shape: header image + quick_reply button (payload only)',
  generatePayload({
    templateName: 'com_em_atendimento_qas',
    namespaceId: '42ba822d_ff86_03d5_81f1_01d86d6d9e4d',
    botName: 'BotComercial',
    userNumber: '5551993173113',
    hasText: false,
    textParams: [],
    hasMedia: true,
    mediaParams: [
      { componentType: 'header', parameterType: 'image', link: 'https://exemplo.mrv.com.br/banner.jpg' },
    ],
    hasButton: true,
    buttonParams: [{ buttonIndex: 0, buttonSubtype: 'quick_reply', value: 'OPCAO_SIM' }],
  }),
  {
    templateName: 'com_em_atendimento_qas',
    namespaceId: '42ba822d_ff86_03d5_81f1_01d86d6d9e4d',
    attachedBot: 'BotComercial',
    botNumber: '558007289000',
    userNumber: '5551993173113',
    components: [
      { type: 'header', parameters: [{ type: 'image', image: { link: 'https://exemplo.mrv.com.br/banner.jpg' } }] },
      {
        type: 'button',
        buttonIndex: 0,
        buttonSubtype: 'quick_reply',
        parameters: [{ type: 'payload', payload: 'OPCAO_SIM' }],
      },
    ],
  },
)

// Case B — SFMC fixture: two text params → single body component (MariaRosa)
check(
  'SFMC: two text params → one body component',
  generatePayload({
    templateName: 'mocked_template_name',
    namespaceId: 'mocked_namespaceId',
    botName: 'MariaRosa',
    userNumber: 'mocked_user_number',
    hasText: true,
    textParams: ['mocked_text_param_01', 'mocked_text_param_02'],
    hasMedia: false,
    mediaParams: [],
    hasButton: false,
    buttonParams: [],
  }).components,
  [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: 'mocked_text_param_01' },
        { type: 'text', text: 'mocked_text_param_02' },
      ],
    },
  ],
)

// Case C — SFMC fixture: no params → empty components + MariaRosa number
const noParams = generatePayload({
  templateName: 'mocked_template_name',
  namespaceId: 'mocked_namespaceId',
  botName: 'MariaRosa',
  userNumber: 'mocked_user_number_0',
  hasText: false,
  textParams: [],
  hasMedia: false,
  mediaParams: [],
  hasButton: false,
  buttonParams: [],
})
check('SFMC: no params → empty components', noParams, {
  templateName: 'mocked_template_name',
  namespaceId: 'mocked_namespaceId',
  attachedBot: 'MariaRosa',
  botNumber: '553199009000',
  userNumber: 'mocked_user_number_0',
  components: [],
})

// Case D — video + document media, and url button (type → text)
check(
  'video + document media',
  generatePayload({
    templateName: 't', namespaceId: 'n', botName: 'MariaRosa', userNumber: 'u',
    hasMedia: true,
    mediaParams: [
      { componentType: 'header', parameterType: 'video', link: 'https://v.mp4' },
      { componentType: 'header', parameterType: 'document', link: 'https://d.pdf' },
    ],
  }).components,
  [
    { type: 'header', parameters: [{ type: 'video', video: { link: 'https://v.mp4' } }] },
    { type: 'header', parameters: [{ type: 'document', document: { link: 'https://d.pdf' } }] },
  ],
)
check(
  'url button → type text (single value)',
  generatePayload({
    templateName: 't', namespaceId: 'n', botName: 'MariaRosa', userNumber: 'u',
    hasButton: true,
    buttonParams: [{ buttonIndex: 1, buttonSubtype: 'url', value: 'https://mrv.com' }],
  }).components,
  [{ type: 'button', buttonIndex: 1, buttonSubtype: 'url', parameters: [{ type: 'text', text: 'https://mrv.com' }] }],
)

// Case F — legacy draft (old {text, payload} shape, no `value`) still maps correctly.
check(
  'legacy button draft → still maps (quick_reply uses payload)',
  generatePayload({
    templateName: 't', namespaceId: 'n', botName: 'MariaRosa', userNumber: 'u',
    hasButton: true,
    buttonParams: [{ buttonIndex: 0, buttonSubtype: 'quick_reply', text: 'Confirmar', payload: 'OPCAO_SIM' }],
  }).components,
  [{ type: 'button', buttonIndex: 0, buttonSubtype: 'quick_reply', parameters: [{ type: 'payload', payload: 'OPCAO_SIM' }] }],
)

// ---- Infobip Payload Builder ----
check(
  'Infobip: numbered body vars + channel WHATSAPP + default destination',
  buildInfobipPayloadObject({
    sender: '553173000653',
    templateName: 'boas_vindas_v2',
    language: 'pt_BR',
    mappedValues: ['{{profile.person.name.firstName}}', '{{profile.productOffer.name}}'],
  }),
  {
    messages: [
      {
        channel: 'WHATSAPP',
        sender: '553173000653',
        destinations: [{ to: '{{profile.mobilePhone.number}}' }],
        template: { templateName: 'boas_vindas_v2', language: 'pt_BR' },
        content: {
          body: {
            type: 'TEXT',
            1: '{{profile.person.name.firstName}}',
            2: '{{profile.productOffer.name}}',
          },
        },
      },
    ],
  },
)

const ibList = buildInfobipPayloadList({
  sender: 's',
  templateName: 't',
  language: 'pt_BR',
  mappedValues: ['a'],
})
check(
  'Infobip: contract is a 1-element array of a stringified object',
  { isArray: Array.isArray(ibList), len: ibList.length, itemType: typeof ibList[0] },
  { isArray: true, len: 1, itemType: 'string' },
)
check(
  'Infobip: stringified element parses back to the object',
  JSON.parse(ibList[0]).messages[0].content.body,
  { type: 'TEXT', 1: 'a' },
)
check(
  'Infobip: includeButton adds QUICK_REPLY postback',
  buildInfobipPayloadObject({
    sender: 's',
    templateName: 't',
    language: 'l',
    mappedValues: [],
    includeButton: true,
    postbackData: 'SAIR',
  }).messages[0].content.buttons,
  [{ type: 'QUICK_REPLY', postbackData: 'SAIR' }],
)

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
