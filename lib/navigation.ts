import {
  Bot,
  HelpCircle,
  Home,
  Phone,
  Settings,
  PhoneCall,
  type LucideIcon,
  CreditCard,
  FileUp,
  RefreshCw,
  ServerCog,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const mainNavItems: NavItem[] = [
  { title: "Home", href: "/", icon: Home },
  { title: "Agents", href: "/agents", icon: Bot },
  { title: "Phone Numbers", href: "/phone-numbers", icon: Phone },
  { title: "Setup", href: "/setup", icon: ServerCog },
  { title: "Call Logs", href: "/call-logs", icon: PhoneCall },
  { title: "Lead reactivation", href: "/lead-reactivation", icon: RefreshCw },
  { title: "Billing & Resources", href: "/billing", icon: CreditCard },
  { title: "upload csv", href: "/upload-csv", icon: FileUp },
];

export const footerNavItems: NavItem[] = [
  { title: "How It Works", href: "/how-it-works", icon: HelpCircle },
  { title: "Settings", href: "/settings", icon: Settings },
];
