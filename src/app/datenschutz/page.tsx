'use client';

import React from 'react';
import Link from 'next/link';

export default function DatenschutzPage() {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Datenschutzerklärung</h1>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Datenschutz auf einen Blick</h2>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Allgemeine Hinweise</h3>
              <p className="text-gray-700 mb-4">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, 
                wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert 
                werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text 
                aufgeführten Datenschutzerklärung.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">Datenerfassung auf dieser Website</h3>
              <p className="text-gray-700 mb-4">
                <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
                Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten 
                können Sie dem Impressum dieser Website entnehmen.
              </p>
              
              <p className="text-gray-700 mb-4">
                <strong>Wie erfassen wir Ihre Daten?</strong><br />
                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, 
                die Sie in ein Kontaktformular eingeben.
                Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische 
                Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt automatisch, 
                sobald Sie diese Website betreten.
              </p>
              
              <p className="text-gray-700 mb-4">
                <strong>Wofür nutzen wir Ihre Daten?</strong><br />
                Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere Daten können 
                zur Analyse Ihres Nutzerverhaltens verwendet werden.
              </p>
              
              <p className="text-gray-700 mb-4">
                <strong>Welche Rechte haben Sie bezüglich Ihrer Daten?</strong><br />
                Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten 
                personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. 
                Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit unter der im Impressum angegebenen 
                Adresse an uns wenden. Des Weiteren steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Hosting</h2>
              <p className="text-gray-700 mb-4">
                Wir hosten die Inhalte unserer Website bei folgendem Anbieter:
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">Externes Hosting</h3>
              <p className="text-gray-700 mb-4">
                Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website erfasst werden, 
                werden auf den Servern des Hosters gespeichert. Hierbei kann es sich v. a. um IP-Adressen, Kontaktanfragen, 
                Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen, Webseitenzugriffe und sonstige Daten, 
                die über eine Website generiert werden, handeln.
              </p>
              
              <p className="text-gray-700 mb-4">
                Das externe Hosting erfolgt zum Zwecke der Vertragserfüllung gegenüber unseren potenziellen und bestehenden 
                Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse einer sicheren, schnellen und effizienten Bereitstellung 
                unseres Online-Angebots durch einen professionellen Anbieter (Art. 6 Abs. 1 lit. f DSGVO).
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Allgemeine Hinweise und Pflichtinformationen</h2>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">Datenschutz</h3>
              <p className="text-gray-700 mb-4">
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre 
                personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie 
                dieser Datenschutzerklärung.
              </p>
              
              <p className="text-gray-700 mb-4">
                Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben. Personenbezogene 
                Daten sind Daten, mit denen Sie persönlich identifiziert werden können. Die vorliegende Datenschutzerklärung 
                erläutert, welche Daten wir erheben und wofür wir sie nutzen. Sie erläutert auch, wie und zu welchem Zweck 
                das geschieht.
              </p>
              
              <p className="text-gray-700 mb-4">
                Wir weisen darauf hin, dass die Datenübertragung im Internet (z. B. bei der Kommunikation per E-Mail) 
                Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">Hinweis zur verantwortlichen Stelle</h3>
              <p className="text-gray-700 mb-4">
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
              </p>
              
              <p className="text-gray-700 mb-4">
                Richter und Freunde UG<br />
                Krummestr. 26<br />
                10627 Berlin<br />
                Deutschland
              </p>
              
              <p className="text-gray-700 mb-4">
                Telefon: +49 176 5672 6637<br />
                E-Mail: info@richter-und-freunde.de
              </p>
              
              <p className="text-gray-700 mb-4">
                Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über 
                die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z. B. Namen, E-Mail-Adressen o. Ä.) entscheidet.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Datenerfassung auf dieser Website</h2>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cookies</h3>
              <p className="text-gray-700 mb-4">
                Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine Datenpakete und richten auf Ihrem 
                Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung (Session-Cookies) 
                oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert. Session-Cookies werden nach Ende Ihres 
                Besuchs automatisch gelöscht. Permanente Cookies bleiben auf Ihrem Endgerät gespeichert, bis Sie diese selbst 
                löschen oder eine automatische Löschung durch Ihren Webbrowser erfolgt.
              </p>
              
              <p className="text-gray-700 mb-4">
                Cookies können von uns (First-Party-Cookies) oder von Drittunternehmen stammen (sog. Third-Party-Cookies). 
                Third-Party-Cookies ermöglichen die Einbindung bestimmter Dienstleistungen von Drittunternehmen innerhalb 
                von Webseiten (z. B. Cookies zur Abwicklung von Zahlungsdienstleistungen).
              </p>
              
              <p className="text-gray-700 mb-4">
                Die Rechtsgrundlage für die Verarbeitung personenbezogener Daten unter Verwendung von Cookies ist Art. 6 Abs. 1 
                lit. f DSGVO.
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
