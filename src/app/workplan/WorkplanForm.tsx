'use client';

import { useForm } from 'react-hook-form';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarEvent } from '@/types/calendar';
import { Shift } from '@/types/shift';

interface WorkplanFormData {
  date: string;
  shift: string;
  employeeName: string;
  store: string;
}

interface WorkplanFormProps {
  isOpen: boolean;
  event: CalendarEvent | null;
  storeId: string;
  onClose: () => void;
  selectedDate: Date | null;
  onCreate: (shiftData: { 
    employeeId: string; 
    shiftId: string; 
    startTime: string; 
    endTime: string;
    date: string;
  }) => Promise<void>;
  onUpdate: (oldShift: any, newShiftData: any, newWorkingShift: any) => Promise<void>;
}

export default function WorkplanForm({
  isOpen,
  event,
  storeId,
  onClose,
  selectedDate,
  onCreate,
  onUpdate
}: WorkplanFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<WorkplanFormData>();

  const onSubmit = async (data: WorkplanFormData) => {
    try {
      await addDoc(collection(db, 'workplan'), {
        ...data,
        createdAt: new Date(),
      });
      reset();
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-6 py-5">
            <h2 className="text-2xl font-bold text-white text-center tracking-wide">
              Neue Schicht planen
            </h2>
          </div>
          
          {/* Form Fields */}
          <div className="p-8 space-y-6">
            {/* Datum */}
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Datum
              </label>
              <div className="relative">
                <input
                  type="date"
                  {...register('date', { required: 'Datum ist erforderlich' })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>
              {errors.date && (
                <p className="mt-2 text-sm text-red-500 font-medium">{errors.date.message}</p>
              )}
            </div>

            {/* Schicht */}
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Schicht
              </label>
              <div className="relative">
                <select
                  {...register('shift', { required: 'Schicht ist erforderlich' })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200 bg-gray-50 hover:bg-white appearance-none"
                >
                  <option value="">Schicht auswählen</option>
                  <option value="Früh">Früh (06:00 - 14:00)</option>
                  <option value="Spät">Spät (14:00 - 22:00)</option>
                  <option value="Nacht">Nacht (22:00 - 06:00)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {errors.shift && (
                <p className="mt-2 text-sm text-red-500 font-medium">{errors.shift.message}</p>
              )}
            </div>

            {/* Mitarbeiter */}
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mitarbeiter
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register('employeeName', { required: 'Mitarbeitername ist erforderlich' })}
                  placeholder="Name des Mitarbeiters"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>
              {errors.employeeName && (
                <p className="mt-2 text-sm text-red-500 font-medium">{errors.employeeName.message}</p>
              )}
            </div>

            {/* Filiale */}
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filiale
              </label>
              <div className="relative">
                <select
                  {...register('store', { required: 'Filiale ist erforderlich' })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200 bg-gray-50 hover:bg-white appearance-none"
                >
                  <option value="">Filiale auswählen</option>
                  <option value="Berlin Mitte">Berlin Mitte</option>
                  <option value="Berlin Nord">Berlin Nord</option>
                  <option value="Berlin Süd">Berlin Süd</option>
                  <option value="Berlin Ost">Berlin Ost</option>
                  <option value="Berlin West">Berlin West</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {errors.store && (
                <p className="mt-2 text-sm text-red-500 font-medium">{errors.store.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Schicht hinzufügen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
