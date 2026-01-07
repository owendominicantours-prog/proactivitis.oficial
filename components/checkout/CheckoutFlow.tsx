"use client";



import Image from "next/image";

import { useRouter } from "next/navigation";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

import { loadStripe } from "@stripe/stripe-js";

import { ChangeEvent, Dispatch, FormEvent, SetStateAction, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { LucideIcon } from "lucide-react";

import {

  AlertTriangle,

  ArrowLeft,

  BadgeCheck,

  CalendarCheck,

  CheckCircle2,

  Clock3,

  CreditCard,

  Globe,

  MapPin,

  ShieldCheck,

  Star,

  Users

} from "lucide-react";

import { recommendedReservation } from "@/lib/checkout";

import Link from "next/link";
import { useTranslation } from "../../context/LanguageProvider";



export type CheckoutPageParams = {
  tourId?: string;
  tourTitle?: string;
  tourImage?: string;
  tourPrice?: string;
  date?: string;
  time?: string;
  adults?: string;
  youth?: string;
  child?: string;
  hotelSlug?: string;
  bookingCode?: string;
  originHotelName?: string;
  origin?: string;
  originLabel?: string;
  flowType?: "tour" | "transfer";
  flightNumber?: string;
  totalPrice?: string;
};


type TransferDefaults = {
  tourName: string;
  imageUrl: string;
  date: string;
  time: string;
};


type ContactState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type ContactField = {
  label: string;
  key: keyof ContactState;
  type: string;
  placeholder: string;
};



type PaymentMethodId = "card" | "paypal" | "google_pay" | "klarna";

type PaymentMethodDefinition = {
  id: PaymentMethodId;
  label: string;
  description: string;
  icon: LucideIcon;
};



const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

  : null;



const SESSION_TTL_MS = 30 * 60 * 1000;

const SESSION_TTL_SECONDS = SESSION_TTL_MS / 1000;

const CHECKOUT_SESSION_COOKIE = "proactivitis_checkout_session";



type CheckoutSessionInfo = {

  expires: number;

  tourId?: string;

};



const readCheckoutSession = (): CheckoutSessionInfo | null => {

  if (typeof document === "undefined") return null;

  const cookie = document.cookie

    .split("; ")

    .find((entry) => entry.startsWith(`${CHECKOUT_SESSION_COOKIE}=`));

  if (!cookie) return null;

  const value = cookie.substring(cookie.indexOf("=") + 1);

  try {

    return JSON.parse(decodeURIComponent(value)) as CheckoutSessionInfo;

  } catch {

    return null;

  }

};



const saveCheckoutSession = (session: CheckoutSessionInfo) => {

  if (typeof document === "undefined") return;

  document.cookie = `${CHECKOUT_SESSION_COOKIE}=${encodeURIComponent(

    JSON.stringify(session)

  )}; path=/; max-age=${SESSION_TTL_SECONDS}`;

};



const clearCheckoutSession = () => {

  if (typeof document === "undefined") return;

  document.cookie = `${CHECKOUT_SESSION_COOKIE}=; path=/; max-age=0`;

};



const padTime = (value: number) => value.toString().padStart(2, "0");



const formatCountdown = (ms: number) => {

  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));

  const minutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;

  return `${padTime(minutes)}:${padTime(seconds)}`;

};



const phoneCountries = [
  { code: "DO", label: "Republica Dominicana", dial: "+1" },
  { code: "US", label: "Estados Unidos", dial: "+1" },
  { code: "MX", label: "Mexico", dial: "+52" },
  { code: "CO", label: "Colombia", dial: "+57" },
  { code: "ES", label: "Espana", dial: "+34" },
  { code: "AR", label: "Argentina", dial: "+54" }
];



const languageOptions = [

  "Español / Inglés",

  "Español / Francés",

  "Inglés / Portugués",

  "Español / Alemán"

];



const paymentCountryOptions = [
  "Estados Unidos",
  "México",

  "España",

  "Colombia",

  "Reino Unido",

  "Chile",

  "Argentina",

  "Canadá",

  "Brasil"

];



const cardLogos = [
  { id: "visa", label: "Visa" },
  { id: "mastercard", label: "Mastercard" },

  { id: "amex", label: "American Express" }

];

const BOOKING_ID_COOKIE_NAME = "bookingId";
const BOOKING_ID_COOKIE_MAX_AGE = 30 * 60;

const parsePositiveInt = (value?: string, fallback = 0) => {

  if (!value) return fallback;

  const parsed = Number.parseInt(value, 10);

  return Number.isNaN(parsed) ? fallback : Math.max(fallback, parsed);

};



const parsePriceValue = (value?: string, fallback = 0) => {

  if (!value) return fallback;

  const parsed = Number.parseFloat(value.replace(",", "."));

  return Number.isNaN(parsed) ? fallback : parsed;

};



