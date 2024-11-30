import { Store } from '@/types/store';
import { Employee } from '@/types/employee';
import { WorkingShift } from '@/types';

export const initialStores: Store[] = [
  {
    id: '1',
    name: 'Goßen',
    address: 'Goßen Straße 1',
    phone: '+49 123 456789',
    email: 'gossen@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Erkner',
    address: 'Erkner Straße 1',
    phone: '+49 123 456780',
    email: 'erkner@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialEmployees: Employee[] = [
  {
    id: '1',
    firstName: 'Max',
    lastName: 'Mustermann',
    email: 'max.mustermann@example.com',
    mobilePhone: '+49 123 4567890',
    role: 'Manager',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    firstName: 'Anna',
    lastName: 'Schmidt',
    email: 'anna.schmidt@example.com',
    mobilePhone: '+49 123 4567891',
    role: 'Mitarbeiter',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    firstName: 'Peter',
    lastName: 'Meyer',
    email: 'peter.meyer@example.com',
    mobilePhone: '+49 123 4567892',
    role: 'Mitarbeiter',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialShifts: WorkingShift[] = [
  {
    id: '1',
    title: 'Frühschicht',
    workHours: 8,
    employeeId: '',
    date: new Date().toISOString(),
    startTime: '06:00',
    endTime: '14:00',
    shiftId: '1',
    storeId: '',
    color: '#4CAF50',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Spätschicht',
    workHours: 8,
    employeeId: '',
    date: new Date().toISOString(),
    startTime: '14:00',
    endTime: '22:00',
    shiftId: '2',
    storeId: '',
    color: '#2196F3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Nachtschicht',
    workHours: 8,
    employeeId: '',
    date: new Date().toISOString(),
    startTime: '22:00',
    endTime: '06:00',
    shiftId: '3',
    storeId: '',
    color: '#9C27B0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
