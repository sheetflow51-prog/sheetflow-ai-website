import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import {
  BASIS_LABEL,
  KIND_LABEL,
  OUTCOME_LABEL,
  type DashboardStory,
  type StoryScene,
} from '@/content/dashboards';

/**
 * Dashboard stories: real interfaces, shown as a short scroll narrative.
 *
 * ## No client JavaScript
 *
 * Everything that moves here is CSS:
 *
 *   - **Stacking.** From 1024px each desktop scene is `position: sticky` with a
 *     per-scene offset (`--i`), so the next scene slides up and over the one
 *     before it. It is the technique wantace.com uses for its process cards,
 *     done with one custom property and no observer.
 *   - **Drift.** A phone frame shows the top of a tall page; as it scrolls
 *     through the viewport its `object-position` runs from top to bottom
 *     (`animation-timeline: view()`), so the visitor scrolls *through* the
 *     dashboard. Browsers without scroll-driven animations, and visitors who ask
 *     for reduced motion, get the static top of the page. That is the resting
 *     state the design already works in.
 *   - **Settle.** Desktop frames ease from 1.05 scale to 1 as they arrive.
 *
 * The images are `next/image` and lazy, so only frames a visitor reaches are
 * fetched. Every story states its data basis and renders the one outcome string
 * the evidence rules allow; see `content/dashboards.ts`.
 */

function Frame({ scene, label }: { scene: StoryScene; label: string }) {
  const phone = scene.device === 'phone';
  return (
    <figure className={phone ? 'scene-frame scene-frame--phone' : 'scene-frame'}>
      {!phone && (
        <div className="scene-bar" aria-hidden="true">
          <i />
          <i />
          <i />
          <span>{label}</span>
        </div>
      )}
      <div className="scene-shot">
        <Image
          src={scene.frame.src}
          alt={scene.frame.alt}
          width={scene.frame.width}
          height={scene.frame.height}
          sizes={phone ? '(min-width: 1024px) 280px, 70vw' : '(min-width: 1024px) 56vw, 92vw'}
          className="scene-img"
        />
      </div>
    </figure>
  );
}

export function DashboardStories({ stories, headingId = 'stories-heading' }: { stories: DashboardStory[]; headingId?: string }) {
  return (
    <div className="stories" aria-labelledby={headingId}>
      {stories.map((story) => (
        <article key={story.slug} className="story" aria-labelledby={`story-${story.slug}`}>
          <header className="story-head">
            <p className="story-kind">{KIND_LABEL[story.kind]}</p>
            <h3 id={`story-${story.slug}`} className="story-title">
              {story.client}
            </h3>
            <p className="story-sector">{story.sector}</p>
            <p className="story-summary">{story.summary}</p>
            <ul className="story-facts">
              <li className="story-chip">{BASIS_LABEL[story.basis.kind]}</li>
              <li className="story-chip">Outcome: {OUTCOME_LABEL}</li>
            </ul>
            <p className="story-note">{story.basis.note}</p>
          </header>

          <ol className="story-scenes">
            {story.scenes.map((scene, i) => (
              <li
                key={scene.id}
                className="scene"
                data-device={scene.device}
                style={{ '--i': i } as CSSProperties}
              >
                <div className="scene-copy">
                  <span className="scene-step">{String(i + 1).padStart(2, '0')}</span>
                  <h4 className="scene-title">{scene.title}</h4>
                  <p className="scene-body">{scene.body}</p>
                </div>
                <Frame scene={scene} label={`${story.client} · ${scene.device === 'phone' ? 'phone' : 'dashboard'}`} />
              </li>
            ))}
          </ol>

          {story.link &&
            (story.link.external ? (
              <a
                href={story.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="story-link"
                data-cursor="hover"
              >
                {story.link.label}
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
              </a>
            ) : (
              <Link href={story.link.href} className="story-link" data-cursor="hover">
                {story.link.label}
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
              </Link>
            ))}
        </article>
      ))}
    </div>
  );
}
