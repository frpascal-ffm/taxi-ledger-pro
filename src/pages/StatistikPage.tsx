
import { useState, useEffect } from "react";
import { useAppStore } from "@/store/AppStoreContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency, formatKalenderwoche } from "@/utils/helpers";

const StatistikPage = () => {
  const { state } = useAppStore();
  const { mitarbeiter, umsaetze } = state;
  
  const [selectedMitarbeiterId, setSelectedMitarbeiterId] = useState<string | "all">("all");
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    if (umsaetze.length === 0) return;
    
    // Filtern der Daten basierend auf der Mitarbeiterauswahl
    const filteredUmsaetze = selectedMitarbeiterId === "all"
      ? umsaetze
      : umsaetze.filter(u => u.mitarbeiterId === selectedMitarbeiterId);
    
    // Gruppieren nach Kalenderwoche
    const groupedByWeek = filteredUmsaetze.reduce((acc, umsatz) => {
      if (!acc[umsatz.kalenderwoche]) {
        acc[umsatz.kalenderwoche] = {
          kalenderwoche: umsatz.kalenderwoche,
          kwFormatted: formatKalenderwoche(umsatz.kalenderwoche),
          gesamtumsatz: 0,
          nettoFahrpreis: 0,
          aktionen: 0,
          trinkgeld: 0,
          fahrten: 0
        };
      }
      
      acc[umsatz.kalenderwoche].gesamtumsatz += umsatz.gesamtumsatz;
      acc[umsatz.kalenderwoche].nettoFahrpreis += umsatz.nettoFahrpreis;
      acc[umsatz.kalenderwoche].aktionen += umsatz.aktionen;
      acc[umsatz.kalenderwoche].trinkgeld += umsatz.trinkgeld;
      acc[umsatz.kalenderwoche].fahrten += umsatz.fahrten;
      
      return acc;
    }, {} as Record<string, any>);
    
    // Umwandeln in ein Array und Sortieren nach Kalenderwoche
    const dataArray = Object.values(groupedByWeek).sort((a, b) => {
      const [yearA, weekA] = a.kalenderwoche.split("-").map(Number);
      const [yearB, weekB] = b.kalenderwoche.split("-").map(Number);
      
      if (yearA !== yearB) {
        return yearA - yearB; // Jahr aufsteigend
      }
      return weekA - weekB; // Woche aufsteigend
    });
    
    setChartData(dataArray);
    
  }, [umsaetze, selectedMitarbeiterId]);
  
  // Berechnung der Gesamtstatistik
  const gesamtUmsatz = umsaetze.reduce((sum, u) => sum + u.gesamtumsatz, 0);
  const gesamtFahrten = umsaetze.reduce((sum, u) => sum + u.fahrten, 0);
  const gesamtTrinkgeld = umsaetze.reduce((sum, u) => sum + u.trinkgeld, 0);
  
  // Durchschnittswerte
  const avgUmsatzProWoche = chartData.length > 0 
    ? gesamtUmsatz / chartData.length 
    : 0;
  
  const avgFahrtenProWoche = chartData.length > 0 
    ? gesamtFahrten / chartData.length 
    : 0;
  
  const avgTrinkgeldProFahrt = gesamtFahrten > 0 
    ? gesamtTrinkgeld / gesamtFahrten 
    : 0;

  return (
    <div>
      <PageHeader 
        title="Statistik" 
        description="Visualisierung von Umsätzen und Leistungen"
      />
      
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Durchschn. Umsatz pro Woche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold money-value">
                {formatCurrency(avgUmsatzProWoche)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Durchschn. Fahrten pro Woche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(avgFahrtenProWoche)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Durchschn. Trinkgeld pro Fahrt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold money-value">
                {formatCurrency(avgTrinkgeldProFahrt)}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="overflow-hidden">
          <CardHeader className="pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Umsatzentwicklung</CardTitle>
              <div className="w-full sm:w-[200px] mt-2 sm:mt-0">
                <Select
                  value={selectedMitarbeiterId}
                  onValueChange={(value) => setSelectedMitarbeiterId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mitarbeiter wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Mitarbeiter</SelectItem>
                    {mitarbeiter.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.vorname} {m.nachname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full mt-4">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="kwFormatted"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                    />
                    <Legend />
                    <Bar
                      name="Gesamtumsatz"
                      dataKey="gesamtumsatz"
                      fill="#3b82f6"
                    />
                    <Bar
                      name="Netto-Fahrpreis"
                      dataKey="nettoFahrpreis"
                      fill="#10b981"
                    />
                    <Bar
                      name="Aktionen"
                      dataKey="aktionen"
                      fill="#8b5cf6"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Keine Daten verfügbar
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Fahrtenstatistik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full mt-4">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="kwFormatted"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "fahrten") return value;
                        return formatCurrency(value as number);
                      }}
                    />
                    <Legend />
                    <Bar
                      name="Fahrten"
                      dataKey="fahrten"
                      fill="#f59e0b"
                      yAxisId="left"
                    />
                    <Bar
                      name="Trinkgeld"
                      dataKey="trinkgeld"
                      fill="#ec4899"
                      yAxisId="right"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Keine Daten verfügbar
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatistikPage;
