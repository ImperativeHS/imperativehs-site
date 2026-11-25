import { getCollection, type CollectionEntry } from 'astro:content';

export type Service = CollectionEntry<'services'>;
export type Post = CollectionEntry<'blog'>;

export const servicePath = (service: Service) => `/services/${service.id}/`;
export const postPath = (post: Post) => `/blog/${post.id}/`;

export async function getServices(): Promise<Service[]> {
  const services = await getCollection('services');
  return services.sort((a, b) => a.data.order - b.data.order);
}

/** Published posts, newest first. Drafts are visible in `astro dev` only. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', (post) => import.meta.env.DEV || !post.data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' });
export const formatDate = (date: Date) => dateFormatter.format(date);

/** Estimated reading time in minutes (~220 words per minute). */
export function readingMinutes(post: Post): number {
  const words = (post.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** Up to `count` other posts, same category first, then the most recent. */
export function relatedPosts(post: Post, all: Post[], count = 3): Post[] {
  const others = all.filter((p) => p.id !== post.id);
  const sameCategory = others.filter((p) => p.data.category === post.data.category);
  const rest = others.filter((p) => p.data.category !== post.data.category);
  return [...sameCategory, ...rest].slice(0, count);
}
