const STEPS = [
  'Definição do Template',
  'Destinatários',
  'Corpo da Mensagem',
  'Confirmação dos Dados',
]

export default function Stepper({ current, onJump, maxReached }) {
  return (
    <nav aria-label="Progresso" className="px-4 pt-4">
      <ol className="flex items-center">
        {STEPS.map((label, i) => {
          const done = i < current
          const active = i === current
          const reachable = i <= maxReached
          return (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => reachable && onJump(i)}
                title={label}
                className={
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ' +
                  (active
                    ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                    : done
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-200 text-slate-500') +
                  (reachable ? ' cursor-pointer' : ' cursor-not-allowed')
                }
              >
                {done ? '✓' : i + 1}
              </button>
              {i < STEPS.length - 1 && (
                <span
                  className={
                    'mx-1.5 h-0.5 flex-1 rounded ' + (done ? 'bg-brand-600' : 'bg-slate-200')
                  }
                />
              )}
            </li>
          )
        })}
      </ol>
      <p className="mt-2 text-xs font-medium text-slate-400">
        Etapa {current + 1} de {STEPS.length}
      </p>
      <h1 className="text-base font-bold text-slate-800">{STEPS[current]}</h1>
    </nav>
  )
}
