# SheetFlow AI — Glassmorphism & Component System

---

## 01. Component Design Principles

### The Material Language
SheetFlow AI UI exists in physical space.
Every component has:
- **Weight** — some elements feel heavier (more opaque, more shadow)
- **Elevation** — some elements float higher (more blur, more glow)
- **Temperature** — some elements feel warmer (slight violet shift) or cooler (slight teal shift)

### The Elevation System

```
Level 0 — Foundation:   The page background itself. No shadow. No border.
Level 1 — Surface:      Cards at rest. 1px border, subtle shadow.
Level 2 — Raised:       Hover states, active cards. More blur, glow border.
Level 3 — Floating:     Modals, dropdowns. Full blur, prominent glow.
Level 4 — Overlay:      Full-screen overlays. Maximum backdrop effect.
```

---

## 02. Card Component Library

### Base Card
```css
.card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 28px;
  
  /* Elevation 1 shadow */
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.05) inset,
    0 8px 24px rgba(0, 0, 0, 0.3);
    
  transition: 
    background 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Interactive Card (Hover)
```css
.card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(99, 102, 241, 0.35);
  transform: translateY(-4px);
  
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.08) inset,
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(99, 102, 241, 0.1),
    0 0 40px rgba(99, 102, 241, 0.1);
}
```

### Feature Card (Bento)
```css
.feature-card {
  position: relative;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  padding: 32px;
  overflow: hidden;
  
  /* Dynamic highlight overlay — moves with mouse */
  --mouse-x: 50%;
  --mouse-y: 50%;
}

.feature-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at var(--mouse-x) var(--mouse-y),
    rgba(255, 255, 255, 0.05),
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.feature-card:hover::before {
  opacity: 1;
}
```

```javascript
// Mouse position tracking for highlight effect
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', x + '%');
    card.style.setProperty('--mouse-y', y + '%');
  });
});
```

---

## 03. Navigation Component

### The Transparent Nav
```css
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 32px;
  
  background: transparent;
  border-bottom: 1px solid transparent;
  backdrop-filter: blur(0px);
  
  transition:
    background 0.3s ease,
    border-color 0.3s ease,
    backdrop-filter 0.3s ease;
}

.nav.scrolled {
  background: rgba(6, 6, 8, 0.8);
  border-bottom-color: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px) saturate(180%);
}
```

### Nav Logo
```css
.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
  letter-spacing: -0.02em;
  text-decoration: none;
}

.nav-logo-mark {
  width: 28px;
  height: 28px;
  /* The geometric logo mark */
}
```

### Nav Links
```css
.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 40px;
}

.nav-link {
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  border-radius: 6px;
  transition: color 0.15s ease, background 0.15s ease;
}

.nav-link:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.06);
}
```

---

## 04. Button System

### Full Button Component Library

```css
/* === PRIMARY BUTTON === */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  padding: 0 24px;
  
  background: #6366F1;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  
  box-shadow: 
    0 0 0 1px rgba(99, 102, 241, 0.5),
    0 4px 16px rgba(99, 102, 241, 0.35);
  
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-primary:hover {
  background: #7C7EF7;
  transform: translateY(-1px);
  box-shadow:
    0 0 0 1px rgba(99, 102, 241, 0.7),
    0 8px 24px rgba(99, 102, 241, 0.5);
}

.btn-primary:active {
  transform: scale(0.98);
  transition-duration: 0.08s;
}

/* === SECONDARY BUTTON === */
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 20px;
  
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
}

/* === GHOST BUTTON === */
.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 16px;
  
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font-size: 14px;
  font-weight: 400;
  border: none;
  cursor: pointer;
  
  transition: color 0.15s ease;
}

.btn-ghost:hover {
  color: rgba(255, 255, 255, 0.9);
}

.btn-ghost .arrow {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-ghost:hover .arrow {
  transform: translateX(3px);
}
```

---

## 05. Badge & Label System

### Status Badges
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.badge-live {
  background: rgba(16, 185, 129, 0.12);
  color: #10B981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.badge-live::before {
  content: '';
  width: 6px;
  height: 6px;
  background: #10B981;
  border-radius: 50%;
  animation: pulse-live 2s ease-in-out infinite;
}

@keyframes pulse-live {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

.badge-new {
  background: rgba(99, 102, 241, 0.12);
  color: #818CF8;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.badge-ai {
  background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15));
  color: #A5B4FC;
  border: 1px solid rgba(99, 102, 241, 0.2);
}
```

---

## 06. Input System

### Text Input
```css
.input {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  
  color: #FFFFFF;
  font-size: 14px;
  font-family: inherit;
  
  transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}

.input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.input:hover {
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
}

.input:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.6);
  background: rgba(99, 102, 241, 0.05);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}
```

### Command Palette Input (AI)
```css
.command-input {
  width: 100%;
  height: 56px;
  padding: 0 20px 0 48px;
  
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  
  color: #FFFFFF;
  font-size: 15px;
  font-family: 'JetBrains Mono', monospace;
  
  backdrop-filter: blur(20px);
  box-shadow:
    0 0 40px rgba(99, 102, 241, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.command-input:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.6);
  box-shadow:
    0 0 60px rgba(99, 102, 241, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

---

## 07. Spacing Scale Implementation

```css
:root {
  /* Spacing tokens */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-32: 128px;
  --space-40: 160px;
  --space-48: 192px;
  --space-64: 256px;
  
  /* Section spacing */
  --section-gap:    var(--space-32);    /* Between sections: 128px */
  --section-pad:    var(--space-20);    /* Section internal: 80px */
  --hero-offset:    var(--space-40);    /* Hero top margin: 160px */
  
  /* Component spacing */
  --card-pad:       var(--space-8);     /* Card padding: 32px */
  --card-gap:       var(--space-3);     /* Card grid gap: 12px */
}
```

---

*Last Updated: 2026 | SheetFlow AI Brand Intelligence*
