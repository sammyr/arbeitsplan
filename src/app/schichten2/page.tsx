'use client';

import { useState, useEffect } from 'react';
import { WorkingShift } from '@/types/working-shift';
import { dbService } from '@/lib/db';
import { MdEdit, MdDelete } from 'react-icons/md';
import { toast } from 'react-hot-toast';

export default function Schichten2Page() {
  const [shifts, setShifts] = useState<WorkingShift[]>([]);
  const [newShiftTitle, setNewShiftTitle] = useState('');
  const [editingShift, setEditingShift] = useState<WorkingShift | null>(null);

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      console.log('Loading shifts...');
      const loadedShifts = await dbService.getWorkingShifts();
      console.log('Loaded shifts:', loadedShifts);
      setShifts(loadedShifts);
    } catch (error) {
      console.error('Error loading shifts:', error);
      toast.error('Fehler beim Laden der Schichten');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newShiftTitle.trim()) {
      toast.error('Bitte geben Sie einen Titel ein');
      return;
    }

    try {
      const newShift: Omit<WorkingShift, 'id'> = {
        title: newShiftTitle.trim(),
        employeeId: '',
        date: new Date().toISOString(),
        startTime: '09:00',
        endTime: '17:00',
        shiftId: '',
        storeId: '',
        workHours: 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await dbService.addWorkingShift(newShift);
      toast.success('Schicht erfolgreich erstellt');
      setNewShiftTitle('');
      loadShifts();
    } catch (error) {
      console.error('Error creating shift:', error);
      toast.error('Fehler beim Erstellen der Schicht');
    }
  };

  const handleEdit = (shift: WorkingShift) => {
    setEditingShift(shift);
    setNewShiftTitle(shift.title);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingShift) return;

    if (!newShiftTitle.trim()) {
      toast.error('Bitte geben Sie einen Titel ein');
      return;
    }

    try {
      const updatedShift: Partial<WorkingShift> = {
        title: newShiftTitle.trim(),
        updatedAt: new Date().toISOString(),
      };

      await dbService.updateWorkingShift(editingShift.id, updatedShift);
      toast.success('Schicht erfolgreich aktualisiert');
      setEditingShift(null);
      setNewShiftTitle('');
      loadShifts();
    } catch (error) {
      console.error('Error updating shift:', error);
      toast.error('Fehler beim Aktualisieren der Schicht');
    }
  };

  const handleCancel = () => {
    setEditingShift(null);
    setNewShiftTitle('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Möchten Sie diese Schicht wirklich löschen?')) {
      try {
        await dbService.deleteWorkingShift(id);
        toast.success('Schicht erfolgreich gelöscht');
        loadShifts();
      } catch (error) {
        console.error('Error deleting shift:', error);
        toast.error('Fehler beim Löschen der Schicht');
      }
    }
  };

  return (
    <div className="container mx-auto p-4 bg-transparent">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Arbeitszeiten (DB)</h1>
        <p className="text-slate-600">
          Liste aller Arbeitszeiten mit direkter Datenbankanbindung.
        </p>
      </div>

      <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-semibold text-slate-800">Schicht hinzufügen</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-base font-medium text-slate-700 mb-2">
              Schichtbezeichnung
            </label>
            <input
              type="text"
              value={newShiftTitle}
              onChange={(e) => setNewShiftTitle(e.target.value)}
              className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                transition-colors duration-200"
              placeholder="z.B. Frühschicht"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          {editingShift && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 text-base font-medium rounded-lg border border-slate-300 
                text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
            >
              Abbrechen
            </button>
          )}
          <button
            type="submit"
            onClick={editingShift ? handleUpdate : handleSubmit}
            className="px-6 py-2.5 text-base font-medium rounded-lg border border-transparent 
              text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
          >
            {editingShift ? 'Aktualisieren' : 'Hinzufügen'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Schicht
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Aktionen</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {shifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-slate-50 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {shift.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(shift)}
                      className="text-emerald-600 hover:text-emerald-900 mr-4 transition-colors duration-200"
                      title="Bearbeiten"
                    >
                      <MdEdit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(shift.id)}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200"
                      title="Löschen"
                    >
                      <MdDelete className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
