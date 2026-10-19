export interface NavLink {
  label: string;
  href: string;
}

/** "Services" gets a dropdown of service pages from src/content/services (see Header.astro). */
export const primaryNav: NavLink[] = [
  { label: 'Services', href: '/services/' },
  { label: 'Insurance', href: '/insurance/' },
  { label: 'About', href: '/about/' },
  { label: 'Our Team', href: '/team/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Contact', href: '/contact/' },
];

export const footerNav: NavLink[] = [
  { label: 'Request an appointment', href: '/request-appointment/' },
  { label: 'Refer a client', href: '/referrals/' },
  { label: 'Insurance', href: '/insurance/' },
  { label: 'About us', href: '/about/' },
  { label: 'Our team', href: '/team/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Contact', href: '/contact/' },
  { label: 'Privacy', href: '/privacy/' },
];
