'use client';

import { useState, useEffect } from 'react';
import { Employee } from '@/types/employee';
import { dbService } from '@/lib/db';
import { MdEdit, MdDelete } from 'react-icons/md';
import { useAuth } from '@/contexts/AuthContext';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

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

  const { user } = useAuth();

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      if (!user?.uid) {
        console.log('No user ID available');
        return;
      }
      
      console.log('Loading employees for organization:', user.uid);
      const data = await dbService.getEmployeesByOrganization(user.uid);
      console.log('Raw employee data:', data);
      
      // Filter out any undefined or invalid entries
      const validEmployees = data.filter((employee: Employee) =>
        employee && employee.id && employee.organizationId === user.uid
      );
      
      console.log('Filtered employees:', validEmployees);
      setEmployees(validEmployees);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Fehler beim Laden der Mitarbeiter');
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Sie müssen angemeldet sein');
      return;
    }

    setIsSubmitting(true);

    try {
      const employeeData = {
        ...formData,
        organizationId: user?.uid,
        updatedAt: new Date().toISOString(),
      };

      if (editingEmployee) {
        await dbService.updateEmployee(editingEmployee.id, employeeData);
        setEmployees(prev => prev.map(emp =>
          emp.id === editingEmployee.id
            ? { ...emp, ...employeeData, organizationId: user.uid }
            : emp
        ));
        toast.success('Mitarbeiter erfolgreich aktualisiert');
      } else {
        const newEmployee = await dbService.addEmployee({
          ...employeeData,
          organizationId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setEmployees(prev => [...prev, newEmployee]);
        toast.success('Mitarbeiter erfolgreich erstellt');
      }

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        mobilePhone: '',
      });
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error(editingEmployee 
        ? 'Fehler beim Aktualisieren des Mitarbeiters'
        : 'Fehler beim Hinzufügen des Mitarbeiters'
      );
    } finally {
      setIsSubmitting(false);
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
      console.log('Attempting to delete employee with ID:', id);
      await dbService.deleteEmployeeWithAssignments(id);
      console.log('Employee deleted successfully');
      await loadEmployees();
      toast.success('Mitarbeiter wurde erfolgreich gelöscht');
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Fehler beim Löschen des Mitarbeiters');
    }
  };

  const handleSendInvite = async (employee: Employee) => {
    if (!employee.email) {
      toast.error('Keine E-Mail-Adresse für diesen Mitarbeiter vorhanden');
      return;
    }

    try {
      const inviteToken = Math.random().toString(36).substring(2, 15);
      
      await setDoc(doc(db, 'invites', inviteToken), {
        employeeId: employee.id,
        email: employee.email,
        adminId: user?.uid,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });

      const inviteLink = `${window.location.origin}/auth/register?token=${inviteToken}`;
      toast.success('Einladungslink generiert');
      console.log('Invite Link:', inviteLink);

      await navigator.clipboard.writeText(inviteLink);
      toast.success('Einladungslink wurde in die Zwischenablage kopiert');

    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Fehler beim Senden der Einladung');
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-4 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
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

        {/* Formular */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
                  Vorname
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="z.B. Max"
                  className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                  focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                  transition-colors duration-200"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
                  Nachname
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  placeholder="z.B. Mustermann"
                  className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                  focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                  transition-colors duration-200"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  E-Mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="z.B. max.mustermann@firma.de"
                  className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                  focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                  transition-colors duration-200"
                />
              </div>

              <div>
                <label htmlFor="mobilePhone" className="block text-sm font-medium text-slate-700">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="mobilePhone"
                  name="mobilePhone"
                  value={formData.mobilePhone}
                  onChange={handleInputChange}
                  required
                  placeholder="z.B. +49 123 45678900"
                  className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                  focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                  transition-colors duration-200"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              {editingEmployee && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingEmployee(null);
                    setFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      mobilePhone: '',
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
                >
                  Abbrechen
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Wird gespeichert...
                  </>
                ) : (
                  editingEmployee ? 'Aktualisieren' : 'Mitarbeiter hinzufügen'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Mitarbeiterliste */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="bg-slate-50">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    E-Mail
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Telefon
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-slate-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {employee.firstName} {employee.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{employee.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{employee.mobilePhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-emerald-600 hover:text-emerald-900 transition-colors duration-150"
                        >
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => handleSendInvite(employee)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                        >
                          Einladen
                        </button>
                        <button
                          onClick={() => handleKillEmployee(employee.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-150"
                        >
                          Löschen
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
