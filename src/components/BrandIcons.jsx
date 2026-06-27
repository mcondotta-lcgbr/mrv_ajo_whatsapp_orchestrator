import miaIcon from '../assets/mia.png'

// Crisp WhatsApp mark (green circle + white handset) — scales sharply at any badge size.
export function WhatsAppGlyph({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path
        fill="#fff"
        d="M16.78 14.27c-.26-.13-1.55-.76-1.79-.85-.24-.09-.41-.13-.59.13-.17.26-.67.85-.83 1.02-.15.17-.3.19-.56.06-.26-.13-1.1-.41-2.1-1.3-.78-.69-1.3-1.55-1.45-1.81-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.46.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.59-1.42-.81-1.94-.21-.51-.43-.44-.59-.45h-.5c-.17 0-.45.06-.69.32-.24.26-.9.88-.9 2.14s.92 2.48 1.05 2.66c.13.17 1.82 2.78 4.4 3.9.62.27 1.1.43 1.47.55.62.2 1.18.17 1.62.1.49-.07 1.55-.63 1.76-1.25.22-.61.22-1.14.15-1.25-.06-.11-.23-.17-.49-.3z"
      />
    </svg>
  )
}

// MIA avatar with a WhatsApp badge in the corner — the brand mark for the WhatsApp/MIA channel.
export function MiaWhatsApp({
  className = 'h-11 w-11',
  badge = 'h-5 w-5',
  glyph = 'h-[18px] w-[18px]',
  showBadge = true,
}) {
  return (
    <span className={'relative flex shrink-0 items-center justify-center ' + className}>
      <img
        src={miaIcon}
        alt="MIA"
        className={'rounded-lg object-cover ring-1 ring-black/5 ' + className}
      />
      {showBadge && (
        <span
          className={
            'absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-white shadow ring-2 ring-white ' +
            badge
          }
        >
          <WhatsAppGlyph className={glyph} />
        </span>
      )}
    </span>
  )
}

// Infobip logomark (concentric orange shapes) recreated as crisp SVG.
export function InfobipGlyph({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="50" fill="#FF6A00" />
      <rect x="20" y="20" width="60" height="60" rx="22" fill="#fff" />
      <rect x="28" y="28" width="44" height="44" rx="16" fill="#FF6A00" />
      <rect x="37" y="37" width="26" height="26" rx="10" fill="#fff" />
      <rect x="44" y="44" width="12" height="12" rx="4" fill="#FF6A00" />
    </svg>
  )
}

// Infobip mark inside a white rounded badge (matches the channel-card icon footprint).
export function InfobipMark({ className = 'h-11 w-11', glyph = 'h-8 w-8' }) {
  return (
    <span
      className={
        'flex shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200 ' +
        className
      }
    >
      <InfobipGlyph className={glyph} />
    </span>
  )
}
