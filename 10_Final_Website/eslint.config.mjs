import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/**
 * ESLint flat config.
 *
 * eslint-config-next 15.3+/16 ships native flat-config arrays via its
 * `./core-web-vitals` and `./typescript` subpath exports, so we spread those
 * directly. The previous FlatCompat(`extends`) bridge crashed under ESLint 9
 * with "Converting circular structure to JSON" while validating the wrapped
 * eslintrc config — dropping FlatCompat removes that failure entirely.
 */
const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'public/**',
      '*.config.mjs',
      '*.config.ts',
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      '@next/next/no-img-element': 'off',
      'react/no-unescaped-entities': 'off',
      // These fire on setBypass()/setBooted() inside effects that gate on
      // client-only checks (prefersReducedMotion / isTouchDevice read window,
      // so they must run post-mount, not during SSR render). That's the
      // correct pattern here, not a bug — keep it visible as a warning.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
];

export default eslintConfig;
