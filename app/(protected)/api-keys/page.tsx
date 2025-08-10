"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import { getApiKeysByTenant } from "@/lib/api-key";
import { getServersByTenant } from "@/lib/smtp-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/shared/icons";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

import CreateApiKeyDialog from "./add-key-dialog";
import ApiKeyTable from "./api-key-table";
import { ApiKeysWrapper } from "./api-keys-wrapper";

type ApiKeys = {
  id: string;
  name: string;
  token: string;
  createdAt: string;
  smtpConfig: string;
  status: string;
  mailServer?: { name: string };
};

type MailServer = {
  id: string;
  name: string;
};

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKeys[]>([]);
  const [mailServers, setMailServers] = useState<MailServer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mailServersLoading, setMailServersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMailServers, setSelectedMailServers] = useState<string[]>([]);

  // Map of mailServerId to mailServer name for display
  const mailServerMap = mailServers.reduce((acc, server) => {
    acc[server.id] = server.name;
    return acc;
  }, {} as Record<string, string>);

  // Count API keys per mail server for display
  const apiKeyCountsByServer = apiKeys.reduce((acc, apiKey) => {
    const serverId = apiKey.smtpConfig;
    if (serverId) {
      acc[serverId] = (acc[serverId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Handle multi-select mail server changes
  const handleMailServerToggle = (serverId: string, checked: boolean) => {
    if (checked) {
      setSelectedMailServers(prev => [...prev, serverId]);
    } else {
      setSelectedMailServers(prev => prev.filter(id => id !== serverId));
    }
  };

  // Clear all mail server filters
  const clearMailServerFilters = () => {
    setSelectedMailServers([]);
  };

  const fetchApiKeys = async () => {
    try {
      const result = await getApiKeysByTenant();

      const formattedData = result
        .filter((item: any) => item.status !== "deleted")
        .map((item: any) => ({
          ...item,
          status: !item.smtpConfig ? "inactive" : item.status,
          mailServer: item.smtpConfig?.name,
          createdAt: formatDistanceToNow(new Date(item.createdAt), {
            addSuffix: true,
          }),
        }));
      setApiKeys(formattedData);
    } catch (error) {
      toast.error("Error fetching servers:" + error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMailServers = async () => {
    try {
      const result = await getServersByTenant();
      setMailServers(result);
    } catch (error) {
      console.error("Error fetching mail servers:", error);
    } finally {
      setMailServersLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys(); // Fetch initial data on mount
    fetchMailServers();
  }, []);

  // Single loading state: true if either is loading
  const loading = isLoading || mailServersLoading;

  // Function to parse the search query
  type FilterKey = "name" | "token";

  const parseSearchQuery = (query: string) => {
    const filters: Record<FilterKey, string> = {
      name: "",
      token: "",
    };

    const filterRegex = /(\bname:|\btoken:)/gi;
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

  // Filter API keys based on search query, status, and mail server
  const filteredData = apiKeys.filter((apiKey) => {
    const { name, token } = parseSearchQuery(searchQuery);
    const nameMatch = name ? apiKey.name.toLowerCase().includes(name) : true;
    const tokenMatch = token ? apiKey.token.toLowerCase().includes(token) : true;
    
    const statusMatch = statusFilter === "all" ? true : apiKey.status === statusFilter;

    // Mail Server filter logic - use multi-select only
    const serverMatch = selectedMailServers.length === 0 ? true : selectedMailServers.includes(apiKey.smtpConfig);

    return nameMatch && tokenMatch && statusMatch && serverMatch;
  });

  return (
    <>
      <title>API Keys</title>
      <div>
        <div className="mx-auto max-w-7xl items-center justify-between px-6 py-8">
          <div className="flex items-center gap-3 pb-5">
            <Icons.lock className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-slate-12 text-2xl font-semibold leading-tight tracking-tight">
              API Keys
            </h1>
          </div>
          <div className="h-px bg-border mb-4"></div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="relative flex items-center">
                <Icons.search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  type="text"
                  placeholder="Search by name:, token: ..."
                  className="relative bg-muted/50 pl-8 text-xs font-normal text-muted-foreground sm:pr-12 md:w-72"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={`w-32 h-10 bg-muted/50 text-xs font-medium border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 ${
                  statusFilter !== "all"
                    ? 'text-blue-700 bg-blue-50/80 border-blue-200 shadow-md shadow-blue-500/20 dark:text-blue-300 dark:bg-blue-950/50 dark:border-blue-800'
                    : 'text-muted-foreground'
                }`}>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Mail Server Filter - Multi-select only */}
              <div className="relative flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`relative h-10 bg-muted/50 text-xs font-medium border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 ${
                        selectedMailServers.length > 0
                          ? 'text-blue-700 bg-blue-50/80 border-blue-200 shadow-md shadow-blue-500/20 dark:text-blue-300 dark:bg-blue-950/50 dark:border-blue-800'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icons.server className="mr-2 h-4 w-4" />
                      {selectedMailServers.length > 0 && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                      Servers {selectedMailServers.length > 0 ? `(${selectedMailServers.length})` : ""}
                      <Icons.chevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto" align="start">
                    {/* Header */}
                    <div className="p-3 border-b bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">Filter by Mail Servers</span>
                        {selectedMailServers.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearMailServerFilters}
                            className="h-6 px-2 text-xs"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Multi Select Options */}
                    <div className="p-1">
                      {mailServers.map((server) => (
                        <DropdownMenuCheckboxItem
                          key={server.id}
                          checked={selectedMailServers.includes(server.id)}
                          onCheckedChange={(checked) => handleMailServerToggle(server.id, checked)}
                          className="flex items-center justify-between"
                        >
                          <span className="flex-1">{server.name}</span>
                          <Badge variant="secondary" className="text-xs ml-2">
                            {apiKeyCountsByServer[server.id] || 0}
                          </Badge>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Selected Mail Servers Display */}
                {selectedMailServers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 ml-2 max-w-xs">
                    {selectedMailServers.slice(0, 3).map((serverId) => (
                      <Badge 
                        key={serverId} 
                        variant="outline" 
                        className="text-xs h-6 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 hover:shadow-blue-500/25 hover:border-blue-300 hover:from-blue-100 hover:to-indigo-100 animate-in fade-in slide-in-from-left-2 dark:from-blue-950/50 dark:to-indigo-950/50 dark:text-blue-300 dark:border-blue-800 dark:hover:border-blue-700"
                      >
                        {mailServerMap[serverId]}
                        <button
                          onClick={() => handleMailServerToggle(serverId, false)}
                          className="ml-1.5 hover:bg-red-100 hover:text-red-600 rounded-full p-0.5 transition-all duration-200 transform hover:scale-110 dark:hover:bg-red-900/50 dark:hover:text-red-400"
                        >
                          <Icons.close className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    ))}
                    {selectedMailServers.length > 3 && (
                      <Badge 
                        variant="outline" 
                        className="text-xs h-6 bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border-gray-200 shadow-sm animate-in fade-in slide-in-from-left-2 dark:from-gray-950/50 dark:to-slate-950/50 dark:text-gray-300 dark:border-gray-800"
                      >
                        +{selectedMailServers.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Clear Filters Button */}
              {(selectedMailServers.length > 0 || searchQuery || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedMailServers([]);
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="h-10 px-3 text-xs text-muted-foreground hover:text-foreground border border-dashed border-muted-foreground/30 hover:border-red-300 hover:bg-red-50/50 hover:text-red-600 transition-all duration-200 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-800/50"
                >
                  <Icons.close className="h-4 w-4 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>
            <div>
              <CreateApiKeyDialog onApiKeyCreated={fetchApiKeys} />
            </div>
          </div>
        </div>
        <ApiKeysWrapper>
          <ApiKeyTable initialApiKeys={filteredData} initialIsLoading={loading} />
        </ApiKeysWrapper>
      </div>
    </>
  );
}
