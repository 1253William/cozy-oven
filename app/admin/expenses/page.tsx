"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import expenseService, {
  Expense,
  ExpenseCategory,
  ExpenseInput,
} from "../../services/expenseService";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const emptyForm: ExpenseInput = {
  title: "",
  category: "other",
  amount: 0,
  expenseDate: new Date().toISOString().slice(0, 10),
  notes: "",
};

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>(["other"]);
  const [selectedMonth, setSelectedMonth] = useState(() => MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [form, setForm] = useState<ExpenseInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const response = await expenseService.list(selectedMonth, selectedYear);
      setExpenses(response.data || []);
      if (response.categories?.length) setCategories(response.categories);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    try {
      setSaving(true);
      if (editingId) {
        await expenseService.update(editingId, form);
      } else {
        await expenseService.create(form);
      }
      resetForm();
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to save expense.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setForm({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      expenseDate: new Date(expense.expenseDate).toISOString().slice(0, 10),
      notes: expense.notes || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await expenseService.remove(id);
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to delete expense.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#222222]">Expenses</h1>
          <p className="mt-1 text-sm text-[#5d6043]">
            Track rent, salaries, packaging, events, and other operating costs for monthly P&amp;L.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-lg border border-[#b9aca2]/60 px-3 py-2"
          >
            {MONTHS.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value) || selectedYear)}
            className="w-28 rounded-lg border border-[#b9aca2]/60 px-3 py-2"
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-3 rounded-xl border border-[#b9aca2]/50 bg-white p-5 md:grid-cols-2"
        >
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            className="rounded-lg border border-[#b9aca2]/60 px-3 py-2"
            required
          />
          <select
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value as ExpenseCategory })
            }
            className="rounded-lg border border-[#b9aca2]/60 px-3 py-2"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.amount || ""}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })}
            placeholder="Amount (GHS)"
            className="rounded-lg border border-[#b9aca2]/60 px-3 py-2"
            required
          />
          <input
            type="date"
            value={form.expenseDate}
            onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
            className="rounded-lg border border-[#b9aca2]/60 px-3 py-2"
            required
          />
          <input
            value={form.notes || ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes (optional)"
            className="rounded-lg border border-[#b9aca2]/60 px-3 py-2 md:col-span-2"
          />
          <div className="flex gap-2 md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {editingId ? "Update expense" : "Add expense"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-[#b9aca2] px-4 py-2 text-sm"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <div className="flex items-center gap-2 text-[#5d6043]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : expenses.length === 0 ? (
          <p className="text-sm text-[#5d6043]">No expenses for this period.</p>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <article
                key={expense.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-[#b9aca2]/50 bg-white p-4"
              >
                <div>
                  <h2 className="font-semibold text-[#222222]">{expense.title}</h2>
                  <p className="text-sm text-[#5d6043]">
                    {expense.category} · GHS {Number(expense.amount).toFixed(2)} ·{" "}
                    {new Date(expense.expenseDate).toLocaleDateString()}
                  </p>
                  {expense.notes ? (
                    <p className="mt-1 text-sm text-[#5d6043]">{expense.notes}</p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(expense)}
                    className="rounded-lg border border-[#b9aca2] px-3 py-2 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(expense.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
