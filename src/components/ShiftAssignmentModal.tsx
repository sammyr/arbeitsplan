import { Employee } from '@/types/employee';
import { ShiftDefinition } from '@/types';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { format } from 'date-fns';

interface ShiftAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeId: string, shiftId: string, workHours: number) => void;
  employees: Employee[];
  shifts: ShiftDefinition[];
  date: Date;
  initialEmployeeId?: string;
  initialShiftId?: string;
  initialWorkHours?: number;
}

const ShiftAssignmentModal: React.FC<ShiftAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employees,
  shifts,
  date,
  initialEmployeeId,
  initialShiftId,
  initialWorkHours = 8
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState(initialEmployeeId || '');
  const [selectedShift, setSelectedShift] = useState(initialShiftId || '');
  const [workHours, setWorkHours] = useState(initialWorkHours);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSelectedEmployee(initialEmployeeId || '');
      setSelectedShift(initialShiftId || '');
      setWorkHours(initialWorkHours);
    }
  }, [isOpen, initialEmployeeId, initialShiftId, initialWorkHours]);

  const handleSave = () => {
    setError('');
    if (!selectedEmployee) {
      setError('Bitte wählen Sie einen Mitarbeiter aus');
      return;
    }
    if (!selectedShift) {
      setError('Bitte wählen Sie eine Schicht aus');
      return;
    }
    if (workHours <= 0) {
      setError('Bitte geben Sie gültige Arbeitsstunden ein');
      return;
    }
    onSave(selectedEmployee, selectedShift, workHours);
    onClose();
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
                    Schicht zuweisen für den {format(date, 'dd.MM')}
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
                        className="block w-full px-4 py-3 text-base rounded-lg border-emerald-500 bg-white shadow-sm
                          focus:border-emerald-500 focus:ring-0 hover:border-emerald-300
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
                        className="block w-full px-4 py-3 text-base rounded-lg border-emerald-500 bg-white shadow-sm
                          focus:border-emerald-500 focus:ring-0 hover:border-emerald-300
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

                    {/* Arbeitsstunden */}
                    <div>
                      <label htmlFor="workHours" className="block text-base font-medium text-slate-700 mb-2">
                        Arbeitsstunden
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setWorkHours(Math.max(1, workHours - 1))}
                          className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          id="workHours"
                          value={workHours}
                          onChange={(e) => setWorkHours(Math.max(1, parseInt(e.target.value) || 0))}
                          className="block w-20 text-center px-4 py-3 text-base rounded-lg border-emerald-500 bg-white shadow-sm
                            focus:border-emerald-500 focus:ring-0 hover:border-emerald-300
                            transition-colors duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min="1"
                        />
                        <button
                          type="button"
                          onClick={() => setWorkHours(workHours + 1)}
                          className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
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
                        text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-0
                        transition-all duration-200"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-6 py-2.5 text-base font-medium rounded-lg border border-transparent 
                        text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-0
                        transition-all duration-200"
                    >
                      Speichern
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          
        </div>
      </Dialog>
    </Transition>
  );
};

export default ShiftAssignmentModal;
