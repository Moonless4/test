import { homeSections } from '../content/home.js';

// The homepage is the reference page itself, so it keeps the captured section
// markup — every other route is built from React components.
const html = homeSections.map((section) => section.html).join('');

export default function HomePage() {
  return (
    <div
      className="elementor elementor-837"
      data-elementor-id="837"
      data-elementor-type="wp-page"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
