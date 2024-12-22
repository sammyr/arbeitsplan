'use client';

import { useState } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { Store } from '@/types/store';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast'; // Assuming you have react-hot-toast installed

type StoreFormData = Omit<Store, 'id' | 'createdAt' | 'updatedAt'>;

interface StoreFormProps {
  store?: Store;
  onClose: () => void;
}

const germanStates = [
  'Baden-Württemberg',
  'Bayern',
  'Berlin',
  'Brandenburg',
  'Bremen',
  'Hamburg',
  'Hessen',
  'Mecklenburg-Vorpommern',
  'Niedersachsen',
  'Nordrhein-Westfalen',
  'Rheinland-Pfalz',
  'Saarland',
  'Sachsen',
  'Sachsen-Anhalt',
  'Schleswig-Holstein',
  'Thüringen',
];

export default function StoreForm({ store, onClose }: StoreFormProps) {
  const { addStore, updateStore } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<StoreFormData>({
    defaultValues: store ? {
      name: store.name,
      street: store.street,
      houseNumber: store.houseNumber,
      zipCode: store.zipCode,
      city: store.city,
      state: store.state
    } : undefined
  });

  const onSubmit = async (data: StoreFormData) => {
    try {
      setIsSubmitting(true);
      const now = new Date().toISOString();
      if (store) {
        await updateStore(store.id, { ...data, updatedAt: now });
      } else {
        await addStore({ ...data, createdAt: now, updatedAt: now });
      }
      onClose();
      toast.success(store ? 'Filiale erfolgreich aktualisiert' : 'Filiale erfolgreich hinzugefügt');
    } catch (error) {
      console.error('Error saving store:', error);
      toast.error('Fehler beim Speichern der Filiale');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Filialname
        </label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'Filialname ist erforderlich' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="street" className="block text-sm font-medium text-gray-700">
          Straße
        </label>
        <input
          type="text"
          id="street"
          {...register('street', { required: 'Straße ist erforderlich' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.street && (
          <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700">
          Hausnummer
        </label>
        <input
          type="text"
          id="houseNumber"
          {...register('houseNumber', { required: 'Hausnummer ist erforderlich' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.houseNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.houseNumber.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
          PLZ
        </label>
        <input
          type="text"
          id="zipCode"
          {...register('zipCode', { required: 'PLZ ist erforderlich' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.zipCode && (
          <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
          Stadt
        </label>
        <input
          type="text"
          id="city"
          {...register('city', { required: 'Stadt ist erforderlich' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.city && (
          <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="state" className="block text-sm font-medium text-gray-700">
          Bundesland
        </label>
        <select
          id="state"
          {...register('state', { required: 'Bundesland ist erforderlich' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Bitte wählen...</option>
          {germanStates.map(state => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        {errors.state && (
          <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Speichert...' : store ? 'Filiale aktualisieren' : 'Filiale hinzufügen'}
        </button>
      </div>
    </form>
  );
}
