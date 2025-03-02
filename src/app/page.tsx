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
      <div className="relative bg-gradient-to-r from-purple-600 to-indigo-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Dienstpilot
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl">
              Arbeitsschichten intelligent erstellen, planen und ändern - einfacher als je zuvor. Revolutionieren Sie Ihre Personalplanung mit unserer intuitiven Lösung.
            </p>
            <div className="mt-10 flex justify-center gap-x-6">
              {!user ? (
                <>
                  <Link
                    href="/auth/login"
                    className="rounded-md bg-white px-5 py-3 text-base font-semibold text-indigo-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Anmelden
                  </Link>
                  <Link
                    href="/auth/register"
                    className="rounded-md bg-indigo-500 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    Registrieren
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard"
                  className="rounded-md bg-white px-5 py-3 text-base font-semibold text-indigo-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-3 shadow-lg">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">Intuitive Schichtplanung</h3>
                    <p className="mt-5 text-base text-gray-600">
                      Erstellen, ändern und löschen Sie Arbeitsschichten mit wenigen Klicks oder sogar per Spracheingabe. Unsere benutzerfreundliche Oberfläche macht die Dienstplanung so einfach wie nie zuvor.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-3 shadow-lg">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">Intelligente Urlaubsplanung</h3>
                    <p className="mt-5 text-base text-gray-600">
                      Planen Sie Schichten unter Berücksichtigung von Urlaubstagen und vermeiden Sie Überschneidungen. Unser System erkennt automatisch Konflikte und schlägt Alternativen vor.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-3 shadow-lg">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">Teamzugriff & Transparenz</h3>
                    <p className="mt-5 text-base text-gray-600">
                      Alle Mitarbeiter haben Zugang zum Dienstplan und ihren Schichten. Erhöhen Sie die Transparenz und verbessern Sie die Kommunikation in Ihrem Team.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-3 shadow-lg">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">Umfassende Auswertungen</h3>
                    <p className="mt-5 text-base text-gray-600">
                      Exportieren Sie Schichten, Stundenauswertungen und Urlaubstage mit einem Klick. Behalten Sie den Überblick über alle wichtigen Kennzahlen Ihres Teams.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-3 shadow-lg">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">Persönliche Ereignisse</h3>
                    <p className="mt-5 text-base text-gray-600">
                      Erfassen Sie wichtige persönliche Ereignisse wie Geburtstage und lassen Sie sich automatisch daran erinnern. Stärken Sie den Teamzusammenhalt durch persönliche Aufmerksamkeit.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-3 shadow-lg">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">DSGVO-konform</h3>
                    <p className="mt-5 text-base text-gray-600">
                      Alle Daten werden DSGVO-konform verarbeitet und gespeichert. Wir legen höchsten Wert auf Datenschutz und Sicherheit Ihrer sensiblen Informationen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-50">
        <div className="mx-auto max-w-7xl py-12 px-6 lg:flex lg:items-center lg:justify-between lg:py-16 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Bereit für effiziente Dienstplanung?</span>
            <span className="block text-indigo-600">Starten Sie noch heute mit Dienstpilot.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium text-white hover:bg-indigo-700"
              >
                Jetzt starten
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-600 hover:bg-gray-50"
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
