"use client";

import {
  Add01Icon,
  Cancel01Icon,
  Delete02Icon,
  FloppyDiskIcon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";

import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import faqService, { Faq, FaqInput } from "../../services/faqService";

const emptyForm: FaqInput = {
  question: "",
  answer: "",
  isActive: true,
  sortOrder: 0,
};

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [form, setForm] = useState<FaqInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadFaqs = async () => {
    try {
      setLoading(true);
      const response = await faqService.getAdminFaqs();
      setFaqs(response?.data || []);
      setError("");
    } catch (err) {
      console.error("Error loading FAQs:", err);
      setError("Failed to load FAQs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      setError("Question and answer are required.");
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await faqService.updateFaq(editingId, form);
      } else {
        await faqService.createFaq(form);
      }
      resetForm();
      await loadFaqs();
    } catch (err) {
      console.error("Error saving FAQ:", err);
      setError("Failed to save FAQ.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (faq: Faq) => {
    setEditingId(faq.id);
    setForm({
      question: faq.question,
      answer: faq.answer,
      isActive: faq.isActive,
      sortOrder: faq.sortOrder || 0,
    });
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this FAQ?")) return;

    try {
      await faqService.deleteFaq(id);
      await loadFaqs();
    } catch (err) {
      console.error("Error deleting FAQ:", err);
      setError("Failed to delete FAQ.");
    }
  };

  const handleToggle = async (faq: Faq) => {
    try {
      await faqService.updateFaq(faq.id, {
        question: faq.question,
        answer: faq.answer,
        isActive: !faq.isActive,
        sortOrder: faq.sortOrder || 0,
      });
      await loadFaqs();
    } catch (err) {
      console.error("Error updating FAQ:", err);
      setError("Failed to update FAQ.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#222222]">FAQs</h1>
          <p className="mt-1 text-[#5d6043]">Manage the questions shown on the customer homepage.</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-lg bg-[#faf9f5] p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-[#222222]">
              {editingId ? "Edit FAQ" : "Add FAQ"}
            </h2>
            {editingId ? (
              <button type="button" onClick={resetForm} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                <AdminIcon icon={Cancel01Icon} size={16} />
                Cancel edit
              </button>
            ) : (
              <span className="flex items-center gap-2 text-sm text-[#5d6043]">
                <AdminIcon icon={Add01Icon} size={16} />
                New homepage question
              </span>
            )}
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-[#5d6043]">
              Question
              <input
                value={form.question}
                onChange={(event) => setForm((prev) => ({ ...prev, question: event.target.value }))}
                className="rounded-lg border border-[#b9aca2] px-4 py-3 outline-none focus:border-[#5d6043]"
                placeholder="When do you deliver?"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#5d6043]">
              Answer
              <textarea
                value={form.answer}
                onChange={(event) => setForm((prev) => ({ ...prev, answer: event.target.value }))}
                rows={4}
                className="rounded-lg border border-[#b9aca2] px-4 py-3 outline-none focus:border-[#5d6043]"
                placeholder="Fresh banana bread is delivered on Tuesdays and Thursdays..."
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-[160px_1fr] sm:items-end">
              <label className="grid gap-2 text-sm font-medium text-[#5d6043]">
                Sort order
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) }))}
                  className="rounded-lg border border-[#b9aca2] px-4 py-3 outline-none focus:border-[#5d6043]"
                />
              </label>

              <label className="flex items-center gap-3 rounded-lg border border-[#b9aca2]/60 px-4 py-3 text-sm font-medium text-[#5d6043]">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                  className="h-4 w-4"
                />
                Show this FAQ on the website
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 flex items-center gap-2 rounded-lg bg-[#5d6043] px-5 py-3 font-semibold text-[#faf9f5] disabled:opacity-60"
          >
            <AdminIcon icon={FloppyDiskIcon} size={16} />
            {saving ? "Saving..." : editingId ? "Save changes" : "Add FAQ"}
          </button>
        </form>

        <section className="rounded-lg bg-[#faf9f5] p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-[#222222]">Current FAQs</h2>
          {loading ? (
            <p className="text-[#5d6043]">Loading FAQs...</p>
          ) : faqs.length === 0 ? (
            <p className="text-[#5d6043]">No FAQs yet. Add your first one above.</p>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq) => (
                <article key={faq.id} className="rounded-lg border border-[#b9aca2]/60 p-4">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#b9aca2] px-2 py-1 text-xs font-semibold text-[#5d6043]">
                          Order {faq.sortOrder || 0}
                        </span>
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          faq.isActive ? "bg-green-50 text-green-700" : "bg-[#b9aca2] text-[#5d6043]"
                        }`}>
                          {faq.isActive ? "Visible" : "Hidden"}
                        </span>
                      </div>
                      <h3 className="font-semibold text-[#222222]">{faq.question}</h3>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#5d6043]">{faq.answer}</p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggle(faq)}
                        className="rounded-lg border px-3 py-2 text-sm"
                      >
                        {faq.isActive ? "Hide" : "Show"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(faq)}
                        className="rounded-lg border px-3 py-2 text-sm"
                        aria-label="Edit FAQ"
                      >
                        <AdminIcon icon={PencilEdit02Icon} size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(faq.id)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700"
                        aria-label="Delete FAQ"
                      >
                        <AdminIcon icon={Delete02Icon} size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