const CountdownTimer = ({ expires, onExpire }: { expires: number; onExpire: () => void }) => {

  const [remaining, setRemaining] = useState(() => Math.max(0, expires - Date.now()));

  const onExpireRef = useRef(onExpire);

  const expiredRef = useRef(false);



  useEffect(() => {

    onExpireRef.current = onExpire;

  }, [onExpire]);



  useEffect(() => {

    expiredRef.current = false;

    const updateRemaining = () => {

      const next = Math.max(0, expires - Date.now());

      setRemaining(next);

      return next;

    };



    const current = updateRemaining();

    if (current <= 0) {

      expiredRef.current = true;

      onExpireRef.current();

      return;

    }



    const interval = setInterval(() => {

      const next = updateRemaining();

      if (next <= 0 && !expiredRef.current) {

        expiredRef.current = true;

        clearInterval(interval);

        onExpireRef.current();

      }

    }, 1000);



    return () => clearInterval(interval);

  }, [expires]);



  return <span className="font-semibold">{formatCountdown(remaining)}</span>;

};



const buildSummary = (params: CheckoutPageParams, transferDefaults: TransferDefaults) => {
  const adults = parsePositiveInt(params.adults, 1);

  const youth = parsePositiveInt(params.youth, 0);

  const children = parsePositiveInt(params.child, 0);

  const isTransferFlow = params.flowType === "transfer";

  const overrideTotalPrice = parsePriceValue(params.totalPrice);

  const basePricePerPerson = parsePriceValue(params.tourPrice, recommendedReservation.price);

  const totalTravelers = Math.max(1, adults + youth + children);

  const totalPrice =
    overrideTotalPrice > 0 ? overrideTotalPrice : totalTravelers * basePricePerPerson;

  const pricePerPerson =
    overrideTotalPrice > 0 ? totalPrice / totalTravelers : basePricePerPerson;



  return {

    tourId: params.tourId,

    tourTitle:
      params.tourTitle || (isTransferFlow ? transferDefaults.tourName : recommendedReservation.tourName),

    tourImage:
      params.tourImage || (isTransferFlow ? transferDefaults.imageUrl : recommendedReservation.imageUrl),

    tourPrice: pricePerPerson,

    date: params.date || (isTransferFlow ? transferDefaults.date : recommendedReservation.date),

    time: params.time || (isTransferFlow ? transferDefaults.time : recommendedReservation.time),

    adults,

    youth,

    children,

    totalTravelers,

    totalPrice,

    hotelSlug: params.hotelSlug,

    bookingCode: params.bookingCode,

    originHotelName: params.originHotelName,

    origin: params.origin,

    originLabel: params.originLabel

  };

};



