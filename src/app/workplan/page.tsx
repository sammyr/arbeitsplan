'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, ToolbarProps, Event as BigCalendarEvent, View, stringOrDate } from 'react-big-calendar';
import withDragAndDrop, { withDragAndDropProps, EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, addMonths } from 'date-fns';
import { de } from 'date-fns/locale';
import { Employee } from '@/types/employee';
import { Shift } from '@/types/shift';
import { WorkingShift } from '@/types';
import { CalendarEvent } from '@/types/calendar';
import { useStore } from '@/lib/store';
import { dbService } from '@/lib/db';
import { storage } from '@/lib/storage';
import WorkplanForm from './WorkplanForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import AlertBar from '@/components/AlertBar';
import { FaClock, FaUser, FaCalendar } from 'react-icons/fa';
import { Store } from '@/types/store';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

// Custom hook for alert management
const useAlert = () => {
  const [alert, setAlert] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'info'
  });

  const showAlert = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 5000);
  }, []);

  return { alert, showAlert, setAlert };
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { de },
});

const DnDCalendar = withDragAndDrop<CalendarEvent>(Calendar<CalendarEvent>);

const getShiftLabel = (shift: any, employee: Employee | undefined, workingShift: WorkingShift | undefined) => {
  if (!employee) return 'Unbekannter Mitarbeiter';
  if (!workingShift) return `${employee.firstName} ${employee.lastName} - Unbekannte Schicht`;
  return `${employee.firstName} ${employee.lastName} - ${workingShift.title}`;
};

const getShiftType = (workHours: number): string => {
  if (workHours <= 4) return 'Kurzschicht';
  if (workHours <= 6) return 'Teilzeit';
  return 'Vollzeit';
};

const getShiftBackgroundColor = (shift: any) => {
  const shiftType = getShiftType(shift.workHours);
  switch (shiftType) {
    case 'Kurzschicht':
      return 'bg-blue-100 hover:bg-blue-200';
    case 'Teilzeit':
      return 'bg-green-100 hover:bg-green-200';
    case 'Vollzeit':
      return 'bg-purple-100 hover:bg-purple-200';
    default:
      return 'bg-gray-100 hover:bg-gray-200';
  }
};

