
import { useAppStore } from "@/store/AppStoreContext";
import { formatCurrency } from "@/utils/helpers";
import { PageHeader } from "@/components/layout/PageHeader";
import { CardStatistic } from "@/components/ui/card-statistic";
import { Car, ChartBar, DollarSign, Users } from "lucide-react";

const Dashboard = () => {
  const { state } = useAppStore();
  const { fahrzeuge, mitarbeiter, umsaetze } = state;
  
  // Berechne Statistiken
  const aktiveFahrzeuge = fahrzeuge.filter(f => f.aktiv).length;
  const aktiveMitarbeiter = mitarbeiter.filter(m => m.aktiv).length;
  
  // Berechne monatlichen Gesamtumsatz
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const umsaetzeThisMonth = umsaetze.filter(u => {
    const umsatzDate = new Date(u.erfasstAm);
    return umsatzDate.getMonth() === currentMonth && umsatzDate.getFullYear() === currentYear;
  });
  
  const gesamtumsatzMonat = umsaetzeThisMonth.reduce((sum, umsatz) => sum + umsatz.gesamtumsatz, 0);
  
  // Berechne monatliche Gesamtkosten
  const monatlicheFahrzeugkosten = fahrzeuge.reduce((sum, fahrzeug) => {
    return sum + fahrzeug.kosten.reduce((kSum, kosten) => kSum + kosten.monatlichUmgerechnet, 0);
  }, 0);
  
  const monatlicheMitarbeiterkosten = mitarbeiter.reduce((sum, mitarbeiter) => {
    return sum + (mitarbeiter.nettoGehalt || 0) + (mitarbeiter.krankenversicherung || 0);
  }, 0);
  
  const gesamtkostenMonat = monatlicheFahrzeugkosten + monatlicheMitarbeiterkosten;
  
  // Berechne durchschnittliche Fahrten pro Woche
  const durchschnittFahrtenProWoche = umsaetze.length > 0
    ? Math.round(umsaetze.reduce((sum, umsatz) => sum + umsatz.fahrten, 0) / umsaetze.length)
    : 0;

  return (
    <div>
      <PageHeader title="Dashboard" description="Übersicht über wichtige Kennzahlen" />
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <CardStatistic
          title="Umsatz (aktueller Monat)"
          value={formatCurrency(gesamtumsatzMonat)}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <CardStatistic
          title="Kosten (aktueller Monat)"
          value={formatCurrency(gesamtkostenMonat)}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <CardStatistic
          title="Fahrzeuge"
          value={`${aktiveFahrzeuge} / ${fahrzeuge.length}`}
          description="Aktiv / Gesamt"
          icon={<Car className="h-4 w-4" />}
        />
        <CardStatistic
          title="Mitarbeiter"
          value={`${aktiveMitarbeiter} / ${mitarbeiter.length}`}
          description="Aktiv / Gesamt"
          icon={<Users className="h-4 w-4" />}
        />
        <CardStatistic
          title="Ø Fahrten pro Woche"
          value={durchschnittFahrtenProWoche.toString()}
          icon={<ChartBar className="h-4 w-4" />}
          className="md:col-span-2 lg:col-span-4"
        />
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-medium mb-4">Aktuelle Mitarbeiter</h2>
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="py-2 px-4 text-left font-medium">Name</th>
                <th className="py-2 px-4 text-right font-medium">Vergütung (%)</th>
                <th className="py-2 px-4 text-right font-medium">Fahrten (Soll)</th>
                <th className="py-2 px-4 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {mitarbeiter.length > 0 ? (
                mitarbeiter.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="py-2 px-4">{m.vorname} {m.nachname}</td>
                    <td className="py-2 px-4 text-right">{m.prozentVerguetung}%</td>
                    <td className="py-2 px-4 text-right">{m.sollFahrtenAnzahl || '-'}</td>
                    <td className="py-2 px-4 text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${m.aktiv ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {m.aktiv ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-muted-foreground">
                    Keine Mitarbeiter vorhanden
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
