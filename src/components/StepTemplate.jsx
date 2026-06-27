import { BOTS } from '../config/bots.js'
import { Field, TextInput, Select } from './ui.jsx'

export default function StepTemplate({ form, update }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">
        As informações para preencher estes campos você encontra no{' '}
        <strong className="text-slate-700">Gerenciador do WhatsApp</strong>.
      </p>

      <Field label="Insira o Nome do Template" htmlFor="templateName">
        <TextInput
          id="templateName"
          value={form.templateName}
          onChange={(e) => update({ templateName: e.target.value })}
          placeholder="Ex: com_em_atendimento_qas"
        />
      </Field>

      <Field label="Insira o ID do namespace" htmlFor="namespaceId">
        <TextInput
          id="namespaceId"
          value={form.namespaceId}
          onChange={(e) => update({ namespaceId: e.target.value })}
          placeholder="Ex: 42ba822d_ff86_03d5_81f1_01d86d6d9e4d"
        />
      </Field>

      <Field label="Selecione o bot que irá enviar a mensagem" htmlFor="botName">
        <Select
          id="botName"
          value={form.botName}
          onChange={(e) => update({ botName: e.target.value })}
        >
          <option value="">Selecione uma opção</option>
          {BOTS.map((b) => (
            <option key={b.botName} value={b.botName}>
              {b.label}
            </option>
          ))}
        </Select>
      </Field>

      {form.botName && (
        <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">
          Número do bot:{' '}
          <strong className="text-slate-700">
            {BOTS.find((b) => b.botName === form.botName)?.botNumber}
          </strong>{' '}
          <span className="text-slate-400">(preenchido automaticamente)</span>
        </p>
      )}
    </div>
  )
}
