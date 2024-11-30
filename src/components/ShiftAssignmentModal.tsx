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
        <div className="fixed inset-0 bg-black bg-opacity-25" />

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title 
                as="h3" 
                className="text-lg font-medium leading-6 text-gray-900"
                id="modal-title"
              >
                Schicht zuweisen
              </Dialog.Title>
              <div className="mt-2">
                <select
                  id="employee"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Mitarbeiter auswählen</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {`${employee.firstName} ${employee.lastName}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-2">
                <select
                  id="shift"
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Schicht auswählen</option>
                  {shifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.title} ({shift.workHours}h)
                    </option>
                  ))}
                </select>
              </div>
              {error && (
                <div className="mt-2 text-sm text-red-600" role="alert">
                  {error}
                </div>
              )}
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ShiftAssignmentModal;
