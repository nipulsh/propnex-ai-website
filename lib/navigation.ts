import {
  Bot,
  HelpCircle,
  Home,
  Phone,
  Settings,
  PhoneCall,
  Star,
  type LucideIcon,
  CreditCard,
  FileUp,
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
  { title: "Call Logs", href: "/call-logs", icon: PhoneCall },
  { title: "Reviews", href: "/reviews", icon: Star },
  { title: "billing", href: "/billing", icon: CreditCard },
  { title: "upload csv", href: "/upload-csv", icon: FileUp },
];

export const footerNavItems: NavItem[] = [
  { title: "How It Works", href: "/how-it-works", icon: HelpCircle },
  { title: "Settings", href: "/settings", icon: Settings },
];
