"use client";

import { useEffect, useState } from "react";

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

import CreateMailServerDialog from "./add-server-dialog";
import MailServerTable from "./mail-server-table";
import { MailServersWrapper } from "./mail-servers-wrapper";

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
  const [securityFilter, setSecurityFilter] = useState<string>("all");

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
  type FilterKey = "name" | "host" | "user";

  const parseSearchQuery = (query: string) => {
    const filters: Record<FilterKey, string> = {
      name: "",
      host: "",
      user: "",
    };

    const filterRegex = /(\bname:|\bhost:|\buser:)/gi;
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

  // Filter mail servers based on search query and security filter
  const filteredData = data.filter((server) => {
    const { name, host, user } = parseSearchQuery(searchQuery);
    const nameMatch = name ? server.name.toLowerCase().includes(name) : true;
    const hostMatch = host ? server.host.toLowerCase().includes(host) : true;
    const userMatch = user ? server.user.toLowerCase().includes(user) : true;
    
    const securityMatch = securityFilter === "all" ? true : server.security === securityFilter;

    return nameMatch && hostMatch && userMatch && securityMatch;
  });

  // Get unique security types for filter dropdown
  const securityTypes = Array.from(new Set(data.map(server => server.security)));

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
              <div className="relative flex items-center">
                <Icons.search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  type="text"
                  placeholder="Search by name:, host:, user: ..."
                  className="relative bg-muted/50 pl-8 text-xs font-normal text-muted-foreground sm:pr-12 md:w-72"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Security Filter */}
              <Select value={securityFilter} onValueChange={setSecurityFilter}>
                <SelectTrigger className={`w-40 h-10 bg-muted/50 text-xs font-medium border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 ${
                  securityFilter !== "all"
                    ? 'text-blue-700 bg-blue-50/80 border-blue-200 shadow-md shadow-blue-500/20 dark:text-blue-300 dark:bg-blue-950/50 dark:border-blue-800'
                    : 'text-muted-foreground'
                }`}>
                  <SelectValue placeholder="Security" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Security</SelectItem>
                  {securityTypes.map((security) => (
                    <SelectItem key={security} value={security}>
                      {security.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters Button */}
              {(searchQuery || securityFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSecurityFilter("all");
                  }}
                  className="h-10 px-3 text-xs text-muted-foreground hover:text-foreground border border-dashed border-muted-foreground/30 hover:border-red-300 hover:bg-red-50/50 hover:text-red-600 transition-all duration-200 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-800/50"
                >
                  <Icons.close className="h-4 w-4 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>
            <div>
              <CreateMailServerDialog onMailServerCreated={fetchMailServers} />
            </div>
          </div>
        </div>
        <MailServersWrapper>
          <MailServerTable
            initialMailServers={filteredData}
            initialIsLoading={isLoading}
          />
        </MailServersWrapper>
      </div>
    </>
  );
}
