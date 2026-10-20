import headerHtml from './content/header.html?raw';
import footerHtml from './content/footer.html?raw';
import { homeSections } from './content/home.js';

// The reference markup is a single document fragment: the header opens
// #container / #page-body and the footer closes them again. Keeping the
// fragments in one string preserves the original nesting exactly.
const pageHtml = headerHtml + homeSections.map((section) => section.html).join('') + footerHtml;

export default function App() {
  return <div dangerouslySetInnerHTML={{ __html: pageHtml }} />;
}
