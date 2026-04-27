import { StatusBar } from "expo-status-bar";
import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import WebView from "react-native-webview";
import {
  ArrowLeft,
  CalendarCheck,
  Car,
  CheckCircle2,
  Clock3,
  Compass,
  CreditCard,
  ExternalLink,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Minus,
  Plane,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  User
} from "lucide-react-native";

import {
  featuredTours,
  tourCategories,
  trustStats,
  type Tour,
  type TourCategory
} from "./src/catalog";
import {
  buildCheckoutUrl,
  fetchTransferLocations,
  fetchTransferQuote,
  fetchMobileTours,
  buildTourCheckoutUrl,
  getApiBaseUrl,
  type LocationSummary,
  type MobileTour,
  type MobileTourOption,
  type QuoteVehicle
} from "./src/api";
import { colors, links, shadows } from "./src/theme";

type TabKey = "home" | "tours" | "transfers" | "trips" | "profile";
type TripType = "one-way" | "round-trip";

type IconType = ComponentType<{ size?: number; color?: string; strokeWidth?: number; fill?: string }>;

type SavedQuote = {
  origin: LocationSummary;
  destination: LocationSummary;
  vehicle: QuoteVehicle;
  passengers: number;
  tripType: TripType;
  price: number;
  checkoutUrl: string;
};

type AppTour = Tour & {
  webTour?: MobileTour;
  options?: MobileTourOption[];
  includes?: string[];
  fullDescription?: string | null;
  cancellationPolicy?: string | null;
};

const heroImage =
  "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/transfer/banner%20%20%20%20transfer.jpeg";

const money = (value: number) => `US$${Math.round(value)}`;

const openUrl = (href: string) => {
  void Linking.openURL(href);
};

const whatsappUrl = (message: string) => `${links.whatsapp}?text=${encodeURIComponent(message)}`;

const normalizeTourCategory = (category?: string | null): Exclude<TourCategory, "Todos"> => {
  const value = (category ?? "").toLowerCase();
  if (value.includes("agua") || value.includes("boat") || value.includes("snork") || value.includes("sail")) return "Agua";
  if (value.includes("cultura") || value.includes("hist")) return "Cultura";
  if (value.includes("premium") || value.includes("luxury") || value.includes("vip")) return "Premium";
  return "Aventura";
};

const toAppTour = (tour: MobileTour): AppTour => ({
  id: tour.id,
  slug: tour.slug,
  title: tour.title,
  category: normalizeTourCategory(tour.category),
  location: tour.location,
  duration: tour.duration,
  price: tour.price,
  rating: 4.9,
  reviews: Math.max(1, tour.highlights.length * 18),
  pickup: tour.pickup ?? "Pickup segun disponibilidad",
  image: tour.image,
  description: tour.description,
  highlights: tour.highlights.length ? tour.highlights : tour.includes.slice(0, 3),
  webTour: tour,
  options: tour.options,
  includes: tour.includes,
  fullDescription: tour.fullDescription,
  cancellationPolicy: tour.cancellationPolicy
});

const fallbackTours: AppTour[] = featuredTours.map((tour) => ({
  ...tour,
  options: [],
  includes: [],
  fullDescription: tour.description,
  cancellationPolicy: null
}));