export default function CheckoutFlow({ initialParams }: { initialParams: CheckoutPageParams }) {
  const { t } = useTranslation();

  const transferDefaults = useMemo(
    () => ({
      tourName: t("checkout.transfer.tourName"),
      imageUrl: "/transfer/sedan.png",
      date: t("checkout.transfer.date"),
      time: t("checkout.transfer.time")
    }),
    [t]
  );

  const summary = useMemo(() => buildSummary(initialParams, transferDefaults), [initialParams, transferDefaults]);

  const contactFields = useMemo<ContactField[]>(() => {
    return [
      {
        label: t("checkout.contact.fields.firstName.label"),
        key: "firstName",
        type: "text",
        placeholder: t("checkout.contact.fields.firstName.placeholder")
      },
      {
        label: t("checkout.contact.fields.lastName.label"),
        key: "lastName",
        type: "text",
        placeholder: t("checkout.contact.fields.lastName.placeholder")
      },
      {
        label: t("checkout.contact.fields.email.label"),
        key: "email",
        type: "email",
        placeholder: t("checkout.contact.fields.email.placeholder")
      }
    ];
  }, [t]);
  const paymentMethods = useMemo<PaymentMethodDefinition[]>(
    () => [
      {
        id: "card" as PaymentMethodId,
        label: t("checkout.payment.methods.cardLabel"),
        description: t("checkout.payment.methods.cardDescription"),
        icon: CreditCard
      }
    ],
    [t]
  );

  const [activeStep, setActiveStep] = useState(0);

  const [contact, setContact] = useState<ContactState>({

    firstName: "",

    lastName: "",

    email: "",

    phone: ""

  });

  const [paymentEmailField, setPaymentEmailField] = useState("");

  const [travelerName, setTravelerName] = useState("");

  const [pickupPreference, setPickupPreference] = useState<"pickup" | "later">("pickup");
  const [flightNumber, setFlightNumber] = useState(initialParams.flightNumber ?? "");
  const isTransferFlow = initialParams.flowType === "transfer";
  const [pickupLocation, setPickupLocation] = useState("");

  const [language, setLanguage] = useState(languageOptions[0]);

  const [specialRequirements, setSpecialRequirements] = useState("");

  const [phoneCountry, setPhoneCountry] = useState(phoneCountries[0]);

  const [paymentCountry, setPaymentCountry] = useState(paymentCountryOptions[0]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const [intentLoading, setIntentLoading] = useState(false);

  const [intentReady, setIntentReady] = useState(false);

  const [intentError, setIntentError] = useState<string | null>(null);

  const [bookingId, setBookingId] = useState<string | null>(null);

  const [paymentFeedback, setPaymentFeedback] = useState<string | null>(null);

  const [paymentLoading, setPaymentLoading] = useState(false);

  const [activePaymentMethod, setActivePaymentMethod] = useState<PaymentMethodId>("card");

  const [completedSteps, setCompletedSteps] = useState([false, false, false]);

  const [sessionExpired, setSessionExpired] = useState(false);

  const [sessionRedirectTarget, setSessionRedirectTarget] = useState<string | null>(null);

  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);

  const [currentSession, setCurrentSession] = useState<CheckoutSessionInfo | null>(null);

  const router = useRouter();
  const successRedirectBase = useMemo(() => {
    const baseUrl =
      process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL ?? "https://proactivitis.com/booking/confirmed";
    if (!isTransferFlow) return baseUrl;
    return `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}type=transfer`;
  }, [isTransferFlow]);
  const handlePaymentSuccess = useCallback(() => {
    const target = bookingId
      ? `${successRedirectBase}${successRedirectBase.includes("?") ? "&" : "?"}bookingId=${bookingId}`
      : successRedirectBase;
    router.push(target);
  }, [bookingId, router, successRedirectBase]);
  const goBackFromPayment = useCallback(() => {
    setActiveStep(isTransferFlow ? 0 : 1);
  }, [isTransferFlow]);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sessionExpiredRef = useRef(false);

  const handleSessionExpire = useCallback(

    (session?: CheckoutSessionInfo) => {

      if (sessionExpiredRef.current) return;

      sessionExpiredRef.current = true;

      clearCheckoutSession();

      setSessionExpired(true);

      setSessionExpiresAt(null);

      setCurrentSession(null);

      const target = session?.tourId ? `/tours?tourId=${session.tourId}` : "/tours";

      setSessionRedirectTarget(target);

      if (redirectTimeoutRef.current) {

        clearTimeout(redirectTimeoutRef.current);

      }

      redirectTimeoutRef.current = setTimeout(() => {

        router.push(target);

      }, 2000);

    },

    [router]

  );



  useEffect(() => {

    return () => {

      if (redirectTimeoutRef.current) {

        clearTimeout(redirectTimeoutRef.current);

      }

    };

  }, []);

  useEffect(() => {
    if (!summary.tourId && !isTransferFlow) {
      const redirectTimer = setTimeout(() => {
        router.replace("/tours");
      }, 1400);

      return () => clearTimeout(redirectTimer);
    }
    return undefined;
  }, [router, summary.tourId]);

  useEffect(() => {
    if (typeof window === "undefined" || sessionExpired || !summary.tourId) return;
    let session = readCheckoutSession();

    const now = Date.now();

    if (session && session.expires <= now) {

      handleSessionExpire(session);

      return;

    }

    if (!session || session.tourId !== summary.tourId) {

      session = { expires: now + SESSION_TTL_MS, tourId: summary.tourId };

      saveCheckoutSession(session);

    }

    setCurrentSession(session);

    setSessionExpiresAt(session.expires);

    setSessionExpired(false);

    sessionExpiredRef.current = false;

    setSessionRedirectTarget(null);

  }, [handleSessionExpire, sessionExpired, summary.tourId]);



  const displayAmount = Number.isFinite(summary.totalPrice)

    ? `$${summary.totalPrice.toFixed(2)} USD`

    : t("checkout.summary.priceOnRequest");

  const perPersonLabel = Number.isFinite(summary.tourPrice)

    ? t("checkout.summary.perTraveler", { amount: summary.tourPrice.toFixed(2) })

    : t("checkout.summary.pricePerTravelerFallback");



  const contactSummary = useMemo(() => {

    if (!contact.firstName && !contact.email) return "";

    const traveler =
      `${contact.firstName} ${contact.lastName}`.trim() || t("checkout.contact.summary.travelerPlaceholder");

    const emailLabel = contact.email || t("checkout.contact.summary.noEmail");

    const phoneLabel = contact.phone ? `${phoneCountry.dial} ${contact.phone}` : t("checkout.contact.summary.noPhone");

    const flightLabel = flightNumber.trim()
      ? t("checkout.contact.summary.flightPrefix", { flightNumber: flightNumber.trim() })
      : t("checkout.contact.summary.flightPending");
    const sections = [`${traveler} · ${emailLabel} · ${phoneLabel}`];
    if (isTransferFlow) {
      sections.push(flightLabel);
    }
    return sections.join(" · ");
  }, [contact, phoneCountry, flightNumber, isTransferFlow, t]);



  const travelerSummary = useMemo(() => {

    if (!travelerName) return t("checkout.details.travelerSummary.empty");

    const pickupLabel =

      pickupPreference === "pickup"
        ? pickupLocation || t("checkout.details.pickup.defaultPoint")
        : t("checkout.details.pickup.pendingPoint");

    return `${travelerName} · ${pickupLabel}`;

  }, [travelerName, pickupLocation, pickupPreference, t]);



  const missingTourId = !summary.tourId && !isTransferFlow;

  const countdownExpires = sessionExpired ? Date.now() : sessionExpiresAt ?? Date.now() + SESSION_TTL_MS;

  const countdownOnExpire = useCallback(() => {

    handleSessionExpire(currentSession ?? undefined);

  }, [handleSessionExpire, currentSession]);



  const handleContactChange = (field: keyof ContactState) => (event: ChangeEvent<HTMLInputElement>) => {

    const nextValue = event.target.value;

    setContact((prev) => {

      const next = { ...prev, [field]: nextValue };

      if (field === "email" && paymentEmailField === prev.email) {

        setPaymentEmailField(nextValue);

      }

      return next;

    });

    setErrors((prev) => {

      const next = { ...prev };

      delete next[field];

      return next;

    });

  };



  const handleTravelerChange = (value: string) => {

    setTravelerName(value);

    setErrors((prev) => {

      const next = { ...prev };

      delete next.travelerName;

      return next;

    });

  };



  const handlePickupLocationChange = (value: string) => {

    setPickupLocation(value);

    setErrors((prev) => {

      const next = { ...prev };

      delete next.pickupLocation;

      return next;

    });

  };

  useEffect(() => {
    if (!isTransferFlow) return;
    if (travelerName.trim()) return;
    const derivedName = `${contact.firstName} ${contact.lastName}`.trim();
    if (derivedName) {
      setTravelerName(derivedName);
    }
  }, [isTransferFlow, contact.firstName, contact.lastName, travelerName]);

  useEffect(() => {
    if (!isTransferFlow || pickupPreference !== "pickup") return;
    if (pickupLocation.trim()) return;
    const defaultPickup = summary.originLabel ?? summary.origin ?? "";
    if (defaultPickup) {
      setPickupLocation(defaultPickup);
    }
  }, [isTransferFlow, pickupPreference, pickupLocation, summary.originLabel, summary.origin]);



  const transferTourId = process.env.NEXT_PUBLIC_TRANSFER_TOUR_ID;

  const triggerPaymentIntent = async () => {

    const needsTransferFallback = isTransferFlow && !summary.tourId;
    if (needsTransferFallback && !transferTourId) {
      return;
    }

    if (intentReady || intentLoading || (!summary.tourId && !isTransferFlow)) return;

    setIntentLoading(true);

    setIntentError(null);

    setPaymentFeedback(null);



    try {

      const payload = {

        tourId: summary.tourId,

        tourTitle: summary.tourTitle,

        tourImage: summary.tourImage,

        tourPrice: summary.tourPrice,

        date: summary.date,

        time: summary.time,

        adults: summary.adults,

        youth: summary.youth,

        child: summary.children,

        hotelSlug: summary.hotelSlug,

        bookingCode: summary.bookingCode,

        originHotelName: summary.originHotelName,

        firstName: contact.firstName.trim(),

        lastName: contact.lastName.trim(),

        email: contact.email.trim(),

        phone: contact.phone.trim(),

        phoneCountry: phoneCountry.code,

        pickupPreference,

        pickupLocation:

          pickupPreference === "pickup" ? pickupLocation.trim() : "Decidiré el punto más tarde",

        language,

        specialRequirements: specialRequirements.trim(),

        flowType: isTransferFlow ? "transfer" : "tour",

        flightNumber: flightNumber.trim() || undefined,

        paymentOption: "now"

      };



      const response = await fetch("/api/checkout/payment-intent", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(payload)

      });



      const text = await response.text();

      let data: any = {};

      if (text) {

        try {

          data = JSON.parse(text);

        } catch (err) {

          data = { error: text };

        }

      }

      if (!response.ok || !data.clientSecret) {

        throw new Error(

          data?.error ??

            `No se pudo preparar el pago${text ? `: ${text}` : ""}`

        );

      }



      setClientSecret(data.clientSecret);

      setBookingId(data.bookingId ?? null);

      if (data.bookingId) {
        const isSecure = window.location.protocol === "https:";
        const secureFlag = isSecure ? "; secure" : "";
        document.cookie = `${BOOKING_ID_COOKIE_NAME}=${data.bookingId}; path=/; max-age=${BOOKING_ID_COOKIE_MAX_AGE}; samesite=lax${secureFlag}`;
      }
      setIntentReady(true);

    } catch (error) {

      setIntentError(error instanceof Error ? error.message : "Error preparando el pago");

      setIntentReady(false);

    } finally {

      setIntentLoading(false);

    }

  };



  const handleNext = (currentIndex: number) => {
    const nextErrors: Record<string, string> = {};



    if (currentIndex === 0) {

      if (!contact.firstName.trim()) nextErrors.firstName = t("checkout.validation.firstNameRequired");

      if (!contact.lastName.trim()) nextErrors.lastName = t("checkout.validation.lastNameRequired");

      if (!contact.email.trim()) nextErrors.email = t("checkout.validation.emailRequired");

      if (!contact.phone.trim()) nextErrors.phone = t("checkout.validation.phoneRequired");

    }



    if (currentIndex === 1) {

      if (!travelerName.trim()) nextErrors.travelerName = t("checkout.validation.travelerNameRequired");

      if (pickupPreference === "pickup" && !pickupLocation.trim()) {

        nextErrors.pickupLocation = t("checkout.validation.pickupLocationRequired");

      }

    }



    if (Object.keys(nextErrors).length) {

      setErrors(nextErrors);

      const field = Object.keys(nextErrors)[0];

      const target = document.getElementById(field);

      if (target) {

        target.scrollIntoView({ behavior: "smooth", block: "center" });

      }

      return;

    }



    if (currentIndex === 0) {

      void triggerPaymentIntent();

    }



    setCompletedSteps((prev) => {

      const next = [...prev];

      next[currentIndex] = true;

      return next;

    });



    const nextStep = Math.min(2, currentIndex + 1);
    setActiveStep(nextStep);

  };

