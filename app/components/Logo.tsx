export default function Logo({ size = 32 }: { size?: number }) {
  const scale = size / 32
  return (
    <svg width={180 * scale} height={size} viewBox="0 0 180 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rm-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#E8D48B" />
        </linearGradient>
      </defs>
      {/* R */}
      <text x="0" y="25" fontFamily="Cormorant Garamond, serif" fontSize="24" fontWeight="700" fill="#fff">R</text>
      {/* connecting bracket / match arc */}
      <path d="M26 14 Q28 4 34 4" stroke="url(#rm-grad)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M28 28 Q30 18 36 18" stroke="url(#rm-grad)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="36" cy="4" r="2.5" fill="#C9A84C" />
      <circle cx="38" cy="18" r="2.5" fill="#C9A84C" />
      {/* e */}
      <text x="38" y="25" fontFamily="Cormorant Garamond, serif" fontSize="22" fontWeight="600" fill="#c8d4e8">e</text>
      {/* s */}
      <text x="52" y="25" fontFamily="Cormorant Garamond, serif" fontSize="22" fontWeight="600" fill="#c8d4e8">s</text>
      {/* u */}
      <text x="66" y="25" fontFamily="Cormorant Garamond, serif" fontSize="22" fontWeight="600" fill="#c8d4e8">u</text>
      {/* Match (gold bold) */}
      <text x="86" y="25" fontFamily="Cormorant Garamond, serif" fontSize="24" fontWeight="700" fill="url(#rm-grad)">Match</text>
      {/* subtle dot separator */}
      <circle cx="84" cy="16" r="1.5" fill="#4a5a7a" />
    </svg>
  )
}
