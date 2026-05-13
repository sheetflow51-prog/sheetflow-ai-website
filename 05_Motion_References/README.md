# 05_Motion_References

## Purpose

Animation and motion design specifications. This folder documents all motion behaviors, micro-interactions, and animation timelines that bring the website to life.

## Contents

### gsap/
- GSAP animation examples and snippets
- Timeline sequences
- Scroll trigger animations
- Common easing functions used
- Performance-optimized animation patterns
- Stagger and delay patterns

### scroll_storytelling/
- Scroll-triggered reveal animations
- Parallax effect specifications
- Pin and progressive animations
- Counter animations and statistics
- Section transition behaviors
- Scroll velocity interactions

### transitions/
- Page transition animations
- Element entrance and exit animations
- Modal open/close animations
- State change animations
- Hover and focus transitions
- Loading state transitions

### cursor_effects/
- Custom cursor designs
- Cursor tracking and following
- Magnetic cursor interactions
- Cursor scale and rotation
- Context-aware cursor changes
- Accessibility considerations for cursor effects

### loading_sequences/
- Page load progress indicators
- Skeleton loading states
- Spinner and animation loops
- Content reveal timing
- Perceived performance improvements
- Fallback behaviors

## Animation Principles

1. **Purpose** - Every animation should serve a purpose (guide attention, provide feedback, enhance UX)
2. **Subtlety** - Animations should be smooth and not jarring
3. **Performance** - Prioritize GPU-accelerated properties (transform, opacity)
4. **Accessibility** - Respect `prefers-reduced-motion` setting
5. **Consistency** - Use unified timing and easing across the site

## Timing Guidelines

- **Fast** - 200ms (micro-interactions)
- **Standard** - 400ms (transitions)
- **Slow** - 800ms+ (storytelling)
- **Easing** - Power easing for intentional, natural motion

## Documentation Format

Each animation should include:
- Visual reference (video or GIF)
- GSAP code snippet
- Duration and easing
- Trigger conditions
- Performance notes
- Browser compatibility
- Fallback behavior

## Performance Optimization

- Use transform and opacity only
- Avoid animating layout properties
- Test on lower-end devices
- Implement will-change strategically
- Monitor frame rate with DevTools
- Consider reduced motion preferences

## Next Steps

1. Create GSAP animation library
2. Document all transitions
3. Build scroll trigger sequences
4. Design cursor effects
5. Test on various devices

---

Updated: 2026-05-06
