"use client";

import { useEffect, useState } from "react";
import { Cancel01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import AdminIcon from "../../components/AdminIcon";
import customerService, {
  type Customer,
  type CustomerDetails,
  type CustomerKind,
} from "../../../services/customerService";

interface CustomerDetailsModalProps {
  customer: Customer;
  onClose: () => void;
  onSaved: () => void;
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
  const [orders, setOrders] = useState<CustomerDetails["orders"]>([]);
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
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#faf9f5] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#222222]">Customer Details</h2>
            <p className="mt-1 text-sm text-[#5d6043]">
              {kind === "registered" ? "Registered account" : "Guest / walk-in"}{" "}
              · edit name, email, or contact
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
          <div className="flex justify-center py-12">
            <AdminIcon
              icon={Loading03Icon}
              size={32}
              className="animate-spin text-[#5d6043]"
            />
          </div>
        ) : (
          <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[#5d6043]">Activity</p>
                <p className="font-medium text-[#222222]">
                  {isRecent ? "Recent" : "Lapsed"}
                </p>
              </div>
              <div>
                <p className="text-[#5d6043]">Paid orders</p>
                <p className="font-medium text-[#222222]">{orders.length}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[#5d6043]">First order</p>
                <p className="font-medium text-[#222222]">
                  {firstOrderAt
                    ? new Date(firstOrderAt).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>

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

            {orders.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-[#5d6043]">
                  Recent paid orders
                </p>
                <ul className="max-h-40 space-y-2 overflow-y-auto text-sm">
                  {orders.slice(0, 8).map((order, index) => (
                    <li
                      key={order.orderId || `${order.createdAt}-${index}`}
                      className="flex items-center justify-between rounded-lg border border-[#b9aca2]/40 px-3 py-2"
                    >
                      <span className="text-[#222222]">
                        {order.orderId || "Order"}
                      </span>
                      <span className="text-[#5d6043]">
                        GHS {Number(order.totalAmount || 0).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
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
        )}
      </div>
    </div>
  );
}
