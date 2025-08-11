"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import { getApiKeysByTenant } from "@/lib/api-key";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import CreateApiKeyDialog from "./add-key-dialog";
import ApiKeyTable from "./api-key-table";

type ApiKeys = {
  id: string;
  name: string;
  token: string;
  createdAt: string;
  status: "active" | "inactive";
  smtpConfig: {
    id: string;
    name: string;
  } | null;
};

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKeys[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedServers, setSelectedServers] = useState<string[]>([]);

  const fetchApiKeys = async () => {
    try {
      const result = await getApiKeysByTenant();

      const formattedData = result
        .filter((item: any) => item.status !== "deleted")
        .map((item: any) => {
          const formattedItem = {
            ...item,
            status: !item.smtpConfig ? "inactive" : (item.status === "active" ? "active" : "inactive"),
            smtpConfig: item.smtpConfig ? { 
              id: item.smtpConfig.id, 
              name: item.smtpConfig.name 
            } : null,
            createdAt: formatDistanceToNow(new Date(item.createdAt), {
              addSuffix: true,
            }),
          };
          return formattedItem;
        });
      setApiKeys(formattedData);
    } catch (error) {
      toast.error("Error fetching API keys:" + error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys(); // Fetch initial data on mount
  }, []);

  // Handle server filter changes
  const handleServerToggle = (serverId: string, checked: boolean) => {
    if (checked) {
      setSelectedServers(prev => [...prev, serverId]);
    } else {
      setSelectedServers(prev => prev.filter(id => id !== serverId));
    }
  };

  // Clear all server filters
  const clearServerFilters = () => {
    setSelectedServers([]);
  };

  // Function to parse the search query
  type FilterKey = "name" | "token" | "server";

  const parseSearchQuery = (query: string) => {
    const filters: Record<FilterKey, string> = {
      name: "",
      token: "",
      server: "",
    };

    const filterRegex = /(\bname:|\btoken:|\bserver:)/gi;
    let currentKey: FilterKey = "name";
    let currentValue = "";

    query.split(" ").forEach((part) => {
      if (filterRegex.test(part)) {
        if (currentKey) {
          filters[currentKey] = currentValue.trim().toLowerCase();
        }
        const [key, ...rest] = part.split(":");
        currentKey = key.toLowerCase() as FilterKey;
        currentValue = rest.join(":");
      } else if (currentKey) {
        currentValue += " " + part;
      } else {
        filters.name += part + " ";
      }
    });

    if (currentKey) {
      filters[currentKey] = currentValue.trim().toLowerCase();
    } else {
      filters.name = filters.name.trim().toLowerCase();
    }

    return filters;
  };

  // Filter API keys based on search query, status, and selected servers
  const filteredApiKeys = apiKeys.filter((apiKey) => {
    const { name, token, server } = parseSearchQuery(searchQuery);
    
    // Search query filter
    const nameMatch = name ? apiKey.name.toLowerCase().includes(name) : true;
    const tokenMatch = token ? apiKey.token.toLowerCase().includes(token) : true;
    const serverMatch = server ? 
      (apiKey.smtpConfig?.name && apiKey.smtpConfig.name.toLowerCase().includes(server)) : true;

    const searchMatch = nameMatch && tokenMatch && serverMatch;

    // Status filter
    const statusMatch = selectedStatus === "all" || apiKey.status === selectedStatus;

    // Server filter
    const selectedServerMatch = selectedServers.length === 0 || 
      (apiKey.smtpConfig && selectedServers.includes(apiKey.smtpConfig.id));

    return searchMatch && statusMatch && selectedServerMatch;
  });

  // Count API keys per server for display
  const apiKeyCountsByServer = apiKeys.reduce((acc, key) => {
    if (key.smtpConfig) {
      acc[key.smtpConfig.id] = (acc[key.smtpConfig.id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Count API keys per status for display
  const apiKeyCountsByStatus = apiKeys.reduce((acc, key) => {
    acc[key.status] = (acc[key.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <title>API Keys</title>
      <div>
        <div className="mx-auto max-w-7xl items-center justify-between px-6 py-8">
          <h1 className="text-slate-12 pb-5 text-2xl font-semibold leading-tight tracking-tight">
            API Keys
          </h1>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            {/* Search Bar */}
            <div className="relative flex items-center">
              <Icons.search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                type="text"
                placeholder="Search by name:, token:, server: ..."
                className="relative bg-muted/50 pl-8 text-xs font-normal text-muted-foreground sm:pr-12 md:w-72"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="relative flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`relative h-10 bg-muted/50 text-xs font-medium border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 ${
                      selectedStatus !== "all"
                        ? 'text-blue-700 bg-blue-50/80 border-blue-200 shadow-md shadow-blue-500/20 dark:text-blue-300 dark:bg-blue-950/50 dark:border-blue-800'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icons.list className="mr-2 h-4 w-4" />
                    {selectedStatus !== "all" && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                    Status: {selectedStatus === "all" ? "All" : selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
                    <Icons.chevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="start">
                  <div className="p-3 border-b bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium">Filter by Status</span>
                      {selectedStatus !== "all" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedStatus("all")}
                          className="h-6 px-2 text-xs"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="p-1">
                    <div 
                      className={`flex items-center justify-between px-3 py-2 text-xs rounded cursor-pointer hover:bg-muted/50 ${
                        selectedStatus === "all" ? "bg-muted text-foreground" : "text-muted-foreground"
                      }`}
                      onClick={() => setSelectedStatus("all")}
                    >
                      <span>All Statuses</span>
                      <Badge variant="secondary" className="text-xs">
                        {apiKeys.length}
                      </Badge>
                    </div>
                    <div 
                      className={`flex items-center justify-between px-3 py-2 text-xs rounded cursor-pointer hover:bg-muted/50 ${
                        selectedStatus === "active" ? "bg-muted text-foreground" : "text-muted-foreground"
                      }`}
                      onClick={() => setSelectedStatus("active")}
                    >
                      <span>Active</span>
                      <Badge variant="secondary" className="text-xs">
                        {apiKeyCountsByStatus["active"] || 0}
                      </Badge>
                    </div>
                    <div 
                      className={`flex items-center justify-between px-3 py-2 text-xs rounded cursor-pointer hover:bg-muted/50 ${
                        selectedStatus === "inactive" ? "bg-muted text-foreground" : "text-muted-foreground"
                      }`}
                      onClick={() => setSelectedStatus("inactive")}
                    >
                      <span>Inactive</span>
                      <Badge variant="secondary" className="text-xs">
                        {apiKeyCountsByStatus["inactive"] || 0}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Server Filter */}
            <div className="relative flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`relative h-10 bg-muted/50 text-xs font-medium border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 ${
                      selectedServers.length > 0
                        ? 'text-blue-700 bg-blue-50/80 border-blue-200 shadow-md shadow-blue-500/20 dark:text-blue-300 dark:bg-blue-950/50 dark:border-blue-800'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icons.server className="mr-2 h-4 w-4" />
                    {selectedServers.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                    Servers {selectedServers.length > 0 ? `(${selectedServers.length})` : ""}
                    <Icons.chevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto" align="start">
                  <div className="p-3 border-b bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium">Filter by Mail Servers</span>
                      {selectedServers.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearServerFilters}
                          className="h-6 px-2 text-xs"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="p-1">
                    {Array.from(new Set(apiKeys
                      .filter(key => key.smtpConfig)
                      .map(key => key.smtpConfig!.id)))
                      .map((serverId) => {
                        const server = apiKeys.find(key => key.smtpConfig?.id === serverId)?.smtpConfig;
                        return (
                          <DropdownMenuCheckboxItem
                            key={serverId}
                            checked={selectedServers.includes(serverId)}
                            onCheckedChange={(checked) => handleServerToggle(serverId, checked)}
                            className="flex items-center justify-between"
                          >
                            <span className="flex-1">{server?.name || "Unknown"}</span>
                            <Badge variant="secondary" className="text-xs ml-2">
                              {apiKeyCountsByServer[serverId] || 0}
                            </Badge>
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Selected Servers Display */}
              {selectedServers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 ml-2 max-w-xs">
                  {selectedServers.slice(0, 3).map((serverId) => {
                    const server = apiKeys.find(key => key.smtpConfig?.id === serverId)?.smtpConfig;
                    return (
                      <Badge 
                        key={serverId} 
                        variant="outline" 
                        className="text-xs h-6 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 hover:shadow-blue-500/25 hover:border-blue-300 hover:from-blue-100 hover:to-indigo-100 animate-in fade-in slide-in-from-left-2 dark:from-blue-950/50 dark:to-indigo-950/50 dark:text-blue-300 dark:border-blue-800 dark:hover:border-blue-700"
                      >
                        {server?.name || "Unknown"}
                        <button
                          onClick={() => handleServerToggle(serverId, false)}
                          className="ml-1.5 hover:bg-red-100 hover:text-red-600 rounded-full p-0.5 transition-all duration-200 transform hover:scale-110 dark:hover:bg-red-900/50 dark:hover:text-red-400"
                        >
                          <Icons.close className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    );
                  })}
                  {selectedServers.length > 3 && (
                    <Badge 
                      variant="outline" 
                      className="text-xs h-6 bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border-gray-200 shadow-sm animate-in fade-in slide-in-from-left-2 dark:from-gray-950/50 dark:to-indigo-950/50 dark:text-gray-300 dark:border-gray-800"
                    >
                      +{selectedServers.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Clear Filters Button */}
            {(selectedStatus !== "all" || selectedServers.length > 0 || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedStatus("all");
                  setSelectedServers([]);
                  setSearchQuery("");
                }}
                className="h-10 px-3 text-xs text-muted-foreground hover:text-foreground border border-dashed border-muted-foreground/30 hover:border-red-300 hover:bg-red-50/50 hover:text-red-600 transition-all duration-200 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-800/50"
              >
                <Icons.close className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>

          {/* Create API Key Button - Right Aligned */}
          <div className="flex justify-end">
            <CreateApiKeyDialog onApiKeyCreated={fetchApiKeys} />
          </div>
        </div>
        </div>
        <div className="mx-auto max-w-7xl px-6">
          <ApiKeyTable initialApiKeys={filteredApiKeys} initialIsLoading={isLoading} />
        </div>
      </div>
    </>
  );
}
