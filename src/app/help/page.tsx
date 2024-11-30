'use client';

import React from 'react';
import Image from 'next/image';

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-[100px] h-[50px] mb-8">
          <Image
            src="/images/logo.jpg"
            alt="Arbeitsplan Manager Logo"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
        <h1 className="text-3xl font-bold mb-2">Arbeitsplan Manager</h1>
        <p className="text-gray-600 mb-4">Version 0.5</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Demnächst</h2>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>PDF Download - Arbeitsplan als PDF exportieren</li>
              <li>Logo Upload - Eigenes Firmenlogo hochladen und verwenden</li>
              <li>Arbeitsplan an alle Mitarbeiter senden</li>
              <li>Erweiterte Benachrichtigungen:
                <ul className="list-circle pl-5 mt-1 space-y-1">
                  <li>Schichtwechsel Informationen</li>
                  <li>E-Mail Vorlagen</li>
                  <li>E-Mail & Online Bestätigungen für Schichtübernahmen</li>
                  <li>SMS & WhatsApp Benachrichtigungen</li>
                </ul>
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changelog</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Version 0.5 (November 2024)</h3>
              <ul className="list-disc pl-5 mt-2 text-gray-600">
                <li>Implementierung des Logbuchs zur Nachverfolgung von Änderungen</li>
                <li>Verbessertes Bearbeiten von Schichten direkt im Kalender</li>
                <li>Neue Benutzeroberfläche für Schichtbearbeitung</li>
                <li>Optimierte Navigation und Menüstruktur</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Version 0.4</h3>
              <ul className="list-disc pl-5 mt-2 text-gray-600">
                <li>Implementierung des Kalender-Drag-and-Drop</li>
                <li>Verbesserte Mitarbeiterverwaltung</li>
                <li>Filialspezifische Ansichten</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Support</h2>
          <div className="bg-white shadow-md rounded-lg p-6">
            <p className="text-gray-600 mb-4">
              Bei Fragen oder Problemen wenden Sie sich bitte an unseren Support:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>Email: sammy@ssammyrichter.net</li>
              <li>Telefon: +49 (0) 123 456789</li>
              <li>Geschäftszeiten: Mo-Fr 9:00 - 17:00 Uhr</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Dokumentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/"><div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Schnellstart-Guide</h3>
              <p className="text-gray-600">
                Lernen Sie die grundlegenden Funktionen kennen und beginnen Sie mit der Planung.
              </p>
            </div></a>
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Video-Tutorials</h3>
              <p className="text-gray-600">
                Schauen Sie sich unsere Anleitungsvideos für detaillierte Erklärungen an.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Rechtliches</h2>
          <div className="bg-white shadow-md rounded-lg p-6">
            <p className="text-gray-600 mb-4">
              2024 Sammy Richter. Alle Rechte vorbehalten.
            </p>
            <div className="space-y-2">
              <p className="text-gray-600">Version: 0.5</p>
              <p className="text-gray-600">Build: 2024.11.001</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
