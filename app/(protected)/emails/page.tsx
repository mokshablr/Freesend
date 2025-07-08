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
    <>
      <title>Emails</title>
      <div>
        <div className="mx-auto max-w-5xl items-center justify-between px-6 py-8">
          <h1 className="text-slate-12 pb-5 text-[28px] font-bold leading-[34px] tracking-[-0.416px]">
            Emails
          </h1>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="relative flex items-center">
              <Icons.search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                type="text"
                placeholder="Search by from:, to:, subject: ..."
                className="relative bg-muted/50 pl-8 text-sm font-normal text-muted-foreground sm:pr-12 md:w-72"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={filterMode === "dropdown" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilterMode("dropdown");
                  setSelectedApiKeys([]);
                }}
                className="text-xs"
              >
                Single
              </Button>
              <Button
                variant={filterMode === "multi" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilterMode("multi");
                  setSelectedApiKey("all");
                }}
                className="text-xs"
              >
                Multi
              </Button>
            </div>

            {/* API Key Filter - Dropdown Mode */}
            {filterMode === "dropdown" && (
              <div className="relative flex items-center w-48 max-w-full">
                <Select value={selectedApiKey} onValueChange={setSelectedApiKey}>
                  <SelectTrigger className="relative h-10 w-full bg-muted/50 pl-3 text-sm font-normal text-muted-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <SelectValue placeholder="Filter by API Key" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All API Keys ({data.length})
                    </SelectItem>
                    {apiKeys.map((key) => (
                      <SelectItem key={key.id} value={key.id}>
                        {key.name} ({emailCountsByApiKey[key.id] || 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* API Key Filter - Multi-select Mode */}
            {filterMode === "multi" && (
              <div className="relative flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="relative h-10 bg-muted/50 text-sm font-normal text-muted-foreground border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <Icons.list className="mr-2 h-4 w-4" />
                      API Keys {selectedApiKeys.length > 0 && `(${selectedApiKeys.length})`}
                      <Icons.chevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto" align="start">
                    <div className="p-2 border-b">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Select API Keys</span>
                        {selectedApiKeys.length > 0 && (
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
                    </div>
                    {apiKeys.map((key) => (
                      <DropdownMenuCheckboxItem
                        key={key.id}
                        checked={selectedApiKeys.includes(key.id)}
                        onCheckedChange={(checked) => handleApiKeyToggle(key.id, checked)}
                        className="flex items-center space-x-2"
                      >
                        <span className="flex-1">{key.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {emailCountsByApiKey[key.id] || 0}
                        </Badge>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Selected API Keys Display */}
                {selectedApiKeys.length > 0 && (
                  <div className="flex flex-wrap gap-1 ml-2 max-w-xs">
                    {selectedApiKeys.slice(0, 3).map((keyId) => (
                      <Badge key={keyId} variant="secondary" className="text-xs">
                        {apiKeyMap[keyId]}
                        <button
                          onClick={() => handleApiKeyToggle(keyId, false)}
                          className="ml-1 hover:bg-muted-foreground/20 rounded-full"
                        >
                          <Icons.close className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {selectedApiKeys.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{selectedApiKeys.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Date Range Selector */}
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-6">
          <EmailTable
            initialEmailList={filteredData.map(email => ({
              ...email,
              html_body: email.html_body === null ? undefined : email.html_body,
              text_body: email.text_body === null ? undefined : email.text_body,
              attachments_metadata: email.attachments_metadata === null ? undefined : email.attachments_metadata,
            }))}
            initialIsLoading={isLoading}
            apiKeyMap={apiKeyMap}
          />
        </div>
      </div>
    </>
  );
}
