import { FaGift } from 'react-icons/fa'

/**
 * Shared wordmark. `variant="light"` renders white text for dark
 * (navy) backgrounds; `variant="dark"` renders navy text for light backgrounds.
 */
export default function Logo({ variant = 'dark', className = '' }) {
  const isLight = variant === 'light'
  const textColor = isLight ? 'text-white' : 'text-[#131921]'
  const badgeClasses = isLight ? 'bg-white text-[#131921]' : 'bg-[#131921] text-white'

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className={`w-9 h-9 rounded-lg ${badgeClasses} flex items-center justify-center text-lg shrink-0`}>
        <FaGift />
      </span>
      <span className="flex flex-col leading-none">
        <span className="flex items-center gap-1.5">
          <span className={`font-display font-extrabold text-lg tracking-tight ${textColor}`}>
            GiftGenius
          </span>
          <span className="text-[10px] font-bold bg-[#FF9900] text-[#111111] px-1.5 py-0.5 rounded leading-none">
            AI
          </span>
        </span>
        <svg viewBox="0 0 100 14" className="w-[90px] h-[10px] mt-0.5" aria-hidden="true">
          <path d="M4 2 C 30 14, 70 14, 94 3" fill="none" stroke="#FF9900" strokeWidth="3" strokeLinecap="round" />
          <path d="M86 1.5 L96 2.5 L89.5 10 Z" fill="#FF9900" />
        </svg>
      </span>
    </span>
  )
}
