import { DashboardLayout } from "@/components/common/dashboard-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
