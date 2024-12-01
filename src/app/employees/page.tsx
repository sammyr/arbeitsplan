'use client';

import { useState, useEffect } from 'react';
import { Employee } from '@/types/employee';
import { dbService } from '@/lib/db';
import { MdEdit, MdDelete } from 'react-icons/md';

interface EmployeeFormData {
  firstName: string;
  lastName?: string;
  email: string;
  mobilePhone: string;
  role?: string;
  storeId?: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    mobilePhone: '',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      const data = await dbService.getEmployees();
      console.log('Loaded employees:', data);
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingEmployee) {
        await dbService.updateEmployee(editingEmployee.id, formData);
      } else {
        // Add default values for required fields when creating a new employee
        const now = new Date().toISOString();
        const newEmployee = {
          ...formData,
          role: formData.role || 'user',
          storeId: formData.storeId || '1', // Default store ID
          createdAt: now,
          updatedAt: now,
        };
        await dbService.addEmployee(newEmployee);
      }
      await loadEmployees();
      setFormData({ firstName: '', lastName: '', email: '', mobilePhone: '' });
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error saving employee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Mitarbeiter löschen möchten?')) {
      return;
    }

    try {
      await dbService.deleteEmployee(id);
      await loadEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Fehler beim Löschen des Mitarbeiters');
    }
  };

  const handleKillEmployee = async (id: string) => {
    if (!confirm('ACHTUNG: Möchten Sie diesen Mitarbeiter wirklich MIT ALLEN SCHICHTZUWEISUNGEN löschen? Diese Aktion kann nicht rückgängig gemacht werden!')) {
      return;
    }

    try {
      await dbService.deleteEmployeeWithAssignments(id);
      await loadEmployees();
    } catch (error) {
      console.error('Error killing employee:', error);
      alert('Fehler beim vollständigen Löschen des Mitarbeiters');
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      mobilePhone: employee.mobilePhone,
    });
  };

  const handleCancel = () => {
    setEditingEmployee(null);
    setFormData({ firstName: '', lastName: '', email: '', mobilePhone: '' });
  };

  return (
    <div className="min-h-screen bg-transparent py-4 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Mitarbeiter</h1>
            <p className="mt-1 sm:mt-2 text-sm text-slate-600">
              Verwalten Sie hier Ihre Mitarbeiter und deren Kontaktdaten.
            </p>
          </div>
          <div className="flex items-center">
            <span className="text-sm bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-600">
              Gesamt Mitarbeiter: {employees.length}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
                  Vorname
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="pl-10 block w-full rounded-lg border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors duration-200 outline-none"
                    placeholder="Vorname"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
                  Nachname <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleInputChange}
                    className="pl-10 block w-full rounded-lg border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors duration-200 outline-none"
                    placeholder="Nachname (optional)"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  E-Mail
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 block w-full rounded-lg border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors duration-200 outline-none"
                    placeholder="email@beispiel.de"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="mobilePhone" className="block text-sm font-medium text-slate-700">
                  Mobiltelefon
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    id="mobilePhone"
                    name="mobilePhone"
                    required
                    value={formData.mobilePhone}
                    onChange={handleInputChange}
                    className="pl-10 block w-full rounded-lg border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors duration-200 outline-none"
                    placeholder="+49 123 45678900"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              {editingEmployee && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" clipRule="evenodd" />
                  </svg>
                  Abbrechen
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  {editingEmployee ? (
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  ) : (
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 01-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  )}
                </svg>
                {isSubmitting ? 'Wird gespeichert...' : (editingEmployee ? 'Aktualisieren' : 'Hinzufügen')}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Mitarbeiter
                  </th>
                  <th scope="col" className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    E-Mail
                  </th>
                  <th scope="col" className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Mobiltelefon
                  </th>
                  <th scope="col" className="relative px-4 sm:px-6 py-3">
                    <span className="sr-only">Aktionen</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-slate-50 transition-all duration-200">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-emerald-100/80 flex items-center justify-center">
                            <span className="text-emerald-700 font-medium text-base sm:text-lg">
                              {employee.firstName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 sm:ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {employee.firstName}
                          </div>
                          <div className="sm:hidden mt-1">
                            <a href={`mailto:${employee.email}`} className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline block">
                              {employee.email}
                            </a>
                            <a href={`tel:${employee.mobilePhone}`} className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline block mt-0.5">
                              {employee.mobilePhone}
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        <a href={`mailto:${employee.email}`} className="text-emerald-700 hover:text-emerald-800 hover:underline">
                          {employee.email}
                        </a>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        <a href={`tel:${employee.mobilePhone}`} className="text-emerald-700 hover:text-emerald-800 hover:underline">
                          {employee.mobilePhone}
                        </a>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1 sm:space-x-2">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="p-1.5 sm:p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
                          title="Bearbeiten"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id.toString())}
                          className="p-1.5 sm:p-2 text-rose-700 hover:bg-rose-50 rounded-lg transition-colors duration-200"
                          title="Löschen"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleKillEmployee(employee.id.toString())}
                          className="p-1.5 sm:p-2 text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Vollständig löschen (inkl. Schichten)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                          </svg>
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
  );
}
