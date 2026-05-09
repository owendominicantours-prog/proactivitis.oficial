"use client";

import Link from "next/link";
import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import { signIn } from "next-auth/react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Building2,
  Bus,
  CalendarDays,
  Camera,
  Check,
  Heart,
  Languages,
  Leaf,
  Loader2,
  MapPin,
  Mountain,
  Music,
  ShieldCheck,
  Sparkles,
  Users,
  Utensils,
  Waves
} from "lucide-react";
import type { Locale } from "@/lib/translations";
import type { ProDiscoveryItineraryDraft } from "@/lib/prodiscoveryGroupPlannerShared";

type PlannerFormProps = {
  locale: Locale;
  initialCity?: string;
};

type PlannerResult = {
  requestCode: string;
  itinerary: ProDiscoveryItineraryDraft;
};

type FormState = {
  city: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  flexibleTiming: boolean;
  preferredStartTime: string;
  preferredEndTime: string;
  languages: string[];
  assistance: string[];
  groupType: string;
  groupSize: string;
  budgetTier: string;
  holidayStyles: string[];
  additionalServices: string[];
  dream: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  companyName: string;
};

type ToggleKey = "languages" | "assistance" | "holidayStyles" | "additionalServices";
type Option = { value: string; labels: Record<Locale, string>; icon?: ComponentType<{ className?: string }> };

