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

export interface ShiftDefinition {
    id: string;
    title: string;
    color?: string;
    excludeFromCalculations?: boolean;
    startTime?: string;
    endTime?: string;
}
