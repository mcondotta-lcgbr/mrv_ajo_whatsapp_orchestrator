import { useMemo, useState } from 'react'
import { generatePayload, payloadToString } from '../utils/payloadGenerator.js'
import { copyText, downloadJson } from '../utils/clipboard.js'
import { PrimaryButton, GhostButton } from './ui.jsx'

export default function StepReview({ form }) {
  const [copied, setCopied] = useState(false)

  const payload = useMemo(() => generatePayload(form), [form])
  const json = useMemo(() => payloadToString(payload), [payload])
  const warnings = useMemo(() => collectWarnings(form, payload), [form, payload])

  async function handleCopy() {
    const ok = await copyText(json)
    setCopied(ok)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Revise o payload gerado e copie para colar na Custom Action do AJO.
      </p>

      {warnings.length > 0 && (
        <ul className="space-y-1 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {warnings.map((w) => (
            <li key={w}>⚠️ {w}</li>
          ))}
        </ul>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-700 px-3 py-1.5">
          <span className="text-xs font-medium text-slate-400">payload.json</span>
          <span className="text-[10px] text-slate-500">
            {payload.components.length} componente(s)
          </span>
        </div>
        <pre className="max-h-[46vh] overflow-auto px-3 py-3 text-xs leading-relaxed">
          <code
            className="font-mono"
            dangerouslySetInnerHTML={{ __html: highlight(json) }}
          />
        </pre>
      </div>

      <div className="flex gap-2">
        <PrimaryButton onClick={handleCopy} className="flex-1">
          {copied ? '✓ Copiado!' : 'Copiar Payload'}
        </PrimaryButton>
        <GhostButton onClick={() => downloadJson(fileName(form), json)}>Baixar .json</GhostButton>
      </div>
    </div>
  )
}

function fileName(form) {
  const base = (form.templateName || 'payload').replace(/[^a-z0-9_-]+/gi, '_')
  return `${base}.json`
}

function collectWarnings(form, payload) {
  const w = []
  if (!form.templateName?.trim()) w.push('templateName está vazio.')
  if (!form.namespaceId?.trim()) w.push('namespaceId está vazio.')
  if (!form.botName) w.push('Nenhum bot selecionado (attachedBot/botNumber vazios).')
  if (!form.userNumber?.trim()) w.push('userNumber está vazio.')
  if (payload.components.length === 0)
    w.push('Sem componentes — a mensagem será enviada apenas com o template (sem parâmetros).')
  return w
}

// Minimal, injection-safe JSON syntax highlighter: escape first, then colorize.
function highlight(jsonString) {
  const escaped = jsonString
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'color:#a5b4fc' // numbers
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'color:#7dd3fc;font-weight:600' : 'color:#86efac' // key : string
      } else if (/true|false/.test(match)) {
        cls = 'color:#fca5a5'
      } else if (/null/.test(match)) {
        cls = 'color:#94a3b8'
      }
      return `<span style="${cls}">${match}</span>`
    },
  )
}
