import React, { useEffect, useState } from "react";
import { Edit, MoreHorizontal, Trash, Mail } from "lucide-react";
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

import UpdateMailServerDialog from "./update-server-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  const [testDialogOpen, setTestDialogOpen] = useState<boolean>(false);
  const [testMailServer, setTestMailServer] = useState<MailServer | null>(null);

  useEffect(() => {
    setMailServers(initialMailServers);
    setIsLoading(initialIsLoading);
  }, [initialMailServers, initialIsLoading]);

  const handleDelete = async (id: string) => {
    try {
      await deleteServer(id);
      setMailServers((prevKeys) => prevKeys.filter((key) => key.id !== id));
      toast.success("Mail Server has been deleted.");
    } catch (error) {
      toast.error("Error deleting Mail Server: " + error);
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
              <DropdownMenuItem onClick={() => {
                setTestMailServer(mailServer);
                setTestDialogOpen(true);
              }}>
                <Mail className="mr-2 h-4 w-4" />
                Send Test Email
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
      <UpdateMailServerDialog
        initialIsOpen={updateDialogOpen}
        onClose={closeUpdateDialog}
        selectedMailServerId={selectedMailServer.id}
        initialData={selectedMailServer || empty_mailServer}
        onUpdate={handleUpdate}
      />
      <TestEmailDialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} mailServer={testMailServer} />
    </>
  );
};

function TestEmailDialog({ open, onClose, mailServer }: { open: boolean; onClose: () => void; mailServer: MailServer | null }) {
  const [recipient, setRecipient] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!recipient || !mailServer) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/send-email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mailServerId: mailServer.id, recipient }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Test email sent successfully");
        onClose();
      } else {
        toast.error(data.error || "Failed to send test email");
      }
    } catch (error) {
      toast.error("Failed to send test email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Recipient Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              disabled={isSending}
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSend} disabled={isSending || !recipient}>
            {isSending ? "Sending..." : "Send Test Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MailServerTable;
