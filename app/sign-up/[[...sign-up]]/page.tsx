import { SignUp } from "@clerk/nextjs";

import { BrandLogo } from "@/components/common/brand-logo";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border px-6 py-4">
        <BrandLogo />
      </header>
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <SignUp forceRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}