const copy = {
  es: {
    steps: ["Destino", "Grupo", "Deseos", "Servicios", "Contacto"],
    logisticsTitle: "Destino, fechas y horarios",
    groupTitle: "Grupo, idiomas y asistencia",
    wishTitle: "Lo que quieren vivir",
    servicesTitle: "Extras y presupuesto",
    contactTitle: "Datos para responderte",
    city: "Destino",
    cityPlaceholder: "Punta Cana, Santo Domingo, Bayahibe...",
    country: "Pais",
    countryPlaceholder: "Republica Dominicana",
    dates: "Fechas",
    arrivalDate: "Llegada",
    departureDate: "Salida",
    times: "Horarios aproximados",
    startTime: "Inicio",
    endTime: "Fin",
    flexibleTiming: "No estoy seguro de mis horarios",
    languages: "Guia que hable",
    assistance: "Necesito asistencia con",
    groupType: "Tipo de grupo",
    groupSize: "Tamano del grupo",
    budget: "Presupuesto estimado",
    styles: "Tipo de experiencia",
    extras: "Servicios adicionales",
    dream: "Your Requirements",
    dreamPlaceholder: "Ej: es la boda de mi hermana, somos 24 personas, queremos transporte privado, guia en espanol e ingles, cena especial y una experiencia que no sea masiva...",
    contactName: "Nombre",
    contactEmail: "Email",
    contactPhone: "Telefono / WhatsApp",
    companyName: "Empresa o grupo",
    next: "Siguiente",
    back: "Volver",
    submit: "Solicitar propuesta privada",
    submitting: "Preparando solicitud",
    successTitle: "Solicitud recibida",
    successBody: "Registramos tu solicitud y tambien la enviamos al correo indicado. El equipo la revisara para afinar fechas, cupos y estilo.",
    code: "Codigo",
    nextStep: "Siguiente paso",
    nextStepBody: "Un planner revisara tu solicitud y te respondera con ajustes para convertirla en propuesta final.",
    accountTitle: "Crea tu acceso para ver la propuesta",
    accountBody: "Cuando el equipo termine la propuesta, aparecera en tu cuenta para revisar detalles y pagar el deposito si decides confirmar.",
    password: "Contrasena",
    confirmPassword: "Confirmar contrasena",
    createAccount: "Guardar acceso",
    creatingAccount: "Creando acceso",
    accountReady: "Cuenta lista. Ya puedes entrar a tu panel.",
    accountExisting: "Este correo ya tenia cuenta. Inicia sesion para ver tu propuesta.",
    goDashboard: "Ir a mi cuenta",
    earlyAccount: "Puedes crear tu cuenta antes de completar la solicitud o iniciar sesion si ya tienes una.",
    earlyCreateAccount: "Crear cuenta",
    earlyLogin: "Iniciar sesion",
    passwordMismatch: "Las contrasenas no coinciden.",
    passwordShort: "La contrasena debe tener al menos 8 caracteres.",
    errorFallback: "No pudimos enviar la solicitud. Revisa los campos e intenta otra vez.",
    required: "Completa los campos principales para continuar."
  },
  en: {
    steps: ["Destination", "Group", "Wishes", "Services", "Contact"],
    logisticsTitle: "Destination, dates and timing",
    groupTitle: "Group, languages and assistance",
    wishTitle: "What they want to experience",
    servicesTitle: "Extras and budget",
    contactTitle: "Details to reply",
    city: "Destination",
    cityPlaceholder: "Punta Cana, Santo Domingo, Bayahibe...",
    country: "Country",
    countryPlaceholder: "Dominican Republic",
    dates: "Dates",
    arrivalDate: "Arrival",
    departureDate: "Departure",
    times: "Approximate timing",
    startTime: "Start",
    endTime: "End",
    flexibleTiming: "I am not sure about my timing",
    languages: "Guide language",
    assistance: "I need help with",
    groupType: "Group type",
    groupSize: "Group size",
    budget: "Estimated budget",
    styles: "Experience type",
    extras: "Additional services",
    dream: "Your Requirements",
    dreamPlaceholder: "Example: it is my sister's wedding, we are 24 people, need private transport, Spanish and English guide, a special dinner and a non-mass experience...",
    contactName: "Name",
    contactEmail: "Email",
    contactPhone: "Phone / WhatsApp",
    companyName: "Company or group",
    next: "Next",
    back: "Back",
    submit: "Request private proposal",
    submitting: "Designing proposal",
    successTitle: "Request received",
    successBody: "We registered your request and also sent it to your email. The team will refine dates, capacity and style.",
    code: "Code",
    nextStep: "Next step",
    nextStepBody: "A planner will review your request and reply with adjustments before turning it into a final proposal.",
    accountTitle: "Create access to view the proposal",
    accountBody: "When the team finishes the proposal, it will appear in your account so you can review details and pay the deposit if you confirm.",
    password: "Password",
    confirmPassword: "Confirm password",
    createAccount: "Save access",
    creatingAccount: "Creating access",
    accountReady: "Account ready. You can now open your dashboard.",
    accountExisting: "This email already has an account. Sign in to view your proposal.",
    goDashboard: "Go to my account",
    earlyAccount: "You can create your account before completing the request or sign in if you already have one.",
    earlyCreateAccount: "Create account",
    earlyLogin: "Sign in",
    passwordMismatch: "Passwords do not match.",
    passwordShort: "Password must be at least 8 characters.",
    errorFallback: "We could not send the request. Check the fields and try again.",
    required: "Complete the main fields to continue."
  },
  fr: {
    steps: ["Destination", "Groupe", "Envies", "Services", "Contact"],
    logisticsTitle: "Destination, dates et horaires",
    groupTitle: "Groupe, langues et assistance",
    wishTitle: "Ce que le groupe veut vivre",
    servicesTitle: "Extras et budget",
    contactTitle: "Details pour repondre",
    city: "Destination",
    cityPlaceholder: "Punta Cana, Santo Domingo, Bayahibe...",
    country: "Pays",
    countryPlaceholder: "Republique dominicaine",
    dates: "Dates",
    arrivalDate: "Arrivee",
    departureDate: "Depart",
    times: "Horaires approximatifs",
    startTime: "Debut",
    endTime: "Fin",
    flexibleTiming: "Je ne suis pas sur de mes horaires",
    languages: "Langue du guide",
    assistance: "Besoin d assistance avec",
    groupType: "Type de groupe",
    groupSize: "Taille du groupe",
    budget: "Budget estime",
    styles: "Type d experience",
    extras: "Services additionnels",
    dream: "Your Requirements",
    dreamPlaceholder: "Exemple : c est le mariage de ma soeur, nous sommes 24 personnes, transport prive, guide en espagnol et anglais, diner special et experience non massive...",
    contactName: "Nom",
    contactEmail: "Email",
    contactPhone: "Telephone / WhatsApp",
    companyName: "Entreprise ou groupe",
    next: "Suivant",
    back: "Retour",
    submit: "Demander proposition privee",
    submitting: "Creation de la proposition",
    successTitle: "Demande recue",
    successBody: "Nous avons enregistre votre demande et l avons aussi envoyee par email. L equipe affinera dates, capacite et style.",
    code: "Code",
    nextStep: "Prochaine etape",
    nextStepBody: "Un planner examinera votre demande et repondra avec les ajustements avant la proposition finale.",
    accountTitle: "Creez votre acces pour voir la proposition",
    accountBody: "Quand l equipe termine la proposition, elle apparaitra dans votre compte pour revoir les details et payer le depot si vous confirmez.",
    password: "Mot de passe",
    confirmPassword: "Confirmer mot de passe",
    createAccount: "Enregistrer acces",
    creatingAccount: "Creation acces",
    accountReady: "Compte pret. Vous pouvez ouvrir votre espace.",
    accountExisting: "Cet email a deja un compte. Connectez-vous pour voir votre proposition.",
    goDashboard: "Aller a mon compte",
    earlyAccount: "Vous pouvez creer votre compte avant de finaliser la demande ou vous connecter si vous en avez deja un.",
    earlyCreateAccount: "Creer compte",
    earlyLogin: "Connexion",
    passwordMismatch: "Les mots de passe ne correspondent pas.",
    passwordShort: "Le mot de passe doit avoir au moins 8 caracteres.",
    errorFallback: "Impossible d envoyer la demande. Verifiez les champs et reessayez.",
    required: "Completez les champs principaux pour continuer."
  }
} as const;

