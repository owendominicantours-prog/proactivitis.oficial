"use client";

import { useEffect, useMemo, useState } from "react";

type TourOptionDraft = {
  id: string;
  name: string;
  type: string;
  description: string;
  pricePerPerson: string;
  basePrice: string;
  baseCapacity: string;
  extraPricePerPerson: string;
  pickupTimes: string;
  isDefault: boolean;
  active: boolean;
};

export type TourOptionPayload = {
  name: string;
  type?: string;
  description?: string;
  pricePerPerson?: number;
  basePrice?: number;
  baseCapacity?: number;
  extraPricePerPerson?: number;
  pickupTimes?: string[];
  isDefault?: boolean;
  active?: boolean;
  sortOrder?: number;
};

type TourOptionsEditorProps = {
  name?: string;
  initialOptions?: TourOptionPayload[];
  onChange?: (options: TourOptionPayload[]) => void;
};

const createOptionId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const emptyOption = (): TourOptionDraft => ({
  id: createOptionId(),
  name: "",
  type: "",
  description: "",
  pricePerPerson: "",
  basePrice: "",
  baseCapacity: "",
  extraPricePerPerson: "",
  pickupTimes: "",
  isDefault: false,
  active: true
});

const parseNumber = (value: string) => {
  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isNaN(parsed) ? undefined : parsed;
};

export function TourOptionsEditor({ initialOptions, onChange }: TourOptionsEditorProps) {
  const [options, setOptions] = useState<TourOptionDraft[]>(() => {
    if (!initialOptions?.length) return [emptyOption()];
    return initialOptions.map((option, index) => ({
      id: createOptionId(),
      name: option.name ?? `Opcion ${index + 1}`,
      type: option.type ?? "",
      description: option.description ?? "",
      pricePerPerson: option.pricePerPerson?.toString() ?? "",
      basePrice: option.basePrice?.toString() ?? "",
      baseCapacity: option.baseCapacity?.toString() ?? "",
      extraPricePerPerson: option.extraPricePerPerson?.toString() ?? "",
      pickupTimes: option.pickupTimes?.join(", ") ?? "",
      isDefault: Boolean(option.isDefault),
      active: option.active !== false
    }));
  });

  const payload = useMemo<TourOptionPayload[]>(() => {
    return options
      .map((option, index) => {
        const pickupTimes = option.pickupTimes
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        return {
          name: option.name.trim(),
          type: option.type.trim() || undefined,
          description: option.description.trim() || undefined,
          pricePerPerson: parseNumber(option.pricePerPerson),
          basePrice: parseNumber(option.basePrice),
          baseCapacity: option.baseCapacity ? Number.parseInt(option.baseCapacity, 10) : undefined,
          extraPricePerPerson: parseNumber(option.extraPricePerPerson),
          pickupTimes: pickupTimes.length ? pickupTimes : undefined,
          isDefault: option.isDefault,
          active: option.active,
          sortOrder: index
        };
      })
      .filter((option) => option.name);
  }, [options]);

  useEffect(() => {
    onChange?.(payload);
  }, [payload, onChange]);

  useEffect(() => {
    const hasDefault = options.some((option) => option.isDefault);
    if (!hasDefault && options.length) {
      setOptions((prev) =>
        prev.map((option, index) => ({ ...option, isDefault: index === 0 }))
      );
    }
  }, [options]);

  const updateOption = (id: string, updates: Partial<TourOptionDraft>) => {
    setOptions((prev) =>
      prev.map((option) => (option.id === id ? { ...option, ...updates } : option))
    );
  };

  const removeOption = (id: string) => {
    setOptions((prev) => (prev.length > 1 ? prev.filter((option) => option.id !== id) : prev));
  };

  const handleDefaultToggle = (id: string) => {
    setOptions((prev) =>
      prev.map((option) => ({
        ...option,
        isDefault: option.id === id
      }))
    );
  };

  return (
    <div className="space-y-4">
      {options.map((option, index) => (
        <div key={option.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Opcion {index + 1}</p>
              <input
                value={option.name}
                onChange={(event) => updateOption(option.id, { name: event.target.value })}
                placeholder="Ej: Share boat trip"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={option.active}
                  onChange={(event) => updateOption(option.id, { active: event.target.checked })}
                />
                Activa
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <input
                  type="radio"
                  name="tourOptionDefault"
                  checked={option.isDefault}
                  onChange={() => handleDefaultToggle(option.id)}
                />
                Default
              </label>
            </div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              value={option.type}
              onChange={(event) => updateOption(option.id, { type: event.target.value })}
              placeholder="Tipo (shared, private, vip)"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
            <input
              value={option.description}
              onChange={(event) => updateOption(option.id, { description: event.target.value })}
              placeholder="Descripcion corta"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <input
              value={option.pricePerPerson}
              onChange={(event) => updateOption(option.id, { pricePerPerson: event.target.value })}
              placeholder="Precio por persona"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
            <input
              value={option.basePrice}
              onChange={(event) => updateOption(option.id, { basePrice: event.target.value })}
              placeholder="Precio base (grupo)"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
            <input
              value={option.baseCapacity}
              onChange={(event) => updateOption(option.id, { baseCapacity: event.target.value })}
              placeholder="Base pax"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
            <input
              value={option.extraPricePerPerson}
              onChange={(event) => updateOption(option.id, { extraPricePerPerson: event.target.value })}
              placeholder="Extra por persona"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <input
            value={option.pickupTimes}
            onChange={(event) => updateOption(option.id, { pickupTimes: event.target.value })}
            placeholder="Pickup times (comma separated, optional)"
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => removeOption(option.id)}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setOptions((prev) => [...prev, emptyOption()])}
        className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700"
      >
        Agregar opcion
      </button>
    </div>
  );
}
