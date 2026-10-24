/**
 * The ecosystem section on the homepage (chapter 02, `#integrations`).
 *
 * ## Which tools, and on whose word
 *
 * The eight tools are the founder's list, confirmed in D39 as tools SheetFlow
 * delivers with. n8n, Supabase, AWS and NotebookLM were not named anywhere on
 * the site before D39; `content/faq.ts` now names them in its integrations
 * answer, so the evidence rule (no tool named that the FAQ does not name) holds.
 *
 * ## Where the marks come from (D40)
 *
 * D40 drops the monochrome treatment for full-colour marks on white tiles, at
 * the founder's request. Five marks are Simple Icons 16.35.0 path data, copied
 * verbatim and pinned (CC0 for the drawing; the trademarks stay their owners'),
 * filled in the brand colour. Slack, AWS and Google Workspace are **not** in
 * Simple Icons (their owners asked for removal), so `EcosystemMark.tsx` draws
 * them from basic shapes in the brand palette. Their brand guidelines reserve
 * the official files for licensed partners; swap in the official assets if
 * SheetFlow joins those programmes, or revert those three to monograms.
 *
 * None of these companies is a client, partner or endorser, the copy never
 * says otherwise, and the section carries the trademark line.
 */

export interface EcosystemTool {
  id: string;
  name: string;
  group: 'Communication & AI' | 'Cloud & automation';
  /** The habit the client keeps. The point of the section is that nothing here changes for them. */
  habit: string;
  /** Brand colour as an `r g b` triplet, used for the tile glow. */
  brand: string;
  /**
   * Simple Icons path data on a 24x24 viewBox with its fill, or `drawn` where
   * `EcosystemMark.tsx` builds the mark from shapes.
   */
  mark: { kind: 'path'; d: string; fill: string } | { kind: 'drawn' };
}

