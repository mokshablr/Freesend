import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({ value, onChange, placeholder = "Pick a date range", className }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={
            "relative h-10 bg-muted/50 pl-8 text-sm font-normal text-muted-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 justify-start text-left " +
            (className || "")
          }
          data-empty={!value?.from || !value?.to}
        >
          <CalendarIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform opacity-50" />
          {value?.from && value?.to ? (
            <span>
              {format(value.from, "MMM d, yyyy")} - {format(value.to, "MMM d, yyyy")}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col gap-2 p-4">
          <Calendar
            mode="range"
            selected={value}
            onSelect={(range) => {
              onChange?.(range);
              // Optionally close popover when both dates are picked
              if (range?.from && range?.to) setOpen(false);
            }}
            numberOfMonths={1}
          />
          {value?.from && value?.to && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange?.(undefined);
                setOpen(false);
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
} 