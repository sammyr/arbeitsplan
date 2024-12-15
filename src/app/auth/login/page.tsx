'use client';

import { useEffect, useState } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FcGoogle } from 'react-icons/fc';
import { GoogleAuthProvider } from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Erfolgreich angemeldet!');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(
        error.code === 'auth/invalid-credential'
          ? 'Ungültige Email oder Passwort'
          : 'Anmeldung fehlgeschlagen'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (!result.user) {
        throw new Error('No user data returned');
      }
      
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      console.log('Google sign-in successful:', { 
        uid: result.user.uid,
        email: result.user.email,
        hasToken: !!token 
      });
      
      toast.success('Erfolgreich angemeldet!');
    } catch (error: any) {
      console.error('Google login error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login abgebrochen');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Pop-up wurde blockiert. Bitte erlauben Sie Pop-ups für diese Seite.');
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error('Diese Domain ist nicht für Google-Anmeldung autorisiert.');
      } else {
        toast.error('Google Anmeldung fehlgeschlagen: ' + (error.message || 'Unbekannter Fehler'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullHeight />;
  }

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
              Willkommen zurück!
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Melden Sie sich an, um Ihren Dienstplan zu verwalten
            </p>
          </div>

          {/* Google Sign-in Button */}
          <button
            onClick={handleGoogleLogin}
            className="mt-8 group relative w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
          >
            <FcGoogle className="h-5 w-5" />
            <span>Mit Google anmelden</span>
          </button>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">oder</span>
            </div>
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleEmailLogin}>
            <div className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                    Passwort
                  </label>
                  <div className="text-sm">
                    <Link href="/auth/passwort" className="font-semibold text-green-600 hover:text-green-500">
                      Passwort vergessen?
                    </Link>
                  </div>
                </div>
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
                    autoComplete="current-password"
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
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Anmeldung...
                  </div>
                ) : (
                  'Anmelden'
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Noch kein Konto?{' '}
            <Link
              href="/auth/register"
              className="font-semibold leading-6 text-green-600 hover:text-green-500"
            >
              Jetzt registrieren
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
