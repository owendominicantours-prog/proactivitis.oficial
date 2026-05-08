"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import type { Locale } from "@/lib/translations";
import {
  BUDGET_TIER_LABELS,
  GROUP_TYPE_LABELS,
  INTEREST_LABELS,
  type ProDiscoveryItineraryDraft
} from "@/lib/prodiscoveryGroupPlannerShared";

type PlannerFormProps = {
  locale: Locale;
  initialCity?: string;
};

type PlannerResult = {
  requestCode: string;
  itinerary: ProDiscoveryItineraryDraft;
  emailStatus: string;
  geminiStatus: string;
};

type FormState = {
  city: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  groupType: string;
  groupSize: string;
  budgetTier: string;
  interests: string[];
  dream: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  companyName: string;
};

const copy = {
  es: {
    steps: ["Destino", "Grupo", "Idea", "Contacto"],
    destinationTitle: "Destino y fechas",
    groupTitle: "Perfil del grupo",
    dreamTitle: "La idea del viaje",
    contactTitle: "Contacto",
    city: "Ciudad o destino",
    country: "Pais",
    arrivalDate: "Llegada",
    departureDate: "Salida",
    groupType: "Tipo de grupo",
    groupSize: "Tamano del grupo",
    budget: "Presupuesto estimado",
    interests: "Intereses criticos",
    dream: "Describe el viaje ideal",
    dreamPlaceholder: "Ej: somos 24 personas, queremos transporte privado, guia local, cena especial y una experiencia que no sea masiva...",
    contactName: "Nombre",
    contactEmail: "Email",
    contactPhone: "Telefono / WhatsApp",
    companyName: "Empresa o grupo",
    next: "Siguiente",
    back: "Volver",
    submit: "Solicitar propuesta",
    submitting: "Disenando propuesta",
    successTitle: "Solicitud recibida",
    successBody: "Ya tenemos un borrador inicial. Tambien lo enviamos al correo indicado si el servidor de email esta activo.",
    code: "Codigo",
    email: "Email",
    errorFallback: "No pudimos enviar la solicitud. Revisa los campos e intenta otra vez.",
    required: "Completa los campos principales para continuar."
  },
  en: {
    steps: ["Destination", "Group", "Idea", "Contact"],
    destinationTitle: "Destination and dates",
    groupTitle: "Group profile",
    dreamTitle: "Trip idea",
    contactTitle: "Contact",
    city: "City or destination",
    country: "Country",
    arrivalDate: "Arrival",
    departureDate: "Departure",
    groupType: "Group type",
    groupSize: "Group size",
    budget: "Estimated budget",
    interests: "Critical interests",
    dream: "Describe the ideal trip",
    dreamPlaceholder: "Example: we are 24 people, need private transport, a local guide, a special dinner and a non-mass experience...",
    contactName: "Name",
    contactEmail: "Email",
    contactPhone: "Phone / WhatsApp",
    companyName: "Company or group",
    next: "Next",
    back: "Back",
    submit: "Request proposal",
    submitting: "Designing proposal",
    successTitle: "Request received",
    successBody: "We have an initial draft. It was also sent by email if the email server is active.",
    code: "Code",
    email: "Email",
    errorFallback: "We could not send the request. Check the fields and try again.",
    required: "Complete the main fields to continue."
  },
  fr: {
    steps: ["Destination", "Groupe", "Idee", "Contact"],
    destinationTitle: "Destination et dates",
    groupTitle: "Profil du groupe",
    dreamTitle: "Idee du voyage",
    contactTitle: "Contact",
    city: "Ville ou destination",
    country: "Pays",
    arrivalDate: "Arrivee",
    departureDate: "Depart",
    groupType: "Type de groupe",
    groupSize: "Taille du groupe",
    budget: "Budget estime",
    interests: "Interets critiques",
    dream: "Decrivez le voyage ideal",
    dreamPlaceholder: "Exemple : nous sommes 24 personnes, transport prive, guide local, diner special et experience non massive...",
    contactName: "Nom",
    contactEmail: "Email",
    contactPhone: "Telephone / WhatsApp",
    companyName: "Entreprise ou groupe",
    next: "Suivant",
    back: "Retour",
    submit: "Demander proposition",
    submitting: "Creation de la proposition",
    successTitle: "Demande recue",
    successBody: "Nous avons une premiere ebauche. Elle a aussi ete envoyee par email si le serveur email est actif.",
    code: "Code",
    email: "Email",
    errorFallback: "Impossible d envoyer la demande. Verifiez les champs et reessayez.",
    required: "Completez les champs principaux pour continuer."
  }
};

const groupOptions = Object.entries(GROUP_TYPE_LABELS);
const budgetOptions = Object.entries(BUDGET_TIER_LABELS);
const interestOptions = Object.entries(INTEREST_LABELS);

const initialState = (initialCity?: string): FormState => ({
  city: initialCity ?? "",
  country: "",
  arrivalDate: "",
  departureDate: "",
  groupType: "companies",
  groupSize: "12",
  budgetTier: "mid",
  interests: ["transport"],
  dream: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  companyName: ""
});