const toMobileTourPayload = (tour: AppTour): MobileTour => ({
  id: tour.id,
  slug: tour.slug,
  title: tour.title,
  subtitle: null,
  description: tour.description,
  fullDescription: tour.fullDescription ?? tour.description,
  price: tour.price,
  duration: tour.duration,
  category: tour.category,
  location: tour.location,
  pickup: tour.pickup,
  cancellationPolicy: tour.cancellationPolicy ?? null,
  includes: tour.includes ?? [],
  highlights: tour.highlights,
  image: tour.image,
  gallery: [tour.image],
  options: tour.options ?? []
});

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<TourCategory>("Todos");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [tours, setTours] = useState<AppTour[]>(fallbackTours);
  const [toursLoading, setToursLoading] = useState(true);
  const [activeProduct, setActiveProduct] = useState<AppTour | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [savedQuote, setSavedQuote] = useState<SavedQuote | null>(null);

  useEffect(() => {
    let active = true;
    fetchMobileTours()
      .then((items) => {
        if (active && items.length) {
          setTours(items.map(toAppTour));
        }
      })
      .catch(() => {
        if (active) {
          setTours(fallbackTours);
        }
      })
      .finally(() => {
        if (active) setToursLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredTours = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tours.filter((tour) => {
      const matchesCategory = category === "Todos" || tour.category === category;
      const matchesQuery =
        !normalizedQuery ||
        `${tour.title} ${tour.location} ${tour.description}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query, tours]);

  const favoriteTours = tours.filter((tour) => favorites.has(tour.id));

  const toggleFavorite = (tourId: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(tourId)) {
        next.delete(tourId);
      } else {
        next.add(tourId);
      }
      return next;
    });
  };

  const reserveTour = (tour: AppTour) => {
    setActiveProduct(tour);
  };

  const saveQuote = (quote: SavedQuote) => {
    setSavedQuote(quote);
    setActiveTab("trips");
  };

  const renderScreen = () => {
    if (checkoutUrl) {
      return <CheckoutScreen url={checkoutUrl} onClose={() => setCheckoutUrl(null)} />;
    }

    if (activeProduct) {
      return (
        <ProductScreen
          tour={activeProduct}
          onBack={() => setActiveProduct(null)}
          onCheckout={(url) => {
            setActiveProduct(null);
            setCheckoutUrl(url);
          }}
        />
      );
    }

    if (activeTab === "tours") {
      return (
        <ToursScreen
          query={query}
          category={category}
          tours={filteredTours}
          favorites={favorites}
          onQueryChange={setQuery}
          onCategoryChange={setCategory}
          onFavorite={toggleFavorite}
          onReserve={reserveTour}
          loading={toursLoading}
        />
      );
    }

    if (activeTab === "transfers") {
      return (
        <TransfersScreen
          onSaveQuote={saveQuote}
          onOpenCheckout={setCheckoutUrl}
        />
      );
    }

    if (activeTab === "trips") {
      return (
        <TripsScreen
          quote={savedQuote}
          favoriteTours={favoriteTours}
          onOpenTransfers={() => setActiveTab("transfers")}
          onOpenTours={() => setActiveTab("tours")}
          onReserveTour={reserveTour}
          onOpenCheckout={setCheckoutUrl}
        />
      );
    }

    if (activeTab === "profile") {
      return <ProfileScreen />;
    }

    return (
      <HomeScreen
        onOpenTours={() => setActiveTab("tours")}
        onOpenTransfers={() => setActiveTab("transfers")}
        onReserveTour={reserveTour}
        tours={tours}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.appShell}>
        {checkoutUrl ? (
          renderScreen()
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {renderScreen()}
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
  return (
    <View style={styles.screen}>
      <ImageBackground source={{ uri: heroImage }} style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Image source={require("./assets/proactivitis-logo.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.eyebrow}>Tours, transfers y soporte local</Text>
          <Text style={styles.heroTitle}>Reserva Republica Dominicana sin friccion</Text>
          <Text style={styles.heroSubtitle}>
            La app movil mantiene el mismo enfoque de la web: opciones claras, precios visibles y contacto humano.
          </Text>
          <View style={styles.heroActions}>
            <ActionButton label="Buscar tours" icon={Compass} onPress={onOpenTours} />
            <ActionButton label="Cotizar transfer" icon={Car} variant="outline" onPress={onOpenTransfers} />
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

      <SectionHeader title="Recomendados" actionLabel="Ver todos" onPress={onOpenTours} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
        {tours.slice(0, 4).map((tour) => (
          <FeaturedTourCard key={tour.id} tour={tour} onPress={() => onReserveTour(tour)} />
        ))}
      </ScrollView>

      <View style={styles.noticePanel}>
        <ShieldCheck size={22} color={colors.skyDark} />
        <View style={styles.noticeTextBlock}>
          <Text style={styles.noticeTitle}>Confirmacion asistida</Text>
          <Text style={styles.noticeText}>
            Los botones de reserva abren los flujos reales de Proactivitis y WhatsApp para cerrar disponibilidad.
          </Text>
        </View>
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
  category: TourCategory;
  tours: AppTour[];
  favorites: Set<string>;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: TourCategory) => void;
  onFavorite: (tourId: string) => void;
  onReserve: (tour: AppTour) => void;
}) {
  return (
    <View style={styles.screen}>
      <ScreenHeader
        eyebrow="Catalogo"
        title="Tours con precio claro"
        description="Filtra por experiencia, revisa lo incluido y continua a la reserva real."
      />

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

      <View style={styles.resultSummary}>
        <SlidersHorizontal size={18} color={colors.skyDark} />
        <Text style={styles.resultSummaryText}>
          {loading ? "Cargando productos desde la web..." : `${tours.length} experiencias disponibles`}
        </Text>
      </View>

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
  const [adults, setAdults] = useState(2);
  const [date, setDate] = useState(() => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [time, setTime] = useState("09:00");
  const [selectedOptionId, setSelectedOptionId] = useState(
    tour.options?.find((option) => option.isDefault)?.id ?? tour.options?.[0]?.id ?? null
  );
  const selectedOption = tour.options?.find((option) => option.id === selectedOptionId) ?? null;
  const checkoutPrice = selectedOption?.pricePerPerson ?? tour.price;
  const totalPrice =
    selectedOption?.basePrice && selectedOption.baseCapacity ? selectedOption.basePrice : checkoutPrice * adults;

  const startCheckout = () => {
    const webTour = tour.webTour ?? toMobileTourPayload(tour);
    onCheckout(
      buildTourCheckoutUrl({
        tour: webTour,
        option: selectedOption,
        adults,
        date,
        time
      })
    );
  };

  return (
    <View style={styles.productScreen}>
      <ImageBackground source={{ uri: tour.image }} style={styles.productHero} imageStyle={styles.productHeroImage}>
        <View style={styles.productHeroOverlay} />
        <Pressable style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color={colors.white} />
          <Text style={styles.backButtonText}>Volver</Text>
        </Pressable>
        <View style={styles.productHeroContent}>
          <Text style={styles.transferHeroEyebrow}>{tour.category}</Text>
          <Text style={styles.productTitle}>{tour.title}</Text>
          <View style={styles.productMetaRow}>
            <MetaPill icon={MapPin} label={tour.location} />
            <MetaPill icon={Clock3} label={tour.duration} />
            <MetaPill icon={Star} label={`${tour.rating}`} />
          </View>
        </View>
      </ImageBackground>

      <View style={styles.productPanel}>
        <Text style={styles.productPrice}>Desde {money(tour.price)}</Text>
        <Text style={styles.productDescription}>{tour.fullDescription ?? tour.description}</Text>

        <View style={styles.productSection}>
          <Text style={styles.sectionTitle}>Incluye</Text>
          <View style={styles.checkList}>
            {(tour.includes?.length ? tour.includes : tour.highlights).slice(0, 6).map((item) => (
              <View key={item} style={styles.checkItem}>
                <CheckCircle2 size={17} color={colors.green} />
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {tour.options?.length ? (
          <View style={styles.productSection}>
            <Text style={styles.sectionTitle}>Opciones</Text>
            <View style={styles.optionList}>
              {tour.options.map((option) => {
                const active = option.id === selectedOptionId;
                return (
                  <Pressable
                    key={option.id}
                    style={[styles.optionCard, active ? styles.optionCardActive : null]}
                    onPress={() => setSelectedOptionId(option.id)}
                  >
                    <Text style={styles.optionName}>{option.name}</Text>
                    <Text style={styles.optionMeta}>
                      {option.pricePerPerson ? `${money(option.pricePerPerson)} por persona` : "Precio segun grupo"}
                    </Text>
                    {option.description ? <Text style={styles.optionDescription}>{option.description}</Text> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={styles.bookingPanel}>
          <Text style={styles.sectionTitle}>Reservar en la app</Text>
          <View style={styles.transferDateGrid}>
            <View style={styles.transferDateField}>
              <Text style={styles.fieldLabel}>Fecha</Text>
              <TextInput value={date} onChangeText={setDate} style={styles.transferInput} />
            </View>
            <View style={styles.transferDateField}>
              <Text style={styles.fieldLabel}>Hora</Text>
              <TextInput value={time} onChangeText={setTime} style={styles.transferInput} />
            </View>
          </View>
          <View style={styles.passengerRow}>
            <View>
              <Text style={styles.fieldLabel}>Adultos</Text>
              <Text style={styles.helperText}>Se envia al checkout web existente</Text>
            </View>
            <View style={styles.stepper}>
              <Pressable style={styles.stepperButton} onPress={() => setAdults(Math.max(1, adults - 1))}>
                <Minus size={18} color={colors.text} />
              </Pressable>
              <Text style={styles.stepperValue}>{adults}</Text>
              <Pressable style={styles.stepperButton} onPress={() => setAdults(Math.min(12, adults + 1))}>
                <Plus size={18} color={colors.text} />
              </Pressable>
            </View>
          </View>
          <View style={styles.productCheckoutRow}>
            <View>
              <Text style={styles.fromText}>Total estimado</Text>
              <Text style={styles.tourPrice}>{money(totalPrice)}</Text>
            </View>
            <ActionButton label="Checkout" icon={CreditCard} onPress={startCheckout} />
          </View>
        </View>
      </View>
    </View>
  );
}

function CheckoutScreen({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <View style={styles.checkoutScreen}>
      <View style={styles.checkoutTopbar}>
        <Pressable style={styles.checkoutClose} onPress={onClose}>
          <ArrowLeft size={20} color={colors.text} />
          <Text style={styles.checkoutCloseText}>Volver</Text>
        </Pressable>
        <Text style={styles.checkoutTitle}>Checkout Proactivitis</Text>
      </View>
      <WebView source={{ uri: url }} style={styles.checkoutWebview} startInLoadingState />
    </View>
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

function TransfersScreen({
  onSaveQuote,
  onOpenCheckout
}: {
  onSaveQuote: (quote: SavedQuote) => void;
  onOpenCheckout: (url: string) => void;
}) {
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [originOptions, setOriginOptions] = useState<LocationSummary[]>([]);
  const [destinationOptions, setDestinationOptions] = useState<LocationSummary[]>([]);
  const [originLoading, setOriginLoading] = useState(false);
  const [destinationLoading, setDestinationLoading] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState<LocationSummary | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<LocationSummary | null>(null);
  const [passengers, setPassengers] = useState(2);
  const [tripType, setTripType] = useState<TripType>("one-way");
  const [departureDate, setDepartureDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return tomorrow.toISOString().slice(0, 10);
  });
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

  useEffect(() => {
    if (selectedOrigin?.name === originQuery || originQuery.trim().length < 2) {
      setOriginOptions([]);
      setOriginLoading(false);
      return;
    }

    let active = true;
    setOriginLoading(true);
    const timeout = setTimeout(() => {
      fetchTransferLocations(originQuery)
        .then((items) => {
          if (active) setOriginOptions(items);
        })
        .catch(() => {
          if (active) setOriginOptions([]);
        })
        .finally(() => {
          if (active) setOriginLoading(false);
        });
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [originQuery, selectedOrigin]);

  useEffect(() => {
    if (selectedDestination?.name === destinationQuery || destinationQuery.trim().length < 2) {
      setDestinationOptions([]);
      setDestinationLoading(false);
      return;
    }

    let active = true;
    setDestinationLoading(true);
    const timeout = setTimeout(() => {
      fetchTransferLocations(destinationQuery)
        .then((items) => {
          if (active) setDestinationOptions(items);
        })
        .catch(() => {
          if (active) setDestinationOptions([]);
        })
        .finally(() => {
          if (active) setDestinationLoading(false);
        });
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [destinationQuery, selectedDestination]);

  const selectOrigin = (location: LocationSummary) => {
    setSelectedOrigin(location);
    setOriginQuery(location.name);
    setOriginOptions([]);
    setVehicles([]);
    setSelectedVehicleId(null);
  };

  const selectDestination = (location: LocationSummary) => {
    setSelectedDestination(location);
    setDestinationQuery(location.name);
    setDestinationOptions([]);
    setVehicles([]);
    setSelectedVehicleId(null);
  };

  const quoteRoute = async () => {
    if (!selectedOrigin || !selectedDestination) {
      setQuoteError("Selecciona origen y destino desde los resultados de la web.");
      return;
    }
    if (tripType === "round-trip" && (!returnDate || !returnTime)) {
      setQuoteError("Para ida y vuelta indica fecha y hora de regreso.");
      return;
    }

    setQuoteLoading(true);
    setQuoteError(null);
    try {
      const data = await fetchTransferQuote({
        originId: selectedOrigin.id,
        destinationId: selectedDestination.id,
        passengers
      });
      setVehicles(data.vehicles);
      setSelectedVehicleId(data.vehicles[0]?.id ?? null);
      if (!data.vehicles.length) {
        setQuoteError("La web no devolvio vehiculos disponibles para esa ruta.");
      }
    } catch (error) {
      setVehicles([]);
      setSelectedVehicleId(null);
      setQuoteError(error instanceof Error ? error.message : "No se pudo calcular la tarifa.");
    } finally {
      setQuoteLoading(false);
    }
  };

  const buildSavedQuote = (vehicle: QuoteVehicle, price: number): SavedQuote | null => {
    if (!selectedOrigin || !selectedDestination) return null;
    return {
      origin: selectedOrigin,
      destination: selectedDestination,
      vehicle,
      passengers,
      tripType,
      price,
      checkoutUrl: buildCheckoutUrl({
        origin: selectedOrigin,
        destination: selectedDestination,
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

  const openCheckout = (vehicle: QuoteVehicle, price: number) => {
    const quote = buildSavedQuote(vehicle, price);
    if (quote) onOpenCheckout(quote.checkoutUrl);
  };

  const saveSelectedQuote = () => {
    if (!selectedVehicle || selectedPrice === null) return;
    const quote = buildSavedQuote(selectedVehicle, selectedPrice);
    if (quote) onSaveQuote(quote);
  };

  const requestSelectedTransfer = () => {
    if (!selectedOrigin || !selectedDestination || !selectedVehicle || selectedPrice === null) return;
    openUrl(
      whatsappUrl(
        `Hola Proactivitis. Quiero confirmar un transfer ${selectedOrigin.name} -> ${selectedDestination.name}. Vehiculo: ${selectedVehicle.name}. Pasajeros: ${passengers}. Tipo: ${tripType}. Precio web/app: ${money(selectedPrice)}.`
      )
    );
  };

  return (
    <View style={styles.transferScreen}>
      <ImageBackground source={{ uri: heroImage }} style={styles.transferHero} imageStyle={styles.transferHeroImage}>
        <View style={styles.transferHeroOverlay} />
        <View style={styles.transferHeroContent}>
          <Text style={styles.transferHeroEyebrow}>Traslados privados</Text>
          <Text style={styles.transferHeroTitle}>Busca tu ruta como en la web</Text>
          <Text style={styles.transferHeroText}>
            Origen, destino y tarifas vienen del sistema de Proactivitis. La app solo adapta el flujo a movil.
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.transferSearchPanel}>
        <View style={styles.tripTypeRow}>
          <TripTypeButton label="Solo ida" active={tripType === "one-way"} onPress={() => setTripType("one-way")} />
          <TripTypeButton label="Ida y vuelta" active={tripType === "round-trip"} onPress={() => setTripType("round-trip")} />
        </View>

        <LocationSearchInput
          label="Origen"
          icon={Plane}
          value={originQuery}
          placeholder="Ej: PUJ Airport"
          loading={originLoading}
          options={originOptions}
          selected={selectedOrigin}
          onChange={(value) => {
            setOriginQuery(value);
            setSelectedOrigin(null);
          }}
          onSelect={selectOrigin}
        />
        <LocationSearchInput
          label="Destino"
          icon={MapPin}
          value={destinationQuery}
          placeholder="Ej: Hard Rock, Barcelo, Cap Cana"
          loading={destinationLoading}
          options={destinationOptions}
          selected={selectedDestination}
          onChange={(value) => {
            setDestinationQuery(value);
            setSelectedDestination(null);
          }}
          onSelect={selectDestination}
        />

        <View style={styles.transferDateGrid}>
          <View style={styles.transferDateField}>
            <Text style={styles.fieldLabel}>Fecha salida</Text>
            <TextInput value={departureDate} onChangeText={setDepartureDate} style={styles.transferInput} />
          </View>
          <View style={styles.transferDateField}>
            <Text style={styles.fieldLabel}>Hora</Text>
            <TextInput value={departureTime} onChangeText={setDepartureTime} style={styles.transferInput} />
          </View>
        </View>

        {tripType === "round-trip" ? (
          <View style={styles.transferDateGrid}>
            <View style={styles.transferDateField}>
              <Text style={styles.fieldLabel}>Fecha regreso</Text>
              <TextInput value={returnDate} onChangeText={setReturnDate} placeholder="YYYY-MM-DD" style={styles.transferInput} />
            </View>
            <View style={styles.transferDateField}>
              <Text style={styles.fieldLabel}>Hora regreso</Text>
              <TextInput value={returnTime} onChangeText={setReturnTime} placeholder="HH:MM" style={styles.transferInput} />
            </View>
          </View>
        ) : null}

        <View style={styles.passengerRow}>
          <View>
            <Text style={styles.fieldLabel}>Pasajeros</Text>
            <Text style={styles.helperText}>La web filtrara vehiculos por capacidad</Text>
          </View>
          <View style={styles.stepper}>
            <Pressable style={styles.stepperButton} onPress={() => setPassengers(Math.max(1, passengers - 1))}>
              <Minus size={18} color={colors.text} />
            </Pressable>
            <Text style={styles.stepperValue}>{passengers}</Text>
            <Pressable style={styles.stepperButton} onPress={() => setPassengers(Math.min(14, passengers + 1))}>
              <Plus size={18} color={colors.text} />
            </Pressable>
          </View>
        </View>

        <ActionButton label={quoteLoading ? "Buscando..." : "Buscar tarifa"} icon={Search} onPress={quoteRoute} />
        <Text style={styles.apiHint}>API: {getApiBaseUrl()}</Text>
      </View>

      {quoteError ? (
        <View style={styles.transferError}>
          <Text style={styles.transferErrorText}>{quoteError}</Text>
        </View>
      ) : null}

      {vehicles.length > 0 ? (
        <View style={styles.transferResults}>
          <Text style={styles.sectionTitle}>Vehiculos disponibles</Text>
          {vehicles.map((vehicle) => {
            const finalPrice = Math.round(vehicle.price * roundTripMultiplier);
            return (
              <TransferVehicleResult
                key={vehicle.id}
                vehicle={vehicle}
                price={finalPrice}
                active={vehicle.id === selectedVehicle?.id}
                onSelect={() => setSelectedVehicleId(vehicle.id)}
                onCheckout={() => openCheckout(vehicle, finalPrice)}
              />
            );
          })}
        </View>
      ) : null}

      {selectedVehicle && selectedPrice !== null ? (
        <View style={styles.quotePanelWeb}>
          <Text style={styles.quoteLabelWeb}>Cotizacion desde la web</Text>
          <Text style={styles.quotePriceWeb}>{money(selectedPrice)}</Text>
          <Text style={styles.quoteMetaWeb}>
            {selectedVehicle.name} | {passengers} pax | {tripType === "round-trip" ? "ida y vuelta" : "solo ida"}
          </Text>
          <View style={styles.quoteActions}>
            <ActionButton label="Guardar" icon={CalendarCheck} onPress={saveSelectedQuote} />
            <ActionButton label="WhatsApp" icon={MessageCircle} variant="outlineDark" onPress={requestSelectedTransfer} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function TripTypeButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.tripTypeButton, active ? styles.tripTypeButtonActive : null]} onPress={onPress}>
      <Text style={[styles.tripTypeButtonText, active ? styles.tripTypeButtonTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

function LocationSearchInput({
  label,
  icon: Icon,
  value,
  placeholder,
  loading,
  options,
  selected,
  onChange,
  onSelect
}: {
  label: string;
  icon: IconType;
  value: string;
  placeholder: string;
  loading: boolean;
  options: LocationSummary[];
  selected: LocationSummary | null;
  onChange: (value: string) => void;
  onSelect: (location: LocationSummary) => void;
}) {
  return (
    <View style={styles.locationField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.locationInputShell, selected ? styles.locationInputShellSelected : null]}>
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
      {options.length > 0 ? (
        <View style={styles.locationOptions}>
          {options.slice(0, 6).map((location) => (
            <Pressable key={location.id} style={styles.locationOption} onPress={() => onSelect(location)}>
              <Text style={styles.locationOptionName}>{location.name}</Text>
              <Text style={styles.locationOptionMeta}>
                {location.zoneName ?? "Proactivitis"} | {location.type}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function TransferVehicleResult({
  vehicle,
  price,
  active,
  onSelect,
  onCheckout
}: {
  vehicle: QuoteVehicle;
  price: number;
  active: boolean;
  onSelect: () => void;
  onCheckout: () => void;
}) {
  const vehicleImage = vehicle.imageUrl
    ? vehicle.imageUrl.startsWith("http")
      ? vehicle.imageUrl
      : `${getApiBaseUrl().replace(/\/$/, "")}${vehicle.imageUrl}`
    : null;

  return (
    <Pressable style={[styles.webVehicleCard, active ? styles.webVehicleCardActive : null]} onPress={onSelect}>
      {vehicleImage ? <Image source={{ uri: vehicleImage }} style={styles.webVehicleImage} resizeMode="contain" /> : null}
      <View style={styles.webVehicleText}>
        <Text style={styles.webVehicleName}>{vehicle.name}</Text>
        <Text style={styles.webVehicleMeta}>
          {vehicle.category} | {vehicle.minPax}-{vehicle.maxPax} pax
        </Text>
      </View>
      <View style={styles.webVehiclePriceBlock}>
        <Text style={styles.webVehiclePrice}>{money(price)}</Text>
        <Pressable style={styles.checkoutMiniButton} onPress={onCheckout}>
          <Text style={styles.checkoutMiniButtonText}>Reservar</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function TripsScreen({
  quote,
  favoriteTours,
  onOpenTransfers,
  onOpenTours,
  onReserveTour,
  onOpenCheckout
}: {
  quote: SavedQuote | null;
  favoriteTours: AppTour[];
  onOpenTransfers: () => void;
  onOpenTours: () => void;
  onReserveTour: (tour: AppTour) => void;
  onOpenCheckout: (url: string) => void;
}) {
  return (
    <View style={styles.screen}>
      <ScreenHeader
        eyebrow="Reservas"
        title="Tu plan de viaje"
        description="Guarda cotizaciones y tours favoritos antes de cerrar la reserva."
      />

      {!quote && favoriteTours.length === 0 ? (
        <View style={styles.emptyState}>
          <CalendarCheck size={34} color={colors.skyDark} />
          <Text style={styles.emptyTitle}>Aun no tienes planes guardados</Text>
          <Text style={styles.emptyText}>Cotiza un transfer o marca tours como favoritos para construir tu itinerario.</Text>
          <View style={styles.emptyActions}>
            <ActionButton label="Cotizar transfer" icon={Car} onPress={onOpenTransfers} />
            <ActionButton label="Explorar tours" icon={Compass} variant="outlineDark" onPress={onOpenTours} />
          </View>
        </View>
      ) : null}

      {quote ? (
        <View style={styles.savedCard}>
          <Text style={styles.savedLabel}>Transfer guardado</Text>
          <Text style={styles.savedTitle}>
            {quote.origin.name} {"->"} {quote.destination.name}
          </Text>
          <Text style={styles.savedMeta}>
            {quote.vehicle.name} | {quote.passengers} pax | {quote.tripType === "round-trip" ? "ida y vuelta" : "solo ida"}
          </Text>
          <Text style={styles.savedPrice}>{money(quote.price)}</Text>
          <View style={styles.quoteActions}>
            <ActionButton label="Continuar pago" icon={CreditCard} onPress={() => onOpenCheckout(quote.checkoutUrl)} />
            <ActionButton
              label="Pedir confirmacion"
              icon={MessageCircle}
              variant="outlineDark"
              onPress={() =>
                openUrl(
                  whatsappUrl(
                    `Hola Proactivitis. Quiero confirmar mi transfer guardado: ${quote.origin.name} -> ${quote.destination.name}, ${quote.vehicle.name}, ${quote.passengers} pasajeros.`
                  )
                )
              }
            />
          </View>
        </View>
      ) : null}

      {favoriteTours.length > 0 ? (
        <View style={styles.cardStack}>
          <Text style={styles.sectionTitle}>Tours favoritos</Text>
          {favoriteTours.map((tour) => (
            <CompactTourRow key={tour.id} tour={tour} onPress={() => onReserveTour(tour)} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <ScreenHeader
        eyebrow="Cuenta y soporte"
        title="Asistencia Proactivitis"
        description="Accesos rapidos para hablar con el equipo, ver redes y continuar en la web."
      />

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <User size={28} color={colors.white} />
        </View>
        <View style={styles.profileText}>
          <Text style={styles.profileName}>Cliente invitado</Text>
          <Text style={styles.profileMeta}>Login y reservas sincronizadas entran en la proxima fase.</Text>
        </View>
      </View>

      <View style={styles.linkStack}>
        <LinkRow icon={MessageCircle} title="WhatsApp 24/7" subtitle="+1 829 475 6298" onPress={() => openUrl(links.whatsapp)} />
        <LinkRow icon={ExternalLink} title="Web Proactivitis" subtitle="Abrir catalogo completo" onPress={() => openUrl(links.home)} />
        <LinkRow icon={CreditCard} title="Pagos seguros" subtitle="Stripe, PayPal y tarjetas en la web" onPress={() => openUrl(links.home)} />
      </View>

      <View style={styles.socialPanel}>
        <Text style={styles.sectionTitle}>Redes oficiales</Text>
        <View style={styles.socialButtons}>
          <Pressable style={styles.socialButton} onPress={() => openUrl(links.instagram)}>
            <Text style={styles.socialText}>Instagram</Text>
          </Pressable>
          <Pressable style={styles.socialButton} onPress={() => openUrl(links.facebook)}>
            <Text style={styles.socialText}>Facebook</Text>
          </Pressable>
          <Pressable style={styles.socialButton} onPress={() => openUrl(links.tiktok)}>
            <Text style={styles.socialText}>TikTok</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function TabBar({ activeTab, onChange }: { activeTab: TabKey; onChange: (tab: TabKey) => void }) {
  const tabs: { key: TabKey; label: string; icon: IconType }[] = [
    { key: "home", label: "Inicio", icon: Home },
    { key: "tours", label: "Tours", icon: Compass },
    { key: "transfers", label: "Transfer", icon: Car },
    { key: "trips", label: "Reservas", icon: CalendarCheck },
    { key: "profile", label: "Soporte", icon: User }
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const active = tab.key === activeTab;
        const Icon = tab.icon;
        return (
          <Pressable key={tab.key} style={styles.tabButton} onPress={() => onChange(tab.key)}>
            <Icon size={21} color={active ? colors.sky : colors.muted} strokeWidth={active ? 2.8 : 2.2} />
            <Text style={[styles.tabLabel, active ? styles.tabLabelActive : null]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ScreenHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <View style={styles.screenHeader}>
      <Image source={require("./assets/proactivitis-logo.png")} style={styles.headerLogo} resizeMode="contain" />
      <Text style={styles.eyebrowDark}>{eyebrow}</Text>
      <Text style={styles.screenTitle}>{title}</Text>
      <Text style={styles.screenDescription}>{description}</Text>
    </View>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onPress
}: {
  title: string;
  actionLabel: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onPress}>
        <Text style={styles.sectionAction}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

function ActionButton({
  label,
  icon: Icon,
  variant = "primary",
  onPress
}: {
  label: string;
  icon: IconType;
  variant?: "primary" | "outline" | "outlineDark";
  onPress: () => void;
}) {
  const outline = variant === "outline" || variant === "outlineDark";
  const darkOutline = variant === "outlineDark";
  return (
    <Pressable
      style={[
        styles.actionButton,
        outline ? styles.actionButtonOutline : styles.actionButtonPrimary,
        darkOutline ? styles.actionButtonOutlineDark : null
      ]}
      onPress={onPress}
    >
      <Icon size={18} color={outline ? (darkOutline ? colors.skyDark : colors.white) : colors.white} strokeWidth={2.6} />
      <Text
        style={[
          styles.actionButtonText,
          outline ? styles.actionButtonTextOutline : null,
          darkOutline ? styles.actionButtonTextOutlineDark : null
        ]}
      >
        {label}
      </Text>
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

function FeaturedTourCard({ tour, onPress }: { tour: AppTour; onPress: () => void }) {
  return (
    <Pressable style={styles.featuredCard} onPress={onPress}>
      <Image source={{ uri: tour.image }} style={styles.featuredImage} />
      <View style={styles.featuredBody}>
        <Text style={styles.featuredMeta}>{tour.location}</Text>
        <Text style={styles.featuredTitle} numberOfLines={2}>
          {tour.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>Desde {money(tour.price)}</Text>
          <View style={styles.ratingPill}>
            <Star size={13} color={colors.amberDark} fill={colors.amber} />
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
    <View style={styles.tourCard}>
      <Image source={{ uri: tour.image }} style={styles.tourImage} />
      <View style={styles.tourBody}>
        <View style={styles.tourTopRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{tour.category}</Text>
          </View>
          <Pressable style={styles.favoriteButton} onPress={onFavorite}>
            <Heart
              size={20}
              color={favorite ? "#ef4444" : colors.muted}
              fill={favorite ? "#ef4444" : "transparent"}
            />
          </Pressable>
        </View>
        <Text style={styles.tourTitle}>{tour.title}</Text>
        <Text style={styles.tourDescription}>{tour.description}</Text>
        <View style={styles.tourMetaGrid}>
          <MetaItem icon={MapPin} label={tour.location} />
          <MetaItem icon={Clock3} label={tour.duration} />
          <MetaItem icon={Star} label={`${tour.rating} (${tour.reviews})`} />
        </View>
        <View style={styles.highlightsRow}>
          {tour.highlights.slice(0, 3).map((highlight) => (
            <Text key={highlight} style={styles.highlightPill}>
              {highlight}
            </Text>
          ))}
        </View>
        <View style={styles.tourFooter}>
          <View>
            <Text style={styles.fromText}>Desde</Text>
            <Text style={styles.tourPrice}>{money(tour.price)}</Text>
          </View>
          <ActionButton label="Reservar" icon={ExternalLink} onPress={onReserve} />
        </View>
      </View>
    </View>
  );
}

function CompactTourRow({ tour, onPress }: { tour: AppTour; onPress: () => void }) {
  return (
    <Pressable style={styles.compactRow} onPress={onPress}>
      <Image source={{ uri: tour.image }} style={styles.compactImage} />
      <View style={styles.compactText}>
        <Text style={styles.compactTitle}>{tour.title}</Text>
        <Text style={styles.compactMeta}>
          {tour.location} | Desde {money(tour.price)}
        </Text>
      </View>
      <ExternalLink size={18} color={colors.skyDark} />
    </Pressable>
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
      <View style={styles.linkText}>
        <Text style={styles.linkTitle}>{title}</Text>
        <Text style={styles.linkSubtitle}>{subtitle}</Text>
      </View>
      <ExternalLink size={18} color={colors.muted} />
    </Pressable>
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
  transferScreen: {
    gap: 16,
    paddingBottom: 16,
    backgroundColor: colors.surface
  },
  transferHero: {
    minHeight: 360,
    justifyContent: "flex-end",
    overflow: "hidden"
  },
  transferHeroImage: {
    resizeMode: "cover"
  },
  transferHeroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.66)"
  },
  transferHeroContent: {
    gap: 10,
    padding: 20,
    paddingBottom: 44
  },
  transferHeroEyebrow: {
    color: "rgba(255, 255, 255, 0.76)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  transferHeroTitle: {
    color: colors.white,
    fontSize: 36,
    lineHeight: 41,
    fontWeight: "900",
    letterSpacing: 0
  },
  transferHeroText: {
    color: "rgba(255, 255, 255, 0.92)",
    fontSize: 15,
    lineHeight: 22
  },
  transferSearchPanel: {
    gap: 14,
    marginHorizontal: 16,
    marginTop: -34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 16,
    ...shadows.card
  },
  tripTypeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9
  },
  tripTypeButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    paddingHorizontal: 13,
    paddingVertical: 8
  },
  tripTypeButtonActive: {
    borderColor: "#059669",
    backgroundColor: "#059669"
  },
  tripTypeButtonText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  tripTypeButtonTextActive: {
    color: colors.white
  },
  locationField: {
    gap: 7
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
  locationInputShellSelected: {
    borderColor: "#86efac",
    backgroundColor: "#f0fdf4"
  },
  locationInput: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: 15,
    fontWeight: "700"
  },
  loadingText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "900"
  },
  locationOptions: {
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
  locationOptionName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  locationOptionMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  transferDateGrid: {
    flexDirection: "row",
    gap: 10
  },
  transferDateField: {
    flex: 1,
    gap: 7
  },
  transferInput: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: "800"
  },
  apiHint: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700"
  },
  transferError: {
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fff1f2",
    padding: 13
  },
  transferErrorText: {
    color: "#991b1b",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18
  },
  transferResults: {
    gap: 12,
    marginHorizontal: 16
  },
  webVehicleCard: {
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
  webVehicleCardActive: {
    borderColor: colors.sky,
    backgroundColor: "#f0f9ff"
  },
  webVehicleImage: {
    width: 58,
    height: 42
  },
  webVehicleText: {
    flex: 1,
    gap: 3
  },
  webVehicleName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  webVehicleMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  webVehiclePriceBlock: {
    alignItems: "flex-end",
    gap: 7
  },
  webVehiclePrice: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900"
  },
  checkoutMiniButton: {
    borderRadius: 999,
    backgroundColor: colors.sky,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  checkoutMiniButtonText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "900"
  },
  quotePanelWeb: {
    gap: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.ink,
    padding: 18,
    ...shadows.card
  },
  quoteLabelWeb: {
    color: "#93c5fd",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  quotePriceWeb: {
    color: colors.white,
    fontSize: 42,
    fontWeight: "900"
  },
  quoteMetaWeb: {
    color: colors.mutedOnDark,
    fontSize: 14,
    fontWeight: "700"
  },
  productScreen: {
    gap: 0,
    paddingBottom: 18,
    backgroundColor: colors.surface
  },
  productHero: {
    minHeight: 380,
    justifyContent: "flex-end",
    overflow: "hidden",
    backgroundColor: colors.ink
  },
  productHeroImage: {
    resizeMode: "cover"
  },
  productHeroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 17, 31, 0.58)"
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
  productHeroContent: {
    gap: 12,
    padding: 20,
    paddingBottom: 34
  },
  productTitle: {
    color: colors.white,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "900",
    letterSpacing: 0
  },
  productMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
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
    marginTop: -22,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 16,
    ...shadows.card
  },
  productPrice: {
    color: colors.skyDark,
    fontSize: 18,
    fontWeight: "900"
  },
  productDescription: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "600"
  },
  productSection: {
    gap: 11
  },
  checkList: {
    gap: 9
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9
  },
  checkText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700"
  },
  optionList: {
    gap: 10
  },
  optionCard: {
    gap: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 12
  },
  optionCardActive: {
    borderColor: colors.sky,
    backgroundColor: colors.skySoft
  },
  optionName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  optionMeta: {
    color: colors.skyDark,
    fontSize: 13,
    fontWeight: "900"
  },
  optionDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600"
  },
  bookingPanel: {
    gap: 14,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14
  },
  productCheckoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  checkoutScreen: {
    flex: 1,
    backgroundColor: colors.card
  },
  checkoutTopbar: {
    minHeight: 58,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12
  },
  checkoutClose: {
    minHeight: 40,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8
  },
  checkoutCloseText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  checkoutTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  checkoutWebview: {
    flex: 1,
    backgroundColor: colors.card
  },
  hero: {
    minHeight: 480,
    overflow: "hidden",
    borderRadius: 0,
    justifyContent: "flex-end",
    marginHorizontal: -16,
    marginTop: -16
  },
  heroImage: {
    resizeMode: "cover"
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 17, 31, 0.68)"
  },
  heroContent: {
    gap: 14,
    padding: 22,
    paddingBottom: 28
  },
  logo: {
    width: 154,
    height: 64
  },
  headerLogo: {
    width: 132,
    height: 52,
    marginBottom: 6
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
    fontSize: 37,
    lineHeight: 42,
    fontWeight: "900",
    letterSpacing: 0
  },
  heroSubtitle: {
    color: "#dbeafe",
    fontSize: 16,
    lineHeight: 24
  },
  heroActions: {
    gap: 10,
    marginTop: 4
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
    borderColor: "rgba(255, 255, 255, 0.72)",
    backgroundColor: "rgba(255, 255, 255, 0.1)"
  },
  actionButtonOutlineDark: {
    borderColor: colors.line,
    backgroundColor: colors.card
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "900"
  },
  actionButtonTextOutline: {
    color: colors.white
  },
  actionButtonTextOutlineDark: {
    color: colors.skyDark
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2
  },
  statBox: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
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
    textTransform: "uppercase",
    marginTop: 2
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4
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
    width: 258,
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.card
  },
  featuredImage: {
    height: 150,
    width: "100%",
    backgroundColor: colors.line
  },
  featuredBody: {
    gap: 7,
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
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2
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
  noticePanel: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 8,
    backgroundColor: colors.skySoft,
    padding: 15,
    borderWidth: 1,
    borderColor: "#bae6fd"
  },
  noticeTextBlock: {
    flex: 1,
    gap: 4
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
    fontWeight: "600"
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
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    minWidth: 0
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 8,
    backgroundColor: colors.skySoft,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  resultSummaryText: {
    color: colors.skyDark,
    fontSize: 13,
    fontWeight: "900"
  },
  cardStack: {
    gap: 14
  },
  tourCard: {
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    ...shadows.card
  },
  tourImage: {
    height: 205,
    width: "100%",
    backgroundColor: colors.line
  },
  tourBody: {
    gap: 11,
    padding: 15
  },
  tourTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  categoryBadge: {
    borderRadius: 999,
    backgroundColor: colors.skySoft,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  categoryBadgeText: {
    color: colors.skyDark,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  favoriteButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.surface
  },
  tourTitle: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "900"
  },
  tourDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  tourMetaGrid: {
    gap: 8
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  metaLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700"
  },
  highlightsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7
  },
  highlightPill: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: colors.surface,
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  tourFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  fromText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  tourPrice: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900"
  },
  formPanel: {
    gap: 14,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    ...shadows.card
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  routeList: {
    gap: 9
  },
  routeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    backgroundColor: colors.surface
  },
  routeOptionActive: {
    borderColor: colors.sky,
    backgroundColor: colors.skyDark
  },
  routeIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)"
  },
  routeText: {
    flex: 1,
    gap: 3
  },
  routeTitle: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900"
  },
  routeTitleActive: {
    color: colors.white
  },
  routeMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  routeMetaActive: {
    color: "#dbeafe"
  },
  vehicleGrid: {
    flexDirection: "row",
    gap: 9
  },
  vehicleCard: {
    flex: 1,
    gap: 6,
    minHeight: 110,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 10
  },
  vehicleCardActive: {
    borderColor: colors.sky,
    backgroundColor: colors.skyDark
  },
  vehicleName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  vehicleNameActive: {
    color: colors.white
  },
  vehicleCapacity: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700"
  },
  vehicleCapacityActive: {
    color: "#dbeafe"
  },
  segmentRow: {
    flexDirection: "row",
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: 4
  },
  segmentButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    minHeight: 40
  },
  segmentButtonActive: {
    backgroundColor: colors.text
  },
  segmentText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "900"
  },
  segmentTextActive: {
    color: colors.white
  },
  passengerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  helperText: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden"
  },
  stepperButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface
  },
  stepperValue: {
    width: 44,
    textAlign: "center",
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  quotePanel: {
    gap: 16,
    borderRadius: 8,
    backgroundColor: colors.ink,
    padding: 18,
    ...shadows.card
  },
  quoteLabel: {
    color: "#93c5fd",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  quotePrice: {
    color: colors.white,
    fontSize: 42,
    fontWeight: "900",
    marginTop: 3
  },
  quoteMeta: {
    color: colors.mutedOnDark,
    fontSize: 14,
    marginTop: 2
  },
  quoteActions: {
    gap: 10
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 22,
    ...shadows.card
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    textAlign: "center",
    fontWeight: "900"
  },
  emptyText: {
    color: colors.muted,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20
  },
  emptyActions: {
    alignSelf: "stretch",
    gap: 10,
    marginTop: 4
  },
  savedCard: {
    gap: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    ...shadows.card
  },
  savedLabel: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  savedTitle: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900"
  },
  savedMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  savedPrice: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 6
  },
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10
  },
  compactImage: {
    width: 74,
    height: 74,
    borderRadius: 8,
    backgroundColor: colors.line
  },
  compactText: {
    flex: 1,
    gap: 4
  },
  compactTitle: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900"
  },
  compactMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    borderRadius: 8,
    backgroundColor: colors.ink,
    padding: 16
  },
  avatar: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.sky
  },
  profileText: {
    flex: 1,
    gap: 4
  },
  profileName: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "900"
  },
  profileMeta: {
    color: colors.mutedOnDark,
    fontSize: 13,
    lineHeight: 18
  },
  linkStack: {
    gap: 10
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 13
  },
  linkIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.skySoft
  },
  linkText: {
    flex: 1,
    gap: 3
  },
  linkTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  linkSubtitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  socialPanel: {
    gap: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 15
  },
  socialButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  socialButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 13,
    paddingVertical: 9,
    backgroundColor: colors.surface
  },
  socialText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    paddingBottom: 8,
    paddingTop: 8
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900"
  },
  tabLabelActive: {
    color: colors.skyDark
  }
});
