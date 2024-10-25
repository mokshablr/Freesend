import React, { useEffect, useState } from "react";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { toast } from "sonner";

import { deleteServer, updateMailServer } from "@/lib/smtp-config";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import UpdateApiKeyDialog from "./update-server-dialog";

interface MailServer {
  id: string;
  name: string;
  host: string;
  port: number;
  user: string;
  security: string;
}

interface MailServerTableProps {
  initialMailServers: MailServer[];
  initialIsLoading: boolean;
}

const MailServerTable: React.FC<MailServerTableProps> = ({
  initialMailServers,
  initialIsLoading = false,
}) => {
  const empty_mailServer = {
    id: "",
    name: "",
    host: "",
    port: 0,
    user: "",
    security: "",
  };

  const [mailServers, setMailServers] =
    useState<MailServer[]>(initialMailServers);
  const [isLoading, setIsLoading] = useState<boolean>(initialIsLoading);
  const [updateDialogOpen, setUpdateDialogOpen] = useState<boolean>(false);
  const [selectedMailServer, setSelectedMailServer] =
    useState<MailServer>(empty_mailServer);

  useEffect(() => {
    setMailServers(initialMailServers);
    setIsLoading(initialIsLoading);
  }, [initialMailServers, initialIsLoading]);

  const handleDelete = async (id: string) => {
    try {
      await deleteServer(id);
      setMailServers((prevKeys) => prevKeys.filter((key) => key.id !== id));
      toast.success("API Key has been deleted.");
    } catch (error) {
      toast.error("Error deleting API Key: " + error);
    }
  };

  const handleUpdate = async (
    id: string,
    updateData: {
      name: string;
      host: string;
      port: number;
      security: string;
    },
  ) => {
    try {
      await updateMailServer(id, updateData);
      setMailServers((prevKeys) =>
        prevKeys.map((key) =>
          key.id === id ? { ...key, ...updateData } : key,
        ),
      );
      toast.success("Mail server configuration has been updated.");
    } catch (error) {
      toast.error("Error updating mail server: " + error);
    }
  };

  const openUpdateDialog = (mailServer: MailServer) => {
    setSelectedMailServer(mailServer);
    setUpdateDialogOpen(true);
  };

  const closeUpdateDialog = () => {
    setSelectedMailServer({
      id: "",
      name: "",
      host: "",
      port: 0,
      user: "",
      security: "",
    });
    setUpdateDialogOpen(false);
  };

  const columns = [
    { id: "name", header: "Name", accessorKey: "name" },
    { id: "host", header: "Host", accessorKey: "host" },
    { id: "port", header: "Port", accessorKey: "port" },
    { id: "user", header: "User", accessorKey: "user" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const mailServer = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => openUpdateDialog(mailServer)}>
                <Edit className="mr-2 h-4 w-4" />
                Update
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDelete(mailServer.id)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={mailServers} isLoading={isLoading} />
      <UpdateApiKeyDialog
        initialIsOpen={updateDialogOpen}
        onClose={closeUpdateDialog}
        selectedMailServerId={selectedMailServer.id}
        initialData={selectedMailServer || empty_mailServer}
        onUpdate={handleUpdate}
      />
    </>
  );
};

export default MailServerTable;
