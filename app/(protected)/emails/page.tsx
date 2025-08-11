"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow, parseISO, startOfDay, endOfDay } from "date-fns";
import { isAfter, isBefore, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

import { getEmailsByTenant } from "@/lib/emails";
import { getApiKeysByTenant } from "@/lib/api-key";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

import EmailTable from "./email-table";

export default function Emails() {
  const [data, setData] = useState<any[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [apiKeysLoading, setApiKeysLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApiKeys, setSelectedApiKeys] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [filterMode, setFilterMode] = useState<"dropdown" | "multi">("dropdown");
  const [selectedApiKey, setSelectedApiKey] = useState<string>("all");

  // Map of apiKeyId to apiKey name for display in table
  const apiKeyMap = apiKeys.reduce((acc, key) => {
    acc[key.id] = key.name;
    return acc;
  }, {} as Record<string, string>);

  // Count emails per API key for display
  const emailCountsByApiKey = data.reduce((acc, email) => {
    acc[email.apiKeyId] = (acc[email.apiKeyId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Handle multi-select API key changes
  const handleApiKeyToggle = (apiKeyId: string, checked: boolean) => {
    if (checked) {
      setSelectedApiKeys(prev => [...prev, apiKeyId]);
    } else {
      setSelectedApiKeys(prev => prev.filter(id => id !== apiKeyId));
    }
  };

  // Clear all API key filters
  const clearApiKeyFilters = () => {
    setSelectedApiKeys([]);
    setSelectedApiKey("all");
  };

  // Handle API key click from table
  const handleApiKeyClick = (apiKeyId: string, apiKeyName: string) => {
    // Switch to dropdown mode and select the clicked API key
    setFilterMode("dropdown");
    setSelectedApiKey(apiKeyId);
    setSelectedApiKeys([]); // Clear multi-select
  };

  // Handle clear filter from table
  const handleClearFilterFromTable = () => {
    setSelectedApiKey("all");
    setSelectedApiKeys([]);
    setFilterMode("dropdown");
  };

  const fetchEmailsList = async () => {
    try {
      const result = await getEmailsByTenant();
      setData(result);
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setEmailsLoading(false);
    }
  };

  const fetchApiKeysList = async () => {
    try {
      const result = await getApiKeysByTenant();
      setApiKeys(result.filter((k: any) => k.status !== "deleted"));
    } catch (error) {
      // ignore for now
    } finally {
      setApiKeysLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailsList();
    fetchApiKeysList();
  }, []);

  // Single loading state: true if either is loading
  const isLoading = emailsLoading || apiKeysLoading;

  // Function to parse the search query
  type FilterKey = "from" | "to" | "subject";

  const parseSearchQuery = (query: string) => {
    const filters: Record<FilterKey, string> = {
      from: "",
      to: "",
      subject: "",
    };

    const filterRegex = /(\bfrom:|\bto:|\bsubject:)/gi;
    let currentKey: FilterKey = "subject";
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
        filters.subject += part + " ";
      }
    });

    if (currentKey) {
      filters[currentKey] = currentValue.trim().toLowerCase();
    } else {
      filters.subject = filters.subject.trim().toLowerCase();
    }

    return filters;
  };

  // Filter emails based on the search query, selected API Key(s), and date range
  const filteredData = data.filter((email) => {
    const { from, to, subject } = parseSearchQuery(searchQuery);
    const fromMatch = from ? email.from.toLowerCase().includes(from) : true;
    const toMatch = to ? email.to.toLowerCase().includes(to) : true;
    const subjectMatch = subject
      ? email.subject.toLowerCase().includes(subject)
      : true;
    
    // API Key filter logic
    let apiKeyMatch = true;
    if (filterMode === "dropdown") {
      apiKeyMatch = selectedApiKey === "all" ? true : email.apiKeyId === selectedApiKey;
    } else {
      // Multi-select mode
      apiKeyMatch = selectedApiKeys.length === 0 ? true : selectedApiKeys.includes(email.apiKeyId);
    }
    
    let dateMatch = true;
    if (dateRange?.from && dateRange?.to) {
      // Parse the DB datetime string to a Date object
      let emailDate = new Date(email.createdAt);
      const start = startOfDay(dateRange.from);
      const end = endOfDay(dateRange.to);
      const inRange = emailDate >= start && emailDate <= end;
      let emailDateStr;
      if (isNaN(emailDate.getTime())) {
        emailDateStr = `Invalid date: ${email.createdAt}`;
        console.warn("Invalid email date:", email.createdAt);
      } else {
        emailDateStr = emailDate.toISOString();
      }
      console.log("Checking email:", {
        emailDate: emailDateStr,
        rangeStart: start.toISOString(),
        rangeEnd: end.toISOString(),
        inRange,
      });
      dateMatch = inRange;
    }
    return fromMatch && toMatch && subjectMatch && apiKeyMatch && dateMatch;
  });

  return (
    <div>
      <div className="mx-auto max-w-7xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          <Icons.mail className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-slate-12 text-2xl font-semibold leading-tight tracking-tight">
            Emails
          </h1>
        </div>
        <div className="mt-2 h-px bg-border"></div>
      </div>
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="relative flex items-center">
            <Icons.search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              type="text"
              placeholder="Search by from:, to:, subject: ..."
              className="relative bg-muted/50 pl-8 text-xs font-normal text-muted-foreground sm:pr-12 md:w-72"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* API Key Filter with Integrated Mode Selection */}
          <div className="relative flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`relative h-10 bg-muted/50 text-xs font-medium border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 ${
                    selectedApiKey !== "all" || selectedApiKeys.length > 0
                      ? 'text-blue-700 bg-blue-50/80 border-blue-200 shadow-md shadow-blue-500/20 dark:text-blue-300 dark:bg-blue-950/50 dark:border-blue-800'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icons.list className="mr-2 h-4 w-4" />
                  {(selectedApiKey !== "all" || selectedApiKeys.length > 0) && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                  {filterMode === "dropdown"
                    ? `API Key: ${selectedApiKey === "all" ? "All" : apiKeyMap[selectedApiKey] || "Select"}`
                    : `API Keys ${selectedApiKeys.length > 0 ? `(${selectedApiKeys.length})` : ""}`
                  }
                  <Icons.chevronRight className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto" align="start">
                {/* Filter Mode Selection Header */}
                <div className="p-3 border-b bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">Filter by API Keys</span>
                    {(selectedApiKeys.length > 0 || selectedApiKey !== "all") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearApiKeyFilters}
                        className="h-6 px-2 text-xs"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant={filterMode === "dropdown" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFilterMode("dropdown");
                        setSelectedApiKeys([]);
                      }}
                      className="text-xs flex-1 h-8"
                    >
                      Single Select
                    </Button>
                    <Button
                      variant={filterMode === "multi" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFilterMode("multi");
                        setSelectedApiKey("all");
                      }}
                      className="text-xs flex-1 h-8"
                    >
                      Multi Select
                    </Button>
                  </div>
                </div>

                {/* Single Select Mode */}
                {filterMode === "dropdown" && (
                  <div className="p-1">
                    <div
                      className={`flex items-center justify-between px-3 py-2 text-xs rounded cursor-pointer hover:bg-muted/50 ${
                        selectedApiKey === "all" ? "bg-muted text-foreground" : "text-muted-foreground"
                      }`}
                      onClick={() => setSelectedApiKey("all")}
                    >
                      <span>All API Keys</span>
                      <Badge variant="secondary" className="text-xs">
                        {data.length}
                      </Badge>
                    </div>
                    {apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className={`flex items-center justify-between px-3 py-2 text-xs rounded cursor-pointer hover:bg-muted/50 ${
                          selectedApiKey === key.id ? "bg-muted text-foreground" : "text-muted-foreground"
                        }`}
                        onClick={() => setSelectedApiKey(key.id)}
                      >
                        <span>{key.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {emailCountsByApiKey[key.id] || 0}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Multi Select Mode */}
                {filterMode === "multi" && (
                  <div className="p-1">
                    {apiKeys.map((key) => (
                      <DropdownMenuCheckboxItem
                        key={key.id}
                        checked={selectedApiKeys.includes(key.id)}
                        onCheckedChange={(checked) => handleApiKeyToggle(key.id, checked)}
                        className="flex items-center justify-between"
                      >
                        <span className="flex-1">{key.name}</span>
                        <Badge variant="secondary" className="text-xs ml-2">
                          {emailCountsByApiKey[key.id] || 0}
                        </Badge>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Selected API Keys Display for Multi Mode */}
            {filterMode === "multi" && selectedApiKeys.length > 0 && (
              <div className="flex flex-wrap gap-1.5 ml-2 max-w-xs">
                {selectedApiKeys.slice(0, 3).map((keyId) => (
                  <Badge
                    key={keyId}
                    variant="outline"
                    className="text-xs h-6 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 hover:shadow-blue-500/25 hover:border-blue-300 hover:from-blue-100 hover:to-indigo-100 animate-in fade-in slide-in-from-left-2 dark:from-blue-950/50 dark:to-indigo-950/50 dark:text-blue-300 dark:border-blue-800 dark:hover:border-blue-700"
                  >
                    {apiKeyMap[keyId]}
                    <button
                      onClick={() => handleApiKeyToggle(keyId, false)}
                      className="ml-1.5 hover:bg-red-100 hover:text-red-600 rounded-full p-0.5 transition-all duration-200 transform hover:scale-110 dark:hover:bg-red-900/50 dark:hover:text-red-400"
                    >
                      <Icons.close className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
                {selectedApiKeys.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs h-6 bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border-gray-200 shadow-sm animate-in fade-in slide-in-from-left-2 dark:from-gray-950/50 dark:to-slate-950/50 dark:text-gray-300 dark:border-gray-800"
                  >
                    +{selectedApiKeys.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Date Range Selector */}
          <DateRangePicker value={dateRange} onChange={setDateRange} />

          {/* Clear Filters Button */}
          {(selectedApiKey !== "all" || selectedApiKeys.length > 0 || searchQuery || dateRange) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedApiKey("all");
                setSelectedApiKeys([]);
                setSearchQuery("");
                setDateRange(undefined);
              }}
              className="h-10 px-3 text-xs text-muted-foreground hover:text-foreground border border-dashed border-muted-foreground/30 hover:border-red-300 hover:bg-red-50/50 hover:text-red-600 transition-all duration-200 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-800/50"
            >
              <Icons.close className="h-4 w-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6">
        <div className="mt-8">
          <EmailTable
            initialEmailList={filteredData.map(email => ({
              ...email,
              html_body: email.html_body === null ? undefined : email.html_body,
              text_body: email.text_body === null ? undefined : email.text_body,
              attachments_metadata: email.attachments_metadata === null ? undefined : email.attachments_metadata,
            }))}
            initialIsLoading={isLoading}
            apiKeyMap={apiKeyMap}
            onApiKeyClick={handleApiKeyClick}
            activeFilterApiKey={filterMode === "dropdown" && selectedApiKey !== "all" ? selectedApiKey : undefined}
            onClearFilter={handleClearFilterFromTable}
          />
        </div>
      </div>
    </div>
  );
}
