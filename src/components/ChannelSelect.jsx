import { MiaWhatsApp, InfobipMark } from './BrandIcons.jsx'

function ChannelCard({ icon, iconNode, iconBg, title, desc, chip, chipClass, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-brand-400 hover:shadow-md"
    >
      {iconNode ?? (
        <span
          className={
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xl ' + iconBg
          }
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">{title}</span>
          <span
            className={'rounded-full px-2 py-0.5 text-[10px] font-semibold ' + chipClass}
          >
            {chip}
          </span>
        </span>
        <span className="mt-0.5 block text-xs text-slate-500">{desc}</span>
      </span>
      <span className="text-lg text-slate-300 transition group-hover:text-brand-500">›</span>
    </button>
  )
}

export default function ChannelSelect({ onSelect }) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-600 text-xs font-bold text-white">
          A
        </span>
        <span className="text-sm font-bold text-slate-800">Payload Generator · AJO</span>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-5">
        <h1 className="text-base font-bold text-slate-800">Selecione o canal</h1>
        <p className="mb-4 mt-1 text-sm text-slate-500">
          Escolha o canal de envio para gerar o payload da Custom Action.
        </p>

        <div className="space-y-3">
          <ChannelCard
            iconNode={<MiaWhatsApp className="h-11 w-11" />}
            title="MIA Bot WhatsApp"
            desc="Mensagem ativa via Broker/MIA (orquestração própria)."
            chip="Pronto"
            chipClass="bg-emerald-100 text-emerald-700"
            onClick={() => onSelect('whatsapp')}
          />
          <ChannelCard
            iconNode={<InfobipMark className="h-11 w-11" glyph="h-8 w-8" />}
            title="Infobip"
            desc="Templates de WhatsApp via API da Infobip — busca e mapeamento."
            chip="Pronto"
            chipClass="bg-orange-100 text-orange-700"
            onClick={() => onSelect('infobip')}
          />
        </div>
      </main>
    </div>
  )
}
