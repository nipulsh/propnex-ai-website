import { redirect } from "next/navigation";

import { ContractSignUp } from "@/components/onboarding/contract-sign-up";
import { hasPendingContractCookie } from "@/lib/pending-contract-cookie";

export default async function SignUpPage() {
  const hasPendingContract = await hasPendingContractCookie();
  if (!hasPendingContract) {
    redirect("/onboarding");
  }

  return <ContractSignUp />;
}
