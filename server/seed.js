// The first boot builds its document from the content modules the site was
// written with, so the admin panel opens on the real site instead of an empty
// shell. Everything here stays editable — the seed is only the starting point.
import { projects } from '../src/content/projects.js';
import { projectDetails } from '../src/content/project-details.js';
import { services } from '../src/content/services.js';
import { articles } from '../src/content/articles.js';
import {
  SERVICE_CONTACT,
  SERVICE_LINKS,
  interiorDesign,
  oldHouseRenovation,
  luxuryConstruction,
  architecturePlans,
} from '../src/content/service-pages.js';
import { siteDefaults } from '../src/content/site.js';

export function buildSeed() {
  return {
    settings: structuredClone(siteDefaults),
    projects: projects.map((project) => ({ ...project, details: projectDetails[project.slug] || null })),
    services: structuredClone(services),
    articles: structuredClone(articles),
    servicePages: structuredClone({
      SERVICE_CONTACT,
      SERVICE_LINKS,
      interiorDesign,
      oldHouseRenovation,
      luxuryConstruction,
      architecturePlans,
    }),
  };
}
