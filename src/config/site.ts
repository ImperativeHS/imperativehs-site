/**
 * Business details used across the site (header, footer, structured data, forms).
 * Change contact info here and nowhere else.
 */

export const site = {
  name: 'Imperative Healthcare Services',
  shortName: 'IHS',
  url: 'https://imperativehs.com',
  tagline: 'Outpatient mental health care and in-home support for individuals and families in Maryland.',
  defaultDescription:
    'Compassionate outpatient mental health care in Hyattsville, MD: psychiatric evaluations, medication management, therapy, psychiatric rehabilitation (PRP), substance use treatment, and in-home RSA services.',

  phone: {
    display: '(301) 357-4794',
    href: 'tel:+13013574794',
    e164: '+1-301-357-4794',
  },
  email: 'info@imperativehs.com',

  address: {
    street: '4301 Garden City Dr., Suite 302',
    city: 'Hyattsville',
    region: 'MD',
    postalCode: '20785',
    country: 'US',
  },
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=4301+Garden+City+Dr+Suite+302+Hyattsville+MD+20785',

  hours: [
    { label: 'Monday – Friday', value: '9:00 am – 7:00 pm' },
    { label: 'Saturday', value: 'By appointment only' },
    { label: 'Sunday', value: 'Closed' },
  ],
  /** Machine-readable hours for structured data (schema.org OpeningHoursSpecification). */
  openingHours: [
    {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '19:00',
    },
  ],

  // TODO(content): confirm DC and Virginia are served (licensing / telehealth only?).
  serviceAreas: ['Maryland', 'Washington, DC', 'Virginia'],
  county: "Prince George's County",

  /** Free online screening (GAD-7 / PHQ-9), hosted separately. */
  screeningUrl: 'https://intake.imperativehs.com/',

  crisis: {
    lifeline: { display: '988', href: 'tel:988' },
    emergency: { display: '911', href: 'tel:911' },
  },
} as const;

export const fullAddress = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`;
