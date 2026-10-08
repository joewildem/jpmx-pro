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

export async function getHomepageProjects(locale: 'es'|'en') {
  const previewOrder = ['afore-movil', 'calimax', 'dina'];
  const entries = await getCollection('projects', ({ data }) =>
    data.locale === locale && previewOrder.includes(data.projectSlug)
  );

  return entries
    .map((entry) => entry.data)
    .sort((a,b) => previewOrder.indexOf(a.projectSlug) - previewOrder.indexOf(b.projectSlug));
}
