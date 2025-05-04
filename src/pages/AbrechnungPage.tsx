
import { useState, useEffect } from "react";
import { useAppStore } from "@/store/AppStoreContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AmountInput } from "@/components/ui/amount-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { 
  Abrechnung, 
  Mitarbeiter, 
  SonstigerPosten, 
  Umsatz 
} from "@/types";
import {
  formatCurrency,
  formatKalenderwoche,
  calculateMitarbeiterAnteil,
  isKwBeforeOther
} from "@/utils/helpers";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";

const AbrechnungPage = () => {
  const { state, addAbrechnung } = useAppStore();
  const { mitarbeiter, umsaetze } = state;
  
  const [selectedMitarbeiterId, setSelectedMitarbeiterId] = useState<string>("");
  const [selectedMitarbeiter, setSelectedMitarbeiter] = useState<Mitarbeiter | null>(null);
  const [selectedKalenderwochen, setSelectedKalenderwochen] = useState<string[]>([]);
  const [verfuegbareKalenderwochen, setVerfuegbareKalenderwochen] = useState<string[]>([]);
  const [selectedUmsaetze, setSelectedUmsaetze] = useState<Umsatz[]>([]);
  
  // Formularfelder für manuelle Eingaben
  const [steuer, setSteuer] = useState<number>(0);
  const [nettoGehalt, setNettoGehalt] = useState<number>(0);
  const [sonstigeAbzuege, setSonstigeAbzuege] = useState<SonstigerPosten[]>([]);
  const [sonstigeZuschuesse, setSonstigeZuschuesse] = useState<SonstigerPosten[]>([]);
  
  // Neue Posten temporär speichern
  const [neuerAbzug, setNeuerAbzug] = useState<{ bezeichnung: string; betrag: number }>({
    bezeichnung: "",
    betrag: 0
  });
  
  const [neuerZuschuss, setNeuerZuschuss] = useState<{ bezeichnung: string; betrag: number }>({
    bezeichnung: "",
    betrag: 0
  });
  
  // Berechnete Werte
  const [gesamtrechnung, setGesamtrechnung] = useState({
    gesamtumsatz: 0,
    nettoFahrpreis: 0,
    aktionen: 0,
    rueckerstattungen: 0,
    trinkgeld: 0,
    bargeld: 0,
    fahrten: 0,
    waschen: 0,
    
    mitarbeiterAnteil: 0, // Gesamtumsatz × Prozentsatz
    summeZuschuesse: 0, // Trinkgeld + Waschen + Rückerstattungen + Sonstige Zuschüsse
    summeAbzuege: 0, // Bargeld + Steuer + Netto-Gehalt + Sonstige Abzüge
    
    ergebnis: 0 // Mitarbeiteranteil + Zuschüsse - Abzüge
  });
  
  // Wenn sich der Mitarbeiter ändert, setze dessen Werte als Standard
  useEffect(() => {
    if (selectedMitarbeiterId) {
      const mitarbeiter = state.mitarbeiter.find(m => m.id === selectedMitarbeiterId);
      if (mitarbeiter) {
        setSelectedMitarbeiter(mitarbeiter);
        setSteuer(mitarbeiter.steuer || 0);
        setNettoGehalt(mitarbeiter.nettoGehalt || 0);
        
        // Verfügbare Kalenderwochen für diesen Mitarbeiter finden
        const mitarbeiterUmsaetze = state.umsaetze.filter(
          u => u.mitarbeiterId === mitarbeiter.id
        );
        
        const kalenderwochen = mitarbeiterUmsaetze.map(u => u.kalenderwoche);
        
        // Nach Datum sortieren (neueste zuerst)
        kalenderwochen.sort((a, b) => {
          const [yearA, weekA] = a.split("-").map(Number);
          const [yearB, weekB] = b.split("-").map(Number);
          
          if (yearA !== yearB) {
            return yearB - yearA; // Jahr absteigend
          }
          return weekB - weekA; // Woche absteigend
        });
        
        setVerfuegbareKalenderwochen(kalenderwochen);
        setSelectedKalenderwochen([]);
        setSonstigeAbzuege([]);
        setSonstigeZuschuesse([]);
      } else {
        setSelectedMitarbeiter(null);
      }
    } else {
      setVerfuegbareKalenderwochen([]);
      setSelectedKalenderwochen([]);
      setSelectedMitarbeiter(null);
    }
  }, [selectedMitarbeiterId, state.mitarbeiter]);
  
  // Wenn sich die ausgewählten Kalenderwochen ändern, aktualisiere die Umsätze
  useEffect(() => {
    if (selectedMitarbeiterId && selectedKalenderwochen.length > 0) {
      const mitarbeiterUmsaetze = umsaetze.filter(
        u => u.mitarbeiterId === selectedMitarbeiterId && selectedKalenderwochen.includes(u.kalenderwoche)
      );
      setSelectedUmsaetze(mitarbeiterUmsaetze);
    } else {
      setSelectedUmsaetze([]);
    }
  }, [selectedMitarbeiterId, selectedKalenderwochen, umsaetze]);
  
  // Berechnung der Gesamtwerte basierend auf ausgewählten Umsätzen und manuellen Eingaben
  useEffect(() => {
    if (selectedUmsaetze.length === 0 || !selectedMitarbeiter) {
      setGesamtrechnung({
        gesamtumsatz: 0,
        nettoFahrpreis: 0,
        aktionen: 0,
        rueckerstattungen: 0,
        trinkgeld: 0,
        bargeld: 0,
        fahrten: 0,
        waschen: 0,
        mitarbeiterAnteil: 0,
        summeZuschuesse: 0,
        summeAbzuege: 0,
        ergebnis: 0
      });
      return;
    }
    
    // Aggregiere alle Umsatzdaten
    const gesamtumsatz = selectedUmsaetze.reduce((sum, u) => sum + u.gesamtumsatz, 0);
    const nettoFahrpreis = selectedUmsaetze.reduce((sum, u) => sum + u.nettoFahrpreis, 0);
    const aktionen = selectedUmsaetze.reduce((sum, u) => sum + u.aktionen, 0);
    const rueckerstattungen = selectedUmsaetze.reduce((sum, u) => sum + u.rueckerstattungen, 0);
    const trinkgeld = selectedUmsaetze.reduce((sum, u) => sum + u.trinkgeld, 0);
    const bargeld = selectedUmsaetze.reduce((sum, u) => sum + u.bargeld, 0);
    const fahrten = selectedUmsaetze.reduce((sum, u) => sum + u.fahrten, 0);
    const waschen = selectedUmsaetze.reduce((sum, u) => sum + u.waschen, 0);
    
    // Berechne Mitarbeiteranteil basierend auf Gesamtumsatz und Prozentsatz
    const mitarbeiterAnteil = calculateMitarbeiterAnteil(
      gesamtumsatz,
      selectedMitarbeiter.prozentVerguetung
    );
    
    // Summe aller sonstigen Abzüge
    const summeSonstigeAbzuege = sonstigeAbzuege.reduce(
      (sum, abzug) => sum + abzug.betrag,
      0
    );
    
    // Summe aller sonstigen Zuschüsse
    const summeSonstigeZuschuesse = sonstigeZuschuesse.reduce(
      (sum, zuschuss) => sum + zuschuss.betrag,
      0
    );
    
    // Gesamtsumme der Zuschüsse: Trinkgeld + Waschen + Rückerstattungen + Sonstige
    const summeZuschuesse = trinkgeld + waschen + rueckerstattungen + summeSonstigeZuschuesse;
    
    // Gesamtsumme der Abzüge: Bargeld + Steuer + Netto-Gehalt + Sonstige
    const summeAbzuege = bargeld + steuer + nettoGehalt + summeSonstigeAbzuege;
    
    // Endergebnis
    const ergebnis = mitarbeiterAnteil + summeZuschuesse - summeAbzuege;
    
    setGesamtrechnung({
      gesamtumsatz,
      nettoFahrpreis,
      aktionen,
      rueckerstattungen,
      trinkgeld,
      bargeld,
      fahrten,
      waschen,
      mitarbeiterAnteil,
      summeZuschuesse,
      summeAbzuege,
      ergebnis
    });
    
  }, [
    selectedUmsaetze,
    selectedMitarbeiter,
    steuer,
    nettoGehalt,
    sonstigeAbzuege,
    sonstigeZuschuesse
  ]);
  
  // Handler für Kalenderwochen-Auswahl
  const handleKalenderwocheSelect = (kw: string) => {
    if (selectedKalenderwochen.includes(kw)) {
      // Wenn bereits ausgewählt, entferne
      setSelectedKalenderwochen(
        selectedKalenderwochen.filter(item => item !== kw)
      );
    } else {
      // Wenn noch nicht ausgewählt, füge hinzu
      setSelectedKalenderwochen([...selectedKalenderwochen, kw]);
    }
  };
  
  // Handler zum Hinzufügen eines neuen Abzugs
  const handleAddAbzug = () => {
    if (!neuerAbzug.bezeichnung || neuerAbzug.betrag <= 0) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine Bezeichnung und einen positiven Betrag ein.",
        variant: "destructive"
      });
      return;
    }
    
    setSonstigeAbzuege([
      ...sonstigeAbzuege,
      {
        id: uuidv4(),
        bezeichnung: neuerAbzug.bezeichnung,
        betrag: neuerAbzug.betrag
      }
    ]);
    
    // Formular zurücksetzen
    setNeuerAbzug({ bezeichnung: "", betrag: 0 });
  };
  
  // Handler zum Entfernen eines Abzugs
  const handleRemoveAbzug = (id: string) => {
    setSonstigeAbzuege(sonstigeAbzuege.filter(item => item.id !== id));
  };
  
  // Handler zum Hinzufügen eines neuen Zuschusses
  const handleAddZuschuss = () => {
    if (!neuerZuschuss.bezeichnung || neuerZuschuss.betrag <= 0) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine Bezeichnung und einen positiven Betrag ein.",
        variant: "destructive"
      });
      return;
    }
    
    setSonstigeZuschuesse([
      ...sonstigeZuschuesse,
      {
        id: uuidv4(),
        bezeichnung: neuerZuschuss.bezeichnung,
        betrag: neuerZuschuss.betrag
      }
    ]);
    
    // Formular zurücksetzen
    setNeuerZuschuss({ bezeichnung: "", betrag: 0 });
  };
  
  // Handler zum Entfernen eines Zuschusses
  const handleRemoveZuschuss = (id: string) => {
    setSonstigeZuschuesse(sonstigeZuschuesse.filter(item => item.id !== id));
  };
  
  // Handler zum Speichern der Abrechnung
  const handleSaveAbrechnung = () => {
    if (!selectedMitarbeiterId || selectedKalenderwochen.length === 0) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie einen Mitarbeiter und mindestens eine Kalenderwoche aus.",
        variant: "destructive"
      });
      return;
    }
    
    // Finde älteste und neueste Kalenderwoche
    const sortedKws = [...selectedKalenderwochen].sort((a, b) => {
      const [yearA, weekA] = a.split("-").map(Number);
      const [yearB, weekB] = b.split("-").map(Number);
      
      if (yearA !== yearB) {
        return yearA - yearB; // Jahr aufsteigend
      }
      return weekA - weekB; // Woche aufsteigend
    });
    
    const startWoche = sortedKws[0];
    const endWoche = sortedKws[sortedKws.length - 1];
    
    // Erstelle die Abrechnung
    const abrechnung: Abrechnung = {
      id: uuidv4(),
      mitarbeiterId: selectedMitarbeiterId,
      startWoche,
      endWoche,
      erstelltAm: new Date(),
      gesamtumsatz: gesamtrechnung.gesamtumsatz,
      nettoFahrpreis: gesamtrechnung.nettoFahrpreis,
      aktionen: gesamtrechnung.aktionen,
      rueckerstattungen: gesamtrechnung.rueckerstattungen,
      trinkgeld: gesamtrechnung.trinkgeld,
      bargeld: gesamtrechnung.bargeld,
      fahrten: gesamtrechnung.fahrten,
      waschen: gesamtrechnung.waschen,
      steuer,
      nettoGehalt,
      sonstigeAbzuege,
      sonstigeZuschuesse,
      ergebnis: gesamtrechnung.ergebnis
    };
    
    // Abrechnung speichern
    addAbrechnung(abrechnung);
    
    toast({
      title: "Abrechnung erstellt",
      description: `Abrechnung für ${selectedMitarbeiter?.vorname} ${selectedMitarbeiter?.nachname} wurde gespeichert.`
    });
    
    // Formular zurücksetzen
    setSelectedKalenderwochen([]);
    setSonstigeAbzuege([]);
    setSonstigeZuschuesse([]);
  };

  return (
    <div>
      <PageHeader
        title="Abrechnung"
        description="Erstellung von Mitarbeiter-Abrechnungen basierend auf Umsätzen"
      />
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Abrechnung erstellen</CardTitle>
            <CardDescription>
              Wählen Sie einen Mitarbeiter und die Kalenderwochen, für die eine Abrechnung erstellt werden soll.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div>
                <Label htmlFor="mitarbeiter">Mitarbeiter</Label>
                <Select
                  value={selectedMitarbeiterId}
                  onValueChange={setSelectedMitarbeiterId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mitarbeiter auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {mitarbeiter.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.vorname} {m.nachname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedMitarbeiterId && (
                <>
                  <div className="space-y-4">
                    <Label>Kalenderwochen auswählen</Label>
                    {verfuegbareKalenderwochen.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {verfuegbareKalenderwochen.map((kw) => (
                          <Button
                            key={kw}
                            variant={selectedKalenderwochen.includes(kw) ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => handleKalenderwocheSelect(kw)}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formatKalenderwoche(kw)}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        Keine Umsätze für diesen Mitarbeiter verfügbar.
                      </div>
                    )}
                  </div>
                  
                  {/* Manuelle Einstellungen und Rechner */}
                  {selectedKalenderwochen.length > 0 && (
                    <div>
                      <Tabs defaultValue="overview">
                        <TabsList>
                          <TabsTrigger value="overview">Übersicht</TabsTrigger>
                          <TabsTrigger value="zuSchuesse">Zuschüsse</TabsTrigger>
                          <TabsTrigger value="abzuege">Abzüge</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="overview" className="space-y-6">
                          <div className="rounded-md bg-muted/50 p-4">
                            <h3 className="mb-4 font-medium">Zusammenfassung</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Ausgewählte Kalenderwochen:</span>
                                <span>{selectedKalenderwochen.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Gesamtumsatz:</span>
                                <span className="font-medium money-value">
                                  {formatCurrency(gesamtrechnung.gesamtumsatz)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Netto-Fahrpreis:</span>
                                <span className="money-value">
                                  {formatCurrency(gesamtrechnung.nettoFahrpreis)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Aktionen:</span>
                                <span className="money-value">
                                  {formatCurrency(gesamtrechnung.aktionen)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Rückerstattungen:</span>
                                <span className="money-value">
                                  {formatCurrency(gesamtrechnung.rueckerstattungen)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Trinkgeld:</span>
                                <span className="money-value">
                                  {formatCurrency(gesamtrechnung.trinkgeld)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Bargeld:</span>
                                <span className="money-value">
                                  {formatCurrency(gesamtrechnung.bargeld)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Waschkosten:</span>
                                <span className="money-value">
                                  {formatCurrency(gesamtrechnung.waschen)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Fahrten:</span>
                                <span>{gesamtrechnung.fahrten}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div>
                                <Label htmlFor="steuer">Steuer (€)</Label>
                                <AmountInput
                                  id="steuer"
                                  value={steuer}
                                  onChange={(value) => setSteuer(value !== undefined ? value : 0)}
                                  allowNegative={false}
                                />
                              </div>
                              <div>
                                <Label htmlFor="nettoGehalt">Netto-Gehalt (€)</Label>
                                <AmountInput
                                  id="nettoGehalt"
                                  value={nettoGehalt}
                                  onChange={(value) => setNettoGehalt(value !== undefined ? value : 0)}
                                  allowNegative={false}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="rounded-md bg-primary/5 p-4 space-y-3">
                            <h3 className="font-medium">Ergebnis der Abrechnung</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Gesamtumsatz:</span>
                                <span className="money-value">
                                  {formatCurrency(gesamtrechnung.gesamtumsatz)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>
                                  Mitarbeiteranteil ({selectedMitarbeiter?.prozentVerguetung}%):
                                </span>
                                <span className="money-value">
                                  {formatCurrency(gesamtrechnung.mitarbeiterAnteil)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>+ Zuschüsse gesamt:</span>
                                <span className="money-value">
                                  {formatCurrency(gesamtrechnung.summeZuschuesse)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>- Abzüge gesamt:</span>
                                <span className="money-value">
                                  {formatCurrency(gesamtrechnung.summeAbzuege)}
                                </span>
                              </div>
                              <div className="h-px bg-border my-2" />
                              <div className="flex justify-between font-medium text-lg">
                                <span>Auszahlungsbetrag:</span>
                                <span className="money-value">
                                  {formatCurrency(gesamtrechnung.ergebnis)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="zuSchuesse" className="space-y-6">
                          <div className="space-y-4">
                            <h3 className="font-medium">Sonstige Zuschüsse hinzufügen</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                              <div className="sm:col-span-3">
                                <Label htmlFor="bezeichnung">Bezeichnung</Label>
                                <Input
                                  id="bezeichnung"
                                  value={neuerZuschuss.bezeichnung}
                                  onChange={(e) =>
                                    setNeuerZuschuss({
                                      ...neuerZuschuss,
                                      bezeichnung: e.target.value
                                    })
                                  }
                                  placeholder="z.B. Bonus"
                                />
                              </div>
                              <div>
                                <Label htmlFor="betrag">Betrag (€)</Label>
                                <AmountInput
                                  id="betrag"
                                  value={neuerZuschuss.betrag}
                                  onChange={(value) =>
                                    setNeuerZuschuss({
                                      ...neuerZuschuss,
                                      betrag: value !== undefined ? value : 0
                                    })
                                  }
                                  allowNegative={false}
                                />
                              </div>
                            </div>
                            <Button onClick={handleAddZuschuss}>
                              <Plus className="mr-2 h-4 w-4" />
                              Zuschuss hinzufügen
                            </Button>
                          </div>
                          
                          <div className="rounded-md border">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-muted/50">
                                  <th className="py-2 px-4 text-left font-medium">Bezeichnung</th>
                                  <th className="py-2 px-4 text-right font-medium">Betrag</th>
                                  <th className="py-2 px-4 text-center font-medium">Aktion</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sonstigeZuschuesse.length === 0 ? (
                                  <tr>
                                    <td colSpan={3} className="py-4 text-center text-muted-foreground">
                                      Keine sonstigen Zuschüsse definiert
                                    </td>
                                  </tr>
                                ) : (
                                  sonstigeZuschuesse.map((zuschuss) => (
                                    <tr key={zuschuss.id} className="border-t">
                                      <td className="py-2 px-4">{zuschuss.bezeichnung}</td>
                                      <td className="py-2 px-4 text-right money-value">
                                        {formatCurrency(zuschuss.betrag)}
                                      </td>
                                      <td className="py-2 px-4 text-center">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleRemoveZuschuss(zuschuss.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ))
                                )}
                                <tr className="border-t">
                                  <td className="py-2 px-4 text-right font-medium">
                                    Gesamt:
                                  </td>
                                  <td className="py-2 px-4 text-right font-medium money-value">
                                    {formatCurrency(
                                      sonstigeZuschuesse.reduce(
                                        (sum, zuschuss) => sum + zuschuss.betrag,
                                        0
                                      )
                                    )}
                                  </td>
                                  <td></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="abzuege" className="space-y-6">
                          <div className="space-y-4">
                            <h3 className="font-medium">Sonstige Abzüge hinzufügen</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                              <div className="sm:col-span-3">
                                <Label htmlFor="bezeichnung">Bezeichnung</Label>
                                <Input
                                  id="bezeichnung"
                                  value={neuerAbzug.bezeichnung}
                                  onChange={(e) =>
                                    setNeuerAbzug({
                                      ...neuerAbzug,
                                      bezeichnung: e.target.value
                                    })
                                  }
                                  placeholder="z.B. Vorschuss"
                                />
                              </div>
                              <div>
                                <Label htmlFor="betrag">Betrag (€)</Label>
                                <AmountInput
                                  id="betrag"
                                  value={neuerAbzug.betrag}
                                  onChange={(value) =>
                                    setNeuerAbzug({
                                      ...neuerAbzug,
                                      betrag: value !== undefined ? value : 0
                                    })
                                  }
                                  allowNegative={false}
                                />
                              </div>
                            </div>
                            <Button onClick={handleAddAbzug}>
                              <Plus className="mr-2 h-4 w-4" />
                              Abzug hinzufügen
                            </Button>
                          </div>
                          
                          <div className="rounded-md border">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-muted/50">
                                  <th className="py-2 px-4 text-left font-medium">Bezeichnung</th>
                                  <th className="py-2 px-4 text-right font-medium">Betrag</th>
                                  <th className="py-2 px-4 text-center font-medium">Aktion</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sonstigeAbzuege.length === 0 ? (
                                  <tr>
                                    <td colSpan={3} className="py-4 text-center text-muted-foreground">
                                      Keine sonstigen Abzüge definiert
                                    </td>
                                  </tr>
                                ) : (
                                  sonstigeAbzuege.map((abzug) => (
                                    <tr key={abzug.id} className="border-t">
                                      <td className="py-2 px-4">{abzug.bezeichnung}</td>
                                      <td className="py-2 px-4 text-right money-value">
                                        {formatCurrency(abzug.betrag)}
                                      </td>
                                      <td className="py-2 px-4 text-center">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleRemoveAbzug(abzug.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ))
                                )}
                                <tr className="border-t">
                                  <td className="py-2 px-4 text-right font-medium">
                                    Gesamt:
                                  </td>
                                  <td className="py-2 px-4 text-right font-medium money-value">
                                    {formatCurrency(
                                      sonstigeAbzuege.reduce(
                                        (sum, abzug) => sum + abzug.betrag,
                                        0
                                      )
                                    )}
                                  </td>
                                  <td></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleSaveAbrechnung}
              disabled={!selectedMitarbeiterId || selectedKalenderwochen.length === 0}
            >
              Abrechnung speichern
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AbrechnungPage;
