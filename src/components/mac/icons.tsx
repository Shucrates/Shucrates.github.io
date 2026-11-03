/* App and folder icons, drawn in the spirit of macOS's (not copies of them). */

type IconProps = { className?: string };

export function FolderIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 52" className={className} aria-hidden>
      <defs>
        <linearGradient id="folder-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6cc0fb" />
          <stop offset="1" stopColor="#3a9bef" />
        </linearGradient>
      </defs>
      <path d="M4 6a4 4 0 0 1 4-4h14l5 5h29a4 4 0 0 1 4 4v4H4z" fill="#4aa6f2" />
      <path d="M2 14a4 4 0 0 1 4-4h52a4 4 0 0 1 4 4v32a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" fill="url(#folder-front)" />
      <path d="M2 14a4 4 0 0 1 4-4h52a4 4 0 0 1 4 4v1H2z" fill="#8fd0ff" opacity="0.7" />
    </svg>
  );
}

const squircle = "M50 2C14 2 2 14 2 50s12 48 48 48 48-12 48-48S86 2 50 2z";

export function FinderIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <clipPath id="finder-clip">
          <path d={squircle} />
        </clipPath>
      </defs>
      <g clipPath="url(#finder-clip)">
        <rect width="100" height="100" fill="#e9f2fb" />
        <path d="M0 0h52c-6 18-9 34-8 50 4 0 8 0 11 1-2 14-1 31 2 49H0z" fill="#1f8ef1" />
        <rect x="27" y="30" width="5" height="14" rx="2.5" fill="#0b2a4a" />
        <rect x="68" y="30" width="5" height="14" rx="2.5" fill="#0b2a4a" />
        <path d="M24 66c16 12 36 12 52 0" stroke="#0b2a4a" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function PhotoBoothIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <linearGradient id="booth-curtain" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b3122a" />
          <stop offset="0.5" stopColor="#e2334a" />
          <stop offset="1" stopColor="#b3122a" />
        </linearGradient>
        <clipPath id="booth-clip">
          <path d={squircle} />
        </clipPath>
      </defs>
      <g clipPath="url(#booth-clip)">
        <rect width="100" height="100" fill="url(#booth-curtain)" />
        {[14, 30, 46, 62, 78].map((x) => (
          <rect key={x} x={x} y="0" width="3" height="100" fill="#000" opacity="0.15" />
        ))}
        <rect x="24" y="36" width="52" height="34" rx="7" fill="#1c1c1e" />
        <circle cx="50" cy="53" r="12" fill="#3a3a3c" />
        <circle cx="50" cy="53" r="7" fill="#0a84ff" />
        <circle cx="47" cy="50" r="2" fill="#fff" opacity="0.8" />
        <rect x="58" y="31" width="12" height="6" rx="2" fill="#1c1c1e" />
      </g>
    </svg>
  );
}

export function BrowserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <radialGradient id="browser-glow" cx="0.7" cy="0.25" r="0.9">
          <stop offset="0" stopColor="#ffde3b" />
          <stop offset="0.45" stopColor="#ff7a1a" />
          <stop offset="1" stopColor="#e3195a" />
        </radialGradient>
        <radialGradient id="browser-globe" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#9e6cff" />
          <stop offset="1" stopColor="#3b1a9e" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="52" r="40" fill="url(#browser-globe)" />
      <path
        d="M50 92c-22 0-40-18-40-40 0-8 2-15 6-21 1 7 5 12 10 15-1-9 3-19 11-25-1 6 1 11 5 14 10-2 21 2 27 11 4 6 5 14 2 21-3 8-11 13-20 12 8-3 12-11 9-18-2-5-8-8-14-7-7 1-12 8-11 16 2 13 13 21 26 21 16 0 29-12 31-27 1 22-17 40-42 40z"
        fill="url(#browser-glow)"
      />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <linearGradient id="trash-bin" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c9ced6" />
          <stop offset="0.5" stopColor="#f4f6f8" />
          <stop offset="1" stopColor="#b8bec7" />
        </linearGradient>
      </defs>
      <path d="M20 22h60l-6 70a5 5 0 0 1-5 4H31a5 5 0 0 1-5-4z" fill="url(#trash-bin)" opacity="0.9" />
      {[32, 44, 56, 68].map((x) => (
        <path key={x} d={`M${x} 28l${(x - 50) * 0.06} 62`} stroke="#9aa2ad" strokeWidth="2.2" strokeLinecap="round" />
      ))}
      <rect x="15" y="14" width="70" height="10" rx="5" fill="#dfe3e8" stroke="#a7aeb8" />
    </svg>
  );
}

export function AppleLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.5-1-2.5-3.8zM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z" />
    </svg>
  );
}
