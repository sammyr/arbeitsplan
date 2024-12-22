'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
interface Settings {
  emailTemplates: any[];
  // Add other settings as needed
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  emailTemplates: [],
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
