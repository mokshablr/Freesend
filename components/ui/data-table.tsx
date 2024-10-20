"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[] | undefined;
  isLoading?: boolean;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <>
          {[...Array(5)].map((_, index) => (
            <TableRow key={`loading-row-${index}`}>
              {columns.map((column, cellIndex) => (
                <TableCell
                  key={`loading-cell-${cellIndex}`}
                  className="h-10 border-b"
                >
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </>
      );
    }

    if (table.getRowModel().rows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      );
    }

    return table.getRowModel().rows.map((row) => (
      <TableRow key={row.id}>
        {row.getVisibleCells().map((cell) => (
          <TableCell className="h-10 border-b" key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <div className="overflow-hidden">
      <Table className="border-separate border-spacing-0 overflow-hidden border-none">
        <TableHeader className="rounded-md bg-zinc-900">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  className="h-8 border-b border-t border-zinc-600 font-semibold text-zinc-400 first:rounded-l-md first:border-l last:rounded-r-md last:border-r"
                  key={header.id}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>{renderTableBody()}</TableBody>
      </Table>
    </div>
  );
}
