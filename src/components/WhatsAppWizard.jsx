import { useEffect, useState } from 'react'
import Stepper from './Stepper.jsx'
import StepTemplate from './StepTemplate.jsx'
import StepRecipients from './StepRecipients.jsx'
import StepBody from './StepBody.jsx'
import StepReview from './StepReview.jsx'
import { GhostButton, PrimaryButton } from './ui.jsx'
import { MiaWhatsApp } from './BrandIcons.jsx'
import { loadKey, removeKey, saveKey } from '../utils/storage.js'

const DRAFT_KEY = 'ajo_payload_draft_whatsapp'

const INITIAL_FORM = {
  // Etapa 1 — Template
  templateName: '',
  namespaceId: '',
  botName: '',
  // Etapa 2 — Destinatários
  userNumber: '',
  // Etapa 3 — Corpo
  hasText: false,
  textParams: [],
  hasMedia: false,
  mediaParams: [],
  hasButton: false,
  buttonParams: [],
}

export default function WhatsAppWizard({ onChangeChannel }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [step, setStep] = useState(0)
  const [ready, setReady] = useState(false)

  // Restore draft on mount.
  useEffect(() => {
    let alive = true
    loadKey(DRAFT_KEY).then((draft) => {
      if (alive && draft && draft.form) {
        setForm({ ...INITIAL_FORM, ...draft.form })
        if (typeof draft.step === 'number') setStep(draft.step)
      }
      if (alive) setReady(true)
    })
    return () => {
      alive = false
    }
  }, [])

  // Persist draft whenever it changes (after the initial load).
  useEffect(() => {
    if (ready) saveKey(DRAFT_KEY, { form, step })
  }, [form, step, ready])

  function update(partial) {
    setForm((prev) => ({ ...prev, ...partial }))
  }

  function reset() {
    removeKey(DRAFT_KEY)
    setForm(INITIAL_FORM)
    setStep(0)
  }

  const v0 = form.templateName.trim() && form.namespaceId.trim() && form.botName
  const v1 = form.userNumber.trim()
  const maxReached = v0 ? (v1 ? 3 : 1) : 0
  const canNext = step === 0 ? Boolean(v0) : step === 1 ? Boolean(v1) : true

  function goTo(i) {
    setStep(Math.max(0, Math.min(3, i)))
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
          <MiaWhatsApp className="h-7 w-7" badge="h-3.5 w-3.5" glyph="h-2.5 w-2.5" />
          MIA Bot WhatsApp
        </button>
        <button
          onClick={reset}
          className="text-xs font-medium text-slate-400 transition hover:text-red-500"
        >
          Reiniciar
        </button>
      </header>

      <Stepper current={step} maxReached={maxReached} onJump={goTo} />

      <main className="flex-1 overflow-y-auto px-4 py-4">
        {step === 0 && <StepTemplate form={form} update={update} />}
        {step === 1 && <StepRecipients form={form} update={update} />}
        {step === 2 && <StepBody form={form} update={update} />}
        {step === 3 && <StepReview form={form} />}
      </main>

      <footer className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
        <GhostButton onClick={() => goTo(step - 1)} disabled={step === 0}>
          Anterior
        </GhostButton>
        {step < 3 ? (
          <PrimaryButton onClick={() => goTo(step + 1)} disabled={!canNext}>
            Próximo
          </PrimaryButton>
        ) : (
          <span className="text-xs font-medium text-emerald-600">Payload pronto ✓</span>
        )}
      </footer>
    </div>
  )
}
