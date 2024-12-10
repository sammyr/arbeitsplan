"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const dnd_1 = require("@hello-pangea/dnd");
const db_1 = require("@/lib/db");
const LoadingSpinner_1 = __importDefault(require("@/components/LoadingSpinner"));
const react_hot_toast_1 = require("react-hot-toast");
const ShiftAssignmentModal_1 = __importDefault(require("@/components/ShiftAssignmentModal"));
const initialData_1 = require("@/lib/initialData");
const pdfUtils_1 = require("@/utils/pdfUtils");
// Funktion zum Laden der Store-Daten
const loadStoreData = async (selectedStore, setIsLoading, setEmployees, setShifts, setAssignments) => {
    if (!selectedStore) {
        console.log('No store selected, skipping data load');
        return;
    }
    try {
        setIsLoading(true);
        console.log('Loading data for store:', selectedStore);
        // Lade Mitarbeiter, Arbeitsschichten und Zuweisungen parallel
        const [loadedEmployees, loadedAssignments, loadedShifts] = await Promise.all([
            db_1.dbService.getEmployees(),
            db_1.dbService.getAssignments(selectedStore.id),
            db_1.dbService.getWorkingShifts()
        ]);
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
        const processedAssignments = loadedAssignments.map(assignment => (Object.assign(Object.assign({}, assignment), { date: new Date(assignment.date).toISOString().split('T')[0] // Ensure consistent date format
         })));
        // Batch-Update der States
        setIsLoading(false);
        setEmployees(loadedEmployees);
        setShifts(loadedShifts);
        setAssignments(processedAssignments);
        console.log('Store data loaded successfully');
    }
    catch (error) {
        console.error('Error loading store data:', error);
        react_hot_toast_1.toast.error('Fehler beim Laden der Daten');
        setIsLoading(false);
    }
};
// Funktion um die Wochentage basierend auf dem Startdatum zu generieren
const getWeekDays = (startDate) => {
    const weekDays = [];
    const currentDate = startDate;
    for (let i = 0; i < 7; i++) {
        weekDays.push((0, date_fns_1.format)(currentDate, 'EEEEEE', { locale: locale_1.de }).replace('.', ''));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return weekDays;
};
// Funktion zur Berechnung der leeren Tage am Monatsanfang
const getEmptyCellCount = (date) => {
    const day = (0, date_fns_1.getDay)((0, date_fns_1.startOfMonth)(date));
    // Konvertiere Sonntag (0) zu 7, andere Tage bleiben unverändert
    return day === 0 ? 6 : day - 1;
};
const Arbeitsplan3Page = (0, react_1.memo)(() => {
    // State Management
    const [currentDate, setCurrentDate] = (0, react_1.useState)(() => {
        if (typeof window === 'undefined')
            return new Date();
        const savedDate = localStorage.getItem('arbeitsplan3_currentDate');
        return savedDate ? new Date(savedDate) : new Date();
    });
    const [selectedStore, setSelectedStore] = (0, react_1.useState)(null);
    const [stores, setStores] = (0, react_1.useState)([]);
    const [employees, setEmployees] = (0, react_1.useState)([]);
    const [shifts, setShifts] = (0, react_1.useState)([]);
    const [assignments, setAssignments] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [isModalOpen, setIsModalOpen] = (0, react_1.useState)(false);
    const [selectedDate, setSelectedDate] = (0, react_1.useState)(null);
    const [editingAssignment, setEditingAssignment] = (0, react_1.useState)(null);
    // Save current date to localStorage when it changes
    (0, react_1.useEffect)(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('arbeitsplan3_currentDate', currentDate.toISOString());
        }
    }, [currentDate]);
    // Cleanup localStorage when component unmounts
    (0, react_1.useEffect)(() => {
        return () => {
            // Optional: Remove the stored date when component unmounts
            // Uncomment the next line if you want to clear the date when leaving the page
            // if (typeof window !== 'undefined') {
            //   localStorage.removeItem('arbeitsplan3_currentDate');
            // }
        };
    }, []);
    // Initialisiere den Store und lade die Daten
    (0, react_1.useEffect)(() => {
        const initializeData = async () => {
            try {
                // Lade gespeicherte Store-ID
                const savedStoreId = typeof window !== 'undefined' ? localStorage.getItem('selectedStoreId') : null;
                const initialStore = savedStoreId
                    ? initialData_1.initialStores.find(s => s.id === savedStoreId)
                    : initialData_1.initialSelectedStore;
                setStores(initialData_1.initialStores);
                setSelectedStore(initialStore || null);
                // Lade gespeichertes Datum
                const savedDate = typeof window !== 'undefined' ? localStorage.getItem('arbeitsplan3_currentDate') : null;
                if (savedDate) {
                    setCurrentDate(new Date(savedDate));
                }
            }
            catch (error) {
                console.error('Error initializing data:', error);
            }
        };
        initializeData();
    }, []);
    // Lade Daten wenn sich der Store ändert
    (0, react_1.useEffect)(() => {
        if (selectedStore) {
            loadStoreData(selectedStore, setIsLoading, setEmployees, setShifts, setAssignments);
        }
    }, [selectedStore]);
    // Füge Mitarbeiterdaten zu den Zuweisungen hinzu
    (0, react_1.useEffect)(() => {
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
            const needsUpdate = assignments.some(assignment => !assignment.employee &&
                employees.some(e => e.id === assignment.employeeId));
            if (!needsUpdate) {
                console.log('Assignments already have employee data');
                return;
            }
            const updatedAssignments = assignments.map(assignment => {
                const employee = employees.find(e => e.id === assignment.employeeId);
                const updated = Object.assign(Object.assign({}, assignment), { employee: employee || undefined });
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
    }, [employees, assignments]); // Add assignments back to dependency array
    // Funktion um die Tage für den aktuellen Monat zu berechnen
    const getDaysInMonth = (date) => {
        const start = (0, date_fns_1.startOfMonth)(date);
        const end = (0, date_fns_1.endOfMonth)(date);
        const days = [];
        // Leere Tage am Anfang
        const firstDayOfMonth = (0, date_fns_1.getDay)(start);
        const emptyDaysAtStart = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
        for (let i = 0; i < emptyDaysAtStart; i++) {
            days.push(null);
        }
        // Tage des Monats
        let currentDay = start;
        while ((0, date_fns_1.isSameMonth)(currentDay, start)) {
            days.push(currentDay);
            currentDay = (0, date_fns_1.addDays)(currentDay, 1);
        }
        // Leere Tage am Ende
        const lastDayOfMonth = (0, date_fns_1.getDay)(end);
        const emptyDaysAtEnd = lastDayOfMonth === 0 ? 0 : 7 - lastDayOfMonth;
        for (let i = 0; i < emptyDaysAtEnd; i++) {
            days.push(null);
        }
        return days;
    };
    // Kalender-Funktionen
    const daysInMonth = (0, react_1.useMemo)(() => getDaysInMonth(currentDate), [currentDate]);
    // Render Kalender
    const renderCalendar = () => {
        return (<div className="container mx-auto px-2 bg-transparent mt-4">
        {/* Header Section with Navigation */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">
            Arbeitsplan für {selectedStore === null || selectedStore === void 0 ? void 0 : selectedStore.name} / {(0, date_fns_1.format)(currentDate, 'MMMM yyyy', { locale: locale_1.de })}
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={handlePreviousMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Calendar Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-separate border-spacing-px bg-slate-200">
              <colgroup>
                <col style={{ width: '14.285%' }}/>
                <col style={{ width: '14.285%' }}/>
                <col style={{ width: '14.285%' }}/>
                <col style={{ width: '14.285%' }}/>
                <col style={{ width: '14.285%' }}/>
                <col style={{ width: '14.285%' }}/>
                <col style={{ width: '14.285%' }}/>
              </colgroup>
              <thead>
                <tr>
                  <th className="bg-white p-2 text-center font-medium">Mo</th>
                  <th className="bg-white p-2 text-center font-medium">Di</th>
                  <th className="bg-white p-2 text-center font-medium">Mi</th>
                  <th className="bg-white p-2 text-center font-medium">Do</th>
                  <th className="bg-white p-2 text-center font-medium">Fr</th>
                  <th className="bg-white p-2 text-center font-medium">Sa</th>
                  <th className="bg-white p-2 text-center font-medium">So</th>
                </tr>
              </thead>
              <tbody>
                <dnd_1.DragDropContext onDragEnd={handleDragEnd}>
                  {chunk(daysInMonth, 7).map((week, weekIndex) => (<tr key={weekIndex}>
                      {week.map((day, dayIndex) => {
                    if (day === null) {
                        return (<td key={`empty-${weekIndex}-${dayIndex}`} className="bg-slate-100 p-2 align-top border border-slate-200" style={{
                                height: '120px',
                                minHeight: '120px'
                            }}/>);
                    }
                    const dateStr = (0, date_fns_1.format)(day, 'yyyy-MM-dd');
                    const dayAssignments = assignments.filter(a => (0, date_fns_1.format)(new Date(a.date), 'yyyy-MM-dd') === dateStr);
                    return (<dnd_1.Droppable key={dateStr} droppableId={dateStr}>
                            {(provided) => (<td ref={provided.innerRef} {...provided.droppableProps} className={`p-2 align-top relative hover:bg-gray-50 transition-colors cursor-pointer border border-slate-200 ${!(0, date_fns_1.isSameMonth)(day, currentDate) ? 'bg-slate-100' : 'bg-white'} ${(0, date_fns_1.isToday)(day) ? 'bg-blue-50' : ''}`} style={{
                                height: '120px',
                                minHeight: '120px'
                            }} onClick={() => handleDateClick(day)}>
                                <div className="text-right text-sm text-gray-500">
                                  {(0, date_fns_1.format)(day, 'd')}
                                </div>
                                <div className="mt-2 space-y-1">
                                  {dayAssignments.map((assignment, index) => {
                                const employee = employees.find(e => e.id === assignment.employeeId);
                                const shift = shifts.find(s => s.id === assignment.shiftId);
                                if (!employee || !shift)
                                    return null;
                                return (<dnd_1.Draggable key={assignment.id} draggableId={assignment.id} index={index}>
                                        {(provided) => (<div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="group relative">
                                            <div className="absolute -top-2 right-0 flex opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                              <button onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingAssignment(assignment);
                                            setSelectedDate(day);
                                            setIsModalOpen(true);
                                        }} className="ml-1 p-0.5 text-slate-500 hover:text-slate-700 rounded transition-colors bg-white shadow-sm" title="Schicht bearbeiten">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                                </svg>
                                              </button>
                                              <button onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteAssignment(assignment.id);
                                        }} className="ml-1 p-0.5 text-slate-500 hover:text-slate-700 rounded transition-colors bg-white shadow-sm" title="Schicht löschen">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                                </svg>
                                              </button>
                                            </div>
                                            <div className="p-2 bg-gradient-to-r from-emerald-50/80 via-emerald-50/90 to-emerald-50/80 text-slate-900 rounded-md hover:from-emerald-100/90 hover:via-emerald-100 hover:to-emerald-100/90 transition-all border border-emerald-100/50 shadow-sm">
                                              <div className="flex flex-col items-center text-center space-y-0.5">
                                                <span className="font-semibold text-sm">
                                                  {employee.firstName}
                                                </span>
                                                <span className="text-sm text-slate-700">
                                                  {shift.title}
                                                </span>
                                                <span className="text-sm text-slate-600">
                                                  {assignment.workHours} Stunden
                                                </span>
                                              </div>
                                            </div>
                                          </div>)}
                                      </dnd_1.Draggable>);
                            })}
                                  {provided.placeholder}
                                </div>
                              </td>)}
                          </dnd_1.Droppable>);
                })}
                    </tr>))}
                </dnd_1.DragDropContext>
              </tbody>
            </table>
          </div>
        </div>
      </div>);
    };
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
    const handleDateClick = (date) => {
        if (!(0, date_fns_1.isSameMonth)(date, currentDate))
            return;
        setSelectedDate(date);
        setIsModalOpen(true);
    };
    // Schicht-Funktionen
    const handleAssignmentSave = async (employeeId, shiftId, workHours) => {
        if (!selectedStore || !selectedDate) {
            react_hot_toast_1.toast.error('Bitte wählen Sie eine Filiale und ein Datum aus');
            return;
        }
        try {
            if (editingAssignment) {
                // Update existing assignment
                const assignmentUpdate = {
                    employeeId,
                    shiftId,
                    storeId: selectedStore.id,
                    date: (0, date_fns_1.format)(selectedDate, 'yyyy-MM-dd'),
                    workHours: workHours,
                    updatedAt: new Date().toISOString()
                };
                await db_1.dbService.updateAssignment(editingAssignment.id, assignmentUpdate);
                setAssignments(prev => prev.map(a => a.id === editingAssignment.id ? Object.assign(Object.assign({}, a), assignmentUpdate) : a));
                const employee = employees.find(e => e.id === employeeId);
                const shift = shifts.find(s => s.id === shiftId);
                await db_1.dbService.addLogEntry('success', `Schicht bearbeitet`, {
                    mitarbeiter: (employee === null || employee === void 0 ? void 0 : employee.firstName) || 'Unbekannt',
                    schicht: (shift === null || shift === void 0 ? void 0 : shift.title) || 'Unbekannt',
                    stunden: workHours,
                    datum: (0, date_fns_1.format)(new Date(assignmentUpdate.date), 'dd.MM.yyyy'),
                    filiale: selectedStore.name
                });
                react_hot_toast_1.toast.success('Schicht wurde erfolgreich bearbeitet');
            }
            else {
                // Create new assignment
                const assignment = {
                    employeeId,
                    shiftId,
                    storeId: selectedStore.id,
                    date: (0, date_fns_1.format)(selectedDate, 'yyyy-MM-dd'),
                    workHours: workHours,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                const assignmentId = await db_1.dbService.addAssignment(assignment);
                const newAssignment = Object.assign(Object.assign({}, assignment), { id: assignmentId });
                setAssignments(prev => [...prev, newAssignment]);
                const employee = employees.find(e => e.id === employeeId);
                const shift = shifts.find(s => s.id === shiftId);
                await db_1.dbService.addLogEntry('success', `Neue Schicht zugewiesen`, {
                    mitarbeiter: (employee === null || employee === void 0 ? void 0 : employee.firstName) || 'Unbekannt',
                    schicht: (shift === null || shift === void 0 ? void 0 : shift.title) || 'Unbekannt',
                    stunden: workHours,
                    datum: (0, date_fns_1.format)(selectedDate, 'dd.MM.yyyy'),
                    filiale: selectedStore.name
                });
                react_hot_toast_1.toast.success('Schicht erfolgreich zugewiesen');
            }
            setIsModalOpen(false);
            setEditingAssignment(null);
        }
        catch (error) {
            console.error('Error saving assignment:', error);
            await db_1.dbService.addLogEntry('error', editingAssignment ? 'Fehler beim Bearbeiten der Schicht' : 'Fehler beim Zuweisen der Schicht');
            react_hot_toast_1.toast.error(editingAssignment ? 'Fehler beim Bearbeiten der Schicht' : 'Fehler beim Speichern der Zuweisung');
        }
    };
    // Funktion zum Löschen einer Schichtzuweisung
    const handleDeleteAssignment = async (assignmentId) => {
        // Finde die zu löschende Zuweisung
        const assignment = assignments.find(a => a.id === assignmentId);
        if (!assignment)
            return;
        const employee = employees.find(e => e.id === assignment.employeeId);
        const shift = shifts.find(s => s.id === assignment.shiftId);
        // Bestätigungsdialog anzeigen
        const isConfirmed = window.confirm(`Möchten Sie wirklich die Schicht "${(shift === null || shift === void 0 ? void 0 : shift.title) || 'Unbekannt'}" von ${(employee === null || employee === void 0 ? void 0 : employee.firstName) || 'Unbekannt'} am ${(0, date_fns_1.format)(new Date(assignment.date), 'dd.MM.yyyy')} löschen?`);
        if (!isConfirmed) {
            return; // Wenn der Benutzer abbricht, nichts weiter tun
        }
        try {
            await db_1.dbService.deleteAssignment(assignmentId);
            setAssignments(prev => prev.filter(a => a.id !== assignmentId));
            // Erstelle einen Log-Eintrag für die Löschung
            await db_1.dbService.addLogEntry('info', `Schicht gelöscht`, {
                mitarbeiter: (employee === null || employee === void 0 ? void 0 : employee.firstName) || 'Unbekannt',
                schicht: (shift === null || shift === void 0 ? void 0 : shift.title) || 'Unbekannt',
                datum: (0, date_fns_1.format)(new Date(assignment.date), 'dd.MM.yyyy'),
                filiale: (selectedStore === null || selectedStore === void 0 ? void 0 : selectedStore.name) || 'Unbekannt'
            });
            react_hot_toast_1.toast.success('Schicht wurde gelöscht');
        }
        catch (error) {
            console.error('Error deleting assignment:', error);
            await db_1.dbService.addLogEntry('error', 'Fehler beim Löschen der Schicht');
            react_hot_toast_1.toast.error('Fehler beim Löschen der Schicht');
        }
    };
    const handleDragEnd = async (result) => {
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
            setAssignments(prev => prev.map(a => a.id === draggableId
                ? Object.assign(Object.assign({}, a), { date: destination.droppableId }) : a));
            // Erstelle das aktualisierte Assignment
            const updatedAssignment = Object.assign(Object.assign({}, assignment), { date: destination.droppableId });
            console.log('Updating assignment:', updatedAssignment);
            // Aktualisiere die Zuweisung in der Datenbank
            await db_1.dbService.updateAssignment(draggableId, updatedAssignment);
            // Hole Mitarbeiter- und Schichtinformationen für den Log-Eintrag
            const employee = employees.find(e => e.id === assignment.employeeId);
            const shift = shifts.find(s => s.id === assignment.shiftId);
            // Erstelle einen Log-Eintrag für die Verschiebung
            await db_1.dbService.addLogEntry('info', `Schicht verschoben`, {
                mitarbeiter: (employee === null || employee === void 0 ? void 0 : employee.firstName) || 'Unbekannt',
                schicht: (shift === null || shift === void 0 ? void 0 : shift.title) || 'Unbekannt',
                von: (0, date_fns_1.format)(new Date(source.droppableId), 'dd.MM.yyyy'),
                nach: (0, date_fns_1.format)(new Date(destination.droppableId), 'dd.MM.yyyy'),
                filiale: selectedStore.name
            });
            console.log('Database update successful');
            react_hot_toast_1.toast.success('Schicht wurde verschoben');
        }
        catch (error) {
            console.error('Error updating assignment:', error);
            await db_1.dbService.addLogEntry('error', 'Fehler beim Verschieben der Schicht');
            react_hot_toast_1.toast.error('Fehler beim Verschieben der Schicht');
            // Nur im Fehlerfall die Daten neu laden
            await loadStoreData(selectedStore, setIsLoading, setEmployees, setShifts, setAssignments);
        }
    };
    const handleExportPDF = async () => {
        if (!selectedStore) {
            react_hot_toast_1.toast.error('Bitte wählen Sie einen Store aus');
            return;
        }
        const calendarElement = document.getElementById('calendar-container');
        // Debug log all assignments
        console.log('Current date for filtering:', {
            date: currentDate,
            month: currentDate.getMonth(),
            year: currentDate.getFullYear(),
            isoString: currentDate.toISOString()
        });
        console.log('All assignments before filtering:', assignments.map(a => {
            var _a;
            return ({
                id: a.id,
                date: a.date,
                employeeId: a.employeeId,
                employee: (_a = a.employee) === null || _a === void 0 ? void 0 : _a.firstName,
                workHours: a.workHours,
                parsedDate: new Date(a.date),
                isCurrentMonth: new Date(a.date).getMonth() === currentDate.getMonth() &&
                    new Date(a.date).getFullYear() === currentDate.getFullYear()
            });
        }));
        // Make sure we have assignments with employee data
        const assignmentsWithEmployees = assignments.filter(a => {
            // Parse the assignment date
            const assignmentDate = new Date(a.date + 'T00:00:00'); // Ensure consistent timezone handling
            const assignmentMonth = assignmentDate.getMonth();
            const assignmentYear = assignmentDate.getFullYear();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();
            // Check if date is valid
            if (isNaN(assignmentDate.getTime())) {
                console.log('❌ Invalid date for assignment:', {
                    id: a.id,
                    date: a.date,
                    parsedDate: assignmentDate
                });
                return false;
            }
            // Make sure we have the employee data
            if (!a.employee || !a.employeeId) {
                console.log('❌ Assignment missing employee data:', {
                    id: a.id,
                    employeeId: a.employeeId,
                    employee: a.employee
                });
                return false;
            }
            // Check if assignment is in current month/year
            const isCurrentMonth = assignmentMonth === currentMonth && assignmentYear === currentYear;
            if (!isCurrentMonth) {
                console.log('❌ Assignment not in current month:', {
                    id: a.id,
                    date: a.date,
                    parsedDate: assignmentDate.toISOString(),
                    assignmentMonth,
                    currentMonth,
                    assignmentYear,
                    currentYear
                });
                return false;
            }
            // Check work hours
            if (typeof a.workHours !== 'number' || a.workHours <= 0) {
                console.log('❌ Assignment missing work hours:', {
                    id: a.id,
                    workHours: a.workHours
                });
                return false;
            }
            console.log('✅ Valid assignment found:', {
                id: a.id,
                date: a.date,
                parsedDate: assignmentDate.toISOString(),
                employee: `${a.employee.firstName} ${a.employee.lastName || ''}`,
                workHours: a.workHours,
                month: {
                    assignment: assignmentMonth,
                    current: currentMonth
                },
                year: {
                    assignment: assignmentYear,
                    current: currentYear
                }
            });
            return true;
        });
        console.log('Filtered assignments for export:', {
            total: assignmentsWithEmployees.length,
            currentMonth: (0, date_fns_1.format)(currentDate, 'MMMM yyyy'),
            store: selectedStore.name,
            assignments: assignmentsWithEmployees.map(a => {
                var _a;
                return ({
                    id: a.id,
                    date: a.date,
                    parsedDate: new Date(a.date + 'T00:00:00').toISOString(),
                    employee: (_a = a.employee) === null || _a === void 0 ? void 0 : _a.firstName,
                    workHours: a.workHours
                });
            })
        });
        if (assignmentsWithEmployees.length === 0) {
            console.log('No valid assignments found for the current month');
            react_hot_toast_1.toast.error('Keine Schichten für diesen Monat gefunden');
            return;
        }
        await (0, pdfUtils_1.exportCalendarToPDF)(calendarElement, selectedStore, currentDate, assignmentsWithEmployees);
    };
    const handleExcelExport = () => {
        react_hot_toast_1.toast.success('Excel Export wird vorbereitet...');
        // TODO: Implementiere Excel Export
    };
    const handlePrint = () => {
        react_hot_toast_1.toast.success('Drucken wird vorbereitet...');
    };
    // Berechne die Gesamtstunden pro Mitarbeiter für den aktuellen Monat
    const calculateMonthlyHours = () => {
        const monthlyHours = {};
        assignments.forEach(assignment => {
            const assignmentDate = new Date(assignment.date);
            if ((0, date_fns_1.isSameMonth)(assignmentDate, currentDate)) {
                if (!monthlyHours[assignment.employeeId]) {
                    monthlyHours[assignment.employeeId] = 0;
                }
                monthlyHours[assignment.employeeId] += assignment.workHours || 0;
            }
        });
        return monthlyHours;
    };
    const handleStoreChange = (storeId) => {
        const store = stores.find(s => s.id === storeId);
        setSelectedStore(store || null);
        if (store) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('selectedStoreId', store.id);
            }
        }
        else {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('selectedStoreId');
            }
        }
    };
    // Helper function to chunk array into weeks
    const chunk = (arr, size) => {
        return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));
    };
    return (<>
      <div className="p-4 md:p-6 max-w-[1920px] mx-auto">
        {/* Header mit Store-Auswahl und Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-semibold text-slate-800">
              Arbeitsplan für {selectedStore === null || selectedStore === void 0 ? void 0 : selectedStore.name} / {(0, date_fns_1.format)(currentDate, 'MMMM yyyy', { locale: locale_1.de })}
            </h1>

            <div className="flex items-center justify-between">
              {/* Month Navigation - Left */}
              <div className="flex items-center gap-4">
                <button onClick={handlePreviousMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>

                <h2 className="text-lg font-medium text-slate-800">
                  {(0, date_fns_1.format)(currentDate, 'MMMM yyyy', { locale: locale_1.de })}
                </h2>

                <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>

              {/* Export Buttons and Store Dropdown - Right */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button onClick={handleExportPDF} className="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2-4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2m8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                    </svg>
                    PDF Export
                  </button>

                  <button onClick={handleExcelExport} className="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    Excel Export
                  </button>

                  <button onClick={handlePrint} className="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm" title="Drucken ist momentan nicht verfügbar">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2-4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2m8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                    </svg>
                    Drucken
                  </button>
                </div>

                <select value={(selectedStore === null || selectedStore === void 0 ? void 0 : selectedStore.id) || ''} onChange={(e) => handleStoreChange(e.target.value)} className="min-w-[200px] pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors duration-200">
                  <option value="">Store auswählen...</option>
                  {stores.map((store) => (<option key={store.id} value={store.id}>
                      {store.name}
                    </option>))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div id="calendar-container" className="calendar-container bg-white rounded-xl shadow-sm p-4 md:p-6 overflow-x-auto" style={{ minWidth: '1000px', maxWidth: '1400px', margin: '0 auto' }}>
          {renderCalendar()}
        </div>

        {/* Monthly Hours Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6" style={{ marginTop: '2rem' }}>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Arbeitsstunden Übersicht {(0, date_fns_1.format)(currentDate, 'MMMM yyyy', { locale: locale_1.de })}
          </h2>
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
            .map(employee => (Object.assign(Object.assign({}, employee), { totalHours: calculateMonthlyHours()[employee.id] || 0 })))
            .sort((a, b) => b.totalHours - a.totalHours)
            .map(employee => (<tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {employee.totalHours.toFixed(1)} Stunden
                      </td>
                    </tr>))}
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
      {isLoading && (<div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <LoadingSpinner_1.default />
        </div>)}

      {/* Modal */}
      {isModalOpen && selectedDate && (<ShiftAssignmentModal_1.default isOpen={isModalOpen} onClose={() => {
                setIsModalOpen(false);
                setEditingAssignment(null);
            }} onSave={handleAssignmentSave} employees={employees} shifts={shifts} date={selectedDate} initialEmployeeId={editingAssignment === null || editingAssignment === void 0 ? void 0 : editingAssignment.employeeId} initialShiftId={editingAssignment === null || editingAssignment === void 0 ? void 0 : editingAssignment.shiftId} initialWorkHours={(editingAssignment === null || editingAssignment === void 0 ? void 0 : editingAssignment.workHours) || 8}/>)}
    </>);
});
exports.default = Arbeitsplan3Page;
