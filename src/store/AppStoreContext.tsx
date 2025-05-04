
import { createContext, useContext, useState, useEffect } from "react";
import { 
  AppStoreState, 
  AppStoreContextType, 
  Fahrzeug, 
  Mitarbeiter, 
  Umsatz, 
  Abrechnung 
} from "@/types";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";

const STORAGE_KEY = "taxi-ledger-data";

// Demo Daten
const initialState: AppStoreState = {
  fahrzeuge: [],
  mitarbeiter: [
    {
      id: "m1",
      vorname: "Frank",
      nachname: "Rossler",
      email: "frank.rossler@example.com",
      telefon: "0123456789",
      einstellungsdatum: new Date(),
      aktiv: true,
      steuer: 0,
      nettoGehalt: 1800,
      prozentVerguetung: 40,
      sollFahrtenAnzahl: 90
    }
  ],
  umsaetze: [],
  abrechnungen: []
};

const AppStoreContext = createContext<AppStoreContextType | undefined>(undefined);

export const AppStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AppStoreState>(initialState);
  const { toast } = useToast();

  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        
        // Datum-Strings wieder in Date-Objekte umwandeln
        if (parsedData.mitarbeiter) {
          parsedData.mitarbeiter = parsedData.mitarbeiter.map((m: any) => ({
            ...m,
            einstellungsdatum: m.einstellungsdatum ? new Date(m.einstellungsdatum) : new Date()
          }));
        }
        
        if (parsedData.umsaetze) {
          parsedData.umsaetze = parsedData.umsaetze.map((u: any) => ({
            ...u,
            erfasstAm: u.erfasstAm ? new Date(u.erfasstAm) : new Date()
          }));
        }
        
        if (parsedData.abrechnungen) {
          parsedData.abrechnungen = parsedData.abrechnungen.map((a: any) => ({
            ...a,
            erstelltAm: a.erstelltAm ? new Date(a.erstelltAm) : new Date()
          }));
        }
        
        setState(parsedData);
      } catch (error) {
        console.error("Fehler beim Laden der gespeicherten Daten:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // CRUD Operations für Fahrzeuge
  const addFahrzeug = (fahrzeug: Fahrzeug) => {
    const newFahrzeug = {
      ...fahrzeug,
      id: fahrzeug.id || uuidv4()
    };
    
    setState(prev => ({
      ...prev,
      fahrzeuge: [...prev.fahrzeuge, newFahrzeug]
    }));
    
    toast({
      title: "Fahrzeug hinzugefügt",
      description: `${fahrzeug.marke} ${fahrzeug.modell} wurde erfolgreich hinzugefügt.`
    });
  };

  const updateFahrzeug = (fahrzeug: Fahrzeug) => {
    setState(prev => ({
      ...prev,
      fahrzeuge: prev.fahrzeuge.map(f => f.id === fahrzeug.id ? fahrzeug : f)
    }));
    
    toast({
      title: "Fahrzeug aktualisiert",
      description: `${fahrzeug.marke} ${fahrzeug.modell} wurde erfolgreich aktualisiert.`
    });
  };

  const deleteFahrzeug = (id: string) => {
    const fahrzeugToDelete = state.fahrzeuge.find(f => f.id === id);
    
    setState(prev => ({
      ...prev,
      fahrzeuge: prev.fahrzeuge.filter(f => f.id !== id)
    }));
    
    if (fahrzeugToDelete) {
      toast({
        title: "Fahrzeug gelöscht",
        description: `${fahrzeugToDelete.marke} ${fahrzeugToDelete.modell} wurde erfolgreich gelöscht.`
      });
    }
  };

  // CRUD Operations für Mitarbeiter
  const addMitarbeiter = (mitarbeiter: Mitarbeiter) => {
    const newMitarbeiter = {
      ...mitarbeiter,
      id: mitarbeiter.id || uuidv4()
    };
    
    setState(prev => ({
      ...prev,
      mitarbeiter: [...prev.mitarbeiter, newMitarbeiter]
    }));
    
    toast({
      title: "Mitarbeiter hinzugefügt",
      description: `${mitarbeiter.vorname} ${mitarbeiter.nachname} wurde erfolgreich hinzugefügt.`
    });
  };

  const updateMitarbeiter = (mitarbeiter: Mitarbeiter) => {
    setState(prev => ({
      ...prev,
      mitarbeiter: prev.mitarbeiter.map(m => m.id === mitarbeiter.id ? mitarbeiter : m)
    }));
    
    toast({
      title: "Mitarbeiter aktualisiert",
      description: `${mitarbeiter.vorname} ${mitarbeiter.nachname} wurde erfolgreich aktualisiert.`
    });
  };

  const deleteMitarbeiter = (id: string) => {
    const mitarbeiterToDelete = state.mitarbeiter.find(m => m.id === id);
    
    setState(prev => ({
      ...prev,
      mitarbeiter: prev.mitarbeiter.filter(m => m.id !== id)
    }));
    
    if (mitarbeiterToDelete) {
      toast({
        title: "Mitarbeiter gelöscht",
        description: `${mitarbeiterToDelete.vorname} ${mitarbeiterToDelete.nachname} wurde erfolgreich gelöscht.`
      });
    }
  };

  // CRUD Operations für Umsätze
  const addUmsatz = (umsatz: Umsatz) => {
    const newUmsatz = {
      ...umsatz,
      id: umsatz.id || uuidv4(),
      erfasstAm: umsatz.erfasstAm || new Date()
    };
    
    setState(prev => ({
      ...prev,
      umsaetze: [...prev.umsaetze, newUmsatz]
    }));
    
    toast({
      title: "Umsatz hinzugefügt",
      description: `Umsatz für KW ${umsatz.kalenderwoche} wurde erfolgreich hinzugefügt.`
    });
  };

  const updateUmsatz = (umsatz: Umsatz) => {
    setState(prev => ({
      ...prev,
      umsaetze: prev.umsaetze.map(u => u.id === umsatz.id ? umsatz : u)
    }));
    
    toast({
      title: "Umsatz aktualisiert",
      description: `Umsatz für KW ${umsatz.kalenderwoche} wurde erfolgreich aktualisiert.`
    });
  };

  const deleteUmsatz = (id: string) => {
    const umsatzToDelete = state.umsaetze.find(u => u.id === id);
    
    setState(prev => ({
      ...prev,
      umsaetze: prev.umsaetze.filter(u => u.id !== id)
    }));
    
    if (umsatzToDelete) {
      toast({
        title: "Umsatz gelöscht",
        description: `Umsatz für KW ${umsatzToDelete.kalenderwoche} wurde erfolgreich gelöscht.`
      });
    }
  };

  // CRUD Operations für Abrechnungen
  const addAbrechnung = (abrechnung: Abrechnung) => {
    const newAbrechnung = {
      ...abrechnung,
      id: abrechnung.id || uuidv4(),
      erstelltAm: abrechnung.erstelltAm || new Date()
    };
    
    setState(prev => ({
      ...prev,
      abrechnungen: [...prev.abrechnungen, newAbrechnung]
    }));
    
    toast({
      title: "Abrechnung erstellt",
      description: `Abrechnung für Zeitraum ${abrechnung.startWoche} bis ${abrechnung.endWoche} wurde erstellt.`
    });
  };

  const value = {
    state,
    addFahrzeug,
    updateFahrzeug,
    deleteFahrzeug,
    addMitarbeiter,
    updateMitarbeiter,
    deleteMitarbeiter,
    addUmsatz,
    updateUmsatz,
    deleteUmsatz,
    addAbrechnung
  };

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppStoreContext);
  if (context === undefined) {
    throw new Error("useAppStore must be used within a AppStoreProvider");
  }
  return context;
};
