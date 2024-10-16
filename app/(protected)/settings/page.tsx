import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getTenant } from "@/lib/user";
import { constructMetadata } from "@/lib/utils";
import { DeleteAccountSection } from "@/components/dashboard/delete-account";
import { DashboardHeader } from "@/components/dashboard/header";
import { TenantNameForm } from "@/components/forms/tenant-name-form";
import { UserNameForm } from "@/components/forms/user-name-form";
import { UserRoleForm } from "@/components/forms/user-role-form";

export const metadata = constructMetadata({
  title: "Settings – SaaS Starter",
  description: "Configure your account and website settings.",
});

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const tenant = await getTenant(user);
  if (!user?.id) redirect("/login");

  if (!user.isActive) {
    redirect("/inactive");
  }

  return (
    <>
      <DashboardHeader
        heading="Settings"
        text="Manage account and website settings."
      />
      <div className="divide-y divide-muted pb-10">
        <UserNameForm user={{ id: user.id, name: user.name || "" }} />
        {user.role === "ADMIN" && (
          <TenantNameForm
            tenant={{ id: tenant?.id || "", name: tenant?.name || "" }}
          />
        )}
        <DeleteAccountSection />
      </div>
    </>
  );
}
