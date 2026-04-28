import { StatusBar } from "expo-status-bar";
import type { ComponentType, ReactNode } from "react";
import { Component, useEffect, useMemo, useRef, useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
  BackHandler,
  Dimensions,
  Image,
  ImageBackground,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ImageStyle,
  type KeyboardTypeOptions,
  type StyleProp
} from "react-native";
import {
  ArrowLeft,
  CalendarCheck,
  Car,
  CheckCircle2,
  Clock3,
  Compass,
  CreditCard,
  Heart,
  Home,
  Image as ImageIcon,
  LogIn,
  MapPin,
  MessageCircle,
  Minus,
  Plane,
  Plus,
  Search,
  ShieldCheck,
  Star,
  User
} from "lucide-react-native";

import {
  featuredTours,
  tourCategories,
  transferRoutes,
  transferVehicles,
  trustStats,
  type Tour
} from "./src/catalog";
import {
  buildCheckoutUrl,
  buildTourCheckoutUrl,
  confirmMobileBooking,
  createMobilePaymentIntent,
  fetchMobileConfig,
  fetchMobileTours,
  fetchMobileTransferRoutes,
  fetchMobileUser,
  fetchTransferLocations,
  fetchTransferQuote,
  getApiBaseUrl,
  loginMobileUser,
  registerMobileUser,
  type LocationSummary,
  type MobileSession,
  type MobileTour,
  type MobileTourItineraryStop,
  type MobileTourOption,
  type MobileTransferRoute,
  type QuoteVehicle
} from "./src/api";
import { staticMobileTours } from "./src/staticTours";
import { staticMobileTransferRoutes } from "./src/staticTransfers";
import { AppStripeProvider, StripeDeepLinkHandler, useAppStripe } from "./src/stripe";
import { colors, links, shadows } from "./src/theme";

type TabKey = "home" | "tours" | "transfers" | "zones" | "profile";
type TripType = "one-way" | "round-trip";
type IconType = ComponentType<{ size?: number; color?: string; strokeWidth?: number; fill?: string }>;

class ScreenErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; resetKey: string },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(previousProps: { resetKey: string }) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(error: unknown) {
    console.warn("Mobile screen failed", error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

type AppTour = {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string;
  duration: string;
  price: number;
  rating: number;
  reviews: number;
  pickup: string;
  image: string;
  description: string;
  fullDescription?: string | null;
  highlights: string[];
  includes: string[];
  notIncluded: string[];
  gallery: string[];
  options: MobileTourOption[];
  itinerary: MobileTourItineraryStop[];
  languages: string[];
  timeOptions: string[];
  operatingDays: string[];
  meetingPoint?: string | null;
  meetingInstructions?: string | null;
  requirements?: string | null;
  cancellationPolicy?: string | null;
  terms?: string | null;
  physicalLevel?: string | null;
  minAge?: number | null;
  accessibility?: string | null;
  confirmationType?: string | null;
  capacity?: number | null;
  webTour: MobileTour;
};

type SavedQuote = {
  origin: LocationSummary;
  destination: LocationSummary;
  vehicle: QuoteVehicle;
  passengers: number;
  tripType: TripType;
  price: number;
  checkoutUrl: string;
};

type CheckoutSummary = {
  flowType: "tour" | "transfer";
  title: string;
  image?: string | null;
  optionName?: string | null;
  date: string;
  time: string;
  travelers: number;
  totalPrice: number;
  origin?: string | null;
  destination?: string | null;
  vehicle?: string | null;
};

const heroImage =
  "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/transfer/banner%20%20%20%20transfer.jpeg";
const fallbackTourImage = "https://proactivitis.com/fototours/fotosimple.jpg";
const mobileSessionStorageKey = "proactivitis_mobile_session";
const appBuildLabel = "Version 1.0.5 | Android 6";
const windowHeight = Dimensions.get("window").height;

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);

const openUrl = (url: string) => {
  void Linking.openURL(url).catch(() => undefined);
};

const whatsappUrl = (message: string) => `${links.whatsapp}?text=${encodeURIComponent(message)}`;

const policyLinks: Array<{ title: string; subtitle: string; url: string; icon: IconType }> = [
  {
    title: "Politica de privacidad",
    subtitle: "Como protegemos datos, cuenta y reservas.",
    url: links.privacy,
    icon: ShieldCheck
  },
  {
    title: "Terminos y condiciones",
    subtitle: "Reglas de uso, reservas, pagos y responsabilidades.",
    url: links.terms,
    icon: CreditCard
  },
  {
    title: "Cookies y tecnologias",
    subtitle: "Uso de cookies en la web y servicios conectados.",
    url: links.cookies,
    icon: Compass
  },
  {
    title: "Informacion legal",
    subtitle: "Datos legales, contacto y notificaciones formales.",
    url: links.legalInformation,
    icon: MessageCircle
  },
  {
    title: "Cancelaciones y reembolsos",
    subtitle: "Aplican los terminos y la politica indicada en cada producto.",
    url: links.terms,
    icon: CalendarCheck
  }
];

const absoluteImageUrl = (url?: string | null) => {
  if (!url) return fallbackTourImage;
  if (url.startsWith("http")) return url;
  return `${getApiBaseUrl().replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
};

const uniqueImages = (items: Array<string | null | undefined>) =>
  Array.from(new Set(items.filter((item): item is string => Boolean(item)))).map(absoluteImageUrl);

const tomorrow = () => {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
};

const joinValues = (values?: string[] | null) => (values?.filter(Boolean).join(", ") ?? "");

const ignoredCityParts = new Set(["dominican republic", "republica dominicana"]);

const tourCityLabels = (tour: AppTour) => {
  const parts = tour.location
    .split(/[\/,|]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !ignoredCityParts.has(normalizeLocationSearch(part)));
  const cities = parts.length ? parts : [tour.location.trim() || "Republica Dominicana"];
  return Array.from(new Set(cities));
};

const readStoredMobileSession = async () => {
  const raw = await SecureStore.getItemAsync(mobileSessionStorageKey).catch(() => null);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MobileSession;
  } catch {
    return null;
  }
};

const writeStoredMobileSession = async (session: MobileSession | null) => {
  if (!session) {
    await SecureStore.deleteItemAsync(mobileSessionStorageKey).catch(() => undefined);
    return;
  }
  await SecureStore.setItemAsync(mobileSessionStorageKey, JSON.stringify(session)).catch(() => undefined);
};

const fallbackBySlug = new Map(featuredTours.map((tour) => [tour.slug, tour]));
const fallbackById = new Map(featuredTours.map((tour) => [tour.id, tour]));

const toMobileTourPayload = (tour: Tour): MobileTour => ({
  id: tour.id,
  slug: tour.slug,
  title: tour.title,
  description: tour.description,
  fullDescription: tour.description,
  price: tour.price,
  duration: tour.duration,
  category: tour.category,
  location: tour.location,
  pickup: tour.pickup,
  includes: tour.highlights,
  notIncluded: [],
  highlights: tour.highlights,
  image: tour.image,
  gallery: [tour.image],
  options: [],
  itinerary: []
});

const mapCatalogTour = (tour: Tour): AppTour => mapMobileTour(toMobileTourPayload(tour));

const mapMobileTour = (tour: MobileTour): AppTour => {
  const fallback = fallbackBySlug.get(tour.slug) ?? fallbackById.get(tour.id);
  const image = absoluteImageUrl(tour.image || fallback?.image);
  const gallery = uniqueImages([tour.image, ...(tour.gallery ?? []), fallback?.image]);
  return {
    id: tour.id,
    slug: tour.slug,
    title: tour.title || fallback?.title || "Experiencia Proactivitis",
    category: tour.category || fallback?.category || "Aventura",
    location: tour.location || fallback?.location || "Republica Dominicana",
    duration: tour.duration || fallback?.duration || "A confirmar",
    price: Number(tour.price || fallback?.price || 0),
    rating: fallback?.rating ?? 4.9,
    reviews: fallback?.reviews ?? 0,
    pickup: tour.pickup || fallback?.pickup || "Recogida disponible segun zona",
    image,
    description: tour.description || fallback?.description || "Experiencia confirmada por Proactivitis.",
    fullDescription: tour.fullDescription,
    highlights: tour.highlights?.length ? tour.highlights : fallback?.highlights ?? [],
    includes: tour.includes?.length ? tour.includes : tour.highlights ?? fallback?.highlights ?? [],
    notIncluded: tour.notIncluded ?? [],
    gallery: gallery.length ? gallery : [image],
    options: tour.options ?? [],
    itinerary: tour.itinerary ?? [],
    languages: tour.languages ?? [],
    timeOptions: tour.timeOptions ?? [],
    operatingDays: tour.operatingDays ?? [],
    meetingPoint: tour.meetingPoint,
    meetingInstructions: tour.meetingInstructions,
    requirements: tour.requirements,
    cancellationPolicy: tour.cancellationPolicy,
    terms: tour.terms,
    physicalLevel: tour.physicalLevel,
    minAge: tour.minAge,
    accessibility: tour.accessibility,
    confirmationType: tour.confirmationType,
    capacity: tour.capacity,
    webTour: tour
  };
};

const fallbackTours = staticMobileTours.length
  ? staticMobileTours.map(mapMobileTour)
  : featuredTours.map(mapCatalogTour);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "transfer";

const routeLocation = (routeId: string, name: string, type: "origin" | "destination"): LocationSummary => ({
  id: `route-${type}-${routeId}`,
  name,
  slug: slugify(name),
  type: type === "origin" ? "Origen popular" : "Destino popular",
  zoneName: "Punta Cana"
});

const catalogTransferRoutes: MobileTransferRoute[] = transferRoutes.map((route) => ({
  id: route.id,
  origin: routeLocation(route.id, route.origin, "origin"),
  destination: routeLocation(route.id, route.destination, "destination"),
  priceFrom: route.priceFrom,
  currency: "USD",
  zoneLabel: route.duration
}));

const fallbackTransferRoutes = staticMobileTransferRoutes.length ? staticMobileTransferRoutes : catalogTransferRoutes;

const homePopularTransferCards = [
  {
    id: "home-puj",
    code: "PUJ",
    airport: "Punta Cana Airport",
    destination: "Bavaro y Cap Cana",
    priceFrom: 35,
    vehicle: transferVehicles[0]
  },
  {
    id: "home-sdq",
    code: "SDQ",
    airport: "Aeropuerto Santo Domingo",
    destination: "Santo Domingo y Bayahibe",
    priceFrom: 150,
    vehicle: transferVehicles[1]
  },
  {
    id: "home-lrm",
    code: "LRM",
    airport: "Aeropuerto La Romana",
    destination: "La Romana y Bayahibe",
    priceFrom: 94,
    vehicle: transferVehicles[2]
  }
];

const normalizeLocationSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const mergeLocations = (...groups: LocationSummary[][]) => {
  const seen = new Set<string>();
  const merged: LocationSummary[] = [];
  groups.flat().forEach((location) => {
    const key = location.id || `${location.name}-${location.type}`;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(location);
  });
  return merged;
};

const routeLocationMatches = (routes: MobileTransferRoute[], query: string) => {
  const normalizedQuery = normalizeLocationSearch(query);
  if (normalizedQuery.length < 2) return [];
  return mergeLocations(
    routes.map((route) => route.origin),
    routes.map((route) => route.destination)
  )
    .filter((location) =>
      normalizeLocationSearch(`${location.name} ${location.zoneName ?? ""} ${location.type}`).includes(normalizedQuery)
    )
    .slice(0, 7);
};

const readUrlParams = (href: string) => {
  try {
    return new URL(href).searchParams;
  } catch {
    const query = href.includes("?") ? href.split("?").slice(1).join("?") : href;
    return new URLSearchParams(query);
  }
};

const paramNumber = (params: URLSearchParams, key: string, fallback = 0) => {
  const value = Number(params.get(key) ?? fallback);
  return Number.isFinite(value) ? value : fallback;
};

const readCheckoutSummary = (url: string): CheckoutSummary => {
  const params = readUrlParams(url);
  const flowType = params.get("type") === "transfer" ? "transfer" : "tour";
  const travelers = Math.max(
    1,
    paramNumber(params, "adults", paramNumber(params, "passengers", 1)) +
      paramNumber(params, "youth") +
      paramNumber(params, "child")
  );
  const totalPrice =
    paramNumber(params, "displayTotalPrice") || paramNumber(params, "totalPrice") || paramNumber(params, "price");
  return {
    flowType,
    title:
      flowType === "transfer"
        ? params.get("vehicleName") ?? "Transfer privado"
        : params.get("tourTitle") ?? "Tour Proactivitis",
    image: params.get("tourImage") ?? params.get("vehicleImage"),
    optionName: params.get("tourOptionName"),
    date: params.get("date") ?? params.get("dateTime")?.split("T")[0] ?? "Fecha pendiente",
    time: params.get("time") ?? params.get("dateTime")?.split("T")[1] ?? "Hora pendiente",
    travelers,
    totalPrice,
    origin: params.get("originLabel") ?? params.get("origin"),
    destination: params.get("originHotelName") ?? params.get("hotelSlug"),
    vehicle: params.get("vehicleCategory")
  };
};

const addCheckoutContactParams = ({
  checkoutUrl,
  firstName,
  lastName,
  email,
  phone,
  pickupLocation,
  specialRequirements
}: {
  checkoutUrl: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pickupLocation: string;
  specialRequirements: string;
}) => {
  try {
    const parsed = new URL(checkoutUrl);
    const params = parsed.searchParams;
    params.set("mobileCheckout", "1");
    params.set("firstName", firstName.trim());
    params.set("lastName", lastName.trim());
    params.set("email", email.trim().toLowerCase());
    if (phone.trim()) params.set("phone", phone.trim());
    params.set("travelerName", `${firstName} ${lastName}`.trim());
    if (pickupLocation.trim()) params.set("pickupLocation", pickupLocation.trim());
    if (specialRequirements.trim()) params.set("specialRequirements", specialRequirements.trim());
    return parsed.toString();
  } catch {
    return checkoutUrl;
  }
};

export default function App() {
  const [stripePublishableKey, setStripePublishableKey] = useState("");

  useEffect(() => {
    let active = true;
    fetchMobileConfig()
      .then((config) => {
        if (active) setStripePublishableKey(config.stripePublishableKey ?? "");
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppStripeProvider publishableKey={stripePublishableKey}>
      <StripeDeepLinkHandler />
      <MobileApp stripeReady={Boolean(stripePublishableKey)} />
    </AppStripeProvider>
  );
}

function MobileApp({ stripeReady }: { stripeReady: boolean }) {
  const scrollRef = useRef<ScrollView>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [tours, setTours] = useState<AppTour[]>(fallbackTours);
  const [toursLoading, setToursLoading] = useState(true);
  const [activeProduct, setActiveProduct] = useState<AppTour | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [savedQuote, setSavedQuote] = useState<SavedQuote | null>(null);
  const [mobileSession, setMobileSession] = useState<MobileSession | null>(null);

  const updateMobileSession = (session: MobileSession | null) => {
    setMobileSession(session);
    void writeStoredMobileSession(session);
  };

  useEffect(() => {
    let active = true;
    readStoredMobileSession()
      .then(async (storedSession) => {
        if (!active || !storedSession?.token) return;
        try {
          const { user } = await fetchMobileUser(storedSession.token);
          if (active) setMobileSession({ token: storedSession.token, user });
        } catch {
          if (active) updateMobileSession(null);
        }
      })
      .catch(() => undefined);

    fetchMobileTours()
      .then((items) => {
        if (active && items.length) setTours(items.map(mapMobileTour));
      })
      .catch(() => {
        if (active) setTours(fallbackTours);
      })
      .finally(() => {
        if (active) setToursLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (checkoutUrl) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });
  }, [activeTab, activeProduct?.id, checkoutUrl]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (checkoutUrl) {
        setCheckoutUrl(null);
        return true;
      }
      if (activeProduct) {
        setActiveProduct(null);
        return true;
      }
      if (activeTab !== "home") {
        setActiveTab("home");
        return true;
      }
      return false;
    });

    return () => subscription.remove();
  }, [activeProduct, activeTab, checkoutUrl]);

  const filteredTours = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tours.filter((tour) => {
      const categoryMatch = category === "Todos" || tour.category === category;
      const text = `${tour.title} ${tour.location} ${tour.description}`.toLowerCase();
      return categoryMatch && (!normalized || text.includes(normalized));
    });
  }, [category, query, tours]);

  const favoriteTours = tours.filter((tour) => favorites.has(tour.id));

  const toggleFavorite = (tourId: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(tourId)) next.delete(tourId);
      else next.add(tourId);
      return next;
    });
  };

  const openCheckout = (url: string) => {
    setActiveProduct(null);
    setCheckoutUrl(url);
  };

  const screenResetKey = checkoutUrl ?? activeProduct?.id ?? activeTab;

  const renderScreen = () => {
    if (checkoutUrl) {
      return (
        <CheckoutScreen
          url={checkoutUrl}
          session={mobileSession}
          stripeReady={stripeReady}
          onClose={() => setCheckoutUrl(null)}
        />
      );
    }

    if (activeProduct) {
      return <ProductScreen tour={activeProduct} onBack={() => setActiveProduct(null)} onCheckout={openCheckout} />;
    }

    if (activeTab === "tours") {
      return (
        <ToursScreen
          query={query}
          category={category}
          tours={filteredTours}
          favorites={favorites}
          loading={toursLoading}
          onQueryChange={setQuery}
          onCategoryChange={setCategory}
          onFavorite={toggleFavorite}
          onReserve={setActiveProduct}
        />
      );
    }

    if (activeTab === "transfers") {
      return (
        <TransfersScreen
          onSaveQuote={(quote) => {
            setSavedQuote(quote);
            setActiveTab("profile");
          }}
          onOpenCheckout={openCheckout}
        />
      );
    }

    if (activeTab === "zones") {
      return (
        <ZonesScreen
          tours={tours}
          favorites={favorites}
          onFavorite={toggleFavorite}
          onReserveTour={setActiveProduct}
          onOpenTransfers={() => setActiveTab("transfers")}
        />
      );
    }

    if (activeTab === "profile") {
      return (
        <ProfileScreen
          session={mobileSession}
          quote={savedQuote}
          favoriteTours={favoriteTours}
          onSessionChange={updateMobileSession}
          onOpenTransfers={() => setActiveTab("transfers")}
          onOpenTours={() => setActiveTab("tours")}
          onFavorite={toggleFavorite}
          onReserveTour={setActiveProduct}
          onOpenCheckout={openCheckout}
        />
      );
    }

    return (
      <HomeScreen
        onOpenTours={() => setActiveTab("tours")}
        onOpenTransfers={() => setActiveTab("transfers")}
        onReserveTour={setActiveProduct}
        tours={tours}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.appShell}>
        {checkoutUrl ? (
          <ScreenErrorBoundary
            resetKey={screenResetKey}
            fallback={<CrashFallbackScreen onBack={() => setCheckoutUrl(null)} />}
          >
            {renderScreen()}
          </ScreenErrorBoundary>
        ) : (
          <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <ScreenErrorBoundary
              resetKey={screenResetKey}
              fallback={
                <CrashFallbackScreen
                  onBack={() => {
                    setCheckoutUrl(null);
                    setActiveProduct(null);
                    setActiveTab("home");
                  }}
                />
              }
            >
              {renderScreen()}
            </ScreenErrorBoundary>
          </ScrollView>
        )}
        {!checkoutUrl && !activeProduct ? <TabBar activeTab={activeTab} onChange={setActiveTab} /> : null}
      </View>
    </SafeAreaView>
  );
}

function HomeScreen({
  onOpenTours,
  onOpenTransfers,
  onReserveTour,
  tours
}: {
  onOpenTours: () => void;
  onOpenTransfers: () => void;
  onReserveTour: (tour: AppTour) => void;
  tours: AppTour[];
}) {
  const heroTour = tours.find((tour) => tour.title.toLowerCase().includes("saona")) ?? tours[0];
  const homeHeroImage = heroTour?.image ?? heroImage;

  return (
    <View style={styles.screen}>
      <ImageBackground source={{ uri: absoluteImageUrl(homeHeroImage) }} style={styles.hero} imageStyle={styles.heroImage as StyleProp<ImageStyle>}>
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <View style={styles.logoGlow}>
            <Image source={require("./assets/proactivitis-logo.png")} style={styles.logo as StyleProp<ImageStyle>} resizeMode="contain" />
          </View>
          <Text style={styles.eyebrow}>🌴 Tours, transfers y planes privados</Text>
          <Text style={styles.heroTitle}>Tu viaje en RD, claro y sin estres</Text>
          <Text style={styles.heroSubtitle}>
            Elige tours con fotos reales, cotiza tu traslado y reserva con ayuda local 24/7. Aqui vienes a disfrutar, nosotros organizamos lo dificil.
          </Text>
          <Text style={styles.heroHumanNote}>✨ Recomendado para familias, parejas y grupos que quieren reservar sin vueltas.</Text>
          <View style={styles.heroTrustRow}>
            <Text style={styles.heroTrustPill}>📸 Fotos reales</Text>
            <Text style={styles.heroTrustPill}>💵 Precio claro</Text>
            <Text style={styles.heroTrustPill}>💬 Soporte humano</Text>
          </View>
          <View style={styles.heroActions}>
            <ActionButton label="Ver tours 🔥" icon={Compass} onPress={onOpenTours} />
            <ActionButton label="Buscar transfer 🚘" icon={Car} variant="outline" onPress={onOpenTransfers} />
          </View>
        </View>
      </ImageBackground>

      <View style={styles.statsRow}>
        {trustStats.map((stat) => (
          <View key={stat.label} style={styles.statBox}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.homeBookingGrid}>
        <Pressable style={styles.homeBookingCard} onPress={onOpenTours}>
          <Text style={styles.homeBookingEmoji}>🏝️</Text>
          <Text style={styles.homeBookingTitle}>Tours que se sienten reales</Text>
          <Text style={styles.homeBookingText}>Fotos, opciones y precios conectados a la web. Ves antes de reservar.</Text>
        </Pressable>
        <Pressable style={styles.homeBookingCard} onPress={onOpenTransfers}>
          <Text style={styles.homeBookingEmoji}>🚘</Text>
          <Text style={styles.homeBookingTitle}>Transfer sin adivinar</Text>
          <Text style={styles.homeBookingText}>Busca hoteles y aeropuertos reales, elige la ruta y confirma sin enredos.</Text>
        </Pressable>
      </View>

      <SectionHeader title="🔥 Recomendados" actionLabel="Ver todos" onPress={onOpenTours} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
        {tours.slice(0, 5).map((tour) => (
          <FeaturedTourCard key={tour.id} tour={tour} onPress={() => onReserveTour(tour)} />
        ))}
      </ScrollView>

      <SectionHeader title="🧭 Categorias" actionLabel="Explorar" onPress={onOpenTours} />
      <View style={styles.categoryGrid}>
        {tourCategories.filter((item) => item !== "Todos").map((item) => (
          <Pressable key={item} style={styles.categoryCard} onPress={onOpenTours}>
            <Text style={styles.categoryTitle}>{item}</Text>
            <Text style={styles.categoryText}>Ver experiencias</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader title="🚐 Rutas populares" actionLabel="Cotizar" onPress={onOpenTransfers} />
      <View style={styles.homeRouteGrid}>
        {homePopularTransferCards.map((route) => (
          <Pressable key={route.id} style={styles.homeRouteCard} onPress={onOpenTransfers}>
            <Text style={styles.homeRouteCode}>{route.code}</Text>
            <Text style={styles.homeRouteAirport} numberOfLines={2}>{route.airport}</Text>
            <Text style={styles.homeRouteDestination} numberOfLines={2}>{route.destination}</Text>
            <View style={styles.homeVehiclePill}>
              <Car size={13} color={colors.skyDark} />
              <Text style={styles.homeVehicleText} numberOfLines={1}>{route.vehicle.name}</Text>
            </View>
            <Text style={styles.routePrice}>Desde {money(route.priceFrom)}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.noticePanel}>
        <ShieldCheck size={22} color={colors.skyDark} />
        <View style={styles.flexText}>
          <Text style={styles.noticeTitle}>Reserva con respaldo local</Text>
          <Text style={styles.noticeText}>
            Completa tus datos en la app y finaliza con el checkout seguro de Proactivitis. Si necesitas ayuda, te hablamos como personas.
          </Text>
        </View>
      </View>
    </View>
  );
}

function CrashFallbackScreen({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.emptyState}>
        <ShieldCheck size={34} color={colors.skyDark} />
        <Text style={styles.emptyTitle}>La pantalla no cargo bien</Text>
        <Text style={styles.smallMuted}>
          La app sigue abierta. Vuelve al inicio o confirma la reserva por WhatsApp.
        </Text>
        <ActionButton label="Volver al inicio" icon={Home} onPress={onBack} />
        <ActionButton
          label="WhatsApp"
          icon={MessageCircle}
          variant="outlineDark"
          onPress={() => openUrl(links.whatsapp)}
        />
      </View>
    </View>
  );
}

function ToursScreen({
  query,
  category,
  tours,
  favorites,
  loading,
  onQueryChange,
  onCategoryChange,
  onFavorite,
  onReserve
}: {
  query: string;
  category: string;
  tours: AppTour[];
  favorites: Set<string>;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onFavorite: (tourId: string) => void;
  onReserve: (tour: AppTour) => void;
}) {
  return (
    <View style={styles.screen}>
      <View style={styles.toursHeroPanel}>
        <Text style={styles.eyebrowDark}>🌴 Catalogo Proactivitis</Text>
        <Text style={styles.toursHeroTitle}>Tours listos para reservar</Text>
        <Text style={styles.toursHeroCopy}>
          Experiencias reales de la web, fotos del producto, detalles claros y checkout dentro de la app.
        </Text>
        <View style={styles.toursTrustRow}>
          <Text style={styles.toursTrustPill}>📸 Galeria</Text>
          <Text style={styles.toursTrustPill}>⚡ Reserva rapida</Text>
          <Text style={styles.toursTrustPill}>💬 Soporte humano</Text>
        </View>
      </View>
      <View style={styles.searchBox}>
        <Search size={18} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          placeholder="Buscar Saona, buggy, parasailing..."
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        {tourCategories.map((item) => (
          <Chip key={item} label={item} active={item === category} onPress={() => onCategoryChange(item)} />
        ))}
      </ScrollView>
      <View style={styles.toursResultBar}>
        <View>
          <Text style={styles.resultSummaryText}>{loading ? "Actualizando productos..." : `${tours.length} experiencias`}</Text>
          <Text style={styles.toursResultMeta}>{category === "Todos" ? "Todos los planes" : category}</Text>
        </View>
        <View style={styles.toursLiveBadge}>
          <CheckCircle2 size={14} color={colors.green} />
          <Text style={styles.toursLiveText}>Conectado</Text>
        </View>
      </View>
      {tours.length ? (
        <View style={styles.cardStack}>
          {tours.map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              favorite={favorites.has(tour.id)}
              onFavorite={() => onFavorite(tour.id)}
              onReserve={() => onReserve(tour)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.toursEmptyPanel}>
          <Text style={styles.sectionTitle}>No encontramos ese tour</Text>
          <Text style={styles.bodyText}>Prueba con Saona, buggy, catamaran o limpia el filtro para ver todo el catalogo.</Text>
        </View>
      )}
    </View>
  );
}

function ProductScreen({
  tour,
  onBack,
  onCheckout
}: {
  tour: AppTour;
  onBack: () => void;
  onCheckout: (url: string) => void;
}) {
  const galleryImages = useMemo(() => tour.gallery.slice(0, 10), [tour.gallery]);
  const [selectedImage, setSelectedImage] = useState(galleryImages[0] ?? tour.image);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [adults, setAdults] = useState(2);
  const [date, setDate] = useState(tomorrow());
  const [time, setTime] = useState("09:00");
  const [selectedOptionId, setSelectedOptionId] = useState(
    tour.options.find((option) => option.isDefault)?.id ?? tour.options[0]?.id ?? null
  );
  const selectedOption = tour.options.find((option) => option.id === selectedOptionId) ?? null;
  const pricePerPerson = selectedOption?.pricePerPerson ?? tour.price;
  const totalPrice =
    selectedOption?.basePrice && selectedOption.baseCapacity ? selectedOption.basePrice : pricePerPerson * adults;
  const shortDescription = tour.description || tour.fullDescription || "Experiencia confirmada por Proactivitis.";
  const detailDescription = tour.fullDescription || tour.description;
  const quickFacts = [
    { icon: Clock3, label: "Duracion", value: tour.duration },
    { icon: MapPin, label: "Zona", value: tour.location },
    { icon: Car, label: "Recogida", value: tour.pickup },
    { icon: ShieldCheck, label: "Reserva", value: tour.confirmationType ?? "Confirmacion segura" }
  ].filter((item) => item.value.trim().length > 0);

  useEffect(() => {
    setSelectedImage(galleryImages[0] ?? tour.image);
  }, [tour.id, galleryImages, tour.image]);

  useEffect(() => {
    if (!galleryOpen) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      setGalleryOpen(false);
      return true;
    });

    return () => subscription.remove();
  }, [galleryOpen]);

  const infoRows = [
    { label: "Punto de encuentro", value: tour.meetingPoint ?? "" },
    { label: "Instrucciones", value: tour.meetingInstructions ?? "" },
    { label: "Idiomas", value: joinValues(tour.languages) },
    { label: "Horarios", value: joinValues(tour.timeOptions) },
    { label: "Dias", value: joinValues(tour.operatingDays) },
    { label: "Capacidad", value: tour.capacity ? `${tour.capacity} personas` : "" },
    { label: "Edad minima", value: tour.minAge ? `${tour.minAge}+` : "" },
    { label: "Nivel fisico", value: tour.physicalLevel ?? "" },
    { label: "Accesibilidad", value: tour.accessibility ?? "" },
    { label: "Requisitos", value: tour.requirements ?? "" },
    { label: "Cancelacion", value: tour.cancellationPolicy ?? "" }
  ].filter((item) => item.value.trim().length > 0);

  const startCheckout = () => {
    onCheckout(
      buildTourCheckoutUrl({
        tour: tour.webTour,
        option: selectedOption,
        adults,
        date,
        time
      })
    );
  };

  if (galleryOpen) {
    return (
      <GalleryViewer
        images={galleryImages}
        image={selectedImage}
        onSelect={setSelectedImage}
        onClose={() => setGalleryOpen(false)}
      />
    );
  }

  return (
    <View style={styles.productScreen}>
      <View style={styles.productHero}>
        <Pressable style={styles.productImageButton} onPress={() => setGalleryOpen(true)}>
          <RemoteImage uri={selectedImage} style={styles.productHeroImage} />
        </Pressable>
        <View pointerEvents="none" style={styles.productOverlay} />
        <Pressable style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color={colors.white} />
          <Text style={styles.backButtonText}>Volver</Text>
        </Pressable>
        <Pressable style={styles.galleryFloatingButton} onPress={() => setGalleryOpen(true)}>
          <ImageIcon size={16} color={colors.white} />
          <Text style={styles.galleryFloatingText}>{galleryImages.length} fotos</Text>
        </Pressable>
        <View style={styles.productHeroContent}>
          <Text style={styles.eyebrow}>{tour.category}</Text>
          <Text style={styles.productTitle}>{tour.title}</Text>
          <View style={styles.metaRow}>
            <MetaPill icon={MapPin} label={tour.location} />
            <MetaPill icon={Clock3} label={tour.duration} />
            <MetaPill icon={Star} label={`${tour.rating}`} />
          </View>
        </View>
      </View>

      <View style={styles.productPanel}>
        <View style={styles.productBookingCard}>
          <View style={styles.flexText}>
            <Text style={styles.productPriceLabel}>Desde</Text>
            <Text style={styles.productPrice}>{money(tour.price)}</Text>
            <Text style={styles.smallMuted}>por persona, con datos sincronizados desde la web.</Text>
          </View>
          <ActionButton label="Reservar" icon={CreditCard} onPress={startCheckout} />
        </View>

        <View style={styles.productIntroCard}>
          <Text style={styles.sectionTitle}>Lo que vas a vivir</Text>
          <Text style={styles.productLead}>{shortDescription}</Text>
          {tour.highlights.length ? (
            <View style={styles.highlightStrip}>
              {tour.highlights.slice(0, 4).map((highlight) => (
                <View key={highlight} style={styles.highlightPill}>
                  <CheckCircle2 size={14} color={colors.green} />
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.productQuickGrid}>
          {quickFacts.map((fact) => (
            <ProductFact key={fact.label} icon={fact.icon} label={fact.label} value={fact.value} />
          ))}
        </View>

        <View style={styles.gallerySection}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Galeria</Text>
            <Text style={styles.smallMuted}>{galleryImages.length} fotos</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryList}>
            {galleryImages.map((image, index) => (
              <Pressable
                key={image}
                style={[styles.galleryThumb, image === selectedImage ? styles.galleryThumbActive : null]}
                onPress={() => {
                  setSelectedImage(image);
                  setGalleryOpen(true);
                }}
              >
                <RemoteImage uri={image} style={styles.galleryThumbImage} />
                <View style={styles.galleryThumbOverlay}>
                  <Text style={styles.galleryThumbText}>{index + 1}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {detailDescription ? (
          <View style={styles.listPanel}>
            <Text style={styles.sectionTitle}>Descripcion</Text>
            <Text style={styles.bodyText}>{detailDescription}</Text>
          </View>
        ) : null}

        {infoRows.length ? (
          <View style={styles.listPanel}>
            <Text style={styles.sectionTitle}>Detalles importantes</Text>
            {infoRows.map((row) => (
              <View key={row.label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <InfoList title="Incluye" items={tour.includes.length ? tour.includes : tour.highlights} />
        <InfoList title="No incluido" items={tour.notIncluded} />

        {tour.itinerary.length ? (
          <View style={styles.listPanel}>
            <Text style={styles.sectionTitle}>Itinerario</Text>
            {tour.itinerary.map((stop, index) => (
              <View key={`${stop.title}-${index}`} style={styles.timelineRow}>
                <Text style={styles.timelineTime}>{stop.time}</Text>
                <View style={styles.flexText}>
                  <Text style={styles.timelineTitle}>{stop.title}</Text>
                  {stop.description ? <Text style={styles.smallMuted}>{stop.description}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {tour.options.length ? (
          <View style={styles.listPanel}>
            <Text style={styles.sectionTitle}>Opciones</Text>
            {tour.options.map((option) => (
              <Pressable
                key={option.id}
                style={[styles.optionRow, option.id === selectedOptionId ? styles.optionRowActive : null]}
                onPress={() => setSelectedOptionId(option.id)}
              >
                <View style={styles.flexText}>
                  <Text style={styles.optionTitle}>{option.name}</Text>
                  {option.description ? <Text style={styles.smallMuted}>{option.description}</Text> : null}
                </View>
                <Text style={styles.optionPrice}>{money(option.pricePerPerson ?? option.basePrice ?? tour.price)}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.checkoutBox}>
          <View style={styles.rowBetween}>
            <View style={styles.flexText}>
              <Text style={styles.sectionTitle}>Reservar</Text>
              <Text style={styles.smallMuted}>Elige fecha, hora y cantidad de adultos.</Text>
            </View>
            <Text style={styles.checkoutBadge}>Pago seguro</Text>
          </View>
          <View style={styles.dateGrid}>
            <InputField label="Fecha" value={date} onChangeText={setDate} />
            <InputField label="Hora" value={time} onChangeText={setTime} />
          </View>
          <Stepper label="Adultos" value={adults} min={1} max={20} onChange={setAdults} />
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.smallMuted}>Total</Text>
              <Text style={styles.checkoutTotal}>{money(totalPrice)}</Text>
            </View>
            <ActionButton label="Continuar" icon={CreditCard} onPress={startCheckout} />
          </View>
        </View>
      </View>
    </View>
  );
}

function TransfersScreen({
  onSaveQuote,
  onOpenCheckout
}: {
  onSaveQuote: (quote: SavedQuote) => void;
  onOpenCheckout: (url: string) => void;
}) {
  const [routes, setRoutes] = useState<MobileTransferRoute[]>(fallbackTransferRoutes);
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [originOptions, setOriginOptions] = useState<LocationSummary[]>([]);
  const [destinationOptions, setDestinationOptions] = useState<LocationSummary[]>([]);
  const [originLoading, setOriginLoading] = useState(false);
  const [destinationLoading, setDestinationLoading] = useState(false);
  const [originSearchError, setOriginSearchError] = useState<string | null>(null);
  const [destinationSearchError, setDestinationSearchError] = useState<string | null>(null);
  const [origin, setOrigin] = useState<LocationSummary | null>(null);
  const [destination, setDestination] = useState<LocationSummary | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [passengers, setPassengers] = useState(2);
  const [tripType, setTripType] = useState<TripType>("one-way");
  const [departureDate, setDepartureDate] = useState(tomorrow());
  const [departureTime, setDepartureTime] = useState("10:00");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [vehicles, setVehicles] = useState<QuoteVehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const roundTripMultiplier = tripType === "round-trip" ? 1.9 : 1;
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? vehicles[0] ?? null;
  const selectedPrice = selectedVehicle ? Math.round(selectedVehicle.price * roundTripMultiplier) : null;

  const routeSuggestions = useMemo(() => {
    const text = `${originQuery} ${destinationQuery}`.trim().toLowerCase();
    const matches = text
      ? routes.filter((route) =>
          `${route.origin.name} ${route.destination.name} ${route.zoneLabel ?? ""}`.toLowerCase().includes(text)
        )
      : routes;
    return matches.slice(0, 8);
  }, [destinationQuery, originQuery, routes]);

  useEffect(() => {
    let active = true;
    fetchMobileTransferRoutes()
      .then((items) => {
        if (!active || !items.length) return;
        setRoutes(items);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (origin?.name === originQuery || originQuery.trim().length < 2) {
      setOriginOptions([]);
      setOriginLoading(false);
      setOriginSearchError(null);
      return;
    }
    let active = true;
    const localMatches = routeLocationMatches(routes, originQuery);
    setOriginOptions(localMatches);
    setOriginLoading(true);
    setOriginSearchError(null);
    const timer = setTimeout(() => {
      fetchTransferLocations(originQuery)
        .then((items) => {
          if (active) setOriginOptions(mergeLocations(items, localMatches).slice(0, 7));
        })
        .catch((error) => {
          if (active) {
            setOriginOptions(localMatches);
            setOriginSearchError(error instanceof Error ? error.message : "No se pudo buscar origen.");
          }
        })
        .finally(() => {
          if (active) setOriginLoading(false);
        });
    }, 280);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [originQuery, origin?.name, routes]);

  useEffect(() => {
    if (destination?.name === destinationQuery || destinationQuery.trim().length < 2) {
      setDestinationOptions([]);
      setDestinationLoading(false);
      setDestinationSearchError(null);
      return;
    }
    let active = true;
    const localMatches = routeLocationMatches(routes, destinationQuery);
    setDestinationOptions(localMatches);
    setDestinationLoading(true);
    setDestinationSearchError(null);
    const timer = setTimeout(() => {
      fetchTransferLocations(destinationQuery)
        .then((items) => {
          if (active) setDestinationOptions(mergeLocations(items, localMatches).slice(0, 7));
        })
        .catch((error) => {
          if (active) {
            setDestinationOptions(localMatches);
            setDestinationSearchError(error instanceof Error ? error.message : "No se pudo buscar destino.");
          }
        })
        .finally(() => {
          if (active) setDestinationLoading(false);
        });
    }, 280);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [destinationQuery, destination?.name, routes]);

  const resetQuote = () => {
    setVehicles([]);
    setSelectedVehicleId(null);
    setQuoteError(null);
  };

  const selectRoute = (route: MobileTransferRoute) => {
    setSelectedRouteId(route.id);
    setOrigin(route.origin);
    setDestination(route.destination);
    setOriginQuery(route.origin.name);
    setDestinationQuery(route.destination.name);
    setOriginOptions([]);
    setDestinationOptions([]);
    resetQuote();
  };

  const quoteRoute = async () => {
    if (!origin || !destination) {
      setQuoteError("Busca y selecciona origen y destino desde la lista real.");
      return;
    }
    if (origin.id === destination.id) {
      setQuoteError("Origen y destino deben ser diferentes.");
      return;
    }
    if (origin.id.startsWith("route-") || destination.id.startsWith("route-")) {
      setQuoteError("Selecciona el hotel o aeropuerto exacto antes de cotizar.");
      return;
    }
    if (tripType === "round-trip" && (!returnDate || !returnTime)) {
      setQuoteError("Indica fecha y hora de regreso.");
      return;
    }
    setQuoteLoading(true);
    setQuoteError(null);
    try {
      const data = await fetchTransferQuote({
        originId: origin.id,
        destinationId: destination.id,
        passengers
      });
      setVehicles(data.vehicles);
      setSelectedVehicleId(data.vehicles[0]?.id ?? null);
      if (!data.vehicles.length) setQuoteError("No hay vehiculos disponibles para ese grupo.");
    } catch (error) {
      setVehicles([]);
      setSelectedVehicleId(null);
      setQuoteError(error instanceof Error ? error.message : "No se pudo calcular la tarifa real.");
    } finally {
      setQuoteLoading(false);
    }
  };

  const buildSavedQuote = (vehicle: QuoteVehicle, price: number): SavedQuote | null => {
    if (!origin || !destination) return null;
    return {
      origin,
      destination,
      vehicle,
      passengers,
      tripType,
      price,
      checkoutUrl: buildCheckoutUrl({
        origin,
        destination,
        vehicle,
        passengers,
        price,
        tripType,
        departureDate,
        departureTime,
        returnDate,
        returnTime
      })
    };
  };

  const reserveVehicle = (vehicle: QuoteVehicle, price: number) => {
    const quote = buildSavedQuote(vehicle, price);
    if (quote) onOpenCheckout(quote.checkoutUrl);
  };

  return (
    <View style={styles.transferScreen}>
      <ImageBackground source={{ uri: heroImage }} style={styles.transferHero} imageStyle={styles.heroImage as StyleProp<ImageStyle>}>
        <View style={styles.heroOverlay} />
        <View style={styles.transferHeroContent}>
          <Text style={styles.eyebrow}>Traslados privados</Text>
          <Text style={styles.heroTitle}>Busca tu ruta real</Text>
          <Text style={styles.heroSubtitle}>
            Escribe tu aeropuerto, hotel o zona. La app te muestra coincidencias antes de calcular.
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.transferPanel}>
        <View style={styles.transferSearchIntro}>
          <View style={styles.transferSearchIcon}>
            <Search size={20} color={colors.skyDark} />
          </View>
          <View style={styles.flexText}>
            <Text style={styles.transferSearchTitle}>Elige origen y destino</Text>
            <Text style={styles.transferSearchCopy}>No dejamos una ruta marcada por defecto para que reserves exactamente donde necesitas.</Text>
          </View>
        </View>
        <View style={styles.segmentRow}>
          <SegmentButton label="Solo ida" active={tripType === "one-way"} onPress={() => setTripType("one-way")} />
          <SegmentButton label="Ida y vuelta" active={tripType === "round-trip"} onPress={() => setTripType("round-trip")} />
        </View>
        <LocationSearchInput
          label="Origen"
          icon={Plane}
          value={originQuery}
          selected={origin}
          loading={originLoading}
          options={originOptions}
          placeholder="Ej: Aeropuerto Punta Cana"
          onChange={(value) => {
            setOriginQuery(value);
            setOrigin(null);
            resetQuote();
          }}
          onSelect={(item) => {
            setOrigin(item);
            setOriginQuery(item.name);
            setOriginOptions([]);
            setOriginSearchError(null);
            setSelectedRouteId("");
            resetQuote();
          }}
          error={originSearchError}
        />
        <LocationSearchInput
          label="Destino"
          icon={MapPin}
          value={destinationQuery}
          selected={destination}
          loading={destinationLoading}
          options={destinationOptions}
          placeholder="Ej: hotel, villa o zona"
          onChange={(value) => {
            setDestinationQuery(value);
            setDestination(null);
            resetQuote();
          }}
          onSelect={(item) => {
            setDestination(item);
            setDestinationQuery(item.name);
            setDestinationOptions([]);
            setDestinationSearchError(null);
            setSelectedRouteId("");
            resetQuote();
          }}
          error={destinationSearchError}
        />

        <Text style={styles.fieldLabel}>Rutas populares</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.routeList}>
          {routeSuggestions.map((route) => (
            <Pressable
              key={route.id}
              style={[styles.routeShortcut, route.id === selectedRouteId ? styles.routeShortcutActive : null]}
              onPress={() => selectRoute(route)}
            >
              <Text style={styles.routeMeta}>Origen</Text>
              <Text style={styles.routeTitle} numberOfLines={1}>{route.origin.name}</Text>
              <Text style={styles.routeMeta}>Destino</Text>
              <Text style={styles.routeTitle} numberOfLines={1}>{route.destination.name}</Text>
              <Text style={styles.routePrice}>Desde {money(route.priceFrom)}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.dateGrid}>
          <InputField label="Fecha salida" value={departureDate} onChangeText={setDepartureDate} />
          <InputField label="Hora" value={departureTime} onChangeText={setDepartureTime} />
        </View>
        {tripType === "round-trip" ? (
          <View style={styles.dateGrid}>
            <InputField label="Fecha regreso" value={returnDate} onChangeText={setReturnDate} placeholder="YYYY-MM-DD" />
            <InputField label="Hora regreso" value={returnTime} onChangeText={setReturnTime} placeholder="HH:MM" />
          </View>
        ) : null}
        <Stepper label="Pasajeros" value={passengers} min={1} max={14} onChange={setPassengers} />
        <ActionButton label={quoteLoading ? "Buscando..." : "Buscar tarifa"} icon={Search} onPress={quoteRoute} />
      </View>

      {quoteError ? (
        <View style={styles.errorPanel}>
          <Text style={styles.errorText}>{quoteError}</Text>
        </View>
      ) : null}

      {vehicles.length ? (
        <View style={styles.resultsPanel}>
          <Text style={styles.sectionTitle}>Vehiculos disponibles</Text>
          {vehicles.map((vehicle) => {
            const price = Math.round(vehicle.price * roundTripMultiplier);
            const active = vehicle.id === selectedVehicle?.id;
            return (
              <Pressable
                key={vehicle.id}
                style={[styles.vehicleCard, active ? styles.vehicleCardActive : null]}
                onPress={() => setSelectedVehicleId(vehicle.id)}
              >
                {vehicle.imageUrl ? (
                  <Image source={{ uri: absoluteImageUrl(vehicle.imageUrl) }} style={styles.vehicleImage as StyleProp<ImageStyle>} resizeMode="contain" />
                ) : (
                  <View style={styles.vehicleIcon}>
                    <Car size={24} color={colors.skyDark} />
                  </View>
                )}
                <View style={styles.flexText}>
                  <Text style={styles.vehicleName}>{vehicle.name}</Text>
                  <Text style={styles.smallMuted}>
                    {vehicle.category} | {vehicle.minPax}-{vehicle.maxPax} pax
                  </Text>
                </View>
                <View style={styles.vehiclePriceBlock}>
                  <Text style={styles.vehiclePrice}>{money(price)}</Text>
                  <Pressable style={styles.smallButton} onPress={() => reserveVehicle(vehicle, price)}>
                    <Text style={styles.smallButtonText}>Reservar</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
          {selectedVehicle && selectedPrice !== null ? (
            <View style={styles.quoteActions}>
              <ActionButton
                label="Guardar ruta"
                icon={CalendarCheck}
                variant="outlineDark"
                onPress={() => {
                  const quote = buildSavedQuote(selectedVehicle, selectedPrice);
                  if (quote) onSaveQuote(quote);
                }}
              />
              <ActionButton
                label="Reservar ahora"
                icon={CreditCard}
                onPress={() => reserveVehicle(selectedVehicle, selectedPrice)}
              />
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function CheckoutScreen({
  url,
  session,
  stripeReady,
  onClose
}: {
  url: string;
  session: MobileSession | null;
  stripeReady: boolean;
  onClose: () => void;
}) {
  const { initPaymentSheet, presentPaymentSheet, nativeStripeAvailable } = useAppStripe();
  const summary = useMemo(() => readCheckoutSummary(url), [url]);
  const nameParts = (session?.user.name ?? "").trim().split(/\s+/).filter(Boolean);
  const [firstName, setFirstName] = useState(nameParts[0] ?? "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" "));
  const [email, setEmail] = useState(session?.user.email ?? "");
  const [phone, setPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState(summary.destination ?? "");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const validateCheckout = () => {
    const nextErrors: Record<string, string> = {};
    if (!firstName.trim()) nextErrors.firstName = "Indica el nombre.";
    if (!lastName.trim()) nextErrors.lastName = "Indica el apellido.";
    if (!email.trim() || !email.includes("@")) nextErrors.email = "Indica un email valido.";
    if (!pickupLocation.trim()) nextErrors.pickupLocation = "Indica hotel o punto de recogida.";
    setErrors(nextErrors);
    return !Object.keys(nextErrors).length;
  };

  const buildPaymentPayload = () => {
    const params = readUrlParams(url);
    const payload: Record<string, string | number | null | undefined> = {};
    params.forEach((value, key) => {
      payload[key] = value;
    });
    payload.flowType = summary.flowType;
    payload.tourTitle = payload.tourTitle ?? summary.title;
    payload.firstName = firstName.trim();
    payload.lastName = lastName.trim();
    payload.email = email.trim().toLowerCase();
    payload.phone = phone.trim();
    payload.pickupPreference = "pickup";
    payload.pickupLocation = pickupLocation.trim();
    payload.specialRequirements = notes.trim();
    payload.paymentOption = "now";
    payload.totalPrice = payload.totalPrice ?? String(summary.totalPrice);
    return payload;
  };

  const continueToPay = async () => {
    if (paymentLoading) return;
    if (!validateCheckout()) return;
    if (!nativeStripeAvailable) {
      setFeedback("Stripe nativo no esta disponible en la vista web. Usa checkout web o prueba en Android/iOS.");
      return;
    }
    if (!stripeReady) {
      setFeedback("Stripe aun no esta configurado en esta build. Revisa NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.");
      return;
    }

    setPaymentLoading(true);
    setFeedback("Preparando pago seguro...");
    try {
      const intent = await createMobilePaymentIntent(buildPaymentPayload(), session?.token);
      if (!intent.clientSecret) {
        throw new Error("Stripe no devolvio client secret para abrir el pago.");
      }

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "Proactivitis",
        paymentIntentClientSecret: intent.clientSecret,
        returnURL: "proactivitis://stripe-redirect",
        allowsDelayedPaymentMethods: false,
        defaultBillingDetails: {
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined
        }
      });

      if (initError) throw new Error(initError.message);

      setFeedback("Abriendo pago seguro...");
      const { error: paymentError } = await presentPaymentSheet();
      if (paymentError) {
        setFeedback(paymentError.message ?? "El pago fue cancelado o no se completo.");
        return;
      }

      await confirmMobileBooking({
        bookingId: intent.bookingId,
        paymentIntentId: intent.paymentIntentId,
        token: session?.token
      });
      setFeedback("Pago confirmado. Tu reserva quedo registrada en Proactivitis.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se pudo completar el pago.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const openWebCheckout = () => {
    if (!validateCheckout()) return;
    const checkout = addCheckoutContactParams({
      checkoutUrl: url,
      firstName,
      lastName,
      email,
      phone,
      pickupLocation,
      specialRequirements: notes
    });
    setFeedback("Abriendo checkout web de Proactivitis...");
    openUrl(checkout);
  };

  return (
    <View style={styles.checkoutScreen}>
      <View style={styles.checkoutTopbar}>
        <Pressable style={styles.backSoft} onPress={onClose}>
          <ArrowLeft size={20} color={colors.text} />
          <Text style={styles.backSoftText}>Volver</Text>
        </Pressable>
        <Text style={styles.checkoutTitle}>Reserva</Text>
      </View>
      <ScrollView contentContainerStyle={styles.checkoutContent} showsVerticalScrollIndicator={false}>
        <View style={styles.checkoutHero}>
          <Text style={styles.eyebrowDark}>Reserva segura</Text>
          <Text style={styles.checkoutHeroTitle}>Confirma tu experiencia en minutos</Text>
          <Text style={styles.bodyText}>
            Revisa el producto, deja tus datos y continua al pago seguro de Proactivitis.
          </Text>
          <View style={styles.checkoutStepRow}>
            <View style={styles.checkoutStep}>
              <Text style={styles.checkoutStepNumber}>1</Text>
              <Text style={styles.checkoutStepText}>Datos</Text>
            </View>
            <View style={styles.checkoutStep}>
              <Text style={styles.checkoutStepNumber}>2</Text>
              <Text style={styles.checkoutStepText}>Recogida</Text>
            </View>
            <View style={styles.checkoutStep}>
              <Text style={styles.checkoutStepNumber}>3</Text>
              <Text style={styles.checkoutStepText}>Pago</Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryCard}>
          {summary.image ? (
            <Image
              source={{ uri: absoluteImageUrl(summary.image) }}
              style={styles.summaryImage as StyleProp<ImageStyle>}
              resizeMode="cover"
            />
          ) : summary.flowType === "tour" ? (
            <View style={styles.summaryIcon}>
              <ImageIcon size={30} color={colors.white} />
            </View>
          ) : (
            <View style={styles.summaryIcon}>
              <Car size={30} color={colors.white} />
            </View>
          )}
          <View style={styles.flexText}>
            <Text style={styles.summaryType}>{summary.flowType === "transfer" ? "Transfer privado" : "Tour"}</Text>
            <Text style={styles.summaryTitle}>{summary.title}</Text>
            {summary.optionName ? <Text style={styles.smallMuted}>{summary.optionName}</Text> : null}
            {summary.origin || summary.destination ? (
              <Text style={styles.smallMuted}>{[summary.origin, summary.destination].filter(Boolean).join(" -> ")}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.infoGrid}>
          <InfoPill icon={CalendarCheck} label="Fecha" value={summary.date} />
          <InfoPill icon={Clock3} label="Hora" value={summary.time} />
          <InfoPill icon={User} label="Personas" value={`${summary.travelers}`} />
          <InfoPill icon={CreditCard} label="Total" value={money(summary.totalPrice)} />
        </View>

        <View style={styles.formPanel}>
          <Text style={styles.sectionTitle}>Datos de contacto</Text>
          <View style={styles.dateGrid}>
            <InputField label="Nombre" value={firstName} onChangeText={setFirstName} error={errors.firstName} />
            <InputField label="Apellido" value={lastName} onChangeText={setLastName} error={errors.lastName} />
          </View>
          <InputField
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
          />
          <InputField label="Telefono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>

        <View style={styles.formPanel}>
          <Text style={styles.sectionTitle}>Recogida y preferencias</Text>
          <InputField
            label={summary.flowType === "transfer" ? "Punto principal" : "Hotel o punto de recogida"}
            value={pickupLocation}
            onChangeText={setPickupLocation}
            error={errors.pickupLocation}
          />
          <InputField label="Notas especiales" value={notes} onChangeText={setNotes} multiline />
        </View>

        <View style={styles.payPanel}>
          <View style={styles.checkoutSecureNote}>
            <ShieldCheck size={18} color={colors.skySoft} />
            <Text style={styles.checkoutSecureText}>Pago nativo protegido por Stripe y confirmacion por Proactivitis.</Text>
          </View>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.checkoutPayLabel}>Total a pagar</Text>
              <Text style={styles.checkoutTotal}>{money(summary.totalPrice)}</Text>
            </View>
            <ActionButton label={paymentLoading ? "Procesando..." : "Pagar con Stripe"} icon={CreditCard} onPress={continueToPay} />
          </View>
          <ActionButton
            label="Abrir checkout web"
            icon={CreditCard}
            variant="outlineDark"
            onPress={openWebCheckout}
          />
          <ActionButton
            label="Confirmar por WhatsApp"
            icon={MessageCircle}
            variant="outlineDark"
            onPress={() =>
              openUrl(
                whatsappUrl(
                  `Hola Proactivitis. Quiero reservar ${summary.title}. Fecha ${summary.date}, total ${money(summary.totalPrice)}.`
                )
              )
            }
          />
          {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}
        </View>

        <PolicyLinksPanel compact />
      </ScrollView>
    </View>
  );
}

function ZonesScreen({
  tours,
  favorites,
  onFavorite,
  onReserveTour,
  onOpenTransfers
}: {
  tours: AppTour[];
  favorites: Set<string>;
  onFavorite: (tourId: string) => void;
  onReserveTour: (tour: AppTour) => void;
  onOpenTransfers: () => void;
}) {
  const cityFilters = useMemo(() => {
    const cityMap = new Map<string, { city: string; count: number; image: string; sample: string }>();
    tours.forEach((tour) => {
      tourCityLabels(tour).forEach((city) => {
        const current = cityMap.get(city);
        cityMap.set(city, {
          city,
          count: (current?.count ?? 0) + 1,
          image: current?.image ?? tour.image,
          sample: current?.sample ?? tour.title
        });
      });
    });
    return Array.from(cityMap.values()).sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
  }, [tours]);
  const [city, setCity] = useState<string | null>(null);
  const cityTours = useMemo(
    () => (!city || city === "Todas" ? tours : tours.filter((tour) => tourCityLabels(tour).includes(city))),
    [city, tours]
  );

  useEffect(() => {
    if (city && city !== "Todas" && !cityFilters.some((item) => item.city === city)) setCity(null);
  }, [city, cityFilters]);

  if (!city) {
    return (
      <View style={styles.screen}>
        <ScreenHeader
          eyebrow="Ciudades"
          title="Elige donde quieres vivir la experiencia"
          description="Entra por ciudad y mira solo los tours disponibles en esa zona."
        />
        <View style={styles.toursResultBar}>
          <View style={styles.flexText}>
            <Text style={styles.resultSummaryText}>{cityFilters.length} ciudades</Text>
            <Text style={styles.toursResultMeta}>{tours.length} experiencias conectadas</Text>
          </View>
          <ActionButton label="Transfer" icon={Car} onPress={onOpenTransfers} />
        </View>
        <View style={styles.cityGrid}>
          <Pressable style={[styles.cityCard, styles.cityCardWide]} onPress={() => setCity("Todas")}>
            <RemoteImage uri={tours[0]?.image ?? fallbackTourImage} style={styles.cityCardImage} />
            <View style={styles.cityCardOverlay} />
            <View style={styles.cityCardBody}>
              <Text style={styles.cityCardKicker}>Todos los destinos</Text>
              <Text style={styles.cityCardTitle}>Ver todo el catalogo</Text>
              <Text style={styles.cityCardCount}>{tours.length} experiencias</Text>
            </View>
          </Pressable>
          {cityFilters.map((item) => (
            <Pressable key={item.city} style={styles.cityCard} onPress={() => setCity(item.city)}>
              <RemoteImage uri={item.image} style={styles.cityCardImage} />
              <View style={styles.cityCardOverlay} />
              <View style={styles.cityCardBody}>
                <Text style={styles.cityCardKicker}>Ciudad</Text>
                <Text style={styles.cityCardTitle} numberOfLines={2}>{item.city}</Text>
                <Text style={styles.cityCardCount}>{item.count} tours</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Pressable style={styles.zoneBackButton} onPress={() => setCity(null)}>
        <ArrowLeft size={18} color={colors.skyDark} />
        <Text style={styles.zoneBackText}>Cambiar ciudad</Text>
      </Pressable>
      <ScreenHeader
        eyebrow="Ciudad seleccionada"
        title={city === "Todas" ? "Todos los destinos" : city}
        description="Tours filtrados por ciudad. Puedes reservar el tour o cotizar transfer para llegar comodo."
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        <Chip label="Todas" active={city === "Todas"} onPress={() => setCity("Todas")} />
        {cityFilters.map((item) => (
          <Chip key={item.city} label={item.city} active={item.city === city} onPress={() => setCity(item.city)} />
        ))}
      </ScrollView>
      <View style={styles.toursResultBar}>
        <View style={styles.flexText}>
          <Text style={styles.resultSummaryText}>{cityTours.length} experiencias</Text>
          <Text style={styles.toursResultMeta}>{city === "Todas" ? "Todas las ciudades" : city}</Text>
        </View>
        <ActionButton label="Transfer" icon={Car} onPress={onOpenTransfers} />
      </View>
      {cityTours.length ? (
        <View style={styles.cardStack}>
          {cityTours.map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              favorite={favorites.has(tour.id)}
              onFavorite={() => onFavorite(tour.id)}
              onReserve={() => onReserveTour(tour)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <MapPin size={34} color={colors.skyDark} />
          <Text style={styles.emptyTitle}>No hay tours en esta zona</Text>
          <Text style={styles.smallMuted}>Prueba otra zona o revisa el catalogo completo.</Text>
        </View>
      )}
    </View>
  );
}

function TripPlanSection({
  quote,
  favoriteTours,
  onOpenTransfers,
  onOpenTours,
  onFavorite,
  onReserveTour,
  onOpenCheckout
}: {
  quote: SavedQuote | null;
  favoriteTours: AppTour[];
  onOpenTransfers: () => void;
  onOpenTours: () => void;
  onFavorite: (tourId: string) => void;
  onReserveTour: (tour: AppTour) => void;
  onOpenCheckout: (url: string) => void;
}) {
  return (
    <View style={styles.cardStack}>
      <Text style={styles.sectionTitle}>Viajes guardados</Text>
      {!quote && !favoriteTours.length ? (
        <View style={styles.emptyState}>
          <CalendarCheck size={34} color={colors.skyDark} />
          <Text style={styles.emptyTitle}>Todavia no hay planes guardados</Text>
          <Text style={styles.smallMuted}>Cotiza un transfer o marca tours como favoritos.</Text>
          <ActionButton label="Cotizar transfer" icon={Car} onPress={onOpenTransfers} />
          <ActionButton label="Ver tours" icon={Compass} variant="outlineDark" onPress={onOpenTours} />
        </View>
      ) : null}
      {quote ? (
        <View style={styles.savedCard}>
          <Text style={styles.sectionTitle}>Transfer guardado</Text>
          <Text style={styles.savedTitle}>
            {quote.origin.name} {"->"} {quote.destination.name}
          </Text>
          <Text style={styles.smallMuted}>
            {quote.vehicle.name} | {quote.passengers} pax | {money(quote.price)}
          </Text>
          <ActionButton label="Continuar pago" icon={CreditCard} onPress={() => onOpenCheckout(quote.checkoutUrl)} />
        </View>
      ) : null}
      {favoriteTours.length ? (
        <View style={styles.cardStack}>
          <Text style={styles.sectionTitle}>Tours favoritos</Text>
          {favoriteTours.map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              favorite
              onFavorite={() => onFavorite(tour.id)}
              onReserve={() => onReserveTour(tour)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ProfileScreen({
  session,
  quote,
  favoriteTours,
  onSessionChange,
  onOpenTransfers,
  onOpenTours,
  onFavorite,
  onReserveTour,
  onOpenCheckout
}: {
  session: MobileSession | null;
  quote: SavedQuote | null;
  favoriteTours: AppTour[];
  onSessionChange: (session: MobileSession | null) => void;
  onOpenTransfers: () => void;
  onOpenTours: () => void;
  onFavorite: (tourId: string) => void;
  onReserveTour: (tour: AppTour) => void;
  onOpenCheckout: (url: string) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const submit = async () => {
    setFeedback("Conectando...");
    try {
      const nextSession =
        mode === "login"
          ? await loginMobileUser({ email, password })
          : await registerMobileUser({ name, email, password });
      onSessionChange(nextSession);
      setFeedback(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se pudo entrar.");
    }
  };

  if (session) {
    return (
      <View style={styles.screen}>
        <ScreenHeader eyebrow="Cuenta" title="Perfil Proactivitis" description="Tus reservas quedan asociadas a este correo." />
        <View style={styles.savedCard}>
          <User size={28} color={colors.skyDark} />
          <Text style={styles.savedTitle}>{session.user.name || "Cliente Proactivitis"}</Text>
          <Text style={styles.smallMuted}>{session.user.email}</Text>
          <Text style={styles.smallMuted}>{appBuildLabel}</Text>
          <ActionButton label="Cerrar sesion" icon={User} variant="outlineDark" onPress={() => onSessionChange(null)} />
        </View>
        <View style={styles.cardStack}>
          <LinkRow icon={MessageCircle} title="WhatsApp" subtitle="Soporte directo" onPress={() => openUrl(links.whatsapp)} />
          <LinkRow icon={Compass} title="Web" subtitle="proactivitis.com" onPress={() => openUrl(links.home)} />
        </View>
        <TripPlanSection
          quote={quote}
          favoriteTours={favoriteTours}
          onOpenTransfers={onOpenTransfers}
          onOpenTours={onOpenTours}
          onFavorite={onFavorite}
          onReserveTour={onReserveTour}
          onOpenCheckout={onOpenCheckout}
        />
        <PolicyLinksPanel />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader eyebrow="Cuenta" title="Entra a Proactivitis" description="Conecta tus datos con la base real de la web." />
      <View style={styles.formPanel}>
        <View style={styles.segmentRow}>
          <SegmentButton label="Entrar" active={mode === "login"} onPress={() => setMode("login")} />
          <SegmentButton label="Crear cuenta" active={mode === "register"} onPress={() => setMode("register")} />
        </View>
        {mode === "register" ? <InputField label="Nombre" value={name} onChangeText={setName} /> : null}
        <InputField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <InputField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <ActionButton label={mode === "login" ? "Entrar" : "Crear cuenta"} icon={LogIn} onPress={submit} />
        {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}
      </View>
      <TripPlanSection
        quote={quote}
        favoriteTours={favoriteTours}
        onOpenTransfers={onOpenTransfers}
        onOpenTours={onOpenTours}
        onFavorite={onFavorite}
        onReserveTour={onReserveTour}
        onOpenCheckout={onOpenCheckout}
      />
      <PolicyLinksPanel />
    </View>
  );
}

function GalleryViewer({
  images,
  image,
  onSelect,
  onClose
}: {
  images: string[];
  image: string;
  onSelect: (image: string) => void;
  onClose: () => void;
}) {
  return (
    <View style={styles.galleryViewer}>
      <View style={styles.galleryTopbar}>
        <Pressable style={styles.backSoftDark} onPress={onClose}>
          <ArrowLeft size={20} color={colors.white} />
          <Text style={styles.backSoftDarkText}>Cerrar</Text>
        </Pressable>
        <Text style={styles.galleryCounter}>{images.length} fotos</Text>
      </View>
      <RemoteImage uri={image} style={styles.galleryLarge} resizeMode="contain" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryList}>
        {images.map((item, index) => (
          <Pressable
            key={item}
            style={[styles.viewerThumb, item === image ? styles.viewerThumbActive : null]}
            onPress={() => onSelect(item)}
          >
            <RemoteImage uri={item} style={styles.fillImage} />
            <View style={styles.viewerThumbLabel}>
              <Text style={styles.viewerThumbText}>{index + 1}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function VisualPlaceholder({
  icon: Icon,
  title,
  subtitle,
  dark = false
}: {
  icon: IconType;
  title: string;
  subtitle: string;
  dark?: boolean;
}) {
  return (
    <View style={[styles.visualPlaceholder, dark ? styles.visualPlaceholderDark : null]}>
      <View style={[styles.visualIcon, dark ? styles.visualIconDark : null]}>
        <Icon size={28} color={dark ? colors.white : colors.skyDark} />
      </View>
      <Text style={[styles.visualTitle, dark ? styles.visualTitleDark : null]}>{title}</Text>
      <Text style={[styles.visualSubtitle, dark ? styles.visualSubtitleDark : null]}>{subtitle}</Text>
    </View>
  );
}

function LocationSearchInput({
  label,
  icon: Icon,
  value,
  selected,
  loading,
  options,
  error,
  placeholder,
  onChange,
  onSelect
}: {
  label: string;
  icon: IconType;
  value: string;
  selected: LocationSummary | null;
  loading: boolean;
  options: LocationSummary[];
  error?: string | null;
  placeholder: string;
  onChange: (value: string) => void;
  onSelect: (location: LocationSummary) => void;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.locationInputShell, selected ? styles.locationInputSelected : null]}>
        <Icon size={18} color={selected ? colors.green : colors.skyDark} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          style={styles.locationInput}
        />
        {loading ? <Text style={styles.loadingText}>...</Text> : null}
      </View>
      {options.length ? (
        <View style={styles.optionList}>
          {options.slice(0, 7).map((option) => (
            <Pressable key={option.id} style={styles.locationOption} onPress={() => onSelect(option)}>
              <Text style={styles.locationOptionTitle}>{option.name}</Text>
              <Text style={styles.smallMuted}>
                {option.zoneName ?? "Proactivitis"} | {option.type}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {error ? <Text style={styles.inputError}>{error}</Text> : null}
    </View>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType,
  secureTextEntry,
  multiline
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        style={[styles.textInput, multiline ? styles.textArea : null]}
      />
      {error ? <Text style={styles.inputError}>{error}</Text> : null}
    </View>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.stepperRow}>
      <View>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.smallMuted}>Ajusta la cantidad</Text>
      </View>
      <View style={styles.stepper}>
        <Pressable style={styles.stepperButton} onPress={() => onChange(Math.max(min, value - 1))}>
          <Minus size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.stepperValue}>{value}</Text>
        <Pressable style={styles.stepperButton} onPress={() => onChange(Math.min(max, value + 1))}>
          <Plus size={18} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

function ActionButton({
  label,
  icon: Icon,
  onPress,
  variant = "primary"
}: {
  label: string;
  icon: IconType;
  onPress: () => void;
  variant?: "primary" | "outline" | "outlineDark";
}) {
  const darkOutline = variant === "outlineDark";
  const lightOutline = variant === "outline";
  return (
    <Pressable
      style={[
        styles.actionButton,
        variant === "primary" ? styles.actionButtonPrimary : null,
        lightOutline ? styles.actionButtonOutline : null,
        darkOutline ? styles.actionButtonOutlineDark : null
      ]}
      onPress={onPress}
    >
      <Icon size={18} color={variant === "primary" || lightOutline ? colors.white : colors.skyDark} />
      <Text
        style={[
          styles.actionButtonText,
          darkOutline ? styles.actionButtonTextDark : null
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SegmentButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.segmentButton, active ? styles.segmentButtonActive : null]} onPress={onPress}>
      <Text style={[styles.segmentText, active ? styles.segmentTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.chip, active ? styles.chipActive : null]} onPress={onPress}>
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

function SectionHeader({ title, actionLabel, onPress }: { title: string; actionLabel: string; onPress: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onPress}>
        <Text style={styles.sectionAction}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

function ScreenHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <View style={styles.screenHeader}>
      <Text style={styles.eyebrowDark}>{eyebrow}</Text>
      <Text style={styles.screenTitle}>{title}</Text>
      <Text style={styles.screenDescription}>{description}</Text>
    </View>
  );
}

function FeaturedTourCard({ tour, onPress }: { tour: AppTour; onPress: () => void }) {
  return (
    <Pressable style={styles.featuredCard} onPress={onPress}>
      <RemoteImage uri={tour.image} style={styles.featuredImage} />
      <View style={styles.featuredBody}>
        <Text style={styles.featuredMeta}>{tour.location}</Text>
        <Text style={styles.featuredTitle} numberOfLines={2}>
          {tour.title}
        </Text>
        <View style={styles.rowBetween}>
          <Text style={styles.priceText}>Desde {money(tour.price)}</Text>
          <View style={styles.ratingPill}>
            <Star size={13} color={colors.amberDark} fill={colors.amberDark} />
            <Text style={styles.ratingText}>{tour.rating}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function TourCard({
  tour,
  favorite,
  onFavorite,
  onReserve
}: {
  tour: AppTour;
  favorite: boolean;
  onFavorite: () => void;
  onReserve: () => void;
}) {
  return (
    <Pressable style={styles.tourCard} onPress={onReserve}>
      <View style={styles.tourImageWrap}>
        <RemoteImage uri={tour.image} style={styles.tourImage} />
        <View style={styles.tourImageOverlay} />
        <View style={styles.tourTopRow}>
          <Text style={styles.tourCategoryBadge}>{tour.category}</Text>
          <Pressable style={styles.favoriteButton} onPress={onFavorite}>
            <Heart size={18} color={favorite ? colors.green : colors.white} fill={favorite ? colors.green : "transparent"} />
          </Pressable>
        </View>
        <View style={styles.tourRatingBadge}>
          <Star size={13} color={colors.amber} fill={colors.amber} />
          <Text style={styles.tourRatingText}>{tour.rating}</Text>
        </View>
      </View>
      <View style={styles.tourBody}>
        <Text style={styles.tourTitle}>{tour.title}</Text>
        <Text style={styles.bodyText} numberOfLines={2}>{tour.description}</Text>
        <View style={styles.metaRow}>
          <MetaItem icon={MapPin} label={tour.location} />
          <MetaItem icon={Clock3} label={tour.duration} />
          <MetaItem icon={Car} label={tour.pickup} />
        </View>
        <View style={styles.tourFooter}>
          <View>
            <Text style={styles.tourPriceLabel}>Desde</Text>
            <Text style={styles.tourPrice}>{money(tour.price)}</Text>
          </View>
          <ActionButton label="Ver tour" icon={CreditCard} onPress={onReserve} />
        </View>
      </View>
    </Pressable>
  );
}

function MetaPill({ icon: Icon, label }: { icon: IconType; label: string }) {
  return (
    <View style={styles.metaPill}>
      <Icon size={14} color={colors.white} />
      <Text style={styles.metaPillText}>{label}</Text>
    </View>
  );
}

function MetaItem({ icon: Icon, label }: { icon: IconType; label: string }) {
  return (
    <View style={styles.metaItem}>
      <Icon size={14} color={colors.skyDark} />
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

function ProductFact({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
  return (
    <View style={styles.productFact}>
      <View style={styles.productFactIcon}>
        <Icon size={18} color={colors.skyDark} />
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.productFactValue}>{value}</Text>
    </View>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <View style={styles.listPanel}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item) => (
        <View key={item} style={styles.bulletRow}>
          <CheckCircle2 size={17} color={colors.green} />
          <Text style={styles.bodyText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function InfoPill({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
  return (
    <View style={styles.infoPill}>
      <Icon size={18} color={colors.skyDark} />
      <View style={styles.flexText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function PolicyLinksPanel({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <View style={styles.policyMiniPanel}>
        <Text style={styles.policyMiniTitle}>Legal y politicas</Text>
        <Text style={styles.policyMiniText}>Consulta estos enlaces cuando necesites revisar privacidad, terminos o cancelaciones.</Text>
        <View style={styles.policyMiniGrid}>
          {policyLinks.map((item) => (
            <Pressable key={item.title} style={styles.policyMiniLink} onPress={() => openUrl(item.url)}>
              <item.icon size={13} color={colors.skyDark} />
              <Text style={styles.policyMiniLabel} numberOfLines={2}>{item.title}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.policyMiniNotice}>
          Al continuar aceptas los terminos, privacidad y reglas de cancelacion aplicables al producto.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.formPanel}>
      <Text style={styles.sectionTitle}>Politicas y legal</Text>
      <Text style={styles.smallMuted}>
        Accesos visibles para privacidad, terminos, cookies, informacion legal y cancelaciones.
      </Text>
      <View style={compact ? styles.policyCompactList : styles.cardStack}>
        {policyLinks.map((item) => (
          <LinkRow
            key={item.title}
            icon={item.icon}
            title={item.title}
            subtitle={item.subtitle}
            onPress={() => openUrl(item.url)}
          />
        ))}
      </View>
    </View>
  );
}

function LinkRow({
  icon: Icon,
  title,
  subtitle,
  onPress
}: {
  icon: IconType;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.linkRow} onPress={onPress}>
      <View style={styles.linkIcon}>
        <Icon size={20} color={colors.skyDark} />
      </View>
      <View style={styles.flexText}>
        <Text style={styles.linkTitle}>{title}</Text>
        <Text style={styles.smallMuted}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

function RemoteImage({
  uri,
  style,
  resizeMode = "cover"
}: {
  uri?: string | null;
  style: any;
  resizeMode?: "cover" | "contain";
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  return (
    <Image
      source={{ uri: failed ? fallbackTourImage : absoluteImageUrl(uri) }}
      style={style}
      resizeMode={resizeMode}
      onError={() => {
        if (!failed) setFailed(true);
      }}
    />
  );
}

function TabBar({ activeTab, onChange }: { activeTab: TabKey; onChange: (tab: TabKey) => void }) {
  const tabs: Array<{ key: TabKey; label: string; icon: IconType }> = [
    { key: "home", label: "Inicio", icon: Home },
    { key: "tours", label: "Tours", icon: Compass },
    { key: "transfers", label: "Transfer", icon: Car },
    { key: "zones", label: "Zonas", icon: MapPin },
    { key: "profile", label: "Perfil", icon: User }
  ];
  return (
    <View style={styles.tabBar}>
      {tabs.map(({ key, label, icon: Icon }) => {
        const active = key === activeTab;
        return (
          <Pressable key={key} style={styles.tabButton} onPress={() => onChange(key)}>
            <Icon size={20} color={active ? colors.sky : colors.muted} />
            <Text style={[styles.tabLabel, active ? styles.tabLabelActive : null]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.ink
  },
  appShell: {
    flex: 1,
    backgroundColor: colors.surface
  },
  scrollContent: {
    paddingBottom: 104,
    backgroundColor: colors.surface
  },
  screen: {
    gap: 18,
    padding: 16
  },
  flexText: {
    flex: 1,
    minWidth: 0,
    gap: 4
  },
  hero: {
    minHeight: 560,
    justifyContent: "flex-end",
    overflow: "hidden",
    marginHorizontal: -16,
    marginTop: -16,
    backgroundColor: colors.ink
  },
  heroImage: {
    resizeMode: "cover"
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 17, 31, 0.48)"
  },
  heroContent: {
    gap: 13,
    padding: 22,
    paddingBottom: 34
  },
  logoGlow: {
    alignSelf: "flex-start"
  },
  logo: {
    width: 218,
    height: 86
  },
  eyebrow: {
    color: colors.skySoft,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  eyebrowDark: {
    color: colors.skyDark,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  heroTitle: {
    color: colors.white,
    fontSize: 38,
    lineHeight: 43,
    fontWeight: "900",
    letterSpacing: 0,
    textShadowColor: "rgba(6,17,31,0.72)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10
  },
  heroSubtitle: {
    color: "#dbeafe",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700",
    textShadowColor: "rgba(6,17,31,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8
  },
  heroHumanNote: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "900",
    textShadowColor: "rgba(6,17,31,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8
  },
  heroTrustRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  heroTrustPill: {
    overflow: "hidden",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    backgroundColor: "rgba(15,23,42,0.42)",
    color: colors.white,
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  heroActions: {
    gap: 10
  },
  statsRow: {
    flexDirection: "row",
    gap: 10
  },
  statBox: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 12,
    ...shadows.card
  },
  statValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  statLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  homeBookingGrid: {
    flexDirection: "row",
    gap: 10
  },
  homeBookingCard: {
    flex: 1,
    minHeight: 140,
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 13,
    ...shadows.card
  },
  homeBookingEmoji: {
    fontSize: 26,
    lineHeight: 31
  },
  homeBookingTitle: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900"
  },
  homeBookingText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700"
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900"
  },
  sectionAction: {
    color: colors.skyDark,
    fontSize: 13,
    fontWeight: "900"
  },
  horizontalList: {
    gap: 14,
    paddingRight: 16
  },
  featuredCard: {
    width: 260,
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    ...shadows.card
  },
  featuredImage: {
    width: "100%",
    height: 150,
    backgroundColor: colors.line
  },
  featuredBody: {
    gap: 8,
    padding: 13
  },
  featuredMeta: {
    color: colors.skyDark,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  featuredTitle: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "900"
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  categoryCard: {
    width: "48%",
    minHeight: 82,
    gap: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 13,
    ...shadows.card
  },
  categoryTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  categoryText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  cityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  cityCard: {
    width: "48%",
    minHeight: 168,
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: colors.ink,
    ...shadows.card
  },
  cityCardWide: {
    width: "100%",
    minHeight: 178
  },
  cityCardImage: {
    ...StyleSheet.absoluteFillObject
  },
  cityCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6,17,31,0.45)"
  },
  cityCardBody: {
    flex: 1,
    justifyContent: "flex-end",
    gap: 5,
    padding: 12
  },
  cityCardKicker: {
    color: colors.skySoft,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  cityCardTitle: {
    color: colors.white,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900"
  },
  cityCardCount: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.9)",
    color: colors.skyDark,
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  zoneBackButton: {
    alignSelf: "flex-start",
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    backgroundColor: colors.skySoft,
    paddingHorizontal: 12
  },
  zoneBackText: {
    color: colors.skyDark,
    fontSize: 13,
    fontWeight: "900"
  },
  homeRouteGrid: {
    flexDirection: "row",
    gap: 8
  },
  homeRouteCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 172,
    gap: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 11,
    ...shadows.card
  },
  homeRouteCode: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "900"
  },
  homeRouteAirport: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900"
  },
  homeRouteDestination: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700"
  },
  homeVehiclePill: {
    minHeight: 28,
    maxWidth: "100%",
    borderRadius: 999,
    backgroundColor: colors.skySoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8
  },
  homeVehicleText: {
    flexShrink: 1,
    color: colors.skyDark,
    fontSize: 11,
    fontWeight: "900"
  },
  routeCard: {
    width: 230,
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 14,
    ...shadows.card
  },
  routeTitle: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900"
  },
  routeMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700"
  },
  routePrice: {
    color: colors.skyDark,
    fontSize: 14,
    fontWeight: "900"
  },
  noticePanel: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bae6fd",
    backgroundColor: colors.skySoft,
    padding: 15
  },
  noticeTitle: {
    color: colors.skyDark,
    fontSize: 15,
    fontWeight: "900"
  },
  noticeText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700"
  },
  screenHeader: {
    gap: 7,
    paddingTop: 8
  },
  screenTitle: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 37,
    fontWeight: "900",
    letterSpacing: 0
  },
  screenDescription: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  toursHeroPanel: {
    gap: 11,
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bae6fd",
    backgroundColor: colors.white,
    padding: 17,
    ...shadows.card
  },
  toursHeroTitle: {
    color: colors.text,
    fontSize: 31,
    lineHeight: 35,
    fontWeight: "900",
    letterSpacing: 0
  },
  toursHeroCopy: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22
  },
  toursTrustRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  toursTrustPill: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: colors.skySoft,
    color: colors.skyDark,
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  searchBox: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: 15,
    fontWeight: "700"
  },
  chipsRow: {
    gap: 9,
    paddingRight: 16
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 9
  },
  chipActive: {
    borderColor: colors.sky,
    backgroundColor: colors.sky
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  chipTextActive: {
    color: colors.white
  },
  resultSummary: {
    borderRadius: 8,
    backgroundColor: colors.skySoft,
    padding: 12
  },
  resultSummaryText: {
    color: colors.skyDark,
    fontSize: 13,
    fontWeight: "900"
  },
  toursResultBar: {
    minHeight: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 13
  },
  toursResultMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  toursLiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 9,
    paddingVertical: 6
  },
  toursLiveText: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "900"
  },
  toursEmptyPanel: {
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 16
  },
  cardStack: {
    gap: 14
  },
  policyCompactList: {
    gap: 8
  },
  tourCard: {
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    ...shadows.card
  },
  tourImageWrap: {
    height: 226,
    overflow: "hidden",
    backgroundColor: colors.line
  },
  tourImage: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.line
  },
  tourImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6,17,31,0.2)"
  },
  tourTopRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  tourCategoryBadge: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    color: colors.skyDark,
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 6,
    textTransform: "uppercase"
  },
  tourRatingBadge: {
    position: "absolute",
    left: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    backgroundColor: "rgba(6,17,31,0.78)",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  tourRatingText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "900"
  },
  tourBody: {
    gap: 11,
    padding: 15
  },
  tourTitle: {
    color: colors.text,
    fontSize: 21,
    lineHeight: 25,
    fontWeight: "900"
  },
  bodyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600"
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  priceText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    backgroundColor: "#fff7dc",
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  ratingText: {
    color: colors.amberDark,
    fontSize: 12,
    fontWeight: "900"
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(6,17,31,0.5)"
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    maxWidth: "100%"
  },
  metaLabel: {
    flexShrink: 1,
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  tourFooter: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  tourPriceLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  tourPrice: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900"
  },
  productScreen: {
    backgroundColor: colors.surface,
    paddingBottom: 18
  },
  productHero: {
    minHeight: 430,
    justifyContent: "flex-end",
    overflow: "hidden",
    backgroundColor: colors.ink
  },
  productImageButton: {
    ...StyleSheet.absoluteFillObject
  },
  productHeroImage: {
    width: "100%",
    height: "100%"
  },
  productImage: {
    width: "100%",
    height: "100%"
  },
  visualPlaceholder: {
    flex: 1,
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.skySoft,
    padding: 16
  },
  visualPlaceholderDark: {
    backgroundColor: colors.ink
  },
  visualIcon: {
    width: 58,
    height: 58,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card
  },
  visualIconDark: {
    backgroundColor: "rgba(255,255,255,0.14)"
  },
  visualTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center"
  },
  visualTitleDark: {
    color: colors.white
  },
  visualSubtitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center"
  },
  visualSubtitleDark: {
    color: colors.mutedOnDark
  },
  productOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6,17,31,0.34)"
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 2,
    minHeight: 42,
    borderRadius: 999,
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12
  },
  backButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "900"
  },
  galleryFloatingButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 2,
    minHeight: 42,
    borderRadius: 999,
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12
  },
  galleryFloatingText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "900"
  },
  productHeroContent: {
    gap: 12,
    padding: 20,
    paddingBottom: 42
  },
  productTitle: {
    color: colors.white,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "900",
    letterSpacing: 0
  },
  metaPill: {
    minHeight: 31,
    maxWidth: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10
  },
  metaPillText: {
    flexShrink: 1,
    color: colors.white,
    fontSize: 12,
    fontWeight: "900"
  },
  productPanel: {
    gap: 18,
    marginHorizontal: 16,
    marginTop: -32,
    paddingBottom: 6
  },
  productBookingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 16,
    ...shadows.card
  },
  productIntroCard: {
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 16,
    ...shadows.card
  },
  productPriceLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  productPrice: {
    color: colors.skyDark,
    fontSize: 30,
    fontWeight: "900"
  },
  productLead: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "700"
  },
  highlightStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  highlightPill: {
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  highlightText: {
    flexShrink: 1,
    color: colors.text,
    fontSize: 12,
    fontWeight: "800"
  },
  productQuickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  productFact: {
    width: "48%",
    minHeight: 122,
    gap: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 13,
    ...shadows.card
  },
  productFactIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.skySoft
  },
  productFactValue: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900"
  },
  gallerySection: {
    gap: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 14,
    ...shadows.card
  },
  galleryList: {
    gap: 10,
    paddingRight: 8
  },
  galleryThumb: {
    width: 112,
    height: 86,
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.line
  },
  galleryThumbActive: {
    borderColor: colors.sky
  },
  galleryThumbImage: {
    width: "100%",
    height: "100%"
  },
  galleryThumbOverlay: {
    position: "absolute",
    right: 6,
    bottom: 6,
    minWidth: 24,
    minHeight: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.72)",
    paddingHorizontal: 7
  },
  galleryThumbText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "900"
  },
  fillImage: {
    width: "100%",
    height: "100%"
  },
  smallMuted: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700"
  },
  infoGrid: {
    gap: 10
  },
  infoRow: {
    gap: 4,
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: 12
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  infoValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800"
  },
  listPanel: {
    gap: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 14,
    ...shadows.card
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9
  },
  timelineRow: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 10
  },
  timelineTime: {
    width: 56,
    color: colors.skyDark,
    fontSize: 12,
    fontWeight: "900"
  },
  timelineTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  optionRow: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12
  },
  optionRowActive: {
    borderColor: colors.sky,
    backgroundColor: colors.skySoft
  },
  optionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  optionPrice: {
    color: colors.skyDark,
    fontSize: 14,
    fontWeight: "900"
  },
  checkoutBox: {
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 14,
    ...shadows.card
  },
  checkoutBadge: {
    color: colors.green,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    borderRadius: 999,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  dateGrid: {
    flexDirection: "row",
    gap: 10
  },
  fieldBlock: {
    flex: 1,
    gap: 7
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  textInput: {
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: "800"
  },
  textArea: {
    minHeight: 94,
    paddingTop: 12,
    textAlignVertical: "top"
  },
  inputError: {
    color: "#b91c1c",
    fontSize: 12,
    fontWeight: "800"
  },
  checkoutTotal: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900"
  },
  transferScreen: {
    gap: 16,
    paddingBottom: 16,
    backgroundColor: colors.surface
  },
  transferHero: {
    minHeight: 330,
    justifyContent: "flex-end",
    overflow: "hidden",
    backgroundColor: colors.ink
  },
  transferHeroContent: {
    gap: 12,
    padding: 20,
    paddingBottom: 38
  },
  transferPanel: {
    gap: 14,
    marginHorizontal: 16,
    marginTop: -32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 16,
    ...shadows.card
  },
  transferSearchIntro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bae6fd",
    backgroundColor: colors.skySoft,
    padding: 12
  },
  transferSearchIcon: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white
  },
  transferSearchTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  transferSearchCopy: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17
  },
  segmentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9
  },
  segmentButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    paddingHorizontal: 13,
    paddingVertical: 8
  },
  segmentButtonActive: {
    borderColor: colors.sky,
    backgroundColor: colors.sky
  },
  segmentText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  segmentTextActive: {
    color: colors.white
  },
  locationInputShell: {
    minHeight: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12
  },
  locationInputSelected: {
    borderColor: "#86efac",
    backgroundColor: "#f0fdf4"
  },
  locationInput: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: 15,
    fontWeight: "800"
  },
  loadingText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "900"
  },
  optionList: {
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card
  },
  locationOption: {
    gap: 3,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  locationOptionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  routeList: {
    gap: 10,
    paddingRight: 8
  },
  routeShortcut: {
    width: 220,
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 12
  },
  routeShortcutActive: {
    borderColor: colors.sky,
    backgroundColor: colors.skySoft
  },
  stepperRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  stepperButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card
  },
  stepperValue: {
    minWidth: 26,
    textAlign: "center",
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  errorPanel: {
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fff1f2",
    padding: 13
  },
  errorText: {
    color: "#991b1b",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18
  },
  resultsPanel: {
    gap: 12,
    marginHorizontal: 16
  },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 12,
    ...shadows.card
  },
  vehicleCardActive: {
    borderColor: colors.sky,
    backgroundColor: "#f0f9ff"
  },
  vehicleImage: {
    width: 56,
    height: 42
  },
  vehicleIcon: {
    width: 54,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.skySoft
  },
  vehicleName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  vehiclePriceBlock: {
    alignItems: "flex-end",
    gap: 7
  },
  vehiclePrice: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  smallButton: {
    borderRadius: 999,
    backgroundColor: colors.sky,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  smallButtonText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "900"
  },
  quoteActions: {
    gap: 10
  },
  checkoutScreen: {
    flex: 1,
    backgroundColor: colors.surface
  },
  checkoutTopbar: {
    minHeight: 62,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14
  },
  backSoft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    minHeight: 42
  },
  backSoftText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  checkoutTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  checkoutContent: {
    gap: 14,
    padding: 16,
    paddingBottom: 36
  },
  checkoutHero: {
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 16,
    ...shadows.card
  },
  checkoutHeroTitle: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "900"
  },
  checkoutStepRow: {
    flexDirection: "row",
    gap: 8
  },
  checkoutStep: {
    flex: 1,
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: colors.skySoft,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    padding: 8
  },
  checkoutStepNumber: {
    color: colors.skyDark,
    fontSize: 15,
    fontWeight: "900"
  },
  checkoutStepText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "900"
  },
  summaryCard: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 12,
    ...shadows.card
  },
  summaryImage: {
    width: 82,
    height: 82,
    borderRadius: 8,
    backgroundColor: colors.line
  },
  summaryIcon: {
    width: 82,
    height: 82,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.skyDark
  },
  summaryType: {
    color: colors.skyDark,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "900"
  },
  infoPill: {
    minHeight: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12
  },
  formPanel: {
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 14,
    ...shadows.card
  },
  payPanel: {
    gap: 12,
    borderRadius: 8,
    backgroundColor: colors.ink,
    padding: 16
  },
  checkoutSecureNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 8,
    backgroundColor: "rgba(14,165,233,0.15)",
    padding: 10
  },
  checkoutSecureText: {
    flex: 1,
    color: colors.skySoft,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 17
  },
  checkoutPayLabel: {
    color: colors.mutedOnDark,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  policyMiniPanel: {
    gap: 8,
    paddingHorizontal: 4,
    paddingTop: 2,
    paddingBottom: 12
  },
  policyMiniTitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  policyMiniText: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700"
  },
  policyMiniGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  policyMiniLink: {
    width: "48%",
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    backgroundColor: colors.card,
    paddingHorizontal: 8,
    paddingVertical: 7
  },
  policyMiniLabel: {
    flex: 1,
    color: colors.skyDark,
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 14
  },
  policyMiniNotice: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700"
  },
  feedbackText: {
    color: colors.skyDark,
    fontSize: 13,
    fontWeight: "800"
  },
  galleryViewer: {
    flex: 1,
    minHeight: windowHeight,
    gap: 14,
    backgroundColor: colors.ink,
    padding: 14,
    paddingTop: 18
  },
  galleryTopbar: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  backSoftDark: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  backSoftDarkText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "900"
  },
  galleryCounter: {
    color: colors.mutedOnDark,
    fontSize: 12,
    fontWeight: "900"
  },
  galleryLarge: {
    flex: 1,
    width: "100%",
    minHeight: 360
  },
  viewerThumb: {
    width: 82,
    height: 64,
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.16)"
  },
  viewerThumbActive: {
    borderColor: colors.sky
  },
  viewerThumbLabel: {
    position: "absolute",
    right: 5,
    bottom: 5,
    minWidth: 24,
    minHeight: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.72)",
    paddingHorizontal: 7
  },
  viewerThumbText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "900"
  },
  emptyState: {
    gap: 12,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 18,
    ...shadows.card
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center"
  },
  savedCard: {
    gap: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 16,
    ...shadows.card
  },
  savedTitle: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900"
  },
  linkRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 12
  },
  linkIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.skySoft
  },
  linkTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  actionButton: {
    minHeight: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8
  },
  actionButtonPrimary: {
    backgroundColor: colors.sky
  },
  actionButtonOutline: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
    backgroundColor: "rgba(255,255,255,0.1)"
  },
  actionButtonOutlineDark: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "900"
  },
  actionButtonTextDark: {
    color: colors.skyDark
  },
  tabBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 14,
    minHeight: 66,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    ...shadows.card
  },
  tabButton: {
    flex: 1,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    gap: 3
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "900"
  },
  tabLabelActive: {
    color: colors.sky
  }
});
