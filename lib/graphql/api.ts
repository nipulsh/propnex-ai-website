import { gqlRequest } from "@/lib/graphql/client";
import {
  BILLING_PAGE_QUERY,
  CALL_LOGS_PAGE_QUERY,
  CREDITS_SUMMARY_QUERY,
  HOME_DASHBOARD_QUERY,
  type BillingPageResult,
  type CallLogsPageResult,
  type CreditsSummaryResult,
  type HomeDashboardResult,
} from "@/lib/graphql/queries";

export async function fetchCreditsSummary() {
  return gqlRequest<CreditsSummaryResult>(CREDITS_SUMMARY_QUERY);
}

export async function fetchBillingPage(after?: string) {
  return gqlRequest<BillingPageResult>(BILLING_PAGE_QUERY, { after });
}

export async function fetchCallLogsPage(
  after?: string,
  filter?: Record<string, unknown>,
) {
  return gqlRequest<CallLogsPageResult>(CALL_LOGS_PAGE_QUERY, {
    after,
    filter,
  });
}

export async function fetchHomeDashboard() {
  return gqlRequest<HomeDashboardResult>(HOME_DASHBOARD_QUERY);
}
