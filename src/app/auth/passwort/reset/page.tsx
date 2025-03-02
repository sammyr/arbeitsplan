'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';

export default function PasswordResetActionPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [oobCode, setOobCode] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams?.get('oobCode');
    if (code) {
      setOobCode(code);
    } else {
      setMessage('Ungültiger oder abgelaufener Link.');
      setTimeout(() => router.push('/auth/login'), 3000);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) {
      setMessage('Kein Reset-Code vorhanden.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Die Passwörter stimmen nicht überein.');
      return;
    }
    if (newPassword.length < 6) {
      setMessage('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage('Passwort erfolgreich zurückgesetzt!');
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setMessage(
        error.code === 'auth/expired-action-code'
          ? 'Der Link ist abgelaufen. Bitte fordern Sie einen neuen an.'
          : 'Fehler beim Zurücksetzen des Passworts. Bitte versuchen Sie es erneut.'
      );
    } finally {
      setLoading(false);
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
              Neues Passwort festlegen
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Bitte geben Sie Ihr neues Passwort ein.
            </p>
          </div>

          {message && (
            <div className="mt-4 p-4 rounded-md bg-yellow-50 dark:bg-yellow-900">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                  Neues Passwort
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 17V19M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11M7 11H17C18.1046 11 19 11.8954 19 13V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V13C5 11.8954 5.89543 11 7 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full rounded-lg py-2 pl-10 pr-3 text-gray-900 dark:text-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-green-600 dark:focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-600 dark:focus:ring-green-500 sm:text-sm sm:leading-6 transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                  Passwort bestätigen
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 17V19M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11M7 11H17C18.1046 11 19 11.8954 19 13V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V13C5 11.8954 5.89543 11 7 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-lg py-2 pl-10 pr-3 text-gray-900 dark:text-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-green-600 dark:focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-600 dark:focus:ring-green-500 sm:text-sm sm:leading-6 transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg bg-green-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-all duration-200 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    {/* Ladeanimation entfernt, Text beibehalten */}
                    Wird gespeichert...
                  </div>
                ) : (
                  'Passwort speichern'
                )}
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Zurück zum{' '}
              <Link href="/auth/login" className="font-semibold leading-6 text-green-600 hover:text-green-500">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
