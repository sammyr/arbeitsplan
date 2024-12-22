/**
 * WICHTIG: Datenbank-Sicherheitshinweis
 * 
 * Diese Interface-Definition entspricht der Datenbankstruktur.
 * Um Datenverlust zu vermeiden, beachten Sie folgende Regeln:
 * 
 * 1. KEINE ÄNDERUNGEN an bestehenden Feldnamen (würde zu Datenverlust führen)
 * 2. KEINE LÖSCHUNG von Feldern (würde historische Daten unzugänglich machen)
 * 3. Neue Felder MÜSSEN optional sein (mit ?)
 * 4. Bei Strukturänderungen MUSS eine Datenmigration durchgeführt werden
 * 
 * Beispiel für sichere Erweiterung:
 * - Richtig: newField?: string
 * - Falsch: oldField wird zu newField
 */

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
