"use client";

import React, { useEffect, useState } from "react";
import {
  CopyCheck,
  CopyIcon,
  Edit,
  MoreHorizontal,
  Pause,
  Play,
  Trash,
} from "lucide-react";
import { toast } from "sonner";

import {
  deleteApiKey,
  toggleApiKeyStatus,
  updateApiKeyName,
} from "@/lib/api-key";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import UpdateApiKeyDialog from "./update-key-dialog";

interface ApiKey {
  id: string;
  name: string;
  token: string;
  createdAt: string;
}

interface ApiKeyTableProps {
  initialApiKeys: ApiKey[];
  initialIsLoading: boolean;
}

const ApiKeyTable: React.FC<ApiKeyTableProps> = ({
  initialApiKeys,
  initialIsLoading = false,
}) => {
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [isLoading, setIsLoading] = useState<boolean>(initialIsLoading);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);

  useEffect(() => {
    setApiKeys(initialApiKeys);
    setIsLoading(initialIsLoading);
  }, [initialApiKeys, initialIsLoading]);

  const handleDelete = async (id: string) => {
    try {
      await deleteApiKey(id);
      setApiKeys((prevKeys) => prevKeys.filter((key) => key.id !== id));
      toast.success("API Key has been deleted.");
    } catch (error) {
      toast.error("Error deleting API Key: " + error);
    }
  };

  const handleUpdate = async (id: string, newName: string) => {
    try {
      await updateApiKeyName(id, newName);
      setApiKeys((prevKeys) =>
        prevKeys.map((key) =>
          key.id === id ? { ...key, name: newName } : key,
        ),
      );
      toast.success("API Key has been updated.");
    } catch (error) {
      toast.error("Error updating API Key: " + error);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const updatedStatus = await toggleApiKeyStatus(id);
      setApiKeys((prevKeys) =>
        prevKeys.map((key) =>
          key.id === id ? { ...key, status: updatedStatus } : key,
        ),
      );
      toast.success(`API Key status is now ${updatedStatus}.`);
    } catch (error) {
      toast.error("Error toggling API Key status: " + error);
    }
  };

  const openUpdateDialog = (apiKey: ApiKey) => {
    setSelectedApiKey(apiKey);
    setUpdateDialogOpen(true);
  };

  const closeUpdateDialog = () => {
    setSelectedApiKey(null);
    setUpdateDialogOpen(false);
  };

  const columns = [
    { id: "name", header: "Name", accessorKey: "name" },
    {
      id: "token",
      header: "API Key",
      accessorKey: "token",
      cell: ({ getValue }) => {
        const tokenValue = getValue();
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
            <span className="inline-flex h-6 items-center rounded-md bg-zinc-200 p-1 dark:bg-zinc-800 dark:text-zinc-400">
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
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.getValue("status");
        const getStatusClass = (status: string) => {
          switch (status) {
            case "active":
              return "bg-green-700 text-green-100";
            case "inactive":
              return "bg-red-900 text-red-200";
            default:
              return "bg-gray-700 text-gray-100";
          }
        };
        return (
          <Badge
            className={`pointer-events-none capitalize ${getStatusClass(status)}`}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      id: "createdAt",
      header: "Created",
      accessorKey: "createdAt",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const apiKey = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => openUpdateDialog(apiKey)}>
                <Edit className="mr-2 h-4 w-4" />
                Update
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleStatus(apiKey.id)}>
                {apiKey.status === "active" ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDelete(apiKey.id)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={apiKeys} isLoading={isLoading} />
      <UpdateApiKeyDialog
        initialIsOpen={updateDialogOpen}
        onClose={closeUpdateDialog}
        selectedApiKeyId={selectedApiKey?.id}
        initialName={selectedApiKey?.name || ""}
        onUpdate={handleUpdate}
      />
    </>
  );
};

export default ApiKeyTable;
