'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, addDoc, collection } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteData, setInviteData] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams?.get('token');

  useEffect(() => {
    if (inviteToken) {
      validateInvite();
    }
  }, [inviteToken]);

  const validateInvite = async () => {
    if (!inviteToken) return;

    try {
      const inviteDoc = await getDoc(doc(db, 'invites', inviteToken));
      if (!inviteDoc.exists()) {
        toast.error('Ungültiger Einladungslink');
        router.push('/auth/login');
        return;
      }

      const data = inviteDoc.data();
      if (data.status !== 'pending') {
        toast.error('Dieser Einladungslink wurde bereits verwendet');
        router.push('/auth/login');
        return;
      }

      setInviteData(data);
      setEmail(data.email);
    } catch (error) {
      console.error('Error validating invite:', error);
      toast.error('Fehler beim Validieren der Einladung');
      router.push('/auth/login');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (inviteToken && inviteData) {
        // Verify if the Google account email matches the invite email
        if (user.email !== inviteData.email) {
          toast.error('Bitte verwenden Sie die E-Mail-Adresse, an die die Einladung gesendet wurde');
          // Sign out the user since the email doesn't match
          await auth.signOut();
          return;
        }

        // Create user document with role and employee reference
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          role: 'employee',
          employeeId: inviteData.employeeId,
          adminId: inviteData.adminId,
          createdAt: new Date().toISOString()
        });

        // Update invite status
        await setDoc(doc(db, 'invites', inviteToken), {
          ...inviteData,
          status: 'used',
          usedAt: new Date().toISOString(),
          userId: user.uid
        });

        toast.success('Mitarbeiter-Account erfolgreich erstellt');
      } else {
        // Create regular admin user document and organization
        const organizationId = user.uid;
        await setDoc(doc(db, 'organizations', organizationId), {
          name: 'My Organization',
          createdAt: new Date().toISOString(),
          adminId: user.uid
        });

        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          role: 'admin',
          organizationId,
          createdAt: new Date().toISOString()
        });

        toast.success('Admin-Account erfolgreich erstellt');
      }

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast.error(error.message || 'Fehler bei der Google-Anmeldung');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Set default role as admin for direct registration
      const userRole = 'admin';
      console.log('Setting user role:', userRole);

      // Create organization for the admin
      const orgRef = await addDoc(collection(db, 'organizations'), {
        name: `${displayName}'s Organization`,
        createdAt: new Date().toISOString(),
        adminId: user.uid
      });

      // Create user document with role and organization
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName,
        role: userRole,
        organizationId: orgRef.id,
        createdAt: new Date().toISOString()
      });

      console.log('Registration successful');
      toast.success('Registrierung erfolgreich!');
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Email registration error:', error);
      toast.error(error.message || 'Fehler bei der Registrierung');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {inviteToken ? 'Mitarbeiter-Account erstellen' : 'Account erstellen'}
          </h2>
          {inviteToken && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Einladung für {email}
            </p>
          )}
        </div>

        {/* Google Sign-in Button */}
        <div>
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-3 px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FcGoogle className="h-5 w-5" />
            Mit Google fortfahren
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Oder</span>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="displayName" className="sr-only">
                Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Name"
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email Adresse
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!inviteToken}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${inviteToken ? 'bg-gray-100' : ''}`}
                placeholder="Email Adresse"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Passwort"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? 'Wird verarbeitet...' : 'Mit Email registrieren'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
