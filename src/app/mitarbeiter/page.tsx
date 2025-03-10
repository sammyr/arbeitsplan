'use client';

import { useState, useEffect } from 'react';
import { Employee } from '@/types/employee';
import { dbService } from '@/lib/db';
import { MdEdit, MdDelete } from 'react-icons/md';
import { useAuth } from '@/contexts/AuthContext';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone: string;
  birthday: string;
  storeId?: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    mobilePhone: '',
    birthday: '',
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
      console.log('Raw employee data:', JSON.stringify(data, null, 2));
      
      // Filter out any undefined or invalid entries and ensure birthday format
      const validEmployees = data.filter((employee: Employee) =>
        employee && employee.id && employee.organizationId === user.uid
      ).map((employee: Employee) => {
        // Ensure birthday is in correct format
        if (employee.birthday && employee.birthday.includes('-')) {
          // Convert YYYY-MM-DD to DD.MM.YYYY
          const [year, month, day] = employee.birthday.split('-');
          employee.birthday = `${day}.${month}.${year}`;
        }
        return employee;
      });
      
      console.log('Filtered employees:', JSON.stringify(validEmployees, null, 2));
      setEmployees(validEmployees);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Fehler beim Laden der Mitarbeiter');
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      let formattedBirthday = '';
      if (formData.birthday) {
        try {
          // Konvertiere YYYY-MM-DD zu DD.MM.YYYY
          const date = new Date(formData.birthday + 'T00:00:00');
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          formattedBirthday = `${day}.${month}.${year}`;
          console.log('Saving birthday:', formattedBirthday);
        } catch (error) {
          console.error('Error formatting birthday for save:', error);
          formattedBirthday = formData.birthday;
        }
      }

      const employeeData = {
        ...formData,
        birthday: formattedBirthday,
        organizationId: user.uid,
        updatedAt: new Date().toISOString(),
      };

      console.log('Submitting employee data:', employeeData);

      if (editingEmployee) {
        console.log('Updating existing employee with ID:', editingEmployee.id);
        
        const updateData = {
          ...employeeData,
          firstName: employeeData.firstName || editingEmployee.firstName,
          organizationId: user.uid,
        };
        
        console.log('Update data:', updateData);
        await dbService.updateEmployee(editingEmployee.id, updateData);
        
        setEmployees(prev => prev.map(emp =>
          emp.id === editingEmployee.id
            ? { ...emp, ...updateData }
            : emp
        ));
        
        toast.success('Mitarbeiter erfolgreich aktualisiert');
      } else {
        if (!employeeData.firstName) {
          toast.error('Vorname ist erforderlich');
          return;
        }

        console.log('Adding new employee');
        const newEmployee = await dbService.addEmployee({
          ...employeeData,
          organizationId: user.uid,
          createdAt: new Date().toISOString(),
        });
        setEmployees(prev => [...prev, newEmployee]);
        toast.success('Mitarbeiter erfolgreich erstellt');
      }

      // Formular zurücksetzen
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        mobilePhone: '',
        birthday: '',
      });
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error(editingEmployee 
        ? 'Fehler beim Aktualisieren des Mitarbeiters'
        : 'Fehler beim Hinzufügen des Mitarbeiters'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    let formattedBirthday = '';
    if (employee.birthday) {
      try {
        if (employee.birthday.includes('.')) {
          // Konvertiere DD.MM.YYYY zu YYYY-MM-DD
          const [day, month, year] = employee.birthday.split('.');
          formattedBirthday = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else if (employee.birthday.includes('-')) {
          // Bereits im YYYY-MM-DD Format
          formattedBirthday = employee.birthday;
        }
        console.log('Original birthday:', employee.birthday);
        console.log('Formatted birthday:', formattedBirthday);
      } catch (error) {
        console.error('Error formatting birthday:', error);
      }
    }

    setEditingEmployee(employee);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName || "",
      email: employee.email || "",
      mobilePhone: employee.mobilePhone || "",
      birthday: formattedBirthday,
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

        {/* Form Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6">
            {editingEmployee ? 'Mitarbeiter bearbeiten' : 'Mitarbeiter hinzufügen'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Formular-Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Linke Spalte */}
              <div className="space-y-6">
                {/* Vorname */}
                <div>
                  <label htmlFor="firstName" className="block text-base font-medium text-slate-700 mb-2">
                    Vorname *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                      focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                      transition-colors duration-200"
                    required
                  />
                </div>

                {/* E-Mail */}
                <div>
                  <label htmlFor="email" className="block text-base font-medium text-slate-700 mb-2">
                    E-Mail
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                      focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                      transition-colors duration-200"
                  />
                </div>

                {/* Geburtstag */}
                <div>
                  <label htmlFor="birthday" className="block text-base font-medium text-slate-700 mb-2">
                    Geburtstag
                  </label>
                  <input
                    type="date"
                    name="birthday"
                    id="birthday"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                      focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                      transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Rechte Spalte */}
              <div className="space-y-6">
                {/* Nachname */}
                <div>
                  <label htmlFor="lastName" className="block text-base font-medium text-slate-700 mb-2">
                    Nachname
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                      focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                      transition-colors duration-200"
                  />
                </div>

                {/* Mobilnummer */}
                <div>
                  <label htmlFor="mobilePhone" className="block text-base font-medium text-slate-700 mb-2">
                    Mobilnummer
                  </label>
                  <input
                    type="tel"
                    name="mobilePhone"
                    id="mobilePhone"
                    value={formData.mobilePhone}
                    onChange={handleInputChange}
                    placeholder="+49 123 45678900"
                    className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                      focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                      transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    mobilePhone: '',
                    birthday: '',
                  });
                  setEditingEmployee(null);
                }}
                className="px-6 py-2.5 text-base font-medium rounded-lg border border-slate-300 
                  text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-base font-medium rounded-lg border border-transparent 
                  text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Speichert...' : editingEmployee ? 'Aktualisieren' : 'Hinzufügen'}
              </button>
            </div>
          </form>
        </div>

        {/* Mitarbeiterliste */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-white">
                  <th scope="col" className="px-6 py-2 border-b border-slate-200">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Name</div>
                  </th>
                  <th scope="col" className="px-6 py-2 border-b border-slate-200">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider text-left">E-Mail</div>
                  </th>
                  <th scope="col" className="px-6 py-2 border-b border-slate-200">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Mobilnummer</div>
                  </th>
                  <th scope="col" className="px-6 py-2 border-b border-slate-200">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Geburtstag</div>
                  </th>
                  <th scope="col" className="px-6 py-2 border-b border-slate-200">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Aktionen</div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.firstName} {employee.lastName || ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <a href={`mailto:${employee.email || ""}`} className="text-emerald-600 hover:text-emerald-800">
                          {employee.email || ""}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {employee.mobilePhone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {employee.birthday || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-emerald-600 hover:text-emerald-800"
                          title="Bearbeiten"
                        >
                          <MdEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleKillEmployee(employee.id)}
                          className="text-emerald-600 hover:text-emerald-800"
                          title="Löschen"
                        >
                          <MdDelete className="h-5 w-5" />
                        </button>
                        {employee.email && (
                          <button
                            onClick={() => handleSendInvite(employee)}
                            className="text-emerald-600 hover:text-emerald-800"
                            title="Einladung senden"
                          >
                            Einladen
                          </button>
                        )}
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
