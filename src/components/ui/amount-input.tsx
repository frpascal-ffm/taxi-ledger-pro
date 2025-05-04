
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AmountInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "type"
  > {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  className?: string;
  allowNegative?: boolean;
}

export function AmountInput({
  value,
  onChange,
  className,
  allowNegative = true,
  ...props
}: AmountInputProps) {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    return value !== undefined ? value.toString().replace('.', ',') : '';
  });

  useEffect(() => {
    if (value !== undefined) {
      setDisplayValue(value.toString().replace('.', ','));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Erlaubt nur Zahlen, Komma, Punkt und optional negative Zeichen
    const regex = allowNegative 
      ? /^-?[0-9]*[.,]?[0-9]*$/
      : /^[0-9]*[.,]?[0-9]*$/;
    
    if (input === '' || regex.test(input)) {
      setDisplayValue(input);
      
      // Konvertiere den Wert in eine Zahl für den onChange Handler
      if (input === '' || input === '-') {
        onChange(undefined);
      } else {
        const numericValue = parseFloat(input.replace(',', '.'));
        if (!isNaN(numericValue)) {
          onChange(numericValue);
        }
      }
    }
  };

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      className={cn("text-right", className)}
    />
  );
}
