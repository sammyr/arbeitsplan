'use client';

import { useState, useEffect, memo, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, getDay, addDays, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Store } from '@/types/store';
import { Employee, WorkingShift, ShiftDefinition } from '@/types';
import { ShiftAssignment } from '@/types/shift-assignment';
import { dbService } from '@/lib/db';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import ShiftAssignmentModal from '@/components/ShiftAssignmentModal';
import { exportCalendarToPDF } from '@/utils/pdfUtils';
import { exportToExcel } from '@/utils/exportUtils';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { collection, query, where, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLog } from '@/contexts/LogContext';
import './styles.css';

// Funktion zum Laden der Store-Daten
const loadStoreData = async (
  selectedStore: Store | null,
  setIsLoading: (isLoading: boolean) => void,
  setEmployees: (employees: Employee[]) => void,
  setShifts: (shifts: ShiftDefinition[]) => void,
  setAssignments: (assignments: ShiftAssignment[]) => void,
  userId: string
) => {
  if (!selectedStore) {
    console.log('No store selected, skipping data load');
    setIsLoading(false);
    return;
  }

  try {
    setIsLoading(true);
    console.log('Loading data for store:', selectedStore);

    // Lade Mitarbeiter, Arbeitsschichten und Zuweisungen parallel
    const [loadedEmployees, loadedAssignments, loadedShifts] = await Promise.all([
      dbService.getEmployeesByOrganization(userId),
      dbService.getAssignments(selectedStore.id),
      dbService.getWorkingShiftsByOrganization(userId)
    ]).catch(error => {
      console.error('Error loading data:', error);
      toast.error('Fehler beim Laden der Daten: ' + error.message);
      setIsLoading(false);
      return [[], [], []]; // Return empty arrays on error
    });

    if (!loadedEmployees || !loadedAssignments || !loadedShifts) {
      console.error('One or more data sets failed to load');
      setIsLoading(false);
      return;
    }

    console.log('Data loading results:', {
      employees: {
        count: loadedEmployees.length,
        sample: loadedEmployees.slice(0, 2)
      },
      assignments: {
        count: loadedAssignments.length,
        sample: loadedAssignments.slice(0, 2).map(a => ({
          id: a.id,
          date: a.date,
          employeeId: a.employeeId,
          workHours: a.workHours
        }))
      },
      shifts: {
        count: loadedShifts.length,
        sample: loadedShifts.slice(0, 2)
      }
    });

    // Ensure assignments have proper date objects
    const processedAssignments = loadedAssignments.map(assignment => ({
      ...assignment,
      date: new Date(assignment.date).toISOString().split('T')[0] // Ensure consistent date format
    }));

    // Batch-Update der States
    setEmployees(loadedEmployees);
    setShifts(loadedShifts);
    setAssignments(processedAssignments);
    setIsLoading(false);

    console.log('Store data loaded successfully');
  } catch (error) {
    console.error('Error loading store data:', error);
    toast.error('Fehler beim Laden der Daten');
    setIsLoading(false);
    
    // Set empty states on error
    setEmployees([]);
    setShifts([]);
    setAssignments([]);
  }
};

