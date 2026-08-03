declare module "lucide-react" {
  import * as React from "react";

  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  }

  export type LucideIcon = React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;

  export const Accessibility: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const Award: LucideIcon;
  export const Ban: LucideIcon;
  export const BarChart3: LucideIcon;
  export const Bell: LucideIcon;
  export const Building: LucideIcon;
  export const Check: LucideIcon;
  export const CheckCheck: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const CheckSquare: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Clock: LucideIcon;
  export const CreditCard: LucideIcon;
  export const Download: LucideIcon;
  export const Edit: LucideIcon;
  export const Edit2: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const Filter: LucideIcon;
  export const Gift: LucideIcon;
  export const Heart: LucideIcon;
  export const Instagram: LucideIcon;
  export const KeyRound: LucideIcon;
  export const LayoutDashboard: LucideIcon;
  export const Loader2: LucideIcon;
  export const Lock: LucideIcon;
  export const LogOut: LucideIcon;
  export const Mail: LucideIcon;
  export const MapPin: LucideIcon;
  export const Menu: LucideIcon;
  export const MessageCircle: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const Minus: LucideIcon;
  export const MoreVertical: LucideIcon;
  export const Package: LucideIcon;
  export const Palette: LucideIcon;
  export const Phone: LucideIcon;
  export const Plus: LucideIcon;
  export const Quote: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const Save: LucideIcon;
  export const Search: LucideIcon;
  export const Send: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const ShoppingBag: LucideIcon;
  export const ShoppingCart: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Square: LucideIcon;
  export const Star: LucideIcon;
  export const Trash2: LucideIcon;
  export const TrendingDown: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const TriangleAlert: LucideIcon;
  export const Truck: LucideIcon;
  export const Upload: LucideIcon;
  export const User: LucideIcon;
  export const UserCircle: LucideIcon;
  export const UserPlus: LucideIcon;
  export const Users: LucideIcon;
  export const X: LucideIcon;
  export const XCircle: LucideIcon;
}
