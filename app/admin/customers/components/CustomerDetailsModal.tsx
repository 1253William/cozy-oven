"use client";

import { useEffect, useMemo, useState } from "react";
import { Cancel01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import AdminIcon from "../../components/AdminIcon";
import customerService, {
  type Customer,
  type CustomerDetails,
  type CustomerKind,
} from "../../../services/customerService";

type CustomerOrder = CustomerDetails["orders"][number];

interface CustomerDetailsModalProps {
  customer: Customer;
  onClose: () => void;
  onSaved: () => void;
}

const formatStatusLabel = (status?: string) =>
  String(status ?? "—")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatMoney = (amount?: number) =>
  `GHS ${Number(amount || 0).toFixed(2)}`;

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
};

function OrderCard({
  order,
  featured = false,
}: {
  order: CustomerOrder;
  featured?: boolean;
}) {
  const itemsLabel =
    order.itemsPreview?.length
      ? order.itemsPreview
          .map((item) => `${item.quantity}× ${item.name}`)
          .join(", ")
      : `${order.itemCount || 0} item${(order.itemCount || 0) === 1 ? "" : "s"}`;

  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        featured
          ? "border-[#5d6043]/35 bg-[#5d6043]/[0.06]"
          : "border-[#b9aca2]/50 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[#222222]">
            {order.orderId || "Order"}
          </p>
          <p className="mt-1 text-xs text-[#5d6043]">
            {formatDate(order.paidAt || order.createdAt)}
          </p>
        </div>
        <p className="text-sm font-bold text-[#5d6043]">
          {formatMoney(order.totalAmount)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-[#faf9f5] px-2.5 py-1 font-medium text-[#222222]">
          {formatStatusLabel(order.orderStatus)}
        </span>
        <span className="rounded-full bg-[#faf9f5] px-2.5 py-1 font-medium text-[#5d6043]">
          {formatStatusLabel(order.paymentStatus)}
        </span>
        {order.paymentMethod ? (
          <span className="rounded-full bg-[#faf9f5] px-2.5 py-1 font-medium text-[#5d6043]">
            {formatStatusLabel(order.paymentMethod)}
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-sm text-[#5d6043]">{itemsLabel}</p>
      {(order.deliveryAddress || order.city) && (
        <p className="mt-1 text-xs text-[#5d6043]">
          {[order.deliveryAddress, order.city].filter(Boolean).join(", ")}
        </p>
      )}
    </div>
  );
}

export default function CustomerDetailsModal({
  customer,
  onClose,
  onSaved,
}: CustomerDetailsModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<CustomerKind>(customer.kind);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [originalEmail, setOriginalEmail] = useState(customer.email || "");
  const [originalPhone, setOriginalPhone] = useState(
    customer.phoneNumber || ""
  );
  const [fullName, setFullName] = useState(customer.fullName || "");
  const [email, setEmail] = useState(customer.email || "");
  const [phoneNumber, setPhoneNumber] = useState(customer.phoneNumber || "");
  const [registeredUserId, setRegisteredUserId] = useState(
    customer.registeredUserId
  );
  const [firstOrderAt, setFirstOrderAt] = useState(customer.createdAt);
  const [isRecent, setIsRecent] = useState(customer.isRecent);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      const params =
        customer.kind === "registered" && customer.registeredUserId
          ? { userId: customer.registeredUserId }
          : customer.email
            ? { email: customer.email }
            : customer.phoneNumber
              ? { phone: customer.phoneNumber }
              : null;

      if (!params) {
        if (!cancelled) {
          setError("This customer has no email or phone to look up.");
          setLoading(false);
        }
        return;
      }

      try {
        const response = await customerService.getCustomerProfile(params);
        if (cancelled) return;

        if (!response.success) {
          setError("Failed to load customer details");
          return;
        }

        const { customer: profile, orders: profileOrders } = response.data;
        setKind(response.data.kind);
        setOrders(profileOrders);
        setFullName(profile.fullName || "");
        setEmail(profile.email || "");
        setPhoneNumber(profile.phoneNumber || "");
        setOriginalEmail(profile.email || "");
        setOriginalPhone(profile.phoneNumber || "");
        setRegisteredUserId(profile._id);
        setFirstOrderAt(profile.createdAt);
        setIsRecent(Boolean(profile.isActive));
      } catch (err) {
        console.error("Error loading customer details:", err);
        if (!cancelled) setError("Failed to load customer details");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [customer]);

  const latestOrder = orders[0] || null;
  const previousOrders = useMemo(() => orders.slice(1), [orders]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nextName = fullName.trim();
    const nextEmail = email.trim().toLowerCase();
    const nextPhone = phoneNumber.trim();

    if (!nextName) {
      setError("Name is required");
      return;
    }
    if (!nextEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      setError("A valid email is required");
      return;
    }
    if (!nextPhone) {
      setError("Contact number is required");
      return;
    }

    const identityChanged =
      nextEmail !== originalEmail.trim().toLowerCase() ||
      nextPhone !== originalPhone.trim();

    if (
      identityChanged &&
      !confirm(
        "Changing email or phone updates all of this buyer’s paid orders and may merge or split customer list rows. Continue?"
      )
    ) {
      return;
    }

    const lookup =
      kind === "registered" && registeredUserId
        ? { userId: registeredUserId }
        : originalEmail
          ? { lookupEmail: originalEmail }
          : originalPhone
            ? { lookupPhone: originalPhone }
            : null;

    if (!lookup) {
      setError("Cannot save without a lookup identity");
      return;
    }

    try {
      setSaving(true);
      const response = await customerService.updateCustomerProfile({
        ...lookup,
        fullName: nextName,
        email: nextEmail,
        phoneNumber: nextPhone,
      });

      if (!response.success) {
        setError(response.message || "Failed to update customer");
        return;
      }

      const { customer: profile, orders: profileOrders } = response.data;
      setKind(response.data.kind);
      setOrders(profileOrders);
      setFullName(profile.fullName || "");
      setEmail(profile.email || "");
      setPhoneNumber(profile.phoneNumber || "");
      setOriginalEmail(profile.email || "");
      setOriginalPhone(profile.phoneNumber || "");
      setRegisteredUserId(profile._id);
      setFirstOrderAt(profile.createdAt);
      setIsRecent(Boolean(profile.isActive));
      onSaved();
    } catch (err: unknown) {
      console.error("Error updating customer:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update customer";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#faf9f5] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#222222]">Customer Details</h2>
            <p className="mt-1 text-sm text-[#5d6043]">
              {kind === "registered" ? "Registered account" : "Guest / walk-in"}
              {" · "}
              {orders.length} order{orders.length === 1 ? "" : "s"} linked
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-[#b9aca2]/40"
            aria-label="Close"
          >
            <AdminIcon icon={Cancel01Icon} size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <AdminIcon
              icon={Loading03Icon}
              size={32}
              className="animate-spin text-[#5d6043]"
            />
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-3 rounded-xl border border-[#b9aca2]/50 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-[#5d6043]">Name</p>
                <p className="mt-1 font-semibold text-[#222222]">
                  {fullName || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#5d6043]">Email</p>
                <p className="mt-1 break-all font-semibold text-[#222222]">
                  {email || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#5d6043]">Phone</p>
                <p className="mt-1 font-semibold text-[#222222]">
                  {phoneNumber || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#5d6043]">Activity</p>
                <p className="mt-1 font-semibold text-[#222222]">
                  {isRecent ? "Recent" : "Lapsed"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#5d6043]">Type</p>
                <p className="mt-1 font-semibold text-[#222222]">
                  {kind === "registered" ? "Registered" : "Guest"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#5d6043]">Total orders</p>
                <p className="mt-1 font-semibold text-[#222222]">
                  {orders.length}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-[#5d6043]">First order</p>
                <p className="mt-1 font-semibold text-[#222222]">
                  {formatDate(firstOrderAt)}
                </p>
              </div>
            </div>

            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#5d6043]">
                Most recent order
              </h3>
              {latestOrder ? (
                <OrderCard order={latestOrder} featured />
              ) : (
                <div className="rounded-xl border border-dashed border-[#b9aca2] px-4 py-8 text-center text-sm text-[#5d6043]">
                  No orders linked to this customer yet.
                </div>
              )}
            </section>

            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#5d6043]">
                Previous orders
              </h3>
              {previousOrders.length > 0 ? (
                <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                  {previousOrders.map((order, index) => (
                    <OrderCard
                      key={order.orderId || `${order.createdAt}-${index}`}
                      order={order}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#b9aca2] px-4 py-6 text-center text-sm text-[#5d6043]">
                  {latestOrder
                    ? "No earlier orders for this account."
                    : "Order history will appear here."}
                </div>
              )}
            </section>

            <form
              onSubmit={(e) => void handleSave(e)}
              className="space-y-4 border-t border-[#b9aca2]/50 pt-5"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#5d6043]">
                Edit contact
              </h3>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[#5d6043]">
                  Name
                </span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-[#b9aca2] px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-[#5d6043]"
                  required
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-[#5d6043]">
                    Email
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-[#b9aca2] px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-[#5d6043]"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-[#5d6043]">
                    Contact number
                  </span>
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full rounded-lg border border-[#b9aca2] px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-[#5d6043]"
                    required
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-[#b9aca2] px-4 py-2 text-sm text-[#5d6043] hover:bg-[#b9aca2]/20"
                  disabled={saving}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#5d6043] px-4 py-2 text-sm font-medium text-[#faf9f5] hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
