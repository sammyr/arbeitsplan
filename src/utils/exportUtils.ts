import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { de } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';

interface Employee {
  id: string;
  firstName: string;
  lastName?: string;
}

interface WorkingShift {
  id: string;
  title: string;
  priority?: number;
}

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
  shifts: WorkingShift[],
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
      'Gesamt'
    ];

    const data = employees.map(employee => {
      let totalHours = 0;
      const rowData = days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayAssignments = assignments.filter(a => 
          format(new Date(a.date), 'yyyy-MM-dd') === dateStr && 
          a.employeeId === employee.id
        );

        // Stunden addieren
        totalHours += dayAssignments.reduce((sum, a) => sum + (a.workHours || 0), 0);

        // Schichten für diesen Tag
        if (dayAssignments.length === 0) return '';
        
        return dayAssignments
          .map(a => shifts.find(s => s.id === a.shiftId)?.title || '')
          .filter(title => title)
          .join('\n');
      });

      return [
        `${employee.firstName} ${employee.lastName || ''}`,
        ...rowData,
        totalHours.toFixed(1)
      ];
    });

    // Workbook erstellen
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Zellenbreiten anpassen
    const colWidths = [
      { wch: 25 }, // Mitarbeiterspalte
      ...Array(days.length).fill({ wch: 10 }), // Tagesspalten
      { wch: 12 }, // Gesamtspalte
    ];
    ws['!cols'] = colWidths;

    // Zeilenhöhen anpassen (für Zeilenumbrüche)
    const rowHeights = Array(data.length + 1).fill({ hpt: 30 }); // 30 Punkte Höhe
    ws['!rows'] = rowHeights;

    // Styling für den Header
    const headerStyle = {
      fill: { fgColor: { rgb: "4F81BD" } }, // Blauer Hintergrund
      font: { 
        bold: true, 
        color: { rgb: "FFFFFF" } 
      },
      alignment: { 
        horizontal: "center",
        vertical: "center",
        wrapText: true
      },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
      }
    };

    // Styling für normale Zellen
    const normalStyle = {
      alignment: { 
        vertical: "center",
        wrapText: true
      },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
      }
    };

    // Styling für Wochenenden
    const weekendStyle = {
      ...normalStyle,
      fill: { fgColor: { rgb: "F2F2F2" } } // Hellgrauer Hintergrund
    };

    // Styling für die Gesamtspalte
    const totalStyle = {
      ...normalStyle,
      font: { bold: true },
      fill: { fgColor: { rgb: "E6E6E6" } },
      alignment: { horizontal: "center" }
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
          Object.assign(ws[cellRef].s, { ...normalStyle, alignment: { horizontal: "left" } });
        } else if (col === headers.length - 1) {
          // Gesamtspalte
          Object.assign(ws[cellRef].s, totalStyle);
        } else {
          // Normale Tage und Wochenenden
          const day = days[col - 1];
          const isWeekend = [0, 6].includes(getDay(day));
          Object.assign(ws[cellRef].s, isWeekend ? weekendStyle : normalStyle);
        }
      }
    }

    // Titel hinzufügen
    const title = `Arbeitsplan ${storeName} - ${format(currentDate, 'MMMM yyyy', { locale: de })}`;
    const titleRow = [{ v: title, s: { font: { bold: true, size: 14 } } }];
    XLSX.utils.sheet_add_aoa(ws, [titleRow], { origin: -1 });

    // Worksheet zum Workbook hinzufügen
    XLSX.utils.book_append_sheet(wb, ws, 'Arbeitsplan');

    // Excel-Datei speichern
    const month = format(currentDate, 'MMMM_yyyy', { locale: de });
    XLSX.writeFile(wb, `Arbeitsplan_${storeName}_${month}.xlsx`);
    toast.success('Excel-Datei wurde erfolgreich erstellt');

  } catch (error) {
    console.error('Fehler beim Excel-Export:', error);
    toast.error('Fehler beim Erstellen der Excel-Datei');
  }
};

export const printCalendar = (
  assignments: ShiftAssignment[],
  employees: Employee[],
  shifts: WorkingShift[],
  currentDate: Date,
  storeName: string
) => {
  try {
    // Druckbaren Bereich erstellen
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup wurde blockiert');
      return;
    }

    // Tage des Monats
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Tabellendaten vorbereiten
    const tableRows = employees.map(employee => {
      let totalHours = 0;
      const rowData = days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayAssignments = assignments.filter(a => 
          format(new Date(a.date), 'yyyy-MM-dd') === dateStr && 
          a.employeeId === employee.id
        );

        // Stunden addieren
        totalHours += dayAssignments.reduce((sum, a) => sum + (a.workHours || 0), 0);

        // Schichten für diesen Tag
        const dayShifts = dayAssignments
          .map(a => {
            const shift = shifts.find(s => s.id === a.shiftId);
            return shift?.title || '';
          })
          .filter(title => title)
          .join('\n');

        const isWeekend = [0, 6].includes(getDay(day));
        return `<td class="${isWeekend ? 'weekend' : ''}" style="white-space: pre-line;">${dayShifts}</td>`;
      }).join('');

      return `
        <tr>
          <td class="employee-name">${employee.firstName} ${employee.lastName || ''}</td>
          ${rowData}
          <td class="total">${totalHours.toFixed(1)}</td>
        </tr>
      `;
    }).join('');

    // HTML für die Tabelle erstellen
    const tableHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Arbeitsplan ${storeName}</title>
          <style>
            @media print {
              @page {
                size: landscape;
                margin: 1cm;
              }
              body { 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            body { 
              font-family: Arial, sans-serif;
              margin: 20px;
              font-size: 11px;
            }
            h2 {
              margin-bottom: 20px;
              color: #333;
            }
            table { 
              border-collapse: collapse; 
              width: 100%;
              margin-top: 10px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 4px;
              text-align: center;
              min-width: 25px;
              height: 25px;
            }
            th { 
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .weekend { 
              background-color: #f0f0f0;
            }
            .employee-name { 
              text-align: left;
              padding-left: 8px;
              font-weight: bold;
              min-width: 120px;
            }
            .total { 
              font-weight: bold;
              background-color: #f5f5f5;
            }
          </style>
        </head>
        <body>
          <h2>Arbeitsplan ${storeName} - ${format(currentDate, 'MMMM yyyy', { locale: de })}</h2>
          <table>
            <thead>
              <tr>
                <th>Mitarbeiter</th>
                ${days.map(day => `
                  <th class="${[0, 6].includes(getDay(day)) ? 'weekend' : ''}">${format(day, 'd')}</th>
                `).join('')}
                <th>Gesamt</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // HTML in das neue Fenster schreiben
    printWindow.document.write(tableHTML);
    printWindow.document.close();

    // Warten bis alles geladen ist und dann drucken
    setTimeout(() => {
      printWindow.print();
      // Fenster schließen nach dem Drucken
      printWindow.onafterprint = () => printWindow.close();
    }, 500);

  } catch (error) {
    console.error('Fehler beim Drucken:', error);
    toast.error('Fehler beim Drucken');
  }
};
