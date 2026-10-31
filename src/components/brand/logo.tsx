export function UniCrmLogo({
  className = "size-7",
  showGlow = false,
}: {
  className?: string;
  showGlow?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${showGlow ? 'drop-shadow-[0_0_12px_rgba(0,242,254,0.35)]' : ''} shrink-0 transition-all duration-300`}
    >
      <defs>
        <linearGradient id="unicrm-cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f2fe" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="unicrm-indigo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <clipPath id="unicrm-interlock-mask">
          <rect x="100" y="250" width="150" height="100" />
        </clipPath>
      </defs>
      <rect
        width="512"
        height="512"
        rx="110"
        className="fill-card stroke-border/60"
        strokeWidth="12"
      />
      <path
        d="M 140 140 H 230 A 80 80 0 0 1 230 300 H 140 Z"
        stroke="url(#unicrm-cyan-grad)"
        strokeWidth="48"
        strokeLinejoin="round"
      />
      <path
        d="M 200 210 H 290 A 80 80 0 0 1 290 370 H 200 Z"
        stroke="url(#unicrm-indigo-grad)"
        strokeWidth="48"
        strokeLinejoin="round"
      />
      <path
        d="M 140 140 H 230 A 80 80 0 0 1 230 300 H 140 Z"
        stroke="url(#unicrm-cyan-grad)"
        strokeWidth="48"
        strokeLinejoin="round"
        clipPath="url(#unicrm-interlock-mask)"
      />
    </svg>
  );
}
