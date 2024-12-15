'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, addDoc, collection } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left side - Image */}
      <div className="relative hidden md:block md:w-1/2">
        <Image
          src="/images/v2osk-1Z2niiBPg5h.jpg"
          alt="Berglandschaft mit See"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.2))',
          }}
        />
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 bg-white dark:bg-gray-900 flex items-center justify-center min-h-screen md:min-h-0">
        <div className="w-full max-w-md p-8">
          <img
            className="mx-auto h-20 w-auto"
            src="/logo.svg"
            alt="Arbeitsplan"
          />
          <p></p> <p></p>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {inviteToken ? 'Mitarbeiter-Account erstellen' : 'Account erstellen'}
            </h2>
            {inviteToken && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Einladung für {email}
              </p>
            )}
          </div>

          {/* Google Sign-in Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="mt-8 group relative w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
          >
            <FcGoogle className="h-5 w-5" />
            <span>Mit Google fortfahren</span>
          </button>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">oder</span>
            </div>
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                  Name
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="block w-full rounded-lg py-2 pl-10 pr-3 text-gray-900 dark:text-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-green-600 dark:focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-600 dark:focus:ring-green-500 sm:text-sm sm:leading-6 transition-all duration-200"
                    placeholder="Max Mustermann"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                  E-Mail
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6M22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg py-2 pl-10 pr-3 text-gray-900 dark:text-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-green-600 dark:focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-600 dark:focus:ring-green-500 sm:text-sm sm:leading-6 transition-all duration-200"
                    placeholder="max@beispiel.de"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                  Passwort
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 17V19M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11M7 11H17C18.1046 11 19 11.8954 19 13V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V13C5 11.8954 5.89543 11 7 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg py-2 pl-10 pr-3 text-gray-900 dark:text-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-green-600 dark:focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-600 dark:focus:ring-green-500 sm:text-sm sm:leading-6 transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg bg-green-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-all duration-200 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Wird erstellt...' : 'Account erstellen'}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Bereits registriert?{' '}
            <Link
              href="/auth/login"
              className="font-semibold leading-6 text-green-600 hover:text-green-500"
            >
              Hier anmelden
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
