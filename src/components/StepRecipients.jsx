import { useRef } from 'react'
import { Field, TextInput, SmallButton } from './ui.jsx'

// Snippets injected by the helper buttons. The "caret" marker shows where the cursor
// should land so the user just types the field name.
const HELPERS = [
  { label: '+ Journey Data', snippet: '{{Event.journeyData.|}}' },
  { label: '+ Profile', snippet: '{{Profile.|}}' },
  { label: '+ Profile.mobilePhone', snippet: '{{Profile.mobilePhone.number}}|' },
]

export default function StepRecipients({ form, update }) {
  const inputRef = useRef(null)

  function insert(snippet) {
    const caret = snippet.indexOf('|')
    const text = snippet.replace('|', '')
    update({ userNumber: text })
    // Place the cursor where the marker was, after React re-renders.
    requestAnimationFrame(() => {
      const el = inputRef.current
      if (!el) return
      el.focus()
      const pos = caret === -1 ? text.length : caret
      el.setSelectionRange(pos, pos)
    })
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">
        Informe a expressão do <strong className="text-slate-700">AJO</strong> que contém o
        celular do cliente. Use os atalhos abaixo e complete o nome do campo.
      </p>

      <Field
        label="Número do destinatário (userNumber)"
        hint="Aceita variáveis dinâmicas do Journey Optimizer."
        htmlFor="userNumber"
      >
        <TextInput
          id="userNumber"
          ref={inputRef}
          value={form.userNumber}
          onChange={(e) => update({ userNumber: e.target.value })}
          placeholder="{{Event.journeyData.celular}}"
          spellCheck={false}
        />
      </Field>

      <div className="flex flex-wrap gap-2">
        {HELPERS.map((h) => (
          <SmallButton key={h.label} type="button" onClick={() => insert(h.snippet)}>
            {h.label}
          </SmallButton>
        ))}
      </div>

      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
        Dica: o valor é enviado exatamente como digitado. Para testes, você pode colar um número
        fixo (ex: <code className="font-mono">5551993173113</code>).
      </p>
    </div>
  )
}
