# SheetFlow AI — Component Architecture

---

## 01. Design Token System

### Color Tokens
```css
:root {
  /* Base */
  --color-void:          #060608;
  --color-bg-primary:    #0A0B0F;
  --color-surface-1:     #0F1117;
  --color-surface-2:     #141720;
  --color-surface-3:     #1A1F2E;
  --color-border-subtle: #1E2435;
  --color-border:        #2A3045;
  
  /* Text */
  --color-text-primary:  #FFFFFF;
  --color-text-secondary: #A0A8BC;
  --color-text-tertiary:  #6B7490;
  --color-text-disabled:  #3D4460;
  
  /* Accent — Intelligence */
  --color-accent:        #6366F1;
  --color-accent-bright: #818CF8;
  --color-accent-glow:   rgba(99, 102, 241, 0.15);
  --color-accent-border: rgba(99, 102, 241, 0.3);
  
  /* Accent — Depth */
  --color-violet:        #8B5CF6;
  --color-violet-bright: #A78BFA;
  
  /* Status */
  --color-success:       #10B981;
  --color-warning:       #F59E0B;
  --color-danger:        #F43F5E;
  --color-info:          #06B6D4;
  
  /* Radius */
  --radius-sm:  6px;
  --radius-md:  8px;
  --radius-lg:  12px;
  --radius-xl:  16px;
  --radius-2xl: 20px;
  --radius-full: 100px;
  
  /* Typography */
  --font-sans:  'Söhne', 'Inter', system-ui, sans-serif;
  --font-mono:  'JetBrains Mono', 'Fira Code', monospace;
}
```

---

## 02. Stat Counter Component

```jsx
// React component for animated statistics
function StatCounter({ value, label, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Count up animation
          const duration = 1800;
          const start = performance.now();
          const target = parseFloat(value.replace(/[^0-9.]/g, ''));
          
          const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // cubic ease out
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);
  
  return (
    <div ref={ref} className="stat-item">
      <div className="stat-value">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
```

---

## 03. Intelligence Command Demo Component

```jsx
// Animated command palette demo
const DEMO_COMMANDS = [
  {
    input: 'Alert me when MRR drops below $150K',
    output: 'Monitoring created. Watching MRR column. Threshold: $150,000.',
    delay: 800
  },
  {
    input: 'Send weekly pipeline summary every Monday 8am',
    output: 'Report scheduled. Delivers every Monday at 8:00 AM.',
    delay: 1200
  },
  {
    input: 'Detect anomalies in Q3 revenue forecast',
    output: 'Anomaly detection active. Watching for statistical outliers.',
    delay: 900
  }
];

function CommandDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('typing'); // typing | processing | response | pause
  const [displayText, setDisplayText] = useState('');
  
  // Typewriter effect, processing state, response reveal — cycle through commands
  // Implementation handles each phase with appropriate timing and easing
  
  return (
    <div className="command-demo">
      <div className="command-header">
        <span className="command-badge">AI</span>
        <span className="command-label">SheetFlow Intelligence</span>
        <span className="status-live">● LIVE</span>
      </div>
      
      <div className="command-input-area">
        <span className="command-prompt">{'>'}</span>
        <span className="command-text">{displayText}</span>
        {phase === 'typing' && <span className="command-cursor" />}
      </div>
      
      {phase === 'response' && (
        <div className="command-response">
          <span className="response-arrow">→</span>
          <span className="response-text">{DEMO_COMMANDS[currentIndex].output}</span>
        </div>
      )}
    </div>
  );
}
```

---

## 04. Bento Grid Layout System

```css
/* Bento grid container */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: minmax(180px, auto);
  gap: 12px;
}

/* Large cell — 7 cols × 2 rows */
.bento-large {
  grid-column: span 7;
  grid-row: span 2;
}

/* Medium cell — 5 cols × 1 row */
.bento-medium {
  grid-column: span 5;
  grid-row: span 1;
}

/* Small cell — 5 cols × 1 row */
.bento-small {
  grid-column: span 5;
  grid-row: span 1;
}

/* Wide cell — 12 cols × 1 row */
.bento-wide {
  grid-column: span 12;
  grid-row: span 1;
}

/* Tall cell — 4 cols × 2 rows */
.bento-tall {
  grid-column: span 4;
  grid-row: span 2;
}

/* Responsive: tablet */
@media (max-width: 1024px) {
  .bento-large { grid-column: span 12; }
  .bento-medium { grid-column: span 6; }
  .bento-small { grid-column: span 6; }
  .bento-tall { grid-column: span 6; grid-row: span 1; }
}

/* Responsive: mobile */
@media (max-width: 768px) {
  .bento-grid { grid-template-columns: 1fr; gap: 8px; }
  .bento-large,
  .bento-medium,
  .bento-small,
  .bento-wide,
  .bento-tall { grid-column: span 1; grid-row: span 1; }
}
```

---

## 05. Section Container System

```css
/* Base section */
.section {
  position: relative;
  padding: var(--section-pad) 0;
  overflow: hidden;
}

/* Content wrapper */
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 40px;
}

.container-sm  { max-width: 640px; }
.container-md  { max-width: 900px; }   /* Headlines */
.container-lg  { max-width: 1100px; }  /* Features */
.container-xl  { max-width: 1280px; }  /* Wide grids */
.container-full { max-width: 100%; }   /* Edge-to-edge */

/* Section divider */
.section-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.06) 30%,
    rgba(255, 255, 255, 0.06) 70%,
    transparent
  );
  margin: 0;
}

/* Section kicker */
.section-kicker {
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-accent-bright);
  margin-bottom: 20px;
  opacity: 0.8;
}

/* Section headline */
.section-headline {
  font-size: clamp(36px, 5vw, 64px);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.0;
  color: var(--color-text-primary);
  margin-bottom: 20px;
}

/* Section sub */
.section-sub {
  font-size: 18px;
  font-weight: 400;
  line-height: 1.65;
  color: var(--color-text-secondary);
  max-width: 560px;
}
```

---

## 06. Scroll Reveal CSS Classes

```css
/* Base reveal states */
.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition:
    opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger helpers — add delay to nth children */
.stagger > *:nth-child(1) { transition-delay: 0ms; }
.stagger > *:nth-child(2) { transition-delay: 80ms; }
.stagger > *:nth-child(3) { transition-delay: 160ms; }
.stagger > *:nth-child(4) { transition-delay: 240ms; }
.stagger > *:nth-child(5) { transition-delay: 320ms; }
.stagger > *:nth-child(6) { transition-delay: 400ms; }

/* Reveal variations */
.reveal-up    { transform: translateY(40px); }
.reveal-left  { transform: translateX(-40px); }
.reveal-right { transform: translateX(40px); }
.reveal-scale { transform: scale(0.96); }
.reveal-blur  { filter: blur(8px); }

.reveal.is-visible {
  transform: translateY(0) translateX(0) scale(1);
  filter: blur(0px);
}
```

---

*Last Updated: 2026 | SheetFlow AI Brand Intelligence*
