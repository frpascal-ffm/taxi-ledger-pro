
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AmountInput } from "@/components/ui/amount-input";
import { Save } from "lucide-react";
import { Umsatz } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface QuickEntryFormProps {
  newEntry: Umsatz;
  onEntryChange: (name: string, value: number | undefined) => void;
  onKalenderwocheChange: (kalenderwoche: string) => void;
  onSaveEntry: () => void;
  kalenderwochen: { value: string; label: string }[];
}

export const QuickEntryForm = ({
  newEntry,
  onEntryChange,
  onKalenderwocheChange,
  onSaveEntry,
  kalenderwochen
}: QuickEntryFormProps) => {
  return (
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
                onValueChange={onKalenderwocheChange}
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
                onChange={(value) => onEntryChange("gesamtumsatz", value)}
              />
            </TableCell>
            <TableCell>
              <AmountInput
                value={newEntry.nettoFahrpreis}
                onChange={(value) => onEntryChange("nettoFahrpreis", value)}
              />
            </TableCell>
            <TableCell>
              <AmountInput
                value={newEntry.aktionen}
                onChange={(value) => onEntryChange("aktionen", value)}
              />
            </TableCell>
            <TableCell>
              <AmountInput
                value={newEntry.rueckerstattungen}
                onChange={(value) => onEntryChange("rueckerstattungen", value)}
              />
            </TableCell>
            <TableCell>
              <AmountInput
                value={newEntry.trinkgeld}
                onChange={(value) => onEntryChange("trinkgeld", value)}
              />
            </TableCell>
            <TableCell>
              <AmountInput
                value={newEntry.bargeld}
                onChange={(value) => onEntryChange("bargeld", value)}
              />
            </TableCell>
            <TableCell>
              <Input
                type="number"
                className="w-20"
                value={newEntry.fahrten}
                onChange={(e) => onEntryChange("fahrten", e.target.value ? parseInt(e.target.value) : 0)}
              />
            </TableCell>
            <TableCell>
              <AmountInput
                value={newEntry.waschen}
                onChange={(value) => onEntryChange("waschen", value)}
              />
            </TableCell>
            <TableCell>
              <Button onClick={onSaveEntry} className="w-full">
                <Save className="h-4 w-4 mr-1" /> Speichern
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
