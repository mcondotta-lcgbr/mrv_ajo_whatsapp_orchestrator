// Infobip template loading (via the legacy middleware) with a mandatory mock fallback.
const ENDPOINT = 'https://infobip-message.ibintegrations.com/infobip/getWhatsappTemplates'
const MID = '110008031'

// Mock used whenever the API is unreachable / the key is inactive (per dev instruction).
export const MOCK_TEMPLATES = [
  { name: 'boas_vindas_v2', language: 'pt_BR', variables: ['nome', 'produto'] },
  { name: 'cobranca_boleto', language: 'pt_BR', variables: ['nome', 'valor', 'vencimento'] },
]

export async function fetchTemplates(config) {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: config.apiKey || '',
        baseUrl: config.baseUrl || '',
        sender: config.sender || '',
        mid: MID,
      }),
    })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const data = await res.json()
    const normalized = normalizeTemplates(data)
    if (!normalized || normalized.length === 0) throw new Error('Resposta sem templates')
    return { templates: normalized, usedMock: false }
  } catch (err) {
    // Generous catch — never block the UI; fall back to mock data.
    return {
      templates: MOCK_TEMPLATES,
      usedMock: true,
      error: String(err && err.message ? err.message : err),
    }
  }
}

// The real API response shape is unknown, so normalize defensively to { name, language, variables[] }.
function normalizeTemplates(data) {
  const arr = Array.isArray(data)
    ? data
    : Array.isArray(data?.templates)
      ? data.templates
      : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.data)
          ? data.data
          : null
  if (!arr) return null
  return arr
    .map((t) => ({
      name: t.name ?? t.templateName ?? t.template ?? '',
      language: t.language ?? t.lang ?? t.languageCode ?? 'pt_BR',
      variables: normalizeVars(t),
    }))
    .filter((t) => t.name)
}

function normalizeVars(t) {
  if (Array.isArray(t.variables)) {
    return t.variables.map((v, i) => (typeof v === 'string' ? v : (v?.name ?? `var${i + 1}`)))
  }
  if (typeof t.variablesCount === 'number') {
    return Array.from({ length: t.variablesCount }, (_, i) => `var${i + 1}`)
  }
  const body = typeof t.body === 'string' ? t.body : typeof t.bodyText === 'string' ? t.bodyText : ''
  const matches = body.match(/\{\{\s*\d+\s*\}\}/g)
  if (matches) return matches.map((_, i) => `var${i + 1}`)
  return []
}
