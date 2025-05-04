
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DataTableProps<T> {
  data: T[];
  columns: {
    accessorKey: keyof T | string;
    header: string;
    cell?: (item: T) => React.ReactNode;
    className?: string;
  }[];
  onRowClick?: (item: T) => void;
  rowClassName?: (item: T) => string;
  uniqueKey: keyof T | ((item: T) => string);
}

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  rowClassName,
  uniqueKey,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Filterfunktion
  const filteredData = searchQuery
    ? data.filter((item) => {
        const searchRegex = new RegExp(searchQuery, "i");
        return columns.some((column) => {
          const key = column.accessorKey.toString();
          const value = item[key as keyof T];
          return value !== undefined && String(value).match(searchRegex);
        });
      })
    : data;
  
  // Sortierfunktion
  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortColumn as keyof T];
        const bValue = b[sortColumn as keyof T];
        
        if (aValue === bValue) return 0;
        
        // Typüberprüfung
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (aValue === null || aValue === undefined) return sortDirection === "asc" ? -1 : 1;
        if (bValue === null || bValue === undefined) return sortDirection === "asc" ? 1 : -1;
        
        return sortDirection === "asc"
          ? aValue > bValue
            ? 1
            : -1
          : aValue > bValue
            ? -1
            : 1;
      })
    : filteredData;
  
  // Sortierungswechsel
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };
  
  const getUniqueKey = (item: T): string => {
    if (typeof uniqueKey === "function") {
      return uniqueKey(item);
    }
    return String(item[uniqueKey]);
  };

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.accessorKey.toString()}
                  className={cn("cursor-pointer", column.className)}
                  onClick={() => handleSort(column.accessorKey.toString())}
                >
                  <div className="flex items-center">
                    {column.header}
                    {sortColumn === column.accessorKey && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? " ↑" : " ↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Keine Daten vorhanden.
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item) => (
                <TableRow
                  key={getUniqueKey(item)}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/50",
                    rowClassName && rowClassName(item)
                  )}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={`${getUniqueKey(item)}-${column.accessorKey.toString()}`}
                      className={column.className}
                    >
                      {column.cell
                        ? column.cell(item)
                        : item[column.accessorKey as keyof T] as React.ReactNode}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {filteredData.length} Einträge
        </div>
      </div>
    </div>
  );
}
