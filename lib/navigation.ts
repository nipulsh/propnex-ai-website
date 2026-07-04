import {
  Bot,
  Building2,
  HelpCircle,
  Home,
  Phone,
  Settings,
  PhoneCall,
  Users,
  type LucideIcon,
  CreditCard,
  RefreshCw,
  ServerCog,
  Wrench,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
};

export const mainNavItems: NavItem[] = [
  { title: "Home", href: "/dashboard", icon: Home },
  { title: "Branches", href: "/branches", icon: Building2 },
  {
    title: "Employees",
    href: "/employees",
    icon: Users,
    permission: "employees:read",
  },
  { title: "Agents", href: "/agents", icon: Bot },
  { title: "Setup", href: "/setup", icon: ServerCog },
  { title: "Phone Numbers", href: "/phone-numbers", icon: Phone },
  { title: "Call Logs", href: "/call-logs", icon: PhoneCall },
  { title: "Lead Reactivation", href: "/lead-reactivation", icon: RefreshCw },
  { title: "Billing", href: "/billing", icon: CreditCard },
  { title: "Tools", href: "/tools", icon: Wrench },
];

export const footerNavItems: NavItem[] = [
  { title: "How It Works", href: "/how-it-works", icon: HelpCircle },
  { title: "Settings", href: "/settings", icon: Settings },
];

export type NavBackLink = {
  href: string;
  label: string;
};

const NAV_BACK_ROUTES: { pattern: RegExp; href: string; label: string }[] = [
  {
    pattern: /^\/agents\/library\/[^/]+\/deploy$/,
    href: "/agents/library",
    label: "Back to Library",
  },
  {
    pattern: /^\/agents\/library\/[^/]+$/,
    href: "/agents/library",
    label: "Back to Library",
  },
  {
    pattern: /^\/agents\/library$/,
    href: "/agents",
    label: "Back to Agents",
  },
  {
    pattern: /^\/agents\/create$/,
    href: "/agents",
    label: "Back to Agents",
  },
  {
    pattern: /^\/agents\/[^/]+\/edit$/,
    href: "/agents",
    label: "Back to Agents",
  },
  {
    pattern: /^\/agents\/[^/]+$/,
    href: "/agents",
    label: "Back to Agents",
  },
  {
    pattern: /^\/branches\/[^/]+$/,
    href: "/branches",
    label: "Back to Branches",
  },
  {
    pattern: /^\/employees\/[^/]+$/,
    href: "/employees",
    label: "Back to Employees",
  },
  {
    pattern: /^\/phone-numbers\/[^/]+$/,
    href: "/phone-numbers",
    label: "Back to Phone Numbers",
  },
  {
    pattern: /^\/call-logs\/[^/]+$/,
    href: "/call-logs",
    label: "Back to Call Logs",
  },
  {
    pattern: /^\/contact$/,
    href: "/billing",
    label: "Back to Billing",
  },
];

export function getNavBackLink(pathname: string): NavBackLink | null {
  for (const route of NAV_BACK_ROUTES) {
    if (route.pattern.test(pathname)) {
      return { href: route.href, label: route.label };
    }
  }
  return null;
}
