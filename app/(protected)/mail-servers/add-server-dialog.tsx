"use client";

import React, { useState } from "react";
import { toast } from "sonner";

import { createServer } from "@/lib/smtp-config";
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

type CreateMailServerDialogProps = {
  onMailServerCreated: () => void; // Add a prop to handle refreshing the keys
};

export default function CreateMailServerDialog({
  onMailServerCreated,
}: CreateMailServerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("587");
  const [security, setSecurity] = useState("None");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const data = {
      name,
      host,
      port: parseInt(port, 10),
      security,
      user,
      pass,
      //   status:"Active"
    };

    try {
      const result = await createServer(data);
      toast.success("Your data has been updated.");
      setIsOpen(false);
      onMailServerCreated();
      // Optionally, close the dialog or show a success message
    } catch (error) {
      toast.error("Error creating server:", {
        description: "Error: " + error,
      });
    }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsOpen(true)}>Add Mail Server</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter mail server details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 items-center">
                <div>
                  <Label htmlFor="name" className="text-left">
                    Name your server
                  </Label>
                  <Input
                    id="name"
                    placeholder="eg: My cPanel"
                    className="mt-1"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 items-center gap-4">
                <div>
                  <Label htmlFor="host" className="text-left">
                    Host
                  </Label>
                  <Input
                    id="host"
                    placeholder="eg: smtp.example.com"
                    className="mt-1"
                    required
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="port" className="text-left">
                    Port
                  </Label>
                  <Input
                    id="port"
                    defaultValue="587"
                    className="mt-1"
                    required
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 items-center">
                <div>
                  <Label htmlFor="security" className="text-left">
                    Secure connection
                  </Label>
                </div>
                <div className="mt-1">
                  <Select
                    value={security}
                    onValueChange={(value) => setSecurity(value)}
                    required
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TLS">TLS</SelectItem>
                      <SelectItem value="SSL">SSL</SelectItem>
                      <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 items-center">
                <div>
                  <Label htmlFor="user" className="text-left">
                    Username
                  </Label>
                  <Input
                    id="user"
                    placeholder="eg: john.smith@example.com"
                    className="mt-1"
                    required
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 items-center">
                <div>
                  <Label htmlFor="pass" className="text-left">
                    Password
                  </Label>
                  <Input
                    id="pass"
                    placeholder=""
                    type="password"
                    className="mt-1"
                    required
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
