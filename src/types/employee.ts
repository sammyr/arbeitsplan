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

export interface EmployeeOrder {
  id: string;
  userId: string;
  employeeIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone?: string;
  birthday?: string;
  createdAt: string;
  updatedAt: string;
  targetHours?: number;
  color?: string;
  order?: number;
}
