'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO, getYear, getMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { dbService } from '@/lib/db';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import AuthGuard from '@/components/AuthGuard';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

interface Store {
  id: string;
  name: string;
}

interface WorkingShift {
  id: string;
  title: string;
}

interface Assignment {
  id: string;
  employeeId: string;
  date: string;
  shiftId: string;
  storeId: string;
}

interface HolidayEntry {
  employeeId: string;
  employeeName: string;
  storeId: string;
  storeName: string;
  date: string;
}

interface GroupedHolidays {
  [year: string]: {
    [month: string]: HolidayEntry[];
  };
}

type SortField = 'urlaubstage' | 'employeeName' | 'zeitraum' | 'storeName';
type SortDirection = 'asc' | 'desc';

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<GroupedHolidays>({});
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('storeName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const { user } = useAuth();

  useEffect(() => {
    const fetchHolidays = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        const [employees, shifts, stores] = await Promise.all([
          dbService.getEmployeesByOrganization(user.uid),
          dbService.getWorkingShiftsByOrganization(user.uid),
          dbService.getStores(user.uid)
        ]);

        console.log('Debug - Geladene Daten:', {
          employeesCount: employees?.length ?? 0,
          shiftsCount: shifts?.length ?? 0,
          storesCount: stores?.length ?? 0
        });

        if (!Array.isArray(employees) || !Array.isArray(shifts) || !Array.isArray(stores)) {
          throw new Error('Fehlerhafte Datenstruktur: Eine oder mehrere Datenquellen sind keine Arrays');
        }

        const holidayShifts = shifts.filter(shift => shift?.title === 'U');
        const holidayShiftIds = new Set(holidayShifts.map(shift => shift.id));
        const groupedHolidays: GroupedHolidays = {};
        const years = new Set<string>();

        // Lade Zuweisungen für alle Filialen
        await Promise.all(stores.map(async (store) => {
          try {
            if (!store?.id) return;

            const assignments = await dbService.getAssignments(store.id);
            if (!Array.isArray(assignments)) return;

            const holidayAssignments = assignments.filter(assignment => 
              assignment?.shiftId && holidayShiftIds.has(assignment.shiftId)
            );

            holidayAssignments.forEach(assignment => {
              if (!assignment?.date || !assignment?.employeeId) return;

              const employee = employees.find(emp => emp?.id === assignment.employeeId);
              if (!employee) return;

              const employeeName = [employee.firstName, employee.lastName]
                .filter(Boolean)
                .join(' ').trim();

              if (!employeeName) return;

              const date = parseISO(assignment.date);
              const year = getYear(date).toString();
              const month = getMonth(date).toString();
              years.add(year);

              if (!groupedHolidays[year]) {
                groupedHolidays[year] = {};
              }
              
              if (!groupedHolidays[year][month]) {
                groupedHolidays[year][month] = [];
              }

              groupedHolidays[year][month].push({
                employeeId: assignment.employeeId,
                employeeName,
                storeId: store.id,
                storeName: store.name,
                date: assignment.date
              });
            });
          } catch (storeError) {
            console.error(`Fehler beim Laden der Daten für Filiale:`, storeError);
          }
        }));

        setHolidays(groupedHolidays);
        const sortedYears = Array.from(years).sort((a, b) => b.localeCompare(a));
        setAvailableYears(sortedYears);
        setSelectedYear(sortedYears[0] ? parseInt(sortedYears[0]) : new Date().getFullYear());
        setLoading(false);
      } catch (err) {
        console.error('Fehler beim Laden der Urlaubstage:', err);
        setError('Ein Fehler ist beim Laden der Urlaubstage aufgetreten. Bitte versuchen Sie es später erneut.');
        setLoading(false);
      }
    };

    fetchHolidays();
  }, [user]);

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd. MMMM yyyy', { locale: de });
  };

  const getMonthName = (monthIndex: number) => {
    return format(new Date(2024, monthIndex), 'MMMM', { locale: de });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' 
      ? <ChevronUpIcon className="h-4 w-4" />
      : <ChevronDownIcon className="h-4 w-4" />;
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    doc.setFont('helvetica');
    
    // Titel
    doc.setFontSize(14);
    doc.text(`Urlaubsübersicht ${selectedYear}`, 14, 15);
    
    // Sammle alle Daten
    let allData: [string, string, string, string, string][] = [];
    Object.entries(holidays[selectedYear])
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .forEach(([month, entries]) => {
        const groupedEmployees = groupHolidaysByEmployee(entries);
        if (groupedEmployees.length > 0) {
          // Sortiere nach Tagen und füge Monatsnamen hinzu
          const monthData = groupedEmployees
            .sort((a, b) => b.totalDays - a.totalDays)
            .map(employee => [
              employee.ranges.map(range => formatDateRange(range.start, range.end)).join(' | '),
              getMonthName(parseInt(month)),
              employee.totalDays.toString(),
              employee.employeeName,
              Array.from(new Set(employee.ranges.map(range => range.storeName))).join(' | ')
            ] as [string, string, string, string, string]);
          allData = [...allData, ...monthData];
        }
      });

    if (allData.length > 0) {
      autoTable(doc, {
        startY: 20,
        head: [['Zeitraum', 'Monat', 'Tage', 'Mitarbeiter', 'Filiale']],
        body: allData,
        theme: 'grid',
        headStyles: { 
          fillColor: [76, 175, 80],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          cellPadding: 1.5,
          lineWidth: 0.1
        },
        styles: { 
          fontSize: 10,
          cellPadding: 1.5,
          lineWidth: 0.1,
          lineColor: [200, 200, 200]
        },
        columnStyles: {
          0: { cellWidth: 'auto' }, // Zeitraum
          1: { cellWidth: 22 },     // Monat
          2: { cellWidth: 12 },     // Tage
          3: { cellWidth: 35 },     // Mitarbeiter
          4: { cellWidth: 35 }      // Filiale
        },
        margin: { left: 10, right: 10, top: 10 },
        tableWidth: 'auto'
      });
    }
    
    doc.save(`Urlaubsuebersicht_${selectedYear}.pdf`);
  };

  const groupHolidaysByEmployee = (entries: HolidayEntry[]) => {
    const grouped = new Map<string, {
      employeeId: string;
      employeeName: string;
      dateStores: Map<string, Set<string>>; // Map von Datum zu Set von Filialen
    }>();

    entries.forEach(entry => {
      const key = entry.employeeId;
      if (!grouped.has(key)) {
        grouped.set(key, {
          employeeId: entry.employeeId,
          employeeName: entry.employeeName,
          dateStores: new Map()
        });
      }
      const group = grouped.get(key)!;
      const dateKey = entry.date;
      if (!group.dateStores.has(dateKey)) {
        group.dateStores.set(dateKey, new Set());
      }
      group.dateStores.get(dateKey)!.add(entry.storeName);
    });

    return Array.from(grouped.values()).map(({ employeeName, dateStores }) => {
      // Konvertiere die Daten in ein Array von Datum-Objekte
      const dates = Array.from(dateStores.keys()).map(date => parseISO(date));
      dates.sort((a, b) => a.getTime() - b.getTime());
      
      // Sammle alle einzigartigen Filialen
      const allStores = new Set<string>();
      dateStores.forEach(stores => {
        stores.forEach(store => allStores.add(store));
      });
      
      // Finde zusammenhängende Zeiträume
      const ranges: { start: Date; end: Date; stores: string[] }[] = [];
      let currentRange: { start: Date; end: Date; stores: Set<string> } | null = null;

      dates.forEach((date, index) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const currentStores = dateStores.get(dateStr)!;

        if (!currentRange) {
          currentRange = { 
            start: date, 
            end: date, 
            stores: currentStores
          };
        } else {
          const nextDay = new Date(currentRange.end);
          nextDay.setDate(nextDay.getDate() + 1);
          
          // Prüfe ob die Filialen identisch sind
          const sameStores = Array.from(currentStores).every(store => 
            currentRange!.stores.has(store)) && 
            currentRange!.stores.size === currentStores.size;
          
          if (date.getTime() === nextDay.getTime() && sameStores) {
            currentRange.end = date;
          } else {
            ranges.push({
              start: currentRange.start,
              end: currentRange.end,
              stores: Array.from(currentRange.stores).sort()
            });
            currentRange = { 
              start: date, 
              end: date, 
              stores: currentStores
            };
          }
        }
        
        // Füge den letzten Bereich hinzu
        if (index === dates.length - 1 && currentRange) {
          ranges.push({
            start: currentRange.start,
            end: currentRange.end,
            stores: Array.from(currentRange.stores).sort()
          });
        }
      });

      return {
        employeeName,
        ranges: ranges.map(range => ({
          start: range.start,
          end: range.end,
          storeName: range.stores.join(', ')
        })),
        totalDays: dates.length // Jeder Tag wird nur einmal gezählt
      };
    });
  };

  const formatDateRange = (start: Date, end: Date) => {
    if (start.getTime() === end.getTime()) {
      return format(start, 'd. MMMM', { locale: de });
    }
    if (start.getMonth() === end.getMonth()) {
      return `${format(start, 'd.')} - ${format(end, 'd. MMMM', { locale: de })}`;
    }
    return `${format(start, 'd. MMMM')} - ${format(end, 'd. MMMM', { locale: de })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-4">Laden...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-4 text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="p-4 md:p-6 max-w-[1920px] mx-auto">
              {/* Header */}
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
                <div className="flex flex-col gap-4">
                  <h1 className="text-2xl font-semibold text-slate-800">
                    Urlaubstage {selectedYear}
                  </h1>

                  <div className="flex items-center justify-between">
                    {/* Left side - Year Selection */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedYear(selectedYear - 1)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors border border-green-500"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="bg-white border border-green-500 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 min-w-[200px]"
                      >
                        {Array.from({ length: 3 }, (_, i) => selectedYear - 1 + i).map(year => (
                          <option 
                            key={year} 
                            value={year}
                            className={holidays[year] && Object.keys(holidays[year]).length > 0 ? 'font-semibold text-green-600' : ''}
                          >
                            {year}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => setSelectedYear(selectedYear + 1)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors border border-green-500"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Right side - Export Button */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleExportToPDF}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-green-500 text-green-500 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        PDF Export
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              {holidays[selectedYear] && (
                <div className="space-y-6">
                  {Object.entries(holidays[selectedYear])
                    .sort((a, b) => Number(a[0]) - Number(b[0]))
                    .map(([month, entries]) => {
                      const groupedEmployees = groupHolidaysByEmployee(entries);
                      
                      return (
                        <div key={month} className="bg-white rounded-lg shadow-sm">
                          <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">
                              {getMonthName(parseInt(month))}
                            </h2>
                            <table className="min-w-full">
                              <thead>
                                <tr>
                                  <th 
                                    scope="col"
                                    className="w-1/3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort('zeitraum')}
                                  >
                                    <div className="flex items-center gap-1">
                                      Zeitraum
                                      {getSortIcon('zeitraum')}
                                    </div>
                                  </th>
                                  <th 
                                    scope="col"
                                    className="w-1/6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort('urlaubstage')}
                                  >
                                    <div className="flex items-center gap-1">
                                      Urlaubstage
                                      {getSortIcon('urlaubstage')}
                                    </div>
                                  </th>
                                  <th 
                                    scope="col"
                                    className="w-1/4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort('employeeName')}
                                  >
                                    <div className="flex items-center gap-1">
                                      Mitarbeiter
                                      {getSortIcon('employeeName')}
                                    </div>
                                  </th>
                                  <th 
                                    scope="col"
                                    className="w-1/4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort('storeName')}
                                  >
                                    <div className="flex items-center gap-1">
                                      Filiale
                                      {getSortIcon('storeName')}
                                    </div>
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {Object.values(groupedEmployees)
                                  .sort((a, b) => {
                                    let comparison = 0;
                                    if (sortField === 'employeeName') {
                                      comparison = a.employeeName.localeCompare(b.employeeName);
                                    } else if (sortField === 'urlaubstage') {
                                      comparison = a.totalDays - b.totalDays;
                                    } else if (sortField === 'zeitraum') {
                                      comparison = a.ranges[0]?.start.getTime() - b.ranges[0]?.start.getTime() || 0;
                                    } else if (sortField === 'storeName') {
                                      // Vergleiche die Filialnamen des ersten Zeitraums
                                      const aStore = a.ranges[0]?.storeName || '';
                                      const bStore = b.ranges[0]?.storeName || '';
                                      comparison = aStore.localeCompare(bStore);
                                    }
                                    return sortDirection === 'asc' ? comparison : -comparison;
                                  })
                                  .map((employee, idx) => (
                                    <tr key={`${employee.employeeName}-${idx}`}>
                                      <td className="w-1/3 py-3 text-sm text-gray-900">
                                        {employee.ranges.map((range, i) => (
                                          <span key={i}>
                                            {i > 0 && ' | '}
                                            {formatDateRange(range.start, range.end)}
                                          </span>
                                        ))}
                                      </td>
                                      <td className="w-1/6 py-3 text-sm font-medium text-gray-900">
                                        {employee.totalDays} {employee.totalDays === 1 ? 'Tag' : 'Tage'}
                                      </td>
                                      <td className="w-1/4 py-3 text-sm text-gray-900">
                                        {employee.employeeName}
                                      </td>
                                      <td className="w-1/4 py-3 text-sm text-gray-900">
                                        {Array.from(new Set(employee.ranges.map(range => range.storeName))).join(', ')}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
