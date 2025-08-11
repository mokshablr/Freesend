"use client";

import { useEffect, useState } from "react";

import { getServersByTenant } from "@/lib/smtp-config";
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

import CreateMailServerDialog from "./add-server-dialog";
import MailServerTable from "./mail-server-table";

type SmtpConfig = {
  id: string;
  name: string;
  host: string;
  port: number;
  user: string;
  security: string;
};

export default function MailServers() {
  const [data, setData] = useState<SmtpConfig[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSecurity, setSelectedSecurity] = useState<string>("all");

  const fetchMailServers = async () => {
    try {
      const result = await getServersByTenant();
      setData(result);
    } catch (error) {
      console.error("Error fetching servers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMailServers(); // Fetch initial data on mount
  }, []);

  // Function to parse the search query
  type FilterKey = "name" | "host" | "user" | "port";

  const parseSearchQuery = (query: string) => {
    const filters: Record<FilterKey, string> = {
      name: "",
      host: "",
      user: "",
      port: "",
    };

    const filterRegex = /(\bname:|\bhost:|\buser:|\bport:)/gi;
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

  // Filter mail servers based on search query and security
  const filteredData = data.filter((server) => {
    const { name, host, user, port } = parseSearchQuery(searchQuery);
    
    // Search query filter
    const nameMatch = name ? server.name.toLowerCase().includes(name) : true;
    const hostMatch = host ? server.host.toLowerCase().includes(host) : true;
    const userMatch = user ? server.user.toLowerCase().includes(user) : true;
    const portMatch = port ? server.port.toString().includes(port) : true;

    const searchMatch = nameMatch && hostMatch && userMatch && portMatch;

    // Security filter
    const securityMatch = selectedSecurity === "all" || server.security === selectedSecurity;

    return searchMatch && securityMatch;
  });

  // Get unique security types and count servers per security
  const securityTypes = Array.from(new Set(data.map(server => server.security)));
  const serverCountsBySecurity = data.reduce((acc, server) => {
    acc[server.security] = (acc[server.security] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <title>Mail Servers</title>
      <div>
        <div className="mx-auto max-w-7xl items-center justify-between px-6 py-8">
          <h1 className="text-slate-12 pb-5 text-2xl font-semibold leading-tight tracking-tight">
            Mail Servers
          </h1>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            {/* Search Bar */}
            <div className="relative flex items-center">
              <Icons.search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                type="text"
                placeholder="Search by name:, host:, user:, port: ..."
                className="relative bg-muted/50 pl-8 text-xs font-normal text-muted-foreground sm:pr-12 md:w-72"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Security Filter */}
            <div className="relative flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`relative h-10 bg-muted/50 text-xs font-medium border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 ${
                      selectedSecurity !== "all"
                        ? 'text-blue-700 bg-blue-50/80 border-blue-200 shadow-md shadow-blue-500/20 dark:text-blue-300 dark:bg-blue-950/50 dark:border-blue-800'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icons.lock className="mr-2 h-4 w-4" />
                    {selectedSecurity !== "all" && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                    Security: {selectedSecurity === "all" ? "All" : selectedSecurity.toUpperCase()}
                    <Icons.chevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="start">
                  <div className="p-3 border-b bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium">Filter by Security</span>
                      {selectedSecurity !== "all" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSecurity("all")}
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
                        selectedSecurity === "all" ? "bg-muted text-foreground" : "text-muted-foreground"
                      }`}
                      onClick={() => setSelectedSecurity("all")}
                    >
                      <span>All Security Types</span>
                      <Badge variant="secondary" className="text-xs">
                        {data.length}
                      </Badge>
                    </div>
                    {securityTypes.map((security) => (
                      <div 
                        key={security}
                        className={`flex items-center justify-between px-3 py-2 text-xs rounded cursor-pointer hover:bg-muted/50 ${
                          selectedSecurity === security ? "bg-muted text-foreground" : "text-muted-foreground"
                        }`}
                        onClick={() => setSelectedSecurity(security)}
                      >
                        <span>{security.toUpperCase()}</span>
                        <Badge variant="secondary" className="text-xs">
                          {serverCountsBySecurity[security] || 0}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Clear Filters Button */}
            {(selectedSecurity !== "all" || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedSecurity("all");
                  setSearchQuery("");
                }}
                className="h-10 px-3 text-xs text-muted-foreground hover:text-foreground border border-dashed border-muted-foreground/30 hover:border-red-300 hover:bg-red-50/50 hover:text-red-600 transition-all duration-200 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-800/50"
              >
                <Icons.close className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>

          {/* Create Mail Server Button - Right Aligned */}
          <div className="flex justify-end">
            <CreateMailServerDialog onMailServerCreated={fetchMailServers} />
          </div>
        </div>
        </div>
        <div className="mx-auto max-w-7xl px-6">
          <MailServerTable
            initialMailServers={filteredData}
            initialIsLoading={isLoading}
          />
        </div>
      </div>
    </>
  );
}
