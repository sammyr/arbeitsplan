"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("@headlessui/react");
const react_2 = require("react");
const date_fns_1 = require("date-fns");
const ShiftAssignmentModal = ({ isOpen, onClose, onSave, employees, shifts, date, initialEmployeeId, initialShiftId, initialWorkHours = 8 }) => {
    const [selectedEmployee, setSelectedEmployee] = (0, react_2.useState)(initialEmployeeId || '');
    const [selectedShift, setSelectedShift] = (0, react_2.useState)(initialShiftId || '');
    const [workHours, setWorkHours] = (0, react_2.useState)(initialWorkHours);
    const [error, setError] = (0, react_2.useState)('');
    (0, react_2.useEffect)(() => {
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
    return (<react_1.Transition appear show={isOpen} as={react_2.Fragment}>
      <react_1.Dialog as="div" className="relative z-10" onClose={onClose} aria-labelledby="modal-title">
        {/* Backdrop */}
        <react_1.Transition.Child as={react_2.Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0"/>
        </react_1.Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          
            <react_1.Transition.Child as={react_2.Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <react_1.Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200">
                <div className="px-6 pb-6 pt-6">
                  <react_1.Dialog.Title as="h3" className="text-2xl font-semibold text-slate-800 mb-6" id="modal-title">
                    Schicht zuweisen für den {(0, date_fns_1.format)(date, 'dd.MM')}
                  </react_1.Dialog.Title>

                  <div className="space-y-4">
                    {/* Mitarbeiter-Auswahl */}
                    <div>
                      <label htmlFor="employee" className="block text-base font-medium text-slate-700 mb-2">
                        Mitarbeiter
                      </label>
                      <select id="employee" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                          focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                          transition-colors duration-200">
                        <option value="">Bitte auswählen</option>
                        {employees.map((employee) => (<option key={employee.id} value={employee.id}>
                            {employee.firstName} {employee.lastName}
                          </option>))}
                      </select>
                    </div>

                    {/* Schicht-Auswahl */}
                    <div>
                      <label htmlFor="shift" className="block text-base font-medium text-slate-700 mb-2">
                        Schicht
                      </label>
                      <select id="shift" value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)} className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                          focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                          transition-colors duration-200">
                        <option value="">Bitte auswählen</option>
                        {shifts.map((shift) => (<option key={shift.id} value={shift.id}>
                            {shift.title}
                          </option>))}
                      </select>
                    </div>

                    {/* Arbeitsstunden */}
                    <div>
                      <label className="block text-base font-medium text-slate-700 mb-2">
                        Arbeitsstunden
                      </label>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => setWorkHours(Math.max(0, workHours - 0.5))} className="p-2 rounded-md border border-gray-300 hover:bg-gray-50">
                          -
                        </button>
                        <input type="number" value={workHours} onChange={(e) => setWorkHours(Math.max(0, parseFloat(e.target.value) || 0))} step="0.5" min="0" className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
                        <button onClick={() => setWorkHours(workHours + 0.5)} className="p-2 rounded-md border border-gray-300 hover:bg-gray-50">
                          +
                        </button>
                      </div>
                    </div>

                    {error && (<div className="text-red-500 text-base mt-2">
                        {error}
                      </div>)}
                  </div>

                  <div className="mt-8 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 text-base font-medium rounded-lg border border-slate-300 
                        text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 
                        focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200">
                      Abbrechen
                    </button>
                    <button type="button" onClick={handleSave} className="px-6 py-2.5 text-base font-medium rounded-lg border border-transparent 
                        text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 
                        focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200">
                      Speichern
                    </button>
                  </div>
                </div>
              </react_1.Dialog.Panel>
            </react_1.Transition.Child>
          
        </div>
      </react_1.Dialog>
    </react_1.Transition>);
};
exports.default = ShiftAssignmentModal;