export const ecosystem: EcosystemTool[] = [
  {
    id: "whatsapp",
    name: "WhatsApp Business API",
    group: "Communication & AI",
    habit: "Customers keep messaging the number they already know.",
    brand: "37 211 102",
    mark: { kind: 'path', fill: "#25D366", d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" },
  },
  {
    id: "slack",
    name: "Slack",
    group: "Communication & AI",
    habit: "Alerts arrive in the channel your team already watches.",
    brand: "224 30 90",
    mark: { kind: 'drawn' },
  },
  {
    id: "notion",
    name: "Notion",
    group: "Communication & AI",
    habit: "Records and notes land in the workspace you already use.",
    brand: "232 160 96",
    mark: { kind: 'path', fill: "#111111", d: "M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" },
  },
  {
    id: "notebooklm",
    name: "NotebookLM",
    group: "Communication & AI",
    habit: "Your own documents stay the source your team works from.",
    brand: "124 108 230",
    mark: { kind: 'path', fill: "url(#eco-grad-notebooklm)", d: "M11.999 3.201C5.372 3.201 0 8.528 0 15.101V20.8h2.212v-.568c0-2.666 2.178-4.827 4.866-4.827 2.688 0 4.866 2.16 4.866 4.827v.568h2.212v-.568c0-3.877-3.17-7.019-7.078-7.019A7.075 7.075 0 0 0 2.992 14.5a7.355 7.355 0 0 1 6.568-4.016c4.057 0 7.347 3.264 7.347 7.287V20.8h2.212V17.77c0-5.235-4.28-9.481-9.560-9.481a9.563 9.563 0 0 0-6.217 2.28A9.795 9.795 0 0 1 12 5.393c5.406 0 9.788 4.346 9.788 9.707V20.8H24V15.1c-.001-6.573-5.373-11.9-12.001-11.9Z" },
  },
  {
    id: "n8n",
    name: "n8n",
    group: "Cloud & automation",
    habit: "Workflows you can open, read and own.",
    brand: "234 75 113",
    mark: { kind: 'path', fill: "#EA4B71", d: "M21.4737 5.6842c-1.1772 0-2.1663.8051-2.4468 1.8947h-2.8955c-1.235 0-2.289.893-2.492 2.111l-.1038.623a1.263 1.263 0 0 1-1.246 1.0555H11.289c-.2805-1.0896-1.2696-1.8947-2.4468-1.8947s-2.1663.8051-2.4467 1.8947H4.973c-.2805-1.0896-1.2696-1.8947-2.4468-1.8947C1.1311 9.4737 0 10.6047 0 12s1.131 2.5263 2.5263 2.5263c1.1772 0 2.1663-.8051 2.4468-1.8947h1.4223c.2804 1.0896 1.2696 1.8947 2.4467 1.8947 1.1772 0 2.1663-.8051 2.4468-1.8947h1.0008a1.263 1.263 0 0 1 1.2459 1.0555l.1038.623c.203 1.218 1.257 2.111 2.492 2.111h.3692c.2804 1.0895 1.2696 1.8947 2.4468 1.8947 1.3952 0 2.5263-1.131 2.5263-2.5263s-1.131-2.5263-2.5263-2.5263c-1.1772 0-2.1664.805-2.4468 1.8947h-.3692a1.263 1.263 0 0 1-1.246-1.0555l-.1037-.623A2.52 2.52 0 0 0 13.9607 12a2.52 2.52 0 0 0 .821-1.4794l.1038-.623a1.263 1.263 0 0 1 1.2459-1.0555h2.8955c.2805 1.0896 1.2696 1.8947 2.4468 1.8947 1.3952 0 2.5263-1.131 2.5263-2.5263s-1.131-2.5263-2.5263-2.5263m0 1.2632a1.263 1.263 0 0 1 1.2631 1.2631 1.263 1.263 0 0 1-1.2631 1.2632 1.263 1.263 0 0 1-1.2632-1.2632 1.263 1.263 0 0 1 1.2632-1.2631M2.5263 10.7368A1.263 1.263 0 0 1 3.7895 12a1.263 1.263 0 0 1-1.2632 1.2632A1.263 1.263 0 0 1 1.2632 12a1.263 1.263 0 0 1 1.2631-1.2632m6.3158 0A1.263 1.263 0 0 1 10.1053 12a1.263 1.263 0 0 1-1.2632 1.2632A1.263 1.263 0 0 1 7.579 12a1.263 1.263 0 0 1 1.2632-1.2632m10.1053 3.7895a1.263 1.263 0 0 1 1.2631 1.2632 1.263 1.263 0 0 1-1.2631 1.2631 1.263 1.263 0 0 1-1.2632-1.2631 1.263 1.263 0 0 1 1.2632-1.2632" },
  },
  {
    id: "aws",
    name: "AWS",
    group: "Cloud & automation",
    habit: "Where hosting is needed, it can run in your own cloud account.",
    brand: "255 153 0",
    mark: { kind: 'drawn' },
  },
  {
    id: "supabase",
    name: "Supabase",
    group: "Cloud & automation",
    habit: "Data lives in a Postgres database that stays yours.",
    brand: "62 207 142",
    mark: { kind: 'path', fill: "#3ECF8E", d: "M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.33 13.427.65 15.455 2.409 15.455h9.579l.113 7.51c.014.985 1.259 1.408 1.873.636l9.262-11.653c1.093-1.375.113-3.403-1.645-3.403h-9.642z" },
  },
  {
    id: "google-workspace",
    name: "Google Workspace",
    group: "Cloud & automation",
    habit: "Sheets, Calendar and Gmail stay exactly where they are.",
    brand: "66 133 244",
    mark: { kind: 'drawn' },
  },
];

/** Look a tool up by id; throws on a typo so a badge can never render blank. */
export function ecosystemTool(id: string): EcosystemTool {
  const tool = ecosystem.find((t) => t.id === id);
  if (!tool) throw new Error(`Unknown ecosystem tool: ${id}`);
  return tool;
}
