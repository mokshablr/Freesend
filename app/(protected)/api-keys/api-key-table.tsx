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
import { TablePagination } from "@/components/ui/table-pagination";
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

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10); // Default page size

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
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-background text-foreground border border-border text-xs font-medium shadow-sm max-w-[200px] truncate">
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
        const [isAnimating, setIsAnimating] = useState(false);

        const handleCopy = async () => {
          try {
            await navigator.clipboard.writeText(tokenValue);
            setIsAnimating(true);
            setCopied(true);
            
            // Reset animations
            setTimeout(() => {
              setIsAnimating(false);
            }, 300);
            
            setTimeout(() => {
              setCopied(false);
            }, 2000);
          } catch (err) {
            console.error('Failed to copy:', err);
          }
        };

        return (
          <div className="flex items-center group">
            <span className="inline-flex h-6 items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-mono text-gray-700 dark:bg-gray-800 dark:text-gray-300 transition-all duration-200 group-hover:bg-gray-200 dark:group-hover:bg-gray-700">
              {tokenValue.slice(0, 3)}...{tokenValue.slice(-5)}
            </span>
            <div className="relative ml-2">
              <Button
                className={`h-6 w-6 transition-all duration-200 ${
                  copied 
                    ? 'bg-green-100 border-green-300 hover:bg-green-200 dark:bg-green-900 dark:border-green-700 dark:hover:bg-green-800' 
                    : 'hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900 dark:hover:border-blue-700'
                } ${
                  isAnimating ? 'scale-110 shadow-md' : 'scale-100'
                }`}
                variant={"outline"}
                size={"icon"}
                onClick={handleCopy}
              >
                <div className={`transition-all duration-200 ${isAnimating ? 'rotate-12' : 'rotate-0'}`}>
                  {copied ? (
                    <CopyCheck className={`h-3 w-3 text-green-600 dark:text-green-400 transition-all duration-200 ${
                      isAnimating ? 'scale-125' : 'scale-100'
                    }`} />
                  ) : (
                    <CopyIcon className="h-3 w-3 transition-all duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  )}
                </div>
              </Button>
              
              {/* Copy success indicator */}
              {copied && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-md shadow-lg">
                    Copied!
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-green-600"></div>
                </div>
              )}
            </div>
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
              return "bg-green-50/80 text-green-700 border-green-200 shadow-sm hover:shadow-lg hover:shadow-green-500/30 hover:border-green-400/60 dark:bg-green-950/80 dark:text-green-300 dark:border-green-800 dark:hover:shadow-green-400/20 dark:hover:border-green-600/60";
            case "inactive":
              return "bg-red-50/80 text-red-700 border-red-200 shadow-sm hover:shadow-lg hover:shadow-red-500/30 hover:border-red-400/60 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800 dark:hover:shadow-red-400/20 dark:hover:border-red-600/60";
            default:
              return "bg-gray-50/80 text-gray-700 border-gray-200 shadow-sm hover:shadow-lg hover:shadow-gray-500/30 hover:border-gray-400/60 dark:bg-gray-950/80 dark:text-gray-300 dark:border-gray-800 dark:hover:shadow-gray-400/20 dark:hover:border-gray-600/60";
          }
        };
        return (
          <div className="inline-flex">
            <Badge
              className={`pointer-events-none capitalize text-xs border-2 rounded-md px-2.5 py-1 font-medium transition-all duration-300 ${getStatusClass(status)}`}
            >
              {status}
            </Badge>
          </div>
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
      header: "Actions",
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

  // Calculate the current data slice based on pagination
  const paginatedApiKeys = apiKeys.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize,
  );

  return (
    <>
      <DataTable columns={columns} data={paginatedApiKeys} isLoading={isLoading} />
      <TablePagination
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalItems={apiKeys.length}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
      />
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
