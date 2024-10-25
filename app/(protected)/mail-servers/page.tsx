"use client";

import { useEffect, useState } from "react";

import { getServersByTenant } from "@/lib/smtp-config";
import { DataTable } from "@/components/ui/data-table"; // Make sure to import your DataTable component

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

  const fetchMailServers = async () => {
    try {
      const result = await getServersByTenant();
      // console.log("result", result); // Fixed log statement
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

  return (
    <>
      <title>Mail Servers</title>
      <div>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
          <h1 className="text-slate-12 text-[28px] font-bold leading-[34px] tracking-[-0.416px]">
            Mail Servers
          </h1>
          <div>
            <CreateMailServerDialog onMailServerCreated={fetchMailServers} />
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-6">
          <MailServerTable
            initialMailServers={data}
            initialIsLoading={isLoading}
          />
        </div>
      </div>
    </>
  );
}
