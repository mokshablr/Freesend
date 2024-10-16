import React, { useState } from "react";
import { CopyCheck, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table"; // Your DataTable component

interface ApiKey {
  name: string;
  token: string;
  createdAt: string; // Keeping createdAt as a string from your API
}

interface ApiKeyTableProps {
  apiKeys: ApiKey[]; // Expecting an array of ApiKey objects
  isLoading: boolean;
}

const ApiKeyTable: React.FC<ApiKeyTableProps> = ({
  apiKeys,
  isLoading = false,
}) => {
  const columns = [
    { id: "name", header: "Name", accessorKey: "name" },
    {
      id: "token",
      header: "API Key",
      accessorKey: "token",
      cell: ({ getValue }) => {
        const tokenValue = getValue(); // Get the entire value
        const [copied, setCopied] = useState(false);

        const handleCopy = () => {
          navigator.clipboard.writeText(tokenValue);
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 2000); // Change back after 2 seconds
        };

        return (
          <div className="flex items-center">
            <span className="inline-flex h-6 items-center rounded-md bg-zinc-800 p-1 text-zinc-400">
              {tokenValue.slice(0, 3)}...{tokenValue.slice(-5)}
            </span>
            <Button
              className="ml-2 h-4 w-4"
              variant={"outline"}
              size={"icon"}
              onClick={handleCopy}
            >
              {copied ? (
                <CopyCheck className="h-4 w-4" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        );
      },
    },
    {
      id: "mailServer",
      header: "Server",
      accessorKey: "smtpConfig",
      cell: ({ row }) => {
        const serverName = row.getValue("mailServer").name;
        return <span>{serverName}</span>;
      },
    },
    {
      id: "createdAt",
      header: "Created",
      accessorKey: "createdAt",
    },
  ];

  return <DataTable columns={columns} data={apiKeys} isLoading={isLoading} />;
};

export default ApiKeyTable;
