
// Typ für Zahlungsturnus
export type Zahlungsturnus = 'woechentlich' | 'monatlich' | 'quartalsweise' | 'halbjaehrlich' | 'jaehrlich';

// Fahrzeug Interface
export interface Fahrzeug {
  id: string;
  kennzeichen: string;
  marke: string;
  modell: string;
  baujahr: number;
  aktiv: boolean;
  kosten: FahrzeugKosten[];
}

export interface FahrzeugKosten {
  id: string;
  bezeichnung: string;
  betrag: number;
  zahlungsturnus: Zahlungsturnus;
  faelligAm?: Date;
  monatlichUmgerechnet: number;
}

// Mitarbeiter Interface
export interface Mitarbeiter {
  id: string;
  vorname: string;
  nachname: string;
  email?: string;
  telefon?: string;
  einstellungsdatum: Date;
  aktiv: boolean;
  fahrzeugId?: string;
  steuer: number;
  nettoGehalt: number;
  stundenlohn?: number;
  prozentVerguetung: number;
  sollFahrtenAnzahl?: number;
  krankenversicherung?: number;
}

// Umsatz Interface
export interface Umsatz {
  id: string;
  mitarbeiterId: string;
  wochenNummer: number;
  jahr: number;
  kalenderwoche: string; // Format: "YYYY-WW"
  erfasstAm: Date;
  gesamtumsatz: number;
  nettoFahrpreis: number;
  aktionen: number;
  rueckerstattungen: number;
  trinkgeld: number;
  bargeld: number;
  fahrten: number;
  waschen: number;
}

// Abrechnung Interface
export interface Abrechnung {
  id: string;
  mitarbeiterId: string;
  startWoche: string; // Format: "YYYY-WW"
  endWoche: string; // Format: "YYYY-WW"
  erstelltAm: Date;
  gesamtumsatz: number;
  nettoFahrpreis: number;
  aktionen: number;
  rueckerstattungen: number;
  trinkgeld: number;
  bargeld: number;
  fahrten: number;
  waschen: number;
  steuer: number;
  nettoGehalt: number;
  sonstigeAbzuege: SonstigerPosten[];
  sonstigeZuschuesse: SonstigerPosten[];
  ergebnis: number;
}

export interface SonstigerPosten {
  id: string;
  bezeichnung: string;
  betrag: number;
}

// Dashboard Stats Interface
export interface DashboardStats {
  gesamtumsatzMonat: number;
  gesamtkostenMonat: number;
  fahrzeugeGesamt: number;
  fahrzeugeAktiv: number;
  mitarbeiterGesamt: number;
  mitarbeiterAktiv: number;
  durchschnittFahrtenProWoche: number;
}

// Store Context Types
export interface AppStoreState {
  fahrzeuge: Fahrzeug[];
  mitarbeiter: Mitarbeiter[];
  umsaetze: Umsatz[];
  abrechnungen: Abrechnung[];
}

export interface AppStoreContextType {
  state: AppStoreState;
  addFahrzeug: (fahrzeug: Fahrzeug) => void;
  updateFahrzeug: (fahrzeug: Fahrzeug) => void;
  deleteFahrzeug: (id: string) => void;
  addMitarbeiter: (mitarbeiter: Mitarbeiter) => void;
  updateMitarbeiter: (mitarbeiter: Mitarbeiter) => void;
  deleteMitarbeiter: (id: string) => void;
  addUmsatz: (umsatz: Umsatz) => void;
  updateUmsatz: (umsatz: Umsatz) => void;
  deleteUmsatz: (id: string) => void;
  addAbrechnung: (abrechnung: Abrechnung) => void;
}
