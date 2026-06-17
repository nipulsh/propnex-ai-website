import { PublicHeader } from "@/components/common/public-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <PublicHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
