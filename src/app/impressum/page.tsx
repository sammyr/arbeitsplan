'use client';

import React from 'react';
import Link from 'next/link';

export default function ImpressumPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-2xl font-bold">Dienstpilot</Link>
            </div>
            <nav className="flex space-x-4">
              <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                Startseite
              </Link>
              <Link href="/auth/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                Anmelden
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-grow">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Impressum</h1>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Angaben gemäß § 5 TMG</h2>
              <p className="text-gray-700 mb-2">Richter und Freunde UG</p>
              <p className="text-gray-700 mb-2">Krummestr. 26</p>
              <p className="text-gray-700 mb-2">10627 Berlin</p>
              <p className="text-gray-700 mb-2">Deutschland</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Kontakt</h2>
              <p className="text-gray-700 mb-2">Telefon: +49 176 5672 6637</p>
              <p className="text-gray-700 mb-2">E-Mail: info@richter-und-freunde.de</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Vertretungsberechtigte</h2>
              <p className="text-gray-700 mb-2">Max Mustermann, Geschäftsführer</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Handelsregister</h2>
              <p className="text-gray-700 mb-2">Registergericht: Amtsgericht Berlin</p>
              <p className="text-gray-700 mb-2">Registernummer: HRB 12345</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Umsatzsteuer-ID</h2>
              <p className="text-gray-700 mb-2">Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:</p>
              <p className="text-gray-700 mb-2">DE 123456789</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
              <p className="text-gray-700 mb-2">Max Mustermann</p>
              <p className="text-gray-700 mb-2">Krummestr. 26</p>
              <p className="text-gray-700 mb-2">10627 Berlin</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Streitschlichtung</h2>
              <p className="text-gray-700 mb-4">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
                <a href="https://ec.europa.eu/consumers/odr/" className="text-indigo-600 hover:text-indigo-800" target="_blank" rel="noopener noreferrer">
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
              <p className="text-gray-700">
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-8 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link href="/impressum" className="text-gray-500 hover:text-gray-600 font-medium">
              Impressum
            </Link>
            <Link href="/datenschutz" className="text-gray-500 hover:text-gray-600 font-medium">
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
