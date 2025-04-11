import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  toolbar?: React.ComponentType<any>;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
  };
  sorting?: { id: string; desc: boolean } | null;
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  onSortingChange?: (sorting: { id: string; desc: boolean } | null) => void;
  onFiltersChange?: (filters: any) => void;
  onRowSelectionChange?: (selection: Record<string, boolean>) => void;
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  toolbar: Toolbar,
  pagination,
  sorting,
  onPaginationChange,
  onSortingChange,
  onFiltersChange,
  onRowSelectionChange,
  className,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [localSorting, setLocalSorting] = React.useState<SortingState>([]);

  React.useEffect(() => {
    if (onRowSelectionChange) {
      onRowSelectionChange(rowSelection);
    }
  }, [rowSelection, onRowSelectionChange]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: sorting ? [{ id: sorting.id, desc: sorting.desc }] : localSorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: pagination ? {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      } : undefined,
    },
    pageCount: pagination?.pageCount,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updatedSorting) => {
      const newSorting = (updatedSorting as SortingState)[0];
      if (onSortingChange) {
        onSortingChange(newSorting ? { id: newSorting.id, desc: newSorting.desc } : null);
      } else {
        setLocalSorting(updatedSorting as SortingState);
      }
    },
    onPaginationChange: onPaginationChange,
    onColumnFiltersChange: (filters) => {
      setColumnFilters(filters);
      if (onFiltersChange) {
        const filterObj = Object.fromEntries(
          filters.map((filter) => [filter.id, filter.value])
        );
        onFiltersChange(filterObj);
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {Toolbar && <Toolbar table={table} />}
      <div className="rounded-md border bg-white dark:bg-gray-800 overflow-hidden transition-all duration-200">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="transition-colors duration-200"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}