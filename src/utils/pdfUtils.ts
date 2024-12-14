import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { format, startOfMonth, endOfMonth, addDays, eachDayOfInterval, getDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { Employee, ShiftDefinition } from '@/types';
import { ShiftAssignment } from '@/types/shift-assignment';

export const exportCalendarToPDF = async (
  assignments: ShiftAssignment[],
  employees: Employee[],
  shifts: ShiftDefinition[],
  currentDate: Date,
  storeName: string
) => {
  try {
    console.log('Starte PDF Export mit:', {
      assignments: assignments.length,
      employees: employees.length,
      shifts: shifts.length,
      currentDate: currentDate.toISOString(),
      storeName
    });

    // Erstelle PDF im Querformat
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Setze kleinere Seitenränder
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10; // 10mm Rand

    // Titel des Dokuments
    const month = format(currentDate, 'MMMM yyyy', { locale: de });
    const title = `Dienstplan - ${month}`;
    
    // Titel zentriert und größer
    doc.setFontSize(24); // 10px größer als vorher
    doc.setFont('helvetica', 'bold');
    const titleWidth = doc.getTextWidth(title);
    const pageCenter = pageWidth / 2;
    doc.text(title, pageCenter, 20, { align: 'center' });
    
    // Zurück zur normalen Schriftgröße für den Rest des Dokuments
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');

    // Berechne verfügbare Breite für die Tabelle
    const tableWidth = pageWidth - (2 * margin);
    
    // Tage des Monats
    const startOfMonthDate = startOfMonth(currentDate);
    const endOfMonthDate = endOfMonth(currentDate);
    const days: Date[] = [];
    let currentDay = startOfMonthDate;
    
    while (currentDay <= endOfMonthDate) {
      days.push(currentDay);
      currentDay = addDays(currentDay, 1);
    }

    console.log('Erstelle Tabellendaten...');

    // Tabellenkopf erstellen
    const headers = [
      'Mitarbeiter',
      ...days.map(day => format(day, 'd')), // Nur den Tag als Zahl
      'G'
    ];

    // Debug-Ausgabe für Wochenenden
    days.forEach(day => {
      const dayNum = format(day, 'd');
      const dayOfWeek = getDay(day);
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        console.log(`Tag ${dayNum} ist ein ${dayOfWeek === 0 ? 'Sonntag' : 'Samstag'}`);
      }
    });

    // Tabellendaten vorbereiten
    const tableData = employees
      .map(employee => {
        let totalHours = 0;
        const rowData = days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');

          // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
          // WICHTIG: NICHT ÄNDERN! KRITISCHE GESCHÄFTSLOGIK!
          // Die Schichten an Wochenenden (Samstag/Sonntag) MÜSSEN immer angezeigt werden!
          // Diese Tage sind für die Dienstplanung essentiell und dürfen niemals ausgeblendet,
          // gefiltert oder anderweitig modifiziert werden.
          // Änderungen an dieser Logik können zu fehlerhafter Dienstplanung führen!
          // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

          const dayAssignments = assignments.filter(a => 
            format(new Date(a.date), 'yyyy-MM-dd') === dateStr && 
            a.employeeId === employee.id
          );

          // Stunden addieren
          totalHours += dayAssignments.reduce((sum, a) => sum + (a.workHours || 0), 0);

          // Wenn keine Schichten, leeren String zurückgeben
          if (dayAssignments.length === 0) return '';

          // Schichten für diesen Tag
          return dayAssignments
            .map(a => shifts.find(s => s.id === a.shiftId)?.title || '')
            .filter(title => title)
            .join('\n');
        });

        // Nur Mitarbeiter mit mindestens einer Schicht aufnehmen
        if (totalHours === 0) return null;

        return [
          employee.firstName,
          ...rowData,
          totalHours.toFixed(1)
        ];
      })
      .filter(row => row !== null);

    console.log('Erstelle Spaltenköpfe...');

    console.log('Erstelle Tabelle...');

    // Tabelle erstellen
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 40,
      theme: 'grid',
      tableWidth: tableWidth,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 13,
        fontStyle: 'bold',
        cellPadding: 1,
        overflow: 'linebreak',
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.2,
        minCellHeight: 8,
        fillColor: [255, 255, 255],
        font: 'helvetica',
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontSize: 11,
        fontStyle: 'normal',
        font: 'helvetica'
      },
      columnStyles: {
        0: { // Mitarbeiterspalte
          cellWidth: tableWidth * 0.12,
          halign: 'left',
          fontStyle: 'bold',
          fontSize: 9,
          font: 'helvetica'
        },
        [headers.length - 1]: { // Gesamtspalte (G)
          fontSize: 13,
          fontStyle: 'bold',
          cellWidth: tableWidth * 0.06,
          overflow: 'visible',
          font: 'helvetica'
        }
      },
      didParseCell: function(data) {
        data.cell.styles.overflow = 'linebreak';
        data.cell.styles.cellPadding = 1;
        data.cell.styles.valign = 'middle';
        
        // Setze die Ausrichtung für die Mitarbeiterspalte
        if (data.column.index === 0) {
          data.cell.styles.halign = 'left';
          if (data.section === 'body') {
            data.cell.styles.fontSize = 9;
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.font = 'helvetica';
          }
        } else if (data.section === 'body' || data.section === 'head') {
          // Für alle anderen Spalten
          if (data.column.index > 0 && data.column.index < headers.length - 1) {
            const daysWidth = (tableWidth * 0.82) / days.length;
            data.cell.styles.cellWidth = daysWidth;
            data.cell.styles.halign = 'center';
            
            if (data.section === 'head') {
              data.cell.styles.fontSize = 11;
              data.cell.styles.fontStyle = 'normal';
              data.cell.styles.font = 'helvetica';
            } else {
              data.cell.styles.fontSize = 13;
              data.cell.styles.fontStyle = 'bold'; 
              data.cell.styles.font = 'helvetica';

            }

            // Prüfe auf Wochenende
            const day = days[data.column.index - 1];
            const dayOfWeek = getDay(day);
            if (dayOfWeek === 6) { // Samstag
              data.cell.styles.fillColor = [255, 255, 200];
            } else if (dayOfWeek === 0) { // Sonntag
              data.cell.styles.fillColor = [220, 255, 220];
            }
          }
        }
      },
      willDrawCell: function(data) {
        // Hier können wir zusätzliche Anpassungen vornehmen, bevor die Zelle gezeichnet wird
        if (data.section === 'body' || data.section === 'head') {
          if (data.column.index > 0 && data.column.index < headers.length - 1) {
            const day = days[data.column.index - 1];
            const dayOfWeek = getDay(day);
            
            // Setze die Textfarbe immer auf Schwarz
            data.cell.styles.textColor = [0, 0, 0];
          }
        }
      }
    });

    console.log('Speichere PDF...');
    doc.save(`Arbeitsplan_${storeName}_${month}.pdf`);
    console.log('PDF erfolgreich erstellt!');

  } catch (error) {
    console.error('Fehler beim Erstellen der PDF:', error);
    throw error;
  }
};
