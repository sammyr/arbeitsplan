'use client';

import { useState, useEffect } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { dbService } from '@/lib/db';
import { toast } from 'react-hot-toast';
import { Employee } from '@/types/employee';
import { Store } from '@/types/store';
import { WorkingShift } from '@/types/working-shift';
import { ShiftAssignment } from '@/types/shift-assignment';
import { useAuth } from '@/contexts/AuthContext';
import { addDoc, collection, getDocs, query, where, deleteDoc, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ImportData {
  arbeitsplan_db: {
    employees?: Employee[];
    stores?: Store[];
    workingShifts?: WorkingShift[];
    assignments?: ShiftAssignment[];
  };
}

export default function ImportPage() {
  const [isImporting, setIsImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importText, setImportText] = useState<string>('');
  const [exportText, setExportText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const { user } = useAuth();

  // Funktion zum Laden der Stores
  const loadStores = async () => {
    if (!user?.uid) return;
    
    const storesSnapshot = await getDocs(
      query(collection(db, 'stores'), where('organizationId', '==', user.uid))
    );
    const storesData = storesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Store));
    // setStores(storesData);
  };

  // Effekt zum Laden der Stores beim Mounten
  useEffect(() => {
    loadStores();
  }, [user]);

  // Hilfsfunktion zur Validierung der Import-Daten
  const validateData = (data: any): data is ImportData => {
    if (!data?.arbeitsplan_db) {
      return false;
    }

    return (
      typeof data.arbeitsplan_db === 'object' &&
      Array.isArray(data.arbeitsplan_db.employees) &&
      Array.isArray(data.arbeitsplan_db.stores) &&
      Array.isArray(data.arbeitsplan_db.workingShifts) &&
      Array.isArray(data.arbeitsplan_db.assignments)
    );
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== 'application/json') {
        toast.error('Bitte nur JSON-Dateien hochladen');
        return;
      }
      const text = await file.text();
      setImportText(text);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/json') {
        toast.error('Bitte nur JSON-Dateien hochladen');
        return;
      }
      const text = await file.text();
      setImportText(text);
    }
  };

  const handleImport = async () => {
    if (!user?.uid) {
      toast.error('Bitte melden Sie sich an');
      return;
    }

    if (!importText) {
      toast.error('Bitte wählen Sie eine Datei aus');
      return;
    }

    try {
      const importData = JSON.parse(importText);
      
      if (!importData.arbeitsplan_db) {
        toast.error('Ungültiges Dateiformat');
        return;
      }

      const batch = writeBatch(db);
      let importCount = 0;

      // Temporäre Maps für ID-Zuordnungen
      const employeeIdMap = new Map();
      const storeIdMap = new Map();
      const shiftIdMap = new Map();

      // Importiere Mitarbeiter
      if (Array.isArray(importData.arbeitsplan_db.mitarbeiter)) {
        for (const employee of importData.arbeitsplan_db.mitarbeiter) {
          const employeeRef = doc(db, 'mitarbeiter', employee.id);
          const employeeData = {
            firstName: employee.firstName || '',
            lastName: employee.lastName || '',
            email: employee.email || '',
            mobilePhone: employee.mobilePhone || '',  
            role: employee.role || 'employee',
            color: employee.color || '#' + Math.floor(Math.random()*16777215).toString(16), 
            workHours: employee.workHours || 40, 
            organizationId: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          batch.set(employeeRef, employeeData);
          employeeIdMap.set(employee.id, employee.id);  // Behalte die originale ID
          importCount++;
        }
      }

      // Importiere Filialen
      if (Array.isArray(importData.arbeitsplan_db.stores)) {
        for (const store of importData.arbeitsplan_db.stores) {
          const storeRef = doc(db, 'stores', store.id);
          const storeData = {
            name: store.name || '',
            address: store.address || '',
            phone: store.phone || '',
            email: store.email || '',
            organizationId: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          batch.set(storeRef, storeData);
          storeIdMap.set(store.id, store.id);  // Behalte die originale ID
          importCount++;
        }
      }

      // Importiere Schichten
      if (Array.isArray(importData.arbeitsplan_db.workingShifts)) {
        for (const shift of importData.arbeitsplan_db.workingShifts) {
          const shiftRef = doc(db, 'workingShifts', shift.id);
          const shiftData = {
            title: shift.title || '',  
            startTime: shift.startTime || '',
            endTime: shift.endTime || '',
            workHours: shift.workHours || 8,
            color: shift.color || '#' + Math.floor(Math.random()*16777215).toString(16), 
            organizationId: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          batch.set(shiftRef, shiftData);
          shiftIdMap.set(shift.id, shift.id);  // Behalte die originale ID
          importCount++;
        }
      }

      // Importiere Zuweisungen
      if (Array.isArray(importData.arbeitsplan_db.assignments)) {
        for (const assignment of importData.arbeitsplan_db.assignments) {
          // Prüfe ob die referenzierten IDs existieren
          const employeeId = employeeIdMap.get(assignment.employeeId);
          const storeId = storeIdMap.get(assignment.storeId);
          const shiftId = shiftIdMap.get(assignment.shiftId);

          if (!employeeId || !storeId || !shiftId) {
            console.warn('Überspringe Assignment wegen fehlender Referenz:', assignment);
            continue;
          }

          const assignmentRef = doc(collection(db, 'assignments'));
          batch.set(assignmentRef, {
            employeeId,
            storeId,
            shiftId,
            date: assignment.date,
            workHours: assignment.workHours || 8,
            organizationId: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          importCount++;
        }
      }

      await batch.commit();
      toast.success(`${importCount} Datensätze erfolgreich importiert`);
      setImportText('');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Fehler beim Import: ' + (error as Error).message);
    }
  };

  const handleExport = async () => {
    if (!user?.uid) {
      toast.error('Bitte melden Sie sich an');
      return;
    }

    try {
      // Hole alle Mitarbeiter
      const employeesSnapshot = await getDocs(
        collection(db, 'mitarbeiter')
      );
      const employees = employeesSnapshot.docs
        .filter(doc => doc.data().organizationId === user.uid)
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            workHours: data.workHours || 0,
            role: data.role || '',
            color: data.color || ''
          };
        });

      // Hole alle Schichten
      const shiftsSnapshot = await getDocs(
        collection(db, 'workingShifts')
      );
      const shifts = shiftsSnapshot.docs
        .filter(doc => doc.data().organizationId === user.uid)
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            startTime: data.startTime || '',
            endTime: data.endTime || '',
            color: data.color || ''
          };
        });

      // Hole alle Zuweisungen
      const assignmentsSnapshot = await getDocs(
        collection(db, 'assignments')
      );
      const assignments = assignmentsSnapshot.docs
        .filter(doc => doc.data().organizationId === user.uid)
        .map(doc => {
          const data = doc.data();
          return {
            employeeId: data.employeeId || '',
            storeId: data.storeId || '',
            shiftId: data.shiftId || '',
            date: data.date || '',
            workHours: data.workHours || 0
          };
        });

      // Hole alle Filialen
      const storesSnapshot = await getDocs(
        collection(db, 'stores')
      );
      const stores = storesSnapshot.docs
        .filter(doc => doc.data().organizationId === user.uid)
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || ''
          };
        });

      // Erstelle das Export-Objekt
      const exportData = {
        arbeitsplan_db: {
          employees,
          stores,
          workingShifts: shifts,
          assignments
        }
      };

      // Konvertiere zu JSON mit Einrückung
      const jsonString = JSON.stringify(exportData, null, 2);

      // Erstelle und triggere den Download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arbeitsplan_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Export erfolgreich');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Fehler beim Export: ' + (error as Error).message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Daten importieren/exportieren</h1>
      
      <div className="flex gap-4">
        {/* Import-Bereich */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-2">Import</h2>
          
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer text-gray-600"
            >
              <div className="flex flex-col items-center">
                <svg 
                  className="w-12 h-12 mb-3 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mb-2 text-sm">
                  <span className="font-semibold">Klicken Sie zum Hochladen</span> oder ziehen Sie eine Datei hierher
                </p>
                <p className="text-xs text-gray-500">JSON-Datei</p>
              </div>
            </label>
          </div>

          {importText && (
            <div className="mt-4">
              <button
                onClick={handleImport}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Importieren
              </button>
            </div>
          )}
        </div>

        {/* Export-Bereich */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-2">Export</h2>
          <button
            onClick={handleExport}
            disabled={!user}
            className={`w-full justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              !user
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
            }`}
          >
            Alle Daten exportieren
          </button>
        </div>
      </div>

      {/* Debug-Anzeige */}
      {importText && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Vorschau der Import-Daten</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
            {importText}
          </pre>
        </div>
      )}
    </div>
  );
}
