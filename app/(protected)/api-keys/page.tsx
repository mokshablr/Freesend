"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import { getApiKeysByTenant } from "@/lib/api-key";

import CreateApiKeyDialog from "./add-key-dialog";
import ApiKeyTable from "./api-key-table";

type ApiKeys = {
  id: string;
  name: string;
  token: string;
  createdAt: string;
  status: "active" | "inactive";
  smtpConfig: {
    name: string;
  } | null;
};

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKeys[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApiKeys = async () => {
    try {
      const result = await getApiKeysByTenant();

      const formattedData = result
        .filter((item: any) => item.status !== "deleted")
        .map((item: any) => {
          const formattedItem = {
            ...item,
            status: !item.smtpConfig ? "inactive" : (item.status === "active" ? "active" : "inactive"),
            smtpConfig: item.smtpConfig ? { name: item.smtpConfig.name } : null,
            createdAt: formatDistanceToNow(new Date(item.createdAt), {
              addSuffix: true,
            }),
          };
          return formattedItem;
        });
      setApiKeys(formattedData);
    } catch (error) {
      toast.error("Error fetching servers:" + error);
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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8">
          <h1 className="text-slate-12 text-2xl font-semibold leading-tight tracking-tight">
            API Keys
          </h1>
          <div>
            <CreateApiKeyDialog onApiKeyCreated={fetchApiKeys} />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6">
          <ApiKeyTable initialApiKeys={apiKeys} initialIsLoading={isLoading} />
        </div>
      </div>
    </>
  );
}
