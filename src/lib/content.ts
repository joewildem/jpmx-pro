import { getCollection } from 'astro:content';

export async function getHome(locale: 'es'|'en') {
  const entries = await getCollection('pages', ({ data }) => data.locale === locale);
  const home = entries.find((entry) => entry.id.endsWith('/home'));
  if (!home) throw new Error(`Missing ${locale} home content`);
  return home.data;
}

export async function getPublishedProjects(locale: 'es'|'en') {
  const entries = await getCollection('projects', ({ data }) => data.locale === locale && !data.draft);
  return entries.map((entry) => entry.data).sort((a,b) => a.homepageOrder - b.homepageOrder);
}
