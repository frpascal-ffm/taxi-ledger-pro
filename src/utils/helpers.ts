
import { Zahlungsturnus } from "@/types";

/**
 * Formatiert einen Betrag als Geldwert
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

/**
 * Erzeugt eine Kalenderwoche-ID im Format "YYYY-WW"
 */
export const createKalenderwocheId = (jahr: number, wochenNummer: number): string => {
  return `${jahr}-${wochenNummer.toString().padStart(2, '0')}`;
};

/**
 * Holt die aktuelle Kalenderwoche und Jahr
 */
export const getCurrentKalenderwoche = (): { week: number; year: number } => {
  const now = new Date();
  const onejan = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - onejan.getTime()) / 86400000 + onejan.getDay()) / 7);
  return { week, year: now.getFullYear() };
};

/**
 * Rechnet Kosten basierend auf dem Zahlungsturnus in monatliche Kosten um
 */
export const calculateMonthlyAmount = (amount: number, zahlungsturnus: Zahlungsturnus): number => {
  switch (zahlungsturnus) {
    case 'woechentlich':
      return amount * 4.33; // durchschnittlich 4.33 Wochen pro Monat
    case 'monatlich':
      return amount;
    case 'quartalsweise':
      return amount / 3;
    case 'halbjaehrlich':
      return amount / 6;
    case 'jaehrlich':
      return amount / 12;
    default:
      return amount;
  }
};

/**
 * Formatiert ein Datum im deutschen Format (dd.mm.yyyy)
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('de-DE').format(date);
};

/**
 * Holt die Kalenderwocheninfo aus einem KW-String (YYYY-WW)
 */
export const parseKalenderwoche = (kwString: string): { jahr: number; woche: number } => {
  const [jahr, woche] = kwString.split('-').map(Number);
  return { jahr, woche };
};

/**
 * Formatiert eine Kalenderwoche für die Anzeige (KW XX/YYYY)
 */
export const formatKalenderwoche = (kwString: string): string => {
  const { jahr, woche } = parseKalenderwoche(kwString);
  return `KW ${woche.toString().padStart(2, '0')}/${jahr}`;
};

/**
 * Generiert eine Liste von Kalenderwochen für ein bestimmtes Jahr
 */
export const generateKalenderwochen = (jahr: number): string[] => {
  const wochen: string[] = [];
  for (let i = 1; i <= 53; i++) {
    wochen.push(createKalenderwocheId(jahr, i));
  }
  return wochen;
};

/**
 * Prüft, ob eine Kalenderwoche vor einer anderen liegt
 */
export const isKwBeforeOther = (kw1: string, kw2: string): boolean => {
  const { jahr: jahr1, woche: woche1 } = parseKalenderwoche(kw1);
  const { jahr: jahr2, woche: woche2 } = parseKalenderwoche(kw2);
  
  if (jahr1 < jahr2) return true;
  if (jahr1 > jahr2) return false;
  return woche1 < woche2;
};

/**
 * Berechnet den Mitarbeiteranteil basierend auf dem Gesamtumsatz und dem Vergütungsprozentsatz
 */
export const calculateMitarbeiterAnteil = (gesamtumsatz: number, prozentVerguetung: number): number => {
  return gesamtumsatz * (prozentVerguetung / 100);
};
