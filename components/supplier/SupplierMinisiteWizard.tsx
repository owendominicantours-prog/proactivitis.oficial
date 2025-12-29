"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { Check, Copy, Globe, Paintbrush, ShieldCheck, Sparkles } from "lucide-react";
import { upsertSupplierMinisiteAction } from "@/app/(dashboard)/supplier/minisites/actions";

const THEMES = [
  {
    id: 1,
    name: "Luxury Minimal",
    accent: "from-rose-500 to-orange-500",
    background: "bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800",
    description: "Elegancia limpia, tonos oscuros y botones en rosa dorado."
  },
  {
    id: 2,
    name: "Adventure Bold",
    accent: "from-amber-500 to-emerald-500",
    background: "bg-gradient-to-br from-amber-700 via-amber-600 to-amber-500",
    description: "Colores enérgicos, tipografía fuerte y CTA vibrantes."
  },
  {
    id: 3,
    name: "Tropical Bright",
    accent: "from-emerald-400 to-cyan-400",
    background: "bg-gradient-to-br from-cyan-500 via-emerald-500 to-emerald-400",
    description: "Verde agua, mucha luz y sensación de playa."
  },
  {
    id: 4,
    name: "Corporate Clean",
    accent: "from-slate-500 to-slate-900",
    background: "bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400",
    description: "Diseño neutro, tarjetas limpias y tipografía compacta."
  },
  {
    id: 5,
    name: "Dark Premium",
    accent: "from-purple-500 to-indigo-500",
    background: "bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900",
    description: "Contrastes profundos y destaque tecnológico."
  }
] as const;

type MinisiteRecord = {
  slug: string;
  themeId: number;
  brandName: string;
  logoUrl?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
  bio?: string | null;
  isActive: boolean;
};

type Props = {
  supplierName: string;
  baseSlug: string;
  baseUrl: string;
  initial?: MinisiteRecord;
  approvedTours: number;
};

