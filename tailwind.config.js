/**
 * The React frontend's Tailwind build. The design tokens come from tailwind.tokens.cjs, which the
 * WordPress theme builds from too, so the two stay in step.
 */
import tokens from './tailwind.tokens.cjs';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: tokens.theme,
  plugins: [],
};
