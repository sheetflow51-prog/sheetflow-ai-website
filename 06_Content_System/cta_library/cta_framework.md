# SheetFlow AI — CTA Framework & Library

---

## 01. CTA Philosophy

A CTA is not a button. It is a **commitment device**.

When someone clicks a CTA, they are making a decision — not just taking an action.
The copy on that button is the last thing they read before deciding.

Great CTA copy:
- Describes the **destination**, not the action
- Removes **friction** from the mental calculus
- Reinforces the **value** of saying yes
- Creates **momentum** toward the click

Poor CTA copy:
- "Submit" (describes an action, implies work)
- "Click Here" (so generic it communicates nothing)
- "Learn More" (indefinite, no commitment, no destination)
- "Get Started" (meaningless — started on what?)

---

## 02. Primary CTA Library

### Conversion CTAs (High Intent)

| CTA Copy | Context | Psychological Lever |
|---|---|---|
| Start Free — No Credit Card | Primary hero | Removes financial barrier |
| See SheetFlow AI in Action | Video/demo trigger | Low commitment, high curiosity |
| Try It Free for 14 Days | Pricing section | Time-bounded, risk-free |
| Get Your First Workflow Running | Onboarding | Concrete outcome, not abstract |
| Start Automating Today | Urgency context | Today = immediate value |
| Claim Your Free Account | Scarcity framing | Ownership language |
| Run SheetFlow AI on Your Data | Power user appeal | Possessive — their data |

### Consideration CTAs (Medium Intent)

| CTA Copy | Context | Psychological Lever |
|---|---|---|
| Watch It Work → | Hero secondary | Low friction, high curiosity |
| See a Live Demo | Enterprise context | Personal attention, validation |
| Explore the Features | Feature section | Permission to browse |
| Read How It Works | Technical audience | Respect for intelligence |
| View Pricing | Active buyer mode | Clear path to decision |

### Awareness CTAs (Low Intent)

| CTA Copy | Context | Psychological Lever |
|---|---|---|
| Learn More | Content/blog | Generic — use sparingly |
| Read the Case Study | Social proof | Social validation |
| Explore Documentation | Developer audience | Technical depth |
| Join the Newsletter | Long-term nurture | FOMO, ongoing value |

---

## 03. CTA Friction-Removal Copy

The text below a CTA is as important as the CTA itself.
These micro-copy lines remove the last objections before clicking.

### Risk Removal
- "No credit card required."
- "Free plan, no time limit."
- "Cancel anytime, no questions."
- "Setup in under 5 minutes."
- "Your data never leaves your account."

### Social Validation
- "Join 2,400+ teams already running smarter."
- "Trusted by operations teams at leading companies."
- "Rated 4.9/5 across 800+ reviews."

### Speed Signals
- "Start seeing results this week."
- "First automation running in 5 minutes."
- "Zero engineering required."

---

## 04. CTA Pair Architecture

### The Primary + Secondary Pair
The best CTA sections offer two paths — high commitment and low commitment.

**Pattern 1: Convert + Explore**
```
[Start Free Trial]     Watch how it works →
Primary (filled btn)   Secondary (text link)
```

**Pattern 2: Try + See**
```
[Try Free for 14 Days]     [See a Live Demo]
Primary (filled btn)        Secondary (outline btn)
```

**Pattern 3: Start + Learn**
```
[Start Automating]     Read the docs →
For: active buyers     For: technical evaluators
```

### The Single-CTA Section
For the final CTA and confirmation moments, one option removes decision paralysis.
```
[Start Free — No Credit Card Required]
       Setup in 5 minutes. Cancel anytime.
```

---

## 05. Enterprise CTA System

Enterprise visitors require different language:
- "Schedule a Demo" over "Start Free Trial" (investment signals seriousness)
- "Talk to Sales" over "Contact Us" (specific, functional)
- "Request a Pilot" over "Try Free" (program language)

### Enterprise CTA Sequence
```
First contact:   "Schedule a 30-Minute Demo"
Second touch:    "See SheetFlow AI Running on Your Data"
Decision stage:  "Request Enterprise Pricing"
Closing:         "Start Your Pilot Program"
```

---

## 06. Contextual CTA Placement Rules

### Rule 1: Above the Fold
Always. No exceptions. The hero must have a CTA.
The visitor should never have to scroll to find the action.

### Rule 2: Post-Proof
After every compelling proof point (stat, testimonial, case study), place a CTA.
The visitor is at peak conviction — don't make them scroll to act.

### Rule 3: End of Every Section
A small CTA or text link at the end of each major section.
Never let the visitor reach a dead end.

### Rule 4: Exit Intent
When mouse moves toward browser close, a tasteful modal:
"Before you go — see SheetFlow AI in 60 seconds."
Not aggressive. One dismissal = never show again.

---

## 07. Button Visual Specifications

### Primary CTA Button
```css
.cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: #6366F1;
  color: #FFFFFF;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

.cta-primary:hover {
  transform: translateY(-2px);
  background: #818CF8;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.55);
}

.cta-primary:active {
  transform: translateY(0px) scale(0.98);
  transition-duration: 0.08s;
}
```

### Secondary CTA Button
```css
.cta-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  font-weight: 400;
  border: none;
  cursor: pointer;
  transition: color 0.15s ease;
}

.cta-secondary:hover {
  color: #FFFFFF;
}

.cta-secondary .arrow {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.cta-secondary:hover .arrow {
  transform: translateX(4px);
}
```

---

*Last Updated: 2026 | SheetFlow AI Brand Intelligence*
