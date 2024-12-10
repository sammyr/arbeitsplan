export const initialStores = [
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
export const initialEmployees = [
    {
        id: '1',
        firstName: 'Max',
        lastName: 'Mustermann',
        email: 'max@example.com',
        mobilePhone: '123456789',
        role: 'admin',
        storeId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];
export const initialShifts = [
    {
        id: '1',
        title: 'Frühschicht',
        workHours: 8,
        employeeId: '1',
        date: new Date().toISOString(),
        startTime: '06:00',
        endTime: '14:00',
        shiftId: '1',
        storeId: '1',
        color: '#ff0000',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];
export const initialShifts2 = [
    {
        id: '1',
        title: 'Frühschicht',
        workHours: 8,
        employeeId: '1',
        date: new Date().toISOString(),
        startTime: '06:00',
        endTime: '14:00',
        shiftId: '1',
        storeId: '1',
        color: '#ff0000',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];
// Schichten für /schichten2
// Standard ausgewählte Filiale für /arbeitsplan3
export const initialSelectedStore = initialStores[0]; // Erkner wird als Standard ausgewählt
