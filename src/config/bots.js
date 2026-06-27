// Bot mapping — mirrors env.ts `enum Bots` in com_sf_custom_activity (the backend that
// resolves botNumber from botName via env.Bots[botName]).
//
//   label     -> shown in the dropdown (matches the original wizard UI)
//   botName   -> the `attachedBot` value sent in the payload (also the lookup key)
//   botNumber -> the `botNumber` value sent in the payload
//
// PRODUCTION numbers (env.ts, currently active enum):
export const BOTS = [
  { label: 'Maria Rosa', botName: 'MariaRosa', botNumber: '553199009000' },
  { label: 'Comercial', botName: 'BotComercial', botNumber: '558007289000' },
]

// QAS/homologação alternative (env.ts commented block) — both bots used 553173160076.
// Swap BOTS for this list (or edit the numbers above) when generating for the QAS environment.
export const BOTS_QAS = [
  { label: 'Maria Rosa', botName: 'MariaRosa', botNumber: '553173160076' },
  { label: 'Comercial', botName: 'BotComercial', botNumber: '553173160076' },
]

export function findBot(botName) {
  return BOTS.find((b) => b.botName === botName) ?? null
}
