import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { UserNameForm } from "@/components/forms/user-name-form";
import { SettingsWrapper } from "../settings-wrapper";
import { Icons } from "@/components/shared/icons";

export const metadata = constructMetadata({
  title: "Profile Settings – Freesend",
  description: "Manage your profile information and preferences.",
});

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  if (!user.isActive) {
    redirect("/inactive");
  }

  return (
    <div>
      <div className="mx-auto max-w-7xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          <Icons.user className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-slate-12 text-2xl font-semibold leading-tight tracking-tight">
            Profile
          </h1>
        </div>
        <div className="mt-2 h-px bg-border"></div>
      </div>
      <div className="mx-auto max-w-7xl px-6">
        <SettingsWrapper>
          <div className="divide-y divide-muted pb-10">
            <UserNameForm user={{ id: user.id, name: user.name || "" }} />
          </div>
        </SettingsWrapper>
      </div>
    </div>
  );
}
