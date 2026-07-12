import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { AlertCircle, CheckCircle, ShieldAlert, UserPlus, LogIn, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { backendFetch } from "@/lib/api/backend-client";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

type Params = Promise<{ token: string }>;

type PublicInvitation = {
  status: "not_found" | "pending" | "accepted" | "cancelled" | "expired";
  email?: string;
  branchName?: string;
  companyName?: string;
  expiresAt?: string;
};

async function fetchInvitation(token: string): Promise<PublicInvitation> {
  const res = await fetch(`${API_URL}/public/branch-invitations/${token}`, {
    cache: "no-store",
  });
  if (!res.ok) return { status: "not_found" };
  return res.json();
}

export default async function BranchInvitationPage(props: { params: Params }) {
  const { token } = await props.params;

  const invitation = await fetchInvitation(token);

  // Validate invitation
  if (invitation.status !== "pending") {
    let errorTitle = "Invalid Invitation";
    let errorDesc = "This invitation token is invalid, has been cancelled, or does not exist.";

    if (invitation.status === "accepted") {
      errorTitle = "Invitation Already Accepted";
      errorDesc = "This invitation has already been accepted and cannot be reused.";
    } else if (invitation.status === "cancelled") {
      errorTitle = "Invitation Cancelled";
      errorDesc = "This invitation has been cancelled by the administrator.";
    } else if (invitation.status === "expired") {
      errorTitle = "Invitation Expired";
      errorDesc = `This invitation expired on ${invitation.expiresAt ? new Date(invitation.expiresAt).toLocaleDateString() : "an earlier date"}. Please contact your administrator to generate a new invitation.`;
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-xl border border-destructive/30 bg-propnex-panel p-6 shadow-xl text-center">
          <ShieldAlert className="mx-auto size-12 text-destructive mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-2">{errorTitle}</h1>
          <p className="text-sm text-propnex-muted mb-6">{errorDesc}</p>
          <Link href="/" className="inline-flex w-full">
            <Button variant="outline" className="w-full h-11 border-propnex-border">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check authentication status
  const { userId } = await auth();

  if (!userId) {
    // Visitor is not logged in - show welcome landing card
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-xl border border-propnex-border bg-propnex-panel p-6 shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center size-14 rounded-full bg-propnex-accent/10 border border-propnex-accent/30 text-propnex-accent mb-4">
              <UserPlus className="size-7" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              You're Invited
            </h1>
            <p className="text-sm text-propnex-muted mt-2">
              To manage the <strong className="text-foreground">{invitation.branchName}</strong> branch in {invitation.companyName} (PropNex AI)
            </p>
          </div>

          <div className="rounded-lg bg-propnex-bg/50 border border-propnex-border p-4 mb-6 text-sm">
            <p className="text-propnex-muted">
              This invitation is valid only for the email address:
            </p>
            <p className="font-semibold text-foreground mt-1 text-center select-all">
              {invitation.email}
            </p>
          </div>

          <div className="space-y-3">
            <Link href={`/sign-in?redirect_url=/invitations/branch/${token}`} className="flex w-full">
              <Button className="w-full h-11 justify-between text-base">
                Log In to Accept <LogIn className="size-5 ml-2" />
              </Button>
            </Link>
            <Link href={`/sign-up?redirect_url=/invitations/branch/${token}`} className="flex w-full">
              <Button variant="outline" className="w-full h-11 border-propnex-border justify-between text-base">
                Create Account <ArrowRight className="size-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated - verify email
  const clerkUser = await currentUser();
  const userEmail = clerkUser?.emailAddresses[0]?.emailAddress;

  if (!userEmail || userEmail.toLowerCase() !== invitation.email?.toLowerCase()) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-xl border border-destructive/30 bg-propnex-panel p-6 shadow-xl">
          <AlertCircle className="mx-auto size-12 text-destructive mb-4 text-center" />
          <h1 className="text-xl font-semibold text-foreground mb-2 text-center">Email Mismatch</h1>
          <p className="text-sm text-propnex-muted text-center mb-6">
            This invitation was sent to <strong className="text-foreground">{invitation.email}</strong>, but you are logged in as <strong className="text-foreground">{userEmail || "unknown"}</strong>.
          </p>
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 mb-6 text-xs text-destructive text-center">
            Please log out and sign in with the email address that received the invitation.
          </div>
          <div className="flex gap-3">
            <Link href={`/sign-in?redirect_url=/invitations/branch/${token}`} className="flex-1">
              <Button className="w-full h-11">
                Switch Account
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full h-11 border-propnex-border">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated & email matches - show accept screen
  async function acceptInvitation() {
    "use server";

    const res = await backendFetch(`/public/branch-invitations/${token}/accept`, {
      method: "POST",
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? "Unable to accept invitation");
    }

    redirect("/dashboard?branch_invite_accepted=true");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-xl border border-propnex-border bg-propnex-panel p-6 shadow-xl text-center">
        <div className="inline-flex items-center justify-center size-14 rounded-full bg-success/10 border border-success/30 text-success mb-4">
          <CheckCircle className="size-7" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Accept Invitation
        </h1>
        <p className="text-sm text-propnex-muted mt-2">
          Join <strong className="text-foreground">{invitation.companyName}</strong> as the administrator for the <strong className="text-foreground">{invitation.branchName}</strong> branch.
        </p>

        <div className="rounded-lg bg-propnex-bg/50 border border-propnex-border p-4 my-6 text-sm">
          <span className="text-xs font-semibold tracking-wider text-propnex-muted uppercase block">
            Signing in as
          </span>
          <span className="font-semibold text-foreground text-base block mt-1">
            {userEmail}
          </span>
        </div>

        <form action={acceptInvitation}>
          <Button type="submit" className="w-full h-11 text-base">
            Accept and Go to Dashboard <ArrowRight className="size-5 ml-2" />
          </Button>
        </form>
      </div>
    </div>
  );
}
