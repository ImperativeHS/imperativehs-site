/**
 * schema.org JSON-LD builders. Rendered by <Seo jsonLd={...} />.
 * Validate changes with https://search.google.com/test/rich-results.
 */
import { site } from '@/config/site';

type JsonLd = Record<string, unknown>;

export const ORG_ID = `${site.url}/#organization`;

const absolute = (path: string) => new URL(path, site.url).href;

export function clinicSchema(options: {
  logoUrl: string;
  services: { name: string; path: string }[];
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalClinic', 'MedicalBusiness'],
    '@id': ORG_ID,
    name: site.name,
    alternateName: site.shortName,
    description: site.defaultDescription,
    url: absolute('/'),
    logo: absolute(options.logoUrl),
    image: absolute(options.logoUrl),
    telephone: site.phone.e164,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    openingHoursSpecification: site.openingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    areaServed: site.serviceAreas.map((name) => ({ '@type': 'AdministrativeArea', name })),
    medicalSpecialty: 'Psychiatric',
    hasMap: site.mapsUrl,
    availableService: options.services.map((s) => ({
      '@type': 'MedicalTherapy',
      name: s.name,
      url: absolute(s.path),
    })),
  };
}

export function serviceSchema(service: { name: string; description: string; path: string }): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    url: absolute(service.path),
    provider: { '@id': ORG_ID },
    areaServed: site.serviceAreas.map((name) => ({ '@type': 'AdministrativeArea', name })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function articleSchema(post: {
  title: string;
  description: string;
  path: string;
  pubDate: Date;
  updatedDate?: Date;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: absolute(post.path),
    mainEntityOfPage: absolute(post.path),
    datePublished: post.pubDate.toISOString(),
    dateModified: (post.updatedDate ?? post.pubDate).toISOString(),
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
  };
}
