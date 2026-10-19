import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    /** Page H1. */
    title: z.string(),
    /** Short label for navigation and cards. */
    shortTitle: z.string(),
    /** <title> tag; keep under ~60 characters. */
    seoTitle: z.string(),
    /** Meta description; keep under ~155 characters. */
    description: z.string(),
    /** One or two sentences shown on cards and under the H1. */
    summary: z.string(),
    /** Sort order in navigation and service lists. */
    order: z.number(),
    /** Key benefits shown as a grid near the top of the page. */
    highlights: z.array(z.object({ title: z.string(), body: z.string() })).default([]),
    /** Who the service is for. */
    whoWeServe: z.array(z.string()).default([]),
    faqs: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { services, blog };
