# Production Notes

## Deployment

- **Host:** Vercel
- **Branch strategy:** main → production, dev → preview
- **Build command:** `npm run build`
- **Output directory:** `.next`

## Environment

- Always use environment variables for Spline scene URLs
- Never commit `.env.local` to version control
- Use Vercel environment variables for production secrets

## Known Considerations

- Spline scenes should lazy load to avoid blocking initial page render
- GSAP ScrollTrigger must be killed on component unmount to prevent memory leaks
- Test animations with `prefers-reduced-motion: reduce` in DevTools
- Spline viewer on mobile may need reduced scene complexity

## Post-Launch

- Monitor Sentry for JS errors after launch
- Check Core Web Vitals in Google Search Console weekly
- A/B test headline variations after 500+ visitors
- Collect user feedback via Hotjar or similar

---

Last Updated: 2026-05-06
