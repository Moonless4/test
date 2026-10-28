// Loads the saved content document before the app renders. The modules under
// `src/content/` stay the source of every page, so a failed request simply
// leaves the static content in place — the site never waits on a blank screen.
import { hydrateArticles } from '../content/articles.js';
import { hydrateProjectDetails } from '../content/project-details.js';
import { hydrateProjects } from '../content/projects.js';
import { hydrateServicePages } from '../content/service-pages.js';
import { hydrateServices } from '../content/services.js';
import { hydrateSite } from '../content/site.js';

export function applyContent(doc) {
  if (!doc || typeof doc !== 'object') return;
  hydrateSite(doc.settings);
  hydrateProjects(doc.projects);
  hydrateProjectDetails(doc.projects);
  hydrateServices(doc.services);
  hydrateArticles(doc.articles);
  hydrateServicePages(doc.servicePages);
}

export async function loadSiteContent() {
  try {
    const response = await fetch('/api/content', { headers: { Accept: 'application/json' } });
    if (!response.ok) return;
    applyContent(await response.json());
  } catch {
    // Static content stays; the panel is the only thing that needs the API.
  }
}