const WorkplanPage = () => {
  console.log('WorkplanPage rendering');  // Check if component renders

  // All state declarations first
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  console.log('Initial events state:', events);  // Check initial state

  const safeSetEvents = useCallback((newEvents: CalendarEvent[]) => {
    console.log('Setting new events:', {
      count: newEvents.length,
      firstEvent: newEvents[0]
    });
    setEvents(newEvents);
  }, []);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { selectedStore, setSelectedStore } = useStore();
  const [stores, setStores] = useState<Store[]>([]);
  const [date, setDate] = useState(new Date());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [workingShifts, setWorkingShifts] = useState<WorkingShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { alert, showAlert, setAlert } = useAlert();

  // Monitor events changes
  useEffect(() => {
    console.log('Events effect triggered');  // Check if effect runs
    if (!events) {
      console.log('Events is null or undefined');
      return;
    }
    
    console.log('Calendar events changed:', {
      timestamp: new Date().toISOString(),
      eventCount: events.length,
      events: events.map(event => ({
        id: event.id,
        title: event.title,
        date: event.start.toISOString(),
        employeeId: event.employeeId
      }))
    });
  }, [events]);

  // Static messages and formats
  const messages = {
    noStore: 'Bitte wählen Sie zuerst eine Filiale aus',
    noShifts: 'Keine Schichten gefunden',
    loadingShifts: 'Schichten werden geladen...',
    errorLoading: 'Fehler beim Laden der Daten',
    selectStore: 'Filiale auswählen',
  };

  const calendarMessages = {
    previous: 'Letzter Monat',
    next: 'Nächster Monat',
    today: 'Dieser Monat',
    month: 'Monat',
    week: 'Woche',
    day: 'Tag',
    agenda: 'Agenda',
    date: 'Datum',
    time: 'Zeit',
    event: 'Termin',
    allDay: 'Ganztägig',
    noEventsInRange: 'Keine Termine in diesem Zeitraum',
    showMore: (total: any) => `+${total} weitere`,
  };

  const formats = {
    weekdayFormat: (date: Date) => {
      const weekdays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
      return weekdays[date.getDay() === 0 ? 6 : date.getDay() - 1];
    }
  };

  // Data processing functions
  const processShifts = useCallback(async () => {
    console.log('processShifts called');  // Check if function is called
    if (!selectedStore?.id) {
      console.log('No store selected');
      return [];
    }

    try {
      const shifts = await dbService.getShifts(selectedStore.id);
      console.log('Fetched shifts:', shifts.length);  // Check if shifts are fetched
      return shifts.map(shift => {
        const employee = employees.find(e => e.id === shift.employeeId);
        const workingShift = workingShifts.find(ws => ws.id === shift.shiftId);
        
        if (!employee || !workingShift) {
          console.error('Missing data:', { employee, workingShift, shift });
          return null;
        }

        // Konvertiere das Datum korrekt mit Zeitzonen-Berücksichtigung
        const shiftDate = new Date(shift.date);
        const start = new Date(
          shiftDate.getFullYear(),
          shiftDate.getMonth(),
          shiftDate.getDate(),
          0, 0, 0
        );

        return {
          id: shift.id,
          title: getShiftLabel(shift, employee, workingShift),
          start: start,
          end: start,
          employeeId: shift.employeeId,
          shiftId: shift.shiftId,
          storeId: shift.storeId,
          extendedProps: {
            shift: {
              ...shift,
              date: start.toISOString().split('T')[0] // Speichere nur das Datum ohne Zeit
            },
            employee,
            workingShift
          }
        };
      }).filter(Boolean);
    } catch (error) {
      console.error('Error processing shifts:', error);
      showAlert('Fehler beim Laden der Schichten', 'error');
      return [];
    }
  }, [selectedStore?.id, employees, workingShifts, showAlert]);

  const refreshShifts = useCallback(async () => {
    console.log('refreshShifts called');  // Check if refresh is called
    if (!selectedStore) {
      console.log('No store selected, skipping refresh');
      return;
    }

    try {
      console.log('Starting shifts refresh with store:', selectedStore.id);
      
      // Clear existing events first
      console.log('Clearing existing events. Current count:', events.length);
      safeSetEvents([]);  // Use safeSetEvents instead
      
      // Fetch fresh data from database
      const shifts = await dbService.getShifts(selectedStore.id);
      console.log('Fetched shifts from database:', shifts.length);
      
      const processedShifts = shifts.map(shift => {
        const employee = employees.find(e => e.id === shift.employeeId);
        const workingShift = workingShifts.find(ws => ws.id === shift.shiftId);
        
        if (!employee || !workingShift) {
          console.log('Skipping shift due to missing data:', {
            shiftId: shift.id,
            hasEmployee: !!employee,
            hasWorkingShift: !!workingShift
          });
          return null;
        }

        // Ensure consistent date handling by setting time to midnight
        const shiftDate = new Date(shift.date);
        const eventStart = new Date(
          shiftDate.getFullYear(),
          shiftDate.getMonth(),
          shiftDate.getDate(),
          0, 0, 0
        );

        return {
          id: shift.id,
          title: getShiftLabel(shift, employee, workingShift),
          start: eventStart,
          end: eventStart,
          employeeId: shift.employeeId,
          shiftId: shift.shiftId,
          storeId: shift.storeId,
          extendedProps: {
            shift,
            employee,
            workingShift
          }
        };
      }).filter((shift): shift is CalendarEvent => shift !== null);

      console.log('About to set processed shifts:', processedShifts.length);
      safeSetEvents(processedShifts);  // Use safeSetEvents instead
      
    } catch (error) {
      console.error('Error refreshing shifts:', error);
      showAlert('Fehler beim Laden der Schichten', 'error');
    }
  }, [selectedStore, employees, workingShifts, showAlert, events, safeSetEvents]);

  const handleEventDrop = useCallback(async (args: EventInteractionArgs<CalendarEvent>) => {
    console.log('handleEventDrop called');  // Check if function is called
    const { event, start } = args;
    console.log('handleEventDrop called with:', {
      eventId: event.id,
      eventTitle: event.title,
      oldDate: event.start,
      newDate: start,
      currentEvents: events.length
    });

    try {
      // Create a new date at midnight to ensure consistent date handling
      const startDate = typeof start === 'string' ? new Date(start) : start;
      const newDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        0, 0, 0
      );

      console.log('Processing date:', {
        originalDate: start,
        newDateFormatted: newDate,
        isoString: newDate.toISOString(),
        dateOnly: newDate.toISOString().split('T')[0]
      });

      // Update the database first
      const updatedShift: Partial<Shift> = {
        date: newDate.toISOString().split('T')[0],
        employeeId: event.employeeId,
        shiftId: event.shiftId,
        storeId: event.storeId
      };

      console.log('Updating shift in database:', {
        shiftId: event.id,
        updatedData: updatedShift
      });

      // Prevent any state updates until database operation is complete
      await dbService.updateShift(event.id, updatedShift);
      console.log('Database update completed');
      
      // Force a complete refresh of the shifts from the database
      console.log('Starting shifts refresh');
      await refreshShifts();
      console.log('Shifts refresh completed');
      
    } catch (error) {
      console.error('Error updating shift:', error);
      showAlert('Fehler beim Verschieben der Schicht', 'error');
      // Force refresh to ensure UI is in sync with database
      console.log('Error occurred, forcing refresh');
      await refreshShifts();
    }
  }, [refreshShifts, showAlert, events]);

  const handleEventResize = useCallback(async (args: EventInteractionArgs<CalendarEvent>) => {
    console.log('handleEventResize called');  // Check if function is called
    const { event, start } = args;
    try {
      // Verhindere das sofortige Update des UI
      const startDate = typeof start === 'string' ? new Date(start) : start;
      const newDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        0, 0, 0
      );

      console.log('Processing date:', {
        originalDate: start,
        newDateFormatted: newDate,
        isoString: newDate.toISOString(),
        dateOnly: newDate.toISOString().split('T')[0]
      });

      // Update the database first
      const updatedShift: Partial<Shift> = {
        date: newDate.toISOString().split('T')[0],
        employeeId: event.employeeId,
        shiftId: event.shiftId,
        storeId: event.storeId
      };

      console.log('Updating shift in database:', {
        shiftId: event.id,
        updatedData: updatedShift
      });

      // Prevent any state updates until database operation is complete
      await dbService.updateShift(event.id, updatedShift);
      console.log('Database update completed');
      
      // Force a complete refresh of the shifts from the database
      console.log('Starting shifts refresh');
      await refreshShifts();
      console.log('Shifts refresh completed');
      
    } catch (error) {
      console.error('Error updating shift:', error);
      showAlert('Fehler beim Anpassen der Schicht', 'error');
      // Force refresh to ensure UI is in sync with database
      console.log('Error occurred, forcing refresh');
      await refreshShifts();
    }
  }, [refreshShifts, showAlert, events]);

  // Custom Toolbar Component
  const CustomToolbar = useCallback(({ onNavigate, date }: ToolbarProps<CalendarEvent>) => {
    console.log('CustomToolbar rendering');  // Check if component renders
    const handleNavigateClick = (action: 'PREV' | 'NEXT' | 'TODAY') => {
      console.log('Navigation clicked:', action);
      let newDate = new Date(date);
      
      switch (action) {
        case 'PREV':
          newDate = addMonths(date, -1);
          break;
        case 'NEXT':
          newDate = addMonths(date, 1);
          break;
        case 'TODAY':
          newDate = new Date();
          break;
      }
      
      onNavigate(action);
      setDate(newDate);
      refreshShifts();
    };

    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <button 
            type="button" 
            onClick={() => handleNavigateClick('PREV')}
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {calendarMessages.previous}
          </button>
          <button 
            type="button" 
            onClick={() => handleNavigateClick('TODAY')}
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {calendarMessages.today}
          </button>
          <button 
            type="button" 
            onClick={() => handleNavigateClick('NEXT')}
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-r-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {calendarMessages.next}
          </button>
        </span>
        <span className="rbc-toolbar-label text-lg font-semibold">
          {date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        </span>
      </div>
    );
  }, [calendarMessages, setDate, refreshShifts]);

  // Callback functions
  const handleNavigate = useCallback((newDate: Date) => {
    console.log('handleNavigate called');  // Check if function is called
    setDate(newDate);
  }, []);

  const handleSelectStore = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('handleSelectStore called');  // Check if function is called
    const storeId = e.target.value;
    const store = stores.find(s => s.id === storeId);
    setSelectedStore(store || null);
  }, [stores, setSelectedStore]);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    console.log('handleEventClick called');  // Check if function is called
    if (!selectedStore) {
      console.log('No store selected');
      return;
    }

    // Find the shift data
    const shift = event.extendedProps.shift;
    if (!shift) {
      console.error('No shift data found in event');
      return;
    }

    // Find the employee and working shift
    const employee = employees.find(e => e.id === shift.employeeId);
    const workingShift = workingShifts.find(ws => ws.id === shift.shiftId);

    if (!employee || !workingShift) {
      console.error('Missing data:', { employee, workingShift, shift });
      return;
    }

    const title = `${employee.firstName} ${employee.lastName} - ${workingShift.title}`;
    
    setSelectedEvent({
      id: shift.id,
      title: title,
      start: event.start!,
      end: event.end!,
      employeeId: shift.employeeId,
      shiftId: shift.shiftId,
      storeId: shift.storeId,
      extendedProps: {
        shift,
        employee,
        workingShift
      },
      shift,
      employee,
      workingShift
    });
    
    setSelectedDate(event.start!);
    setIsFormOpen(true);
  }, [selectedStore, employees, workingShifts, setSelectedEvent, setSelectedDate, setIsFormOpen]);

  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    console.log('handleSelectSlot called');  // Check if function is called
    console.log('Selected slot:', start);
    setSelectedDate(start);
    setSelectedEvent(null);
    setIsFormOpen(true);
  }, [setSelectedDate, setSelectedEvent, setIsFormOpen]);

  const handleCloseForm = useCallback(() => {
    console.log('handleCloseForm called');  // Check if function is called
    setIsFormOpen(false);
    setSelectedEvent(null);
    setSelectedDate(null);
    refreshShifts();
  }, [setIsFormOpen, setSelectedEvent, setSelectedDate]);

  const handleDeleteShift = useCallback(async (shiftId: string) => {
    console.log('handleDeleteShift called');  // Check if function is called
    try {
      await dbService.deleteShift(shiftId);
      await refreshShifts();
    } catch (error) {
      console.error('Error deleting shift:', error);
      showAlert('Fehler beim Löschen der Schicht', 'error');
    }
  }, [showAlert]);

  const getEventContent = useCallback(({ event, title }: { event: CalendarEvent, title: string }) => (
    <div
      style={{
        backgroundColor: getShiftBackgroundColor(event.extendedProps.shift),
        padding: '2px 5px',
        borderRadius: '4px',
        fontSize: '0.875rem'
      }}
    >
      <div className="font-medium">{title}</div>
      <div className="text-sm">
        {event.extendedProps.employee.firstName} {event.extendedProps.employee.lastName}
      </div>
    </div>
  ), []);

  const eventPropGetter = useCallback((event: CalendarEvent) => ({
    className: 'draggable-event',
    style: {
      backgroundColor: getShiftBackgroundColor(event.extendedProps.shift),
      border: '1px solid rgba(0,0,0,0.1)',
      padding: '2px 5px',
      cursor: 'move'
    }
  }), []);

  const dayPropGetter = useCallback((date: Date) => ({
    className: date.getDay() === 0 || date.getDay() === 6 ? 'weekend-day' : '',
    style: {
      backgroundColor: date.getDay() === 0 || date.getDay() === 6 ? '#f9fafb' : 'white'
    }
  }), []);

  const handleShiftUpdate = useCallback(async (oldShift: any, newShiftData: any, newWorkingShift: any) => {
    console.log('handleShiftUpdate called');  // Check if function is called
    try {
      // Validate input data
      if (!oldShift?.id || !newShiftData || !newWorkingShift) {
        throw new Error('Ungültige Daten für die Aktualisierung der Schicht');
      }

      // Create the updated shift data
      const updatedShift = {
        ...oldShift,
        employeeId: newShiftData.employeeId,
        shiftId: newShiftData.shiftId,
        date: newShiftData.date,
        storeId: selectedStore?.id
      };

      // Update in database
      await dbService.updateShift(oldShift.id, updatedShift);

      // Find the employee and working shift for the updated event
      const employee = employees.find(e => e.id === newShiftData.employeeId);
      const workingShift = workingShifts.find(ws => ws.id === newShiftData.shiftId);

      if (!employee || !workingShift) {
        throw new Error('Mitarbeiter oder Schicht nicht gefunden');
      }

      // Update the events state
      const shiftDate = new Date(newShiftData.date);

      setEvents(prevEvents =>
        prevEvents.map(event => {
          if (event.id === oldShift.id) {
            return {
              ...event,
              title: getShiftLabel(updatedShift, employee, workingShift),
              start: shiftDate,
              end: shiftDate,
              employeeId: newShiftData.employeeId,
              shiftId: newShiftData.shiftId,
              extendedProps: {
                shift: updatedShift,
                employee,
                workingShift
              }
            };
          }
          return event;
        })
      );

      showAlert('Schicht wurde erfolgreich aktualisiert', 'success');
    } catch (error) {
      console.error('Error updating shift:', error);
      showAlert('Fehler beim Aktualisieren der Schicht: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'), 'error');
      throw error; // Re-throw to be handled by the form
    }
  }, [selectedStore, employees, workingShifts, setEvents, showAlert]);

  const handleCreateShift = useCallback(async (shiftData: { 
    employeeId: string; 
    shiftId: string; 
    startTime: string; 
    endTime: string;
    date: string;
  }) => {
    console.log('handleCreateShift called');  // Check if function is called
    try {
      if (!selectedStore) {
        throw new Error('Kein Geschäft ausgewählt');
      }

      // Find the employee and shift first
      const employee = employees.find(e => e.id === shiftData.employeeId);
      const shift = workingShifts.find(s => s.id === shiftData.shiftId);

      if (!employee || !shift) {
        throw new Error('Mitarbeiter oder Schicht nicht gefunden');
      }

      // Create new shift
      const newShift = {
        title: `${employee.firstName} ${employee.lastName} - ${shift.title}`,
        startTime: shiftData.startTime,
        endTime: shiftData.endTime
      };

      const createdShift = await dbService.addShift(newShift);
      console.log('Created shift:', createdShift);

      // Create the calendar event
      const shiftDate = new Date(shiftData.date);

      const newEvent: CalendarEvent = {
        id: createdShift.id,
        title: getShiftLabel(createdShift, employee, shift),
        start: shiftDate,
        end: shiftDate,
        employeeId: createdShift.employeeId,
        shiftId: createdShift.shiftId,
        storeId: createdShift.storeId,
        extendedProps: {
          shift: createdShift,
          employee,
          workingShift: shift
        },
        shift: createdShift,
        employee,
        workingShift: shift
      };

      setEvents(prev => [...prev, newEvent]);
      showAlert('Neue Schicht wurde erstellt', 'success');
    } catch (error) {
      console.error('Error creating shift:', error);
      showAlert('Fehler beim Erstellen der Schicht: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'), 'error');
      throw error;
    }
  }, [selectedStore, employees, workingShifts, setEvents, showAlert]);

  const calendarOptions = useMemo(() => ({
    defaultView: 'month' as View,
    views: ['month'] as View[],
    selectable: true,
    resizable: true,
    events,
    date: date,
    onNavigate: handleNavigate,
    onSelectSlot: handleSelectSlot,
    onEventDrop: handleEventDrop,
    onEventResize: handleEventResize,
    onSelectEvent: handleEventClick,
    eventPropGetter,
    dayPropGetter,
    components: {
      event: getEventContent,
      toolbar: CustomToolbar,
    },
    style: { height: 'calc(100vh - 8rem)' },
    localizer,
    // Neue Optionen für bessere Drag & Drop Handhabung
    draggableAccessor: () => true,
    resizableAccessor: () => true,
    step: 60,
    timeslots: 1,
    longPressThreshold: 250,
    onDragStart: () => {
      // Setze einen CSS-Klasse für den Drag-Zustand
      document.body.classList.add('dragging-event');
    },
    onDragEnd: () => {
      // Entferne die CSS-Klasse nach dem Drag
      document.body.classList.remove('dragging-event');
    }
  }), [
    date,
    events,
    handleNavigate,
    handleSelectSlot,
    handleEventDrop,
    handleEventResize,
    handleEventClick,
    eventPropGetter,
    dayPropGetter,
    getEventContent,
  ]);

  const memoizedEmployeeMap = useMemo(() => {
    return new Map(employees.map(e => [e.id, e]));
  }, [employees]);

  const memoizedShiftMap = useMemo(() => {
    return new Map(workingShifts.map(ws => [ws.id, ws]));
  }, [workingShifts]);

  useEffect(() => {
    console.log('useEffect called');  // Check if effect is called
    let isMounted = true;

    const fetchInitialData = async () => {
      try {
        // Load stores
        const loadedStores = await dbService.getStores();
        if (isMounted) {
          setStores(loadedStores);
        }

        // Load employees
        const loadedEmployees = await dbService.getEmployees();
        if (isMounted) {
          setEmployees(loadedEmployees);
        }

        // Load working shifts from storage
        const loadedWorkingShifts = await storage.getShifts();
        if (isMounted) {
          setWorkingShifts(loadedWorkingShifts);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        if (isMounted) {
          showAlert('Fehler beim Laden der Daten', 'error');
        }
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [showAlert]); // Only run once on mount

  useEffect(() => {
    console.log('useEffect called');  // Check if effect is called
    let isMounted = true;

    const loadShifts = async () => {
      if (!selectedStore?.id || !isMounted) return;

      try {
        setIsLoading(true);
        const loadedShifts = await dbService.getShifts(selectedStore.id);
        if (!isMounted) return;

        setShifts(loadedShifts);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading shifts:', error);
        if (isMounted) {
          showAlert('Fehler beim Laden der Schichten', 'error');
        }
        setIsLoading(false);
      }
    };

    loadShifts();

    return () => {
      isMounted = false;
    };
  }, [selectedStore?.id, showAlert]);

  const transformShiftsToEvents = useCallback((shifts: Shift[]): CalendarEvent[] => {
    return shifts.map(shift => {
      const employee = employees.find(e => e.id === shift.employeeId);
      const workingShift = workingShifts.find(ws => ws.id === shift.shiftId);

      if (!employee || !workingShift) {
        console.error('Missing data:', { employee, workingShift, shift });
        return null;
      }

      const shiftDate = new Date(shift.date);
      const title = getShiftLabel(shift, employee, workingShift);

      return {
        id: shift.id,
        title,
        start: shiftDate,
        end: shiftDate,
        employeeId: shift.employeeId,
        shiftId: shift.shiftId,
        storeId: shift.storeId,
        extendedProps: {
          shift,
          employee,
          workingShift
        },
        shift,
        employee,
        workingShift
      };
    }).filter((event): event is CalendarEvent => event !== null);
  }, [selectedStore?.id, employees, workingShifts]);

  useEffect(() => {
    console.log('useEffect called');  // Check if effect is called
    let isMounted = true;

    const loadShifts = async () => {
      if (!selectedStore?.id || !isMounted) return;

      try {
        setIsLoading(true);
        const loadedShifts = await dbService.getShifts(selectedStore.id);
        if (!isMounted) return;

        const processedEvents = transformShiftsToEvents(loadedShifts);
        setEvents(processedEvents);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading shifts:', error);
        if (isMounted) {
          showAlert('Fehler beim Laden der Schichten', 'error');
        }
        setIsLoading(false);
      }
    };

    loadShifts();

    return () => {
      isMounted = false;
    };
  }, [selectedStore?.id, transformShiftsToEvents, showAlert]);

  return (
    <div className="h-full p-4 bg-gray-50 max-w-[95vw] mx-auto">
      <style jsx global>{`
        .draggable-event {
          cursor: move !important;
          user-select: none;
        }
        .rbc-event {
          z-index: 1;
          pointer-events: auto !important;
        }
        .rbc-event.rbc-selected {
          z-index: 2;
        }
        .dragging-event .rbc-event:not(.rbc-selected) {
          pointer-events: none !important;
        }
        .rbc-calendar {
          min-height: 600px;
        }
      `}</style>

      {/* Store Selection Dropdown */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <label htmlFor="store-select" className="text-gray-700 font-medium">
            Filiale:
          </label>
          <select
            id="store-select"
            value={selectedStore?.id || ''}
            onChange={handleSelectStore}
            className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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

      {alert.show && (
        <AlertBar
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(prev => ({ ...prev, show: false }))}
        />
      )}

      {!selectedStore ? (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">Bitte wählen Sie eine Filiale aus</p>
            <p className="text-gray-500">Verwenden Sie die Dropdown-Liste oben, um eine Filiale auszuwählen</p>
          </div>
        </div>
      ) : (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm">
              <LoadingSpinner />
            </div>
          ) : (
            <DnDCalendar
              {...calendarOptions}
            />
          )}

          {isFormOpen && selectedStore && (
            <WorkplanForm
              isOpen={isFormOpen}
              event={selectedEvent}
              storeId={selectedStore.id}
              onClose={handleCloseForm}
              selectedDate={selectedDate}
              onCreate={handleCreateShift}
              onUpdate={handleShiftUpdate}
            />
          )}
        </>
      )}
    </div>
  );
};

export default WorkplanPage;
