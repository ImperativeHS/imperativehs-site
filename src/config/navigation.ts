import { site } from './site';

export interface NavLink {
  label: string;
  href: string;
  /** Dropdown items. `'services'` fills the dropdown from src/content/services. */
  children?: NavLink[] | 'services';
  external?: boolean;
}

export const primaryNav: NavLink[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About Us',
    href: '/about/',
    children: [
      { label: 'Who We Are', href: '/about/' },
      { label: 'Our Team', href: '/team/' },
      { label: 'Refer a Client', href: '/referrals/' },
    ],
  },
  { label: 'Our Services', href: '/services/', children: 'services' },
  { label: 'Free Assessment', href: site.screeningUrl, external: true },
  { label: 'Insurance', href: '/insurance/' },
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
