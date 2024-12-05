'use client';

import { useState, useEffect, memo, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, getDay, addDays } from 'date-fns';
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
import { initialSelectedStore, initialStores } from '@/lib/initialData';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    setIsLoading(false);
    setEmployees(loadedEmployees);
    setShifts(loadedShifts);
    setAssignments(loadedAssignments);

    console.log('Store data loaded successfully');
  } catch (error) {
    console.error('Error loading store data:', error);
    toast.error('Fehler beim Laden der Daten');
    setIsLoading(false);
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
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<WorkingShift[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<ShiftAssignment | null>(null);

  // Initialisiere den Store und lade die Daten
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Lade gespeicherte Store-ID
        const savedStoreId = localStorage.getItem('selectedStoreId');
        const initialStore = savedStoreId 
          ? initialStores.find(s => s.id === savedStoreId) 
          : initialSelectedStore;
        
        setStores(initialStores);
        setSelectedStore(initialStore);

        // Lade gespeichertes Datum
        const savedDate = localStorage.getItem('currentDate');
        if (savedDate) {
          setCurrentDate(new Date(savedDate));
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, []);

  // Lade Daten wenn sich der Store ändert
  useEffect(() => {
    if (selectedStore) {
      loadStoreData(
        selectedStore,
        setIsLoading,
        setEmployees,
        setShifts,
        setAssignments
      );
      // Speichere ausgewählten Store
      localStorage.setItem('selectedStoreId', selectedStore.id);
    }
  }, [selectedStore]);

  // Speichere aktuelles Datum
  useEffect(() => {
    localStorage.setItem('currentDate', currentDate.toISOString());
  }, [currentDate]);

  // Funktion um die Tage für den aktuellen Monat zu berechnen
  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = [];
    
    // Leere Tage am Anfang
    const firstDayOfMonth = getDay(start);
    const emptyDaysAtStart = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    for (let i = 0; i < emptyDaysAtStart; i++) {
      days.push(null);
    }
    
    // Tage des Monats
    let currentDay = start;
    while (isSameMonth(currentDay, start)) {
      days.push(currentDay);
      currentDay = addDays(currentDay, 1);
    }
    
    // Leere Tage am Ende
    const lastDayOfMonth = getDay(end);
    const emptyDaysAtEnd = lastDayOfMonth === 0 ? 0 : 7 - lastDayOfMonth;
    for (let i = 0; i <emptyDaysAtEnd; i++) {
      days.push(null);
    }
    
    return days;
  };

  // Kalender-Funktionen
  const daysInMonth = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  // Render Kalender
  const renderCalendar = () => {
    return (
      <div className="w-screen md:w-full -mx-4 md:mx-0 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[800px] px-4">
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {/* Wochentagsüberschriften */}
              <div className="bg-white p-2 text-center font-medium">Mo</div>
              <div className="bg-white p-2 text-center font-medium">Di</div>
              <div className="bg-white p-2 text-center font-medium">Mi</div>
              <div className="bg-white p-2 text-center font-medium">Do</div>
              <div className="bg-white p-2 text-center font-medium">Fr</div>
              <div className="bg-white p-2 text-center font-medium">Sa</div>
              <div className="bg-white p-2 text-center font-medium">So</div>

              {/* Kalendertage */}
              <DragDropContext onDragEnd={handleDragEnd}>
                {daysInMonth.map((day, index) => {
                  if (day === null) {
                    return (
                      <div key={`empty-${index}`} className="bg-white p-2 min-h-[120px]" />
                    );
                  }

                  return (
                    <Droppable
                      key={format(day, 'yyyy-MM-dd')}
                      droppableId={format(day, 'yyyy-MM-dd')}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`
                            min-h-[120px] p-2 bg-white
                            ${isToday(day) ? 'bg-blue-50' : ''}
                            hover:bg-gray-50 transition-colors cursor-pointer
                            text-sm md:text-base
                          `}
                          onClick={() => handleDateClick(day)}
                        >
                          <div className="text-right text-xs md:text-sm">{format(day, 'd')}</div>
                          <div className="space-y-1">
                            {assignments
                              .filter(a => a.date === format(day, 'yyyy-MM-dd'))
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
                                        className="group relative text-xs md:text-sm"
                                      >
                                        <div className="absolute -top-2 right-0 flex opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingAssignment(assignment);
                                              setSelectedDate(day);
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
                                        <div className="p-2 md:p-4 h-16 md:h-20 bg-gradient-to-r from-emerald-50/80 via-emerald-50/90 to-emerald-50/80 text-slate-900 rounded-md hover:from-emerald-100/90 hover:via-emerald-100 hover:to-emerald-100/90 transition-all border border-emerald-100/50 shadow-sm">
                                          <div className="h-full flex flex-col items-center justify-center">
                                            <span className="text-center">
                                              <strong className="text-slate-900">{employee?.firstName}</strong> {shift?.title}
                                            </span>
                                            <span className="text-center text-slate-600 mt-1">
                                              {assignment.workHours} Stunden
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
                  );
                })}
              </DragDropContext>
            </div>
          </div>
        </div>
      </div>
    );
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
        const assignmentUpdate = {
          employeeId,
          shiftId,
          storeId: selectedStore.id,
          date: format(selectedDate, 'yyyy-MM-dd'),
          workHours: workingHours,
          updatedAt: new Date().toISOString()
        };

        await dbService.updateAssignment(editingAssignment.id, assignmentUpdate);
        setAssignments(prev => prev.map(a => 
          a.id === editingAssignment.id ? { ...a, ...assignmentUpdate } : a
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
            datum: format(new Date(assignmentUpdate.date), 'dd.MM.yyyy'),
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
          workHours: workingHours,
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

  const handlePrint = () => {
    toast.success('Drucken wird vorbereitet...');
  };

  // Berechne die Gesamtstunden pro Mitarbeiter für den aktuellen Monat
  const calculateMonthlyHours = () => {
    const monthlyHours: { [key: string]: number } = {};
    
    assignments.forEach(assignment => {
      const assignmentDate = new Date(assignment.date);
      // Prüfe ob die Zuweisung im aktuellen Monat liegt
      if (isSameMonth(assignmentDate, currentDate)) {
        const employeeId = assignment.employeeId;
        monthlyHours[employeeId] = (monthlyHours[employeeId] || 0) + (assignment.workHours || 0);
      }
    });

    return monthlyHours;
  };

  const handlePDFExport = async () => {
    try {
      setIsLoading(true);
      toast.loading('PDF wird erstellt...');

      // Capture the calendar view
      const calendarElement = document.getElementById('calendar-container');
      if (!calendarElement) {
        throw new Error('Calendar element not found');
      }

      // Create PDF with landscape orientation
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add metadata
      pdf.setProperties({
        title: `Arbeitsplan ${format(currentDate, 'MMMM yyyy', { locale: de })}`,
        subject: 'Monatsplan',
        author: 'Arbeitsplan System',
        keywords: 'arbeitsplan, schedule, calendar',
        creator: 'Arbeitsplan System'
      });

      // Capture and add calendar page
      const canvas = await html2canvas(calendarElement, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 10, 10, 277, 190);

      // Add new page for working hours table (keep landscape orientation)
      pdf.addPage('a4', 'l');
      
      // Add title for the hours table
      pdf.setFontSize(20);
      pdf.text(`Arbeitsstunden ${format(currentDate, 'MMMM yyyy', { locale: de })}`, 148.5, 20, { align: 'center' });
      
      // Calculate and prepare hours data
      const employeeHours = employees.map(employee => {
        const monthlyHours = calculateMonthlyHours()[employee.id] || 0;
        return {
          name: `${employee.firstName} ${employee.lastName}`,
          hours: monthlyHours
        };
      }).sort((a, b) => a.name.localeCompare(b.name));

      // Set up table
      pdf.setFontSize(12);
      const tableHeaders = ['Mitarbeiter', 'Stunden'];
      const tableData = employeeHours.map(emp => [emp.name, emp.hours.toFixed(2)]);
      
      // Calculate total hours
      const totalHours = employeeHours.reduce((sum, emp) => sum + emp.hours, 0);
      tableData.push(['Gesamt', totalHours.toFixed(2)]);

      // Add table with adjusted dimensions for landscape
      const startY = 35;
      const startX = 74; // Centered in landscape
      const cellWidth = [150, 50];
      const cellHeight = 10;
      
      // Draw table headers
      pdf.setFont('helvetica', 'bold');
      tableHeaders.forEach((header, i) => {
        const x = startX + (i === 0 ? 0 : cellWidth[0]);
        pdf.rect(x, startY, cellWidth[i], cellHeight);
        if (i === 0) {
          pdf.text(header, x + 5, startY + 7);
        } else {
          pdf.text(header, x + cellWidth[i] - 5, startY + 7, { align: 'right' });
        }
      });

      // Draw table data
      pdf.setFont('helvetica', 'normal');
      tableData.forEach((row, rowIndex) => {
        const y = startY + ((rowIndex + 1) * cellHeight);
        row.forEach((cell, cellIndex) => {
          const x = startX + (cellIndex === 0 ? 0 : cellWidth[0]);
          pdf.rect(x, y, cellWidth[cellIndex], cellHeight);
          
          // Right align hours, left align names
          if (cellIndex === 0) {
            pdf.text(cell, x + 5, y + 7);
          } else {
            pdf.text(cell, x + cellWidth[cellIndex] - 5, y + 7, { align: 'right' });
          }
        });
        
        // Make the total row bold
        if (rowIndex === tableData.length - 1) {
          pdf.setFont('helvetica', 'bold');
        }
      });

      // Save the PDF
      const fileName = `Arbeitsplan_${format(currentDate, 'yyyy-MM', { locale: de })}.pdf`;
      pdf.save(fileName);

      toast.dismiss();
      toast.success('PDF erfolgreich erstellt!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.dismiss();
      toast.error('Fehler beim Erstellen der PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcelExport = () => {
    toast.success('Excel Export wird vorbereitet...');
    // TODO: Implementiere Excel Export
  };

  const handleStoreChange = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    setSelectedStore(store || null);
    if (store) {
      localStorage.setItem('selectedStoreId', store.id);
    } else {
      localStorage.removeItem('selectedStoreId');
    }
  };

  return (
    <>
      <div className="p-4 md:p-6 max-w-[1920px] mx-auto">
        {/* Header mit Store-Auswahl und Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-semibold text-slate-800">
              Arbeitsplan für {selectedStore?.name} / {format(currentDate, 'MMMM yyyy', { locale: de })}
            </h1>

            <div className="flex items-center justify-between">
              {/* Month Navigation - Left */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <h2 className="text-lg font-medium text-slate-800">
                  {format(currentDate, 'MMMM yyyy', { locale: de })}
                </h2>

                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Export Buttons and Store Dropdown - Right */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePDFExport}
                    className="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2-4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2m8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    PDF Export
                  </button>

                  <button
                    onClick={handleExcelExport}
                    className="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Excel Export
                  </button>

                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    title="Drucken ist momentan nicht verfügbar"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2-4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2m8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Drucken
                  </button>
                </div>

                <select
                  value={selectedStore?.id || ''}
                  onChange={(e) => handleStoreChange(e.target.value)}
                  className="min-w-[200px] pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  <option value="">Store auswählen...</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div id="calendar-container" className="calendar-container bg-white rounded-xl shadow-sm p-4 md:p-6 overflow-x-auto">
          {renderCalendar()}
        </div>

        {/* Monthly Hours Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Arbeitsstunden Übersicht {format(currentDate, 'MMMM yyyy', { locale: de })}
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
                  .map(employee => ({
                    ...employee,
                    totalHours: calculateMonthlyHours()[employee.id] || 0
                  }))
                  .sort((a, b) => b.totalHours - a.totalHours)
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
          initialWorkingHours={editingAssignment?.workHours || 8}
        />
      )}
    </>
  );
});

export default Arbeitsplan3Page;
