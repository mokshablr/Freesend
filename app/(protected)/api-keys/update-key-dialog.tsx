import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { updateApiKeyName } from "@/lib/api-key";
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

interface UpdateApiKeyDialogProps {
  initialIsOpen: boolean;
  onClose: () => void;
  selectedApiKeyId?: string;
  initialName: string;
  onUpdate: (id: string, newName: string) => Promise<void>;
}

export default function UpdateApiKeyDialog({
  initialIsOpen,
  onClose,
  selectedApiKeyId,
  initialName,
  onUpdate,
}: UpdateApiKeyDialogProps) {
  const [name, setName] = useState(initialName);
  const [isOpen, setIsOpen] = useState(initialIsOpen);

  useEffect(() => {
    setName(initialName);
    setIsOpen(initialIsOpen);
  }, [initialName]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const newName = name;

    try {
      if (!selectedApiKeyId) {
        toast.error("Could not find required API Key");
      } else {
        await onUpdate(selectedApiKeyId, newName);
        setIsOpen(false);
        onClose();
        setName("");
      }
    } catch (error) {
      toast.error("Error updating API Key: " + error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update API Key</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