;

  return (

    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-10">

      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[2.2fr_1fr]">

        <section className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">

          <header className="space-y-2">

            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{t("checkout.hero.tagline")}</p>

            <h1 className="text-3xl font-semibold text-slate-900">{t("checkout.hero.title")}</h1>

            <p className="text-sm text-slate-600">{t("checkout.hero.description")}</p>

          </header>



          {sessionExpired && (

            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">

              <p>
                {t("checkout.sessionExpired.beforeTour")}
                <strong>{summary.tourTitle}</strong>
                {t("checkout.sessionExpired.middle")}
                <strong>{sessionRedirectTarget ?? "/tours"}</strong>
                {t("checkout.sessionExpired.afterRedirect")}
              </p>

            </div>

          )}



          {missingTourId && (

            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">

              <p>{t("checkout.missingTour.message")}</p>

              <Link href="/tours" className="font-semibold text-rose-600 underline">

                {t("checkout.missingTour.cta")}

              </Link>

            </div>

          )}



          {intentError && (

            <div className="flex items-start gap-2 rounded-2xl bg-rose-50 p-4 text-sm text-rose-600">

              <AlertTriangle className="h-4 w-4" /> {intentError}

            </div>

          )}



          <div className="space-y-6">

            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

                  <div className="flex items-center justify-between bg-slate-100 px-5 py-4">

                    <div>

                      <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{t("checkout.step.contact")}</p>

                      <p className="text-lg font-semibold text-slate-900">{t("checkout.section.contact.heading")}</p>

                      {contactSummary && <p className="text-sm text-slate-500">{contactSummary}</p>}

                    </div>

                    <span className="flex items-center gap-2 text-sm font-semibold text-[#008768]">

                      {completedSteps[0] ? (

                        <>

                          <BadgeCheck className="h-4 w-4 text-emerald-500" />{" "}
                          <span className="text-emerald-700">{t("checkout.status.completed")}</span>

                        </>

                      ) : (

                        <span>{activeStep === 0 ? t("checkout.status.active") : t("checkout.status.pending")}</span>

                      )}

                    </span>

                  </div>

              {activeStep === 0 && (

                <div className="space-y-4 px-5 pb-6 pt-6">

                  <div className="grid gap-4 md:grid-cols-2">

                    {contactFields.map((field) => (

                      <label key={field.key} className="space-y-1 text-xs uppercase tracking-[0.3em] text-slate-500">

                        <span>{field.label}</span>

                        <input

                          id={field.key}

                          type={field.type}

                          value={contact[field.key]}

                          placeholder={field.placeholder}

                          onChange={handleContactChange(field.key)}

                          className={`w-full rounded-2xl border px-4 py-3 text-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${

                            errors[field.key] ? "border-rose-500 ring-2 ring-rose-100" : "border-slate-200"

                          }`}

                        />

                        {errors[field.key] && <p className="text-xs text-rose-500">{errors[field.key]}</p>}

                      </label>

                    ))}

                  </div>

                  <div className="space-y-1">

                    <label className="text-xs uppercase tracking-[0.3em] text-slate-500" htmlFor="phone">

                      {t("checkout.contact.phone.label")}

                    </label>

                    <div className="flex gap-3">

                      <select

                        value={phoneCountry.code}

                        onChange={(event) => {

                          const next = phoneCountries.find((country) => country.code === event.target.value);

                          if (next) setPhoneCountry(next);

                        }}

                        className="w-36 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm"

                      >

                        {phoneCountries.map((country) => (

                          <option key={country.code} value={country.code}>

                            {country.code} {country.dial}

                          </option>

                        ))}

                      </select>

                      <input

                        id="phone"

                        type="tel"

                        value={contact.phone}

                        onChange={handleContactChange("phone")}

                        placeholder="809 000 0000"

                        className={`flex-1 rounded-2xl border px-4 py-3 text-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${

                          errors.phone ? "border-rose-500 ring-2 ring-rose-100" : "border-slate-200"

                        }`}

                      />

                    </div>

                    {errors.phone && <p className="text-xs text-rose-500">{errors.phone}</p>}

                  </div>

                  {isTransferFlow && (
                    <div className="space-y-2">
                      <label htmlFor="flightNumber" className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        {t("checkout.flightNumber.label")}
                      </label>
                      <input
                        id="flightNumber"
                        value={flightNumber}
                        onChange={(event) => setFlightNumber(event.target.value)}
                        placeholder="PUJ 123"
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                      <p className="text-xs text-slate-500">{t("checkout.flightNumber.help")}</p>
                    </div>
                  )}
                  <div className="flex justify-end">

                    <button

                      type="button"

                      onClick={() => handleNext(0)}

                      className="rounded-2xl bg-[#008768] px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-700"

                    >

                      {t("checkout.buttons.next")}

                    </button>

                  </div>

                </div>

              )}

              </article>


            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

                <div className="flex items-center justify-between bg-slate-100 px-5 py-4">

                  <div>

                    <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{t("checkout.step.details")}</p>

                    <p className="text-lg font-semibold text-slate-900">
                      {isTransferFlow ? t("checkout.details.transferHeading") : t("checkout.details.activityHeading")}
                    </p>

                    {travelerSummary && <p className="text-sm text-slate-500">{travelerSummary}</p>}

                  </div>

                  <span className="flex items-center gap-2 text-sm font-semibold text-[#008768]">

                    {completedSteps[1] ? (

                      <>

                        <BadgeCheck className="h-4 w-4 text-emerald-500" />{" "}
                        <span className="text-emerald-700">{t("checkout.status.completed")}</span>

                      </>

                    ) : (

                      <span>{activeStep === 1 ? t("checkout.status.active") : t("checkout.status.pending")}</span>

                    )}

                  </span>

                </div>

              {activeStep === 1 && (

                <div className="space-y-5 px-5 pb-6 pt-6">

                  <div className="space-y-2">

                    <label htmlFor="travelerName" className="text-xs uppercase tracking-[0.3em] text-slate-500">

                      {t("checkout.details.mainTraveler")}

                    </label>

                    <input

                      id="travelerName"

                      value={travelerName}

                      onChange={(event) => handleTravelerChange(event.target.value)}

                      placeholder={t("checkout.details.travelerPlaceholder")}

                      className={`w-full rounded-2xl border px-4 py-3 text-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${

                        errors.travelerName ? "border-rose-500" : "border-slate-200"

                      }`}

                    />

                    {errors.travelerName && <p className="text-xs text-rose-500">{errors.travelerName}</p>}

                  </div>

                  <div className="space-y-2">

                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("checkout.details.pickupPoint")}</p>

                    <div className="grid gap-3 md:grid-cols-2">

                      <label

                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${

                          pickupPreference === "pickup" ? "border-[#008768] bg-emerald-50" : "border-slate-200"

                        }`}

                      >

                        <input

                          type="radio"

                          name="pickup"

                          checked={pickupPreference === "pickup"}

                          onChange={() => setPickupPreference("pickup")}

                        />

                        {t("checkout.details.pickupOption.pickup")}

                      </label>

                      <label

                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${

                          pickupPreference === "later" ? "border-[#008768] bg-emerald-50" : "border-slate-200"

                        }`}

                      >

                        <input

                          type="radio"

                          name="pickup"

                          checked={pickupPreference === "later"}

                          onChange={() => setPickupPreference("later")}

                        />

                        {t("checkout.details.pickupOption.later")}

                      </label>

                    </div>

                    {pickupPreference === "pickup" && (

                      <div className="space-y-2">

                        <label htmlFor="pickupLocation" className="text-xs uppercase tracking-[0.3em] text-slate-500">

                          {t("checkout.details.pickupLocation.label")}

                        </label>

                        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">

                          <MapPin className="h-5 w-5 text-emerald-500" />

                          <input

                            id="pickupLocation"

                            value={pickupLocation}

                            onChange={(event) => handlePickupLocationChange(event.target.value)}

                            placeholder={t("checkout.details.pickupLocation.placeholder")}

                            className="w-full bg-transparent text-sm outline-none"

                          />

                        </div>

                        {errors.pickupLocation && <p className="text-xs text-rose-500">{errors.pickupLocation}</p>}

                      </div>

                    )}

                  </div>

                  <div className="grid gap-4 md:grid-cols-2">

                    <label className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("checkout.details.language.label")}</label>

                    <select

                      value={language}

                      onChange={(event) => setLanguage(event.target.value)}

                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"

                    >

                      {languageOptions.map((option) => (

                        <option key={option} value={option}>

                          {option}

                        </option>

                      ))}

                    </select>

                  </div>

                  <div className="space-y-2">

                    <label className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("checkout.details.specialRequirements.label")}</label>

                    <textarea

                      value={specialRequirements}

                      onChange={(event) => setSpecialRequirements(event.target.value)}

                      rows={3}

                      placeholder={t("checkout.details.specialRequirements.placeholder")}

                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"

                    />

                  </div>

                  <div className="flex items-center justify-between">

                      <button

                        type="button"

                        onClick={() => setActiveStep(0)}

                        className="flex items-center gap-2 text-sm font-semibold text-slate-600"

                      >

                        <ArrowLeft className="h-4 w-4" /> {t("checkout.buttons.back")}

                      </button>

                    <button

                      type="button"

                      onClick={() => handleNext(1)}

                      className="rounded-2xl bg-[#008768] px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-700"

                    >

                      {t("checkout.buttons.next")}

                    </button>

                  </div>

                </div>

              )}

              </article>
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

              <div className="flex items-center justify-between bg-slate-100 px-5 py-4">

                <div>

                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{t("checkout.step.payment")}</p>

                  <p className="text-lg font-semibold text-slate-900">{t("checkout.section.payment.heading")}</p>

                  <p className="text-sm text-slate-500">
                    {t("checkout.summary.tripMeta", {
                      travelers: summary.totalTravelers,
                      date: summary.date,
                      time: summary.time
                    })}
                  </p>

                </div>

                <span className="flex items-center gap-2 text-sm font-semibold text-[#008768]">

                  {completedSteps[2] ? (

                    <>

                      <BadgeCheck className="h-4 w-4 text-emerald-500" />{" "}
                      <span className="text-emerald-700">{t("checkout.status.completed")}</span>

                    </>

                  ) : (

                    <span>{activeStep === 2 ? t("checkout.status.active") : t("checkout.status.pending")}</span>

                  )}

                </span>

              </div>

              {activeStep === 2 && (

                <div className="space-y-4 px-5 pb-6 pt-6">

                  <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4 text-sm text-slate-600">

                    <p className="text-sm font-semibold text-slate-900">{t("checkout.payment.summaryHeading")}</p>

                    <p>

                      {t("checkout.summary.tripMeta", {
                        travelers: summary.totalTravelers,
                        date: summary.date,
                        time: summary.time
                      })}

                    </p>

                    <p className="text-slate-400">
                      {t("checkout.payment.provisionalPrefix")}
                      {bookingId ?? t("checkout.payment.provisionalPending")}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    {!stripePromise && (
                      <p className="text-sm text-rose-500">{t("checkout.payment.stripeMissing")}</p>
                    )}
                    {intentLoading && <p className="text-sm text-slate-600">{t("checkout.payment.preparing")}</p>}

                    {clientSecret && stripePromise ? (

                      <Elements stripe={stripePromise} options={{ clientSecret }}>

                        <PaymentForm

                          paymentEmailField={paymentEmailField}

                          setPaymentEmailField={setPaymentEmailField}

                          paymentFeedback={paymentFeedback}

                          setPaymentFeedback={setPaymentFeedback}

                          paymentLoading={paymentLoading}

                          setPaymentLoading={setPaymentLoading}

                          activePaymentMethod={activePaymentMethod}

                          setActivePaymentMethod={setActivePaymentMethod}

                          paymentCountry={paymentCountry}

                          setPaymentCountry={setPaymentCountry}

                          paymentMethods={paymentMethods}

                          returnUrl={successRedirectBase}

                          onBack={goBackFromPayment}

                          onSuccess={handlePaymentSuccess}

                        />

                      </Elements>

                    ) : (

                      !intentLoading && (

                        <p className="text-sm text-slate-500">{t("checkout.payment.requirements")}</p>

                      )

                    )}

                  </div>

                </div>

              )}

            </article>

          </div>

        </section>

        <aside className="space-y-4">

          <div className="space-y-6 lg:sticky lg:top-8">

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-lg">

              <div className="flex items-center gap-3 rounded-2xl bg-pink-50 px-3 py-2 text-sm font-semibold text-rose-600">

                <Clock3 className="h-4 w-4" /> {t("checkout.summary.hold")}{" "}

                <CountdownTimer expires={countdownExpires} onExpire={countdownOnExpire} />

              </div>

              <div className="mt-4 flex items-center gap-3 border-b border-slate-100 pb-4">

                <Image

                  src={summary.tourImage}

                  alt={summary.tourTitle}

                  width={80}

                  height={80}

                  className="h-[80px] w-[80px] rounded-2xl object-cover"

                />

                <div>

                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">

                    {isTransferFlow ? t("checkout.summary.type.transfer") : t("checkout.summary.type.tour")}

                  </p>

                  <p className="text-lg font-semibold text-slate-900">{summary.tourTitle}</p>

                  {isTransferFlow && (

                    <p className="text-[11px] uppercase tracking-[0.4em] text-slate-500">

                    {summary.originHotelName ?? t("checkout.summary.defaultHotel")}

                    </p>

                  )}

                </div>

              </div>

              <div className="space-y-3 text-sm text-slate-600">

                <div className="flex items-center justify-between">

                  <span className="flex items-center gap-2">

                    <Users className="h-5 w-5 text-slate-400" /> {t("checkout.summary.persons")}

                  </span>

                    <strong>

                      {t("checkout.summary.travelersBreakdown", {
                        adults: summary.adults,
                        children: summary.children
                      })}

                    </strong>

                </div>

                <div className="flex items-center justify-between">

                  <span className="flex items-center gap-2">

                    <CalendarCheck className="h-5 w-5 text-slate-400" /> {t("checkout.summary.date")}

                  </span>

                  <strong>{summary.date}</strong>

                </div>

                <div className="flex items-center justify-between">

                  <span className="flex items-center gap-2">

                    <Clock3 className="h-5 w-5 text-slate-400" /> {t("checkout.summary.time")}

                  </span>

                  <strong>{summary.time}</strong>

                </div>
                {isTransferFlow && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-slate-400" /> {t("checkout.summary.origin")}
                      </span>
                        <strong>
                          {summary.originLabel ?? summary.origin ?? t("checkout.summary.originFallback")}
                        </strong>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-slate-400" /> {t("checkout.summary.destination")}
                        </span>
                        <strong>{summary.originHotelName ?? t("checkout.summary.defaultHotel")}</strong>
                    </div>
                  </>
                )}

              </div>

              <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-50 p-3 text-[13px] text-emerald-700">

                <div className="flex items-center gap-2 text-[13px] font-semibold">

                  <BadgeCheck className="h-4 w-4" /> {t("checkout.summary.confidence")}

                </div>

                <p>{t("checkout.summary.flexibility")}</p>

              </div>

              <div className="mt-4 rounded-3xl border border-slate-200 bg-gray-50 p-5 text-slate-900 shadow-sm">

                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{t("checkout.summary.priceLabel")}</p>

                <p className="text-3xl font-semibold text-slate-900">{displayAmount}</p>

                <p className="mt-1 text-[13px] text-slate-500">{perPersonLabel}</p>

              </div>

              <div className="mt-4 space-y-3 rounded-2xl border border-dashed border-slate-200 p-4 text-xs text-slate-500">

                <div className="flex items-center gap-2">

                  <ShieldCheck className="h-4 w-4 text-emerald-500" /> {t("checkout.summary.paymentSecurity")}

                </div>

                <div className="flex items-center gap-2">

                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t("checkout.summary.support")}

                </div>

                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.4em] text-slate-400">

                  <Globe className="h-4 w-4 text-slate-400" /> {t("checkout.summary.globalInfrastructure")}

                </div>

              </div>

            </div>

          </div>

        </aside>

      </div>

    </div>

  );

}



