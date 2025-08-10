import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getTenant } from "@/lib/user";
import { constructMetadata } from "@/lib/utils";
import { DeleteAccountSection } from "@/components/dashboard/delete-account";
import { TenantNameForm } from "@/components/forms/tenant-name-form";
import { UserRoleForm } from "@/components/forms/user-role-form";
import { SettingsWrapper } from "../settings-wrapper";
import { Icons } from "@/components/shared/icons";

export const metadata = constructMetadata({
  title: "Account Settings – Freesend",
  description: "Manage your account settings and organization.",
});

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const tenant = await getTenant(user);
  if (!user?.id) redirect("/login");

  if (!user.isActive) {
    redirect("/inactive");
  }

  return (
    <div>
      <div className="mx-auto max-w-7xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          <Icons.settings className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-slate-12 text-2xl font-semibold leading-tight tracking-tight">
            Account
          </h1>
        </div>
        <div className="mt-2 h-px bg-border"></div>
      </div>
      <div className="mx-auto max-w-7xl px-6">
        <SettingsWrapper>
          <div className="divide-y divide-muted pb-10">
            {user.role === "ADMIN" && (
              <TenantNameForm
                tenant={{ id: tenant?.id || "", name: tenant?.name || "" }}
              />
            )}
            <DeleteAccountSection />
          </div>
        </SettingsWrapper>
      </div>
    </div>
  );
}
