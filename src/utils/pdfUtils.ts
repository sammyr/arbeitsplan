import { format, parse, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Employee } from '@/types/employee';
import { ShiftAssignment } from '@/types/shiftAssignment';
import { ShiftDefinition } from '@/types/shiftDefinition';
import { Store } from '@/types/store';
import { Holiday, isHoliday } from '@/types/holiday';
import { holidays } from '@/data/holidays';

// Farben für die Tage (RGB-Format für jsPDF)
const dayColors = {
  weekday: [255, 255, 255] as [number, number, number],    // Weiß für normale Tage
  saturday: [255, 235, 59] as [number, number, number],    // Gelb für Samstag
  sunday: [76, 175, 80] as [number, number, number],       // Grün für Sonntag
  holiday: [255, 82, 82] as [number, number, number]       // Rot für Feiertage
};

// Funktion zum Konvertieren von RGB zu Hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

// Funktion zum Bestimmen der Hintergrundfarbe
const getDayBackgroundColor = (date: Date, store: Store): number[] => {
  try {
    // Prüfe zuerst auf Feiertage
    const holiday = isHoliday(date, store.state, holidays);
    if (holiday) {
      console.log(`Feiertag gefunden: ${holiday.name} am ${format(date, 'dd.MM.yyyy')} in ${store.state}`);
      return dayColors.holiday;
    }

    // Wenn kein Feiertag, prüfe auf Wochenende
    const day = date.getDay();
    if (day === 6) return dayColors.saturday;  // Samstag
    if (day === 0) return dayColors.sunday;    // Sonntag
    return dayColors.weekday;
  } catch (error) {
    console.error('Fehler in getDayBackgroundColor:', error);
    return dayColors.weekday; // Fallback auf normalen Wochentag
  }
};

// Helper-Funktionen
const formatTime = (time: string) => {
  if (!time) return '00:00';
  // Entferne mögliche Leerzeichen
  time = time.trim();
  // Wenn das Format bereits HH:mm ist, gib es direkt zurück
  if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
    return time.padStart(5, '0'); // Stelle sicher, dass es im Format HH:mm ist
  }
  try {
    // Versuche das Datum zu parsen
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return '00:00';
  }
};

const formatDate = (date: Date) => {
  return format(date, 'dd.MM.yyyy', { locale: de });
};

const getDayName = (date: Date) => {
  return format(date, 'EEEE', { locale: de });
};

const getMonthName = (date: Date) => {
  return format(date, 'MMMM yyyy', { locale: de });
};

const getEmployeeName = (employeeId: string, employees: Employee[]) => {
  const employee = employees.find(e => e.id === employeeId);
  return employee ? `${employee.firstName} ${employee.lastName}` : '';
};

export const exportCalendarToPDF = async (
  assignments: ShiftAssignment[],
  employees: Employee[],
  shifts: ShiftDefinition[],
  currentDate: Date,
  store: Store
) => {
  try {
    console.log('Starte PDF Export mit:', {
      assignments: assignments.length,
      employees: employees.length,
      shifts: shifts.length,
      currentDate: currentDate.toISOString(),
      storeName: store.name
    });

    // Erstelle PDF im Querformat
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    try {
      // Setze kleinere Seitenränder
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 10;

      // Titel
      const month = format(currentDate, 'MMMM yyyy', { locale: de });
      const title = store?.name ? `Dienstplan ${store.name} - ${month}` : `Dienstplan - ${month}`;
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      const titleWidth = doc.getTextWidth(title);
      const pageCenter = pageWidth / 2;
      doc.text(title, pageCenter, 20, { align: 'center' });

      // Tage des Monats
      const startOfMonthDate = startOfMonth(currentDate);
      const endOfMonthDate = endOfMonth(currentDate);
      const days = eachDayOfInterval({ 
        start: startOfMonthDate || new Date(), 
        end: endOfMonthDate || new Date() 
      });

      // Validiere Input-Arrays
      if (!Array.isArray(assignments) || !Array.isArray(employees) || !Array.isArray(shifts)) {
        throw new Error('Ungültige Eingabedaten: assignments, employees und shifts müssen Arrays sein');
      }

      // Tabellenkopf erstellen
      const headers = [
        'Name',
        ...days.map(day => format(day, 'd'))
      ];

      // Tabellendaten vorbereiten
      const tableData = employees
        .filter(employee => employee && typeof employee.id === 'string')
        .map(employee => {
          const rowData = days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            try {
              const dayAssignments = assignments.filter(a => 
                a && a.date && 
                format(new Date(a.date), 'yyyy-MM-dd') === dateStr && 
                a.employeeId === employee.id
              );

              if (!dayAssignments || dayAssignments.length === 0) return '';

              return dayAssignments
                .map(a => shifts.find(s => s?.id === a.shiftId)?.title || '')
                .filter(title => title)
                .join('\n');
            } catch (error) {
              console.error(`Fehler bei der Verarbeitung des Tages ${dateStr}:`, error);
              return '';
            }
          });

          // Prüfe, ob der Mitarbeiter tatsächliche Schichteinträge hat
          const hasActualShifts = rowData.some(entry => entry !== '');
          if (!hasActualShifts) return null;

          return [
            employee.firstName || '',
            ...rowData
          ];
        })
        .filter(row => row !== null);

      if (tableData.length === 0) {
        console.warn('Keine gültigen Daten für die Tabelle gefunden');
      }

      // Tabelle erstellen
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 35,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 0.8,
          overflow: 'linebreak',
          halign: 'center',
          valign: 'middle',
          lineWidth: 0.01,
          minCellHeight: 10
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { 
            cellWidth: 20,
            halign: 'left',
            fontStyle: 'bold'
          },
          ...Object.fromEntries(
            days.map((_, index) => [index + 1, { 
              cellWidth: (pageWidth - 45) / days.length,
              halign: 'center'
            }])
          )
        },
        didParseCell: function(data) {
          try {
            // Überspringen der ersten Spalte (Mitarbeiternamen)
            if (data.column.index === 0) return;

            const dayIndex = data.column.index - 1;
            if (dayIndex < 0 || dayIndex >= days.length) return;
            
            const currentDate = days[dayIndex];
            const dayOfWeek = currentDate.getDay();
            const holiday = isHoliday(currentDate, store.state, holidays);

            if (holiday) {
              data.cell.styles.fillColor = dayColors.holiday;
            } else if (dayOfWeek === 0) { // Sonntag
              data.cell.styles.fillColor = dayColors.sunday;
            } else if (dayOfWeek === 6) { // Samstag
              data.cell.styles.fillColor = dayColors.saturday;
            }
          } catch (error) {
            console.error('Fehler in didParseCell:', error);
          }
        }
      });

      // Speichere die PDF
      doc.save(`Dienstplan_${store.name}_${format(currentDate, 'yyyy-MM')}.pdf`);
      console.log('PDF erfolgreich erstellt!');

    } catch (error) {
      console.error('Fehler beim Erstellen der PDF:', error);
      throw error;
    }
  } catch (error) {
    console.error('Fehler beim Erstellen der PDF:', error);
    throw error;
  }
};
