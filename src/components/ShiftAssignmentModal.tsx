import { Employee } from '@/types/employee';
import { WorkingShift } from '@/types';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { format } from 'date-fns';

interface ShiftAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeId: string, shiftId: string) => void;
  employees: Employee[];
  shifts: WorkingShift[];
  date: Date;
}

const ShiftAssignmentModal: React.FC<ShiftAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employees,
  shifts,
  date,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedShift, setSelectedShift] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSave = () => {
    setError('');
    
    if (!selectedEmployee || !selectedShift) {
      setError('Bitte wählen Sie sowohl einen Mitarbeiter als auch eine Schicht aus.');
      return;
    }

    try {
      onSave(selectedEmployee, selectedShift);
      setSelectedEmployee('');
      setSelectedShift('');
      onClose();
    } catch (error) {
      setError('Fehler beim Speichern der Schichtzuweisung');
      console.error('Error in handleSave:', error);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-10" 
        onClose={onClose}
        aria-labelledby="modal-title"
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200">
                <div className="px-6 pb-6 pt-6">
                  <Dialog.Title 
                    as="h3" 
                    className="text-2xl font-semibold text-slate-800 mb-6"
                    id="modal-title"
                  >
                    Schicht zuweisen für {format(date, 'dd.MM.yyyy')}
                  </Dialog.Title>

                  <div className="space-y-4">
                    {/* Mitarbeiter-Auswahl */}
                    <div>
                      <label htmlFor="employee" className="block text-base font-medium text-slate-700 mb-2">
                        Mitarbeiter
                      </label>
                      <select
                        id="employee"
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                          focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                          transition-colors duration-200"
                      >
                        <option value="">Bitte auswählen</option>
                        {employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.firstName} {employee.lastName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Schicht-Auswahl */}
                    <div>
                      <label htmlFor="shift" className="block text-base font-medium text-slate-700 mb-2">
                        Schicht
                      </label>
                      <select
                        id="shift"
                        value={selectedShift}
                        onChange={(e) => setSelectedShift(e.target.value)}
                        className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                          focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                          transition-colors duration-200"
                      >
                        <option value="">Bitte auswählen</option>
                        {shifts.map((shift) => (
                          <option key={shift.id} value={shift.id}>
                            {shift.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {error && (
                      <div className="text-red-500 text-base mt-2">
                        {error}
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 text-base font-medium rounded-lg border border-slate-300 
                        text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 
                        focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-6 py-2.5 text-base font-medium rounded-lg border border-transparent 
                        text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 
                        focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
                    >
                      Speichern
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ShiftAssignmentModal;
