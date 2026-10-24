import type { EcosystemTool } from '@/content/ecosystem';

/**
 * Full-colour tool marks for the ecosystem section (D40).
 *
 * Path marks come straight from `content/ecosystem.ts` (Simple Icons, filled in
 * the brand colour). Slack, AWS and Google Workspace are built here from plain
 * shapes in their brand palettes, because no licensable path file exists; see
 * the note in `content/ecosystem.ts`. Always decorative: callers set
 * `aria-hidden` on the wrapper and print the tool name in text.
 */
export function EcosystemMark({ tool }: { tool: EcosystemTool }) {
  if (tool.mark.kind === 'path') {
    return (
      <svg viewBox="0 0 24 24" focusable="false">
        <path fill={tool.mark.fill} d={tool.mark.d} />
      </svg>
    );
  }

  if (tool.id === 'slack') {
    // One arm (a pill plus a tab), turned through the four brand colours.
    const arm = (
      <>
        <rect x="0" y="654" width="1142" height="490" rx="245" />
        <circle cx="897" cy="245" r="245" />
        <rect x="897" y="245" width="245" height="245" />
      </>
    );
    return (
      <svg viewBox="0 0 2448 2452" focusable="false">
        {['#36C5F0', '#2EB67D', '#ECB22E', '#E01E5A'].map((fill, i) => (
          <g key={fill} fill={fill} transform={`rotate(${i * 90} 1224 1226)`}>
            {arm}
          </g>
        ))}
      </svg>
    );
  }

  if (tool.id === 'aws') {
    return (
      <svg viewBox="0 0 24 24" focusable="false">
        <text
          x="12"
          y="12.6"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="9.4"
          fontWeight="700"
          letterSpacing="-0.3"
          fill="#232F3E"
        >
          aws
        </text>
        <path
          d="M3.6 15.4c4.9 3 11.6 3 16.2-.3"
          fill="none"
          stroke="#FF9900"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M17.6 14.1l2.6.8-.9 2.5"
          fill="none"
          stroke="#FF9900"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Google Workspace: a four-colour ring with the blue bar.
  return (
    <svg viewBox="0 0 24 24" focusable="false" fill="none" strokeWidth="3.4">
      <path d="M17.75 7.18A7.5 7.5 0 0 0 5.5 8.25" stroke="#EA4335" />
      <path d="M5.5 8.25a7.5 7.5 0 0 0 0 7.5" stroke="#FBBC05" />
      <path d="M5.5 15.75a7.5 7.5 0 0 0 11.8 1.55" stroke="#34A853" />
      <path d="M17.3 17.3A7.5 7.5 0 0 0 19.5 12H12.4" stroke="#4285F4" />
    </svg>
  );
}

/** Shared paint servers, rendered once per page by the ecosystem section. */
export function EcosystemDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" className="eco-defs">
      <defs>
        <linearGradient id="eco-grad-notebooklm" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#4285F4" />
          <stop offset="0.55" stopColor="#9B72CB" />
          <stop offset="1" stopColor="#D96570" />
        </linearGradient>
      </defs>
    </svg>
  );
}
