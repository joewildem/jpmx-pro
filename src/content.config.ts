import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const image = z.object({ src: z.string(), alt: z.string() });
const section = z.object({
  title: z.string(),
  paragraphs: z.array(z.string()).default([]),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/projects' }),
  schema: z.object({
    projectSlug: z.string(),
    locale: z.enum(['es', 'en']),
    draft: z.boolean().default(false),
    title: z.string(),
    seoDescription: z.string(),
    summary: z.array(z.string()),
    year: z.string(),
    client: z.string(),
    url: z.string().optional().default(''),
    category: z.string(),
    homepageOrder: z.number().default(99),
    cover: image,
    problem: section,
    objective: section.extend({ bullets: z.array(z.string()).default([]) }),
    process: z.object({
      title: z.string(),
      stages: z.array(z.object({ title: z.string(), body: z.string() })),
    }),
    impact: z.object({
      title: z.string(),
      description: z.string(),
      metrics: z.array(z.object({ label: z.string(), value: z.string() })),
    }),
    images: z.array(image).default([]),
    relatedSlug: z.string().optional().default(''),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/pages' }),
  schema: z.object({
    locale: z.enum(['es', 'en']),
    seoTitle: z.string(),
    seoDescription: z.string(),
    location: z.string(),
    availability: z.string(),
    heroTitle: z.string(),
    heroDescription: z.string(),
    primaryCta: z.string(),
    contactCta: z.string(),
    nowLabel: z.string(),
    nowItems: z.array(z.string()),
    scrollCueStart: z.string(),
    scrollCueEnd: z.string(),
    projectsLabel: z.string(),
    aboutTitle: z.string(),
    aboutParagraphs: z.array(z.string()),
    linkedInLabel: z.string(),
    resumeLabel: z.string(),
    servicesTitle: z.string(),
    services: z.array(z.object({ title: z.string(), skills: z.array(z.string()) })),
    stats: z.array(z.string()),
    contactEyebrow: z.string(),
    contactTitle: z.string(),
  }),
});

export const collections = { projects, pages };
