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
    { 
      id: "name", 
      header: "Name", 
      accessorKey: "name",
      cell: ({ getValue }) => (
        <div className="flex items-center">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 text-xs font-semibold dark:bg-green-950 dark:text-green-300 dark:border-green-800">
            {getValue()}
          </span>
        </div>
      )
    },
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
            <span className="inline-flex h-6 items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-mono text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {tokenValue.slice(0, 3)}...{tokenValue.slice(-5)}
            </span>
            <Button
              className="ml-2 h-6 w-6"
              variant={"outline"}
              size={"icon"}
              onClick={handleCopy}
            >
              {copied ? (
                <CopyCheck className="h-3 w-3" />
              ) : (
                <CopyIcon className="h-3 w-3" />
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
        const mailServer = row.getValue("mailServer");
        const serverName = mailServer && mailServer.name ? mailServer.name : "Deleted";
        return (
          <span className="text-xs text-muted-foreground">
            {serverName}
          </span>
        );
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
            className={`pointer-events-none capitalize text-xs ${getStatusClass(status)}`}
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
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{getValue()}</span>
      )
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
              <DropdownMenuItem
                className="text-red-600 bg-red-600/10 font-medium rounded-md px-2 py-1.5 focus:text-red-600 focus:bg-red-600/20 hover:text-red-600 hover:bg-red-600/20 dark:text-red-500 dark:bg-red-500/10 dark:focus:text-red-500 dark:focus:bg-red-500/20 dark:hover:text-red-500 dark:hover:bg-red-500/20"
                onClick={() => handleDelete(apiKey.id)}
              >
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
