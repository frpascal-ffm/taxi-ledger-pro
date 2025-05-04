
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
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-xs py-2 px-2 w-[120px]">Kalenderwoche</TableHead>
            <TableHead className="text-xs py-2 px-2 w-[100px]">Gesamtumsatz</TableHead>
            <TableHead className="text-xs py-2 px-2 w-[100px]">Netto-Fahrpreis</TableHead>
            <TableHead className="text-xs py-2 px-2 w-[90px]">Aktionen</TableHead>
            <TableHead className="text-xs py-2 px-2 w-[100px]">Rückerstattungen</TableHead>
            <TableHead className="text-xs py-2 px-2 w-[90px]">Trinkgeld</TableHead>
            <TableHead className="text-xs py-2 px-2 w-[90px]">Bargeld</TableHead>
            <TableHead className="text-xs py-2 px-2 w-[70px]">Fahrten</TableHead>
            <TableHead className="text-xs py-2 px-2 w-[90px]">Waschen</TableHead>
            <TableHead className="text-xs py-2 px-2 w-[90px]">Aktion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="p-1">
              <Select
                value={newEntry.kalenderwoche}
                onValueChange={onKalenderwocheChange}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="KW auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {kalenderwochen.map((kw) => (
                    <SelectItem key={kw.value} value={kw.value} className="text-xs">
                      {kw.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell className="p-1">
              <AmountInput
                value={newEntry.gesamtumsatz}
                onChange={(value) => onEntryChange("gesamtumsatz", value)}
                className="h-8 text-xs"
              />
            </TableCell>
            <TableCell className="p-1">
              <AmountInput
                value={newEntry.nettoFahrpreis}
                onChange={(value) => onEntryChange("nettoFahrpreis", value)}
                className="h-8 text-xs"
              />
            </TableCell>
            <TableCell className="p-1">
              <AmountInput
                value={newEntry.aktionen}
                onChange={(value) => onEntryChange("aktionen", value)}
                className="h-8 text-xs"
              />
            </TableCell>
            <TableCell className="p-1">
              <AmountInput
                value={newEntry.rueckerstattungen}
                onChange={(value) => onEntryChange("rueckerstattungen", value)}
                className="h-8 text-xs"
              />
            </TableCell>
            <TableCell className="p-1">
              <AmountInput
                value={newEntry.trinkgeld}
                onChange={(value) => onEntryChange("trinkgeld", value)}
                className="h-8 text-xs"
              />
            </TableCell>
            <TableCell className="p-1">
              <AmountInput
                value={newEntry.bargeld}
                onChange={(value) => onEntryChange("bargeld", value)}
                className="h-8 text-xs"
              />
            </TableCell>
            <TableCell className="p-1">
              <Input
                type="number"
                className="h-8 text-xs"
                value={newEntry.fahrten}
                onChange={(e) => onEntryChange("fahrten", e.target.value ? parseInt(e.target.value) : 0)}
              />
            </TableCell>
            <TableCell className="p-1">
              <AmountInput
                value={newEntry.waschen}
                onChange={(value) => onEntryChange("waschen", value)}
                className="h-8 text-xs"
              />
            </TableCell>
            <TableCell className="p-1">
              <Button onClick={onSaveEntry} className="h-8 text-xs w-full px-2">
                <Save className="h-3 w-3 mr-1" /> Speichern
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