// Funktion um die Wochentage basierend auf dem Startdatum zu generieren
const getWeekDays = (startDate: Date) => {
  const weekDays = [];
  const currentDate = startDate;
  
  for (let i = 0; i < 7; i++) {
    weekDays.push(format(currentDate, 'EEEEEE', { locale: de }).replace('.', ''));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return weekDays;
};

// Funktion zur Berechnung der leeren Tage am Monatsanfang
const getEmptyCellCount = (date: Date) => {
  const day = getDay(startOfMonth(date));
  // Konvertiere Sonntag (0) zu 7, andere Tage bleiben unverändert
  return day === 0 ? 6 : day - 1;
};

const Arbeitsplan3Page = memo(() => {
  // State Management
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // Check if we're on the client side and if there's a saved date
    if (typeof window !== 'undefined') {
      const savedDate = localStorage.getItem('arbeitsplan3_currentDate');
      if (savedDate) {
        const parsedDate = new Date(savedDate);
        // Verify if the parsed date is valid
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    }
    // Default to current date if no saved date or invalid date
    return new Date();
  });
  const [monthsWithAssignments, setMonthsWithAssignments] = useState<Set<string>>(new Set());
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<ShiftDefinition[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ShiftAssignment | null>(null);

  const { user, userRole } = useAuth();
  const isEmployee = userRole === 'user';
  const { addLog } = useLog();

  // Get all months that have assignments
  useEffect(() => {
    const getMonthsWithAssignments = async () => {
      if (!selectedStore) return;
      
      const allAssignments = await dbService.getAssignments(selectedStore.id);
      const months = new Set<string>();
      
      allAssignments.forEach(assignment => {
        const date = new Date(assignment.date);
        const monthKey = format(date, 'yyyy-MM');
        months.add(monthKey);
      });
      
      setMonthsWithAssignments(months);
    };

    getMonthsWithAssignments();
  }, [selectedStore]);

  // Generate array of past and future months (12 months before and after current date)
  const availableMonths = useMemo(() => {
    const months: { value: string; label: string; hasAssignments: boolean }[] = [];
    const currentMonth = new Date();
    
    // Add 12 months before
    for (let i = -12; i <= 12; i++) {
      const date = new Date(currentMonth);
      date.setMonth(currentMonth.getMonth() + i);
      const monthKey = format(date, 'yyyy-MM');
      months.push({
        value: monthKey,
        label: format(date, 'MMMM yyyy', { locale: de }),
        hasAssignments: monthsWithAssignments.has(monthKey)
      });
    }
    
    return months;
  }, [monthsWithAssignments]);

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [year, month] = event.target.value.split('-');
    const newDate = new Date(currentDate);
    newDate.setFullYear(parseInt(year));
    newDate.setMonth(parseInt(month) - 1);
    setCurrentDate(newDate);
  };

  // Save current date to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('arbeitsplan3_currentDate', currentDate.toISOString());
    }
  }, [currentDate]);

  // Cleanup localStorage when component unmounts
  useEffect(() => {
    return () => {
      // Optional: Remove the stored date when component unmounts
      // Uncomment the next line if you want to clear the date when leaving the page
      // if (typeof window !== 'undefined') {
      //   localStorage.removeItem('arbeitsplan3_currentDate');
      // }
    };
  }, []);

  // Optimized loadData function
  const loadData = async () => {
    if (!user?.uid) {
      console.log('No user ID available');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Loading data for user:', user.uid);

      // Load all data in parallel using Promise.all
      const [stores, employeesData, shiftsData, assignmentsData] = await Promise.all([
        dbService.getStores(user.uid),
        dbService.getEmployeesByOrganization(user.uid),
        dbService.getWorkingShiftsByOrganization(user.uid),
        selectedStore ? dbService.getAssignments(selectedStore.id) : Promise.resolve([])
      ]);

      console.log('Loaded data:', {
        stores: stores.length,
        employees: employeesData.length,
        shifts: shiftsData.length,
        assignments: assignmentsData.length
      });

      // Update all states at once to minimize re-renders
      setStores(stores);
      setEmployees(employeesData);
      setShifts(userRole === 'user' ? shiftsData.filter(shift => shift.employeeId === user.uid) : shiftsData);
      setAssignments(assignmentsData);
      
      // Handle store selection
      if (stores.length > 0) {
        const savedStoreId = localStorage.getItem('selectedStoreId');
        const savedStore = savedStoreId ? stores.find(s => s.id === savedStoreId) : null;
        const storeToSelect = savedStore || stores[0];
        setSelectedStore(storeToSelect);
        
        // Cache the selected store
        localStorage.setItem('selectedStoreId', storeToSelect.id);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Fehler beim Laden der Daten');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, userRole]);

  // Lade Daten wenn sich der Store ändert
  useEffect(() => {
    if (!user) {
      // If no user, we're either loading or not authenticated
      console.log('No user available yet');
      return;
    }

    if (!selectedStore) {
      // If no store selected, reset loading state
      setIsLoading(false);
      console.log('No store selected');
      return;
    }

    console.log('Loading data for store:', selectedStore.id, 'and user:', user.uid);
    loadStoreData(selectedStore, setIsLoading, setEmployees, setShifts, setAssignments, user.uid);
  }, [selectedStore, user]);

  // Füge Mitarbeiterdaten zu den Zuweisungen hinzu
  useEffect(() => {
    const updateAssignmentsWithEmployees = () => {
      if (assignments.length === 0) {
        console.log('No assignments to update');
        return;
      }
      
      if (employees.length === 0) {
        console.log('No employees available for updating assignments');
        return;
      }

      console.log('Starting assignment update with:', {
        assignmentCount: assignments.length,
        employeeCount: employees.length,
        sampleAssignment: assignments[0],
        sampleEmployee: employees[0]
      });

      // Check if assignments already have employee data
      const needsUpdate = assignments.some(assignment => 
        !assignment.employee && 
        employees.some(e => e.id === assignment.employeeId)
      );

      if (!needsUpdate) {
        console.log('Assignments already have employee data');
        return;
      }

      const updatedAssignments = assignments.map(assignment => {
        const employee = employees.find(e => e.id === assignment.employeeId);
        const updated = {
          ...assignment,
          employee: employee || undefined
        };
        
        if (!employee) {
          console.log('⚠️ No employee found for assignment:', {
            assignmentId: assignment.id,
            employeeId: assignment.employeeId
          });
        }
        
        return updated;
      });

      console.log('Assignment update complete:', {
        total: updatedAssignments.length,
        withEmployee: updatedAssignments.filter(a => a.employee).length
      });

      setAssignments(updatedAssignments);
    };

    updateAssignmentsWithEmployees();
  }, [employees, assignments]);

  // Funktion um die Tage für den aktuellen Monat zu berechnen
  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = eachDayOfInterval({ start, end });

    const firstDay = getDay(start);
    const lastDay = getDay(end);

    // Füge leere Tage am Anfang hinzu (Montag = 1, Sonntag = 0)
    const leadingDays = firstDay === 0 ? 6 : firstDay - 1;
    const trailingDays = lastDay === 0 ? 0 : 7 - lastDay;

    const calendar = [
      ...Array(leadingDays).fill(null),
      ...days,
      ...Array(trailingDays).fill(null)
    ];

    return calendar;
  };

  // Kalender-Funktionen
  const daysInMonth = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  // Memoize the formatted month to ensure consistent rendering
  const formattedMonth = useMemo(() => {
    return format(currentDate, 'MMMM yyyy', { locale: de });
  }, [currentDate]);

  // Render Kalender
  const renderCalendar = () => {
    // Überprüfe, ob Daten vorhanden sind
    if (!selectedStore) {
      return (
        <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-800 font-medium">Bitte wählen Sie zuerst eine Filiale aus, um den Arbeitsplan anzuzeigen.</p>
        </div>
      );
    }

    if (employees.length === 0) {
      return (
        <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-800 font-medium">Es wurden noch keine Mitarbeiter angelegt. Bitte fügen Sie zuerst Mitarbeiter hinzu, um den Arbeitsplan zu nutzen.</p>
        </div>
      );
    }

    if (shifts.length === 0) {
      return (
        <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-800 font-medium">Es wurden noch keine Arbeitsschichten definiert. Bitte legen Sie zuerst Arbeitsschichten an, um diese im Arbeitsplan einzutragen.</p>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-2 bg-transparent mt-4">
        {/* Calendar Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-separate border-spacing-px bg-slate-200">
              <colgroup>
                <col style={{ width: '14.285%' }} />
                <col style={{ width: '14.285%' }} />
                <col style={{ width: '14.285%' }} />
                <col style={{ width: '14.285%' }} />
                <col style={{ width: '14.285%' }} />
                <col style={{ width: '14.285%' }} />
                <col style={{ width: '14.285%' }} />
              </colgroup>
              <thead>
                <tr className="bg-slate-50">
                  <th className="bg-white px-4 py-3 text-sm font-semibold text-slate-900 border-b border-slate-200">Mo</th>
                  <th className="bg-white px-4 py-3 text-sm font-semibold text-slate-900 border-b border-slate-200">Di</th>
                  <th className="bg-white px-4 py-3 text-sm font-semibold text-slate-900 border-b border-slate-200">Mi</th>
                  <th className="bg-white px-4 py-3 text-sm font-semibold text-slate-900 border-b border-slate-200">Do</th>
                  <th className="bg-white px-4 py-3 text-sm font-semibold text-slate-900 border-b border-slate-200">Fr</th>
                  <th className="bg-white px-4 py-3 text-sm font-semibold text-slate-900 border-b border-slate-200">Sa</th>
                  <th className="bg-white px-4 py-3 text-sm font-semibold text-slate-900 border-b border-slate-200">So</th>
                </tr>
              </thead>
              <tbody>
                <DragDropContext onDragEnd={handleDragEnd}>
                  {chunk(daysInMonth, 7).map((week, weekIndex) => (
                    <tr key={weekIndex}>
                      {week.map((day, dayIndex) => {
                        if (day === null) {
                          return (
                            <td 
                              key={`empty-${weekIndex}-${dayIndex}`} 
                              className="bg-slate-100 px-4 py-3 align-top border border-slate-200"
                              style={{ 
                                height: '120px',
                                minHeight: '120px'
                              }}
                            />
                          );
                        }

                        const dateStr = format(day, 'yyyy-MM-dd');
                        const dayAssignments = assignments
                          .filter(a => format(new Date(a.date), 'yyyy-MM-dd') === dateStr)
                          .sort((a, b) => {
                            const shiftA = shifts.find(s => s.id === a.shiftId);
                            const shiftB = shifts.find(s => s.id === b.shiftId);
                            
                            // Sortiere nach Priorität (falls vorhanden) oder Titel
                            const priorityA = shiftA?.priority ?? Number.MAX_VALUE;
                            const priorityB = shiftB?.priority ?? Number.MAX_VALUE;
                            
                            if (priorityA !== priorityB) {
                              return priorityA - priorityB;
                            }
                            
                            // Falls keine Priorität gesetzt ist oder gleich, sortiere nach Titel
                            const titleA = shiftA?.title || '';
                            const titleB = shiftB?.title || '';
                            return titleA.localeCompare(titleB);
                          });

                        return (
                          <Droppable key={dateStr} droppableId={dateStr}>
                            {(provided) => (
                              <td
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`px-4 py-3 align-top relative hover:bg-gray-50 transition-colors cursor-pointer border border-slate-200 ${
                                  !isSameMonth(day, currentDate) ? 'bg-slate-100' : 'bg-white'
                                } ${
                                  isToday(day) ? 'bg-blue-50' : ''
                                }`}
                                style={{ 
                                  height: '120px',
                                  minHeight: '120px'
                                }}
                                onClick={() => handleDateClick(day)}
                              >
                                <div className="text-right text-sm text-gray-500 mb-2">
                                  <span className="text-md font-semibold">{format(day, 'd')}</span>
                                </div>
                                <div className="space-y-1">
                                  {dayAssignments.map((assignment, index) => {
                                    const employee = employees.find(e => e.id === assignment.employeeId);
                                    const shift = shifts.find(s => s.id === assignment.shiftId);
                                    
                                    if (!employee || !shift) return null;
                                    
                                    return (
                                      <Draggable
                                        key={assignment.id}
                                        draggableId={assignment.id}
                                        index={index}
                                      >
                                        {(provided) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="group relative"
                                          >
                                            <div className="absolute -top-2 right-0 flex opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setEditingAssignment(assignment);
                                                  setSelectedDate(day);
                                                  setIsModalOpen(true);
                                                }}
                                                className="p-1 text-slate-500 hover:text-slate-700 rounded transition-colors bg-white shadow-sm"
                                                title="Schicht bearbeiten"
                                              >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteAssignment(assignment.id);
                                                }}
                                                className="ml-1 p-1 text-slate-500 hover:text-slate-700 rounded transition-colors bg-white shadow-sm"
                                                title="Schicht löschen"
                                              >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                              </button>
                                            </div>
                                            <div key={index} 
                                              className={`p-1.5 bg-gradient-to-r from-emerald-50/80 via-emerald-50/90 to-emerald-50/80 text-slate-900 rounded-md hover:from-emerald-100/90 hover:via-emerald-100 hover:to-emerald-100/90 transition-all border border-emerald-100/50 shadow-sm`}
                                            >
                                              <div className="flex items-center gap-1">
                                                <span className="font-semibold text-sm">
                                                  {employee.firstName}
                                                </span>
                                                <span className="text-sm text-slate-500">({shift.title})</span>
                                              </div>
                                              {!shift.excludeFromCalculations && (
                                                <div className="text-sm text-slate-600">
                                                  {assignment.workHours}h
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    );
                                  })}
                                  {provided.placeholder}
                                </div>
                              </td>
                            )}
                          </Droppable>
                        );
                      })}
                    </tr>
                  ))}
                </DragDropContext>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const handleDateClick = (date: Date) => {
    if (!isSameMonth(date, currentDate)) return;
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  // Schicht-Funktionen
  const handleAssignmentSave = async (employeeId: string, shiftId: string, workHours: number) => {
    if (!selectedStore || !selectedDate) {
      toast.error('Bitte wählen Sie eine Filiale und ein Datum aus');
      return;
    }

    try {
      if (editingAssignment) {
        // Update existing assignment
        const assignmentUpdate = {
          employeeId,
          shiftId,
          storeId: selectedStore.id,
          organizationId: user?.uid || '',
          date: format(selectedDate, 'yyyy-MM-dd'),
          workHours: workHours,
          updatedAt: new Date().toISOString()
        };

        if (!user) return;
        await dbService.updateAssignment(editingAssignment.id, assignmentUpdate);
        setAssignments(prev => prev.map(a => 
          a.id === editingAssignment.id ? { ...a, ...assignmentUpdate } : a
        ));

        const employee = employees.find(e => e.id === employeeId);
        const shift = shifts.find(s => s.id === shiftId);

        addLog(
          'success',
          'Schicht bearbeitet',
          JSON.stringify({
            mitarbeiter: employee?.firstName || 'Unbekannt',
            schicht: shift?.title || 'Unbekannt',
            stunden: workHours,
            datum: format(new Date(assignmentUpdate.date), 'dd.MM.yyyy'),
            filiale: selectedStore.name
          })
        );

        toast.success('Schicht wurde erfolgreich bearbeitet');
      } else {
        // Create new assignment
        const assignment: Omit<ShiftAssignment, 'id'> = {
          employeeId,
          shiftId,
          storeId: selectedStore.id,
          organizationId: user?.uid || '',
          date: format(startOfDay(selectedDate), 'yyyy-MM-dd'),
          workHours: workHours,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        if (!user) return;
        const assignmentId = await dbService.addAssignment(assignment);
        const newAssignment = { ...assignment, id: assignmentId };
        setAssignments(prev => [...prev, newAssignment]);
        
        const employee = employees.find(e => e.id === employeeId);
        const shift = shifts.find(s => s.id === shiftId);
        
        addLog(
          'success',
          'Neue Schicht zugewiesen',
          JSON.stringify({
            mitarbeiter: employee?.firstName || 'Unbekannt',
            schicht: shift?.title || 'Unbekannt',
            stunden: workHours,
            datum: format(selectedDate, 'dd.MM.yyyy'),
            filiale: selectedStore.name
          })
        );
        
        toast.success('Schicht erfolgreich zugewiesen');
      }
      setIsModalOpen(false);
      setEditingAssignment(null);
    } catch (error) {
      console.error('Error saving assignment:', error);
      addLog('error', editingAssignment ? 'Fehler beim Bearbeiten der Schicht' : 'Fehler beim Zuweisen der Schicht');
      toast.error(editingAssignment ? 'Fehler beim Bearbeiten der Schicht' : 'Fehler beim Speichern der Zuweisung');
    }
  };

  // Funktion zum Löschen einer Schichtzuweisung
  const handleDeleteAssignment = async (assignmentId: string) => {
    // Finde die zu löschende Zuweisung
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    const employee = employees.find(e => e.id === assignment.employeeId);
    const shift = shifts.find(s => s.id === assignment.shiftId);
    
    // Bestätigungsdialog anzeigen
    const isConfirmed = window.confirm(
      `Möchten Sie wirklich die Schicht "${shift?.title || 'Unbekannt'}" von ${employee?.firstName || 'Unbekannt'} am ${format(new Date(assignment.date), 'dd.MM.yyyy')} löschen?`
    );
    
    if (!isConfirmed) {
      return; // Wenn der Benutzer abbricht, nichts weiter tun
    }

    try {
      await dbService.deleteAssignment(assignmentId);
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      
      // Erstelle einen Log-Eintrag für die Löschung
      addLog(
        'info',
        'Schicht gelöscht',
        JSON.stringify({
          mitarbeiter: employee?.firstName || 'Unbekannt',
          schicht: shift?.title || 'Unbekannt',
          datum: format(new Date(assignment.date), 'dd.MM.yyyy'),
          filiale: selectedStore?.name || 'Unbekannt'
        })
      );
      
      toast.success('Schicht wurde gelöscht');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      addLog('error', 'Fehler beim Löschen der Schicht');
      toast.error('Fehler beim Löschen der Schicht');
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (isEmployee) return;
    
    if (!result.destination || !selectedStore) {
      console.log('No valid destination or store');
      return;
    }

    const { source, destination, draggableId } = result;
    console.log('Drag details:', {
      source: source,
      destination: destination,
      draggableId: draggableId
    });

    if (source.droppableId === destination.droppableId) {
      console.log('Same day, no update needed');
      return;
    }

    try {
      const assignment = assignments.find(a => a.id === draggableId);
      if (!assignment) {
        console.log('Assignment not found:', draggableId);
        return;
      }

      console.log('Found assignment:', assignment);

      // Optimistische UI-Aktualisierung
      setAssignments(prev => 
        prev.map(a => 
          a.id === draggableId 
            ? { ...a, date: destination.droppableId }
            : a
        )
      );

      // Erstelle das aktualisierte Assignment
      const updatedAssignment = {
        ...assignment,
        date: destination.droppableId
      };

      console.log('Updating assignment:', updatedAssignment);

      // Aktualisiere die Zuweisung in der Datenbank
      if (!user) return;
      await dbService.updateAssignment(draggableId, updatedAssignment);
      
      // Hole Mitarbeiter- und Schichtinformationen für den Log-Eintrag
      const employee = employees.find(e => e.id === assignment.employeeId);
      const shift = shifts.find(s => s.id === assignment.shiftId);
      
      // Erstelle einen Log-Eintrag für die Verschiebung
      addLog(
        'info',
        'Schicht verschoben',
        JSON.stringify({
          mitarbeiter: employee?.firstName || 'Unbekannt',
          schicht: shift?.title || 'Unbekannt',
          von: format(new Date(source.droppableId), 'dd.MM.yyyy'),
          nach: format(new Date(destination.droppableId), 'dd.MM.yyyy'),
          filiale: selectedStore.name
        })
      );
      
      console.log('Database update successful');
      toast.success('Schicht wurde verschoben');
    } catch (error) {
      console.error('Error updating assignment:', error);
      addLog('error', 'Fehler beim Verschieben der Schicht');
      toast.error('Fehler beim Verschieben der Schicht');
      
      // Nur im Fehlerfall die Daten neu laden
      if (user) {
        await loadStoreData(selectedStore, setIsLoading, setEmployees, setShifts, setAssignments, user.uid);
      }
    }
  };

  const handleExportPDF = async () => {
    if (!selectedStore) {
      toast.error('Bitte wählen Sie zuerst einen Store aus');
      return;
    }

    try {
      await exportCalendarToPDF(
        assignments,
        employees,
        shifts,
        currentDate,
        selectedStore.name
      );
      toast.success('PDF wurde erfolgreich erstellt');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Fehler beim Erstellen der PDF');
    }
  };

  const handleExcelExport = () => {
    if (!selectedStore) {
      toast.error('Bitte wählen Sie zuerst einen Store aus');
      return;
    }

    try {
      exportToExcel(
        assignments,
        employees,
        shifts,
        currentDate,
        selectedStore.name
      );
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Fehler beim Excel-Export');
    }
  };

  // Berechne die Gesamtstunden pro Mitarbeiter für den aktuellen Monat
  const calculateEmployeeHours = (employeeId: string) => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    
    const employeeAssignments = assignments.filter(
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

    return employeeAssignments.reduce((total, assignment) => {
      return total + (assignment.workHours || 0);
    }, 0);
  };

  const calculateTotalHours = () => {
    return employees.reduce((total, employee) => {
      return total + calculateEmployeeHours(employee.id);
    }, 0);
  };

  const handleStoreChange = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    setSelectedStore(store || null);
    if (store) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedStoreId', store.id);
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('selectedStoreId');
      }
    }
  };

  // Helper function to chunk array into weeks
  const chunk = <T,>(arr: T[], size: number): T[][] => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-[1920px] mx-auto">
        <div className="bg-white rounded-xl shadow-sm">
          <LoadingSpinner />
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
              {/* Header mit Store-Auswahl und Navigation */}
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
                <div className="flex flex-col gap-4">
                  <h1 className="text-2xl font-semibold text-slate-800">
                    Arbeitsplan für {selectedStore?.name} / {formattedMonth}
                  </h1>

                  <div className="flex items-center justify-between">
                    {/* Left side - Month Selection */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const prevMonth = new Date(currentDate);
                          prevMonth.setMonth(prevMonth.getMonth() - 1);
                          setCurrentDate(prevMonth);
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('arbeitsplan3_currentDate', prevMonth.toISOString());
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors border border-green-500"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      <select
                        value={format(currentDate, 'yyyy-MM')}
                        onChange={handleMonthChange}
                        className="bg-white border border-green-500 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 min-w-[200px]"
                      >
                        {availableMonths.map(month => (
                          <option 
                            key={month.value} 
                            value={month.value}
                            className={month.hasAssignments ? 'font-semibold text-blue-600' : ''}
                          >
                            {month.label}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => {
                          const nextMonth = new Date(currentDate);
                          nextMonth.setMonth(nextMonth.getMonth() + 1);
                          setCurrentDate(nextMonth);
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('arbeitsplan3_currentDate', nextMonth.toISOString());
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors border border-green-500"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Right side - Export Buttons and Store Selection */}
                    {!isEmployee && (
                      <div className="flex items-center gap-4">
                        {/* Store Selection */}
                        <select
                          value={selectedStore?.id || ''}
                          onChange={(e) => handleStoreChange(e.target.value)}
                          className="bg-white border border-green-500 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 min-w-[200px]"
                        >
                          <option value="" disabled>Filiale auswählen</option>
                          {stores.map(store => (
                            <option key={store.id} value={store.id}>
                              {store.name}
                            </option>
                          ))}
                        </select>

                        {/* Export Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleExportPDF}
                            className="inline-flex items-center px-4 py-2.5 border border-green-500 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:border-green-500"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            PDF Export
                          </button>

                          <button
                            onClick={handleExcelExport}
                            className="inline-flex items-center px-4 py-2.5 border border-green-500 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:border-green-500"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Excel Export
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div id="calendar-container" className="calendar-container bg-white rounded-xl shadow-sm p-4 md:p-6 overflow-x-auto" style={{ minWidth: '1000px', maxWidth: '1400px', margin: '0 auto' }}>
                {renderCalendar()}
              </div>

              {/* Übersichtstabelle */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Arbeitsstunden Übersicht</h2>
                <table className="min-w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="text-left bg-gray-50 px-4 py-2 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-medium text-sm">
                        Mitarbeiter
                      </th>
                      <th className="text-right bg-gray-50 px-4 py-2 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-medium text-sm">
                        Stunden
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees
                      .filter(employee => calculateEmployeeHours(employee.id) > 0)
                      .map((employee) => {
                      const totalHours = calculateEmployeeHours(employee.id);
                      return (
                        <tr key={employee.id}>
                          <td className="px-4 py-2 border-b border-gray-200">
                            {employee.firstName} {employee.lastName}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200 text-right">
                            {totalHours.toFixed(1)} Stunden
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td className="px-4 py-2 border-b border-gray-200 font-medium">
                        Gesamt
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200 text-right font-medium">
                        {calculateTotalHours().toFixed(1)} Stunden
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal */}
            {!isEmployee && isModalOpen && selectedDate && (
              <ShiftAssignmentModal
                isOpen={isModalOpen}
                onClose={() => {
                  setIsModalOpen(false);
                  setEditingAssignment(null);
                }}
                onSave={handleAssignmentSave}
                employees={employees}
                shifts={shifts}
                date={selectedDate}
                initialEmployeeId={editingAssignment?.employeeId}
                initialShiftId={editingAssignment?.shiftId}
                initialWorkHours={editingAssignment?.workHours || 8}
              />
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
});

export default Arbeitsplan3Page;
