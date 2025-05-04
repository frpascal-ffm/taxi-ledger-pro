
import { useMemo } from "react";
import { generateKalenderwochen, getCurrentKalenderwoche, createKalenderwocheId, formatKalenderwoche } from "@/utils/helpers";

export const useKalenderwochen = () => {
  // Aktuelle Kalenderwoche ermitteln
  const { week: currentWeek, year: currentYear } = getCurrentKalenderwoche();
  const currentKw = createKalenderwocheId(currentYear, currentWeek);
  
  // Kalenderwochen für das aktuelle Jahr und das Vorjahr generieren
  const years = [currentYear, currentYear - 1];
  
  const kalenderwochen = useMemo(() => {
    const result: { value: string; label: string }[] = [];
    
    years.forEach(year => {
      const kws = generateKalenderwochen(year);
      kws.forEach(kw => {
        result.push({
          value: kw,
          label: formatKalenderwoche(kw)
        });
      });
    });
    
    return result;
  }, [years]);

  return {
    currentWeek,
    currentYear,
    currentKw,
    kalenderwochen
  };
};
