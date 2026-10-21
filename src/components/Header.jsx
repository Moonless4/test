import { useEffect, useRef } from 'react';
import headerHtml from '../content/header.html?raw';
import { initHeader } from '../lib/header.js';

// The site header is the reference theme's own markup. It is rendered through a
// slot that uses `display: contents`, so `#header-container` stays the direct
// layout sibling of `#page-body` that the theme's spacing rules expect.
export default function Header() {
  const ref = useRef(null);

  useEffect(() => {
    initHeader(ref.current);
  }, []);

  return <div ref={ref} className="site-header-slot" dangerouslySetInnerHTML={{ __html: headerHtml }} />;
}
