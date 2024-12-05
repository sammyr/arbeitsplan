'use client';

import { useState, useEffect, memo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Store } from '@/types/store';
import { Employee } from '@/types/employee';
import { WorkingShift } from '@/types';
import { ShiftAssignment } from '@/types/shift-assignment';
import { dbService } from '@/lib/db';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import ShiftAssignmentModal from '@/components/ShiftAssignmentModal';
import { storage } from '@/lib/storage'; // Korrigiere den Storage-Import
import ReactDOM from 'react-dom';
import { MdPrint, MdPictureAsPdf, MdFileDownload } from 'react-icons/md';
import { initialSelectedStore, initialStores } from '@/lib/initialData';

// Funktion zum Laden der Store-Daten
const loadStoreData = async (
  selectedStore: Store | null,
  setIsLoading: (isLoading: boolean) => void,
  setEmployees: (employees: Employee[]) => void,
  setShifts: (shifts: WorkingShift[]) => void,
  setAssignments: (assignments: ShiftAssignment[]) => void
) => {
  if (!selectedStore) {
    console.log('No store selected, skipping data load');
    return;
  }

  try {
    setIsLoading(true);
    console.log('Loading data for store:', selectedStore);

    // Lade Mitarbeiter, Arbeitsschichten und Zuweisungen parallel
    const [loadedEmployees, loadedAssignments, loadedShifts] = await Promise.all([
      dbService.getEmployees(),
      dbService.getAssignments(selectedStore.id),
      dbService.getWorkingShifts()
    ]);

    console.log('Loaded employees:', loadedEmployees);
    console.log('Loaded working shifts:', loadedShifts);
    console.log('Loaded assignments:', loadedAssignments);

    // Batch-Update der States
    ReactDOM.unstable_batchedUpdates(() => {
      setEmployees(loadedEmployees);
      setShifts(loadedShifts);
      setAssignments(loadedAssignments);
      setIsLoading(false);
    });

    console.log('Store data loaded successfully');
  } catch (error) {
    console.error('Error loading store data:', error);
    toast.error('Fehler beim Laden der Daten');
    setIsLoading(false);
  }
};

