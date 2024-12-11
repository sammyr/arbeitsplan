'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { WorkingShift } from '@/types/working-shift';
import { dbService } from '@/lib/db';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ShiftContextType {
  shifts: WorkingShift[];
  addShift: (shift: Omit<WorkingShift, 'id'>) => Promise<void>;
  updateShift: (id: string, shift: Partial<WorkingShift>) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  error: string | null;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export function ShiftProvider({ children }: { children: React.ReactNode }) {
  const [shifts, setShifts] = useState<WorkingShift[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadShifts();
    } else {
      setShifts([]);
    }
  }, [user]);

  const loadShifts = async () => {
    if (!user) {
      console.log('No user, clearing shifts');
      setShifts([]);
      return;
    }
    
    try {
      console.log('Loading shifts for organization:', user.uid);
      
      // Load all shifts
      const loadedShifts = await dbService.getWorkingShiftsByOrganization(user.uid);
      console.log('Raw loaded shifts:', loadedShifts.length, loadedShifts);
      
      // Verify each shift exists and is valid
      const validShifts = await Promise.all(
        loadedShifts.map(async (shift, index) => {
          if (!shift || !shift.id) {
            console.log(`Shift at index ${index} is invalid:`, shift);
            return null;
          }
          
          // Double check the shift still exists
          const shiftRef = doc(db, 'workingShifts', shift.id);
          const shiftDoc = await getDoc(shiftRef);
          
          if (!shiftDoc.exists()) {
            console.log(`Shift ${shift.id} no longer exists in Firestore`);
            return null;
          }
          
          const data = shiftDoc.data();
          if (!data || !data.title || !data.startTime || !data.endTime || !data.organizationId) {
            console.warn(`Invalid shift data found for ${shift.id}:`, data);
            await deleteDoc(shiftRef);
            return null;
          }
          
          console.log(`Valid shift found: ${shift.id} - ${shift.title}`);
          return shift;
        })
      );
      
      const filteredShifts = validShifts.filter((shift): shift is WorkingShift => shift !== null);
      console.log('Final shifts to be displayed:', filteredShifts.length, filteredShifts);
      
      setShifts(filteredShifts);
      setError(null);
    } catch (err) {
      console.error('Error loading shifts:', err);
      setError('Failed to load shifts');
      toast.error('Fehler beim Laden der Schichten');
    }
  };

  const addShift = async (shiftData: Omit<WorkingShift, 'id'>) => {
    try {
      const newShift = await dbService.addWorkingShift(shiftData);
      setShifts(prev => [...prev, newShift]);
      setError(null);
    } catch (err) {
      console.error('Error adding shift:', err);
      setError('Failed to add shift');
      throw err;
    }
  };

  const updateShift = async (id: string, shiftData: Partial<WorkingShift>) => {
    try {
      // First check if the shift exists in Firestore
      const shiftRef = doc(db, 'workingShifts', id);
      const shiftDoc = await getDoc(shiftRef);
      
      // If shift doesn't exist in Firestore but exists in local state,
      // remove it from local state since it's stale
      if (!shiftDoc.exists()) {
        setShifts(prev => prev.filter(shift => shift.id !== id));
        toast.error('Diese Schicht existiert nicht mehr');
        return;
      }
      
      // If shift exists in Firestore, update it and local state
      await dbService.updateWorkingShift(id, shiftData);
      setShifts(prev =>
        prev.map(shift =>
          shift.id === id ? { ...shift, ...shiftData } : shift
        )
      );
      toast.success('Schicht wurde aktualisiert');
      setError(null);
    } catch (err) {
      console.error('Error updating shift:', err);
      setError('Failed to update shift');
      toast.error('Fehler beim Aktualisieren der Schicht');
      throw err;
    }
  };

  const deleteShift = async (id: string) => {
    try {
      console.log('Attempting to delete shift:', id);
      
      // Remove from local state immediately
      setShifts(prev => {
        const newShifts = prev.filter(shift => shift.id !== id);
        console.log('Shifts after local removal:', newShifts);
        return newShifts;
      });
      
      // Delete from Firestore
      await dbService.deleteWorkingShift(id);
      
      // Verify deletion
      const shiftRef = doc(db, 'workingShifts', id);
      const shiftDoc = await getDoc(shiftRef);
      
      if (shiftDoc.exists()) {
        console.warn('Shift still exists after deletion, forcing delete');
        await deleteDoc(shiftRef);
      }
      
      toast.success('Schicht wurde gelöscht');
      setError(null);
    } catch (err) {
      console.error('Error deleting shift:', err);
      setError('Failed to delete shift');
      toast.error('Fehler beim Löschen der Schicht');
      throw err;
    }
  };

  return (
    <ShiftContext.Provider
      value={{
        shifts,
        addShift,
        updateShift,
        deleteShift,
        error,
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
}

export function useShift() {
  const context = useContext(ShiftContext);
  if (context === undefined) {
    throw new Error('useShift must be used within a ShiftProvider');
  }
  return context;
}
