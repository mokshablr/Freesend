"use client";

import React, { useEffect, useState } from "react";
import { DialogClose } from "@radix-ui/react-dialog";
import { toast } from "sonner";

import { createApiKey } from "@/lib/api-key";
import { getServersByTenant } from "@/lib/smtp-config";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CreateApiKeyDialogProps = {
  onApiKeyCreated: () => void; // Add a prop to handle refreshing the keys
};

type MailServers = {
  id: string;
  name: string;
  host: string;
  port: number;
  user: string;
};

export default function CreateApiKeyDialog({
  onApiKeyCreated,
}: CreateApiKeyDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [mailServers, setMailServers] = useState<MailServers[]>([]);
  const [selectedMailServer, setSelectedMailServer] = useState("");

  useEffect(() => {
    const fetchMailServers = async () => {
      try {
        const mailServers = await getServersByTenant();
        setMailServers(mailServers);
      } catch (error) {
        toast.error("Error fetching mail servers: " + error.message);
      }
    };

    fetchMailServers();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const data = {
      name: name,
      smtpConfigId: selectedMailServer,
    };

    try {
      await createApiKey(data); // Call your API function
      toast.success("Your API Key has been generated.");
      setIsOpen(false);

      // Call the prop function to refresh the data
      onApiKeyCreated();

      // Optionally, reset the form
      setName("");
    } catch (error) {
      toast.error("Error creating API Key: " + error);
    }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsOpen(true)}>Create API Key</Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add API Key</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 items-center">
                <div>
                  <Label htmlFor="name" className="text-left">
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Your API Key name"
                    className="mt-1"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 items-center">
                <div>
                  <Label htmlFor="mailServers" className="text-left">
                    Mail Servers
                  </Label>
                </div>
                <div className="mt-1">
                  <Select
                    value={selectedMailServer}
                    onValueChange={(value) => setSelectedMailServer(value)}
                    required
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a mail server" />
                    </SelectTrigger>
                    <SelectContent>
                      {mailServers.map((server) => (
                        <SelectItem key={server.id} value={server.id}>
                          {server.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add</Button>
              <DialogClose asChild>
                <Button variant={"outline"}>Close</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
