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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg text-left transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <Dialog.Title 
                    as="h3" 
                    className="text-lg font-semibold leading-6 text-gray-900 mb-3"
                    id="modal-title"
                  >
                    Schicht zuweisen für {format(date, 'dd.MM.yyyy')}
                  </Dialog.Title>

                  <div className="space-y-3">
                    {/* Mitarbeiter-Auswahl */}
                    <div>
                      <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-1">
                        Mitarbeiter
                      </label>
                      <select
                        id="employee"
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                      >
                        <option value="">Bitte auswählen</option>
                        {employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {`${employee.firstName} ${employee.lastName}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Schicht-Auswahl */}
                    <div>
                      <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">
                        Schicht
                      </label>
                      <select
                        id="shift"
                        value={selectedShift}
                        onChange={(e) => setSelectedShift(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                      >
                        <option value="">Bitte auswählen</option>
                        {shifts.map((shift) => (
                          <option key={shift.id} value={shift.id}>
                            {shift.title} ({shift.workHours}h)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Fehlermeldung */}
                    {error && (
                      <div className="rounded-md bg-red-50 p-2 mt-2" role="alert">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-2">
                            <p className="text-sm text-red-700">
                              {error}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      className="rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      onClick={onClose}
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      onClick={handleSave}
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
