"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_big_calendar_1 = require("react-big-calendar");
const dragAndDrop_1 = __importDefault(require("react-big-calendar/lib/addons/dragAndDrop"));
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const store_1 = require("@/lib/store");
const db_1 = require("@/lib/db");
const storage_1 = require("@/lib/storage");
const WorkplanForm_1 = __importDefault(require("./WorkplanForm"));
const LoadingSpinner_1 = __importDefault(require("@/components/LoadingSpinner"));
const AlertBar_1 = __importDefault(require("@/components/AlertBar"));
require("react-big-calendar/lib/css/react-big-calendar.css");
require("react-big-calendar/lib/addons/dragAndDrop/styles.css");
// Custom hook for alert management
const useAlert = () => {
    const [alert, setAlert] = (0, react_1.useState)({
        show: false,
        message: '',
        type: 'info'
    });
    const showAlert = (0, react_1.useCallback)((message, type = 'info') => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert(prev => (Object.assign(Object.assign({}, prev), { show: false }))), 5000);
    }, []);
    return { alert, showAlert, setAlert };
};
const localizer = (0, react_big_calendar_1.dateFnsLocalizer)({
    format: date_fns_1.format,
    parse: date_fns_1.parse,
    startOfWeek: (date) => (0, date_fns_1.startOfWeek)(date, { weekStartsOn: 1 }),
    getDay: date_fns_1.getDay,
    locales: { de: locale_1.de },
});
const DnDCalendar = (0, dragAndDrop_1.default)((react_big_calendar_1.Calendar));
const getShiftLabel = (shift, employee, workingShift) => {
    if (!employee)
        return 'Unbekannter Mitarbeiter';
    if (!workingShift)
        return `${employee.firstName} ${employee.lastName} - Unbekannte Schicht`;
    return `${employee.firstName} ${employee.lastName} - ${workingShift.title}`;
};
const getShiftType = (workHours) => {
    if (workHours <= 4)
        return 'Kurzschicht';
    if (workHours <= 6)
        return 'Teilzeit';
    return 'Vollzeit';
};
const getShiftBackgroundColor = (shift) => {
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
    console.log('WorkplanPage rendering'); // Check if component renders
    // All state declarations first
    const [events, setEvents] = (0, react_1.useState)([]);
    console.log('Initial events state:', events); // Check initial state
    const safeSetEvents = (0, react_1.useCallback)((newEvents) => {
        console.log('Setting new events:', {
            count: newEvents.length,
            firstEvent: newEvents[0]
        });
        setEvents(newEvents);
    }, []);
    const [selectedEvent, setSelectedEvent] = (0, react_1.useState)(null);
    const [isFormOpen, setIsFormOpen] = (0, react_1.useState)(false);
    const [employees, setEmployees] = (0, react_1.useState)([]);
    const [selectedDate, setSelectedDate] = (0, react_1.useState)(null);
    const { selectedStore, setSelectedStore } = (0, store_1.useStore)();
    const [stores, setStores] = (0, react_1.useState)([]);
    const [date, setDate] = (0, react_1.useState)(new Date());
    const [shifts, setShifts] = (0, react_1.useState)([]);
    const [workingShifts, setWorkingShifts] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const { alert, showAlert, setAlert } = useAlert();
    // Monitor events changes
    (0, react_1.useEffect)(() => {
        console.log('Events effect triggered'); // Check if effect runs
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
        showMore: (total) => `+${total} weitere`,
    };
    const formats = {
        weekdayFormat: (date) => {
            const weekdays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
            return weekdays[date.getDay() === 0 ? 6 : date.getDay() - 1];
        }
    };
    // Data processing functions
    const processShifts = (0, react_1.useCallback)(async () => {
        console.log('processShifts called'); // Check if function is called
        if (!(selectedStore === null || selectedStore === void 0 ? void 0 : selectedStore.id)) {
            console.log('No store selected');
            return [];
        }
        try {
            const shifts = await db_1.dbService.getShifts(selectedStore.id);
            console.log('Fetched shifts:', shifts.length); // Check if shifts are fetched
            return shifts.map(shift => {
                const employee = employees.find(e => e.id === shift.employeeId);
                const workingShift = workingShifts.find(ws => ws.id === shift.shiftId);
                if (!employee || !workingShift) {
                    console.error('Missing data:', { employee, workingShift, shift });
                    return null;
                }
                // Konvertiere das Datum korrekt mit Zeitzonen-Berücksichtigung
                const shiftDate = new Date(shift.date);
                const start = new Date(shiftDate.getFullYear(), shiftDate.getMonth(), shiftDate.getDate(), 0, 0, 0);
                return {
                    id: shift.id,
                    title: getShiftLabel(shift, employee, workingShift),
                    start: start,
                    end: start,
                    employeeId: shift.employeeId,
                    shiftId: shift.shiftId,
                    storeId: shift.storeId,
                    extendedProps: {
                        shift: Object.assign(Object.assign({}, shift), { date: start.toISOString().split('T')[0] // Speichere nur das Datum ohne Zeit
                         }),
                        employee,
                        workingShift
                    }
                };
            }).filter(Boolean);
        }
        catch (error) {
            console.error('Error processing shifts:', error);
            showAlert('Fehler beim Laden der Schichten', 'error');
            return [];
        }
    }, [selectedStore === null || selectedStore === void 0 ? void 0 : selectedStore.id, employees, workingShifts, showAlert]);
    const refreshShifts = (0, react_1.useCallback)(async () => {
        console.log('refreshShifts called'); // Check if refresh is called
        if (!selectedStore) {
            console.log('No store selected, skipping refresh');
            return;
        }
        try {
            console.log('Starting shifts refresh with store:', selectedStore.id);
            // Clear existing events first
            console.log('Clearing existing events. Current count:', events.length);
            safeSetEvents([]); // Use safeSetEvents instead
            // Fetch fresh data from database
            const shifts = await db_1.dbService.getShifts(selectedStore.id);
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
                const eventStart = new Date(shiftDate.getFullYear(), shiftDate.getMonth(), shiftDate.getDate(), 0, 0, 0);
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
            }).filter((shift) => shift !== null);
            console.log('About to set processed shifts:', processedShifts.length);
            safeSetEvents(processedShifts); // Use safeSetEvents instead
        }
        catch (error) {
            console.error('Error refreshing shifts:', error);
            showAlert('Fehler beim Laden der Schichten', 'error');
        }
    }, [selectedStore, employees, workingShifts, showAlert, events, safeSetEvents]);
    const handleEventDrop = (0, react_1.useCallback)(async (args) => {
        console.log('handleEventDrop called'); // Check if function is called
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
            const newDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);
            console.log('Processing date:', {
                originalDate: start,
                newDateFormatted: newDate,
                isoString: newDate.toISOString(),
                dateOnly: newDate.toISOString().split('T')[0]
            });
            // Update the database first
            const updatedShift = {
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
            await db_1.dbService.updateShift(event.id, updatedShift);
            console.log('Database update completed');
            // Force a complete refresh of the shifts from the database
            console.log('Starting shifts refresh');
            await refreshShifts();
            console.log('Shifts refresh completed');
        }
        catch (error) {
            console.error('Error updating shift:', error);
            showAlert('Fehler beim Verschieben der Schicht', 'error');
            // Force refresh to ensure UI is in sync with database
            console.log('Error occurred, forcing refresh');
            await refreshShifts();
        }
    }, [refreshShifts, showAlert, events]);
    const handleEventResize = (0, react_1.useCallback)(async (args) => {
        console.log('handleEventResize called'); // Check if function is called
        const { event, start } = args;
        try {
            // Verhindere das sofortige Update des UI
            const startDate = typeof start === 'string' ? new Date(start) : start;
            const newDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);
            console.log('Processing date:', {
                originalDate: start,
                newDateFormatted: newDate,
                isoString: newDate.toISOString(),
                dateOnly: newDate.toISOString().split('T')[0]
            });
            // Update the database first
            const updatedShift = {
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
            await db_1.dbService.updateShift(event.id, updatedShift);
            console.log('Database update completed');
            // Force a complete refresh of the shifts from the database
            console.log('Starting shifts refresh');
            await refreshShifts();
            console.log('Shifts refresh completed');
        }
        catch (error) {
            console.error('Error updating shift:', error);
            showAlert('Fehler beim Anpassen der Schicht', 'error');
            // Force refresh to ensure UI is in sync with database
            console.log('Error occurred, forcing refresh');
            await refreshShifts();
        }
    }, [refreshShifts, showAlert, events]);
    // Custom Toolbar Component
    const CustomToolbar = (0, react_1.useCallback)(({ onNavigate, date }) => {
        console.log('CustomToolbar rendering'); // Check if component renders
        const handleNavigateClick = (action) => {
            console.log('Navigation clicked:', action);
            let newDate = new Date(date);
            switch (action) {
                case 'PREV':
                    newDate = (0, date_fns_1.addMonths)(date, -1);
                    break;
                case 'NEXT':
                    newDate = (0, date_fns_1.addMonths)(date, 1);
                    break;
                case 'TODAY':
                    newDate = new Date();
                    break;
            }
            onNavigate(action);
            setDate(newDate);
            refreshShifts();
        };
        return (<div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <button type="button" onClick={() => handleNavigateClick('PREV')} className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            {calendarMessages.previous}
          </button>
          <button type="button" onClick={() => handleNavigateClick('TODAY')} className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            {calendarMessages.today}
          </button>
          <button type="button" onClick={() => handleNavigateClick('NEXT')} className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-r-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            {calendarMessages.next}
          </button>
        </span>
        <span className="rbc-toolbar-label text-lg font-semibold">
          {date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        </span>
      </div>);
    }, [calendarMessages, setDate, refreshShifts]);
    // Callback functions
    const handleNavigate = (0, react_1.useCallback)((newDate) => {
        console.log('handleNavigate called'); // Check if function is called
        setDate(newDate);
    }, []);
    const handleSelectStore = (0, react_1.useCallback)((e) => {
        console.log('handleSelectStore called'); // Check if function is called
        const storeId = e.target.value;
        const store = stores.find(s => s.id === storeId);
        setSelectedStore(store || null);
    }, [stores, setSelectedStore]);
    const handleEventClick = (0, react_1.useCallback)((event) => {
        console.log('handleEventClick called'); // Check if function is called
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
            start: event.start,
            end: event.end,
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
        setSelectedDate(event.start);
        setIsFormOpen(true);
    }, [selectedStore, employees, workingShifts, setSelectedEvent, setSelectedDate, setIsFormOpen]);
    const handleSelectSlot = (0, react_1.useCallback)(({ start }) => {
        console.log('handleSelectSlot called'); // Check if function is called
        console.log('Selected slot:', start);
        setSelectedDate(start);
        setSelectedEvent(null);
        setIsFormOpen(true);
    }, [setSelectedDate, setSelectedEvent, setIsFormOpen]);
    const handleCloseForm = (0, react_1.useCallback)(() => {
        console.log('handleCloseForm called'); // Check if function is called
        setIsFormOpen(false);
        setSelectedEvent(null);
        setSelectedDate(null);
        refreshShifts();
    }, [setIsFormOpen, setSelectedEvent, setSelectedDate]);
    const handleDeleteShift = (0, react_1.useCallback)(async (shiftId) => {
        console.log('handleDeleteShift called'); // Check if function is called
        try {
            await db_1.dbService.deleteShift(shiftId);
            await refreshShifts();
        }
        catch (error) {
            console.error('Error deleting shift:', error);
            showAlert('Fehler beim Löschen der Schicht', 'error');
        }
    }, [showAlert]);
    const getEventContent = (0, react_1.useCallback)(({ event, title }) => (<div style={{
            backgroundColor: getShiftBackgroundColor(event.extendedProps.shift),
            padding: '2px 5px',
            borderRadius: '4px',
            fontSize: '0.875rem'
        }}>
      <div className="font-medium">{title}</div>
      <div className="text-sm">
        {event.extendedProps.employee.firstName} {event.extendedProps.employee.lastName}
      </div>
    </div>), []);
    const eventPropGetter = (0, react_1.useCallback)((event) => ({
        className: 'draggable-event',
        style: {
            backgroundColor: getShiftBackgroundColor(event.extendedProps.shift),
            border: '1px solid rgba(0,0,0,0.1)',
            padding: '2px 5px',
            cursor: 'move'
        }
    }), []);
    const dayPropGetter = (0, react_1.useCallback)((date) => ({
        className: date.getDay() === 0 || date.getDay() === 6 ? 'weekend-day' : '',
        style: {
            backgroundColor: date.getDay() === 0 || date.getDay() === 6 ? '#f9fafb' : 'white'
        }
    }), []);
    const handleShiftUpdate = (0, react_1.useCallback)(async (oldShift, newShiftData, newWorkingShift) => {
        console.log('handleShiftUpdate called'); // Check if function is called
        try {
            // Validate input data
            if (!(oldShift === null || oldShift === void 0 ? void 0 : oldShift.id) || !newShiftData || !newWorkingShift) {
                throw new Error('Ungültige Daten für die Aktualisierung der Schicht');
            }
            // Create the updated shift data
            const updatedShift = Object.assign(Object.assign({}, oldShift), { employeeId: newShiftData.employeeId, shiftId: newShiftData.shiftId, date: newShiftData.date, storeId: selectedStore === null || selectedStore === void 0 ? void 0 : selectedStore.id });
            // Update in database
            await db_1.dbService.updateShift(oldShift.id, updatedShift);
            // Find the employee and working shift for the updated event
            const employee = employees.find(e => e.id === newShiftData.employeeId);
            const workingShift = workingShifts.find(ws => ws.id === newShiftData.shiftId);
            if (!employee || !workingShift) {
                throw new Error('Mitarbeiter oder Schicht nicht gefunden');
            }
            // Update the events state
            const shiftDate = new Date(newShiftData.date);
            setEvents(prevEvents => prevEvents.map(event => {
                if (event.id === oldShift.id) {
                    return Object.assign(Object.assign({}, event), { title: getShiftLabel(updatedShift, employee, workingShift), start: shiftDate, end: shiftDate, employeeId: newShiftData.employeeId, shiftId: newShiftData.shiftId, extendedProps: {
                            shift: updatedShift,
                            employee,
                            workingShift
                        } });
                }
                return event;
            }));
            showAlert('Schicht wurde erfolgreich aktualisiert', 'success');
        }
        catch (error) {
            console.error('Error updating shift:', error);
            showAlert('Fehler beim Aktualisieren der Schicht: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'), 'error');
            throw error; // Re-throw to be handled by the form
        }
    }, [selectedStore, employees, workingShifts, setEvents, showAlert]);
    const handleCreateShift = (0, react_1.useCallback)(async (shiftData) => {
        console.log('handleCreateShift called'); // Check if function is called
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
            const createdShift = await db_1.dbService.addShift(newShift);
            console.log('Created shift:', createdShift);
            // Create the calendar event
            const shiftDate = new Date(shiftData.date);
            const newEvent = {
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
        }
        catch (error) {
            console.error('Error creating shift:', error);
            showAlert('Fehler beim Erstellen der Schicht: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'), 'error');
            throw error;
        }
    }, [selectedStore, employees, workingShifts, setEvents, showAlert]);
    const calendarOptions = (0, react_1.useMemo)(() => ({
        defaultView: 'month',
        views: ['month'],
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
    const memoizedEmployeeMap = (0, react_1.useMemo)(() => {
        return new Map(employees.map(e => [e.id, e]));
    }, [employees]);
    const memoizedShiftMap = (0, react_1.useMemo)(() => {
        return new Map(workingShifts.map(ws => [ws.id, ws]));
    }, [workingShifts]);
    (0, react_1.useEffect)(() => {
        console.log('useEffect called'); // Check if effect is called
        let isMounted = true;
        const fetchInitialData = async () => {
            try {
                // Load stores
                const loadedStores = await db_1.dbService.getStores();
                if (isMounted) {
                    setStores(loadedStores);
                }
                // Load employees
                const loadedEmployees = await db_1.dbService.getEmployees();
                if (isMounted) {
                    setEmployees(loadedEmployees);
                }
                // Load working shifts from storage
                const loadedWorkingShifts = await storage_1.storage.getShifts();
                if (isMounted) {
                    setWorkingShifts(loadedWorkingShifts);
                }
            }
            catch (error) {
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
    (0, react_1.useEffect)(() => {
        console.log('useEffect called'); // Check if effect is called
        let isMounted = true;
        const loadShifts = async () => {
            if (!(selectedStore === null || selectedStore === void 0 ? void 0 : selectedStore.id) || !isMounted)
                return;
            try {
                setIsLoading(true);
                const loadedShifts = await db_1.dbService.getShifts(selectedStore.id);
                if (!isMounted)
                    return;
                setShifts(loadedShifts);
                setIsLoading(false);
            }
            catch (error) {
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
    }, [selectedStore === null || selectedStore === void 0 ? void 0 : selectedStore.id, showAlert]);
    const transformShiftsToEvents = (0, react_1.useCallback)((shifts) => {
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
        }).filter((event) => event !== null);
    }, [selectedStore === null || selectedStore === void 0 ? void 0 : selectedStore.id, employees, workingShifts]);
    (0, react_1.useEffect)(() => {
        console.log('useEffect called'); // Check if effect is called
        let isMounted = true;
        const loadShifts = async () => {
            if (!(selectedStore === null || selectedStore === void 0 ? void 0 : selectedStore.id) || !isMounted)
                return;
            try {
                setIsLoading(true);
                const loadedShifts = await db_1.dbService.getShifts(selectedStore.id);
                if (!isMounted)
                    return;
                const processedEvents = transformShiftsToEvents(loadedShifts);
                setEvents(processedEvents);
                setIsLoading(false);
            }
            catch (error) {
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
    }, [selectedStore === null || selectedStore === void 0 ? void 0 : selectedStore.id, transformShiftsToEvents, showAlert]);
    return (<div className="h-full p-4 bg-gray-50 max-w-[95vw] mx-auto">
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
          <select id="store-select" value={(selectedStore === null || selectedStore === void 0 ? void 0 : selectedStore.id) || ''} onChange={handleSelectStore} className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
            <option value="">Filiale auswählen</option>
            {stores.map(store => (<option key={store.id} value={store.id}>
                {store.name}
              </option>))}
          </select>
        </div>
      </div>

      {alert.show && (<AlertBar_1.default message={alert.message} type={alert.type} onClose={() => setAlert(prev => (Object.assign(Object.assign({}, prev), { show: false })))}/>)}

      {!selectedStore ? (<div className="flex items-center justify-center h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">Bitte wählen Sie eine Filiale aus</p>
            <p className="text-gray-500">Verwenden Sie die Dropdown-Liste oben, um eine Filiale auszuwählen</p>
          </div>
        </div>) : (<>
          {isLoading ? (<div className="flex items-center justify-center h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm">
              <LoadingSpinner_1.default />
            </div>) : (<DnDCalendar {...calendarOptions}/>)}

          {isFormOpen && selectedStore && (<WorkplanForm_1.default isOpen={isFormOpen} event={selectedEvent} storeId={selectedStore.id} onClose={handleCloseForm} selectedDate={selectedDate} onCreate={handleCreateShift} onUpdate={handleShiftUpdate}/>)}
        </>)}
    </div>);
};
exports.default = WorkplanPage;
