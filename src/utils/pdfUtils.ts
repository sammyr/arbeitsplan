import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

interface Employee {
  id: string;
  firstName: string;
  lastName?: string;
}

interface WorkingShift {
  id: string;
  title: string;
  employeeId: string;
  date: string;
  workHours: number;
  priority: number;
}

interface ShiftAssignment {
  id: string;
  employeeId: string;
  shiftId: string;
  date: string;
}

interface Store {
  name: string;
}

interface Assignment {
  id: string;
  employeeId: string;
  employee?: Employee;
  date: string;
  workHours: number;
  shiftId: string;
  shift?: WorkingShift;
}

export const exportCalendarToPDF = async (
  assignments: ShiftAssignment[],
  employees: Employee[],
  shifts: WorkingShift[],
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

    // Setze Schriftart und Größe
    doc.setFontSize(12);
    
    // Titel
    const month = format(currentDate, 'MMMM yyyy', { locale: de });
    doc.text(`Arbeitsplan ${storeName} - ${month}`, 20, 20);

    // Tage des Monats
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    console.log('Erstelle Tabellendaten...');

    // Tabellendaten vorbereiten
    const tableData = employees.map(employee => {
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

    console.log('Erstelle Spaltenköpfe...');

    // Spaltenköpfe
    const headers = [
      'Mitarbeiter',
      ...days.map(day => format(day, 'd')),
      'Gesamt'
    ];

    console.log('Erstelle Tabelle...');

    // Tabelle erstellen
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 30,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 2,
        overflow: 'linebreak',
        minCellHeight: 8
      },
      columnStyles: {
        0: { cellWidth: 35 },
        [headers.length - 1]: { cellWidth: 20 }
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index > 0 && data.column.index < headers.length - 1) {
          const day = days[data.column.index - 1];
          if ([0, 6].includes(getDay(day))) {
            doc.setFillColor(240, 240, 240);
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
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
