export type BranchStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type ViewerRoleResult = {
  viewer: { id: string; role: string; permissions: string[] };
};

export const VIEWER_ROLE_QUERY = `
  query ViewerRole {
    viewer {
      id
      role
      permissions
    }
  }
`;

export type BranchNode = {
  id: string;
  name: string;
  status: BranchStatus;
  address: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  customFields: Record<string, unknown> | null;
  aiEnabled: boolean;
  systemPrompt: string | null;
  aiConfig: Record<string, unknown> | null;
  contactsCount: number;
  callLogsCount: number;
  documentsCount: number;
  agentsCount: number;
  lastActivityAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BranchesConnectionResult = {
  branches: {
    connection: {
      edges: { node: BranchNode; cursor: string }[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      totalCount: number;
    };
  };
};

export type BranchContactNode = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  temperature: string | null;
  createdAt: string | null;
};

export type BranchCallLogNode = {
  id: string;
  direction: string;
  status: string;
  durationSeconds: number;
  startedAt: string;
};

export type BranchDocumentNode = {
  id: string;
  name: string;
  url: string;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
};

export type BranchActivityNode = {
  id: string;
  type: string;
  summary: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type BranchAgentNode = {
  id: string;
  name: string;
  type: string;
  category: string | null;
  status: string;
  environment: string;
  enabled: boolean;
  demoAudioUrl: string | null;
  branchId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BranchDetailResult = {
  branches: {
    byId: BranchNode | null;
    activities: BranchActivityNode[];
  };
};

const BRANCH_FIELDS = `
  id
  name
  status
  address
  phone
  email
  notes
  customFields
  aiEnabled
  systemPrompt
  aiConfig
  contactsCount
  callLogsCount
  documentsCount
  agentsCount
  lastActivityAt
  createdAt
  updatedAt
`;

export const BRANCHES_PAGE_QUERY = `
  query BranchesPage($first: Int, $after: String, $filter: BranchFilter) {
    branches {
      connection(first: $first, after: $after, filter: $filter) {
        edges {
          node {${BRANCH_FIELDS}}
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
        totalCount
      }
    }
  }
`;

export const BRANCH_DETAIL_QUERY = `
  query BranchDetail($id: ID!) {
    branches {
      byId(id: $id) {${BRANCH_FIELDS}}
      activities(branchId: $id, limit: 50) {
        id
        type
        summary
        metadata
        createdAt
      }
    }
  }
`;

export const BRANCH_CONTACTS_QUERY = `
  query BranchContacts($branchId: ID!, $first: Int, $after: String) {
    branches {
      contacts(branchId: $branchId, first: $first, after: $after) {
        id
        firstName
        lastName
        email
        phone
        temperature
        createdAt
      }
    }
  }
`;

export const BRANCH_CALL_LOGS_QUERY = `
  query BranchCallLogs($branchId: ID!, $first: Int, $after: String) {
    branches {
      callLogs(branchId: $branchId, first: $first, after: $after) {
        id
        direction
        status
        durationSeconds
        startedAt
      }
    }
  }
`;

export const BRANCH_DOCUMENTS_QUERY = `
  query BranchDocuments($branchId: ID!) {
    branches {
      documents(branchId: $branchId) {
        id
        name
        url
        mimeType
        sizeBytes
        createdAt
      }
    }
  }
`;

export const BRANCH_AGENTS_QUERY = `
  query BranchAgents($branchId: ID!) {
    branches {
      agents(branchId: $branchId) {
        id
        name
        type
        category
        status
        environment
        enabled
        demoAudioUrl
        branchId
        createdAt
        updatedAt
      }
    }
  }
`;

export const CREATE_BRANCH_MUTATION = `
  mutation CreateBranch($input: CreateBranchInput!) {
    branches {
      create(input: $input) {${BRANCH_FIELDS}}
    }
  }
`;

export const UPDATE_BRANCH_MUTATION = `
  mutation UpdateBranch($id: ID!, $input: UpdateBranchInput!) {
    branches {
      update(id: $id, input: $input) {${BRANCH_FIELDS}}
    }
  }
`;

export const UPDATE_BRANCH_AI_MUTATION = `
  mutation UpdateBranchAi($id: ID!, $input: UpdateBranchAiInput!) {
    branches {
      updateAi(id: $id, input: $input) {${BRANCH_FIELDS}}
    }
  }
`;

export const BULK_UPDATE_BRANCHES_MUTATION = `
  mutation BulkUpdateBranches($input: BulkBranchUpdateInput!) {
    branches {
      bulkUpdate(input: $input) {
        updated
      }
    }
  }
`;

export const ARCHIVE_BRANCH_MUTATION = `
  mutation ArchiveBranch($id: ID!) {
    branches {
      archive(id: $id) {${BRANCH_FIELDS}}
    }
  }
`;
