import { Store } from '@/types/store';
import { Employee } from '@/types/employee';
import { WorkingShift } from '@/types';

export const initialStores: Store[] = [
  {
    id: '1',
    name: 'Erkner',
    address: 'Erkner Straße 1',
    phone: '',
    email: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Goßen',
    address: 'Goßen Straße 1',
    phone: '',
    email: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialEmployees: Employee[] = [
  {
    id: '1',
    firstName: 'Silvia',
    lastName: '',
    email: 'silvia@example.com',
    mobilePhone: '',
    role: 'Verkäufer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    firstName: 'Maxi',
    lastName: '',
    email: 'maxi@example.com',
    mobilePhone: '',
    role: 'Verkäufer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    firstName: 'Cindy',
    lastName: '',
    email: 'cindy@example.com',
    mobilePhone: '',
    role: 'Verkäufer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    firstName: 'Peter',
    lastName: '',
    email: 'peter@example.com',
    mobilePhone: '',
    role: 'Verkäufer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    firstName: 'Jenny',
    lastName: '',
    email: 'jenny@example.com',
    mobilePhone: '',
    role: 'Verkäufer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '6',
    firstName: 'Tobi',
    lastName: '',
    email: 'tobi@example.com',
    mobilePhone: '',
    role: 'Verkäufer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '7',
    firstName: 'Diana',
    lastName: '',
    email: 'diana@example.com',
    mobilePhone: '',
    role: 'Verkäufer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialShifts: WorkingShift[] = [
  {
    id: '1',
    title: 'Frühschicht',
    startTime: '06:00',
    endTime: '14:00',
    employeeId: '',
    date: new Date().toISOString(),
    shiftId: '',
    storeId: '',
    workHours: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Spätschicht',
    startTime: '14:00',
    endTime: '22:00',
    employeeId: '',
    date: new Date().toISOString(),
    shiftId: '',
    storeId: '',
    workHours: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Nachtschicht',
    startTime: '22:00',
    endTime: '06:00',
    employeeId: '',
    date: new Date().toISOString(),
    shiftId: '',
    storeId: '',
    workHours: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Schichten für /schichten2
export const initialShifts2: WorkingShift[] = [];

// Standard ausgewählte Filiale für /arbeitsplan3
export const initialSelectedStore = initialStores[0]; // Erkner wird als Standard ausgewählt
