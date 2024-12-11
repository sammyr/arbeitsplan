import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Employee {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  mobilePhone: string;
  birthday?: string;
}

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'mitarbeiter'));
    
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const employeesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Employee[];
        
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
  }, []);

  return { employees, loading, error };
}
