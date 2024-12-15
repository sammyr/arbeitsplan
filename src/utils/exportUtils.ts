import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { de } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import { Employee, WorkingShift, ShiftDefinition } from '@/types';

interface ShiftAssignment {
  id: string;
  employeeId: string;
  shiftId: string;
  date: string;
  workHours: number;
}

export const exportToExcel = (
  assignments: ShiftAssignment[],
  employees: Employee[],
  shifts: ShiftDefinition[],
  currentDate: Date,
  storeName: string
) => {
  try {
    // Tage des Monats
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Excel-Daten vorbereiten
    const headers = [
      'Mitarbeiter',
      ...days.map(day => format(day, 'd')),
      'G'
    ];

    const data = employees
      .map(employee => {
        let totalHours = 0;
        const rowData = days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');

          // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
          // WICHTIG: NICHT ÄNDERN! KRITISCHE GESCHÄFTSLOGIK!
          // Die Stundenberechnung MUSS die excludeFromCalculations-Eigenschaft der Schichten beachten!
          // Schichten mit excludeFromCalculations=true werden in der Tabelle angezeigt,
          // aber ihre Stunden werden NICHT in die Gesamtsumme einberechnet.
          // Diese Logik ist essentiell für die korrekte Arbeitszeiterfassung!
          // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

          const dayAssignments = assignments
            .filter(a => 
              format(new Date(a.date), 'yyyy-MM-dd') === dateStr && 
              a.employeeId === employee.id
            )
            // Sortiere nach Schicht-ID um konsistente Reihenfolge zu gewährleisten
            .sort((a, b) => (a.shiftId || '').localeCompare(b.shiftId || ''));

          // Stunden nur für aktive Schichten addieren
          totalHours += dayAssignments.reduce((sum, a) => {
            const shift = shifts.find(s => s.id === a.shiftId);
            return shift?.excludeFromCalculations ? sum : sum + (a.workHours || 0);
          }, 0);

          // Wenn keine Schichten, leeren String zurückgeben
          if (dayAssignments.length === 0) return '';
          
          // Schichten für diesen Tag, Duplikate entfernen
          const uniqueShifts = new Set(
            dayAssignments
              .map(a => {
                const shift = shifts.find(s => s.id === a.shiftId);
                return shift?.title || '';
              })
              .filter(Boolean)
          );

          return Array.from(uniqueShifts).join('\n');
        });

        // Nur Mitarbeiter mit mindestens einer Schicht aufnehmen
        if (totalHours === 0) return null;

        return [
          employee.firstName,
          ...rowData,
          ''
        ];
      })
      .filter(row => row !== null);

    // Workbook erstellen
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Zellenbreiten anpassen
    const colWidths = [
      { wch: 15 }, // Mitarbeiterspalte
      ...Array(days.length).fill({ wch: 5 }), // Tagesspalten
      { wch: 6 }, // Gesamtspalte
    ];
    ws['!cols'] = colWidths;

    // Zeilenhöhen anpassen (für Zeilenumbrüche)
    const rowHeights = Array(data.length + 1).fill({ hpt: 30 }); // 30 Punkte Höhe
    ws['!rows'] = rowHeights;

    // Styling für den Header
    const headerStyle = {
      font: { 
        bold: true,
        name: 'Helvetica LT Std',
        size: 16,
        color: { rgb: '000000' }
      },
      fill: {
        fgColor: { rgb: 'E0E0E0' },
        patternType: 'solid'
      },
      alignment: { 
        horizontal: 'center',
        vertical: 'center'
      },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    };

    // Styling für normale Zellen
    const normalStyle = {
      font: {
        name: 'Helvetica LT Std',
        size: 16,
        color: { rgb: '000000' }
      },
      alignment: { 
        vertical: 'center',
        horizontal: 'center'
      },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    };

    // Styling für Wochenenden
    const weekendStyle = {
      ...normalStyle,
      fill: { 
        fgColor: { rgb: 'F5F5F5' },
        patternType: 'solid'
      }
    };

    // Styling für die Gesamtspalte
    const totalStyle = {
      ...normalStyle,
      font: { 
        bold: true,
        name: 'Helvetica LT Std',
        size: 16,
        color: { rgb: '000000' }
      },
      fill: {
        fgColor: { rgb: 'E0E0E0' },
        patternType: 'solid'
      }
    };

    // Styles anwenden
    for (let i = 0; i < headers.length; i++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
      if (!ws[cellRef].s) ws[cellRef].s = {};
      Object.assign(ws[cellRef].s, headerStyle);
    }

    // Styles für Datenzellen
    for (let row = 1; row <= data.length; row++) {
      for (let col = 0; col < headers.length; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cellRef]) ws[cellRef] = { v: '', s: {} };
        if (!ws[cellRef].s) ws[cellRef].s = {};

        if (col === 0) {
          // Mitarbeiterspalte
          Object.assign(ws[cellRef].s, { 
            ...normalStyle, 
            font: { 
              ...normalStyle.font,
              size: 12,  
              bold: true,
              name: 'Helvetica LT Std'
            },
            alignment: { 
              horizontal: 'left' 
            } 
          });
        } else if (col === headers.length - 1) {
          // Gesamtspalte
          Object.assign(ws[cellRef].s, totalStyle);
        } else {
          // Normale Tage und Wochenenden
          const day = days[col - 1];
          const dayOfWeek = getDay(day);
          const isWeekend = [0, 6].includes(dayOfWeek);
          const style = isWeekend ? weekendStyle : normalStyle;

          Object.assign(ws[cellRef].s, style);
        }
      }
    }

    // Worksheet zum Workbook hinzufügen
    XLSX.utils.book_append_sheet(wb, ws, 'Dienstplan'); // 'Dientsplan');

    // Excel-Datei speichern
    const month = format(currentDate, 'MMMM_yyyy', { locale: de });
    XLSX.writeFile(wb, `Arbeitsplan_${storeName}_${month}.xlsx`);
    toast.success('Excel-Datei wurde erfolgreich erstellt');

  } catch (error) {
    console.error('Fehler beim Excel-Export:', error);
    toast.error('Fehler beim Erstellen der Excel-Datei');
  }
};
