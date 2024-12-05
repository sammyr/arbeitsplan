'use client';

import React from 'react';
import Image from 'next/image';
import { HiLightBulb, HiClipboardDocument, HiChatBubbleLeftRight, HiBookOpen, HiEnvelope, HiPhone, HiScale } from 'react-icons/hi2';

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
        <h1 className="text-3xl font-bold mb-2">Arbeitsplan Manager</h1>
        <span className="text-sm text-gray-500 mb-6">Version 0.52 (Beta)</span>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-800 flex items-center">
            <span className="bg-emerald-100 p-2 rounded-lg mr-3">
              <HiLightBulb className="w-5 h-5 text-emerald-600" />
            </span>
            Geplant
          </h2>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-400 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
            <ul className="list-disc pl-5 text-slate-700 space-y-3">
              <li>Erstellung von Arbeitsschichten durch Spracheingabe</li>
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
              <HiLightBulb className="w-5 h-5 text-emerald-600" />
            </span>
            Demnächst
          </h2>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-400 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
            <ul className="list-disc pl-5 text-slate-700 space-y-3">
              <li>PDF Download - Arbeitsplan ausdrucken und als PDF exportieren</li>
              <li>Registrierung / Login</li>
              <li>Arbeitsplan an alle Mitarbeiter senden</li>
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
              <h3 className="text-lg font-medium text-slate-800">Version 0.52 (Dezember 2024)</h3>
              <ul className="list-disc pl-5 mt-3 text-slate-600 space-y-2">
                <li>Excel-Export für Arbeitsstunden:
                  <ul className="list-circle pl-5 mt-2 space-y-2">
                    <li>Separate Tabellenblätter für jede Filiale</li>
                    <li>Detaillierte Stundenaufstellung pro Mitarbeiter</li>
                    <li>Gesamtstunden - Übersicht der Gesamtstunden pro Mitarbeiter</li>
                  </ul>
                </li>
                <li>Verbesserte Benutzeroberfläche:
                  <ul className="list-circle pl-5 mt-2 space-y-2">
                    <li>Neue Beschreibungen für bessere Benutzerführung</li>
                    <li>Überarbeitete Menüpunkte und Navigationselemente</li>
                    <li>Optimierte Darstellung der Arbeitsstunden</li>
                  </ul>
                </li>
                <li>Verbesserte Stundenberechnung und Synchronisation zwischen Arbeitsplan und Auswertungen</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-slate-200">
              <h3 className="text-lg font-medium text-slate-800">Version 0.51 (November 2024)</h3>
              <ul className="list-disc pl-5 mt-3 text-slate-600 space-y-2">
                <li>Neue Auswertungsseite für Arbeitsstunden:
                  <ul className="list-circle pl-5 mt-2 space-y-2">
                    <li>Übersicht der Arbeitsstunden pro Filiale</li>
                    <li>Gesamtstunden pro Mitarbeiter</li>
                    <li>Monatsweise Navigation</li>
                  </ul>
                </li>
                <li>Verbessertes Logging-System für Schichtänderungen</li>
                <li>Optimierte Benutzeroberfläche für mobile Geräte</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-slate-200">
              <h3 className="text-lg font-medium text-slate-800">Version 0.5 (November 2024)</h3>
              <ul className="list-disc pl-5 mt-3 text-slate-600 space-y-2">
                <li>Implementierung des Logbuchs zur Nachverfolgung von Änderungen</li>
                <li>Verbessertes Bearbeiten von Schichten direkt im Kalender</li>
                <li>Neue Benutzeroberfläche für Schichtbearbeitung</li>
                <li>Optimierte Navigation und Menüstruktur</li>
                <li>Automatische Speicherung von Änderungen</li>
                <li>Verbesserte Fehlerbehandlung und Benutzer-Feedback</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-slate-200">
              <h3 className="text-lg font-medium text-slate-800">Version 0.4</h3>
              <ul className="list-disc pl-5 mt-3 text-slate-600 space-y-2">
                <li>Implementierung des Kalender-Drag-and-Drop:
                  <ul className="list-circle pl-5 mt-2 space-y-2">
                    <li>Schichten per Drag & Drop verschieben</li>
                    <li>Visuelle Rückmeldung beim Verschieben</li>
                    <li>Automatische Aktualisierung der Ansicht</li>
                  </ul>
                </li>
                <li>Verbesserte Mitarbeiterverwaltung:
                  <ul className="list-circle pl-5 mt-2 space-y-2">
                    <li>Hinzufügen und Bearbeiten von Mitarbeitern</li>
                    <li>Mitarbeiter-Verfügbarkeit</li>
                    <li>Mitarbeiter-Qualifikationen</li>
                  </ul>
                </li>
                <li>Filialspezifische Ansichten:
                  <ul className="list-circle pl-5 mt-2 space-y-2">
                    <li>Separate Kalender pro Filiale</li>
                    <li>Filialspezifische Schichtpläne</li>
                    <li>Schnelle Filialauswahl</li>
                  </ul>
                </li>
                <li>Schichtverwaltung:
                  <ul className="list-circle pl-5 mt-2 space-y-2">
                    <li>Erstellen und Bearbeiten von Schichtvorlagen</li>
                    <li>Flexible Schichtzeiten</li>
                    <li>Schicht-Kategorien</li>
                  </ul>
                </li>
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
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-slate-800 mb-3">Support & Verwaltung</h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-center">
                    <span className="bg-emerald-100 p-2 rounded-lg mr-3">
                      <HiBookOpen className="w-5 h-5 text-emerald-600" />
                    </span>
                    Name: Silvia Kaspar
                  </li>
                  <li className="flex items-center">
                    <span className="bg-emerald-100 p-2 rounded-lg mr-3">
                      <HiEnvelope className="w-5 h-5 text-emerald-600" />
                    </span>
                    E-Mail: <a href="mailto:sunny1366@web.de" className="text-emerald-600 hover:text-emerald-700 ml-1">sunny1366@web.de</a>
                  </li>
                  <li className="flex items-center">
                    <span className="bg-emerald-100 p-2 rounded-lg mr-3">
                      <HiPhone className="w-5 h-5 text-emerald-600" />
                    </span>
                    Telefon: <a href="tel:+4915257440668" className="text-emerald-600 hover:text-emerald-700 ml-1">+49 (0) 1525 7440 668</a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-800 mb-3">Technischer Support</h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-center">
                    <span className="bg-emerald-100 p-2 rounded-lg mr-3">
                      <HiBookOpen className="w-5 h-5 text-emerald-600" />
                    </span>
                    Name: Sammy Richter
                  </li>
                  <li className="flex items-center">
                    <span className="bg-emerald-100 p-2 rounded-lg mr-3">
                      <HiEnvelope className="w-5 h-5 text-emerald-600" />
                    </span>
                    E-Mail: <a href="mailto:sammy@sammyrichter.net" className="text-emerald-600 hover:text-emerald-700 ml-1">sammy@sammyrichter.net</a>
                  </li>
                  <li className="flex items-center">
                    <span className="bg-emerald-100 p-2 rounded-lg mr-3">
                      <HiPhone className="w-5 h-5 text-emerald-600" />
                    </span>
                    Telefon: <a href="tel:+491765672637" className="text-emerald-600 hover:text-emerald-700 ml-1">+49 (0) 176 567 266 37</a>
                  </li>
                </ul>
              </div>
            </div>
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
      </div>
    </div>
  );
}
