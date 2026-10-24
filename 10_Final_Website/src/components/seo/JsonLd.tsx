/**
 * Emits one page's entity graph as a single JSON-LD block.
 *
 * A server component with no client boundary — the markup exists in the HTML a
 * crawler receives, which is the entire point. Anything that required
 * hydration to appear would be invisible to the consumers this is for.
 *
 * `dangerouslySetInnerHTML` is the documented way to emit JSON-LD in React:
 * the alternative renders the JSON as escaped text and produces an unparseable
 * block. The content is `JSON.stringify` of a local literal built in
 * `lib/structured-data.ts` — no external input reaches it.
 */
export function JsonLd({ graph }: { graph: Array<Record<string, unknown>> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }),
      }}
    />
  );
}
