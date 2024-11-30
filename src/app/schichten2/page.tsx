'use client';

import { useState, useEffect } from 'react';
import { WorkingShift } from '@/types/working-shift';
import { dbService } from '@/lib/db';
import { MdEdit, MdDelete } from 'react-icons/md';
import { toast } from 'react-hot-toast';

export default function Schichten2Page() {
  const [shifts, setShifts] = useState<WorkingShift[]>([]);
  const [newShiftTitle, setNewShiftTitle] = useState('');
  const [newShiftHours, setNewShiftHours] = useState('8');
  const [editingShift, setEditingShift] = useState<WorkingShift | null>(null);

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      const loadedShifts = await dbService.getWorkingShifts();
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

    const hours = parseFloat(newShiftHours);
    if (isNaN(hours) || hours <= 0) {
      toast.error('Bitte geben Sie eine gültige Anzahl von Arbeitsstunden ein');
      return;
    }

    try {
      const newShift: Omit<WorkingShift, 'id'> = {
        title: newShiftTitle.trim(),
        workHours: hours,
        employeeId: '',
        date: new Date().toISOString(),
        startTime: '09:00',
        endTime: '17:00',
        shiftId: '',
        storeId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await dbService.addWorkingShift(newShift);
      toast.success('Schicht erfolgreich erstellt');
      setNewShiftTitle('');
      setNewShiftHours('8');
      loadShifts();
    } catch (error) {
      console.error('Error creating shift:', error);
      toast.error('Fehler beim Erstellen der Schicht');
    }
  };

  const handleEdit = (shift: WorkingShift) => {
    setEditingShift(shift);
    setNewShiftTitle(shift.title);
    setNewShiftHours(shift.workHours.toString());
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingShift) return;

    if (!newShiftTitle.trim()) {
      toast.error('Bitte geben Sie einen Titel ein');
      return;
    }

    const hours = parseFloat(newShiftHours);
    if (isNaN(hours) || hours <= 0) {
      toast.error('Bitte geben Sie eine gültige Anzahl von Arbeitsstunden ein');
      return;
    }

    try {
      const updatedShift: Partial<WorkingShift> = {
        title: newShiftTitle.trim(),
        workHours: hours,
        updatedAt: new Date().toISOString(),
      };

      await dbService.updateWorkingShift(editingShift.id, updatedShift);
      toast.success('Schicht erfolgreich aktualisiert');
      setEditingShift(null);
      setNewShiftTitle('');
      setNewShiftHours('8');
      loadShifts();
    } catch (error) {
      console.error('Error updating shift:', error);
      toast.error('Fehler beim Aktualisieren der Schicht');
    }
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

  const handleCancel = () => {
    setEditingShift(null);
    setNewShiftTitle('');
    setNewShiftHours('8');
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Arbeitszeiten (DB)</h1>
          <p className="mt-2 text-sm text-gray-700">
            Liste aller Arbeitszeiten mit direkter Datenbankanbindung.
          </p>
        </div>
      </div>

      <form onSubmit={editingShift ? handleUpdate : handleSubmit} className="mt-8 space-y-6 bg-white py-6 px-4 shadow sm:rounded-lg sm:px-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Schichtbezeichnung
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="title"
                required
                value={newShiftTitle}
                onChange={(e) => setNewShiftTitle(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="z.B. Frühschicht"
              />
            </div>
          </div>

          <div>
            <label htmlFor="workHours" className="block text-sm font-medium text-gray-700">
              Arbeitsstunden
            </label>
            <div className="mt-1">
              <input
                type="number"
                id="workHours"
                value={newShiftHours}
                onChange={(e) => setNewShiftHours(e.target.value)}
                min="0.5"
                step="0.5"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="z.B. 8"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          {editingShift && (
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Abbrechen
            </button>
          )}
          <button
            type="submit"
            className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            {editingShift ? 'Aktualisieren' : 'Hinzufügen'}
          </button>
        </div>
      </form>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Schicht
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Arbeitsstunden
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Aktionen</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {shifts.map((shift) => (
                    <tr key={shift.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {shift.title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {shift.workHours}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleEdit(shift)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <MdEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(shift.id)}
                          className="text-red-600 hover:text-red-900"
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
      </div>
    </div>
  );
}
