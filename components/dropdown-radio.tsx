import React, { useState } from 'react';
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

export function RadioDropdown ({ initialTriggerText, items }) {
  const [selectedItem, setSelectedItem] = useState(initialTriggerText);

  const handleSelect = (item) => {
    setSelectedItem(item);
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
            <Button variant={"outline"}>
                {selectedItem}
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {items.map((item, index) => (
            <DropdownMenuItem key={index} onSelect={() => handleSelect(item)}>
              {item}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
