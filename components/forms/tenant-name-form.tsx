"use client";

import { useState, useTransition } from "react";
import { updateTenantName, type FormData } from "@/actions/update-tenant";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tenant } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { tenantNameSchema } from "@/lib/validations/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionColumns } from "@/components/dashboard/section-columns";
import { Icons } from "@/components/shared/icons";

interface TenantNameFormProps {
  tenant: Pick<Tenant, "id" | "name">;
}

export function TenantNameForm({ tenant }: TenantNameFormProps) {
  const { update } = useSession();
  const [updated, setUpdated] = useState(false);
  const [isPending, startTransition] = useTransition();
  const updateTenantNameWithId = updateTenantName.bind(null, tenant.id);

  const checkUpdate = (value) => {
    setUpdated(tenant.name !== value);
  };

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(tenantNameSchema),
    defaultValues: {
      name: tenant?.name || "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const { status } = await updateTenantNameWithId(data);

      if (status !== "success") {
        toast.error("Something went wrong.", {
          description: "Your company name was not updated. Please try again.",
        });
      } else {
        await update();
        setUpdated(false);
        toast.success("Your company name has been updated.");
      }
    });
  });

  return (
    <form onSubmit={onSubmit}>
      <SectionColumns
        title="Your Company Name"
        description="Please enter your organization name."
      >
        <div className="flex w-full items-center gap-2">
          <Label className="sr-only" htmlFor="name">
            Company Name
          </Label>
          <Input
            id="name"
            className="flex-1"
            size={32}
            {...register("name")}
            onChange={(e) => checkUpdate(e.target.value)}
          />
          <Button
            type="submit"
            variant={updated ? "default" : "disable"}
            disabled={isPending || !updated}
            className="w-[67px] shrink-0 px-0 sm:w-[130px]"
          >
            {isPending ? (
              <Icons.spinner className="size-4 animate-spin" />
            ) : (
              <p>
                Save
                <span className="hidden sm:inline-flex">&nbsp;Changes</span>
              </p>
            )}
          </Button>
        </div>
        <div className="flex flex-col justify-between p-1">
          {errors?.name && (
            <p className="pb-0.5 text-[13px] text-red-600">
              {errors.name.message}
            </p>
          )}
          <p className="text-[13px] text-muted-foreground">Max 32 characters</p>
        </div>
      </SectionColumns>
    </form>
  );
}