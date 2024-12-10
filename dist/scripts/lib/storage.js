"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
const db_1 = require("@/lib/db");
class StorageService {
    constructor() {
        this.SHIFTS_KEY = 'arbeitsplan_shifts';
        this.STORES_KEY = 'arbeitsplan_stores';
        this.EMPLOYEES_KEY = 'arbeitsplan_employees';
        this.ASSIGNMENTS_KEY = 'arbeitsplan_assignments';
    }
    // Store Management
    getStores() {
        if (typeof window === 'undefined')
            return [];
        const storesJson = localStorage.getItem(this.STORES_KEY);
        if (!storesJson)
            return [];
        try {
            const stores = JSON.parse(storesJson);
            console.log('Retrieved stores from storage:', stores);
            return stores;
        }
        catch (error) {
            console.error('Error parsing stores from storage:', error);
            return [];
        }
    }
    saveStore(store) {
        if (typeof window === 'undefined')
            return;
        try {
            const stores = this.getStores();
            const index = stores.findIndex(s => s.id === store.id);
            if (index !== -1) {
                stores[index] = store;
            }
            else {
                stores.push(store);
            }
            console.log('Saving stores to storage:', stores);
            localStorage.setItem(this.STORES_KEY, JSON.stringify(stores));
        }
        catch (error) {
            console.error('Error saving store to storage:', error);
        }
    }
    deleteStore(storeId) {
        if (typeof window === 'undefined')
            return;
        try {
            const stores = this.getStores();
            const filteredStores = stores.filter(s => s.id !== storeId);
            localStorage.setItem(this.STORES_KEY, JSON.stringify(filteredStores));
        }
        catch (error) {
            console.error('Error deleting store from storage:', error);
        }
    }
    // Employee Management
    async getEmployees() {
        try {
            const employees = await db_1.dbService.getEmployees();
            console.log('Retrieved employees from DB:', employees);
            return employees;
        }
        catch (error) {
            console.error('Error getting employees:', error);
            return [];
        }
    }
    saveEmployee(employee) {
        if (typeof window === 'undefined')
            return;
        try {
            const employees = this.getEmployeesSync();
            const index = employees.findIndex(e => e.id === employee.id);
            if (index !== -1) {
                employees[index] = employee;
            }
            else {
                employees.push(employee);
            }
            console.log('Saving employees to storage:', employees);
            localStorage.setItem(this.EMPLOYEES_KEY, JSON.stringify(employees));
        }
        catch (error) {
            console.error('Error saving employee to storage:', error);
        }
    }
    deleteEmployee(employeeId) {
        if (typeof window === 'undefined')
            return;
        try {
            const employees = this.getEmployeesSync();
            const filteredEmployees = employees.filter(e => e.id !== employeeId);
            localStorage.setItem(this.EMPLOYEES_KEY, JSON.stringify(filteredEmployees));
        }
        catch (error) {
            console.error('Error deleting employee from storage:', error);
        }
    }
    getEmployeesSync() {
        if (typeof window === 'undefined')
            return [];
        const employeesJson = localStorage.getItem(this.EMPLOYEES_KEY);
        if (!employeesJson)
            return [];
        try {
            return JSON.parse(employeesJson);
        }
        catch (error) {
            console.error('Error parsing employees from storage:', error);
            return [];
        }
    }
    // Assignment Management
    async getAssignments() {
        try {
            const assignments = await db_1.dbService.getAssignments();
            console.log('Retrieved assignments from DB:', assignments);
            return assignments;
        }
        catch (error) {
            console.error('Error getting assignments:', error);
            return [];
        }
    }
    saveAssignments(assignments) {
        if (typeof window === 'undefined')
            return;
        try {
            console.log('Saving assignments to storage:', assignments);
            localStorage.setItem(this.ASSIGNMENTS_KEY, JSON.stringify(assignments));
        }
        catch (error) {
            console.error('Error saving assignments to storage:', error);
        }
    }
    // Shifts Management
    async getShifts() {
        try {
            const shifts = await db_1.dbService.getShifts();
            console.log('Retrieved shifts from DB:', shifts);
            return shifts;
        }
        catch (error) {
            console.error('Error getting shifts:', error);
            return [];
        }
    }
    saveShifts(shifts) {
        if (typeof window === 'undefined')
            return;
        try {
            localStorage.setItem(this.SHIFTS_KEY, JSON.stringify(shifts));
        }
        catch (error) {
            console.error('Error saving shifts to storage:', error);
        }
    }
    addShift(shift) {
        const shifts = this.getShiftsSync();
        shifts.push(shift);
        this.saveShifts(shifts);
    }
    updateShift(updatedShift) {
        const shifts = this.getShiftsSync();
        const index = shifts.findIndex(s => s.id === updatedShift.id);
        if (index !== -1) {
            shifts[index] = updatedShift;
            this.saveShifts(shifts);
        }
    }
    deleteShift(shiftId) {
        const shifts = this.getShiftsSync();
        const filteredShifts = shifts.filter(s => s.id !== shiftId);
        this.saveShifts(filteredShifts);
    }
    clearShifts() {
        if (typeof window === 'undefined')
            return;
        localStorage.removeItem(this.SHIFTS_KEY);
    }
    getShiftsSync() {
        if (typeof window === 'undefined')
            return [];
        const shiftsJson = localStorage.getItem(this.SHIFTS_KEY);
        if (!shiftsJson)
            return [];
        try {
            return JSON.parse(shiftsJson);
        }
        catch (error) {
            console.error('Error parsing shifts from storage:', error);
            return [];
        }
    }
}
exports.storage = new StorageService();
