
import { useState, useEffect } from "react";
import { useAppStore } from "@/store/AppStoreContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AmountInput } from "@/components/ui/amount-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save } from "lucide-react";
import { Umsatz, Mitarbeiter } from "@/types";
import { 
  formatCurrency, 
  formatKalenderwoche, 
  getCurrentKalenderwoche, 
  createKalenderwocheId,
  generateKalenderwochen
} from "@/utils/helpers";
import { v4 as uuidv4 } from "uuid";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

const UmsaetzePage = () => {
  const { state, addUmsatz, updateUmsatz, deleteUmsatz } = useAppStore();
  const { umsaetze, mitarbeiter } = state;
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUmsatz, setEditingUmsatz] = useState<Umsatz | null>(null);
  
  // State for selected employee and their revenue entries
  const [selectedMitarbeiterId, setSelectedMitarbeiterId] = useState<string>("");
  const [filteredUmsaetze, setFilteredUmsaetze] = useState<Umsatz[]>([]);
  
  // Aktuelle Kalenderwoche ermitteln
  const { week: currentWeek, year: currentYear } = getCurrentKalenderwoche();
  const currentKw = createKalenderwocheId(currentYear, currentWeek);
  
  // Kalenderwochen für das aktuelle Jahr und das Vorjahr generieren
  const years = [currentYear, currentYear - 1];
  const kalenderwochen: { value: string; label: string }[] = [];
  
  years.forEach(year => {
    const kws = generateKalenderwochen(year);
    kws.forEach(kw => {
      kalenderwochen.push({
        value: kw,
        label: formatKalenderwoche(kw)
      });
    });
  });

  const [currentUmsatz, setCurrentUmsatz] = useState<Umsatz>({
    id: "",
    mitarbeiterId: "",
    wochenNummer: currentWeek,
    jahr: currentYear,
    kalenderwoche: currentKw,
    erfasstAm: new Date(),
    gesamtumsatz: 0,
    nettoFahrpreis: 0,
    aktionen: 0,
    rueckerstattungen: 0,
    trinkgeld: 0,
    bargeld: 0,
    fahrten: 0,
    waschen: 0
  });

  // New entry state for quick input form
  const [newEntry, setNewEntry] = useState<Umsatz>({
    id: "",
    mitarbeiterId: "",
    wochenNummer: currentWeek,
    jahr: currentYear,
    kalenderwoche: currentKw,
    erfasstAm: new Date(),
    gesamtumsatz: 0,
    nettoFahrpreis: 0,
    aktionen: 0,
    rueckerstattungen: 0,
    trinkgeld: 0,
    bargeld: 0,
    fahrten: 0,
    waschen: 0
  });

  // Update filtered umsaetze when mitarbeiter selection changes
  useEffect(() => {
    if (selectedMitarbeiterId) {
      const filtered = umsaetze.filter(
        umsatz => umsatz.mitarbeiterId === selectedMitarbeiterId
      );
      setFilteredUmsaetze(filtered.sort((a, b) => {
        const [yearA, weekA] = a.kalenderwoche.split("-").map(Number);
        const [yearB, weekB] = b.kalenderwoche.split("-").map(Number);
        
        if (yearA !== yearB) {
          return yearB - yearA; // Jahr absteigend
        }
        return weekB - weekA; // Woche absteigend
      }));
      
      // Update newEntry with selected mitarbeiter
      setNewEntry(prev => ({
        ...prev,
        mitarbeiterId: selectedMitarbeiterId
      }));
    } else {
      setFilteredUmsaetze([]);
    }
  }, [selectedMitarbeiterId, umsaetze]);

  // Handler for Umsatz-Formular
  const handleMitarbeiterChange = (mitarbeiterId: string) => {
    setCurrentUmsatz({
      ...currentUmsatz,
      mitarbeiterId
    });
  };

  const handleKalenderwocheChange = (kalenderwoche: string) => {
    const [jahr, woche] = kalenderwoche.split("-").map(Number);
    
    setCurrentUmsatz({
      ...currentUmsatz,
      kalenderwoche,
      jahr,
      wochenNummer: woche
    });
  };

  const handleNumberInputChange = (name: string, value: number | undefined) => {
    setCurrentUmsatz({
      ...currentUmsatz,
      [name]: value !== undefined ? value : 0
    });
  };

  // Handler for quick entry form
  const handleNewEntryChange = (name: string, value: number | undefined) => {
    setNewEntry({
      ...newEntry,
      [name]: value !== undefined ? value : 0
    });
  };

  const handleNewEntryKalenderwocheChange = (kalenderwoche: string) => {
    const [jahr, woche] = kalenderwoche.split("-").map(Number);
    
    setNewEntry({
      ...newEntry,
      kalenderwoche,
      jahr,
      wochenNummer: woche
    });
  };

  const handleSaveNewEntry = () => {
    if (!selectedMitarbeiterId || !newEntry.kalenderwoche) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie einen Mitarbeiter und eine Kalenderwoche aus.",
        variant: "destructive"
      });
      return;
    }

    // Check if entry already exists for this employee and calendar week
    const existingEntry = umsaetze.find(
      u => u.mitarbeiterId === selectedMitarbeiterId && u.kalenderwoche === newEntry.kalenderwoche
    );

    if (existingEntry) {
      // Update existing entry
      updateUmsatz({
        ...existingEntry,
        ...newEntry,
        mitarbeiterId: selectedMitarbeiterId
      });

      toast({
        title: "Eintrag aktualisiert",
        description: `Umsatz für KW ${formatKalenderwoche(newEntry.kalenderwoche)} wurde aktualisiert.`
      });
    } else {
      // Add new entry
      addUmsatz({
        ...newEntry,
        id: uuidv4(),
        mitarbeiterId: selectedMitarbeiterId,
        erfasstAm: new Date()
      });

      toast({
        title: "Eintrag gespeichert",
        description: `Neuer Umsatz für KW ${formatKalenderwoche(newEntry.kalenderwoche)} wurde hinzugefügt.`
      });
    }

    // Reset form with the same mitarbeiter
    setNewEntry({
      id: "",
      mitarbeiterId: selectedMitarbeiterId,
      wochenNummer: currentWeek,
      jahr: currentYear,
      kalenderwoche: currentKw,
      erfasstAm: new Date(),
      gesamtumsatz: 0,
      nettoFahrpreis: 0,
      aktionen: 0,
      rueckerstattungen: 0,
      trinkgeld: 0,
      bargeld: 0,
      fahrten: 0,
      waschen: 0
    });
  };

  // Umsatz-Dialog öffnen für Bearbeitung
  const handleEditUmsatz = (umsatz: Umsatz) => {
    setEditingUmsatz(umsatz);
    setCurrentUmsatz({ ...umsatz });
    setIsDialogOpen(true);
  };

  // Umsatz-Dialog öffnen für Neuanlage
  const handleNewUmsatz = () => {
    setEditingUmsatz(null);
    setCurrentUmsatz({
      id: "",
      mitarbeiterId: selectedMitarbeiterId || "",
      wochenNummer: currentWeek,
      jahr: currentYear,
      kalenderwoche: currentKw,
      erfasstAm: new Date(),
      gesamtumsatz: 0,
      nettoFahrpreis: 0,
      aktionen: 0,
      rueckerstattungen: 0,
      trinkgeld: 0,
      bargeld: 0,
      fahrten: 0,
      waschen: 0
    });
    setIsDialogOpen(true);
  };

  // Umsatz speichern
  const handleSaveUmsatz = () => {
    if (!currentUmsatz.mitarbeiterId || !currentUmsatz.kalenderwoche) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie einen Mitarbeiter und eine Kalenderwoche aus.",
        variant: "destructive"
      });
      return;
    }

    if (editingUmsatz) {
      updateUmsatz(currentUmsatz);
    } else {
      addUmsatz({
        ...currentUmsatz,
        id: uuidv4(),
        erfasstAm: new Date()
      });
    }

    setIsDialogOpen(false);
  };

  // DataTable Spalten
  const columns = [
    {
      accessorKey: "kalenderwoche",
      header: "Kalenderwoche",
      cell: (umsatz: Umsatz) => (
        <span>{formatKalenderwoche(umsatz.kalenderwoche)}</span>
      )
    },
    {
      accessorKey: "mitarbeiterName",
      header: "Mitarbeiter",
      cell: (umsatz: Umsatz) => {
        const mitarbeiterObj = mitarbeiter.find(m => m.id === umsatz.mitarbeiterId);
        return mitarbeiterObj ? `${mitarbeiterObj.vorname} ${mitarbeiterObj.nachname}` : "-";
      }
    },
    {
      accessorKey: "gesamtumsatz",
      header: "Gesamtumsatz",
      cell: (umsatz: Umsatz) => (
        <span className="money-value">{formatCurrency(umsatz.gesamtumsatz)}</span>
      ),
      className: "text-right"
    },
    {
      accessorKey: "nettoFahrpreis",
      header: "Netto-Fahrpreis",
      cell: (umsatz: Umsatz) => (
        <span className="money-value">{formatCurrency(umsatz.nettoFahrpreis)}</span>
      ),
      className: "text-right"
    },
    {
      accessorKey: "trinkgeld",
      header: "Trinkgeld",
      cell: (umsatz: Umsatz) => (
        <span className="money-value">{formatCurrency(umsatz.trinkgeld)}</span>
      ),
      className: "text-right"
    },
    {
      accessorKey: "bargeld",
      header: "Bargeld",
      cell: (umsatz: Umsatz) => (
        <span className="money-value">{formatCurrency(umsatz.bargeld)}</span>
      ),
      className: "text-right"
    },
    {
      accessorKey: "fahrten",
      header: "Fahrten",
      cell: (umsatz: Umsatz) => (
        <span>{umsatz.fahrten}</span>
      ),
      className: "text-right"
    }
  ];

  // Sortiere die Umsätze nach Kalenderwoche (neueste zuerst)
  const sortedUmsaetze = [...umsaetze].sort((a, b) => {
    const [yearA, weekA] = a.kalenderwoche.split("-").map(Number);
    const [yearB, weekB] = b.kalenderwoche.split("-").map(Number);
    
    if (yearA !== yearB) {
      return yearB - yearA; // Jahr absteigend
    }
    return weekB - weekA; // Woche absteigend
  });

  // Get selected mitarbeiter name for display
  const selectedMitarbeiterName = selectedMitarbeiterId 
    ? mitarbeiter.find(m => m.id === selectedMitarbeiterId)
      ? `${mitarbeiter.find(m => m.id === selectedMitarbeiterId)?.vorname || ''} ${mitarbeiter.find(m => m.id === selectedMitarbeiterId)?.nachname || ''}`
      : ''
    : '';

  return (
    <div>
      <PageHeader 
        title="Umsätze" 
        description="Verwaltung der wöchentlichen Umsätze pro Mitarbeiter"
      >
        <Button onClick={handleNewUmsatz}>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Umsatz
        </Button>
      </PageHeader>

      {/* Mitarbeiter-Auswahl */}
      <div className="mt-6 p-4 border rounded-lg bg-white shadow-sm">
        <div className="mb-4">
          <Label htmlFor="mitarbeiter-select" className="text-lg font-medium">Mitarbeiter auswählen</Label>
          <div className="flex gap-4 mt-2">
            <Select
              value={selectedMitarbeiterId}
              onValueChange={setSelectedMitarbeiterId}
            >
              <SelectTrigger className="w-full max-w-md">
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
        </div>

        {selectedMitarbeiterId && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">
              Umsätze für {selectedMitarbeiterName} erfassen
            </h3>
            
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Kalenderwoche</TableHead>
                    <TableHead>Gesamtumsatz</TableHead>
                    <TableHead>Netto-Fahrpreis</TableHead>
                    <TableHead>Aktionen</TableHead>
                    <TableHead>Rückerstattungen</TableHead>
                    <TableHead>Trinkgeld</TableHead>
                    <TableHead>Bargeld</TableHead>
                    <TableHead>Fahrten</TableHead>
                    <TableHead>Waschen</TableHead>
                    <TableHead className="w-[100px]">Aktion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Select
                        value={newEntry.kalenderwoche}
                        onValueChange={handleNewEntryKalenderwocheChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="KW auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {kalenderwochen.map((kw) => (
                            <SelectItem key={kw.value} value={kw.value}>
                              {kw.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <AmountInput
                        value={newEntry.gesamtumsatz}
                        onChange={(value) => handleNewEntryChange("gesamtumsatz", value)}
                      />
                    </TableCell>
                    <TableCell>
                      <AmountInput
                        value={newEntry.nettoFahrpreis}
                        onChange={(value) => handleNewEntryChange("nettoFahrpreis", value)}
                      />
                    </TableCell>
                    <TableCell>
                      <AmountInput
                        value={newEntry.aktionen}
                        onChange={(value) => handleNewEntryChange("aktionen", value)}
                      />
                    </TableCell>
                    <TableCell>
                      <AmountInput
                        value={newEntry.rueckerstattungen}
                        onChange={(value) => handleNewEntryChange("rueckerstattungen", value)}
                      />
                    </TableCell>
                    <TableCell>
                      <AmountInput
                        value={newEntry.trinkgeld}
                        onChange={(value) => handleNewEntryChange("trinkgeld", value)}
                      />
                    </TableCell>
                    <TableCell>
                      <AmountInput
                        value={newEntry.bargeld}
                        onChange={(value) => handleNewEntryChange("bargeld", value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="w-20"
                        value={newEntry.fahrten}
                        onChange={(e) => handleNewEntryChange("fahrten", e.target.value ? parseInt(e.target.value) : 0)}
                      />
                    </TableCell>
                    <TableCell>
                      <AmountInput
                        value={newEntry.waschen}
                        onChange={(value) => handleNewEntryChange("waschen", value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button onClick={handleSaveNewEntry} className="w-full">
                        <Save className="h-4 w-4 mr-1" /> Speichern
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            {filteredUmsaetze.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Erfasste Umsätze</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kalenderwoche</TableHead>
                        <TableHead>Gesamtumsatz</TableHead>
                        <TableHead>Netto-Fahrpreis</TableHead>
                        <TableHead>Aktionen</TableHead>
                        <TableHead>Rückerstattungen</TableHead>
                        <TableHead>Trinkgeld</TableHead>
                        <TableHead>Bargeld</TableHead>
                        <TableHead>Fahrten</TableHead>
                        <TableHead>Waschen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUmsaetze.map((umsatz) => (
                        <TableRow 
                          key={umsatz.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleEditUmsatz(umsatz)}
                        >
                          <TableCell>{formatKalenderwoche(umsatz.kalenderwoche)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(umsatz.gesamtumsatz)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(umsatz.nettoFahrpreis)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(umsatz.aktionen)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(umsatz.rueckerstattungen)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(umsatz.trinkgeld)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(umsatz.bargeld)}</TableCell>
                          <TableCell className="text-right">{umsatz.fahrten}</TableCell>
                          <TableCell className="text-right">{formatCurrency(umsatz.waschen)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center py-8 border rounded-md bg-gray-50">
                <p className="text-muted-foreground">
                  Noch keine Umsätze für diesen Mitarbeiter erfasst.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Alle Umsätze</h3>
        <DataTable
          data={sortedUmsaetze}
          columns={columns}
          onRowClick={handleEditUmsatz}
          uniqueKey="id"
        />
      </div>

      {/* Dialog für das Hinzufügen oder Bearbeiten eines Umsatzes */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingUmsatz ? "Umsatz bearbeiten" : "Neuen Umsatz hinzufügen"}
            </DialogTitle>
            <DialogDescription>
              {editingUmsatz
                ? "Bearbeiten Sie die Details des ausgewählten Umsatzes."
                : "Fügen Sie einen neuen Umsatz für einen Mitarbeiter hinzu."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="mitarbeiterId">Mitarbeiter</Label>
                <Select
                  value={currentUmsatz.mitarbeiterId || ""}
                  onValueChange={handleMitarbeiterChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mitarbeiter auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {mitarbeiter.map((mitarbeiter) => (
                      <SelectItem key={mitarbeiter.id} value={mitarbeiter.id}>
                        {mitarbeiter.vorname} {mitarbeiter.nachname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="kalenderwoche">Kalenderwoche</Label>
                <Select
                  value={currentUmsatz.kalenderwoche}
                  onValueChange={handleKalenderwocheChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="KW auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {kalenderwochen.map((kw) => (
                      <SelectItem key={kw.value} value={kw.value}>
                        {kw.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="gesamtumsatz">Gesamtumsatz (€)</Label>
                <AmountInput
                  id="gesamtumsatz"
                  value={currentUmsatz.gesamtumsatz}
                  onChange={(value) => handleNumberInputChange("gesamtumsatz", value)}
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="nettoFahrpreis">Netto-Fahrpreis (€)</Label>
                <AmountInput
                  id="nettoFahrpreis"
                  value={currentUmsatz.nettoFahrpreis}
                  onChange={(value) => handleNumberInputChange("nettoFahrpreis", value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="aktionen">Aktionen (€)</Label>
                <AmountInput
                  id="aktionen"
                  value={currentUmsatz.aktionen}
                  onChange={(value) => handleNumberInputChange("aktionen", value)}
                />
              </div>
              <div>
                <Label htmlFor="rueckerstattungen">Rückerstattungen & Fahrtauslagen (€)</Label>
                <AmountInput
                  id="rueckerstattungen"
                  value={currentUmsatz.rueckerstattungen}
                  onChange={(value) => handleNumberInputChange("rueckerstattungen", value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="trinkgeld">Trinkgeld (€)</Label>
                <AmountInput
                  id="trinkgeld"
                  value={currentUmsatz.trinkgeld}
                  onChange={(value) => handleNumberInputChange("trinkgeld", value)}
                />
              </div>
              <div>
                <Label htmlFor="bargeld">Bargeld (€)</Label>
                <AmountInput
                  id="bargeld"
                  value={currentUmsatz.bargeld}
                  onChange={(value) => handleNumberInputChange("bargeld", value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="fahrten">Anzahl Fahrten</Label>
                <Input
                  id="fahrten"
                  type="number"
                  value={currentUmsatz.fahrten}
                  onChange={(e) => handleNumberInputChange("fahrten", e.target.value ? parseInt(e.target.value) : 0)}
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="waschen">Waschen (€)</Label>
                <AmountInput
                  id="waschen"
                  value={currentUmsatz.waschen}
                  onChange={(value) => handleNumberInputChange("waschen", value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveUmsatz}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UmsaetzePage;