const groupOptions: Option[] = [
  { value: "companies", labels: { es: "Empresas / incentivos", en: "Companies / incentives", fr: "Entreprises / incentives" }, icon: Building2 },
  { value: "families", labels: { es: "Familias", en: "Families", fr: "Familles" }, icon: Users },
  { value: "weddings", labels: { es: "Bodas", en: "Weddings", fr: "Mariages" }, icon: Heart },
  { value: "bachelor", labels: { es: "Despedidas", en: "Bachelor trips", fr: "Enterrements" }, icon: Music }
];

const budgetOptions: Option[] = [
  { value: "low", labels: { es: "Bajo", en: "Low", fr: "Bas" } },
  { value: "mid", labels: { es: "Medio", en: "Medium", fr: "Moyen" } },
  { value: "premium", labels: { es: "Premium", en: "Premium", fr: "Premium" } },
  { value: "vip", labels: { es: "VIP", en: "VIP", fr: "VIP" } }
];

const languageOptions: Option[] = [
  { value: "es", labels: { es: "Espanol", en: "Spanish", fr: "Espagnol" }, icon: Languages },
  { value: "en", labels: { es: "Ingles", en: "English", fr: "Anglais" }, icon: Languages },
  { value: "fr", labels: { es: "Frances", en: "French", fr: "Francais" }, icon: Languages },
  { value: "de", labels: { es: "Aleman", en: "German", fr: "Allemand" }, icon: Languages }
];

const assistanceOptions: Option[] = [
  { value: "transport", labels: { es: "Transporte", en: "Transport", fr: "Transport" }, icon: Bus },
  { value: "accommodation", labels: { es: "Alojamiento", en: "Accommodation", fr: "Hebergement" }, icon: Building2 },
  { value: "group-logistics", labels: { es: "Logistica de grupo", en: "Group logistics", fr: "Logistique groupe" }, icon: Users },
  { value: "private-dinner", labels: { es: "Cenas privadas", en: "Private dinners", fr: "Diners prives" }, icon: Utensils },
  { value: "events", labels: { es: "Eventos", en: "Events", fr: "Evenements" }, icon: Sparkles }
];

const styleOptions: Option[] = [
  { value: "active", labels: { es: "Activo", en: "Active", fr: "Actif" }, icon: Activity },
  { value: "local", labels: { es: "Vida local", en: "Local living", fr: "Vie locale" }, icon: MapPin },
  { value: "nature", labels: { es: "Naturaleza", en: "Nature", fr: "Nature" }, icon: Leaf },
  { value: "offbeat", labels: { es: "Diferente", en: "Offbeat", fr: "Original" }, icon: Mountain },
  { value: "relax", labels: { es: "Relax", en: "Relaxing", fr: "Relax" }, icon: Waves },
  { value: "gastronomy", labels: { es: "Gastronomia", en: "Gastronomy", fr: "Gastronomie" }, icon: Utensils }
];

