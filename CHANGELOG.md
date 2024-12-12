# Changelog

## [0.53] - 2024-12-12

### Verbessert
- PDF-Export: Schichten werden jetzt untereinander angezeigt statt mit Kommas getrennt
- PDF-Export: Gesamtstunden werden in der letzten Spalte angezeigt
- PDF-Export: Optimiertes Layout im DIN A4 Querformat
- Excel-Export: Professionelles Tabellendesign mit farbigem Header
- Excel-Export: Verbesserte Zellenformatierung und Lesbarkeit
- Excel-Export: Automatische Anpassung der Spaltenbreiten
- Druckfunktion: Neue Druckvorschau im Querformat
- Druckfunktion: Optimierte Darstellung der Schichten
- Druckfunktion: Verbesserte Fehlerbehandlung

### Neu
- Excel-Export: Titel über der Tabelle mit Monat und Jahr
- Excel-Export: Farbliche Hervorhebung der Wochenenden
- Excel-Export: Separate Formatierung für Gesamtstunden
- Druckfunktion: Automatische Anpassung der Seitenränder

### Behoben
- Druckfunktion: Problem mit der Druckvorschau behoben
- Excel-Export: Korrektur der Zeilenumbrüche in Zellen
- PDF-Export: Verbessertes Error-Handling
- Typfehler in `page.tsx` durch Hinzufügen von Fallback-Werten für `employee.lastName`, `employee.email` und `employee.mobilePhone` behoben.
