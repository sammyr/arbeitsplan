'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-blue-600 to-blue-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Dienstpilot
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl">
              Die moderne Lösung für Ihre Dienstplanung. Einfach, effizient und flexibel - optimieren Sie Ihre Personalplanung und sparen Sie wertvolle Zeit.
            </p>
            <div className="mt-10 flex justify-center gap-x-6">
              {!user ? (
                <>
                  <Link
                    href="/auth/login"
                    className="rounded-md bg-white px-5 py-3 text-base font-semibold text-blue-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Anmelden
                  </Link>
                  <Link
                    href="/auth/register"
                    className="rounded-md bg-blue-500 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                  >
                    Registrieren
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard"
                  className="rounded-md bg-white px-5 py-3 text-base font-semibold text-blue-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Zum Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Curved divider */}
        <div className="absolute inset-x-0 bottom-0">
          <svg
            className="h-16 w-full text-white"
            preserveAspectRatio="none"
            viewBox="0 0 1440 54"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 22L120 16.7C240 11 480 1.00001 720 0.700012C960 1.00001 1200 11 1320 16.7L1440 22V54H1320C1200 54 960 54 720 54C480 54 240 54 120 54H0V22Z" />
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Warum Dienstpilot?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Entdecken Sie die Vorteile unserer modernen Dienstplanungslösung
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="pt-6">
                <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center rounded-md bg-blue-600 p-3 shadow-lg">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">Zeitsparend</h3>
                    <p className="mt-5 text-base text-gray-600">
                      Automatisierte Prozesse sparen wertvolle Zeit bei der Dienstplanerstellung und -verwaltung.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center rounded-md bg-blue-600 p-3 shadow-lg">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">Sicher</h3>
                    <p className="mt-5 text-base text-gray-600">
                      Ihre Daten sind bei uns sicher. Wir verwenden modernste Verschlüsselungstechnologien.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center rounded-md bg-blue-600 p-3 shadow-lg">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">Effizient</h3>
                    <p className="mt-5 text-base text-gray-600">
                      Optimieren Sie Ihre Personalplanung und steigern Sie die Effizienz Ihres Teams.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center rounded-md bg-blue-600 p-3 shadow-lg">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">Teamorientiert</h3>
                    <p className="mt-5 text-base text-gray-600">
                      Fördern Sie die Zusammenarbeit und Kommunikation innerhalb Ihres Teams.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-50">
        <div className="mx-auto max-w-7xl py-12 px-6 lg:flex lg:items-center lg:justify-between lg:py-16 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Bereit für effiziente Dienstplanung?</span>
            <span className="block text-blue-600">Starten Sie noch heute mit Dienstpilot.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-5 py-3 text-base font-medium text-white hover:bg-blue-700"
              >
                Jetzt starten
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-blue-600 hover:bg-gray-50"
              >
                Anmelden
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link href="/impressum" className="text-gray-500 hover:text-gray-600">
              Impressum
            </Link>
            <Link href="/datenschutz" className="text-gray-500 hover:text-gray-600">
              Datenschutz
            </Link>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-500">
              &copy; {new Date().getFullYear()} Dienstpilot. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
