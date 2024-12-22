'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Employee } from '@/types';

interface EmployeeFormProps {
  employee: Employee | null;
  onSave: (employee: Employee) => void;
  onCancel: () => void;
}

export default function EmployeeForm({ employee, onSave, onCancel }: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Employee>();

  useEffect(() => {
    if (employee) {
      reset(employee);
    }
  }, [employee, reset]);

  const onSubmit = (data: Employee) => {
    onSave({
      ...data,
      id: employee?.id || '',
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-lg font-medium mb-6">
          {employee ? 'Edit Employee' : 'Add Employee'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vorname *
            </label>
            <input
              type="text"
              {...register('firstName', { required: 'Vorname ist erforderlich' })}
              className="mt-1 block w-full rounded-md border-emerald-500 shadow-sm focus:border-emerald-500 focus:ring-0"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nachname
            </label>
            <input
              type="text"
              {...register('lastName')}
              className="mt-1 block w-full rounded-md border-emerald-500 shadow-sm focus:border-emerald-500 focus:ring-0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              {...register('email', {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Ungültige Email-Adresse',
                },
              })}
              className="mt-1 block w-full rounded-md border-emerald-500 shadow-sm focus:border-emerald-500 focus:ring-0"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Telefon
            </label>
            <input
              type="tel"
              {...register('phone')}
              className="mt-1 block w-full rounded-md border-emerald-500 shadow-sm focus:border-emerald-500 focus:ring-0"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              {employee ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
