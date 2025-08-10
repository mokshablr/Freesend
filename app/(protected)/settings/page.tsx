import { redirect } from "next/navigation";

export const metadata = {
  title: "Settings",
  description: "Settings page"
};

export default function SettingsPage() {
  // Redirect to the new profile page
  redirect("/settings/profile");
}
