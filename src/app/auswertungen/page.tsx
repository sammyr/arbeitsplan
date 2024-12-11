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
        const parsedDate = new Date(savedDate);
        parsedDate.setHours(0, 0, 0, 0);
        return parsedDate;
      }
    }
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Loading data for date:', selectedDate);
    loadData();
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
      for (const store of loadedStores) {
        const storeAssignments = await dbService.getAssignments(store.id);
        console.log('Got assignments for store:', {
          store: store.name,
          count: storeAssignments.length
        });
        
        // Filter assignments for the current month
        const filteredAssignments = storeAssignments.filter(assignment => {
          const assignmentDate = new Date(assignment.date);
          return assignmentDate.getMonth() === selectedDate.getMonth() &&
                 assignmentDate.getFullYear() === selectedDate.getFullYear();
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
    return assignments
      .filter(assignment => {
        const shift = shifts.find(s => s.id === assignment.shiftId);
        return (
          assignment.employeeId === employeeId &&
          assignment.storeId === storeId &&
          new Date(assignment.date).getMonth() === selectedDate.getMonth() &&
          new Date(assignment.date).getFullYear() === selectedDate.getFullYear() &&
          !shift?.excludeFromCalculations // Exclude shifts marked with excludeFromCalculations
        );
      })
      .reduce((total, assignment) => total + (assignment.workHours || 0), 0);
  };

  const calculateTotalHours = (employeeId: string) => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    
    const filteredAssignments = assignments.filter(
      (assignment) => {
        const assignmentDate = new Date(assignment.date);
        const shift = shifts.find(s => s.id === assignment.shiftId);
        return (
          assignment.employeeId === employeeId &&
          assignmentDate >= start &&
          assignmentDate <= end &&
          !shift?.excludeFromCalculations // Exclude shifts marked with excludeFromCalculations
        );
      }
    );

    return filteredAssignments.reduce((total, assignment) => {
      return total + (assignment.workHours || 0);
    }, 0);
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
          const hours = calculateHours(employee.id, store.id);
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

      // Create total hours worksheet
      const totalHoursData = employees.map(employee => {
        const totalHours = calculateTotalHours(employee.id);
        if (totalHours <= 0) return null;
        return {
          'Mitarbeiter': `${employee.firstName} ${employee.lastName}`,
          'Gesamtstunden': totalHours.toFixed(1)
        };
      }).filter(Boolean);

      // Add total row to total hours data
      const grandTotal = totalHoursData
        .filter((emp): emp is { Mitarbeiter: string; Gesamtstunden: string } => 
          emp !== null && emp['Gesamtstunden'] !== undefined && emp['Mitarbeiter'] !== undefined
        )
        .reduce((total, emp) => total + parseFloat(emp['Gesamtstunden']), 0);
      totalHoursData.push(
        { 'Mitarbeiter': '', 'Gesamtstunden': '' }, // Empty row
        { 'Mitarbeiter': 'Gesamt', 'Gesamtstunden': grandTotal.toFixed(1) }
      );

      // Create and add total hours worksheet
      const totalHoursWS = XLSX.utils.json_to_sheet(totalHoursData);
      XLSX.utils.book_append_sheet(wb, totalHoursWS, 'Gesamtstunden');

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
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                </div>
              </div>
            ) : assignments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-slate-600">
                  Keine Schichtzuweisungen für {format(selectedDate, 'MMMM yyyy', { locale: de })} gefunden.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Individual Store Sections */}
                {stores.map((store) => {
                  // Calculate total hours for this store
                  const storeHours = employees.reduce((total, employee) => {
                    return total + calculateHours(employee.id, store.id);
                  }, 0);

                  // Skip stores with no hours
                  if (storeHours <= 0) return null;

                  return (
                    <div key={store.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-800">
                          {store.name}
                        </h2>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Mitarbeiter
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Stunden
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200">
                            {employees.map((employee) => {
                              const hours = calculateHours(employee.id, store.id);
                              if (hours <= 0) return null;

                              return (
                                <tr key={employee.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                    {employee.firstName} {employee.lastName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-900">
                                    {hours.toFixed(1)} Stunden
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className="bg-slate-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                Gesamt
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-slate-900">
                                {storeHours.toFixed(1)} Stunden
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}

                {/* Total Overview Section */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800">
                      Gesamtübersicht
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Mitarbeiter
                          </th>
                          {stores.map((store) => (
                            <th key={store.id} scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                              {store.name}
                            </th>
                          ))}
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Gesamt
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {employees.map((employee) => {
                          const totalHours = calculateTotalHours(employee.id);
                          if (totalHours === 0) return null;

                          return (
                            <tr key={employee.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                {employee.firstName} {employee.lastName}
                              </td>
                              {stores.map((store) => {
                                const hours = calculateHours(employee.id, store.id);
                                return (
                                  <td key={store.id} className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-900">
                                    {hours > 0 ? `${hours.toFixed(1)}` : '-'}
                                  </td>
                                );
                              })}
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-slate-900">
                                {totalHours.toFixed(1)} Stunden
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            Gesamt
                          </td>
                          {stores.map((store) => {
                            const total = employees.reduce(
                              (sum, employee) => sum + calculateHours(employee.id, store.id),
                              0
                            );
                            return (
                              <td key={store.id} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-slate-900">
                                {total > 0 ? `${total.toFixed(1)}` : '-'}
                              </td>
                            );
                          })}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-slate-900">
                            {employees
                              .reduce((sum, employee) => sum + calculateTotalHours(employee.id), 0)
                              .toFixed(1)} Stunden
                          </td>
                        </tr>
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
