"use strict";
'use client';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AuswertungenPage;
const react_1 = require("react");
const db_1 = require("@/lib/db");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const outline_1 = require("@heroicons/react/24/outline");
const react_hot_toast_1 = require("react-hot-toast");
const initialData_1 = require("@/lib/initialData");
const storage_1 = require("@/lib/storage");
const XLSX = __importStar(require("xlsx"));
function AuswertungenPage() {
    const [employees, setEmployees] = (0, react_1.useState)([]);
    const [assignments, setAssignments] = (0, react_1.useState)([]);
    const [stores, setStores] = (0, react_1.useState)(() => {
        const savedStores = storage_1.storage.getStores();
        return savedStores.length > 0 ? savedStores : initialData_1.initialStores;
    });
    const [selectedDate, setSelectedDate] = (0, react_1.useState)(() => {
        if (typeof window !== 'undefined') {
            const savedDate = localStorage.getItem('arbeitsplan3_currentDate');
            if (savedDate) {
                const parsedDate = new Date(savedDate);
                parsedDate.setHours(0, 0, 0, 0);
                return parsedDate;
            }
        }
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    });
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        console.log('Loading data for date:', selectedDate);
        loadData();
    }, [selectedDate]);
    const loadData = async () => {
        setIsLoading(true);
        try {
            console.log('Loading data...', {
                selectedDate: selectedDate.toISOString(),
                stores: stores.map(s => ({ id: s.id, name: s.name }))
            });
            // Load all assignments for all stores
            const allAssignments = [];
            for (const store of stores) {
                console.log('Loading assignments for store:', store.name);
                const storeAssignments = await db_1.dbService.getAssignments(store.id);
                console.log('Got assignments for store:', {
                    store: store.name,
                    count: storeAssignments.length,
                    assignments: storeAssignments.map(a => ({
                        id: a.id,
                        date: a.date,
                        employeeId: a.employeeId,
                        workHours: a.workHours,
                        shiftId: a.shiftId,
                        storeId: a.storeId
                    }))
                });
                allAssignments.push(...storeAssignments);
            }
            const loadedEmployees = await db_1.dbService.getEmployees();
            console.log('Loaded data:', {
                employees: loadedEmployees.length,
                employeesList: loadedEmployees.map(e => `${e.firstName} ${e.lastName}`),
                assignments: allAssignments.length,
                assignmentDates: allAssignments.map(a => ({
                    date: a.date,
                    workHours: a.workHours,
                    storeId: a.storeId
                })),
                stores: stores.length
            });
            setEmployees(loadedEmployees);
            setAssignments(allAssignments);
            setIsLoading(false);
        }
        catch (error) {
            console.error('Error loading data:', error);
            react_hot_toast_1.toast.error('Fehler beim Laden der Daten');
            setIsLoading(false);
        }
    };
    const calculateHours = (employeeId, storeId) => {
        const start = (0, date_fns_1.startOfMonth)(selectedDate);
        const end = (0, date_fns_1.endOfMonth)(selectedDate);
        console.log('Calculating hours:', {
            employeeId,
            storeId,
            start: start.toISOString(),
            end: end.toISOString(),
            totalAssignments: assignments.length
        });
        const filteredAssignments = assignments.filter((assignment) => {
            const assignmentDate = new Date(assignment.date);
            const matches = assignment.employeeId === employeeId &&
                assignment.storeId === storeId &&
                assignmentDate >= start &&
                assignmentDate <= end;
            if (matches) {
                console.log('Found matching assignment:', {
                    date: assignment.date,
                    workHours: assignment.workHours,
                    storeId: assignment.storeId
                });
            }
            return matches;
        });
        console.log('Filtered assignments:', {
            employeeId,
            storeId,
            count: filteredAssignments.length,
            assignments: filteredAssignments
        });
        const totalHours = filteredAssignments.reduce((total, assignment) => {
            const hours = assignment.workHours || 0;
            console.log('Adding hours:', {
                date: assignment.date,
                hours,
                storeId: assignment.storeId,
                runningTotal: total + hours
            });
            return total + hours;
        }, 0);
        console.log('Final hours:', {
            employeeId,
            storeId,
            month: (0, date_fns_1.format)(selectedDate, 'MM/yyyy'),
            assignments: filteredAssignments.length,
            totalHours
        });
        return totalHours;
    };
    const calculateTotalHours = (employeeId) => {
        const start = (0, date_fns_1.startOfMonth)(selectedDate);
        const end = (0, date_fns_1.endOfMonth)(selectedDate);
        const filteredAssignments = assignments.filter((assignment) => {
            const assignmentDate = new Date(assignment.date);
            return (assignment.employeeId === employeeId &&
                assignmentDate >= start &&
                assignmentDate <= end);
        });
        return filteredAssignments.reduce((total, assignment) => {
            return total + (assignment.workHours || 0);
        }, 0);
    };
    const previousMonth = () => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() - 1);
            if (typeof window !== 'undefined') {
                localStorage.setItem('arbeitsplan3_currentDate', newDate.toISOString());
            }
            return newDate;
        });
    };
    const nextMonth = () => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + 1);
            if (typeof window !== 'undefined') {
                localStorage.setItem('arbeitsplan3_currentDate', newDate.toISOString());
            }
            return newDate;
        });
    };
    const handleExcelExport = () => {
        try {
            // Create workbook
            const wb = XLSX.utils.book_new();
            // Create separate worksheet for each store
            stores.forEach(store => {
                const storeEmployees = employees.map(employee => {
                    const hours = calculateHours(employee.id, store.id);
                    if (hours <= 0)
                        return null;
                    return {
                        'Mitarbeiter': `${employee.firstName} ${employee.lastName}`,
                        'Stunden': hours.toFixed(1)
                    };
                }).filter(Boolean);
                if (storeEmployees.length === 0)
                    return;
                const storeTotal = storeEmployees.reduce((total, emp) => total + parseFloat(emp['Stunden']), 0);
                // Create data for this store's worksheet
                const storeData = [
                    ...storeEmployees,
                    { 'Mitarbeiter': '', 'Stunden': '' }, // Empty row
                    { 'Mitarbeiter': 'Gesamt', 'Stunden': storeTotal.toFixed(1) }
                ];
                // Create worksheet for this store
                const storeWS = XLSX.utils.json_to_sheet(storeData);
                // Add worksheet to workbook with store name as sheet name
                XLSX.utils.book_append_sheet(wb, storeWS, store.name);
            });
            // Create total hours worksheet
            const totalHoursData = employees.map(employee => {
                const totalHours = calculateTotalHours(employee.id);
                if (totalHours <= 0)
                    return null;
                return {
                    'Mitarbeiter': `${employee.firstName} ${employee.lastName}`,
                    'Gesamtstunden': totalHours.toFixed(1)
                };
            }).filter(Boolean);
            // Add total row to total hours data
            const grandTotal = totalHoursData
                .filter((emp) => emp !== null && emp['Gesamtstunden'] !== undefined && emp['Mitarbeiter'] !== undefined)
                .reduce((total, emp) => total + parseFloat(emp['Gesamtstunden']), 0);
            totalHoursData.push({ 'Mitarbeiter': '', 'Gesamtstunden': '' }, // Empty row
            { 'Mitarbeiter': 'Gesamt', 'Gesamtstunden': grandTotal.toFixed(1) });
            // Create and add total hours worksheet
            const totalHoursWS = XLSX.utils.json_to_sheet(totalHoursData);
            XLSX.utils.book_append_sheet(wb, totalHoursWS, 'Gesamtstunden');
            // Generate Excel file
            const monthYear = (0, date_fns_1.format)(selectedDate, 'MMMM_yyyy', { locale: locale_1.de });
            XLSX.writeFile(wb, `Arbeitsstunden_${monthYear}.xlsx`);
            react_hot_toast_1.toast.success('Excel-Export erfolgreich erstellt');
        }
        catch (error) {
            console.error('Error exporting to Excel:', error);
            react_hot_toast_1.toast.error('Fehler beim Excel-Export');
        }
    };
    return (<div className="p-6">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Auswertungen</h1>
        <p className="text-slate-600">
          Übersicht aller Arbeitsstunden und Mitarbeiter innerhalb eines Monats.<br></br>
          Hinweis: Die Daten können über Excel in dazu separat angelegten Tabellen exportiert werden. 
        </p>
      </div>
      
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200">
          <button onClick={previousMonth} className="p-2 hover:bg-gray-50 rounded-l-lg border-r" aria-label="Vorheriger Monat">
            <outline_1.ChevronLeftIcon className="h-5 w-5 text-gray-600"/>
          </button>
          
          <div className="px-4 py-2 text-gray-700 font-medium">
            {(0, date_fns_1.format)(selectedDate, 'MMMM yyyy', { locale: locale_1.de })}
          </div>
          
          <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-r-lg border-l" aria-label="Nächster Monat">
            <outline_1.ChevronRightIcon className="h-5 w-5 text-gray-600"/>
          </button>
        </div>

        <button onClick={handleExcelExport} className="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Excel exportieren
        </button>
      </div>

      {isLoading ? (<div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>) : employees.length === 0 ? (<div className="text-center py-12 text-gray-500">
          Keine Mitarbeiter gefunden
        </div>) : assignments.length === 0 ? (<div className="text-center py-12 text-gray-500">
          Keine Schichtzuweisungen gefunden
        </div>) : (<>
          <div className="mb-8 space-y-8">
            {stores.map((store) => {
                // Calculate total hours for this store
                const storeHours = employees.reduce((total, employee) => {
                    return total + calculateHours(employee.id, store.id);
                }, 0);
                // Only show stores that have hours
                if (storeHours <= 0)
                    return null;
                return (<div key={store.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">{store.name}</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-2 px-4 border-b text-left">Mitarbeiter</th>
                          <th className="py-2 px-4 border-b text-right">Stunden</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map((employee) => {
                        const hours = calculateHours(employee.id, store.id);
                        if (hours <= 0)
                            return null;
                        return (<tr key={employee.id} className="hover:bg-gray-50">
                              <td className="py-2 px-4 border-b">
                                {employee.firstName} {employee.lastName}
                              </td>
                              <td className="py-2 px-4 border-b text-right">
                                {hours.toFixed(1)}
                              </td>
                            </tr>);
                    })}
                        <tr className="bg-gray-50 font-semibold">
                          <td className="py-2 px-4 border-b">Gesamt</td>
                          <td className="py-2 px-4 border-b text-right">
                            {storeHours.toFixed(1)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>);
            })}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">
              Gesamtstunden pro Mitarbeiter
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 border-b text-left">Mitarbeiter</th>
                    <th className="py-2 px-4 border-b text-right">Gesamtstunden</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => {
                const totalHours = calculateTotalHours(employee.id);
                if (totalHours <= 0)
                    return null;
                return (<tr key={employee.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">
                          {employee.firstName} {employee.lastName}
                        </td>
                        <td className="py-2 px-4 border-b text-right">
                          {totalHours.toFixed(1)}
                        </td>
                      </tr>);
            })}
                </tbody>
              </table>
            </div>
          </div>
        </>)}
    </div>);
}
