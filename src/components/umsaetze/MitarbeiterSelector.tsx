
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mitarbeiter } from "@/types";

interface MitarbeiterSelectorProps {
  mitarbeiter: Mitarbeiter[];
  selectedMitarbeiterId: string;
  onSelectionChange: (mitarbeiterId: string) => void;
}

export const MitarbeiterSelector = ({
  mitarbeiter,
  selectedMitarbeiterId,
  onSelectionChange
}: MitarbeiterSelectorProps) => {
  return (
    <div className="mb-2">
      <Label htmlFor="mitarbeiter-select" className="text-sm font-medium">Mitarbeiter auswählen</Label>
      <div className="flex gap-4 mt-1">
        <Select
          value={selectedMitarbeiterId}
          onValueChange={onSelectionChange}
        >
          <SelectTrigger className="w-full max-w-xs h-9 text-sm">
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
  );
};
