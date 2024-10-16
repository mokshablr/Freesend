"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

import { getApiKeysByTenant } from "@/lib/api-key";
import { formatDate } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table"; // Make sure to import your DataTable component

import CreateApiKeyDialog from "./add-key-dialog";
import ApiKeyTable from "./api-key-table";

type ApiKeys = {
  name: string;
  token: string;
  createdAt: string;
  smtpConfig: string;
};

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKeys[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApiKeys = async () => {
    try {
      const result = await getApiKeysByTenant();
      // setApiKeys(result);
      console.log("Raw result:", result);

      const formattedData = result.map((item: any) => ({
        ...item,
        mailServer: item["smtpConfig"].name,
        createdAt: formatDistanceToNow(new Date(item.createdAt), {
          addSuffix: true,
        }),
      }));
      setApiKeys(formattedData);
    } catch (error) {
      console.error("Error fetching servers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys(); // Fetch initial data on mount
  }, []);

  return (
    <>
      <title>API Keys</title>
      <div>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
          <h1 className="text-slate-12 text-[28px] font-bold leading-[34px] tracking-[-0.416px]">
            API Keys
          </h1>
          <div>
            <CreateApiKeyDialog onApiKeyCreated={fetchApiKeys} />
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-6">
          <ApiKeyTable apiKeys={apiKeys} isLoading={isLoading} />
        </div>
      </div>
    </>
  );
}
