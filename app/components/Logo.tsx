export default function Logo({ size = 32 }: { size?: number }) {
  const scale = size / 32
  return (
    <svg width={190 * scale} height={size} viewBox="0 0 190 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rm-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00C2FF" />
          <stop offset="100%" stopColor="#66D9FF" />
        </linearGradient>
      </defs>
      {/* Icon: two overlapping rounded squares */}
      <rect x="0" y="4" width="18" height="18" rx="4.5" fill="none" stroke="#fff" strokeWidth="1.8" opacity="0.8" />
      <rect x="8" y="12" width="18" height="18" rx="4.5" fill="none" stroke="url(#rm-grad)" strokeWidth="1.8" />
      {/* Wordmark */}
      <text x="38" y="25" fontFamily="Cormorant Garamond, serif" fontSize="23" fontWeight="700" fill="#fff">
        ResuMatch
      </text>
    </svg>
  )
}
