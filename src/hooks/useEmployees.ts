'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface Employee {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  mobilePhone: string;
  birthday?: string;
  isActive?: boolean;
  organizationId: string;
}

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) {
      console.log('No user ID available');
      setEmployees([]);
      setLoading(false);
      return;
    }

    console.log('Loading employees for organization:', user.uid);
    const q = query(
      collection(db, 'mitarbeiter'),
      where('organizationId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        console.log('Raw query result size:', querySnapshot.size);
        const employeesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Raw employee data:', doc.id, data);
          return {
            id: doc.id,
            ...data,
            birthday: data.birthday || ''
          };
        }) as Employee[];
        
        console.log('Processed employees:', employeesData);
        setEmployees(employeesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching employees:', error);
        setError(error as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  return { employees, loading, error };
}
