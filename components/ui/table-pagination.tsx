"use client";

import { Icons } from "@/components/shared/icons";

interface PaginationProps {
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function TablePagination({
  pageIndex,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-zinc-400">
      <div>
        <label>
          Rows per page:
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(0); // Reset to first page on page size change
            }}
            className="ml-2 rounded border p-1"
          >
            {[5, 10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <button
          onClick={() => onPageChange(Math.max(pageIndex - 1, 0))}
          disabled={pageIndex === 0}
          className="rounded border p-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icons.chevronLeft className="size-3 text-white" />
        </button>
        <span className="mx-2">
          Page {pageIndex + 1} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(pageIndex + 1, totalPages - 1))}
          disabled={pageIndex >= totalPages - 1}
          className="rounded border p-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icons.chevronRight className="size-3 text-white" />
        </button>
      </div>
    </div>
  );
}
