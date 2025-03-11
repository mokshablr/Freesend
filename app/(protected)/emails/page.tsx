"use client";

import { useEffect, useState } from "react";
import type { Emails } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

import { getEmailsByTenant } from "@/lib/emails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/shared/icons";

import EmailTable from "./email-table";

export default function Emails() {
  const [data, setData] = useState<Emails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEmailsList = async () => {
    try {
      const result = await getEmailsByTenant();
      const formattedData = result.map((item: any) => ({
        ...item,
        createdAt: formatDistanceToNow(new Date(item.createdAt), {
          addSuffix: true,
        }),
      }));
      setData(formattedData);
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailsList();
  }, []);

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

  // Filter emails based on the search query
  const filteredData = data.filter((email) => {
    const { from, to, subject } = parseSearchQuery(searchQuery);
    const fromMatch = from ? email.from.toLowerCase().includes(from) : true;
    const toMatch = to ? email.to.toLowerCase().includes(to) : true;
    const subjectMatch = subject
      ? email.subject.toLowerCase().includes(subject)
      : true;

    return fromMatch && toMatch && subjectMatch;
  });

  return (
    <>
      <title>Emails</title>
      <div>
        <div className="mx-auto max-w-5xl items-center justify-between px-6 py-8">
          <h1 className="text-slate-12 pb-5 text-[28px] font-bold leading-[34px] tracking-[-0.416px]">
            Emails
          </h1>
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
        </div>
            <div className="mx-auto max-w-5xl px-6">
              <EmailTable
                initialEmailList={filteredData}
                initialIsLoading={isLoading}
              />
            </div>
          </div>
    </>
  );
}
