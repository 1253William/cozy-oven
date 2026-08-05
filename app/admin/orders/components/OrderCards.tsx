import {
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  DeliveryTruck01Icon,
  Package01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../../components/AdminIcon";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: number;
  total: number;
  status: string;
  date: string;
  deliveryAddress: string;
}

interface OrderCardsProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "processing":
      return "bg-blue-100 text-blue-700";
    case "shipped":
      return "bg-purple-100 text-purple-700";
    case "delivered":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-[#b9aca2] text-[#5d6043]";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <AdminIcon icon={Clock01Icon} size={16} />;
    case "processing":
      return <AdminIcon icon={Package01Icon} size={16} />;
    case "shipped":
      return <AdminIcon icon={DeliveryTruck01Icon} size={16} />;
    case "delivered":
      return <AdminIcon icon={CheckmarkCircle02Icon} size={16} />;
    case "cancelled":
      return <AdminIcon icon={CancelCircleIcon} size={16} />;
    default:
      return null;
  }
};

export default function OrderCards({ orders, onViewOrder }: OrderCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-[#faf9f5] rounded-xl shadow-sm border border-[#b9aca2]/40 p-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-[#222222]">{order.customerName}</h3>
              <p className="text-sm text-[#5d6043]">{order.customerEmail}</p>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                order.status
              )}`}
            >
              {getStatusIcon(order.status)}
              {(order.status?.charAt(0) || "").toUpperCase() + (order.status?.slice(1) || "")}
            </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-[#5d6043] mb-1">Order ID</p>
              <p className="text-sm font-medium text-[#222222]">{order.id}</p>
            </div>
            <div>
              <p className="text-xs text-[#5d6043] mb-1">Items</p>
              <p className="text-sm font-medium text-[#222222]">{order.items}</p>
            </div>
            <div>
              <p className="text-xs text-[#5d6043] mb-1">Total</p>
              <p className="text-sm font-semibold text-[#222222]">GHS {order.total.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-[#5d6043] mb-1">Date</p>
              <p className="text-sm font-medium text-[#222222]">
                {new Date(order.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="mb-3">
            <p className="text-xs text-[#5d6043] mb-1">Delivery Address</p>
            <p className="text-sm text-[#5d6043]">{order.deliveryAddress}</p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onViewOrder(order)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-[#b9aca2] rounded-lg hover:bg-[#faf9f5] transition-colors"
          >
            <AdminIcon icon={ViewIcon} size={16} />
            View Details
          </button>
        </div>
      ))}
    </div>
  );
}
