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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<WorkingShift[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lade initiale Daten
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        console.log('Loading initial stores...');
        const loadedStores = await dbService.getStores();
        console.log('Loaded stores:', loadedStores);
        setStores(loadedStores);
        
        if (loadedStores.length > 0 && !selectedStore) {
          console.log('Setting initial store:', loadedStores[0]);
          setSelectedStore(loadedStores[0]);
        }
      } catch (error) {
        console.error('Error loading stores:', error);
        toast.error('Fehler beim Laden der Filialen');
      } finally {
        setIsLoading(false);
      }
    };

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
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
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

  // CSS für flüssigere Übergänge
  const calendarStyles = {
    minHeight: '800px', // oder eine andere feste Höhe
    transition: 'all 0.2s ease-in-out'
  };

  // Optimiere Component Re-Rendering
  const MemoizedDayCell = memo(({ day, assignments }: { day: Date, assignments: ShiftAssignment[] }) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayAssignments = assignments.filter(a => a.date === dayStr);
    
    return (
      <Droppable droppableId={dayStr}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[120px] p-2 rounded border ${
              isToday(day) ? 'bg-blue-50 border-blue-200' : 'bg-white'
            }`}
            onClick={() => handleDateClick(day)}
            style={{ cursor: 'pointer' }}
          >
            <div className="text-sm mb-2">{format(day, 'd')}</div>
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
                      className="mb-1 p-1 text-sm bg-blue-100 rounded"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {`${employee.firstName} ${employee.lastName} - ${shift.title}`}
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  });

  // Optimiere Error Boundary
  const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
      return (
        <div className="text-red-500 p-4">
          Es ist ein Fehler aufgetreten. Bitte laden Sie die Seite neu.
        </div>
      );
    }

    return children;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <div className="p-6">
        {/* Store-Auswahl */}
        <div className="mb-6">
          <select
            value={selectedStore?.id || ''}
            onChange={(e) => {
              const store = stores.find(s => s.id === e.target.value);
              setSelectedStore(store || null);
            }}
            className="w-full max-w-xs rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Filiale auswählen</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        {/* Kalender Navigation */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: de })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousMonth}
              className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              ←
            </button>
            <button
              onClick={handleNextMonth}
              className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              →
            </button>
          </div>
        </div>

        {/* Kalender */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div 
            className="grid grid-cols-7 gap-2"
            style={calendarStyles}
          >
            {/* Wochentage */}
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
              <div key={day} className="text-center font-semibold py-2">
                {day}
              </div>
            ))}

            {/* Kalendertage */}
            {daysInMonth.map((day) => (
              <MemoizedDayCell 
                key={day.toISOString()} 
                day={day} 
                assignments={assignments} 
              />
            ))}
          </div>
        </DragDropContext>

        {/* Schichtzuweisung Modal */}
        <ShiftAssignmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAssignmentSave}
          employees={employees}
          shifts={shifts}
          date={selectedDate || new Date()}
        />
      </div>
    </ErrorBoundary>
  );
}
