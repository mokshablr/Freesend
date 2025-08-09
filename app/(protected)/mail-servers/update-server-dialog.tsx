import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Icons } from "@/components/shared/icons";

interface UpdateMailServerDialogProps {
  initialIsOpen: boolean;
  onClose: () => void;
  selectedMailServerId: string;
  initialData: {
    name: string;
    host: string;
    port: number;
    security: string;
    user: string;
  };
  onUpdate: (
    id: string,
    newData: {
      name?: string;
      host?: string;
      port?: number;
      security?: string;
      user?: string;
      pass?: string;
    },
  ) => Promise<void>;
}

export default function UpdateMailServerDialog({
  initialIsOpen,
  onClose,
  selectedMailServerId,
  initialData,
  onUpdate,
}: UpdateMailServerDialogProps) {
  const [name, setName] = useState<string>(initialData.name);
  const [host, setHost] = useState<string>(initialData.host);
  const [port, setPort] = useState<number>(initialData.port);
  const [security, setSecurity] = useState<string>(initialData.security);
  const [user, setUser] = useState<string>(initialData.user);
  const [pass, setPass] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(initialIsOpen);

  useEffect(() => {
    setName(initialData.name);
    setHost(initialData.host);
    setPort(initialData.port);
    setSecurity(initialData.security);
    setUser(initialData.user);
    setPass("");
    setIsOpen(initialIsOpen);
  }, [initialData, initialIsOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      if (!selectedMailServerId) {
        toast.error("Could not find required mail server");
      } else {
        const updateData: {
          name?: string;
          host?: string;
          port?: number;
          security?: string;
          user?: string;
          pass?: string;
        } = {
          name: name,
          host: host,
          port: port,
          security: security,
          user: user,
        };
        if (pass && pass.trim().length > 0) {
          updateData.pass = pass;
        }
        await onUpdate(selectedMailServerId, updateData);
        onClose();
      }
    } catch (error) {
      toast.error("Error updating Mail Server: " + error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        onClose();
      }
    }}>
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
                  className="mt-1"
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
                  onChange={(e) => setPort(parseInt(e.target.value, 10))}
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
                <div className="relative mt-1">
                  <Input
                    id="pass"
                    placeholder="Enter new password (optional)"
                    type={showPassword ? "text" : "password"}
                    className="pr-10"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Icons.eyeOff className="h-4 w-4" />
                    ) : (
                      <Icons.eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
