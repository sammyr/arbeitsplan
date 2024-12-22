export interface Store {
  id: string;
  name: string;
  organizationId: string;
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  state: GermanState;
  createdAt: string;
  updatedAt: string;
}

// Liste aller deutschen Bundesländer
export const germanStates = [
  'Baden-Württemberg',
  'Bayern',
  'Berlin',
  'Brandenburg',
  'Bremen',
  'Hamburg',
  'Hessen',
  'Mecklenburg-Vorpommern',
  'Niedersachsen',
  'Nordrhein-Westfalen',
  'Rheinland-Pfalz',
  'Saarland',
  'Sachsen',
  'Sachsen-Anhalt',
  'Schleswig-Holstein',
  'Thüringen'
] as const;

// Typ für deutsche Bundesländer
export type GermanState = typeof germanStates[number];
