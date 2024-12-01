'use client';

import React from 'react';
import Image from 'next/image';
import { HiRocketLaunch, HiClipboardDocument, HiChatBubbleLeftRight, HiBookOpen, HiEnvelope, HiPhone, HiClock } from 'react-icons/hi2';

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-12">
        <div className="relative w-[120px] h-[60px] mb-6">
          <Image
            src="/images/logo.jpg"
            alt="Arbeitsplan Manager Logo"
            fill
            style={{ objectFit: 'contain' }}
            priority
            className="rounded-lg"
          />
        </div>
        <h1 className="text-4xl font-bold mb-2 text-slate-800">Arbeitsplan Manager</h1>
        <p className="text-slate-600 mb-4">Version 0.5</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-800 flex items-center">
            <span className="bg-emerald-100 p-2 rounded-lg mr-3">
              <HiRocketLaunch className="w-5 h-5 text-emerald-600" />
            </span>
            Demnächst
          </h2>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-400 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
            <ul className="list-disc pl-5 text-slate-700 space-y-3">
              <li>PDF Download - Arbeitsplan ausdrucken und als PDF exportieren</li>
              <li>Logo Upload - Eigenes Firmenlogo hochladen und verwenden</li>
              <li>Arbeitsplan an alle Mitarbeiter senden</li>
              <li>Erweiterte Benachrichtigungen:
                <ul className="list-circle pl-5 mt-2 space-y-2">
                  <li>Schichtwechsel Informationen</li>
                  <li>E-Mail Vorlagen</li>
                  <li>E-Mail & Online Bestätigungen für Schichtübernahmen</li>
                  <li>SMS & WhatsApp Benachrichtigungen</li>
                </ul>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-800 flex items-center">
            <span className="bg-emerald-100 p-2 rounded-lg mr-3">
              <HiClipboardDocument className="w-5 h-5 text-emerald-600" />
            </span>
            Changelog
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-slate-200">
              <h3 className="text-lg font-medium text-slate-800">Version 0.5 (November 2024)</h3>
              <ul className="list-disc pl-5 mt-3 text-slate-600 space-y-2">
                <li>Implementierung des Logbuchs zur Nachverfolgung von Änderungen</li>
                <li>Verbessertes Bearbeiten von Schichten direkt im Kalender</li>
                <li>Neue Benutzeroberfläche für Schichtbearbeitung</li>
                <li>Optimierte Navigation und Menüstruktur</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-slate-200">
              <h3 className="text-lg font-medium text-slate-800">Version 0.4</h3>
              <ul className="list-disc pl-5 mt-3 text-slate-600 space-y-2">
                <li>Implementierung des Kalender-Drag-and-Drop</li>
                <li>Verbesserte Mitarbeiterverwaltung</li>
                <li>Filialspezifische Ansichten</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-800 flex items-center">
            <span className="bg-emerald-100 p-2 rounded-lg mr-3">
              <HiChatBubbleLeftRight className="w-5 h-5 text-emerald-600" />
            </span>
            Support
          </h2>
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-slate-200">
            <p className="text-slate-600 mb-6">
              Bei Fragen oder Problemen wenden Sie sich bitte an unseren Support:
            </p>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-center">
                <span className="bg-emerald-100 p-2 rounded-lg mr-3">
                  <HiEnvelope className="w-5 h-5 text-emerald-600" />
                </span>
                Email: sammy@ssammyrichter.net
              </li>
              <li className="flex items-center">
                <span className="bg-emerald-100 p-2 rounded-lg mr-3">
                  <HiPhone className="w-5 h-5 text-emerald-600" />
                </span>
                Telefon: +49 (0) 123 456789
              </li>
              <li className="flex items-center">
                <span className="bg-emerald-100 p-2 rounded-lg mr-3">
                  <HiClock className="w-5 h-5 text-emerald-600" />
                </span>
                Geschäftszeiten: Mo-Fr 9:00 - 17:00 Uhr
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-800 flex items-center">
            <span className="bg-emerald-100 p-2 rounded-lg mr-3">
              <HiBookOpen className="w-5 h-5 text-emerald-600" />
            </span>
            Dokumentation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a href="/" className="block">
              <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-slate-200 hover:border-emerald-300">
                <h3 className="text-lg font-medium text-slate-800 mb-3">Schnellstart-Guide</h3>
                <p className="text-slate-600">
                  Lernen Sie die grundlegenden Funktionen kennen und beginnen Sie mit der Planung.
                </p>
              </div>
            </a>
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-slate-200 hover:border-emerald-300">
              <h3 className="text-lg font-medium text-slate-800 mb-3">Video-Tutorials</h3>
              <p className="text-slate-600">
                Schauen Sie sich unsere Anleitungsvideos für detaillierte Erklärungen an.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-800 flex items-center">
            <span className="bg-emerald-100 p-2 rounded-lg mr-3">⚖️</span>
            Rechtliches
          </h2>
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-slate-200">
            <p className="text-slate-600">
              2024 Arbeitsplan Manager. Alle Rechte vorbehalten.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
