
# Taxi-Ledger Pro

## Übersicht

Eine umfassende Verwaltungslösung für Mietwagenunternehmen zur Erfassung von Fahrzeugen, Mitarbeitern, Umsätzen und zur Erstellung von Abrechnungen.

## Funktionen

- **Dashboard**: Zeigt wichtige Kennzahlen wie Gesamtumsatz, Kosten, aktive Fahrzeuge und Mitarbeiter.
- **Fahrzeugverwaltung**: Ermöglicht das Anlegen und Verwalten von Fahrzeugen und deren Kosten mit verschiedenen Zahlungsturnus.
- **Mitarbeiterverwaltung**: Verwaltung der Mitarbeiterdaten inkl. Vergütungsmodelle.
- **Umsatzerfassung**: Wöchentliche Erfassung von Umsätzen und Fahrten pro Mitarbeiter.
- **Abrechnungssystem**: Live-Berechnung der Abrechnungen mit konfigurierbaren Zuschüssen und Abzügen.
- **Statistiken**: Visualisierung von Umsatz- und Fahrtendaten.

## Installation

```sh
# Klonen des Repositories
git clone <REPOSITORY-URL>

# In das Projektverzeichnis wechseln
cd taxi-ledger-pro

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

## Verwendung

1. Beginnen Sie mit dem Anlegen von Fahrzeugen und deren Kosten.
2. Fügen Sie Mitarbeiter und deren Vergütungsmodelle hinzu.
3. Erfassen Sie wöchentlich die Umsätze und Fahrten pro Mitarbeiter.
4. Erstellen Sie Abrechnungen für jeden Mitarbeiter basierend auf den erfassten Umsätzen.
5. Analysieren Sie Ihre Daten über die Statistikseite.

## Speicherung der Daten

Alle Daten werden lokal im Browser via LocalStorage gespeichert. Dies bedeutet:

- Die Daten sind nach dem Schließen des Browsers weiterhin verfügbar.
- Die Daten sind auf den Browser und das Gerät beschränkt, auf dem sie eingegeben wurden.
- Bei Löschen des Browser-Caches werden auch alle gespeicherten Daten entfernt.

Für eine unternehmensweite Nutzung mit mehreren Benutzern wäre eine Erweiterung um einen Backend-Dienst erforderlich.

## Technologien

- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts für Visualisierungen
