import { gqlRequest } from "@/lib/graphql/client";
import {
  AGENT_DETAIL_PAGE_QUERY,
  AGENT_DETAIL_QUERY,
  AGENT_LIBRARY_BY_SLUG_QUERY,
  AGENT_LIBRARY_LIST_QUERY,
  AGENTS_LIST_QUERY,
  BILLING_PAGE_QUERY,
  CALL_DETAIL_QUERY,
  CALL_LOGS_PAGE_QUERY,
  CREATE_AGENT_MUTATION,
  CREATE_PHONE_NUMBER_MUTATION,
  CREDITS_SUMMARY_QUERY,
  HOME_PAGE_QUERY,
  LEADS_REACTIVATION_QUERY,
  IMPORT_LEADS_MUTATION,
  PHONE_NUMBER_DETAIL_QUERY,
  PHONE_NUMBERS_PAGE_QUERY,
  SETTINGS_PAGE_QUERY,
  SETUP_PAGE_QUERY,
  UPLOADED_CONTACTS_LIST_QUERY,
  CREATE_UPLOADED_CONTACT_MUTATION,
  IMPORT_UPLOADED_CONTACTS_MUTATION,
  DELETE_UPLOADED_CONTACT_MUTATION,
  BULK_DELETE_UPLOADED_CONTACTS_MUTATION,
  UPDATE_AGENT_MUTATION,
  UPDATE_PHONE_NUMBER_MUTATION,
  type BillingPageResult,
  type CallLogsPageResult,
  type CreditsSummaryResult,
  type HomePageResult,
  type LeadImportResult,
  type LeadsReactivationResult,
  type SettingsPageResult,
  type SetupPageResult,
  type UploadedContactsListResult,
  type UploadedContactImportResult,
  type ImportedContactInput,
  type AgentLibraryBySlugResult,
  type AgentLibraryListResult,
} from "@/lib/graphql/queries";

export async function fetchCreditsSummary() {
  return gqlRequest<CreditsSummaryResult>(CREDITS_SUMMARY_QUERY);
}

export async function fetchHomePage() {
  return gqlRequest<HomePageResult>(HOME_PAGE_QUERY);
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

export async function fetchAgentsList() {
  return gqlRequest<{
    agents: {
      statusSummary: { active: number; inactive: number; total: number };
      list: Record<string, unknown>[];
    };
  }>(AGENTS_LIST_QUERY);
}

export async function fetchAgentLibraryList() {
  return gqlRequest<AgentLibraryListResult>(AGENT_LIBRARY_LIST_QUERY);
}

export async function fetchAgentLibraryBySlug(slug: string) {
  return gqlRequest<AgentLibraryBySlugResult>(AGENT_LIBRARY_BY_SLUG_QUERY, {
    slug,
  });
}

export async function fetchAgentDetail(id: string) {
  return gqlRequest<{
    agents: { byId: Record<string, unknown> | null };
  }>(AGENT_DETAIL_QUERY, { id });
}

export async function fetchAgentDetailPage(id: string) {
  return gqlRequest<{
    agents: { byId: Record<string, unknown> | null };
    phoneNumbers: { list: Record<string, unknown>[] };
    callLogs: {
      connection: {
        edges: {
          node: Record<string, unknown>;
        }[];
      };
    };
  }>(AGENT_DETAIL_PAGE_QUERY, { id });
}

export async function createAgent(input: Record<string, unknown>) {
  return gqlRequest<{
    agents: { create: Record<string, unknown> };
  }>(CREATE_AGENT_MUTATION, { input });
}

export async function updateAgent(id: string, input: Record<string, unknown>) {
  return gqlRequest<{
    agents: { update: Record<string, unknown> };
  }>(UPDATE_AGENT_MUTATION, { id, input });
}

export async function fetchPhoneNumbersPage() {
  return gqlRequest<{
    phoneNumbers: { list: Record<string, unknown>[] };
  }>(PHONE_NUMBERS_PAGE_QUERY);
}

export async function fetchPhoneNumberDetail(id: string, after?: string) {
  return gqlRequest<{
    phoneNumbers: { byId: Record<string, unknown> | null };
    callLogs: {
      connection: {
        edges: { node: Record<string, unknown>; cursor: string }[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    };
  }>(PHONE_NUMBER_DETAIL_QUERY, { id, after });
}

export async function createPhoneNumber(input: Record<string, unknown>) {
  return gqlRequest<{
    phoneNumbers: { create: Record<string, unknown> };
  }>(CREATE_PHONE_NUMBER_MUTATION, { input });
}

export async function updatePhoneNumber(
  id: string,
  input: Record<string, unknown>,
) {
  return gqlRequest<{
    phoneNumbers: { update: Record<string, unknown> };
  }>(UPDATE_PHONE_NUMBER_MUTATION, { id, input });
}

export async function fetchCallDetail(id: string) {
  return gqlRequest<{
    callLogs: { detail: Record<string, unknown> | null };
  }>(CALL_DETAIL_QUERY, { id });
}

export async function fetchLeadsReactivation(
  filter?: Record<string, unknown>,
  after?: string,
) {
  return gqlRequest<LeadsReactivationResult>(LEADS_REACTIVATION_QUERY, {
    filter,
    after,
  });
}

export async function importLeads(
  rows: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone: string;
    temperature: string;
  }[],
) {
  return gqlRequest<LeadImportResult>(IMPORT_LEADS_MUTATION, { rows });
}

export async function fetchSetupPage() {
  return gqlRequest<SetupPageResult>(SETUP_PAGE_QUERY);
}

export async function fetchSettingsPage() {
  return gqlRequest<SettingsPageResult>(SETTINGS_PAGE_QUERY);
}

export async function fetchUploadedContacts() {
  return gqlRequest<UploadedContactsListResult>(UPLOADED_CONTACTS_LIST_QUERY);
}

export async function createUploadedContact(phone: string) {
  return gqlRequest<{
    uploadedContacts: {
      create: { id: string; phone: string; createdAt: string };
    };
  }>(CREATE_UPLOADED_CONTACT_MUTATION, { phone });
}

export async function importUploadedContacts(
  contacts: ImportedContactInput[],
) {
  return gqlRequest<UploadedContactImportResult>(
    IMPORT_UPLOADED_CONTACTS_MUTATION,
    { contacts },
  );
}

export async function deleteUploadedContact(id: string) {
  return gqlRequest<{
    uploadedContacts: { delete: boolean };
  }>(DELETE_UPLOADED_CONTACT_MUTATION, { id });
}

export async function bulkDeleteUploadedContacts(ids: string[]) {
  return gqlRequest<{
    uploadedContacts: { bulkDelete: number };
  }>(BULK_DELETE_UPLOADED_CONTACTS_MUTATION, { ids });
}

/** @deprecated Use fetchHomePage */
export const fetchHomeDashboard = fetchHomePage;

/** @deprecated Use fetchAgentsList */
export const fetchAgentsPage = fetchAgentsList;
