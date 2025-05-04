import { useState, useEffect } from "react";
import { useAppStore } from "@/store/AppStoreContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Plus } from "lucide-react";
import { Umsatz } from "@/types";
import { formatCurrency, formatKalenderwoche } from "@/utils/helpers";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";

// Import custom components
import { MitarbeiterSelector } from "@/components/umsaetze/MitarbeiterSelector";
import { QuickEntryForm } from "@/components/umsaetze/QuickEntryForm";
import { MitarbeiterEntryList } from "@/components/umsaetze/MitarbeiterEntryList";
import { UmsaetzeDialog } from "@/components/umsaetze/UmsaetzeDialog";
import { useKalenderwochen } from "@/hooks/useKalenderwochen";

const UmsaetzePage = () => {
  const { state, addUmsatz, updateUmsatz, deleteUmsatz } = useAppStore();
  const { umsaetze, mitarbeiter } = state;
  const { toast } = useToast();
  const { currentWeek, currentYear, currentKw, kalenderwochen } = useKalenderwochen();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUmsatz, setEditingUmsatz] = useState<Umsatz | null>(null);
  
  // State for selected employee and their revenue entries
  const [selectedMitarbeiterId, setSelectedMitarbeiterId] = useState<string>("");
  const [filteredUmsaetze, setFilteredUmsaetze] = useState<Umsatz[]>([]);

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
      cell: (umsatz: Umsatz) => {
        const kw = kalenderwochen.find(k => k.value === umsatz.kalenderwoche);
        return (
          <span>
            {formatKalenderwoche(umsatz.kalenderwoche)}
            {kw ? ` (${kw.startDate})` : ''}
          </span>
        );
      }
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
      <div className="mt-4 p-3 border rounded-lg bg-white shadow-sm">
        <MitarbeiterSelector
          mitarbeiter={mitarbeiter}
          selectedMitarbeiterId={selectedMitarbeiterId}
          onSelectionChange={setSelectedMitarbeiterId}
        />

        {selectedMitarbeiterId && (
          <div className="mt-4">
            <h3 className="text-base font-semibold mb-3">
              Umsätze für {selectedMitarbeiterName} erfassen
            </h3>
            
            <QuickEntryForm 
              newEntry={newEntry}
              onEntryChange={handleNewEntryChange}
              onKalenderwocheChange={handleNewEntryKalenderwocheChange}
              onSaveEntry={handleSaveNewEntry}
              kalenderwochen={kalenderwochen}
            />
            
            <MitarbeiterEntryList 
              umsaetze={filteredUmsaetze} 
              onEditEntry={handleEditUmsatz} 
            />
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

      <UmsaetzeDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveUmsatz}
        editingUmsatz={editingUmsatz}
        currentUmsatz={currentUmsatz}
        setCurrentUmsatz={setCurrentUmsatz}
        mitarbeiter={mitarbeiter}
        kalenderwochen={kalenderwochen}
      />
    </div>
  );
};

export default UmsaetzePage;
