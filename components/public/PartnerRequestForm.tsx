"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

const countryOptions = [
  "Dominican Republic",
  "Mexico",
  "Colombia",
  "United States",
  "Spain",
  "Brazil",
  "Peru",
  "Argentina",
  "Panama"
];

const serviceOptions = [
  "Tours",
  "Hospedaje",
  "Transporte",
  "Experiencias al aire libre",
  "Planificación de grupos",
  "Vuelos",
  "Eventos privados"
];

const fileToBase64 = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode(...chunk);
  }
  return window.btoa(binary);
};

type PartnerRequestFormProps = {
  role: "SUPPLIER" | "AGENCY";
  subtitle?: string;
  id?: string;
};

export default function PartnerRequestForm({ role, subtitle, id }: PartnerRequestFormProps) {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState(countryOptions[0]);
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef<number | null>(null);

  const hasServices = useMemo(() => selectedServices.length > 0, [selectedServices]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleServiceToggle = (option: string) => {
    setSelectedServices((current) =>
      current.includes(option) ? current.filter((value) => value !== option) : [...current, option]
    );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const targetFile = event.target.files?.[0] ?? null;
    setFile(targetFile);
  };

  const handleToast = (text: string) => {
    setToastMessage(text);
    setShowToast(true);
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setShowToast(false);
    }, 4500);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    if (!hasServices) {
      setMessage("Selecciona al menos un tipo de servicio.");
      return;
    }

    if (password.length < 8) {
      setMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    try {
      const payload: Record<string, unknown> = {
        role,
        companyName,
        contactName,
        contactRole,
        email,
        phone,
        country,
        website: website || null,
        serviceTypes: selectedServices,
        description,
        password,
        confirmPassword
      };

      if (file) {
        payload.documentName = file.name;
        payload.documentData = await fileToBase64(file);
      }

      const response = await fetch("/api/partner-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? "No se pudo enviar la solicitud");
      }

      setCompanyName("");
      setContactName("");
      setContactRole("");
      setEmail("");
      setPhone("");
      setCountry(countryOptions[0]);
      setWebsite("");
      setDescription("");
      setSelectedServices([]);
      setFile(null);
      setPassword("");
      setConfirmPassword("");
      setMessage(null);
      handleToast("Solicitud recibida. Un gestor de cuentas se pondrá en contacto en breve.");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {showToast && toastMessage ? (
        <div className="toast-card fixed top-6 right-6 z-50">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <p className="text-sm font-semibold">{toastMessage}</p>
          </div>
        </div>
      ) : null}

      <form
        id={id}
        onSubmit={handleSubmit}
        className="glass-card space-y-6 border border-white/40 p-8 shadow-xl tracking-tight"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Solicitud de {role === "SUPPLIER" ? "Supplier" : "Agency"}
          </p>
          {subtitle ? (
            <p className="mt-1 text-lg font-semibold text-slate-900">{subtitle}</p>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: "Nombre de la empresa", value: companyName, setter: setCompanyName },
          { label: "Nombre del contacto", value: contactName, setter: setContactName },
          { label: "Cargo del contacto", value: contactRole, setter: setContactRole },
          { label: "Correo electrónico", value: email, setter: setEmail, type: "email" },
          { label: "Teléfono", value: phone, setter: setPhone },
          { label: "País de operación", value: country, setter: (val: string) => setCountry(val), isSelect: true }
        ].map((field) => (
          <label key={field.label} className="block">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">{field.label}</span>
            {field.isSelect ? (
              <select
                value={country}
                onChange={(event) => field.setter(event.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none"
              >
                {countryOptions.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type ?? "text"}
                value={field.value}
                onChange={(event) => field.setter(event.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none"
              />
            )}
          </label>
        ))}
          <label className="block">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Sitio web</span>
            <input
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none"
              placeholder="https://"
            />
          </label>
        <label className="block relative">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Contraseña</span>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-8 text-[0.65rem] uppercase tracking-[0.3em] text-slate-500"
          >
            {showPassword ? "Ocultar" : "Ver"}
          </button>
        </label>
        <label className="block relative">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Repite la contraseña</span>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-8 text-[0.65rem] uppercase tracking-[0.3em] text-slate-500"
          >
            {showConfirmPassword ? "Ocultar" : "Ver"}
          </button>
        </label>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Tipo de servicio</p>
          <p className="text-sm text-slate-500">Selecciona los servicios que ofreces.</p>
          <div className="flex flex-wrap gap-2">
            {serviceOptions.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => handleServiceToggle(option)}
                className={`rounded-full border px-4 py-1 text-sm ${
                  selectedServices.includes(option)
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Descripción breve del servicio</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            rows={4}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Documentación adjunta (opcional)</span>
          <input
            type="file"
            className="mt-1"
            accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
            onChange={handleFileChange}
          />
          <p className="mt-1 text-xs text-slate-500">Aceptamos PDF, JPG, PNG y ZIP para respaldar tu operación.</p>
          {file && <p className="mt-1 text-xs text-slate-500">Archivo listo: {file.name}</p>}
        </label>

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="button-hover-effect flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                Procesando...
              </>
            ) : (
              "Enviar solicitud"
            )}
          </button>
          {message ? <p className="text-sm text-rose-500">{message}</p> : null}
        </div>
      </form>
    </div>
  );
}
