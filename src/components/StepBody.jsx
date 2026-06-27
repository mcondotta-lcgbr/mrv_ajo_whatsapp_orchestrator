import { useState } from 'react'
import { buttonParamType } from '../utils/payloadGenerator.js'
import {
  Field,
  TextInput,
  Select,
  SmallButton,
  ToggleCard,
  ParamChip,
} from './ui.jsx'

export default function StepBody({ form, update }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">
          Selecione o tipo de template que a mensagem irá conter
        </p>
        <p className="text-xs text-slate-400">
          Se a mensagem não contém parâmetros adicionais, prossiga para a próxima tela.
        </p>
      </div>

      <TextCard form={form} update={update} />
      <MediaCard form={form} update={update} />
      <ButtonCard form={form} update={update} />
    </div>
  )
}

/* ----------------------------- Texto ----------------------------- */
function TextCard({ form, update }) {
  const [value, setValue] = useState('')

  function add() {
    if (!value.trim()) return
    update({ textParams: [...form.textParams, value.trim()] })
    setValue('')
  }
  function remove(i) {
    update({ textParams: form.textParams.filter((_, idx) => idx !== i) })
  }

  return (
    <ToggleCard
      title="Parâmetros de Texto"
      checked={form.hasText}
      onToggle={(v) => update({ hasText: v })}
    >
      <Field label="Insira os valores das lacunas da mensagem" hint="Um valor por lacuna, na ordem do template.">
        <div className="flex gap-2">
          <TextInput
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
            placeholder="Ex: Henrique"
          />
          <SmallButton type="button" onClick={add} className="shrink-0 px-3">
            ADICIONAR
          </SmallButton>
        </div>
      </Field>

      <ParamList items={form.textParams} title="Parâmetros da Mensagem">
        {form.textParams.map((t, i) => (
          <ParamChip key={i} index={i} onRemove={() => remove(i)}>
            {t}
          </ParamChip>
        ))}
      </ParamList>
    </ToggleCard>
  )
}

/* ----------------------------- Mídia ----------------------------- */
function MediaCard({ form, update }) {
  const [parameterType, setParameterType] = useState('image')
  const [link, setLink] = useState('')

  function add() {
    if (!link.trim()) return
    update({
      mediaParams: [
        ...form.mediaParams,
        { componentType: 'header', parameterType, link: link.trim() },
      ],
    })
    setLink('')
  }
  function remove(i) {
    update({ mediaParams: form.mediaParams.filter((_, idx) => idx !== i) })
  }

  return (
    <ToggleCard
      title="Parâmetros de Mídia"
      checked={form.hasMedia}
      onToggle={(v) => update({ hasMedia: v })}
    >
      <div className="space-y-3">
        <Field label="Selecione o tipo de mídia">
          <Select value={parameterType} onChange={(e) => setParameterType(e.target.value)}>
            <option value="image">image</option>
            <option value="video">video</option>
            <option value="document">document</option>
          </Select>
        </Field>
        <Field label="Insira o link da mídia">
          <div className="flex gap-2">
            <TextInput
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
              placeholder="https://..."
              spellCheck={false}
            />
            <SmallButton type="button" onClick={add} className="shrink-0 px-3">
              ADICIONAR
            </SmallButton>
          </div>
        </Field>
      </div>

      <ParamList items={form.mediaParams} title="Parâmetros da Mensagem">
        {form.mediaParams.map((m, i) => (
          <ParamChip key={i} index={i} onRemove={() => remove(i)}>
            <span className="font-mono">{m.parameterType}</span> · {m.link}
          </ParamChip>
        ))}
      </ParamList>
    </ToggleCard>
  )
}

/* ----------------------------- Botão ----------------------------- */
const EMPTY_BUTTON = {
  buttonIndex: 0,
  buttonSubtype: 'quick_reply',
  value: '',
  useEntrySource: false,
}

function ButtonCard({ form, update }) {
  const [draft, setDraft] = useState(EMPTY_BUTTON)
  const type = buttonParamType(draft.buttonSubtype)
  const isQuickReply = draft.buttonSubtype !== 'url'

  function patch(p) {
    setDraft((d) => ({ ...d, ...p }))
  }

  function add() {
    if (!draft.value.trim()) return
    update({
      buttonParams: [
        ...form.buttonParams,
        {
          buttonIndex: Number.parseInt(draft.buttonIndex, 10) || 0,
          buttonSubtype: draft.buttonSubtype,
          value: draft.value.trim(),
        },
      ],
    })
    setDraft(EMPTY_BUTTON)
  }
  function remove(i) {
    update({ buttonParams: form.buttonParams.filter((_, idx) => idx !== i) })
  }

  function insertVar() {
    patch({ value: '{{Event.journeyData.}}' })
  }

  return (
    <ToggleCard
      title="Parâmetros de Botão"
      checked={form.hasButton}
      onToggle={(v) => update({ hasButton: v })}
    >
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={draft.useEntrySource}
            onChange={(e) => patch({ useEntrySource: e.target.checked })}
            className="h-4 w-4 accent-brand-600"
          />
          Utilizar dados da Entry Source
        </label>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Posição do botão">
            <TextInput
              type="number"
              min="0"
              value={draft.buttonIndex}
              onChange={(e) => patch({ buttonIndex: e.target.value })}
            />
          </Field>
          <Field label="Subtipo do botão">
            <Select
              value={draft.buttonSubtype}
              onChange={(e) => patch({ buttonSubtype: e.target.value })}
            >
              <option value="quick_reply">quick_reply</option>
              <option value="url">url</option>
            </Select>
          </Field>
        </div>

        <Field
          label="Tipo do botão"
          hint="Definido automaticamente pelo subtipo. O 'Texto do botão' vai para este campo do JSON."
        >
          <TextInput value={type} disabled readOnly />
        </Field>

        <Field
          label="Texto do botão"
          hint={
            isQuickReply
              ? 'quick_reply → vira o "payload" (retorno enviado no clique). Ex: OPCAO_SIM'
              : 'url → vira o "text" (link/variável de destino).'
          }
        >
          <FieldWithVar
            value={draft.value}
            onChange={(v) => patch({ value: v })}
            placeholder={isQuickReply ? 'OPCAO_SIM' : 'https://...'}
            showVar={draft.useEntrySource}
            onInsertVar={insertVar}
          />
        </Field>

        <div className="flex justify-end">
          <SmallButton type="button" onClick={add} className="px-3">
            ADICIONAR
          </SmallButton>
        </div>
      </div>

      <ParamList items={form.buttonParams} title="Parâmetros da Mensagem">
        {form.buttonParams.map((b, i) => (
          <ParamChip key={i} index={b.buttonIndex} onRemove={() => remove(i)}>
            <span className="font-mono">{b.buttonSubtype}</span> ·{' '}
            {buttonParamType(b.buttonSubtype)}=
            <span className="font-mono break-all">{b.value ?? b.payload ?? b.text}</span>
          </ParamChip>
        ))}
      </ParamList>
    </ToggleCard>
  )
}

function FieldWithVar({ value, onChange, placeholder, showVar, onInsertVar }) {
  return (
    <div className="flex gap-2">
      <TextInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
      />
      {showVar && (
        <SmallButton type="button" onClick={onInsertVar} className="shrink-0">
          + var
        </SmallButton>
      )}
    </div>
  )
}

function ParamList({ items, title, children }) {
  if (!items || items.length === 0) return null
  return (
    <div className="mt-4">
      <p className="mb-2 border-b border-slate-100 pb-1 text-sm font-semibold text-slate-700">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  )
}
