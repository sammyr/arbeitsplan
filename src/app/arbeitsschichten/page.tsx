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
      };

      await addShift(newShift);
      toast.success('Schicht erfolgreich erstellt');
      setNewShiftTitle('');
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
      };

      await updateShift(editingShift.id, updatedShift);
      toast.success('Schicht erfolgreich aktualisiert');
      setEditingShift(null);
      setNewShiftTitle('');
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

      <div className="mt-16 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider" >
                  Schicht
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Aktionen</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {/* Debug log entfernt für Production Build */}
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
                      disabled={isLoading}
                    >
                      <MdEdit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(shift.id)}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200"
                      title="Löschen"
                      disabled={isLoading}
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
