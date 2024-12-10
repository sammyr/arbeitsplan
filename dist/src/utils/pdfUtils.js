"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCalendarToPDF = void 0;
const jspdf_1 = __importDefault(require("jspdf"));
require("jspdf-autotable");
const html2canvas_1 = __importDefault(require("html2canvas"));
const date_fns_1 = require("date-fns");
const react_hot_toast_1 = require("react-hot-toast");
const exportCalendarToPDF = async (calendarElement, store, currentDate, assignments) => {
    if (!calendarElement) {
        console.error('Calendar element not found');
        react_hot_toast_1.toast.error('Kalender konnte nicht gefunden werden');
        return;
    }
    try {
        console.log('Starting PDF export with:', {
            hasCalendarElement: !!calendarElement,
            store: store.name,
            date: (0, date_fns_1.format)(currentDate, 'MMMM yyyy'),
            assignmentsCount: assignments.length
        });
        // Create PDF in landscape mode
        const pdf = new jspdf_1.default({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        // Capture calendar view
        console.log('Capturing calendar view...');
        const canvas = await (0, html2canvas_1.default)(calendarElement, {
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
        pdf.addImage(imgData, 'PNG', imgX, imgY, scaledWidth, scaledHeight);
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
        }, {});
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
        }
        else {
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
                if (typeof pdf.autoTable === 'function') {
                    pdf.autoTable(options);
                }
                else {
                    console.error('autoTable is not available');
                    throw new Error('PDF table generation failed');
                }
            }
            catch (tableError) {
                console.error('Error generating table:', tableError);
                pdf.setFontSize(12);
                pdf.text('Fehler beim Erstellen der Stundentabelle', 10, 30);
            }
        }
        // Save PDF
        const fileName = `Arbeitsplan_${store.name}_${(0, date_fns_1.format)(currentDate, 'MM-yyyy')}.pdf`;
        console.log('Saving PDF:', fileName);
        pdf.save(fileName);
        react_hot_toast_1.toast.success('PDF wurde erfolgreich erstellt');
    }
    catch (error) {
        console.error('Error exporting calendar to PDF:', error);
        react_hot_toast_1.toast.error('Fehler beim Erstellen der PDF');
    }
};
exports.exportCalendarToPDF = exportCalendarToPDF;
