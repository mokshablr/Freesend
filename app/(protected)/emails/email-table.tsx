import React, { useEffect, useState } from "react";
// import { Emails } from "@prisma/client";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { toast } from "sonner";

import { deleteServer, updateMailServer } from "@/lib/smtp-config";
import { DataTable } from "@/components/ui/data-table";
import { Icons } from "@/components/shared/icons";

type Emails = {
  id: string;
  tenant_id: string;
  apiKeyId: string;
  from: string;
  to: string;
  subject: string;
  html_body?: string;
  text_body?: string;
  createdAt: string | Date;
};

interface EmailTableProps {
  initialEmailList: Emails[];
  initialIsLoading: boolean;
  apiKeyMap?: Record<string, string>;
}

const EmailTable: React.FC<EmailTableProps> = ({
  initialEmailList,
  initialIsLoading = false,
  apiKeyMap = {},
}) => {
  const emptyEmail = {
    id: "",
    tenant_id: "",
    apiKeyId: "",
    from: "",
    to: "",
    subject: "",
    html_body: "",
    text_body: "",
    createdAt: new Date(),
  };

  const [emails, setEmails] = useState<Emails[]>(initialEmailList);
  const [isLoading, setIsLoading] = useState<boolean>(initialIsLoading);

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5); // Default page size

  useEffect(() => {
    setEmails(initialEmailList);
    setIsLoading(initialIsLoading);
  }, [initialEmailList, initialIsLoading]);

  const handleDelete = async (id: string) => {
    try {
      await deleteServer(id);
      setEmails((prevKeys) => prevKeys.filter((key) => key.id !== id));
      toast.success("API Key has been deleted.");
    } catch (error) {
      toast.error("Error deleting API Key: " + error);
    }
  };

  const handleUpdate = async (
    id: string,
    updateData: {
      name: string;
      host: string;
      port: number;
      security: string;
    },
  ) => {
    try {
      await updateMailServer(id, updateData);
      setEmails((prevKeys) =>
        prevKeys.map((key) =>
          key.id === id ? { ...key, ...updateData } : key,
        ),
      );
      toast.success("Mail server configuration has been updated.");
    } catch (error) {
      toast.error("Error updating mail server: " + error);
    }
  };

  const columns = [
    { id: "from", header: "From", accessorKey: "from" },
    { id: "to", header: "To", accessorKey: "to" },
    { id: "subject", header: "Subject", accessorKey: "subject" },
    {
      id: "apiKey",
      header: "API Key",
      accessorKey: "apiKeyId",
      cell: ({ getValue }) => {
        const apiKeyId = getValue();
        if (!apiKeyId) return <span className="text-zinc-400">-</span>;
        if (apiKeyMap[apiKeyId]) {
          return (
            <span className="font-mono text-xs text-zinc-400">
              {apiKeyMap[apiKeyId]}
            </span>
          );
        }
        // Not found in map, treat as deleted
        return (
          <span className="italic text-xs text-zinc-500">Deleted</span>
        );
      },
    },
    { id: "sent", header: "Sent", accessorKey: "createdAt" },
  ];

  // Calculate the current data slice based on pagination
  const paginatedEmails = emails.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize,
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={paginatedEmails} // Use sliced data for the table
        isLoading={isLoading}
      />
      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between text-sm text-zinc-400">
        <div>
          <label>
            Rows per page:
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(0); // Reset to first page on page size change
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
            onClick={() => setPageIndex((old) => Math.max(old - 1, 0))}
            disabled={pageIndex === 0}
            className="rounded border p-2"
          >
            <Icons.chevronLeft className="size-3 text-white" />
          </button>
          <span className="mx-2">
            Page {pageIndex + 1} of {Math.ceil(emails.length / pageSize)}
          </span>
          <button
            onClick={() =>
              setPageIndex((old) =>
                Math.min(old + 1, Math.ceil(emails.length / pageSize) - 1),
              )
            }
            disabled={pageIndex >= Math.ceil(emails.length / pageSize) - 1}
            className="rounded border p-2"
          >
            <Icons.chevronRight className="size-3 text-white" />
          </button>
        </div>
      </div>
    </>
  );
};

export default EmailTable;
