/**
 * The theme's Tailwind build.
 *
 * It imports the project's own design tokens (`tailwind.tokens.cjs` at the repository root) and
 * scans the theme's PHP and JS, so the WordPress templates compile against exactly the same
 * colours, type scale, radii and shadows the original React frontend used. The utility class
 * names in the templates are the ones in the components.
 *
 * Build it from the repository root:
 *   npm run theme:css
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const tokens = require('../../tailwind.tokens.cjs');

export default {
  content: ['./**/*.php', './assets/js/**/*.js'],
  theme: tokens.theme,
  plugins: [],
};
