export const UPLOADED_CONTACTS_LIST_QUERY = `
  query UploadedContactsList {
    uploadedContacts {
      list {
        id
        phone
        createdAt
      }
    }
  }
`;

export const CREATE_UPLOADED_CONTACT_MUTATION = `
  mutation CreateUploadedContact($phone: String!) {
    uploadedContacts {
      create(phone: $phone) {
        id
        phone
        createdAt
      }
    }
  }
`;

export const IMPORT_UPLOADED_CONTACTS_MUTATION = `
  mutation ImportUploadedContacts($phones: [String!]!) {
    uploadedContacts {
      importPhones(phones: $phones) {
        created
        skipped
        invalid
      }
    }
  }
`;

export const DELETE_UPLOADED_CONTACT_MUTATION = `
  mutation DeleteUploadedContact($id: ID!) {
    uploadedContacts {
      delete(id: $id)
    }
  }
`;

export const BULK_DELETE_UPLOADED_CONTACTS_MUTATION = `
  mutation BulkDeleteUploadedContacts($ids: [ID!]!) {
    uploadedContacts {
      bulkDelete(ids: $ids)
    }
  }
`;

export type UploadedContactResult = {
  id: string;
  phone: string;
  createdAt: string;
};

export type UploadedContactsListResult = {
  uploadedContacts: {
    list: UploadedContactResult[];
  };
};

export type UploadedContactImportResult = {
  uploadedContacts: {
    importPhones: {
      created: number;
      skipped: number;
      invalid: number;
    };
  };
};
