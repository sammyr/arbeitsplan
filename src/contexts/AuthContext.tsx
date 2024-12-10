'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { dbService } from '@/lib/db';

type UserRole = 'admin' | 'user' | null;

interface AuthContextType {
  user: User | null;
  userRole: UserRole;
  loading: boolean;
  userId: string | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  userId: null,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let unsubscribeRole: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      setUser(user);
      
      if (user) {
        try {
          // Create user document if it doesn't exist
          await dbService.createUserDocument(user.uid, user.email || '', 'admin');

          // Fetch user role from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          
          if (docSnap.exists()) {
            const role = docSnap.data().role as UserRole;
            setUserRole(role);
          } else {
            console.log('No user document found');
            setUserRole(null);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          toast.error('Error loading user role');
          setUserRole(null);
        }
      } else {
        if (unsubscribeRole) {
          unsubscribeRole();
        }
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return () => {
      if (unsubscribeRole) {
        unsubscribeRole();
      }
      unsubscribeAuth();
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error signing out');
    }
  };

  const value = {
    user,
    userRole,
    loading,
    userId: user?.uid || null,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
