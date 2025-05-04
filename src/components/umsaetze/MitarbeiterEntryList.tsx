
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Umsatz } from "@/types";
import { formatCurrency, formatKalenderwoche } from "@/utils/helpers";

interface MitarbeiterEntryListProps {
  umsaetze: Umsatz[];
  onEditEntry: (umsatz: Umsatz) => void;
}

export const MitarbeiterEntryList = ({ umsaetze, onEditEntry }: MitarbeiterEntryListProps) => {
  if (umsaetze.length === 0) {
    return (
      <div className="mt-6 text-center py-8 border rounded-md bg-gray-50">
        <p className="text-muted-foreground">
          Noch keine Umsätze für diesen Mitarbeiter erfasst.
        </p>
      </div>
    );
  }

  return (
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
            {umsaetze.map((umsatz) => (
              <TableRow 
                key={umsatz.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onEditEntry(umsatz)}
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
  );
};
