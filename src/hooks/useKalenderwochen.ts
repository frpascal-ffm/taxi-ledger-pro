
import { useMemo } from "react";
import { generateKalenderwochen, getCurrentKalenderwoche, createKalenderwocheId, formatKalenderwoche } from "@/utils/helpers";
import { format, parse, startOfWeek } from "date-fns";

export const useKalenderwochen = () => {
  // Aktuelle Kalenderwoche ermitteln
  const { week: currentWeek, year: currentYear } = getCurrentKalenderwoche();
  const currentKw = createKalenderwocheId(currentYear, currentWeek);
  
  // Kalenderwochen für das aktuelle Jahr und das Vorjahr generieren
  const years = [currentYear, currentYear - 1];
  
  const kalenderwochen = useMemo(() => {
    const result: { value: string; label: string; startDate: string }[] = [];
    
    years.forEach(year => {
      const kws = generateKalenderwochen(year);
      kws.forEach(kw => {
        // Parse the week and get the Monday date
        const [yearPart, weekPart] = kw.split('-').map(Number);
        
        // Parse the calendar week to get a date object (using January 1 as a base)
        const baseDate = new Date(yearPart, 0, 1 + (weekPart - 1) * 7);
        
        // Get the first day (Monday) of that week
        const mondayDate = startOfWeek(baseDate, { weekStartsOn: 1 });
        
        // Format the Monday date
        const formattedMonday = format(mondayDate, "dd.MM.yyyy");
        
        result.push({
          value: kw,
          label: formatKalenderwoche(kw),
          startDate: formattedMonday
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