type PaymentFormProps = {

  paymentEmailField: string;

  setPaymentEmailField: Dispatch<SetStateAction<string>>;

  paymentFeedback: string | null;

  setPaymentFeedback: Dispatch<SetStateAction<string | null>>;

  paymentLoading: boolean;

  setPaymentLoading: Dispatch<SetStateAction<boolean>>;

  activePaymentMethod: PaymentMethodId;

  setActivePaymentMethod: Dispatch<SetStateAction<PaymentMethodId>>;

  paymentCountry: string;

  setPaymentCountry: Dispatch<SetStateAction<string>>;

  paymentMethods: PaymentMethodDefinition[];

  returnUrl: string;

  onBack: () => void;

  onSuccess: () => void;

};



const PaymentForm = memo(function PaymentForm({
  paymentEmailField,
  setPaymentEmailField,
  paymentFeedback,
  setPaymentFeedback,
  paymentLoading,
  setPaymentLoading,
  activePaymentMethod,
  setActivePaymentMethod,
  paymentCountry,
  setPaymentCountry,
  paymentMethods,
  returnUrl,
  onBack,
  onSuccess
}: PaymentFormProps) {
  const { t } = useTranslation();

  const stripe = useStripe();

  const elements = useElements();



  const handleSubmit = async (event: FormEvent) => {

    event.preventDefault();

    if (!stripe || !elements) {

      setPaymentFeedback(t("checkout.paymentForm.stripeNotReady"));

      return;

    }



    setPaymentLoading(true);

    setPaymentFeedback(null);



    const result = await stripe.confirmPayment({

      elements,

      confirmParams: {

        return_url: returnUrl

      },

      redirect: "if_required"

    });



    if (result.error) {

      setPaymentFeedback(result.error.message ?? t("checkout.paymentForm.errorProcessing"));

      setPaymentLoading(false);

      return;

    }



    if (result.paymentIntent?.status === "succeeded") {

      onSuccess();

      return;

    }



    setPaymentFeedback(t("checkout.paymentForm.paymentInitiated"));

    setPaymentLoading(false);

  };



  return (

    <form onSubmit={handleSubmit} className="space-y-6">

      <div className="space-y-2">

        <label className="text-xs uppercase tracking-[0.3em] text-slate-500" htmlFor="paymentEmail">

          {t("checkout.paymentForm.emailLabel")}

        </label>

        <input

          id="paymentEmail"

          type="email"

          value={paymentEmailField}

          onChange={(event) => setPaymentEmailField(event.target.value)}

          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"

          placeholder={t("checkout.paymentForm.emailPlaceholder")}

        />

      </div>



      <div className="space-y-4">

        {paymentMethods.map((method) => {

          const isActive = activePaymentMethod === method.id;

          return (

            <div

              key={method.id}

              className={`overflow-hidden rounded-2xl border transition ${isActive ? "border-[#008768]" : "border-slate-200"}`}

            >

              <button

                type="button"

                onClick={() => setActivePaymentMethod(method.id)}

                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm"

              >

                <div className="flex items-center gap-3">

                  <method.icon className="h-5 w-5 text-slate-600" />

                  <div>

                    <p className="font-semibold text-slate-900">{method.label}</p>

                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{method.description}</p>

                  </div>

                </div>

                <span className="text-xs font-semibold text-slate-500">
                  {isActive ? t("checkout.paymentForm.active") : t("checkout.paymentForm.select")}
                </span>

              </button>

              {isActive && (

                <div className="bg-slate-50 px-5 pb-5 pt-0">

                  {method.id === "card" ? (

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                      <PaymentElement id="payment-element" />

                    </div>

                  ) : (

                    <p className="text-sm text-slate-600">

                      {t("checkout.paymentForm.methodFallback", { methodDescription: method.description })}

                    </p>

                  )}

                </div>

              )}

            </div>

          );

        })}

      </div>



      <div className="space-y-2">

        <label htmlFor="paymentCountry" className="text-xs uppercase tracking-[0.3em] text-slate-500">

          {t("checkout.paymentForm.countryLabel")}

        </label>

        <input

          id="paymentCountry"

          list="country-list"

          value={paymentCountry}

          onChange={(event) => setPaymentCountry(event.target.value)}

          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"

          placeholder={t("checkout.paymentForm.countryPlaceholder")}

        />

        <datalist id="country-list">

          {paymentCountryOptions.map((country) => (

            <option key={country} value={country} />

          ))}

        </datalist>

      </div>



      {paymentFeedback && <p className="text-sm text-rose-500">{paymentFeedback}</p>}



      <div className="flex items-center justify-between gap-4">

        <button

          type="button"

          onClick={onBack}

          className="flex items-center gap-2 text-sm font-semibold text-slate-600"

        >

          <ArrowLeft className="h-4 w-4" /> {t("checkout.paymentForm.back")}

        </button>

        <button

          type="submit"

          disabled={paymentLoading}

          className="w-[65%] rounded-2xl bg-[#008768] px-5 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"

        >

          {paymentLoading ? t("checkout.paymentForm.processing") : t("checkout.paymentForm.confirmAndPay")}

        </button>

      </div>

    </form>

  );

});



