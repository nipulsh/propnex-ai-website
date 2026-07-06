import { HomePageContent } from "@/components/home/home-page-content";
import { requirePageAccess } from "@/lib/auth/require-page-permission";

export default async function DashboardHomePage() {
  await requirePageAccess("/dashboard");
  return <HomePageContent />;
}
