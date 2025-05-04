
import { useState } from "react";
import { useAppStore } from "@/store/AppStoreContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AmountInput } from "@/components/ui/amount-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Car, Plus, Trash2 } from "lucide-react";
import { Fahrzeug, FahrzeugKosten, Zahlungsturnus } from "@/types";
import { formatCurrency, calculateMonthlyAmount } from "@/utils/helpers";
import { v4 as uuidv4 } from "uuid";

const FahrzeugePage = () => {
  const { state, addFahrzeug, updateFahrzeug, deleteFahrzeug } = useAppStore();
  const { fahrzeuge } = state;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFahrzeug, setEditingFahrzeug] = useState<Fahrzeug | null>(null);
  const [currentFahrzeug, setCurrentFahrzeug] = useState<Fahrzeug>({
    id: "",
    kennzeichen: "",
    marke: "",
    modell: "",
    baujahr: new Date().getFullYear(),
    aktiv: true,
    kosten: []
  });

  // Neue Kostenposition für ein Fahrzeug
  const [newKosten, setNewKosten] = useState<FahrzeugKosten>({
    id: "",
    bezeichnung: "",
    betrag: 0,
    zahlungsturnus: "monatlich",
    monatlichUmgerechnet: 0
  });

  // Handler für Fahrzeug-Formular
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCurrentFahrzeug({
      ...currentFahrzeug,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleNumberInputChange = (name: string, value: number | undefined) => {
    setCurrentFahrzeug({
      ...currentFahrzeug,
      [name]: value !== undefined ? value : 0
    });
  };

  // Handler für das Kostenformular
  const handleKostenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewKosten({
      ...newKosten,
      [name]: value
    });
  };

  const handleKostenBetragChange = (betrag: number | undefined) => {
    const amount = betrag !== undefined ? betrag : 0;
    const monatlichUmgerechnet = calculateMonthlyAmount(
      amount,
      newKosten.zahlungsturnus
    );
    
    setNewKosten({
      ...newKosten,
      betrag: amount,
      monatlichUmgerechnet
    });
  };

  const handleKostenTurnusChange = (zahlungsturnus: Zahlungsturnus) => {
    const monatlichUmgerechnet = calculateMonthlyAmount(
      newKosten.betrag,
      zahlungsturnus
    );
    
    setNewKosten({
      ...newKosten,
      zahlungsturnus,
      monatlichUmgerechnet
    });
  };

  // Kosten zum Fahrzeug hinzufügen
  const handleAddKosten = () => {
    if (!newKosten.bezeichnung || newKosten.betrag <= 0) return;

    const kostenToAdd: FahrzeugKosten = {
      ...newKosten,
      id: uuidv4()
    };

    setCurrentFahrzeug({
      ...currentFahrzeug,
      kosten: [...currentFahrzeug.kosten, kostenToAdd]
    });

    // Reset Formular
    setNewKosten({
      id: "",
      bezeichnung: "",
      betrag: 0,
      zahlungsturnus: "monatlich",
      monatlichUmgerechnet: 0
    });
  };

  // Kostenposition entfernen
  const handleRemoveKosten = (kostenId: string) => {
    setCurrentFahrzeug({
      ...currentFahrzeug,
      kosten: currentFahrzeug.kosten.filter(k => k.id !== kostenId)
    });
  };

  // Fahrzeug-Dialog öffnen für Bearbeitung
  const handleEditFahrzeug = (fahrzeug: Fahrzeug) => {
    setEditingFahrzeug(fahrzeug);
    setCurrentFahrzeug({ ...fahrzeug });
    setIsDialogOpen(true);
  };

  // Fahrzeug-Dialog öffnen für Neuanlage
  const handleNewFahrzeug = () => {
    setEditingFahrzeug(null);
    setCurrentFahrzeug({
      id: "",
      kennzeichen: "",
      marke: "",
      modell: "",
      baujahr: new Date().getFullYear(),
      aktiv: true,
      kosten: []
    });
    setIsDialogOpen(true);
  };

  // Fahrzeug speichern
  const handleSaveFahrzeug = () => {
    if (!currentFahrzeug.kennzeichen || !currentFahrzeug.marke || !currentFahrzeug.modell) {
      return; // Validierung fehlgeschlagen
    }

    if (editingFahrzeug) {
      updateFahrzeug(currentFahrzeug);
    } else {
      addFahrzeug({
        ...currentFahrzeug,
        id: uuidv4()
      });
    }

    setIsDialogOpen(false);
  };

  // Fahrzeug löschen
  const handleDeleteFahrzeug = () => {
    if (editingFahrzeug) {
      deleteFahrzeug(editingFahrzeug.id);
      setIsDialogOpen(false);
    }
  };

  // Berechnung der monatlichen Gesamtkosten pro Fahrzeug
  const calculateMonthlyTotalCost = (fahrzeug: Fahrzeug): number => {
    return fahrzeug.kosten.reduce((sum, kosten) => sum + kosten.monatlichUmgerechnet, 0);
  };

  // DataTable Spalten
  const columns = [
    {
      accessorKey: "kennzeichen",
      header: "Kennzeichen"
    },
    {
      accessorKey: "marke",
      header: "Marke"
    },
    {
      accessorKey: "modell",
      header: "Modell"
    },
    {
      accessorKey: "baujahr",
      header: "Baujahr"
    },
    {
      accessorKey: "monatlicheKosten",
      header: "Mtl. Kosten",
      cell: (fahrzeug: Fahrzeug) => (
        <span className="money-value">{formatCurrency(calculateMonthlyTotalCost(fahrzeug))}</span>
      ),
      className: "text-right"
    },
    {
      accessorKey: "aktiv",
      header: "Status",
      cell: (fahrzeug: Fahrzeug) => (
        <span className={`inline-block px-2 py-1 rounded-full text-xs ${fahrzeug.aktiv ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {fahrzeug.aktiv ? "Aktiv" : "Inaktiv"}
        </span>
      )
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Fahrzeuge" 
        description="Verwaltung aller Fahrzeuge und deren Kosten"
      >
        <Button onClick={handleNewFahrzeug}>
          <Plus className="mr-2 h-4 w-4" />
          Neues Fahrzeug
        </Button>
      </PageHeader>

      <div className="mt-6">
        <DataTable
          data={fahrzeuge}
          columns={columns}
          onRowClick={handleEditFahrzeug}
          uniqueKey="id"
        />
      </div>

      {/* Dialog für das Hinzufügen oder Bearbeiten eines Fahrzeugs */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingFahrzeug ? "Fahrzeug bearbeiten" : "Neues Fahrzeug hinzufügen"}
            </DialogTitle>
            <DialogDescription>
              {editingFahrzeug
                ? "Bearbeiten Sie die Details des ausgewählten Fahrzeugs."
                : "Fügen Sie ein neues Fahrzeug und dessen Kosten hinzu."}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full mt-4">
            <TabsList>
              <TabsTrigger value="details">Fahrzeugdaten</TabsTrigger>
              <TabsTrigger value="costs">Kosten</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="kennzeichen">Kennzeichen</Label>
                  <Input
                    id="kennzeichen"
                    name="kennzeichen"
                    value={currentFahrzeug.kennzeichen}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="marke">Marke</Label>
                  <Input
                    id="marke"
                    name="marke"
                    value={currentFahrzeug.marke}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="modell">Modell</Label>
                  <Input
                    id="modell"
                    name="modell"
                    value={currentFahrzeug.modell}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="baujahr">Baujahr</Label>
                  <Input
                    id="baujahr"
                    name="baujahr"
                    type="number"
                    value={currentFahrzeug.baujahr}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="aktiv"
                  name="aktiv"
                  checked={currentFahrzeug.aktiv}
                  onCheckedChange={(checked) =>
                    setCurrentFahrzeug({ ...currentFahrzeug, aktiv: checked })
                  }
                />
                <Label htmlFor="aktiv">Aktiv</Label>
              </div>
            </TabsContent>

            <TabsContent value="costs" className="space-y-4 py-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Kostenübersicht</h3>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="py-2 px-4 text-left font-medium">Bezeichnung</th>
                        <th className="py-2 px-4 text-right font-medium">Betrag</th>
                        <th className="py-2 px-4 text-left font-medium">Zahlungsturnus</th>
                        <th className="py-2 px-4 text-right font-medium">Monatlich</th>
                        <th className="py-2 px-4 text-center font-medium">Aktion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentFahrzeug.kosten.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-muted-foreground">
                            Keine Kosten definiert
                          </td>
                        </tr>
                      ) : (
                        currentFahrzeug.kosten.map((kosten) => (
                          <tr key={kosten.id} className="border-t">
                            <td className="py-2 px-4">{kosten.bezeichnung}</td>
                            <td className="py-2 px-4 text-right money-value">
                              {formatCurrency(kosten.betrag)}
                            </td>
                            <td className="py-2 px-4">
                              {kosten.zahlungsturnus === "woechentlich" && "Wöchentlich"}
                              {kosten.zahlungsturnus === "monatlich" && "Monatlich"}
                              {kosten.zahlungsturnus === "quartalsweise" && "Quartalsweise"}
                              {kosten.zahlungsturnus === "halbjaehrlich" && "Halbjährlich"}
                              {kosten.zahlungsturnus === "jaehrlich" && "Jährlich"}
                            </td>
                            <td className="py-2 px-4 text-right money-value">
                              {formatCurrency(kosten.monatlichUmgerechnet)}
                            </td>
                            <td className="py-2 px-4 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveKosten(kosten.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                      <tr className="border-t">
                        <td colSpan={3} className="py-2 px-4 text-right font-medium">
                          Gesamtkosten monatlich:
                        </td>
                        <td className="py-2 px-4 text-right font-medium money-value">
                          {formatCurrency(
                            currentFahrzeug.kosten.reduce(
                              (sum, kosten) => sum + kosten.monatlichUmgerechnet,
                              0
                            )
                          )}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-sm font-medium mt-6">Neue Kostenposition</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="bezeichnung">Bezeichnung</Label>
                    <Input
                      id="bezeichnung"
                      name="bezeichnung"
                      value={newKosten.bezeichnung}
                      onChange={handleKostenInputChange}
                      placeholder="z.B. KFZ-Steuer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="betrag">Betrag (€)</Label>
                    <AmountInput
                      id="betrag"
                      value={newKosten.betrag}
                      onChange={handleKostenBetragChange}
                      allowNegative={false}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zahlungsturnus">Zahlungsturnus</Label>
                    <Select 
                      value={newKosten.zahlungsturnus}
                      onValueChange={(value) => handleKostenTurnusChange(value as Zahlungsturnus)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="woechentlich">Wöchentlich</SelectItem>
                        <SelectItem value="monatlich">Monatlich</SelectItem>
                        <SelectItem value="quartalsweise">Quartalsweise</SelectItem>
                        <SelectItem value="halbjaehrlich">Halbjährlich</SelectItem>
                        <SelectItem value="jaehrlich">Jährlich</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end mt-2">
                  <Button onClick={handleAddKosten}>
                    <Plus className="mr-2 h-4 w-4" />
                    Kostenposition hinzufügen
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex justify-between">
            {editingFahrzeug && (
              <Button variant="destructive" onClick={handleDeleteFahrzeug}>
                Fahrzeug löschen
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSaveFahrzeug}>Speichern</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FahrzeugePage;