const additionalOptions: Option[] = [
  { value: "insurance", labels: { es: "Seguro grupal", en: "Group insurance", fr: "Assurance groupe" }, icon: ShieldCheck },
  { value: "photographer", labels: { es: "Fotografo privado", en: "Private photographer", fr: "Photographe prive" }, icon: Camera },
  { value: "private-dinner", labels: { es: "Cena privada", en: "Private dinner", fr: "Diner prive" }, icon: Utensils },
  { value: "nightlife", labels: { es: "Vida nocturna", en: "Nightlife", fr: "Vie nocturne" }, icon: Music },
  { value: "culture", labels: { es: "Ruta cultural", en: "Cultural route", fr: "Route culturelle" }, icon: MapPin }
];

const defaultCountry = (locale: Locale) =>
  locale === "en" ? "Dominican Republic" : locale === "fr" ? "Republique dominicaine" : "Republica Dominicana";

const initialState = (initialCity: string | undefined, locale: Locale): FormState => ({
  city: initialCity ?? "",
  country: defaultCountry(locale),
  arrivalDate: "",
  departureDate: "",
  flexibleTiming: true,
  preferredStartTime: "",
  preferredEndTime: "",
  languages: ["es", "en"],
  assistance: ["transport", "group-logistics"],
  groupType: "families",
  groupSize: "12",
  budgetTier: "mid",
  holidayStyles: ["local"],
  additionalServices: [],
  dream: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  companyName: ""
});

