'use client';

import { useState, useEffect, memo, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, getDay, addDays, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Store } from '@/types/store';
import { Employee } from '@/types/employee';
import { ShiftDefinition } from '@/types';
import { ShiftAssignment } from '@/types/shift-assignment';
import { dbService } from '@/lib/db';
import { collection, query, where, doc, getDocs, setDoc, deleteDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import ShiftAssignmentModal from '@/components/ShiftAssignmentModal';
import { exportCalendarToPDF } from '@/utils/pdfUtils';
import { exportToExcel } from '@/utils/exportUtils';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { useLog } from '@/contexts/LogContext';
import './styles.css';

// Funktion zum Laden der Store-Daten
const loadStoreData = async (
  selectedStore: Store | null,
  setIsLoading: (isLoading: boolean) => void,
  setEmployees: (employees: Employee[]) => void,
  setShifts: (shifts: ShiftDefinition[]) => void,
  setAssignments: (assignments: ShiftAssignment[]) => void,
  userId: string,
  employeeOrder: string[]
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

    // Ensure assignments have proper date objects
    const processedAssignments = loadedAssignments.map(assignment => ({
      ...assignment,
      date: new Date(assignment.date).toISOString().split('T')[0] // Ensure consistent date format
    }));

    // Sortiere die Mitarbeiter entsprechend der gespeicherten Reihenfolge
    if (employeeOrder.length > 0) {
      const orderedEmployees = [...loadedEmployees].sort((a, b) => {
        const aIndex = employeeOrder.indexOf(a.id);
        const bIndex = employeeOrder.indexOf(b.id);
        
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        
        return 0;
      });
      
      setEmployees(orderedEmployees);
    } else {
      setEmployees(loadedEmployees);
    }

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
  const [employeeOrder, setEmployeeOrder] = useState<string[]>([]);
  const [shifts, setShifts] = useState<ShiftDefinition[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // WICHTIG: NICHT ÄNDERN! KRITISCHE GESCHÄFTSLOGIK!
    // Diese Implementierung der Monatsgenerierung ist final und wurde sorgfältig getestet.
    // Änderungen können zu Fehlern in der Datumsanzeige und Datenverarbeitung führen.
    // - Setzt das Datum auf den 1. des Monats zur korrekten Monatsberechnung
    // - Verhindert doppelte Monatseinträge
    // - Garantiert chronologische Sortierung
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    const months: { value: string; label: string; hasAssignments: boolean }[] = [];
    const currentMonth = new Date();
    currentMonth.setDate(1); // Setze auf den ersten Tag des Monats
    
    // Add 12 months before and after
    for (let i = -6; i <= 12; i++) {
      const date = new Date(currentMonth);
      date.setMonth(currentMonth.getMonth() + i);
      const monthKey = format(date, 'yyyy-MM');
      
      // Prüfe ob dieser Monat bereits hinzugefügt wurde
      if (!months.some(m => m.value === monthKey)) {
        months.push({
          value: monthKey,
          label: format(date, 'MMMM yyyy', { locale: de }),
          hasAssignments: monthsWithAssignments.has(monthKey)
        });
      }
    }
    
    // Sortiere die Monate chronologisch
    months.sort((a, b) => a.value.localeCompare(b.value));
    
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
    if (!user || !selectedStore) return;
    loadStoreData(selectedStore, setIsLoading, setEmployees, setShifts, setAssignments, user.uid, employeeOrder);
  }, [selectedStore, user]);

  // Lade die benutzerdefinierte Sortierung
  useEffect(() => {
    const loadEmployeeOrder = async () => {
      if (!selectedStore?.id) return;

      const orderRef = collection(db, 'employeeOrder');
      const q = query(orderRef, where('storeId', '==', selectedStore.id));
      const orderSnap = await getDocs(q);

      if (!orderSnap.empty) {
        const doc = orderSnap.docs[0];
        setEmployeeOrder(doc.data().order || []);
      }
    };

    loadEmployeeOrder();
  }, [selectedStore?.id]);

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
      <DragDropContext onDragEnd={handleDragEnd}>
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
                            
                            const priorityA = shiftA?.priority ?? Number.MAX_VALUE;
                            const priorityB = shiftB?.priority ?? Number.MAX_VALUE;
                            
                            if (priorityA !== priorityB) {
                              return priorityA - priorityB;
                            }
                            
                            const titleA = shiftA?.title || '';
                            const titleB = shiftB?.title || '';
                            return titleA.localeCompare(titleB);
                          });

                        return (
                          <Droppable droppableId={dateStr}>
                            {(provided) => (
                              <td
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`px-4 py-3 align-top relative hover:bg-gray-50 transition-colors cursor-pointer border border-slate-200 ${
                                  !isSameMonth(day, currentDate) ? 'bg-slate-100' : 'bg-white'
                                } ${isToday(day) ? 'bg-blue-50' : ''}`}
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
                                            <div 
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
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DragDropContext>
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

  const handleExportPDF = async () => {
    if (!selectedStore) {
      toast.error('Bitte wählen Sie zuerst einen Store aus');
      return;
    }

    // Konvertiere die Assignments in Shifts
    const shiftsFromAssignments = assignments.map(assignment => ({
      id: assignment.id,
      title: `${assignment.employeeId} - ${assignment.shiftId}`,
      workHours: shifts.find(s => s.id === assignment.shiftId)?.workHours || 0,
      employeeId: assignment.employeeId,
      date: assignment.date,
      startTime: shifts.find(s => s.id === assignment.shiftId)?.startTime || '00:00',
      endTime: shifts.find(s => s.id === assignment.shiftId)?.endTime || '00:00',
      shiftId: assignment.shiftId,
      storeId: selectedStore.id,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt
    }));

    try {
      // Filtere zuerst Mitarbeiter mit Schichten
      const employeesWithAssignments = employees.filter(emp => 
        assignments.some(a => a.employeeId === emp.id)
      );

      // Sortiere die gefilterten Mitarbeiter
      const sortedEmployees = [...employeesWithAssignments].sort((a, b) => {
        const aIndex = employeeOrder.indexOf(a.id);
        const bIndex = employeeOrder.indexOf(b.id);
        return (aIndex !== -1 && bIndex !== -1) ? aIndex - bIndex : 0;
      });

      const storeWithState = {
        ...selectedStore,
        state: selectedStore.state || 'Brandenburg'
      };

      // Konvertiere die ShiftDefinitions in Shifts
      const shiftsFromDefinitions = shifts.map(shift => ({
        id: shift.id,
        title: shift.title,
        workHours: shift.workHours,
        employeeId: '',
        date: '',
        startTime: shift.startTime,
        endTime: shift.endTime,
        shiftId: shift.id,
        storeId: selectedStore.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      await exportCalendarToPDF(
        shiftsFromAssignments,
        sortedEmployees,
        shiftsFromDefinitions,
        currentDate,
        storeWithState
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
      // Filtere zuerst Mitarbeiter mit Schichten
      const employeesWithAssignments = employees.filter(emp => 
        assignments.some(a => a.employeeId === emp.id)
      );

      // Sortiere die gefilterten Mitarbeiter
      const sortedEmployees = [...employeesWithAssignments].sort((a, b) => {
        const aIndex = employeeOrder.indexOf(a.id);
        const bIndex = employeeOrder.indexOf(b.id);
        return (aIndex !== -1 && bIndex !== -1) ? aIndex - bIndex : 0;
      });

      exportToExcel(
        assignments,
        sortedEmployees,
        shifts,
        currentDate,
        selectedStore.name
      );
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Fehler beim Excel-Export');
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (isEmployee) return;
    
    if (!result.destination || !selectedStore) {
      console.log('No valid destination or store');
      return;
    }

    const { source, destination, draggableId } = result;

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
        date: destination.droppableId,
        updatedAt: new Date().toISOString()
      };

      // Aktualisiere die Zuweisung in der Datenbank
      if (!user) return;
      await dbService.updateAssignment(draggableId, updatedAssignment);
      
      const employee = employees.find(e => e.id === assignment.employeeId);
      const shift = shifts.find(s => s.id === assignment.shiftId);
      
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
      
      toast.success('Schicht wurde verschoben');
    } catch (error) {
      console.error('Error updating assignment:', error);
      addLog('error', 'Fehler beim Verschieben der Schicht');
      toast.error('Fehler beim Verschieben der Schicht');
      
      if (user) {
        await loadStoreData(selectedStore, setIsLoading, setEmployees, setShifts, setAssignments, user.uid, employeeOrder);
      }
    }
  };

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // WICHTIG: NICHT ÄNDERN! KRITISCHE GESCHÄFTSLOGIK!
  // Die Stundenberechnung MUSS die excludeFromCalculations-Eigenschaft der Schichten beachten!
  // Schichten mit excludeFromCalculations=true werden in der Tabelle angezeigt,
  // aber ihre Stunden werden NICHT in die Gesamtsumme einberechnet.
  // Die Berechnung MUSS tageweise erfolgen:
  // 1. Für jeden Tag im Monat werden die Schichten des Mitarbeiters gefiltert
  // 2. Nur aktive Schichten (ohne excludeFromCalculations) werden berücksichtigt
  // 3. Die Stunden werden pro Tag summiert
  // 
  // Diese Logik MUSS identisch sein mit:
  // - PDF-Export (pdfUtils.ts)
  // - Excel-Export (exportUtils.ts)
  // - Auswertungen (auswertungen/page.tsx)
  // 
  // Diese Logik ist essentiell für die korrekte Arbeitszeiterfassung!
  // NICHT ÄNDERN! Bei Fragen: Dokumentation konsultieren!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  // Berechne die Gesamtstunden pro Mitarbeiter für den aktuellen Monat
  const calculateEmployeeHours = (employeeId: string) => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    let totalHours = 0;

    // Berechne für jeden Tag im Monat
    const days = eachDayOfInterval({ start, end });
    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      
      // Hole alle Schichten des Mitarbeiters für diesen Tag
      const dayAssignments = assignments.filter(a => 
        format(new Date(a.date), 'yyyy-MM-dd') === dateStr && 
        a.employeeId === employeeId
      );

      // Addiere nur die Stunden von aktiven Schichten
      const dayHours = dayAssignments.reduce((sum, a) => {
        const shift = shifts.find(s => s.id === a.shiftId);
        if (!shift || shift.excludeFromCalculations) return sum;
        return sum + (a.workHours || 0);
      }, 0);

      totalHours += dayHours;
    });

    // Runde auf eine Dezimalstelle
    return Math.round(totalHours * 10) / 10;
  };

  // Berechne die Gesamtstunden aller Mitarbeiter
  const calculateTotalHoursAll = () => {
    const total = employees
      .filter(employee => calculateEmployeeHours(employee.id) > 0)
      .reduce((sum, employee) => sum + calculateEmployeeHours(employee.id), 0);
    
    // Runde auf eine Dezimalstelle
    return Math.round(total * 10) / 10;
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
          {/* Ladeanimation entfernt, Container beibehalten */}
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

              {/* Kalender */}
              {renderCalendar()}

              {/* Arbeitsstunden Übersicht */}
              <div className="mt-12 mb-6 relative" style={{ minHeight: '200px' }}>
                <h2 className="text-lg font-semibold mb-4">
                  Arbeitsstunden Übersicht - {selectedStore?.name || 'Keine Filiale ausgewählt'}
                </h2>
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mitarbeiter
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stunden
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {employees
                          .filter(employee => calculateEmployeeHours(employee.id) > 0)
                          .sort((a, b) => {
                            const aIndex = employeeOrder.indexOf(a.id);
                            const bIndex = employeeOrder.indexOf(b.id);
                            
                            if (aIndex !== -1 && bIndex !== -1) {
                              return aIndex - bIndex;
                            }
                            
                            return calculateEmployeeHours(b.id) - calculateEmployeeHours(a.id);
                          })
                          .map((employee) => (
                            <tr key={employee.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {employee.firstName} {employee.lastName}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {calculateEmployeeHours(employee.id)}h
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            Gesamt
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            {calculateTotalHoursAll()}h
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
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
          </div>
        </main>
      </div>
    </AuthGuard>
  );
});

export default Arbeitsplan3Page;
