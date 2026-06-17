import type {
  CalendarOption,
  SheetRow,
  SpreadsheetOption,
  SyncHistoryEntry,
  WorksheetOption,
} from "./types";

export const MOCK_GOOGLE_ACCOUNT = "workspace@propnex.ai";

export const MOCK_SPREADSHEETS: SpreadsheetOption[] = [
  {
    id: "sheet-leads-001",
    name: "PropNex Leads 2026",
    modifiedAt: "2026-06-15T10:30:00Z",
  },
  {
    id: "sheet-crm-002",
    name: "Sales Pipeline",
    modifiedAt: "2026-06-10T14:20:00Z",
  },
  {
    id: "sheet-followup-003",
    name: "Follow-Up Tracker",
    modifiedAt: "2026-06-01T09:00:00Z",
  },
];

export const MOCK_WORKSHEETS: Record<string, WorksheetOption[]> = {
  "sheet-leads-001": [
    { id: "ws-1", name: "Active Leads", rowCount: 248 },
    { id: "ws-2", name: "Archived", rowCount: 89 },
  ],
  "sheet-crm-002": [
    { id: "ws-3", name: "Pipeline", rowCount: 156 },
    { id: "ws-4", name: "Closed Won", rowCount: 42 },
  ],
  "sheet-followup-003": [
    { id: "ws-5", name: "Scheduled", rowCount: 67 },
  ],
};

export const MOCK_SHEET_COLUMNS = [
  "Customer Name",
  "Phone Number",
  "Budget",
  "Lead Status",
  "Follow-Up Date",
  "Notes",
  "Call Outcome",
  "AI Summary",
  "Lead Score",
  "Temperature",
];

export const MOCK_SHEET_ROWS: SheetRow[] = [
  {
    "Customer Name": "Priya Sharma",
    "Phone Number": "+919876543210",
    Budget: "₹50L - ₹75L",
    "Lead Status": "Hot",
    "Follow-Up Date": "2026-06-20",
    Notes: "Interested in 3BHK in Whitefield",
    "Call Outcome": "Qualified",
    "AI Summary": "Discussed budget and location preferences",
    "Lead Score": "85",
    Temperature: "Hot",
  },
  {
    "Customer Name": "Rahul Mehta",
    "Phone Number": "+919123456789",
    Budget: "₹1Cr+",
    "Lead Status": "Warm",
    "Follow-Up Date": "2026-06-22",
    Notes: "Requested site visit",
    "Call Outcome": "Follow-up scheduled",
    "AI Summary": "Wants premium properties in Indiranagar",
    "Lead Score": "72",
    Temperature: "Warm",
  },
  {
    "Customer Name": "Anita Desai",
    "Phone Number": "+919988776655",
    Budget: "₹30L - ₹40L",
    "Lead Status": "Cold",
    "Follow-Up Date": "2026-07-01",
    Notes: "Not ready to buy yet",
    "Call Outcome": "Nurture",
    "AI Summary": "Planning purchase in 6 months",
    "Lead Score": "45",
    Temperature: "Cold",
  },
];

export const MOCK_CALENDARS: CalendarOption[] = [
  {
    id: "cal-primary",
    name: "PropNex Appointments",
    primary: true,
    timezone: "Asia/Kolkata",
  },
  {
    id: "cal-sales",
    name: "Sales Team Calendar",
    primary: false,
    timezone: "Asia/Kolkata",
  },
  {
    id: "cal-support",
    name: "Support Schedule",
    primary: false,
    timezone: "Asia/Kolkata",
  },
];

export const MOCK_SYNC_HISTORY: SyncHistoryEntry[] = [
  {
    id: "sync-1",
    startedAt: "2026-06-18T08:00:00Z",
    completedAt: "2026-06-18T08:00:12Z",
    result: "success",
    rowsSynced: 248,
    message: "All rows synced successfully",
  },
  {
    id: "sync-2",
    startedAt: "2026-06-17T08:00:00Z",
    completedAt: "2026-06-17T08:00:15Z",
    result: "success",
    rowsSynced: 245,
    message: "All rows synced successfully",
  },
  {
    id: "sync-3",
    startedAt: "2026-06-16T08:00:00Z",
    completedAt: "2026-06-16T08:00:18Z",
    result: "partial",
    rowsSynced: 240,
    message: "3 rows skipped due to invalid phone numbers",
  },
];

export type MockCalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  attendeeEmail?: string;
};

export const MOCK_CALENDAR_EVENTS: MockCalendarEvent[] = [
  {
    id: "evt-1",
    title: "Property Demo - Priya Sharma",
    start: "2026-06-20T10:00:00+05:30",
    end: "2026-06-20T10:30:00+05:30",
    attendeeEmail: "priya@example.com",
  },
  {
    id: "evt-2",
    title: "Site Visit - Rahul Mehta",
    start: "2026-06-22T15:00:00+05:30",
    end: "2026-06-22T16:00:00+05:30",
    attendeeEmail: "rahul@example.com",
  },
];
