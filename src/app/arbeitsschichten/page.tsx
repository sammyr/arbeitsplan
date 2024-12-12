'use client';

import { useState } from 'react';
import { WorkingShift } from '@/types/working-shift';
import { MdEdit, MdDelete } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useShift } from '@/contexts/ShiftContext';

export default function ArbeitsschichtenPage() {
  const { user } = useAuth();
  const { shifts, addShift, updateShift, deleteShift } = useShift();
  const [newShiftTitle, setNewShiftTitle] = useState('');
  const [editingShift, setEditingShift] = useState<WorkingShift | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [excludeFromCalculations, setExcludeFromCalculations] = useState(false);
  const [priority, setPriority] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newShiftTitle.trim()) {
      toast.error('Bitte geben Sie einen Titel ein');
      return;
    }

    if (!user) {
      toast.error('Bitte melden Sie sich an');
      return;
    }

    try {
      setIsLoading(true);
      const newShift: Omit<WorkingShift, 'id'> = {
        title: newShiftTitle.trim(),
        employeeId: '',
        date: new Date().toISOString(),
        startTime: '09:00',
        endTime: '17:00',
        shiftId: '',
        storeId: '',
        workHours: 8,
        organizationId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        excludeFromCalculations,
        priority: priority || undefined,
      };

      await addShift(newShift);
      toast.success('Schicht erfolgreich erstellt');
      setNewShiftTitle('');
      setExcludeFromCalculations(false);
      setPriority(0);
    } catch (error) {
      console.error('Error creating shift:', error);
      toast.error('Fehler beim Erstellen der Schicht');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (shift: WorkingShift) => {
    setEditingShift(shift);
    setNewShiftTitle(shift.title);
    setExcludeFromCalculations(shift.excludeFromCalculations || false);
    setPriority(shift.priority || 0);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingShift) return;

    if (!newShiftTitle.trim()) {
      toast.error('Bitte geben Sie einen Titel ein');
      return;
    }

    try {
      setIsLoading(true);
      const updatedShift: Partial<WorkingShift> = {
        title: newShiftTitle.trim(),
        updatedAt: new Date().toISOString(),
        excludeFromCalculations,
        priority: priority || undefined,
      };

      await updateShift(editingShift.id, updatedShift);
      toast.success('Schicht erfolgreich aktualisiert');
      setEditingShift(null);
      setNewShiftTitle('');
      setExcludeFromCalculations(false);
      setPriority(0);
    } catch (error) {
      console.error('Error updating shift:', error);
      toast.error('Fehler beim Aktualisieren der Schicht');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingShift(null);
    setNewShiftTitle('');
    setExcludeFromCalculations(false);
    setPriority(0);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Möchten Sie diese Schicht wirklich löschen?')) {
      try {
        setIsLoading(true);
        await deleteShift(id);
        toast.success('Schicht erfolgreich gelöscht');
      } catch (error) {
        console.error('Error deleting shift:', error);
        toast.error('Fehler beim Löschen der Schicht');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 bg-transparent">
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Arbeitsschichten</h1>
            <p className="text-slate-600">
              Liste aller Arbeitsschichten. Fügen Sie neue Arbeitsschichten hinzu um diese im Arbeitsplan zu verwenden.
            </p>
          </div>
          <div className="flex items-center">
            <span className="text-sm bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-600">
              Gesamt Schichten: {shifts.length}
            </span>
          </div>
        </div>
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
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-base font-medium text-slate-700 mb-2">
              Schichtpriorität
            </label>
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              min="0"
              className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                transition-colors duration-200"
              placeholder="z.B. 1 für höchste Priorität"
              disabled={isLoading}
            />
            <p className="mt-1 text-sm text-slate-500">
              Bestimmt die Reihenfolge der Anzeige im Kalender. Niedrigere Zahlen werden zuerst angezeigt.
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="excludeFromCalculations"
              checked={excludeFromCalculations}
              onChange={(e) => setExcludeFromCalculations(e.target.checked)}
              className="h-4 w-4 text-emerald-500 border-slate-300 rounded focus:ring-emerald-500"
              disabled={isLoading}
            />
            <label htmlFor="excludeFromCalculations" className="ml-2 block text-sm text-slate-700">
              Stunden nicht berechnen und im Kalender ausblenden
            </label>
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
              disabled={isLoading}
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
            disabled={isLoading}
          >
            {editingShift ? 'Aktualisieren' : 'Hinzufügen'}
          </button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">
                      TITEL
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      PRIORITÄT
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      ERSTELLT AM
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      STATUS
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">
                      AKTIONEN
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {shifts
                    .sort((a, b) => (a.priority ?? Number.MAX_VALUE) - (b.priority ?? Number.MAX_VALUE))
                    .map((shift) => (
                    <tr key={shift.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                        {shift.title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        {shift.priority !== undefined ? shift.priority : '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        {new Date(shift.createdAt).toLocaleDateString('de-DE')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          shift.excludeFromCalculations
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {shift.excludeFromCalculations ? 'Inaktiv' : 'Aktiv'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(shift)}
                            className="text-emerald-600 hover:text-emerald-900"
                            title="Bearbeiten"
                          >
                            <MdEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(shift.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Löschen"
                          >
                            <MdDelete className="h-5 w-5" />
                          </button>
                        </div>
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
