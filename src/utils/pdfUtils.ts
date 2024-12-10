import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
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
  workHours: number;
}

interface ShiftAssignment {
  id: string;
  employeeId: string;
  shiftId: string;
  date: string;
  storeId: string;
  workHours: number;
  employee?: Employee;
  shift?: WorkingShift;
}

interface Store {
  name: string;
}

interface Assignment {
  id: string;
  employeeId: string;
  shiftId: string;
  date: string;
  storeId: string;
  workHours: number;
  employee?: Employee;
  shift?: WorkingShift;
}

export const exportCalendarToPDF = async (
  calendarElement: HTMLElement | null,
  store: Store,
  currentDate: Date,
  assignments: Assignment[]
) => {
  if (!calendarElement) {
    console.error('Calendar element not found');
    toast.error('Kalender konnte nicht gefunden werden');
    return;
  }

  try {
    console.log('Starting PDF export with:', {
      hasCalendarElement: !!calendarElement,
      store: store.name,
      date: format(currentDate, 'MMMM yyyy'),
      assignmentsCount: assignments.length
    });

    // Create PDF in landscape mode
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Capture calendar view
    console.log('Capturing calendar view...');
    const canvas = await html2canvas(calendarElement, {
      scale: 1.5,
      useCORS: true,
      logging: true,
      windowWidth: calendarElement.scrollWidth,
      windowHeight: calendarElement.scrollHeight,
      width: calendarElement.scrollWidth,
      height: calendarElement.scrollHeight
    });
    
    console.log('Calendar captured, converting to image...', {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height
    });
    const imgData = canvas.toDataURL('image/png');

    // Add calendar image to first page
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calculate the maximum width and height that will fit on the page
    const maxWidth = pdfWidth - 20;
    const maxHeight = pdfHeight - 20;
    
    // Calculate the scale ratio while maintaining aspect ratio
    const widthRatio = maxWidth / imgWidth;
    const heightRatio = maxHeight / imgHeight;
    const ratio = Math.min(widthRatio, heightRatio);
    
    // Calculate the centered position
    const scaledWidth = imgWidth * ratio;
    const scaledHeight = imgHeight * ratio;
    const imgX = (pdfWidth - scaledWidth) / 2;
    const imgY = (pdfHeight - scaledHeight) / 2;

    console.log('Adding calendar to PDF with dimensions:', {
      pdfWidth,
      pdfHeight,
      imgWidth,
      imgHeight,
      scaledWidth,
      scaledHeight,
      imgX,
      imgY
    });

    pdf.addImage(
      imgData,
      'PNG',
      imgX,
      imgY,
      scaledWidth,
      scaledHeight
    );

    // Add new page for hours table
    console.log('Creating hours table...');
    pdf.addPage();

    // Group assignments by employee
    console.log('Processing assignments for hours table...');
    const employeeHours = assignments.reduce((acc, assignment) => {
      if (!assignment.employee) {
        console.log('Skipping assignment without employee:', assignment);
        return acc;
      }

      const employeeId = assignment.employee.id;
      const employeeName = `${assignment.employee.firstName} ${assignment.employee.lastName || ''}`.trim();
      
      if (!acc[employeeId]) {
        acc[employeeId] = {
          name: employeeName,
          totalHours: 0,
          assignments: []
        };
      }

      acc[employeeId].assignments.push(assignment);
      acc[employeeId].totalHours += Number(assignment.workHours) || 0;

      return acc;
    }, {} as Record<string, { name: string; totalHours: number; assignments: Assignment[] }>);

    // Create hours table
    const tableData = Object.values(employeeHours)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(({ name, totalHours }) => [
        name || 'Unbekannt',
        totalHours.toFixed(1)
      ]);

    console.log('Hours table data:', tableData);

    if (tableData.length === 0) {
      pdf.setFontSize(12);
      pdf.text('Keine Arbeitsstunden für diesen Monat gefunden.', 10, 20);
    } else {
      try {
        const headers = [['Mitarbeiter', 'Gesamtstunden']];
        
        // Configure table
        const startY = 20;
        const options = {
          startY,
          head: headers,
          body: tableData,
          theme: 'grid',
          styles: {
            fontSize: 10,
            cellPadding: 5
          },
          headStyles: {
            fillColor: [66, 66, 66]
          }
        };

        // Add table to PDF
        if (typeof (pdf as any).autoTable === 'function') {
          (pdf as any).autoTable(options);
        } else {
          console.error('autoTable is not available');
          throw new Error('PDF table generation failed');
        }
      } catch (tableError) {
        console.error('Error generating table:', tableError);
        pdf.setFontSize(12);
        pdf.text('Fehler beim Erstellen der Stundentabelle', 10, 30);
      }
    }

    // Save PDF
    const fileName = `Arbeitsplan_${store.name}_${format(currentDate, 'MM-yyyy')}.pdf`;
    console.log('Saving PDF:', fileName);
    pdf.save(fileName);
    toast.success('PDF wurde erfolgreich erstellt');

  } catch (error) {
    console.error('Error exporting calendar to PDF:', error);
    toast.error('Fehler beim Erstellen der PDF');
  }
};
