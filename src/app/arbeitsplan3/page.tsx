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

  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<WorkingShift[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Speichere das aktuelle Datum bei jeder Änderung
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('arbeitsplan3_currentDate', currentDate.toISOString());
    }
  }, [currentDate]);

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
      const loadedStores = storage.getStores();
      setStores(loadedStores);
      
      // Load selected store from localStorage if available
      const savedStoreId = localStorage.getItem('arbeitsplan3_selectedStore');
      if (savedStoreId) {
        const savedStore = loadedStores.find(store => store.id === savedStoreId);
        if (savedStore) {
          setSelectedStore(savedStore);
          await loadStoreData(savedStore, setIsLoading, setEmployees, setShifts, setAssignments);
        }
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
  const handleAssignmentSave = async (employeeId: string, shiftId: string) => {
    if (!selectedStore || !selectedDate) {
      toast.error('Bitte wählen Sie eine Filiale und ein Datum aus');
      return;
    }

    try {
      const assignment: Omit<ShiftAssignment, 'id'> = {
        employeeId,
        shiftId,
        storeId: selectedStore.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const assignmentId = await dbService.addAssignment(assignment);
      const newAssignment = { ...assignment, id: assignmentId };
      setAssignments(prev => [...prev, newAssignment]);
      
      toast.success('Schicht erfolgreich zugewiesen');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast.error('Fehler beim Speichern der Zuweisung');
    }
  };

  // Funktion zum Löschen einer Schichtzuweisung
  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      await dbService.deleteAssignment(assignmentId);
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      toast.success('Schicht wurde gelöscht');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Fehler beim Löschen der Schicht');
    }
  };

  // Drag & Drop Handler
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

    // Wenn die Zuweisung am gleichen Tag bleibt, nichts tun
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
      console.log('Database update successful');
      
      toast.success('Schicht wurde verschoben');
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Fehler beim Verschieben der Schicht');
      
      // Nur im Fehlerfall die Daten neu laden
      await loadStoreData(selectedStore, setIsLoading, setEmployees, setShifts, setAssignments);
    }
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
              <option value="">Filiale auswählen</option>
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

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg ">
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
                                    className="group relative p-1.5 bg-gradient-to-r from-emerald-50/80 via-emerald-50/90 to-emerald-50/80 text-slate-900 text-xs rounded-md hover:from-emerald-100/90 hover:via-emerald-100 hover:to-emerald-100/90 transition-all border border-emerald-100/50 shadow-sm"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>
                                       <strong className="text-slate-900">{employee?.firstName}</strong>   {shift?.title}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteAssignment(assignment.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 text-slate-500 hover:text-slate-700 rounded transition-opacity"
                                        title="Schicht löschen"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
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
          onClose={() => setIsModalOpen(false)}
          onSave={handleAssignmentSave}
          employees={employees}
          shifts={shifts}
          date={selectedDate}
        />
      )}
    </div>
  );
}
