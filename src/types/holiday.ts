import { GermanState } from './store';

export interface Holiday {
  id: string;
  name: string;
  date: string;  // Format: MM-DD (z.B. "12-25" für 25. Dezember)
  states: GermanState[];  // Bundesländer, in denen dieser Feiertag gilt
}

// Funktion zum Überprüfen, ob ein Datum ein Feiertag in einem bestimmten Bundesland ist
export const isHoliday = (date: Date, state: GermanState, holidays: Holiday[]): Holiday | null => {
  try {
    const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return holidays.find(holiday => 
      holiday.date === monthDay && 
      holiday.states.includes(state)
    ) || null;
  } catch (error) {
    console.error('Fehler in isHoliday:', error, {
      date,
      state,
      holidaysCount: holidays?.length
    });
    return null;
  }
};
