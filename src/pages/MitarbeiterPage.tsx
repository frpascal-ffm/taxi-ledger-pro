
import { useState } from "react";
import { useAppStore } from "@/store/AppStoreContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AmountInput } from "@/components/ui/amount-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import { Mitarbeiter } from "@/types";
import { formatCurrency, formatDate } from "@/utils/helpers";
import { v4 as uuidv4 } from "uuid";

const MitarbeiterPage = () => {
  const { state, addMitarbeiter, updateMitarbeiter, deleteMitarbeiter } = useAppStore();
  const { mitarbeiter, fahrzeuge } = state;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMitarbeiter, setEditingMitarbeiter] = useState<Mitarbeiter | null>(null);
  const [currentMitarbeiter, setCurrentMitarbeiter] = useState<Mitarbeiter>({
    id: "",
    vorname: "",
    nachname: "",
    email: "",
    telefon: "",
    einstellungsdatum: new Date(),
    aktiv: true,
    steuer: 0,
    nettoGehalt: 0,
    prozentVerguetung: 0
  });

  // Handler für Mitarbeiter-Formular
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCurrentMitarbeiter({
      ...currentMitarbeiter,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleNumberInputChange = (name: string, value: number | undefined) => {
    setCurrentMitarbeiter({
      ...currentMitarbeiter,
      [name]: value !== undefined ? value : 0
    });
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "einstellungsdatum") {
      setCurrentMitarbeiter({
        ...currentMitarbeiter,
        [name]: new Date(value)
      });
    }
  };

  // Mitarbeiter-Dialog öffnen für Bearbeitung
  const handleEditMitarbeiter = (mitarbeiter: Mitarbeiter) => {
    setEditingMitarbeiter(mitarbeiter);
    setCurrentMitarbeiter({ ...mitarbeiter });
    setIsDialogOpen(true);
  };

  // Mitarbeiter-Dialog öffnen für Neuanlage
  const handleNewMitarbeiter = () => {
    setEditingMitarbeiter(null);
    setCurrentMitarbeiter({
      id: "",
      vorname: "",
      nachname: "",
      email: "",
      telefon: "",
      einstellungsdatum: new Date(),
      aktiv: true,
      steuer: 0,
      nettoGehalt: 0,
      prozentVerguetung: 0
    });
    setIsDialogOpen(true);
  };

  // Mitarbeiter speichern
  const handleSaveMitarbeiter = () => {
    if (!currentMitarbeiter.vorname || !currentMitarbeiter.nachname) {
      return; // Validierung fehlgeschlagen
    }

    if (editingMitarbeiter) {
      updateMitarbeiter(currentMitarbeiter);
    } else {
      addMitarbeiter({
        ...currentMitarbeiter,
        id: uuidv4()
      });
    }

    setIsDialogOpen(false);
  };

  // Mitarbeiter löschen
  const handleDeleteMitarbeiter = () => {
    if (editingMitarbeiter) {
      deleteMitarbeiter(editingMitarbeiter.id);
      setIsDialogOpen(false);
    }
  };

  // DataTable Spalten
  const columns = [
    {
      accessorKey: "vorname",
      header: "Vorname"
    },
    {
      accessorKey: "nachname",
      header: "Nachname"
    },
    {
      accessorKey: "telefon",
      header: "Telefon"
    },
    {
      accessorKey: "einstellungsdatum",
      header: "Einstellungsdatum",
      cell: (mitarbeiter: Mitarbeiter) => (
        <span>{formatDate(mitarbeiter.einstellungsdatum)}</span>
      )
    },
    {
      accessorKey: "prozentVerguetung",
      header: "Vergütung %",
      cell: (mitarbeiter: Mitarbeiter) => (
        <span>{mitarbeiter.prozentVerguetung}%</span>
      ),
      className: "text-right"
    },
    {
      accessorKey: "nettoGehalt",
      header: "Netto-Gehalt",
      cell: (mitarbeiter: Mitarbeiter) => (
        <span className="money-value">{formatCurrency(mitarbeiter.nettoGehalt)}</span>
      ),
      className: "text-right"
    },
    {
      accessorKey: "aktiv",
      header: "Status",
      cell: (mitarbeiter: Mitarbeiter) => (
        <span className={`inline-block px-2 py-1 rounded-full text-xs ${mitarbeiter.aktiv ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {mitarbeiter.aktiv ? "Aktiv" : "Inaktiv"}
        </span>
      )
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Mitarbeiter" 
        description="Verwaltung aller Mitarbeiter und deren Vergütungen"
      >
        <Button onClick={handleNewMitarbeiter}>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Mitarbeiter
        </Button>
      </PageHeader>

      <div className="mt-6">
        <DataTable
          data={mitarbeiter}
          columns={columns}
          onRowClick={handleEditMitarbeiter}
          uniqueKey="id"
        />
      </div>

      {/* Dialog für das Hinzufügen oder Bearbeiten eines Mitarbeiters */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingMitarbeiter ? "Mitarbeiter bearbeiten" : "Neuen Mitarbeiter hinzufügen"}
            </DialogTitle>
            <DialogDescription>
              {editingMitarbeiter
                ? "Bearbeiten Sie die Details des ausgewählten Mitarbeiters."
                : "Fügen Sie einen neuen Mitarbeiter und dessen Vergütungen hinzu."}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full mt-4">
            <TabsList>
              <TabsTrigger value="details">Persönliche Daten</TabsTrigger>
              <TabsTrigger value="payment">Vergütung</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="vorname">Vorname</Label>
                  <Input
                    id="vorname"
                    name="vorname"
                    value={currentMitarbeiter.vorname}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="nachname">Nachname</Label>
                  <Input
                    id="nachname"
                    name="nachname"
                    value={currentMitarbeiter.nachname}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={currentMitarbeiter.email || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="telefon">Telefon</Label>
                  <Input
                    id="telefon"
                    name="telefon"
                    value={currentMitarbeiter.telefon || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="einstellungsdatum">Einstellungsdatum</Label>
                  <Input
                    id="einstellungsdatum"
                    name="einstellungsdatum"
                    type="date"
                    value={currentMitarbeiter.einstellungsdatum.toISOString().substring(0, 10)}
                    onChange={handleDateInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="fahrzeugId">Zugewiesenes Fahrzeug</Label>
                  <Select
                    value={currentMitarbeiter.fahrzeugId || ""}
                    onValueChange={(value) =>
                      setCurrentMitarbeiter({
                        ...currentMitarbeiter,
                        fahrzeugId: value || undefined
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Fahrzeug auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Kein Fahrzeug</SelectItem>
                      {fahrzeuge
                        .filter((f) => f.aktiv)
                        .map((fahrzeug) => (
                          <SelectItem key={fahrzeug.id} value={fahrzeug.id}>
                            {fahrzeug.kennzeichen} - {fahrzeug.marke} {fahrzeug.modell}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="aktiv"
                  name="aktiv"
                  checked={currentMitarbeiter.aktiv}
                  onCheckedChange={(checked) =>
                    setCurrentMitarbeiter({ ...currentMitarbeiter, aktiv: checked })
                  }
                />
                <Label htmlFor="aktiv">Aktiv</Label>
              </div>
            </TabsContent>

            <TabsContent value="payment" className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="nettoGehalt">Netto-Gehalt (€)</Label>
                  <AmountInput
                    id="nettoGehalt"
                    value={currentMitarbeiter.nettoGehalt}
                    onChange={(value) => handleNumberInputChange("nettoGehalt", value)}
                    allowNegative={false}
                  />
                </div>
                <div>
                  <Label htmlFor="steuer">Steuer (€)</Label>
                  <AmountInput
                    id="steuer"
                    value={currentMitarbeiter.steuer}
                    onChange={(value) => handleNumberInputChange("steuer", value)}
                    allowNegative={false}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="prozentVerguetung">Prozentuale Vergütung (%)</Label>
                  <AmountInput
                    id="prozentVerguetung"
                    value={currentMitarbeiter.prozentVerguetung}
                    onChange={(value) => handleNumberInputChange("prozentVerguetung", value)}
                    allowNegative={false}
                  />
                </div>
                <div>
                  <Label htmlFor="stundenlohn">Stundenlohn (€, optional)</Label>
                  <AmountInput
                    id="stundenlohn"
                    value={currentMitarbeiter.stundenlohn}
                    onChange={(value) => handleNumberInputChange("stundenlohn", value)}
                    allowNegative={false}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="sollFahrtenAnzahl">Soll-Fahrten pro Woche</Label>
                  <Input
                    id="sollFahrtenAnzahl"
                    name="sollFahrtenAnzahl"
                    type="number"
                    value={currentMitarbeiter.sollFahrtenAnzahl || ""}
                    onChange={(e) => handleNumberInputChange("sollFahrtenAnzahl", e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
                <div>
                  <Label htmlFor="krankenversicherung">Krankenversicherung (€, optional)</Label>
                  <AmountInput
                    id="krankenversicherung"
                    value={currentMitarbeiter.krankenversicherung}
                    onChange={(value) => handleNumberInputChange("krankenversicherung", value)}
                    allowNegative={false}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex justify-between">
            {editingMitarbeiter && (
              <Button variant="destructive" onClick={handleDeleteMitarbeiter}>
                Mitarbeiter löschen
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSaveMitarbeiter}>Speichern</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MitarbeiterPage;
