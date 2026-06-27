import { useEffect, useMemo, useState } from 'react'
import { Field, TextInput, TextArea, Select, PrimaryButton, GhostButton } from './ui.jsx'
import { InfobipMark } from './BrandIcons.jsx'
import { fetchTemplates } from '../utils/infobipApi.js'
import { infobipOutputString } from '../utils/infobipPayloadGenerator.js'
import { copyText, downloadJson } from '../utils/clipboard.js'
import { loadKey, removeKey, saveKey } from '../utils/storage.js'

const CONFIG_KEY = 'infobip_config'
const DRAFT_KEY = 'ajo_payload_draft_infobip'
const INITIAL_CONFIG = { apiKey: '', baseUrl: '', sender: '' }

export default function InfobipBuilder({ onChangeChannel }) {
  const [config, setConfig] = useState(INITIAL_CONFIG)
  const [templates, setTemplates] = useState([])
  const [usedMock, setUsedMock] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [selectedName, setSelectedName] = useState('')
  const [valuesMap, setValuesMap] = useState({})
  const [includeButton, setIncludeButton] = useState(false)
  const [postbackData, setPostbackData] = useState('SAIR')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [ready, setReady] = useState(false)

  // Restore saved config + working draft.
  useEffect(() => {
    let alive = true
    Promise.all([loadKey(CONFIG_KEY), loadKey(DRAFT_KEY)]).then(([cfg, draft]) => {
      if (!alive) return
      if (cfg) setConfig({ ...INITIAL_CONFIG, ...cfg })
      if (draft) {
        if (draft.selectedName) setSelectedName(draft.selectedName)
        if (draft.valuesMap) setValuesMap(draft.valuesMap)
        if (typeof draft.includeButton === 'boolean') setIncludeButton(draft.includeButton)
        if (draft.postbackData) setPostbackData(draft.postbackData)
      }
      setReady(true)
    })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (ready) saveKey(CONFIG_KEY, config)
  }, [config, ready])
  useEffect(() => {
    if (ready) saveKey(DRAFT_KEY, { selectedName, valuesMap, includeButton, postbackData })
  }, [selectedName, valuesMap, includeButton, postbackData, ready])

  const selected = useMemo(
    () => templates.find((t) => t.name === selectedName) || null,
    [templates, selectedName],
  )
  const values = valuesMap[selectedName] || []

  function updateConfig(p) {
    setConfig((c) => ({ ...c, ...p }))
  }

  async function saveAndLoad() {
    setLoading(true)
    saveKey(CONFIG_KEY, config)
    const result = await fetchTemplates(config)
    setTemplates(result.templates)
    setUsedMock(result.usedMock)
    setLoaded(true)
    setLoading(false)
    if (!result.templates.some((t) => t.name === selectedName)) setSelectedName('')
  }

  function setValue(idx, val) {
    setValuesMap((m) => {
      const cur = (m[selectedName] || []).slice()
      cur[idx] = val
      return { ...m, [selectedName]: cur }
    })
  }

  function generate() {
    if (!selected) return
    const mapped = (selected.variables || []).map((_, i) => values[i] || '')
    setOutput(
      infobipOutputString({
        sender: config.sender,
        templateName: selected.name,
        language: selected.language,
        mappedValues: mapped,
        includeButton,
        postbackData,
      }),
    )
  }

  async function copy() {
    const ok = await copyText(output)
    setCopied(ok)
    setTimeout(() => setCopied(false), 1800)
  }

  function reset() {
    removeKey(CONFIG_KEY)
    removeKey(DRAFT_KEY)
    setConfig(INITIAL_CONFIG)
    setTemplates([])
    setUsedMock(false)
    setLoaded(false)
    setSelectedName('')
    setValuesMap({})
    setIncludeButton(false)
    setPostbackData('SAIR')
    setOutput('')
  }

  if (!ready) return null

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
        <button
          onClick={onChangeChannel}
          title="Trocar canal"
          className="flex items-center gap-1.5 text-sm font-bold text-slate-800 transition hover:text-brand-600"
        >
          <span className="text-slate-400">‹</span>
          <InfobipMark className="h-7 w-7" glyph="h-5 w-5" />
          Infobip
        </button>
        <button
          onClick={reset}
          className="text-xs font-medium text-slate-400 transition hover:text-red-500"
        >
          Reiniciar
        </button>
      </header>

      <main className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        {/* 1 — Configuração da API */}
        <Section n="1" title="Configuração da API">
          <div className="space-y-3">
            <Field label="Infobip API Key">
              <TextInput
                type="password"
                value={config.apiKey}
                onChange={(e) => updateConfig({ apiKey: e.target.value })}
                placeholder="••••••••••••"
                autoComplete="off"
                spellCheck={false}
              />
            </Field>
            <Field label="Base URL">
              <TextInput
                value={config.baseUrl}
                onChange={(e) => updateConfig({ baseUrl: e.target.value })}
                placeholder="jrpzv9.api-us.infobip.com"
                spellCheck={false}
              />
            </Field>
            <Field label="Sender Number">
              <TextInput
                value={config.sender}
                onChange={(e) => updateConfig({ sender: e.target.value })}
                placeholder="553173000653"
                spellCheck={false}
              />
            </Field>
            <PrimaryButton onClick={saveAndLoad} disabled={loading} className="w-full">
              {loading ? 'Carregando…' : 'Salvar e Carregar Templates'}
            </PrimaryButton>
            {loaded && (
              <p
                className={
                  'rounded-lg px-3 py-2 text-xs ' +
                  (usedMock ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700')
                }
              >
                {usedMock
                  ? '⚠️ API indisponível — usando templates de exemplo (mock).'
                  : `✓ ${templates.length} template(s) carregado(s).`}
              </p>
            )}
          </div>
        </Section>

        {/* 2 — Seleção e Mapeamento */}
        {templates.length > 0 && (
          <Section n="2" title="Template e Mapeamento">
            <div className="space-y-3">
              <Field label="Template de WhatsApp">
                <Select value={selectedName} onChange={(e) => setSelectedName(e.target.value)}>
                  <option value="">Selecione um template</option>
                  {templates.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name} ({t.language})
                    </option>
                  ))}
                </Select>
              </Field>

              {selected && (
                <>
                  {selected.variables.length === 0 ? (
                    <p className="text-xs text-slate-400">Este template não possui variáveis.</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-600">
                        Mapeie as variáveis com atributos do AJO:
                      </p>
                      {selected.variables.map((v, i) => (
                        <Field key={i} label={`{{${i + 1}}} · ${v}`}>
                          <TextInput
                            value={values[i] || ''}
                            onChange={(e) => setValue(i, e.target.value)}
                            placeholder="{{profile.person.name.firstName}}"
                            spellCheck={false}
                          />
                        </Field>
                      ))}
                    </div>
                  )}

                  <div className="rounded-lg border border-slate-200 p-3">
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={includeButton}
                        onChange={(e) => setIncludeButton(e.target.checked)}
                        className="h-4 w-4 accent-brand-600"
                      />
                      Incluir botão Quick Reply
                    </label>
                    {includeButton && (
                      <div className="mt-2">
                        <Field label="postbackData">
                          <TextInput
                            value={postbackData}
                            onChange={(e) => setPostbackData(e.target.value)}
                            placeholder="SAIR"
                          />
                        </Field>
                      </div>
                    )}
                  </div>

                  <PrimaryButton onClick={generate} className="w-full">
                    Gerar Payload JSON
                  </PrimaryButton>
                </>
              )}
            </div>
          </Section>
        )}

        {/* 3 — Output */}
        {output && (
          <Section n="3" title="Payload (Custom Action)">
            <p className="mb-2 rounded-lg bg-slate-100 px-3 py-2 text-[11px] leading-snug text-slate-500">
              Formato exigido pelo endpoint: <strong>lista com 1 string JSON “escapada”</strong>.
              Copie e cole no corpo do Custom Action do AJO.
            </p>
            <TextArea
              readOnly
              value={output}
              rows={11}
              spellCheck={false}
              className="font-mono text-[11px] leading-snug"
            />
            <div className="mt-2 flex gap-2">
              <PrimaryButton onClick={copy} className="flex-1">
                {copied ? '✓ Copiado!' : 'Copiar para a Área de Transferência'}
              </PrimaryButton>
              <GhostButton onClick={() => downloadJson('infobip_payload.json', output)}>
                Baixar
              </GhostButton>
            </div>
          </Section>
        )}
      </main>
    </div>
  )
}

function Section({ n, title, children }) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
          {n}
        </span>
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
      </div>
      {children}
    </section>
  )
}
