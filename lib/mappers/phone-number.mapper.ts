import type { PhoneNumber } from "@/lib/phone-numbers-data";
import type { TelephonyProvider } from "@/lib/setup-data";

type GraphQLPhoneNumber = {
  id: string;
  number: string;
  label?: string | null;
  provider: string;
  status: string;
  inboundAgentId?: string | null;
  outboundAgentId?: string | null;
  inboundAgent?: { id: string; name: string } | null;
  outboundAgent?: { id: string; name: string } | null;
  inboundCallsCount: number;
  outboundCallsCount: number;
  lastActivityAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export function mapGraphQLPhoneNumberToUI(row: GraphQLPhoneNumber): PhoneNumber {
  return {
    id: row.id,
    number: row.number,
    provider: row.provider.toLowerCase() as TelephonyProvider,
    inboundAgentId: row.inboundAgentId ?? "",
    inboundAgentName: row.inboundAgent?.name ?? "Unassigned",
    outboundAgentId: row.outboundAgentId ?? "",
    outboundAgentName: row.outboundAgent?.name ?? "Unassigned",
    status: row.status.toLowerCase() as PhoneNumber["status"],
    inboundCallsCount: row.inboundCallsCount,
    outboundCallsCount: row.outboundCallsCount,
    lastActivityAt: row.lastActivityAt
      ? new Date(row.lastActivityAt).getTime()
      : null,
    createdAt: new Date(row.createdAt).getTime(),
    updatedAt: new Date(row.updatedAt).getTime(),
    channelCount: 1,
  };
}

export function mapUIPhoneNumberToCreateInput(input: {
  number: string;
  provider: TelephonyProvider;
  inboundAgentId: string;
  outboundAgentId: string;
}) {
  return {
    number: input.number,
    provider: input.provider.toUpperCase(),
    inboundAgentId: input.inboundAgentId || undefined,
    outboundAgentId: input.outboundAgentId || undefined,
  };
}
