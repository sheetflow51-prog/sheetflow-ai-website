import Link from 'next/link';

/**
 * The visible breadcrumb.
 *
 * Google's guidance is that `BreadcrumbList` markup should reflect a trail the
 * page actually shows. Emitting the schema without the visible trail is the
 * usual way sites get the markup flagged, so the two are built from the same
 * array — `trail` here is the same shape the graph consumes.
 *
 * `aria-current="page"` on the last crumb, and the last crumb is not a link:
 * a link to the page you are on is a documented screen-reader annoyance and
 * adds nothing for anyone else.
 */
export function ServiceBreadcrumb({
  trail,
}: {
  trail: Array<{ name: string; href: string }>;
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-400">
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="text-ink-300">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="inline-flex min-h-[24px] items-center transition-colors hover:text-white"
                  data-cursor="hover"
                >
                  {crumb.name}
                </Link>
              )}
              {!last && (
                <span aria-hidden="true" className="text-ink-400/50">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
