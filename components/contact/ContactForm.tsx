"use client";

import { FormEvent, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";

import { useTranslation } from "../../context/LanguageProvider";
import type { TranslationKey } from "@/lib/translations";

const subjectOptions: { value: string; labelKey: TranslationKey }[] = [
  { value: "reservation", labelKey: "contact.form.subject.reservation" },
  { value: "supplier", labelKey: "contact.form.subject.supplier" },
  { value: "general", labelKey: "contact.form.subject.general" }
];

export default function ContactForm() {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);
    setStatusError(null);
    setIsSubmitting(true);
    try {
      const form = event.currentTarget;
      const payload = new FormData(form);
      const response = await fetch("/api/contact", {
        method: "POST",
        body: payload
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error ?? t("contact.form.status.error.generic"));
      }
      setStatusMessage(t("contact.form.status.success"));
      form.reset();
    } catch (error) {
      setStatusError((error as Error).message || t("contact.form.status.error.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl">
      <div className="flex items-center gap-3">
        <MessageCircle className="h-6 w-6 text-slate-700" />
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">{t("contact.form.heading")}</p>
      </div>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit} ref={formRef}>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-600">{t("contact.form.field.name.label")}</label>
          <input
            name="name"
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
            placeholder={t("contact.form.field.name.placeholder")}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-600">{t("contact.form.field.email.label")}</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
            placeholder={t("contact.form.field.email.placeholder")}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-600">{t("contact.form.field.topic.label")}</label>
          <select
            name="topic"
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="" disabled>
              {t("contact.form.field.topic.placeholder")}
            </option>
            {subjectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-600">{t("contact.form.field.message.label")}</label>
          <textarea
            name="message"
            rows={4}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
            placeholder={t("contact.form.field.message.placeholder")}
          />
        </div>
        {statusError && <p className="text-sm text-rose-500">{statusError}</p>}
        {statusMessage && <p className="text-sm text-emerald-600">{statusMessage}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {isSubmitting ? t("contact.form.status.sending") : t("contact.form.submit")}
        </button>
      </form>
    </div>
  );
}
