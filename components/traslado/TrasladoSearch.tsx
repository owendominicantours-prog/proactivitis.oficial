"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  DEFAULT_ZONE_ID,
  getTransferPrice,
  resolveZoneId,
  trasladoPricing,
  VehicleCategory
} from "@/data/traslado-pricing";

export type LocationOption = {
  name: string;
  slug: string;
  destinationName?: string | null;
  microZoneName?: string | null;
  microZoneSlug?: string | null;
  assignedZoneId?: string | null;
  transferDestinationId?: string | null;
};

export type OriginPoint = {
  id: string;
  name: string;
  slug: string;
  type: string;
  code: string | null;
  description: string | null;
  zoneId: string | null;
};

type OriginSelection =
  | { kind: "point"; point: OriginPoint; label: string }
  | { kind: "hotel"; hotel: LocationOption; label: string };

const stripDiacritics = (value?: string | null) =>
  value?.normalize("NFD").replace(/[\u0300-\u036f]/g, "") ?? "";

const normalizeValue = (value?: string | null) =>
  stripDiacritics(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ") ?? "";

const slugifyValue = (value?: string | null) =>
  value
    ?.trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-") ?? "";

const CUSTOM_PUJ_ZONE_SLUGS: Record<string, string[]> = {
  PUJ_BAVARO: ["puj-to-bavaro", "puj-to-cap-cana"],
  UVERO_MICHES: ["puj-to-uvero-alto", "puj-to-miches"],
  ROMANA_BAYAHIBE: ["puj-to-bayahibe"],
  SANTO_DOMINGO: ["puj-to-santo-domingo"],
  SAMANA: ["puj-to-samana"],
  NORTE_CIBAO: ["puj-to-puerto-plata", "puj-to-santiago"],
  SUR_PROFUNDO: ["puj-to-barahona"]
};

const VEHICLE_CATEGORIES: VehicleCategory[] = ["SEDAN", "VAN", "SUV", "VIP", "BUS"];

const fillRate = (base: Partial<Record<VehicleCategory, number>>) => {
  const complete: Record<VehicleCategory, number> = {
    SEDAN: base.SEDAN ?? 0,
    VAN: base.VAN ?? 0,
    SUV: base.SUV ?? 0,
    VIP: base.VIP ?? 0,
    BUS: base.BUS ?? 0
  };
  return complete;
};

const PUJ_ZONE_RATES: Record<string, Record<VehicleCategory, number>> = {
  "puj-to-bavaro": fillRate({ SEDAN: 35, VAN: 45, SUV: 65 }),
  "puj-to-cap-cana": fillRate({ SEDAN: 30, VAN: 40, SUV: 55 }),
  "puj-to-uvero-alto": fillRate({ SEDAN: 60, VAN: 75, SUV: 95 }),
  "puj-to-miches": fillRate({ SEDAN: 130, VAN: 160, SUV: 210 }),
  "puj-to-santo-domingo": fillRate({ SEDAN: 180, VAN: 220, SUV: 280 }),
  "puj-to-samana": fillRate({ SEDAN: 250, VAN: 300, SUV: 380 }),
  "puj-to-santiago": fillRate({ SEDAN: 280, VAN: 340, SUV: 420 }),
  "puj-to-bayahibe": fillRate({ SEDAN: 90, VAN: 110, SUV: 150 }),
  "puj-to-puerto-plata": fillRate({ SEDAN: 350, VAN: 420, SUV: 550 }),
  "puj-to-barahona": fillRate({ SEDAN: 450, VAN: 550, SUV: 700 })
};

const directZoneSlugMap: Record<string, string> = {
  PUJ_BAVARO: "puj-to-bavaro",
  ROMANA_BAYAHIBE: "puj-to-bayahibe",
  SANTO_DOMINGO: "puj-to-santo-domingo",
  SAMANA: "puj-to-samana",
  SUR_PROFUNDO: "puj-to-barahona"
};

const detectZoneSlug = (
  destinationZoneId: string,
  destinationLabel: string,
  hotel?: LocationOption | null
) => {
  const normalizedLabel = destinationLabel.trim().toLowerCase();
  if (destinationZoneId === "PUJ_BAVARO") {
    if (normalizedLabel.includes("cap cana")) return "puj-to-cap-cana";
    return "puj-to-bavaro";
  }
  if (destinationZoneId === "UVERO_MICHES") {
    const microName = hotel?.microZoneName?.toLowerCase() ?? "";
    if (microName.includes("miches") || normalizedLabel.includes("miches")) return "puj-to-miches";
    return "puj-to-uvero-alto";
  }
  if (destinationZoneId === "NORTE_CIBAO") {
    if (normalizedLabel.includes("santiago")) return "puj-to-santiago";
    return "puj-to-puerto-plata";
  }
  return directZoneSlugMap[destinationZoneId] ?? "puj-to-bavaro";
};

const vehicleCatalog = [
    {
      id: "sedan-standard",
      title: "Sedan Privado",
      type: "Economy",
      description: "Perfecto para parejas o viajes de negocios ligeros.",
      pax: 3,
      luggage: 2,
      image: "/transfer/sedan.png",
      features: ["Aire acondicionado potente", "Espacio para 2 maletas grandes", "Seguimiento del vuelo incluido"]
    },
    {
      id: "van-private",
      title: "Van Privada",
      type: "Family",
      description: "Ideal para familias o grupos de amigos con equipaje.",
      pax: 8,
      luggage: 8,
      image: "/transfer/mini van.png",
      features: ["Maletero amplio", "Puerta corredera", "Silla de bebe bajo peticion"]
    },
    {
      id: "suv-vip",
      title: "SUV Premium",
      type: "Luxury",
      description: "Viaja con estilo y discrecion con chofer bilingue.",
      pax: 5,
      luggage: 5,
      image: "/transfer/suv.png",
      features: ["Asientos de cuero", "Bebidas frias incluidas", "Chofer bilingue profesional"]
    },
    {
      id: "vip-luxury",
      title: "Limusina VIP",
      type: "Premium",
      description: "Privacidad total, bebidas premium y atencion dedicada.",
      pax: 3,
      luggage: 2,
      image: "/transfer/suv.png",
      features: ["Servicio champagne", "Chofer con traje", "Wi-Fi y cargadores"]
    },
    {
      id: "bus-group",
      title: "Bus Ejecutivo",
      type: "Group",
      description: "Ideal para grupos corporativos o bodas con equipaje y estilo.",
      pax: 18,
      luggage: 12,
      image: "/transfer/mini van.png",
      features: ["Wi-Fi a bordo", "Sistema de sonido", "Asientos reclinables"]
    }
  ];type VehicleOption = (typeof vehicleCatalog)[number] & { price: number };

const transferTourId = process.env.NEXT_PUBLIC_TRANSFER_TOUR_ID;
const transferTourTitle = process.env.NEXT_PUBLIC_TRANSFER_TITLE ?? "Transfer privado Proactivitis";
const transferTourImage = process.env.NEXT_PUBLIC_TRANSFER_IMAGE ?? "/transfer/sedan.png";

const bookingSteps = [
  { step: 1, name: "Selección de vehículo" },
  { step: 2, name: "Detalles del vuelo" },
  { step: 3, name: "Confirmación inmediata" }
];

const trustLabels = [
  "Precio final sin sorpresas",
  "Conductores profesionales",
  "Seguro de viaje incluido",
  "Cancelación gratis (24h)"
];

const pickupRules = [
  {
    title: "Datos de vuelo",
    description: "Aerolínea · Número de vuelo · Hora estimada de aterrizaje",
    note: "60 min de espera gratuita en el aeropuerto"
  },
  {
    title: "Recogida en hotel",
    description: "Hotel/dirección · Hora preferida de recogida",
    note: "15 min de espera en lobby · Recomendamos 4h antes de la salida"
  }
];

const vehicleCategoryMap: Record<string, VehicleCategory> = {
  "sedan-standard": "SEDAN",
  "van-private": "VAN",
  "suv-vip": "SUV",
  "vip-luxury": "VIP",
  "bus-group": "BUS"
};

const getAdjustedPrice = (
  originZoneId: string,
  destinationZoneId: string,
  vehicleCategory: VehicleCategory,
  destinationLabel: string,
  hotel?: LocationOption | null
) => {
  if (originZoneId === "PUJ_BAVARO") {
    const zoneSlug = detectZoneSlug(destinationZoneId, destinationLabel, hotel);
    const override = PUJ_ZONE_RATES[zoneSlug];
    if (override) {
      const overrideCategory: VehicleCategory =
        vehicleCategory === "VIP" || vehicleCategory === "BUS" ? "SUV" : vehicleCategory;
      if (override[overrideCategory] !== undefined) {
        return override[overrideCategory];
      }
    }
  }
  return getTransferPrice(originZoneId, destinationZoneId, vehicleCategory);
};

type Props = {
  hotels: LocationOption[];
  originPoints: OriginPoint[];
  initialHotelSlug?: string;
  initialOriginPointSlug?: string;
  initialOriginCode?: string;
  initialOriginLabel?: string;
  initialDateTime?: string;
  autoShowResults?: boolean;
};

export default function TrasladoSearch({
  hotels,
  originPoints,
  initialHotelSlug,
  initialOriginPointSlug,
  initialOriginCode,
  initialOriginLabel,
  initialDateTime,
  autoShowResults = false
}: Props) {
  const defaultHotel = hotels[0];
  const initialHotel =
    hotels.find((hotel) => hotel.slug === initialHotelSlug) ?? defaultHotel ?? hotels[0];
  const createPointSelection = (point: OriginPoint): OriginSelection => ({
    kind: "point",
    point,
    label: point.name
  });
  const createHotelSelection = (hotel: LocationOption): OriginSelection => ({
    kind: "hotel",
    hotel,
    label: hotel.name
  });

  const resolveStartingPoint = (): OriginSelection | null => {
    const byPointSlug = initialOriginPointSlug
      ? originPoints.find((point) => point.slug === initialOriginPointSlug)
      : null;
    if (byPointSlug) return createPointSelection(byPointSlug);

    const byCode = initialOriginCode
      ? originPoints.find((point) => point.code?.toUpperCase() === initialOriginCode.toUpperCase())
      : null;
    if (byCode) return createPointSelection(byCode);

    const airportPoint = originPoints.find((point) => point.type === "airport");
    if (airportPoint) return createPointSelection(airportPoint);

    if (originPoints.length) return createPointSelection(originPoints[0]);
    if (initialHotel) return createHotelSelection(initialHotel);
    return hotels.length ? createHotelSelection(hotels[0]) : null;
  };

  const fallbackOriginHotel = initialHotel ?? hotels[0] ?? { name: "Destino", slug: "fallback" };
  const initialOriginSelection = resolveStartingPoint() ?? createHotelSelection(fallbackOriginHotel);
  const [destinationSlug, setDestinationSlug] = useState(initialHotel?.slug ?? "hard-rock-punta-cana");
  const [destinationLabel, setDestinationLabel] = useState(
    initialHotel?.name ?? "Hard Rock Hotel & Casino Punta Cana"
  );
  const [originSelection, setOriginSelection] = useState<OriginSelection>(initialOriginSelection);
  const [originLabel, setOriginLabel] = useState(initialOriginSelection.label);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const originBlurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destinationBlurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [passengers, setPassengers] = useState(2);
  const [dateTime, setDateTime] = useState(initialDateTime ?? "");
  const initialResultsVisible = Boolean(autoShowResults && initialHotel && initialDateTime);
  const [showResults, setShowResults] = useState(initialResultsVisible);
  const [formCollapsed, setFormCollapsed] = useState(initialResultsVisible);
  const [flightNumber, setFlightNumber] = useState("");
  const [liveRates, setLiveRates] = useState<Record<VehicleCategory, number> | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildOriginParamValue = (selection: OriginSelection) =>
    selection.kind === "point" ? `point:${selection.point.slug}` : `hotel:${selection.hotel.slug}`;

  const resolveOriginSelectionFromParam = useCallback(
    (value?: string | null): OriginSelection | null => {
      if (!value) return null;
      if (value.startsWith("point:")) {
        const slug = value.split(":")[1] ?? "";
        const match = originPoints.find((point) => point.slug === slug);
        if (match) return createPointSelection(match);
      }
      if (value.startsWith("airport:")) {
        const encoded = value.split(":")[1] ?? "";
        const match = originPoints.find((point) => point.code === encoded);
        if (match) return createPointSelection(match);
      }
      if (value.startsWith("hotel:")) {
        const slug = value.split(":")[1] ?? "";
        const match = hotels.find((hotel) => hotel.slug === slug);
        if (match) return createHotelSelection(match);
      }
      const normalized = value.trim();
      const pointMatch =
        originPoints.find((point) => normalizeValue(point.name) === normalizeValue(normalized)) ??
        originPoints.find((point) => point.slug === normalized);
      if (pointMatch) {
        return createPointSelection(pointMatch);
      }
      const hotelMatch =
        hotels.find((hotel) => hotel.slug === normalized) ??
        hotels.find((hotel) => normalizeValue(hotel.name) === normalizeValue(normalized));
      if (hotelMatch) {
        return createHotelSelection(hotelMatch);
      }
      return null;
    },
    [hotels, originPoints]
  );

  const applyOriginSelection = useCallback((selection: OriginSelection) => {
    setOriginSelection(selection);
    setOriginLabel(selection.label);
  }, []);

  useEffect(() => {
    if (autoShowResults && initialHotel && initialDateTime) {
      setShowResults(true);
      setFormCollapsed(true);
    }
  }, [autoShowResults, initialHotel, initialDateTime]);

  const matchHotel = (value?: string | null) => {
    const normalized = normalizeValue(value);
    if (!normalized) return null;
    return (
      hotels.find((hotel) => normalizeValue(hotel.name) === normalized) ??
      hotels.find(
        (hotel) =>
          normalizeValue(hotel.slug).includes(normalized) || normalized.includes(normalizeValue(hotel.slug))
      )
    );
  };

  const selectedHotel = useMemo(
    () => hotels.find((hotel) => hotel.slug === destinationSlug),
    [destinationSlug, hotels]
  );

  const fallbackHotel = useMemo(() => matchHotel(destinationLabel), [destinationLabel, hotels]);
  const activeHotel = selectedHotel ?? fallbackHotel;
  const destinationZoneId = resolveZoneId({
    assignedZoneId: activeHotel?.assignedZoneId,
    microZoneSlug: activeHotel?.microZoneSlug,
    microZoneName: activeHotel?.microZoneName,
    destinationName: activeHotel?.destinationName
  });
  const zoneEntry = trasladoPricing.nodes.find((node) => node.id === destinationZoneId);
  const zoneLabel = zoneEntry?.name ?? "Punta Cana / República Dominicana";
  const originZoneId = useMemo(() => {
    if (originSelection.kind === "hotel") {
      return resolveZoneId({
        assignedZoneId: originSelection.hotel.assignedZoneId,
        microZoneSlug: originSelection.hotel.microZoneSlug,
        microZoneName: originSelection.hotel.microZoneName,
        destinationName: originSelection.hotel.destinationName
      });
    }
    if (originSelection.kind === "point") {
      return originSelection.point.zoneId ?? DEFAULT_ZONE_ID;
    }
    return DEFAULT_ZONE_ID;
  }, [originSelection]);

  useEffect(() => {
    if (!originZoneId || !destinationZoneId) {
      setLiveRates(null);
      return;
    }
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchRates = async () => {
      try {
        const params = new URLSearchParams({
          originZoneId,
          destinationZoneId
        });
        if (activeHotel?.transferDestinationId) {
          params.set("destinationId", activeHotel.transferDestinationId);
        }
        const response = await fetch(`/api/transfers/rates?${params.toString()}`, { signal });
        if (!response.ok) {
          setLiveRates(null);
          return;
        }
        const data = (await response.json()) as { rates?: Record<VehicleCategory, number> };
        setLiveRates(data?.rates ?? null);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setLiveRates(null);
      }
    };
    fetchRates();
    return () => controller.abort();
  }, [destinationZoneId, originZoneId]);
  const vehicles = useMemo<VehicleOption[]>(
    () =>
      vehicleCatalog.map((vehicle) => {
        const category = vehicleCategoryMap[vehicle.id] ?? "SEDAN";
        const fallbackPrice = getAdjustedPrice(
          originZoneId,
          destinationZoneId,
          category,
          destinationLabel,
          activeHotel
        );
        const price = liveRates?.[category] ?? fallbackPrice;
        return { ...vehicle, price };
      }),
    [destinationZoneId, originZoneId, destinationLabel, activeHotel, liveRates]
  );

  const dateValue = dateTime ? dateTime.split("T")[0] : "";
  const timeValue = dateTime ? dateTime.split("T")[1] : "";
  const baseTransferParams = useMemo(() => {
    if (!dateValue || !timeValue || !selectedHotel) return null;
    const payload: Record<string, string> = {
      type: "transfer",
      date: dateValue,
      time: timeValue,
      adults: String(passengers),
      youth: "0",
      child: "0",
      hotelSlug: selectedHotel.slug,
      originHotelName: selectedHotel.name,
      origin:
        originSelection.kind === "point" ? originSelection.point.slug : originSelection.hotel.slug,
      originLabel: originSelection.label
    };
    if (activeHotel?.transferDestinationId) {
      payload.destinationId = activeHotel.transferDestinationId;
    }
    if (flightNumber.trim()) {
      payload.flightNumber = flightNumber.trim();
    }
    if (transferTourId) {
      payload.tourId = transferTourId;
    }
    if (transferTourImage) {
      payload.tourImage = transferTourImage;
    }
    return payload;
  }, [dateValue, timeValue, passengers, selectedHotel, originSelection, flightNumber]);

  const buildCheckoutHref = (vehicle: VehicleOption) => {
    if (!baseTransferParams) return "/checkout?type=transfer";
    const params = new URLSearchParams(baseTransferParams);
    const vehicleTitle = `${transferTourTitle} · ${vehicle.title}`;
    params.set("tourTitle", vehicleTitle);
    params.set("tourImage", vehicle.image);
    params.set("tourPrice", vehicle.price.toFixed(2));
    params.set("vehicleId", vehicle.id);
    params.set("passengers", String(passengers));
    if (!transferTourId) {
      params.delete("tourId");
    }
    return `/checkout?${params.toString()}`;
  };

  const syncQueryFromFilters = (slugParam?: string, overrideOrigin?: OriginSelection) => {
    const params = new URLSearchParams();
    const slugToUse = slugParam ?? destinationSlug;
    if (slugToUse) {
      params.set("hotelSlug", slugToUse);
    }
    const originToUse = overrideOrigin ?? originSelection;
    params.set("origin", buildOriginParamValue(originToUse));
    params.set("originLabel", originToUse.label);
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (!searchParams) return;
    const hotelParam = searchParams.get("hotelSlug");
    const originParam = searchParams.get("origin");
    const originLabelParam = searchParams.get("originLabel");
    if (hotelParam && hotelParam !== destinationSlug) {
      setDestinationSlug(hotelParam);
      const matched = hotels.find((hotel) => hotel.slug === hotelParam);
      if (matched) {
        setDestinationLabel(matched.name);
      }
    }
    if (originParam) {
      const resolved = resolveOriginSelectionFromParam(originParam);
      if (resolved) {
        applyOriginSelection(resolved);
      }
    } else if (originLabelParam && originLabelParam !== originLabel) {
      setOriginLabel(originLabelParam);
    }
    if (hotelParam) {
      setShowResults(true);
      setFormCollapsed(true);
    }
  }, [
    searchParams,
    hotels,
    destinationSlug,
    originLabel,
    applyOriginSelection,
    resolveOriginSelectionFromParam
  ]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const matched = matchHotel(destinationLabel);
    const resolvedOrigin = resolveOriginSelectionFromParam(originLabel);
    if (resolvedOrigin) {
      applyOriginSelection(resolvedOrigin);
    }
    let slugToSync = destinationSlug;
    if (matched) {
      setDestinationSlug(matched.slug);
      slugToSync = matched.slug;
    } else if (!destinationSlug) {
      const slugified = slugifyValue(destinationLabel);
      if (slugified) {
        setDestinationSlug(slugified);
        slugToSync = slugified;
      }
    }
    setShowResults(true);
    setFormCollapsed(true);
    syncQueryFromFilters(slugToSync, resolvedOrigin ?? originSelection);
  };

  const originSuggestionPool = useMemo(() => {
    const normalizedQuery = normalizeValue(originLabel);
    const matches = (options: OriginSelection[], limit: number) => {
      const filtered = options.filter((option) => {
        const normalizedLabel = normalizeValue(option.label);
        return (
          normalizedLabel.includes(normalizedQuery) || normalizedQuery.includes(normalizedLabel)
        );
      });
      return normalizedQuery ? filtered.slice(0, limit) : options.slice(0, limit);
    };

    const pointSelections = originPoints.map((point) => createPointSelection(point));
    const hotelSelections = hotels.map((hotel) => createHotelSelection(hotel));

    const pointMatches = matches(pointSelections, 6);
    const hotelMatches = matches(hotelSelections, 6);

    if (!normalizedQuery && originSelection.kind === "hotel") {
      return [...pointSelections.slice(0, 3), ...hotelSelections.slice(0, 5)];
    }

    const combined = [...pointMatches, ...hotelMatches];
    if (combined.length) {
      return combined;
    }
    return [...pointSelections.slice(0, 3), ...hotelSelections.slice(0, 5)];
  }, [originLabel, hotels, originPoints, originSelection.kind]);

  const airportDestinationOptions = originPoints
    .filter((point) => point.type === "airport")
    .map((airport) => ({
      label: airport.name,
      slug: `airport-${airport.code ?? airport.slug}`,
      type: "airport" as const
    }));

  type DestinationSuggestion =
    | (LocationOption & { label: string; slug: string })
    | { label: string; slug: string; type: "airport" };

  const isAirportSuggestion = (
    option: DestinationSuggestion
  ): option is { label: string; slug: string; type: "airport" } =>
    "type" in option && option.type === "airport";

  const destinationSuggestionPool = useMemo(() => {
    const normalizedQuery = normalizeValue(destinationLabel);
    const filterOptions = <T extends { label: string }>(options: T[], limit: number) => {
      if (!normalizedQuery) {
        return options.slice(0, limit);
      }
      const filtered = options.filter((option) => {
        const normalized = normalizeValue(option.label);
        return normalized.includes(normalizedQuery) || normalizedQuery.includes(normalized);
      });
      return filtered.slice(0, limit);
    };

    const hotelSelections = hotels.map((hotel) => ({ ...hotel, label: hotel.name, slug: hotel.slug }));
    const airportSelections = airportDestinationOptions;

    const matchedAirports = filterOptions(airportSelections, 3);
    const matchedHotels = filterOptions(hotelSelections, 6);

    if (matchedAirports.length || matchedHotels.length) {
      return [...matchedAirports, ...matchedHotels];
    }
    return [...airportSelections.slice(0, 3), ...hotelSelections.slice(0, 6)];
  }, [destinationLabel, hotels]);
  const handleSelectOrigin = (selection: OriginSelection) => {
    if (originBlurTimeout.current) {
      clearTimeout(originBlurTimeout.current);
      originBlurTimeout.current = null;
    }
    applyOriginSelection(selection);
    setShowOriginSuggestions(false);
  };

  const handleOriginFocus = () => {
    if (originBlurTimeout.current) {
      clearTimeout(originBlurTimeout.current);
      originBlurTimeout.current = null;
    }
    setShowOriginSuggestions(true);
  };

  const handleOriginBlur = () => {
    originBlurTimeout.current = setTimeout(() => {
      setShowOriginSuggestions(false);
      originBlurTimeout.current = null;
    }, 150);
  };

  const handleSelectDestination = (option: DestinationSuggestion) => {
    if (destinationBlurTimeout.current) {
      clearTimeout(destinationBlurTimeout.current);
      destinationBlurTimeout.current = null;
    }
    setDestinationLabel(option.label);
    if ("type" in option && option.type === "airport") {
      setDestinationSlug(option.slug);
    } else {
      setDestinationSlug(option.slug);
    }
    setShowDestinationSuggestions(false);
  };

  const handleDestinationFocus = () => {
    if (destinationBlurTimeout.current) {
      clearTimeout(destinationBlurTimeout.current);
      destinationBlurTimeout.current = null;
    }
    setShowDestinationSuggestions(true);
  };

  const handleDestinationBlur = () => {
    destinationBlurTimeout.current = setTimeout(() => {
      setShowDestinationSuggestions(false);
      destinationBlurTimeout.current = null;
    }, 150);
  };

  const summaryDate =
    dateTime &&
    new Date(dateTime).toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });

  const paymentMethods = ["Stripe", "PayPal", "Credit Card"];

  const resetSearchForm = () => {
    setFormCollapsed(false);
  };

  return (
    <div className="space-y-8">
      {formCollapsed && showResults && (
        <div className="rounded-[28px] border border-emerald-200 bg-emerald-50/80 p-6 text-slate-900 shadow">
          <div className="flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-600">Reserva lista</p>
              <p className="text-lg font-semibold">
                {originLabel} → {destinationLabel || selectedHotel?.name || "tu hotel"}
              </p>
              <p className="text-sm text-slate-600">
                {summaryDate ?? "Fecha pendiente"} · {passengers} pasajero{passengers > 1 ? "s" : ""}
              </p>
              {flightNumber.trim() && (
                <p className="text-sm text-slate-600">
                  Vuelo: <span className="font-semibold text-slate-900">{flightNumber.trim()}</span>
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={resetSearchForm}
              className="rounded-full border border-emerald-300 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 shadow-sm transition hover:bg-emerald-50"
            >
              Modificar
            </button>
          </div>
        </div>
      )}
      <div className={`rounded-[32px] border ${formCollapsed ? "border-transparent" : "border-slate-200"} bg-white/90 p-6 shadow-xl`}>
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-500">Traslado privado</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Traslados privados desde el aeropuerto
        </h1>
        <p className="text-sm text-slate-500">Confirma tu traslado premium con chofer bilingüe y cancelación flexible.</p>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Zona estimada: {zoneLabel}</p>
        {!formCollapsed && (
          <form className="mt-6 flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end" onSubmit={handleSearch}>
            <label className="flex-1 min-w-[180px] text-sm text-slate-500">
              Origen
              <div className="relative mt-2">
                <input
                  value={originLabel}
                  onFocus={handleOriginFocus}
                  onBlur={handleOriginBlur}
                    onChange={(event) => {
                      const value = event.target.value;
                      setOriginLabel(value);
                      const normalized = normalizeValue(value);
                      if (!normalized) return;
                      const slugMatch = slugifyValue(value);
                      const pointMatch =
                        originPoints.find((point) => normalizeValue(point.name) === normalized) ??
                        originPoints.find((point) => point.slug === slugMatch);
                      if (pointMatch) {
                        applyOriginSelection(createPointSelection(pointMatch));
                        return;
                      }
                      const hotelMatch =
                        hotels.find((hotel) => normalizeValue(hotel.name) === normalized) ??
                        hotels.find((hotel) => hotel.slug === slugMatch);
                      if (hotelMatch) {
                        applyOriginSelection(createHotelSelection(hotelMatch));
                      }
                    }}
                  placeholder="Selecciona origen (aeropuerto u hotel)"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
                {showOriginSuggestions && originSuggestionPool.length > 0 && (
                  <ul className="absolute left-0 right-0 z-30 mt-1 max-h-60 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
                    {originSuggestionPool.map((option) => (
                      <li
                        key={`origin-option-${
                          option.kind === "point" ? option.point.slug : option.hotel.slug
                        }`}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleSelectOrigin(option)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-slate-800 transition hover:bg-slate-50"
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold">{option.label}</span>
                            <span className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                              {option.kind === "point"
                                ? option.point.type === "airport"
                                  ? "Aeropuerto"
                                  : option.point.type === "hotel"
                                  ? "Hotel"
                                  : option.point.type
                                : option.hotel.destinationName ?? "Hotel"}
                            </span>
                          </div>
                          {option.kind === "hotel" && (
                            <span className="text-[11px] font-semibold uppercase tracking-[0.4em] text-slate-500">
                              Hotel
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </label>
            <label className="flex-1 min-w-[180px] text-sm text-slate-500">
              Destino
              <div className="relative mt-2">
                <input
                  value={destinationLabel}
                  onFocus={handleDestinationFocus}
                  onBlur={handleDestinationBlur}
                  onChange={(event) => {
                    const value = event.target.value;
                    setDestinationLabel(value);
                    const matched = matchHotel(value);
                    if (matched) {
                      setDestinationSlug(matched.slug);
                    }
                  }}
                  placeholder="Escribe tu hotel"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
                {showDestinationSuggestions && destinationSuggestionPool.length > 0 && (
                  <ul className="absolute left-0 right-0 z-30 mt-1 max-h-60 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
                    {destinationSuggestionPool.map((option) => (
                      <li key={`destination-option-${option.slug}`} className="border-b border-slate-100 last:border-0">
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleSelectDestination(option)}
                          className="flex w-full flex-col px-4 py-3 text-left text-sm text-slate-800 transition hover:bg-slate-50"
                        >
                          <span className="font-semibold">{option.label}</span>
                          <span className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                            {isAirportSuggestion(option) ? "Aeropuerto" : option.destinationName ?? "Hotel"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </label>
            <label className="flex-1 min-w-[180px] text-sm text-slate-500">
              Fecha y hora de llegada
              <input
                type="datetime-local"
                value={dateTime}
                required
                onChange={(event) => setDateTime(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </label>
            <label className="flex-1 min-w-[180px] text-sm text-slate-500">
              Número de vuelo
              <input
                type="text"
                value={flightNumber}
                onChange={(event) => setFlightNumber(event.target.value.toUpperCase())}
                placeholder="PU123"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </label>
            <div className="flex flex-1 min-w-[140px] items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base">
              <span className="text-sm text-slate-600">Pasajeros</span>
              <div className="flex items-center gap-2 text-slate-900">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 text-lg font-semibold"
                  onClick={() => setPassengers((value) => Math.max(1, value - 1))}
                >
                  -
                </button>
                <span>{passengers}</span>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 text-lg font-semibold"
                  onClick={() => setPassengers((value) => Math.min(12, value + 1))}
                >
                  +
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="md:ml-auto rounded-2xl bg-emerald-600 px-8 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-500"
            >
              VER PRECIOS
            </button>
          </form>
        )}
      </div>
      <section className="grid gap-4 rounded-[28px] border border-slate-100 bg-white/90 p-6 shadow-sm md:grid-cols-4">
        {trustLabels.map((label) => (
          <div key={label} className="text-center text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{label}</p>
          </div>
        ))}
      </section>
      <section className="grid gap-3 rounded-[28px] border border-slate-100 bg-white/90 p-6 shadow-sm md:grid-cols-3">
        {bookingSteps.map((step) => (
          <div key={step.step} className="text-center text-sm text-slate-600">
            <span className="text-lg font-bold text-slate-900">Paso {step.step}</span>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{step.name}</p>
          </div>
        ))}
      </section>
      {showResults && (
        <section className="space-y-6">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Opciones disponibles</p>
              <h2 className="text-2xl font-bold text-slate-900">
                Lleva a tu grupo de {passengers} pax a{" "}
                {destinationLabel || selectedHotel?.name || "tu hotel"}
              </h2>
            {selectedHotel && (
              <p className="text-sm text-emerald-700">Mostrando tarifas privadas para {selectedHotel.name}</p>
            )}
            <p className="text-sm text-slate-500">
              Zona del hotel: <span className="font-semibold text-slate-800">{zoneLabel}</span>
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {vehicles.map((vehicle) => (
              <article
                key={vehicle.id}
                className="flex h-full flex-col justify-between rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg"
              >
                <img src={vehicle.image} alt={vehicle.title} className="h-32 w-full rounded-2xl object-cover" />
                <div className="mt-4 space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">{vehicle.title}</h3>
                  <p className="text-sm text-slate-500">{vehicle.description}</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {vehicle.pax} pax · {vehicle.luggage} maletas
                  </p>
                  <p className="text-3xl font-black text-indigo-600">${vehicle.price.toFixed(2)}</p>
                </div>
                <ul className="mt-4 space-y-1 text-xs text-slate-500">
                  {vehicle.features.map((feature) => (
                    <li key={`${vehicle.id}-${feature}`}>{feature}</li>
                  ))}
                </ul>
                <Link
                  href={buildCheckoutHref(vehicle)}
                  className="mt-6 inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-indigo-500"
                >
                  SELECCIONAR Y PAGAR
                </Link>
              </article>
            ))}
          </div>
          <section className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-sm">
            <div className="flex flex-col gap-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Pago seguro</p>
                <p className="text-lg font-semibold text-slate-900">Elige tu método favorito</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {paymentMethods.map((method) => (
                  <span key={method} className="rounded-full border border-slate-200 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-500">
                    {method}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Conectarás al checkout con la nota «Reserva de traslado» y nuestra tarifa cifrada.
            </p>
          </section>
          <section className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              {pickupRules.map((rule) => (
                <div key={rule.title} className="space-y-1 text-sm text-slate-600">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{rule.title}</p>
                  <p className="font-semibold text-slate-900">{rule.description}</p>
                  <p className="text-xs text-slate-500">{rule.note}</p>
                </div>
              ))}
            </div>
          </section>
        </section>
      )}
    </div>
  );
}
