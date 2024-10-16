import React, { useState } from "react";
import { CopyCheck, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table"; // Your DataTable component

interface MailServer {
  name: string;
  host: string;
  port: number;
  user: string;
}

interface MailServerTableProps {
  mailServers: MailServer[]; // Expecting an array of ApiKey objects
  isLoading: boolean;
}

const MailServerTable: React.FC<MailServerTableProps> = ({
  mailServers,
  isLoading = false,
}) => {
  const columns = [
    { id: "name", header: "Name", accessorKey: "name" },
    { id: "host", header: "Host", accessorKey: "host" },
    { id: "port", header: "Port", accessorKey: "port" },
    { id: "user", header: "User", accessorKey: "user" },
  ];

  return (
    <DataTable columns={columns} data={mailServers} isLoading={isLoading} />
  );
};

export default MailServerTable;
