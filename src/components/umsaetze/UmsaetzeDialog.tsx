
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AmountInput } from "@/components/ui/amount-input";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Umsatz, Mitarbeiter } from "@/types";
import { formatKalenderwoche } from "@/utils/helpers";
import { useToast } from "@/components/ui/use-toast";

interface UmsaetzeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (umsatz: Umsatz) => void;
  editingUmsatz: Umsatz | null;
  currentUmsatz: Umsatz;
  setCurrentUmsatz: React.Dispatch<React.SetStateAction<Umsatz>>;
  mitarbeiter: Mitarbeiter[];
  kalenderwochen: { value: string; label: string }[];
}

export const UmsaetzeDialog = ({
  isOpen,
  onClose,
  onSave,
  editingUmsatz,
  currentUmsatz,
  setCurrentUmsatz,
  mitarbeiter,
  kalenderwochen,
}: UmsaetzeDialogProps) => {
  const { toast } = useToast();

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

  const handleSaveUmsatz = () => {
    if (!currentUmsatz.mitarbeiterId || !currentUmsatz.kalenderwoche) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie einen Mitarbeiter und eine Kalenderwoche aus.",
        variant: "destructive"
      });
      return;
    }

    onSave(currentUmsatz);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleSaveUmsatz}>Speichern</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
