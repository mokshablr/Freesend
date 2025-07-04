"use client";

import { useEffect, useState } from "react";
import type { Emails } from "@prisma/client";
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

import EmailTable from "./email-table";

export default function Emails() {
  const [data, setData] = useState<Emails[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [apiKeysLoading, setApiKeysLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApiKey, setSelectedApiKey] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Map of apiKeyId to apiKey name for display in table
  const apiKeyMap = apiKeys.reduce((acc, key) => {
    acc[key.id] = key.name;
    return acc;
  }, {} as Record<string, string>);

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

  // Filter emails based on the search query, selected API Key, and date range
  const filteredData = data.filter((email) => {
    const { from, to, subject } = parseSearchQuery(searchQuery);
    const fromMatch = from ? email.from.toLowerCase().includes(from) : true;
    const toMatch = to ? email.to.toLowerCase().includes(to) : true;
    const subjectMatch = subject
      ? email.subject.toLowerCase().includes(subject)
      : true;
    const apiKeyMatch =
      selectedApiKey === "all" ? true : email.apiKeyId === selectedApiKey;
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
            <div className="relative flex items-center w-36 max-w-full sm:w-36">
              <Select value={selectedApiKey} onValueChange={setSelectedApiKey}>
                <SelectTrigger className="relative h-10 w-full bg-muted/50 pl-3 text-sm font-normal text-muted-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <SelectValue placeholder="Filter by API Key" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All API Keys</SelectItem>
                  {apiKeys.map((key) => (
                    <SelectItem key={key.id} value={key.id}>
                      {key.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Date Range Selector */}
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-6">
          <EmailTable
            initialEmailList={filteredData}
            initialIsLoading={isLoading}
            apiKeyMap={apiKeyMap}
          />
        </div>
      </div>
    </>
  );
}
