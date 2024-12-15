'use client';

import Image from 'next/image'
import LoadingSpinner from '@/components/LoadingSpinner'
import { auth } from '@/lib/firebase'
import { sendPasswordResetEmail } from 'firebase/auth'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PasswordResetPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const actionCodeSettings = {
        url: 'http://localhost:3000/auth/login', // Im Production-Mode ändern zu Ihrer Domain
        handleCodeInApp: true
      };
      
      await sendPasswordResetEmail(auth, email, actionCodeSettings)
      setMessage('Eine E-Mail zum Zurücksetzen des Passworts wurde gesendet.')
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (error: any) {
      setMessage('Fehler beim Senden der E-Mail. Bitte überprüfen Sie die E-Mail-Adresse.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left side - Image */}
      <div className="relative hidden md:block md:w-1/2">
        <Image
          src="/images/v2osk-1Z2niiBPg5h.jpg"
          alt="Berglandschaft mit See"
          layout="fill"
          objectFit="cover"
          priority
          className="brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
      </div>

      {/* Logo */}
      <div className="absolute top-8 right-8 text-white font-bold text-xl z-10">
        DIENSTPLAN
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
              Passwort zurücksetzen
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
            </p>
          </div>   

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                E-Mail-Adresse
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6M22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-lg py-2 pl-10 pr-3 text-gray-900 dark:text-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-green-600 dark:focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-600 dark:focus:ring-green-500 sm:text-sm sm:leading-6 transition-all duration-200"
                  placeholder="max@beispiel.de"
                />
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-md ${
                message.includes('Fehler') 
                  ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-200' 
                  : 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-200'
              }`}>
                {message}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg bg-green-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-all duration-200 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Link wird gesendet...
                  </div>
                ) : (
                  'Link zum Zurücksetzen senden'
                )}
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Zurück zum{' '}
              <a 
                href="/auth/login" 
                className="font-semibold leading-6 text-green-600 hover:text-green-500"
              >
                Login
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
