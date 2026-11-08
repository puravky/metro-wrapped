type MetroIllustrationProps = {
  className?: string;
  accent?: string;
  title?: string;
};

export function MetroIllustration({ className, accent = "#e83f4f", title = "A Delhi Metro train" }: MetroIllustrationProps) {
  return (
    <svg className={className} viewBox="0 0 680 250" role="img" aria-label={title}>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 209h632M36 223h608" strokeWidth="5" />
        <path d="M76 194v-72h52v72M84 122l18-36 18 36M91 149h22M91 168h22" strokeWidth="4" opacity=".65" />
        <path d="M548 194V78h22v116M545 108h28M545 137h28M545 166h28" strokeWidth="4" opacity=".65" />
        <path d="M144 194v-44h62v44M157 150v-24h36v24M466 194v-52h52v52" strokeWidth="4" opacity=".45" />
      </g>
      <g transform="translate(128 70)">
        <path d="M48 10h344c24 0 43 17 48 41l11 53c3 16-9 31-26 31H28c-16 0-28-14-25-30l10-52C18 28 29 10 48 10Z" fill="#fffdf3" stroke="#161716" strokeWidth="6" />
        <path d="M14 91h429l6 28H8l6-28Z" fill={accent} stroke="#161716" strokeWidth="4" />
        <path d="M40 29h80v50H30l10-50ZM137 29h70v50h-70zM311 29h70v50h-70zM397 33c14 8 23 25 27 46h-30V29l3 4Z" fill="#173f70" stroke="#161716" strokeWidth="5" />
        <path d="M225 27h68v92h-68zM259 27v92" fill="#f5edda" stroke="#161716" strokeWidth="5" />
        <circle cx="74" cy="137" r="16" fill="#161716" /><circle cx="366" cy="137" r="16" fill="#161716" />
        <circle cx="74" cy="137" r="7" fill="#f5edda" /><circle cx="366" cy="137" r="7" fill="#f5edda" />
        <path d="M30 96h388" stroke="#fff" strokeWidth="4" opacity=".75" />
      </g>
    </svg>
  );
}
