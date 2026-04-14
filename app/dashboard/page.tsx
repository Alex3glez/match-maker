import { redirect } from "next/navigation";
import { getProfile, getSupabaseClient } from "@/app/actions";

export default async function DashboardPage() {
  const supabase = await getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const profile = await getProfile();

  if (!profile) {
    // User is logged in but has no profile (or table is missing).
    // Send them to the profile page to complete setup.
    redirect("/profile");
  }

  if (profile.role === "recruiter") {
    redirect("/dashboard/recruiter");
  } else {
    redirect("/jobs");
  }
}


