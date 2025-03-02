'use client';

import { useEffect, useState } from 'react';
import { dbService } from '@/lib/db';
import { Employee } from '@/types/employee';
import { ShiftAssignment } from '@/types/shift-assignment';
import { Store } from '@/types/store';
import { WorkingShift } from '@/types/working-shift';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { storage } from '@/lib/storage';
import * as XLSX from 'xlsx';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuswertungenPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [shifts, setShifts] = useState<WorkingShift[]>([]);
  const [stores, setStores] = useState<Store[]>(() => {
    const savedStores = storage.getStores();
    return savedStores;
  });
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (typeof window !== 'undefined') {
      const savedDate = localStorage.getItem('arbeitsplan3_currentDate');
      if (savedDate) {
        return new Date(savedDate);
      }
    }
    const today = new Date('2025-01-17');
    today.setHours(0, 0, 0, 0);
    localStorage.setItem('arbeitsplan3_currentDate', today.toISOString());
    return today;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Loading data for date:', selectedDate);
    loadData();
  }, [selectedDate]);

  // Speichere das ausgewählte Datum im localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('arbeitsplan3_currentDate', selectedDate.toISOString());
    }
  }, [selectedDate]);

  const loadData = async () => {
    if (!user) {
      console.log('No user found, skipping data load');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Loading data...', {
        selectedDate: selectedDate.toISOString(),
        userId: user.uid
      });
      
      // Load employees, stores, and shifts for the organization
      const [loadedEmployees, loadedStores, loadedShifts] = await Promise.all([
        dbService.getEmployeesByOrganization(user.uid),
        dbService.getStores(user.uid),
        dbService.getWorkingShiftsByOrganization(user.uid)
      ]);

      console.log('Loaded initial data:', {
        employees: loadedEmployees.length,
        stores: loadedStores.length,
        shifts: loadedShifts.length
      });

      setStores(loadedStores);
      setEmployees(loadedEmployees);
      setShifts(loadedShifts);

      // Load assignments for all stores
      const allAssignments: ShiftAssignment[] = [];
      const processedAssignmentIds = new Set<string>(); // Verhindern von Duplikaten
      
      for (const store of loadedStores) {
        const storeAssignments = await dbService.getAssignments(store.id);
        console.log('Got assignments for store:', {
          store: store.name,
          count: storeAssignments.length
        });
        
        // Filter assignments for the current month and prevent duplicates
        const filteredAssignments = storeAssignments.filter(assignment => {
          const assignmentDate = new Date(assignment.date);
          const isCurrentMonth = assignmentDate.getMonth() === selectedDate.getMonth() &&
                                assignmentDate.getFullYear() === selectedDate.getFullYear();
          
          // Nur hinzufügen, wenn es noch nicht verarbeitet wurde
          if (isCurrentMonth && !processedAssignmentIds.has(assignment.id)) {
            processedAssignmentIds.add(assignment.id);
            return true;
          }
          return false;
        });
        
        allAssignments.push(...filteredAssignments);
      }

      console.log('Final data loaded:', {
        totalAssignments: allAssignments.length,
        monthYear: format(selectedDate, 'MMMM yyyy', { locale: de })
      });

      setAssignments(allAssignments);

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateHours = (employeeId: string, storeId: string) => {
    // Debug für Silvia
    const debug = employeeId === "1";
    
    // Gruppiere nach Datum
    const assignmentsByDate = new Map<string, any>();
    
    assignments
      .filter(assignment => {
        const shift = shifts.find(s => s.id === assignment.shiftId);
        const assignmentDate = new Date(assignment.date);
        
        // Konvertiere beide IDs zu Strings für den Vergleich
        const employeeIdMatch = String(assignment.employeeId) === String(employeeId);
        const storeIdMatch = String(assignment.storeId) === String(storeId);
        
        const isValid = (
          employeeIdMatch &&
          storeIdMatch &&
          assignmentDate.getMonth() === selectedDate.getMonth() &&
          assignmentDate.getFullYear() === selectedDate.getFullYear() &&
          !shift?.excludeFromCalculations
        );
        
        return isValid;
      })
      .forEach(assignment => {
        const dateKey = new Date(assignment.date).toISOString().split('T')[0];
        if (!assignmentsByDate.has(dateKey)) {
          assignmentsByDate.set(dateKey, assignment);
        }
      });

    const total = Array.from(assignmentsByDate.values())
      .reduce((total, assignment) => total + (assignment.workHours || 0), 0);

    // Zeige Debug-Ausgabe nur beim ersten Store (Gosen)
    if (debug && storeId === stores[0].id) {
      console.log(`\nStunden für Silvia im ${format(selectedDate, 'MMMM yyyy', { locale: de })}:`);
      const sortedAssignments = Array.from(assignmentsByDate.values())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      sortedAssignments.forEach(assignment => {
        const assignmentDate = new Date(assignment.date);
        console.log(`Silvia arbeitet am ${format(assignmentDate, 'dd.MM.yyyy')}: ${assignment.workHours} Stunden`);
      });
      console.log(`Gesamtstunden: ${total}`);
    }
    
    return total;
  };

  const calculateTotalHours = (employeeId: string, targetStoreId?: string) => {
    // Debug nur für Silvia und nur einmal pro Aufruf
    const debug = employeeId === "1";
    const debuggedDates = new Set<string>();
    
    if (debug) {
      console.log(`\nBerechne Stunden für Silvia im ${format(selectedDate, 'MMMM yyyy', { locale: de })}:`);
    }
    
    // Gruppiere nach Datum und Store
    const assignmentsByDateAndStore = new Map<string, any>();
    
    // Filtere und gruppiere Assignments
    assignments
      .filter(assignment => {
        const shift = shifts.find(s => s.id === assignment.shiftId);
        const assignmentDate = new Date(assignment.date);
        const store = stores.find(s => s.id === assignment.storeId);
        const dateKey = `${assignment.storeId}_${new Date(assignment.date).toISOString().split('T')[0]}`;
        
        if (!store || !shift) return false;
        
        const employeeIdMatch = String(assignment.employeeId) === String(employeeId);
        const storeMatch = targetStoreId ? assignment.storeId === targetStoreId : true;
        const monthMatch = assignmentDate.getMonth() === selectedDate.getMonth();
        const yearMatch = assignmentDate.getFullYear() === selectedDate.getFullYear();
        
        // Prüfe, ob die Schicht inaktiv ist
        const isExcluded = shift.excludeFromCalculations === true;
        
        // Prüfe, ob es eine spezielle Schicht ist
        const isSpecialShift = shift.title.includes('SP') || 
                             shift.title.includes('SZ') || 
                             shift.title.includes('FZ');
                             
        const isValid = employeeIdMatch && storeMatch && monthMatch && yearMatch && !isExcluded;
        
        // Debug nur einmal pro Datum und Store
        if (debug && employeeIdMatch && monthMatch && yearMatch && !debuggedDates.has(dateKey)) {
          debuggedDates.add(dateKey);
          console.log(`Prüfe Assignment:`, {
            date: format(assignmentDate, 'dd.MM.yyyy'),
            hours: assignment.workHours,
            storeId: assignment.storeId,
            storeName: store.name,
            shiftTitle: shift.title,
            isSpecialShift,
            isExcluded,
            storeMatch,
            isValid
          });
        }
        
        return isValid;
      })
      .forEach(assignment => {
        const dateKey = `${assignment.storeId}_${new Date(assignment.date).toISOString().split('T')[0]}`;
        const shift = shifts.find(s => s.id === assignment.shiftId);
        const store = stores.find(s => s.id === assignment.storeId);
        
        // Wenn es bereits einen Eintrag für dieses Datum und diese Filiale gibt
        if (assignmentsByDateAndStore.has(dateKey)) {
          const existingAssignment = assignmentsByDateAndStore.get(dateKey);
          const existingShift = shifts.find(s => s.id === existingAssignment.shiftId);
          
          // Wenn die bestehende Schicht keine spezielle Schicht ist, überschreibe sie
          const existingIsSpecial = existingShift?.title.includes('SP') || 
                                  existingShift?.title.includes('SZ') || 
                                  existingShift?.title.includes('FZ');
                                  
          const newIsSpecial = shift?.title.includes('SP') || 
                             shift?.title.includes('SZ') || 
                             shift?.title.includes('FZ');
                             
          // Behalte die spezielle Schicht oder die mit mehr Stunden
          if (!existingIsSpecial || (newIsSpecial && assignment.workHours > existingAssignment.workHours)) {
            assignmentsByDateAndStore.set(dateKey, assignment);
            if (debug) {
              console.log(`+ ${store?.name}: ${format(new Date(assignment.date), 'dd.MM.yyyy')}: ${assignment.workHours}h (${shift?.title}, aktiv)`);
            }
          }
        } else {
          // Wenn es noch keinen Eintrag gibt, füge den neuen hinzu
          assignmentsByDateAndStore.set(dateKey, assignment);
          if (debug) {
            console.log(`+ ${store?.name}: ${format(new Date(assignment.date), 'dd.MM.yyyy')}: ${assignment.workHours}h (${shift?.title}, aktiv)`);
          }
        }
      });

    // Berechne Stunden pro Store
    const storeHours = new Map<string, number>();
    
    Array.from(assignmentsByDateAndStore.values()).forEach(assignment => {
      const storeId = assignment.storeId;
      const currentHours = storeHours.get(storeId) || 0;
      storeHours.set(storeId, currentHours + (assignment.workHours || 0));
    });
    
    // Berechne Gesamtstunden
    const total = Array.from(storeHours.values())
      .reduce((sum, hours) => sum + hours, 0);
    
    if (debug) {
      console.log(`\nStunden pro Filiale:`);
      stores.forEach(store => {
        const hours = storeHours.get(store.id) || 0;
        if (hours > 0) {
          console.log(`${store.name}: ${hours}h`);
        }
      });
      console.log(`\nGesamtstunden: ${total}h`);
    }
    
    // Wenn eine spezifische Filiale angefragt wurde, gib nur deren Stunden zurück
    if (targetStoreId) {
      return storeHours.get(targetStoreId) || 0;
    }
    
    // Ansonsten gib die Gesamtstunden zurück
    return total;
  };

  const handlePrevMonth = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      if (typeof window !== 'undefined') {
        localStorage.setItem('arbeitsplan3_currentDate', newDate.toISOString());
      }
      return newDate;
    });
  };

  const handleNextMonth = () => {
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
          const hours = calculateTotalHours(employee.id, store.id);
          if (hours <= 0) return null;
          return {
            'Mitarbeiter': `${employee.firstName} ${employee.lastName}`,
            'Stunden': hours.toFixed(1)
          };
        }).filter(Boolean);

        if (storeEmployees.length === 0) return;

        const storeTotal = storeEmployees.reduce((total, emp: any) => total + parseFloat(emp['Stunden']), 0);
        
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

      // Create overview worksheet with all stores
      const overviewData = employees.map(employee => {
        const totalHours = calculateTotalHours(employee.id);
        if (totalHours <= 0) return null;

        const employeeData: any = {
          'Mitarbeiter': `${employee.firstName} ${employee.lastName}`
        };

        // Add hours for each store
        stores.forEach(store => {
          const storeHours = calculateTotalHours(employee.id, store.id);
          employeeData[store.name] = storeHours > 0 ? storeHours.toFixed(1) : '';
        });

        // Add total hours
        employeeData['Gesamt'] = totalHours.toFixed(1);
        
        return employeeData;
      }).filter(Boolean);

      if (overviewData.length > 0) {
        // Add empty row and total row
        const totalRow: any = { 'Mitarbeiter': 'Gesamt' };
        
        // Calculate totals for each store
        stores.forEach(store => {
          const storeTotal = employees.reduce((sum, employee) => 
            sum + calculateTotalHours(employee.id, store.id), 0);
          totalRow[store.name] = storeTotal > 0 ? storeTotal.toFixed(1) : '';
        });

        // Calculate grand total
        const grandTotal = employees.reduce((sum, employee) => 
          sum + calculateTotalHours(employee.id), 0);
        totalRow['Gesamt'] = grandTotal.toFixed(1);

        overviewData.push(
          { 'Mitarbeiter': '' }, // Empty row
          totalRow
        );

        // Create and add overview worksheet
        const overviewWS = XLSX.utils.json_to_sheet(overviewData);
        XLSX.utils.book_append_sheet(wb, overviewWS, 'Gesamtübersicht');
      }

      // Generate Excel file
      const monthYear = format(selectedDate, 'MMMM_yyyy', { locale: de });
      XLSX.writeFile(wb, `Arbeitsstunden_${monthYear}.xlsx`);

      toast.success('Excel-Export erfolgreich erstellt');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Fehler beim Excel-Export');
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-transparent">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-semibold text-slate-800">
                    Auswertungen für {format(selectedDate, 'MMMM yyyy', { locale: de })}
                  </h1>
                  <button
                    onClick={handleExcelExport}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 1.5a.75.75 0 01.75.75V7.5h-1.5V2.25A.75.75 0 0112 1.5zM11.25 7.5v5.69l-1.72-1.72a.75.75 0 00-1.06 1.06l3 3a.75.75 0 001.06 0l3-3a.75.75 0 10-1.06-1.06l-1.72 1.72V7.5h3.75a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9a3 3 0 013-3h3.75z" />
                    </svg>
                    Excel Export
                  </button>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setSelectedDate(newDate);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  
                  <span className="text-lg font-medium">
                    {format(selectedDate, 'MMMM yyyy', { locale: de })}
                  </span>
                  
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setSelectedDate(newDate);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                {/* Ladeanimation entfernt, Container beibehalten */}
              </div>
            ) : assignments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-slate-600">
                  Keine Schichtzuweisungen für {format(selectedDate, 'MMMM yyyy', { locale: de })} gefunden.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {stores.map((store) => (
                  <div key={store.id} className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">{store.name}</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th className="text-left p-2">MITARBEITER</th>
                            <th className="text-right p-2">STUNDEN</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employees.map((employee) => {
                            // Berechne die Stunden nur für diese Filiale
                            const hours = calculateTotalHours(employee.id, store.id);
                            if (hours === 0) return null;
                            
                            return (
                              <tr key={employee.id} className="border-t">
                                <td className="p-2">{employee.firstName} {employee.lastName}</td>
                                <td className="text-right p-2">{hours.toFixed(1)} Stunden</td>
                              </tr>
                            );
                          })}
                          <tr className="border-t font-bold">
                            <td className="p-2">Gesamt</td>
                            <td className="text-right p-2">
                              {employees
                                .reduce((sum, employee) => sum + calculateTotalHours(employee.id, store.id), 0)
                                .toFixed(1)} Stunden
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
                
                <div className="mt-12">
                  <h2 className="text-2xl font-bold mb-4">Gesamtübersicht</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="text-left p-2">MITARBEITER</th>
                          {stores.map((store) => (
                            <th key={store.id} className="text-right p-2">{store.name.toUpperCase()}</th>
                          ))}
                          <th className="text-right p-2">GESAMT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map((employee) => {
                          const totalHours = calculateTotalHours(employee.id);
                          if (totalHours === 0) return null;

                          return (
                            <tr key={employee.id} className="border-t">
                              <td className="p-2">{employee.firstName} {employee.lastName}</td>
                              {stores.map((store) => (
                                <td key={store.id} className="text-right p-2">
                                  {calculateTotalHours(employee.id, store.id) || '-'}
                                </td>
                              ))}
                              <td className="text-right p-2">{totalHours.toFixed(1)} Stunden</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
