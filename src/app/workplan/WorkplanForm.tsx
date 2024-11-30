'use client';

import { useForm } from 'react-hook-form';
import { useState, useEffect, useMemo } from 'react';
import { dbService } from '@/lib/db';
import { Employee } from '@/types/employee';
import { Shift } from '@/types/shift';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { storage } from '@/lib/storage';
import { WorkingShift } from '@/types';
import { Store } from '@/types/store';

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  storeId: string;
  employeeId: string;
  shiftId: string;
  extendedProps: {
    shift: any;
    employee: any;
    workingShift: any;
  };
}

interface WorkplanFormProps {
  isOpen: boolean;
  event: Event | null;
  storeId: string;
  onClose: () => void;
  selectedDate: Date | null;
  onCreate: (shiftData: any) => Promise<void>;
  onUpdate: (oldShift: any, newShiftData: any, newWorkingShift: any) => Promise<void>;
}

interface FormData {
  employeeId: string;
  shiftId: string;
  date: string;
  storeId: string;
}

export default function WorkplanForm({ 
  isOpen, 
  event, 
  storeId: initialStoreId, 
  onClose, 
  selectedDate,
  onCreate,
  onUpdate 
}: WorkplanFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [workingShifts, setWorkingShifts] = useState<WorkingShift[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      storeId: initialStoreId,
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
    }
  });

  const selectedStore = watch('storeId');
  const selectedShift = watch('shiftId');

  const sortedEmployees = useMemo(() => {
    return employees
      .filter(emp => emp && emp.firstName && emp.lastName) // Filter out invalid employees
      .sort((a, b) => {
        const nameA = `${a.lastName}, ${a.firstName}`;
        const nameB = `${b.lastName}, ${b.firstName}`;
        return nameA.localeCompare(nameB, 'de');
      });
  }, [employees]);

  const sortedShifts = useMemo(() => {
    return workingShifts
      .filter(shift => shift && shift.title)
      .sort((a, b) => {
        return a.title.localeCompare(b.title, 'de');
      });
  }, [workingShifts]);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        // Lade Stores
        const storedStores = storage.getStores();
        if (mounted) {
          setStores(storedStores);
        }

        // Get shifts from storage first
        const storedShifts = await storage.getShifts();
        const filteredShifts = storedShifts.filter(shift =>
          !selectedStore || shift.storeId === selectedStore || !shift.storeId
        );

        // Get employees from database
        const employeesData = await dbService.getEmployees();
        
        if (!mounted) return;

        // Process stores first
        if (!storedStores?.length) {
          setError('storeId', {
            type: 'manual',
            message: 'Keine Filialen verfügbar. Bitte fügen Sie zuerst eine Filiale hinzu.'
          });
          setStores([]);
        }

        // Process employees
        if (!employeesData?.length) {
          setError('employeeId', { 
            type: 'manual', 
            message: 'Keine Mitarbeiter verfügbar. Bitte fügen Sie zuerst Mitarbeiter hinzu.' 
          });
          setEmployees([]);
        } else {
          setEmployees(employeesData
            .filter(emp => emp && emp.id && emp.firstName && emp.lastName)
            .map(emp => ({
              ...emp,
              id: emp.id.toString()
            }))
          );
        }

        // Process shifts
        if (!filteredShifts?.length) {
          setError('shiftId', {
            type: 'manual',
            message: 'Keine Schichten verfügbar. Bitte fügen Sie zuerst Schichten hinzu.'
          });
          setWorkingShifts([]);
        } else {
          setWorkingShifts(filteredShifts
            .filter(shift => shift && shift.id && shift.title)
            .map(shift => ({
              ...shift,
              id: shift.id.toString(),
              storeId: shift.storeId || selectedStore
            }))
          );
        }

        // Set initial values if editing and event exists
        if (event && mounted) {
          const employeeExists = employeesData?.some(e => e.id.toString() === event.employeeId.toString());
          const shiftExists = filteredShifts?.some(s => s.id.toString() === event.shiftId.toString());
          const storeExists = storedStores?.some(s => s.id.toString() === event.storeId.toString());
          
          if (employeeExists && shiftExists && storeExists) {
            setValue('employeeId', event.employeeId.toString());
            setValue('shiftId', event.shiftId.toString());
            setValue('storeId', event.storeId.toString());
          } else {
            setError('root', {
              type: 'manual',
              message: 'Die ausgewählten Daten sind nicht mehr verfügbar.'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        setError('root', {
          type: 'manual',
          message: error instanceof Error ? error.message : 'Fehler beim Laden der Daten. Bitte versuchen Sie es später erneut.'
        });
      }
    }

    fetchData();
    return () => { mounted = false; };
  }, [event, setValue, setError, selectedStore]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      if (!selectedDate) {
        throw new Error('Kein Datum ausgewählt');
      }

      // Ensure employee ID is a string and exists
      const employeeId = data.employeeId.toString();
      const employee = employees.find(e => e.id.toString() === employeeId);
      if (!employee) {
        throw new Error('Ausgewählter Mitarbeiter wurde nicht gefunden');
      }

      // Ensure shift exists
      const workingShift = workingShifts.find(ws => ws.id.toString() === data.shiftId.toString());
      if (!workingShift) {
        throw new Error('Ausgewählte Schicht wurde nicht gefunden');
      }

      // Verify employee still exists in database
      const employeeExists = await dbService.getEmployee(employeeId);
      if (!employeeExists) {
        throw new Error('Der ausgewählte Mitarbeiter existiert nicht mehr in der Datenbank');
      }

      // Check for overlapping shifts
      const existingShifts = await dbService.getShiftsByStore(selectedStore);
      const overlappingShift = existingShifts.find(shift => {
        if (event && shift.id === event.id) return false; // Exclude current shift if editing
        if (shift.employeeId !== employeeId) return false;
        if (shift.date !== format(selectedDate, 'yyyy-MM-dd')) return false;
        
        return true;
      });

      if (overlappingShift) {
        throw new Error('Der Mitarbeiter hat bereits eine Schicht in diesem Zeitraum');
      }

      // Create shift data object
      const shiftData = {
        id: event?.id || crypto.randomUUID(),
        employeeId: employeeId,
        shiftId: data.shiftId,
        storeId: selectedStore,
        date: format(selectedDate, 'yyyy-MM-dd'),
        title: `${employee.firstName} ${employee.lastName} - ${workingShift.title}`,
        employee: employee,
        workingShift: workingShift
      };

      if (event) {
        await onUpdate(event, shiftData, workingShift);
      } else {
        await onCreate(shiftData);
      }

      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('root', {
        type: 'manual',
        message: error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = useMemo(() => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="storeId" className="block text-sm font-medium text-gray-700">
          Filiale
        </label>
        <select
          id="storeId"
          {...register('storeId', { required: 'Bitte wählen Sie eine Filiale aus' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
        {errors.storeId && (
          <p className="mt-1 text-sm text-red-600">{errors.storeId.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Mitarbeiter
        </label>
        <select
          {...register('employeeId', { required: 'Bitte wählen Sie einen Mitarbeiter aus' })}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.employeeId ? 'border-red-500' : ''
          }`}
        >
          <option value="">Mitarbeiter auswählen</option>
          {sortedEmployees.map(employee => (
            <option key={employee.id} value={employee.id}>
              {`${employee.lastName}, ${employee.firstName}`}
            </option>
          ))}
        </select>
        {errors.employeeId && (
          <p className="mt-1 text-sm text-red-500">{errors.employeeId.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Schicht
        </label>
        <select
          {...register('shiftId', { required: 'Bitte wählen Sie eine Schicht aus' })}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.shiftId ? 'border-red-500' : ''
          }`}
        >
          <option value="">Schicht auswählen</option>
          {sortedShifts.map(shift => (
            <option key={shift.id} value={shift.id}>
              {shift.title}
            </option>
          ))}
        </select>
        {errors.shiftId && (
          <p className="mt-1 text-sm text-red-500">{errors.shiftId.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="text-sm text-red-500">{errors.root.message}</p>
      )}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Wird gespeichert...' : event ? 'Aktualisieren' : 'Erstellen'}
        </button>
      </div>
    </form>
  ), [register, handleSubmit, onSubmit, errors, onClose, isSubmitting, event, sortedEmployees, sortedShifts]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg p-8 max-w-lg w-full">
          <h2 className="text-lg font-medium mb-4">
            {event ? 'Schicht bearbeiten' : 'Neue Schicht erstellen'}
          </h2>
          {formContent}
        </div>
      </div>
    </div>
  );
}