export default function ProDiscoveryPlannerForm({ locale, initialCity }: PlannerFormProps) {
  const t = copy[locale] ?? copy.es;
  const plannerPath = `${locale === "es" ? "" : `/${locale}`}/prodiscovery#planner`;
  const authCallback = encodeURIComponent(plannerPath);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(() => initialState(initialCity, locale));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlannerResult | null>(null);
  const [accountPassword, setAccountPassword] = useState("");
  const [accountConfirmPassword, setAccountConfirmPassword] = useState("");
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountMessage, setAccountMessage] = useState("");

  const canContinue = useMemo(() => {
    if (step === 0) {
      const timingReady = form.flexibleTiming || Boolean(form.preferredStartTime && form.preferredEndTime);
      return form.city.trim().length >= 2 && timingReady;
    }
    if (step === 1) return Number(form.groupSize) >= 2 && form.groupType && form.languages.length > 0 && form.assistance.length > 0;
    if (step === 2) return form.holidayStyles.length > 0 && form.dream.trim().length >= 20;
    if (step === 3) return Boolean(form.budgetTier);
    return form.contactName.trim().length >= 2 && form.contactEmail.includes("@");
  }, [form, step]);

  const update = (key: keyof FormState, value: string | boolean) => {
    setError("");
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleArray = (key: ToggleKey, value: string) => {
    setError("");
    setForm((current) => {
      const currentValues = current[key];
      const exists = currentValues.includes(value);
      return {
        ...current,
        [key]: exists ? currentValues.filter((item) => item !== value) : [...currentValues, value]
      };
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
        body: JSON.stringify({
          ...form,
          locale,
          interests: [...form.holidayStyles, ...form.assistance, ...form.additionalServices]
        })
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? t.errorFallback);
      setResult(payload as PlannerResult);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t.errorFallback);
    } finally {
      setLoading(false);
    }
  };

  const createAccountAccess = async () => {
    if (!result) return;
    setError("");
    setAccountMessage("");
    if (accountPassword.length < 8) {
      setError(t.passwordShort);
      return;
    }
    if (accountPassword !== accountConfirmPassword) {
      setError(t.passwordMismatch);
      return;
    }
    setAccountLoading(true);
    try {
      const response = await fetch("/api/prodiscovery/account-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestCode: result.requestCode,
          email: form.contactEmail,
          name: form.contactName,
          password: accountPassword
        })
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? t.errorFallback);
      if (payload.existingAccount) {
        setAccountMessage(t.accountExisting);
        return;
      }
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: form.contactEmail,
        password: accountPassword,
        callbackUrl: "/dashboard/customer"
      });
      if (signInResult?.error) {
        setAccountMessage(t.accountReady);
        return;
      }
      window.location.href = "/dashboard/customer";
    } catch (accountError) {
      setError(accountError instanceof Error ? accountError.message : t.errorFallback);
    } finally {
      setAccountLoading(false);
    }
  };

  if (result) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/70 sm:p-5">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <Check className="h-5 w-5" aria-hidden />
        </span>
        <p className="mt-4 text-xs font-black uppercase tracking-[0.24em] text-emerald-700">{t.successTitle}</p>
        <h2 className="mt-2 text-2xl font-black leading-tight text-slate-950">{result.itinerary.summary}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{t.successBody}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t.code}</p>
            <p className="mt-2 text-lg font-black text-slate-950">{result.requestCode}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t.nextStep}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{t.nextStepBody}</p>
          </div>
        </div>
        <div className="mt-4 rounded-[22px] border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">{t.accountTitle}</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-emerald-950">{t.accountBody}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label={t.password}>
              <input
                type="password"
                value={accountPassword}
                onChange={(event) => setAccountPassword(event.target.value)}
                className={inputClass}
                minLength={8}
              />
            </Field>
            <Field label={t.confirmPassword}>
              <input
                type="password"
                value={accountConfirmPassword}
                onChange={(event) => setAccountConfirmPassword(event.target.value)}
                className={inputClass}
                minLength={8}
              />
            </Field>
          </div>
          {accountMessage ? <p className="mt-3 text-sm font-bold leading-6 text-emerald-950">{accountMessage}</p> : null}
          {error ? <div className="mt-3 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-bold text-rose-700">{error}</div> : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={createAccountAccess}
              disabled={accountLoading}
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-slate-950 px-5 py-2 text-sm font-black text-white disabled:opacity-60"
            >
              {accountLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ShieldCheck className="h-4 w-4" aria-hidden />}
              {accountLoading ? t.creatingAccount : t.createAccount}
            </button>
            <a
              href="/dashboard/customer"
              className="inline-flex min-h-11 items-center rounded-2xl border border-emerald-300 bg-white px-5 py-2 text-sm font-black text-emerald-900"
            >
              {t.goDashboard}
            </a>
          </div>
        </div>
      </div>
    );
  }

  const title = step === 0 ? t.logisticsTitle : step === 1 ? t.groupTitle : step === 2 ? t.wishTitle : step === 3 ? t.servicesTitle : t.contactTitle;

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/70 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          {step === 0 ? <CalendarDays className="h-5 w-5" aria-hidden /> : step === 1 ? <Sparkles className="h-5 w-5" aria-hidden /> : <Users className="h-5 w-5" aria-hidden />}
        </span>
        <div className="flex flex-1 items-center justify-end gap-2">
          {t.steps.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(index)}
              className={`flex h-8 min-w-8 items-center justify-center rounded-full text-xs font-black transition ${
                step === index ? "bg-slate-950 text-white" : index < step ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
              }`}
              aria-label={label}
            >
              {index < step ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
        <p className="text-xs font-semibold leading-5 text-emerald-950">{t.earlyAccount}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`/auth/register?callbackUrl=${authCallback}`}
            className="inline-flex min-h-10 items-center rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white"
          >
            {t.earlyCreateAccount}
          </Link>
          <Link
            href={`/auth/login?callbackUrl=${authCallback}`}
            className="inline-flex min-h-10 items-center rounded-2xl border border-emerald-300 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-emerald-900"
          >
            {t.earlyLogin}
          </Link>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">{t.steps[step]}</p>
        <h2 className="mt-2 text-2xl font-black leading-tight text-slate-950">{title}</h2>
      </div>

      <div className="mt-4 space-y-4">
        {step === 0 ? (
          <>
            <div className="grid gap-3 sm:grid-cols-[1fr_0.8fr]">
              <Field label={t.city}>
                <input value={form.city} onChange={(event) => update("city", event.target.value)} className={inputClass} placeholder={t.cityPlaceholder} />
              </Field>
              <Field label={t.country}>
                <input value={form.country} onChange={(event) => update("country", event.target.value)} className={inputClass} placeholder={t.countryPlaceholder} />
              </Field>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{t.dates}</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <Field label={t.arrivalDate}>
                  <input type="date" value={form.arrivalDate} onChange={(event) => update("arrivalDate", event.target.value)} className={inputClass} />
                </Field>
                <Field label={t.departureDate}>
                  <input type="date" value={form.departureDate} onChange={(event) => update("departureDate", event.target.value)} className={inputClass} />
                </Field>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <label className="flex items-center gap-3 text-sm font-black text-slate-800">
                <input
                  type="checkbox"
                  checked={form.flexibleTiming}
                  onChange={(event) => update("flexibleTiming", event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                />
                {t.flexibleTiming}
              </label>
              {!form.flexibleTiming ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label={t.startTime}>
                    <input type="time" value={form.preferredStartTime} onChange={(event) => update("preferredStartTime", event.target.value)} className={inputClass} />
                  </Field>
                  <Field label={t.endTime}>
                    <input type="time" value={form.preferredEndTime} onChange={(event) => update("preferredEndTime", event.target.value)} className={inputClass} />
                  </Field>
                </div>
              ) : null}
            </div>

          </>
        ) : null}

        {step === 1 ? (
          <>
            <div className="grid gap-3 sm:grid-cols-[0.75fr_1fr]">
              <Field label={t.groupSize}>
                <input type="number" min="2" max="1000" value={form.groupSize} onChange={(event) => update("groupSize", event.target.value)} className={inputClass} />
              </Field>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{t.groupType}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {groupOptions.map((option) => (
                    <SegmentButton key={option.value} option={option} locale={locale} active={form.groupType === option.value} onClick={() => update("groupType", option.value)} />
                  ))}
                </div>
              </div>
            </div>

            <OptionGrid label={t.languages} options={languageOptions} selected={form.languages} locale={locale} onToggle={(value) => toggleArray("languages", value)} compact />
            <OptionGrid label={t.assistance} options={assistanceOptions} selected={form.assistance} locale={locale} onToggle={(value) => toggleArray("assistance", value)} />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Field label={t.dream}>
              <textarea value={form.dream} onChange={(event) => update("dream", event.target.value)} rows={5} className={`${inputClass} resize-none leading-7`} placeholder={t.dreamPlaceholder} />
            </Field>
            <OptionGrid label={t.styles} options={styleOptions} selected={form.holidayStyles} locale={locale} onToggle={(value) => toggleArray("holidayStyles", value)} />
          </>
        ) : null}

        {step === 3 ? (
          <>
            <OptionGrid label={t.extras} options={additionalOptions} selected={form.additionalServices} locale={locale} onToggle={(value) => toggleArray("additionalServices", value)} />
            <OptionGrid label={t.budget} options={budgetOptions} selected={[form.budgetTier]} locale={locale} onToggle={(value) => update("budgetTier", value)} compact single />
          </>
        ) : null}

        {step === 4 ? (
          <>
            <Field label={t.contactName}>
              <input value={form.contactName} onChange={(event) => update("contactName", event.target.value)} className={inputClass} />
            </Field>
            <Field label={t.contactEmail}>
              <input type="email" value={form.contactEmail} onChange={(event) => update("contactEmail", event.target.value)} className={inputClass} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t.contactPhone}>
                <input value={form.contactPhone} onChange={(event) => update("contactPhone", event.target.value)} className={inputClass} />
              </Field>
              <Field label={t.companyName}>
                <input value={form.companyName} onChange={(event) => update("companyName", event.target.value)} className={inputClass} />
              </Field>
            </div>
          </>
        ) : null}
      </div>

      {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div> : null}

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((current) => Math.max(current - 1, 0))}
          disabled={step === 0 || loading}
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t.back}
        </button>
        {step < t.steps.length - 1 ? (
          <button type="button" onClick={goNext} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-slate-950 px-5 py-2 text-sm font-black text-white">
            {t.next}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2 text-sm font-black text-white disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
            {loading ? t.submitting : t.submit}
          </button>
        )}
      </div>
    </div>
  );
}

const inputClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none ring-emerald-200 focus:ring-2";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function SegmentButton({ option, locale, active, onClick }: { option: Option; locale: Locale; active: boolean; onClick: () => void }) {
  const Icon = option.icon;
  return (
    <button type="button" onClick={onClick} className={`min-h-12 rounded-2xl border px-3 py-2 text-left text-sm font-black ${active ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-700"}`}>
      <span className="flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
        {option.labels[locale]}
      </span>
    </button>
  );
}

function OptionGrid({
  label,
  options,
  selected,
  locale,
  onToggle,
  compact = false,
  single = false
}: {
  label: string;
  options: Option[];
  selected: string[];
  locale: Locale;
  onToggle: (value: string) => void;
  compact?: boolean;
  single?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <div className={`mt-2 grid gap-2 ${compact ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3"}`}>
        {options.map((option) => {
          const Icon = option.icon;
          const active = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              className={`min-h-[72px] rounded-2xl border px-3 py-3 text-center text-sm font-black transition ${
                active ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              } ${single ? "min-h-12" : ""}`}
            >
              {Icon ? <Icon className="mx-auto mb-2 h-5 w-5" aria-hidden /> : null}
              <span className="block leading-tight">{option.labels[locale]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
