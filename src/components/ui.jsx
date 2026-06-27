// Small presentational primitives shared across steps.
import { forwardRef } from 'react'

export function Field({ label, hint, children, htmlFor }) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-slate-400">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

export const TextInput = forwardRef(function TextInput({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      {...props}
      className={
        'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ' +
        'placeholder:text-slate-400 outline-none transition focus:border-brand-500 ' +
        'focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100 disabled:text-slate-400 ' +
        className
      }
    />
  )
})

export const TextArea = forwardRef(function TextArea({ className = '', ...props }, ref) {
  return (
    <textarea
      ref={ref}
      {...props}
      className={
        'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ' +
        'placeholder:text-slate-400 outline-none transition focus:border-brand-500 ' +
        'focus:ring-2 focus:ring-brand-100 ' +
        className
      }
    />
  )
})

export function Select({ className = '', children, ...props }) {
  return (
    <select
      {...props}
      className={
        'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ' +
        'outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ' +
        className
      }
    >
      {children}
    </select>
  )
}

export function PrimaryButton({ className = '', children, ...props }) {
  return (
    <button
      {...props}
      className={
        'inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 ' +
        'text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 ' +
        'disabled:cursor-not-allowed disabled:bg-slate-300 ' +
        className
      }
    >
      {children}
    </button>
  )
}

export function GhostButton({ className = '', children, ...props }) {
  return (
    <button
      {...props}
      className={
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm ' +
        'font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 ' +
        className
      }
    >
      {children}
    </button>
  )
}

export function SmallButton({ className = '', children, ...props }) {
  return (
    <button
      {...props}
      className={
        'inline-flex items-center gap-1 rounded-md border border-brand-200 bg-brand-50 px-2.5 ' +
        'py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-100 ' +
        className
      }
    >
      {children}
    </button>
  )
}

// Card with a checkbox header that expands its body when enabled — matches the
// "Parâmetros de Texto / Mídia / Botão" toggles in the reference wizard.
export function ToggleCard({ title, checked, onToggle, children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <label className="flex cursor-pointer items-center justify-between gap-2 bg-gradient-to-r from-white to-brand-50 px-4 py-3">
        <span className="text-sm font-semibold text-slate-800">{title}</span>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggle(e.target.checked)}
          className="h-4 w-4 cursor-pointer accent-brand-600"
        />
      </label>
      {checked && <div className="border-t border-slate-100 px-4 py-4">{children}</div>}
    </div>
  )
}

// A removable item in a parameter list.
export function ParamChip({ index, children, onRemove }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="min-w-0 text-sm text-slate-700">
        <span className="mr-1.5 font-semibold text-brand-600">{index}</span>
        <span className="break-all">{children}</span>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remover"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 transition hover:bg-red-100 hover:text-red-600"
      >
        ✕
      </button>
    </div>
  )
}
