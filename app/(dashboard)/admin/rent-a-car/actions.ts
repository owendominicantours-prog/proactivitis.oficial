"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/adminAccess";
import { getRentCarFleetSettings, saveRentCarFleetSettings } from "@/lib/rentCarSettings";
import {
  defaultRentCarFleetSettings,
  getRentCarOptionPath,
  getRentCarOptions,
  getRentCarRootPath,
  normalizeRentCarFleetSettings,
  rentCarMarginTypes,
  type RentCarFuelType,
  type RentCarFleetSettings,
  type RentCarLocale,
  type RentCarLocationSetting,
  type RentCarMargin,
  type RentCarTransmission,
  type RentCarVehicleSetting
} from "@/data/rentCarFleet";

const locales: RentCarLocale[] = ["es", "en", "fr"];

const readField = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const readNumber = (formData: FormData, key: string, fallback: number) => {
  const parsed = Number(readField(formData, key));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const readSearchTerms = (value: string) =>
  value
    .split(/\r?\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeMargin = (value: string): RentCarMargin =>
  rentCarMarginTypes.includes(value as RentCarMargin) ? (value as RentCarMargin) : "economy";
const normalizeTransmission = (value: string): RentCarTransmission =>
  value === "Manual" ? "Manual" : "Automatic";
const normalizeFuelType = (value: string): RentCarFuelType =>
  value === "Hybrid" || value === "Diesel" || value === "Electric" ? value : "Gasoline";

const revalidateRentCar = (settings: RentCarFleetSettings) => {
  revalidatePath("/admin/rent-a-car");
  revalidatePath("/sitemap-rent-a-car.xml");
  locales.forEach((locale) => revalidatePath(getRentCarRootPath(locale)));
  locales.forEach((locale) => {
    getRentCarOptions(undefined, settings).forEach((option) => {
      revalidatePath(getRentCarOptionPath(option.locationId, option.categorySlug, locale));
    });
  });
};

export async function updateRentCarVehicleAction(formData: FormData) {
  await requireAdminSession();

  const slug = readField(formData, "slug");
  if (!slug) throw new Error("El slug del vehiculo es obligatorio.");

  const settings = await getRentCarFleetSettings();
  const current = settings.vehicles.find((vehicle) => vehicle.slug === slug);
  const bagCount = Math.max(
    0,
    Math.round(readNumber(formData, "bags", readNumber(formData, "luggage", current?.bags ?? current?.luggage ?? 1)))
  );
  const vehicle: RentCarVehicleSetting = {
    slug,
    model: readField(formData, "model") || current?.model || slug,
    basePrice: Math.max(0, readNumber(formData, "basePrice", current?.basePrice ?? 0)),
    label: readField(formData, "label") || current?.label || "Vehicle",
    displayName: readField(formData, "displayName") || current?.displayName || "Rent a Car",
    tag: readField(formData, "tag") || current?.tag || "Proactivitis",
    seats: Math.max(1, Math.round(readNumber(formData, "seats", current?.seats ?? 4))),
    luggage: bagCount,
    doors: Math.max(0, Math.round(readNumber(formData, "doors", current?.doors ?? 4))),
    transmission: normalizeTransmission(readField(formData, "transmission") || current?.transmission || "Automatic"),
    fuelType: normalizeFuelType(readField(formData, "fuelType") || current?.fuelType || "Gasoline"),
    airConditioning: formData.get("airConditioning") === "on",
    bags: bagCount,
    largeBags: Math.max(0, Math.round(readNumber(formData, "largeBags", current?.largeBags ?? current?.luggage ?? 1))),
    bluetooth: formData.get("bluetooth") === "on",
    usb: formData.get("usb") === "on",
    appleCarplay: formData.get("appleCarplay") === "on",
    androidAuto: formData.get("androidAuto") === "on",
    fourByFour: formData.get("fourByFour") === "on",
    convertible: formData.get("convertible") === "on",
    image: readField(formData, "image") || current?.image || "/transfer/sedan.png",
    priority: Math.round(readNumber(formData, "priority", current?.priority ?? 10)),
    margin: normalizeMargin(readField(formData, "margin") || current?.margin || "economy"),
    active: formData.get("active") === "on"
  };

  const nextSettings = normalizeRentCarFleetSettings({
    ...settings,
    lastUpdate: new Date().toISOString().slice(0, 10),
    vehicles: [
      ...settings.vehicles.filter((item) => item.slug !== slug),
      vehicle
    ]
  });

  const saved = await saveRentCarFleetSettings(nextSettings);
  revalidateRentCar(saved);
}

export async function updateRentCarLocationAction(formData: FormData) {
  await requireAdminSession();

  const id = readField(formData, "id");
  if (!id) throw new Error("El ID de la zona es obligatorio.");

  const settings = await getRentCarFleetSettings();
  const current = settings.locations.find((location) => location.id === id);
  const location: RentCarLocationSetting = {
    id,
    code: readField(formData, "code") || current?.code || id.toUpperCase().slice(0, 4),
    name: readField(formData, "name") || current?.name || id,
    regionId: readField(formData, "regionId") || current?.regionId || id.toUpperCase().replace(/-/g, "_"),
    airportLabel: readField(formData, "airportLabel") || current?.airportLabel || "",
    highProfile: formData.get("highProfile") === "on",
    searchTerms: readSearchTerms(readField(formData, "searchTerms")),
    multiplier: Math.max(0, readNumber(formData, "multiplier", current?.multiplier ?? 1)),
    active: formData.get("active") === "on"
  };

  if (!location.searchTerms.length && current?.searchTerms.length) {
    location.searchTerms = current.searchTerms;
  }

  const nextSettings = normalizeRentCarFleetSettings({
    ...settings,
    lastUpdate: new Date().toISOString().slice(0, 10),
    locations: [
      ...settings.locations.filter((item) => item.id !== id),
      location
    ]
  });

  const saved = await saveRentCarFleetSettings(nextSettings);
  revalidateRentCar(saved);
}

export async function resetRentCarFleetSettingsAction() {
  await requireAdminSession();

  const saved = await saveRentCarFleetSettings(defaultRentCarFleetSettings);
  revalidateRentCar(saved);
}
