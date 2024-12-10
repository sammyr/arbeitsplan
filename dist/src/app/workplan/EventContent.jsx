"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const fa_1 = require("react-icons/fa");
const EventContent = ({ employee, workingShift, shift, onDelete, onEdit, showAlert, refreshShifts, availableShifts, employees }) => {
    const [isEditing, setIsEditing] = (0, react_1.useState)(false);
    const handleDelete = async (e) => {
        e.stopPropagation();
        if (confirm(`Möchten Sie die Schicht von ${(employee === null || employee === void 0 ? void 0 : employee.name) || 'Unbekannt'} wirklich löschen?`)) {
            try {
                await onDelete(shift.id);
                showAlert(`Schicht von ${(employee === null || employee === void 0 ? void 0 : employee.name) || 'Unbekannt'} wurde gelöscht`, 'info');
                await refreshShifts();
            }
            catch (error) {
                console.error('Error deleting shift:', error);
                showAlert('Fehler beim Löschen der Schicht', 'error');
            }
        }
    };
    const handleEditClick = (e) => {
        e.stopPropagation();
        setIsEditing(true);
    };
    const updateShift = async (shiftId, employeeId) => {
        // Parse the date and times
        const [year, month, day] = shift.date.split('-').map(Number);
        const shiftDate = new Date(year, month - 1, day);
        const newWorkingShift = availableShifts.find(ws => ws.id === shiftId);
        const newEmployee = employees.find(e => e.id === parseInt(employeeId));
        if (!newWorkingShift) {
            showAlert('Fehler: Schicht nicht gefunden', 'error');
            return;
        }
        const [startHour, startMinute] = newWorkingShift.fromTime.split(':').map(Number);
        const [endHour, endMinute] = newWorkingShift.toTime.split(':').map(Number);
        const start = new Date(shiftDate);
        start.setHours(startHour, startMinute, 0);
        const end = new Date(shiftDate);
        end.setHours(endHour, endMinute, 0);
        // For night shifts where end time is before start time, add a day to end time
        if (end < start) {
            end.setDate(end.getDate() + 1);
        }
        setIsEditing(false);
        onEdit({
            id: shift.id,
            start,
            end,
            employeeId: parseInt(employeeId),
            shiftId,
            extendedProps: {
                shift: Object.assign(Object.assign({}, shift), { shiftId,
                    employeeId, startTime: newWorkingShift.fromTime, endTime: newWorkingShift.toTime }),
                employee: newEmployee,
                workingShift: newWorkingShift,
            },
        });
        showAlert('Schicht wurde aktualisiert', 'success');
    };
    return (<div className="relative group">
      <div className="text-xs">
        <strong>{(employee === null || employee === void 0 ? void 0 : employee.name) || 'Unknown Employee'}</strong>
        <br />
        <span>{(workingShift === null || workingShift === void 0 ? void 0 : workingShift.title) || 'Unknown Shift'}</span>
      </div>

      <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 rounded px-1 shadow-sm z-[60]">
        <button onClick={handleEditClick} className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded" title="Schicht bearbeiten">
          <fa_1.FaEdit size={14}/>
        </button>
        <button onClick={handleDelete} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded" title="Schicht löschen">
          <fa_1.FaTrash size={14}/>
        </button>
      </div>

      {isEditing && (<>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 relative z-[10000]" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Schicht bearbeiten</h3>
                <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <fa_1.FaTimes size={20}/>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mitarbeiter
                  </label>
                  <div className="border rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
                    {employees.map((emp) => (<div key={emp.id} className={`cursor-pointer p-3 hover:bg-blue-50 text-gray-700 transition-colors ${emp.id === (employee === null || employee === void 0 ? void 0 : employee.id) ? 'bg-blue-50 font-medium' : ''}`} onClick={() => updateShift(shift.shiftId, emp.id.toString())}>
                        {emp.name}
                      </div>))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schicht
                  </label>
                  <div className="border rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
                    {availableShifts.map((ws) => (<div key={ws.id} className={`cursor-pointer p-3 hover:bg-blue-50 text-gray-700 transition-colors ${ws.id === (shift === null || shift === void 0 ? void 0 : shift.shiftId) ? 'bg-blue-50 font-medium' : ''}`} onClick={() => updateShift(ws.id.toString(), shift.employeeId.toString())}>
                        {ws.title}
                      </div>))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>)}
    </div>);
};
exports.default = EventContent;
