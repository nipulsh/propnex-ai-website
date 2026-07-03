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