export default function Arbeitsplan3Page() {
  // State Management
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // Versuche das gespeicherte Datum zu laden, wenn verfügbar
    if (typeof window !== 'undefined') {
      const savedDate = localStorage.getItem('arbeitsplan3_currentDate');
      if (savedDate) {
        const parsedDate = new Date(savedDate);
        parsedDate.setHours(0, 0, 0, 0);
        return parsedDate;
      }
    }
    // Fallback auf aktuelles Datum
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const [selectedStore, setSelectedStore] = useState<Store | null>(() => {
    // Versuche die gespeicherte Filiale zu laden
    if (typeof window !== 'undefined') {
      const savedStoreId = localStorage.getItem('arbeitsplan3_selectedStore');
      if (savedStoreId) {
        const savedStore = storage.getStores().find(store => store.id === savedStoreId);
        if (savedStore) {
          return savedStore;
        }
      }
    }
    // Fallback auf die Standard-Filiale
    return initialSelectedStore;
  });

  const [stores, setStores] = useState<Store[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<WorkingShift[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ShiftAssignment | null>(null);

  // Speichere das aktuelle Datum bei jeder Änderung
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('arbeitsplan3_currentDate', currentDate.toISOString());
    }
  }, [currentDate]);

  // Speichere die ausgewählte Filiale bei jeder Änderung
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedStore) {
      localStorage.setItem('arbeitsplan3_selectedStore', selectedStore.id);
    }
  }, [selectedStore]);

  // Lade das gespeicherte Datum nur client-seitig
  useEffect(() => {
    const savedDate = localStorage.getItem('arbeitsplan3_currentDate');
    if (savedDate) {
      const parsedDate = new Date(savedDate);
      parsedDate.setHours(0, 0, 0, 0);
      setCurrentDate(parsedDate);
    }
  }, []);

  // Lade initiale Daten
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      console.log('Loading initial stores...');
      // Hole Stores aus dem Storage
      let loadedStores = storage.getStores();
      
      // Wenn keine Stores im Storage sind, initialisiere mit initialStores
      if (loadedStores.length === 0) {
        initialStores.forEach(store => storage.saveStore(store));
        loadedStores = initialStores;
      }
      
      setStores(loadedStores);
      
      // Load selected store from localStorage if available
      const savedStoreId = localStorage.getItem('arbeitsplan3_selectedStore');
      if (savedStoreId) {
        const savedStore = loadedStores.find(store => store.id === savedStoreId);
        if (savedStore) {
          setSelectedStore(savedStore);
          await loadStoreData(savedStore, setIsLoading, setEmployees, setShifts, setAssignments);
        }
      } else if (loadedStores.length > 0) {
        // Wenn kein Store ausgewählt ist, aber Stores vorhanden sind, wähle den ersten
        setSelectedStore(loadedStores[0]);
        await loadStoreData(loadedStores[0], setIsLoading, setEmployees, setShifts, setAssignments);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Fehler beim Laden der Daten');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadStoreData(selectedStore, setIsLoading, setEmployees, setShifts, setAssignments);
  }, [selectedStore]);

  // Kalender-Funktionen
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    newDate.setHours(0, 0, 0, 0);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    newDate.setHours(0, 0, 0, 0);
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    if (!isSameMonth(date, currentDate)) return;
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  // Schicht-Funktionen
  const handleAssignmentSave = async (employeeId: string, shiftId: string, workingHours: number) => {
    if (!selectedStore || !selectedDate) {
      toast.error('Bitte wählen Sie eine Filiale und ein Datum aus');
      return;
    }

    try {
      if (editingAssignment) {
        // Update existing assignment
        const updatedAssignment = {
          ...editingAssignment,
          employeeId,
          shiftId,
          workingHours,
          updatedAt: new Date().toISOString()
        };

        await dbService.updateAssignment(editingAssignment.id, updatedAssignment);
        setAssignments(prev => prev.map(a => 
          a.id === editingAssignment.id ? updatedAssignment : a
        ));

        const employee = employees.find(e => e.id === employeeId);
        const shift = shifts.find(s => s.id === shiftId);

        await dbService.addLogEntry(
          'success',
          `Schicht bearbeitet`,
          {
            mitarbeiter: employee?.firstName || 'Unbekannt',
            schicht: shift?.title || 'Unbekannt',
            stunden: workingHours,
            datum: format(new Date(updatedAssignment.date), 'dd.MM.yyyy'),
            filiale: selectedStore.name
          }
        );

        toast.success('Schicht wurde erfolgreich bearbeitet');
      } else {
        // Create new assignment
        const assignment: Omit<ShiftAssignment, 'id'> = {
          employeeId,
          shiftId,
          storeId: selectedStore.id,
          date: format(selectedDate, 'yyyy-MM-dd'),
          workingHours,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const assignmentId = await dbService.addAssignment(assignment);
        const newAssignment = { ...assignment, id: assignmentId };
        setAssignments(prev => [...prev, newAssignment]);
        
        const employee = employees.find(e => e.id === employeeId);
        const shift = shifts.find(s => s.id === shiftId);
        
        await dbService.addLogEntry(
          'success',
          `Neue Schicht zugewiesen`,
          {
            mitarbeiter: employee?.firstName || 'Unbekannt',
            schicht: shift?.title || 'Unbekannt',
            stunden: workingHours,
            datum: format(selectedDate, 'dd.MM.yyyy'),
            filiale: selectedStore.name
          }
        );
        
        toast.success('Schicht erfolgreich zugewiesen');
      }
      setIsModalOpen(false);
      setEditingAssignment(null);
    } catch (error) {
      console.error('Error saving assignment:', error);
      await dbService.addLogEntry('error', editingAssignment ? 'Fehler beim Bearbeiten der Schicht' : 'Fehler beim Zuweisen der Schicht');
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
      await dbService.addLogEntry(
        'info',
        `Schicht gelöscht`,
        {
          mitarbeiter: employee?.firstName || 'Unbekannt',
          schicht: shift?.title || 'Unbekannt',
          datum: format(new Date(assignment.date), 'dd.MM.yyyy'),
          filiale: selectedStore?.name || 'Unbekannt'
        }
      );
      
      toast.success('Schicht wurde gelöscht');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      await dbService.addLogEntry('error', 'Fehler beim Löschen der Schicht');
      toast.error('Fehler beim Löschen der Schicht');
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    console.log('Drag ended:', result);
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
      await dbService.updateAssignment(draggableId, updatedAssignment);
      
      // Hole Mitarbeiter- und Schichtinformationen für den Log-Eintrag
      const employee = employees.find(e => e.id === assignment.employeeId);
      const shift = shifts.find(s => s.id === assignment.shiftId);
      
      // Erstelle einen Log-Eintrag für die Verschiebung
      await dbService.addLogEntry(
        'info',
        `Schicht verschoben`,
        {
          mitarbeiter: employee?.firstName || 'Unbekannt',
          schicht: shift?.title || 'Unbekannt',
          von: format(new Date(source.droppableId), 'dd.MM.yyyy'),
          nach: format(new Date(destination.droppableId), 'dd.MM.yyyy'),
          filiale: selectedStore.name
        }
      );
      
      console.log('Database update successful');
      toast.success('Schicht wurde verschoben');
    } catch (error) {
      console.error('Error updating assignment:', error);
      await dbService.addLogEntry('error', 'Fehler beim Verschieben der Schicht');
      toast.error('Fehler beim Verschieben der Schicht');
      
      // Nur im Fehlerfall die Daten neu laden
      await loadStoreData(selectedStore, setIsLoading, setEmployees, setShifts, setAssignments);
    }
  };

  // Berechne die Gesamtstunden pro Mitarbeiter für den aktuellen Monat
  const calculateMonthlyHours = () => {
    const monthlyHours: { [key: string]: number } = {};
    
    assignments.forEach(assignment => {
      const assignmentDate = new Date(assignment.date);
      // Prüfe ob die Zuweisung im aktuellen Monat liegt
      if (isSameMonth(assignmentDate, currentDate)) {
        const employeeId = assignment.employeeId;
        monthlyHours[employeeId] = (monthlyHours[employeeId] || 0) + (assignment.workingHours || 0);
      }
    });

    return monthlyHours;
  };

  return (
    <div className="min-h-screen p-6 pb-24"> {/* Erhöhter Abstand am unteren Rand */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-800">
                Arbeitsplan für{' '}
            
                 <span> {selectedStore?.name || ' '} / </span>
               
             
             
                 {format(currentDate, 'MMMM yyyy', { locale: de })}
               </h1>
            </div>
            <select
              className="px-4 py-2.5 text-base border border-slate-200 rounded-lg bg-slate-50 text-slate-700 
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
                hover:border-emerald-300 transition-all"
              value={selectedStore?.id || ''}
              onChange={(e) => {
                const store = stores.find(s => s.id === e.target.value);
                setSelectedStore(store || null);
                // Save selected store ID to localStorage
                if (store) {
                  localStorage.setItem('arbeitsplan3_selectedStore', store.id);
                } else {
                  localStorage.removeItem('arbeitsplan3_selectedStore');
                }
              }}
            >
             
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-semibold text-gray-800 mx-4">
                {format(currentDate, 'MMMM yyyy', { locale: de })}
              </h2>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toast.success('Druckfunktion kommt bald!')}
                className="inline-flex items-center px-4 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <MdPrint className="w-5 h-5 mr-2" />
                Drucken
              </button>
              <button
                onClick={() => toast.success('PDF Export kommt bald!')}
                className="inline-flex items-center px-4 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <MdPictureAsPdf className="w-5 h-5 mr-2" />
                PDF Export
              </button>
              <button
                onClick={() => toast.success('Excel Export kommt bald!')}
                className="inline-flex items-center px-4 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <MdFileDownload className="w-5 h-5 mr-2" />
                Excel Export
              </button>
            </div>
          </div>

          {/* Calendar Container */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg">
            {/* Weekday Headers */}
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
              <div key={day} className="bg-gray-50 p-2 text-center font-medium text-gray-600">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            <DragDropContext onDragEnd={handleDragEnd}>
              {daysInMonth.map((date) => (
                <Droppable key={format(date, 'yyyy-MM-dd')} droppableId={format(date, 'yyyy-MM-dd')}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`
                        min-h-[120px] p-2 bg-white
                        ${!isSameMonth(date, currentDate) ? 'bg-gray-50' : ''}
                        hover:bg-gray-50 transition-colors cursor-pointer
                      `}
                      onClick={() => handleDateClick(date)}
                    >
                      <div className={`
                        text-sm font-medium mb-2
                        ${!isSameMonth(date, currentDate) ? 'text-gray-400' : 'text-gray-700'}
                      `}>
                        {format(date, 'd')}
                      </div>
                      
                      {/* Assignments */}
                      <div className="space-y-1">
                        {assignments
                          .filter(a => a.date === format(date, 'yyyy-MM-dd'))
                          .map((assignment, index) => {
                            const employee = employees.find(e => e.id === assignment.employeeId);
                            const shift = shifts.find(s => s.id === assignment.shiftId);
                            
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
                                          setSelectedDate(new Date(assignment.date));
                                          setIsModalOpen(true);
                                        }}
                                        className="ml-1 p-0.5 text-slate-500 hover:text-slate-700 rounded transition-colors bg-white shadow-sm"
                                        title="Schicht bearbeiten"
                                      >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteAssignment(assignment.id);
                                        }}
                                        className="ml-1 p-0.5 text-slate-500 hover:text-slate-700 rounded transition-colors bg-white shadow-sm"
                                        title="Schicht löschen"
                                      >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                    <div className="p-4 h-20 bg-gradient-to-r from-emerald-50/80 via-emerald-50/90 to-emerald-50/80 text-slate-900 text-xs rounded-md hover:from-emerald-100/90 hover:via-emerald-100 hover:to-emerald-100/90 transition-all border border-emerald-100/50 shadow-sm">
                                      <div className="h-full flex flex-col items-center justify-center">
                                        <span className="text-center">
                                          <strong className="text-slate-900">{employee?.firstName}</strong> {shift?.title}
                                        </span>
                                        <span className="text-center text-slate-600 mt-1">
                                          {assignment.workingHours} Stunden
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                        })}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </DragDropContext>
          </div>
        </div>

        {/* Monatsübersicht der Arbeitsstunden */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Arbeitsstunden Übersicht {format(currentDate, 'MMMM yyyy', { locale: de })}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mitarbeiter
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gesamtstunden
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees
                  .map(employee => ({
                    ...employee,
                    totalHours: calculateMonthlyHours()[employee.id] || 0
                  }))
                  .sort((a, b) => b.totalHours - a.totalHours) // Sortiere nach Stunden absteigend
                  .map(employee => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {employee.totalHours.toFixed(1)} Stunden
                      </td>
                    </tr>
                  ))}
                <tr className="bg-gray-50 font-medium">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Gesamt
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {employees
                      .reduce((total, employee) => total + (calculateMonthlyHours()[employee.id] || 0), 0)
                      .toFixed(1)} Stunden
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <LoadingSpinner />
        </div>
      )}

      {/* Modal */}
      {isModalOpen && selectedDate && (
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
          initialWorkingHours={editingAssignment?.workingHours || 8}
        />
      )}
    </div>
  );
}