export default function ProDiscoveryPlannerForm({ locale, initialCity }: PlannerFormProps) {
  const t = copy[locale] ?? copy.es;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(() => initialState(initialCity));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlannerResult | null>(null);

  const canContinue = useMemo(() => {
    if (step === 0) return form.city.trim().length >= 2;
    if (step === 1) return Number(form.groupSize) >= 2 && form.groupType && form.budgetTier && form.interests.length > 0;
    if (step === 2) return form.dream.trim().length >= 20;
    return form.contactName.trim().length >= 2 && form.contactEmail.includes("@");
  }, [form, step]);

  const update = (key: keyof FormState, value: string) => {
    setError("");
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleInterest = (value: string) => {
    setError("");
    setForm((current) => {
      const exists = current.interests.includes(value);
      const interests = exists
        ? current.interests.filter((item) => item !== value)
        : [...current.interests, value];
      return { ...current, interests };
    });
  };

  const goNext = () => {
    if (!canContinue) {
      setError(t.required);
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, t.steps.length - 1));
  };

  const submit = async () => {
    if (!canContinue) {
      setError(t.required);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/prodiscovery/group-opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locale })
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? t.errorFallback);
      }
      setResult(payload as PlannerResult);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t.errorFallback);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <Check className="h-6 w-6" aria-hidden />
        </span>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.28em] text-emerald-700">{t.successTitle}</p>
        <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950">{result.itinerary.summary}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{t.successBody}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">{t.code}</p>
            <p className="mt-2 text-xl font-black text-slate-950">{result.requestCode}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">{t.email}</p>
            <p className="mt-2 text-xl font-black text-slate-950">{result.emailStatus}</p>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {result.itinerary.days.slice(0, 3).map((day) => (
            <article key={day.title} className="rounded-2xl border border-slate-200 p-4">
              <h3 className="font-black text-slate-950">{day.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{day.logistics}</p>
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <Sparkles className="h-6 w-6" aria-hidden />
        </span>
        <div className="flex gap-1.5">
          {t.steps.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(index)}
              className={`h-2.5 rounded-full transition-all ${step === index ? "w-10 bg-emerald-600" : "w-2.5 bg-slate-200"}`}
              aria-label={label}
            />
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">{t.steps[step]}</p>
        <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950">
          {step === 0 ? t.destinationTitle : step === 1 ? t.groupTitle : step === 2 ? t.dreamTitle : t.contactTitle}
        </h2>
      </div>

      <div className="mt-5 space-y-4">
        {step === 0 ? (
          <>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{t.city}</span>
              <input
                value={form.city}
                onChange={(event) => update("city", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-950 outline-none ring-emerald-200 focus:ring-2"
                placeholder="Paris, Rome, Punta Cana..."
              />
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{t.country}</span>
              <input
                value={form.country}
                onChange={(event) => update("country", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-950 outline-none ring-emerald-200 focus:ring-2"
                placeholder="Dominican Republic, France, Italy..."
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{t.arrivalDate}</span>
                <input
                  type="date"
                  value={form.arrivalDate}
                  onChange={(event) => update("arrivalDate", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-950 outline-none ring-emerald-200 focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{t.departureDate}</span>
                <input
                  type="date"
                  value={form.departureDate}
                  onChange={(event) => update("departureDate", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-950 outline-none ring-emerald-200 focus:ring-2"
                />
              </label>
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{t.groupType}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {groupOptions.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update("groupType", value)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-black ${
                      form.groupType === value ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{t.groupSize}</span>
              <input
                type="number"
                min="2"
                max="1000"
                value={form.groupSize}
                onChange={(event) => update("groupSize", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-950 outline-none ring-emerald-200 focus:ring-2"
              />
            </label>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{t.budget}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-4">
                {budgetOptions.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update("budgetTier", value)}
                    className={`rounded-2xl border px-3 py-3 text-sm font-black ${
                      form.budgetTier === value ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 text-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{t.interests}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {interestOptions.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleInterest(value)}
                    className={`rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${
                      form.interests.includes(value)
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{t.dream}</span>
            <textarea
              value={form.dream}
              onChange={(event) => update("dream", event.target.value)}
              rows={8}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold leading-7 text-slate-950 outline-none ring-emerald-200 focus:ring-2"
              placeholder={t.dreamPlaceholder}
            />
          </label>
        ) : null}

        {step === 3 ? (
          <>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{t.contactName}</span>
              <input
                value={form.contactName}
                onChange={(event) => update("contactName", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-950 outline-none ring-emerald-200 focus:ring-2"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{t.contactEmail}</span>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(event) => update("contactEmail", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-950 outline-none ring-emerald-200 focus:ring-2"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{t.contactPhone}</span>
                <input
                  value={form.contactPhone}
                  onChange={(event) => update("contactPhone", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-950 outline-none ring-emerald-200 focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{t.companyName}</span>
                <input
                  value={form.companyName}
                  onChange={(event) => update("companyName", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-950 outline-none ring-emerald-200 focus:ring-2"
                />
              </label>
            </div>
          </>
        ) : null}
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((current) => Math.max(current - 1, 0))}
          disabled={step === 0 || loading}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t.back}
        </button>
        {step < t.steps.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
          >
            {t.next}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
            {loading ? t.submitting : t.submit}
          </button>
        )}
      </div>
    </div>
  );
}
