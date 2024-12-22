import { Holiday } from '@/types/holiday';
import { germanStates } from '@/types/store';

export const holidays: Holiday[] = [
  {
    id: 'neujahr',
    name: 'Neujahr',
    date: '01-01',
    states: [...germanStates]
  },
  {
    id: 'heilige-drei-koenige',
    name: 'Heilige Drei Könige',
    date: '01-06',
    states: ['Baden-Württemberg', 'Bayern', 'Sachsen-Anhalt']
  },
  {
    id: 'karfreitag',
    name: 'Karfreitag',
    date: '03-29', // 2024
    states: [...germanStates]
  },
  {
    id: 'ostermontag',
    name: 'Ostermontag',
    date: '04-01', // 2024
    states: [...germanStates]
  },
  {
    id: 'tag-der-arbeit',
    name: 'Tag der Arbeit',
    date: '05-01',
    states: [...germanStates]
  },
  {
    id: 'christi-himmelfahrt',
    name: 'Christi Himmelfahrt',
    date: '05-09', // 2024
    states: [...germanStates]
  },
  {
    id: 'pfingstmontag',
    name: 'Pfingstmontag',
    date: '05-20', // 2024
    states: [...germanStates]
  },
  {
    id: 'fronleichnam',
    name: 'Fronleichnam',
    date: '05-30', // 2024
    states: ['Baden-Württemberg', 'Bayern', 'Hessen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland']
  },
  {
    id: 'mariahimmelfahrt',
    name: 'Mariä Himmelfahrt',
    date: '08-15',
    states: ['Bayern', 'Saarland']
  },
  {
    id: 'tag-der-deutschen-einheit',
    name: 'Tag der Deutschen Einheit',
    date: '10-03',
    states: [...germanStates]
  },
  {
    id: 'reformationstag',
    name: 'Reformationstag',
    date: '10-31',
    states: ['Brandenburg', 'Bremen', 'Hamburg', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Sachsen', 'Sachsen-Anhalt', 'Thüringen']
  },
  {
    id: 'allerheiligen',
    name: 'Allerheiligen',
    date: '11-01',
    states: ['Baden-Württemberg', 'Bayern', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland']
  },
  {
    id: 'heiligabend',
    name: 'Heiligabend',
    date: '12-24',
    states: [...germanStates]
  },
  {
    id: 'weihnachten-1',
    name: '1. Weihnachtsfeiertag',
    date: '12-25',
    states: [...germanStates]
  },
  {
    id: 'weihnachten-2',
    name: '2. Weihnachtsfeiertag',
    date: '12-26',
    states: [...germanStates]
  },
  {
    id: 'silvester',
    name: 'Silvester',
    date: '12-31',
    states: [...germanStates]
  }
];
