import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { site } from '@/config/site';
import { getPosts, postPath } from '@/lib/content';

export const GET: APIRoute = async (context) => {
  const posts = await getPosts();
  return rss({
    title: `${site.name} Blog`,
    description: 'Articles on mental health, recovery, and wellness.',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postPath(post),
    })),
  });
};