export function SupplierMinisiteWizard({ supplierName, baseSlug, baseUrl, initial, approvedTours }: Props) {
  const [step, setStep] = useState(0);
  const [brandName, setBrandName] = useState(initial?.brandName ?? supplierName);
  const [logoUrl, setLogoUrl] = useState(initial?.logoUrl ?? "");
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [themeId, setThemeId] = useState(initial?.themeId ?? THEMES[0].id);
  const [slug, setSlug] = useState(initial?.slug ?? baseSlug);
  const [isActive, setIsActive] = useState(initial?.isActive ?? false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const theme = useMemo(() => THEMES.find((item) => item.id === themeId) ?? THEMES[0], [themeId]);
  const heroUrl = `${baseUrl}/s/${slug || baseSlug}`;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        await upsertSupplierMinisiteAction(formData);
        setServerMessage("Minisite actualizado correctamente.");
        setServerError(null);
      } catch (error) {
        setServerMessage(null);
        setServerError(error instanceof Error ? error.message : "Algo salió mal.");
      }
    });
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(heroUrl);
      setServerMessage("URL copiada al portapapeles.");
      setServerError(null);
    } catch {
      setServerError("No se pudo copiar la URL. Intenta manualmente.");
    }
  };

  const stepTitles = ["Branding", "Tema", "Publicar"];
  const nextStep = () => setStep((prev) => Math.min(prev + 1, stepTitles.length - 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Get your own website in 2 minutes</p>
        <h1 className="text-2xl font-semibold text-slate-900">Supplier Minisite</h1>
        <p className="text-sm text-slate-600">
          Hosted en Proactivitis con tus tours aprobados, WhatsApp instantáneo y branding personalizado.
        </p>
        <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase text-slate-500">
          <span className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            Hosted on Proactivitis domain
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Only approved products shown
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            Free for partners
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 overflow-x-auto">
        {stepTitles.map((title, index) => (
          <div key={title} className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                index === step
                  ? "border-blue-500 bg-blue-500 text-white"
                  : index < step
                    ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                    : "border-slate-200 text-slate-500"
              }`}
            >
              {index + 1}
            </span>
            <span className="hidden text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 sm:block">
              {title}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={step === 0 ? "space-y-4" : "hidden"} aria-hidden={step !== 0}>
          <p className="text-sm font-semibold text-slate-700">Paso 1 · Branding</p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-600">
              Nombre comercial
              <input
                name="brandName"
                required
                value={brandName}
                onChange={(event) => setBrandName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Logo URL
              <input
                name="logoUrl"
                value={logoUrl}
                onChange={(event) => setLogoUrl(event.target.value)}
                placeholder="https://cdn.proactivitis.com/logo.png"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1 text-sm text-slate-600">
              WhatsApp
              <input
                name="whatsapp"
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                placeholder="+1809..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Teléfono
              <input
                name="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+1809..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Email
              <input
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="info@minisite.com"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
              />
            </label>
          </div>
          <label className="space-y-1 text-sm text-slate-600">
            Bio / descripción (máx 400 caracteres)
            <textarea
              name="bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
            />
          </label>
        </div>

        <div className={step === 1 ? "space-y-4" : "hidden"} aria-hidden={step !== 1}>
          <p className="text-sm font-semibold text-slate-700">Paso 2 · Elige un tema</p>
          <div className="grid gap-4 md:grid-cols-2">
            {THEMES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setThemeId(option.id)}
                className={`group relative overflow-hidden rounded-2xl border px-4 py-3 text-left transition ${
                  option.id === themeId ? "border-blue-500 shadow-lg" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className={`h-24 rounded-xl bg-gradient-to-br ${option.background}`} />
                <div className="mt-3">
                  <p className="text-sm font-semibold text-slate-900">{option.name}</p>
                  <p className="text-xs text-slate-500">{option.description}</p>
                </div>
                {option.id === themeId && (
                  <span className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-white text-blue-500 shadow">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </button>
            ))}
          </div>
          <input type="hidden" name="themeId" value={themeId} />
        </div>

        <div className={step === 2 ? "space-y-4" : "hidden"} aria-hidden={step !== 2}>
          <p className="text-sm font-semibold text-slate-700">Paso 3 · Publicación</p>
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">URL final</p>
            <div className="flex flex-wrap items-center gap-3">
              <code className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                https://proactivitis.com/s/
              </code>
              <input
                name="slug"
                required
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
              />
              <button
                type="button"
                onClick={copyUrl}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase text-slate-600 hover:border-slate-400"
              >
                <Copy className="h-3 w-3" />
                Copy URL
              </button>
            </div>
            <p className="text-xs text-slate-500">Puedes cambiar este slug cuando quieras; manténlo corto y sin espacios.</p>
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              name="isActive"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
            />
            Activar minisite públicamente
          </label>
        </div>

        <div className="space-y-2">
          {serverError && <p className="text-sm text-rose-600">{serverError}</p>}
          {serverMessage && <p className="text-sm text-emerald-600">{serverMessage}</p>}
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 0}
                className="secondary-btn text-xs disabled:opacity-40"
              >
                Anterior
              </button>
              {step < stepTitles.length - 1 && (
                <button type="button" onClick={nextStep} className="primary-btn text-xs">
                  Siguiente
                </button>
              )}
            </div>
            <div className="space-y-2 text-right">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Tours aprobados</p>
              <p className="text-lg font-semibold text-slate-900">{approvedTours}</p>
            </div>
          </div>
          {step === stepTitles.length - 1 && (
            <button
              type="submit"
              disabled={isPending}
              className={`primary-btn w-full text-sm ${isPending ? "opacity-70" : ""}`}
            >
              {isPending ? "Guardando..." : "Guardar minisite"}
            </button>
          )}
        </div>
      </form>

      <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Preview</p>
        <div className="rounded-2xl border border-slate-200 p-5">
          <div className={`rounded-2xl p-5 text-white ${theme.background}`}>
            <p className="text-sm uppercase tracking-[0.3em]">Theme · {theme.name}</p>
            <h2 className="text-2xl font-semibold">{brandName}</h2>
            <p className="max-w-xl text-xs text-white/80">{theme.description}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-xl bg-white/20 p-3 text-xs text-white/90">
                  Tour {item}
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Cada minic sitio enlaza a tus tours oficiales con CTA “Book now”.
          </p>
          <p className="text-xs text-slate-500">URL pública: <strong>{heroUrl}</strong></p>
        </div>
      </div>
    </div>
  );
}
