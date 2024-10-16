"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/shared/icons";

export default function Emails() {
  return (
    <>
      <title>Emails</title>
      <div>
        <h1 className="text-slate-12 text-[28px] font-bold leading-[34px] tracking-[-0.416px]">
          Emails
        </h1>
      </div>
      <div className="relative flex">
        <Input
          type="text"
          placeholder="Search..."
          className="relative bg-muted/50 pl-2 text-sm font-normal text-muted-foreground sm:pr-12 md:w-72"
        />
        <Button
          id="search"
          type="submit"
          variant={"secondary"}
          className="ml-2"
        >
          <>
            <Icons.search className="size-4" /> <span>Search</span>
          </>
        </Button>
      </div>
    </>
  );
}
