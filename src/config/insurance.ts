/**
 * Insurance plans accepted.
 *
 * TODO(content): confirm this list with billing staff. It was transcribed from
 * the logos on the old site; "DC Medicare" in particular was unclear.
 */
export interface InsurancePlan {
  name: string;
  note?: string;
}

export const insurancePlans: InsurancePlan[] = [
  { name: 'Maryland Medicaid' },
  { name: 'Medicare' },
  { name: 'CareFirst BlueCross BlueShield' },
  { name: 'Aetna' },
  { name: 'Cigna', note: 'including Cigna Medicare / HealthSpring' },
  { name: 'UnitedHealthcare', note: 'including UnitedHealthcare Medicare' },
  { name: 'TRICARE East' },
];
