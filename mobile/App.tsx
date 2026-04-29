import { StatusBar } from "expo-status-bar";
import type { ComponentType, ReactNode } from "react";
import { Component, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useFonts } from "expo-font";
import * as SecureStore from "expo-secure-store";
import {
  BackHandler,
  Alert,
  AppState,
  Dimensions,
  Image,
  ImageBackground,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  View,
  type ImageStyle,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextProps
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
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Pencil,
  Plane,
  Plus,
  Search,
  ShieldCheck,
  Star,
  User,
  X
} from "lucide-react-native";

import {
  featuredTours,
  tourCategories,
  transferRoutes,
  trustStats,
  type Tour
} from "./src/catalog";
import {
  buildCheckoutUrl,
  buildTourCheckoutUrl,
  confirmMobileBooking,
  createMobileCustomerSetupIntent,
  createMobilePaymentIntent,
  deleteMobileAccount,
  fetchMobileConfig,
  fetchMobileCustomerSummary,
  fetchMobileTours,
  fetchMobileTransferLocations,
  fetchMobileTransferRoutes,
  fetchMobileUser,
  fetchTransferLocations,
  fetchTransferQuote,
  getApiBaseUrl,
  loginMobileUser,
  markMobileNotificationsRead,
  registerMobileUser,
  saveMobileCustomerPayment,
  saveMobileCustomerPreferences,
  submitMobileCustomerReview,
  updateMobileCustomerProfile,
  type LocationSummary,
  type MobileCustomerSummary,
  type MobileSession,
  type MobileTour,
  type MobileTourOffer,
  type MobileTourItineraryStop,
  type MobileTourOption,
  type MobileTransferRoute,
  type QuoteVehicle
} from "./src/api";
import { staticMobileTours } from "./src/staticTours";
import {
  staticMobileTransferLocations,
  staticMobileTransferPriceRoutes,
  staticMobileTransferRoutes
} from "./src/staticTransfers";
import { AppStripeProvider, StripeDeepLinkHandler, useAppStripe } from "./src/stripe";
import { colors, links, shadows } from "./src/theme";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from "@expo-google-fonts/inter";
import {
  Geist_400Regular,
  Geist_600SemiBold,
  Geist_700Bold,
  Geist_800ExtraBold,
  Geist_900Black
} from "@expo-google-fonts/geist";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type TabKey = "home" | "tours" | "transfers" | "zones" | "profile";
type TripType = "one-way" | "round-trip";
type IconType = ComponentType<{ size?: number; color?: string; strokeWidth?: number; fill?: string }>;
type AppLanguage = "es" | "en" | "fr";

const appFonts = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Geist_400Regular,
  Geist_600SemiBold,
  Geist_700Bold,
  Geist_800ExtraBold,
  Geist_900Black
};

const fontFamily = {
  body: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  heading: "Geist_700Bold",
  headingStrong: "Geist_800ExtraBold",
  headingBlack: "Geist_900Black"
} as const;

const resolveFontFamily = (style: TextProps["style"]) => {
  const flattened = StyleSheet.flatten(style) as
    | { fontFamily?: string; fontWeight?: string | number; fontSize?: number }
    | undefined;

  if (flattened?.fontFamily) return flattened.fontFamily;

  const fontSize = typeof flattened?.fontSize === "number" ? flattened.fontSize : 14;
  const rawWeight = flattened?.fontWeight ?? "400";
  const weight =
    typeof rawWeight === "number"
      ? rawWeight
      : rawWeight === "bold"
        ? 700
        : Number.parseInt(String(rawWeight), 10) || 400;

  if (fontSize >= 24 || weight >= 900) return fontFamily.headingBlack;
  if (fontSize >= 18 || weight >= 800) return fontFamily.headingStrong;
  if (weight >= 700) return fontFamily.bold;
  if (weight >= 600) return fontFamily.semibold;
  if (weight >= 500) return fontFamily.medium;
  return fontFamily.body;
};

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
};

type PrivacyConsent = {
  essential: true;
  personalization: boolean;
  analytics: boolean;
  marketing: boolean;
  acceptedAt: string;
  version: number;
};

const languageOptions: Array<{ code: AppLanguage; title: string; subtitle: string }> = [
  { code: "es", title: "Espanol", subtitle: "Usar la app en espanol" },
  { code: "en", title: "English", subtitle: "Use the app in English" },
  { code: "fr", title: "Frances", subtitle: "Usar la app en frances" }
];

const languageContext = createContext<LanguageContextValue>({
  language: "es",
  setLanguage: () => undefined
});

const englishText: Record<string, string> = {
  "Espanol": "Spanish",
  "Usar la app en espanol": "Use the app in Spanish",
  "Frances": "French",
  "Usar la app en frances": "Use the app in French",
  "Elige tu idioma": "Choose your language",
  "Puedes cambiarlo luego desde Perfil.": "You can change it later from Profile.",
  "Continuar": "Continue",
  "Idioma": "Language",
  "Cambiar idioma": "Change language",
  "Idioma de la app": "App language",
  "La app recordara tu preferencia para futuras visitas.": "The app will remember your choice for future visits.",
  "Inicio": "Home",
  "Tours": "Tours",
  "Transfer": "Transfer",
  "Zonas": "Areas",
  "Perfil": "Profile",
  "Traslados privados": "Private transfers",
  "Reserva tu traslado privado": "Book your private transfer",
  "Precio fijo, conductor confirmado y recogida en tu hotel o aeropuerto.":
    "Fixed price, confirmed driver, and pickup at your hotel or airport.",
  "Elige origen y destino": "Choose pickup and drop-off",
  "Elige tu punto exacto de recogida.": "Choose your exact pickup point.",
  "Busca tu hotel, aeropuerto o zona.": "Search your hotel, airport, or area.",
  "Solo ida": "One way",
  "Ida y vuelta": "Round trip",
  "Origen": "Pickup",
  "Destino": "Drop-off",
  "Aeropuerto, hotel o zona": "Airport, hotel, or area",
  "Hotel, villa o zona": "Hotel, villa, or area",
  "Seleccionado. Puedes tocar el campo para editar.": "Selected. Tap the field to edit.",
  "Escribiendo. Elige una sugerencia para confirmar.": "Typing. Choose a suggestion to confirm.",
  "No encontramos ese lugar exacto. Prueba con hotel, aeropuerto o zona cercana.":
    "We could not find that exact place. Try a hotel, airport, or nearby area.",
  "Rutas populares": "Popular routes",
  "Fecha salida": "Departure date",
  "Hora": "Time",
  "Fecha regreso": "Return date",
  "Hora regreso": "Return time",
  "Pasajeros": "Passengers",
  "Ver precio ahora": "See price now",
  "Buscando...": "Searching...",
  "Vehiculos disponibles": "Available vehicles",
  "Vehículos disponibles": "Available vehicles",
  "Reservar": "Book",
  "Reservar ahora": "Book now",
  "Guardar ruta": "Save route",
  "Busca y selecciona origen y destino desde la lista real.": "Search and select pickup and drop-off from the real list.",
  "Origen y destino deben ser diferentes.": "Pickup and drop-off must be different.",
  "Selecciona el hotel o aeropuerto exacto antes de cotizar.": "Select the exact hotel or airport before quoting.",
  "Indica fecha y hora de regreso.": "Add return date and time.",
  "No hay vehiculos disponibles para ese grupo.": "No vehicles are available for that group.",
  "No hay vehículos disponibles para ese grupo.": "No vehicles are available for that group.",
  "No se pudo calcular la tarifa real.": "The live fare could not be calculated.",
  "Precio fijo sin sorpresas": "Fixed price, no surprises",
  "Conductor te espera con tu nombre": "Your driver waits with your name",
  "Soporte por WhatsApp": "WhatsApp support",
  "Pago seguro con Stripe": "Secure payment with Stripe",
  "Confirmacion por WhatsApp": "WhatsApp confirmation",
  "Soporte antes y después de reservar": "Support before and after booking",
  "Reserva": "Booking",
  "Reserva segura": "Secure booking",
  "Confirma tu experiencia en minutos": "Confirm your experience in minutes",
  "Revisa tu reserva, deja tus datos y paga seguro con Proactivitis.":
    "Review your product, enter your details, and continue to secure Proactivitis payment.",
  "Datos": "Details",
  "Recogida": "Pickup",
  "Pago": "Payment",
  "Transfer privado": "Private transfer",
  "Tour": "Tour",
  "Fecha": "Date",
  "Personas": "People",
  "Total": "Total",
  "Elige fecha": "Choose date",
  "Elige hora": "Choose time",
  "Manana": "Tomorrow",
  "Tu selección": "Your selection",
  "Selecciona una fecha": "Select a date",
  "Selecciona una hora": "Select a time",
  "El precio se actualiza antes de continuar.": "The price updates before continuing.",
  "Selecciona fecha, hora y viajeros.": "Select date, time, and travelers.",
  "Seleccionar fecha": "Select date",
  "Seleccionar hora": "Select time",
  "Toca la fecha para abrir el calendario y elegir cualquier día futuro.":
    "Tap the date to open the calendar and choose any future day.",
  "Elige el horario que prefieres para esta experiencia.": "Choose the time you prefer for this experience.",
  "por adulto, con datos sincronizados desde la web.": "per adult, synced from the website.",
  "Adulto": "Adult",
  "Adolescente": "Youth",
  "Adolescentes": "Youth",
  "Nino": "Child",
  "Niño": "Child",
  "Niños": "Children",
  "aplicado. Ahorras": "applied. You save",
  "Fecha de la experiencia": "Experience date",
  "Puedes reservar para una fecha más futura.": "You can book for a later future date.",
  "Mes anterior": "Previous month",
  "Mes siguiente": "Next month",
  "Datos de contacto": "Contact details",
  "Nombre": "First name",
  "Apellido": "Last name",
  "Email": "Email",
  "Teléfono": "Phone",
  "Recogida y preferencias": "Pickup and preferences",
  "Punto principal": "Main pickup point",
  "Hotel o punto de recogida": "Hotel or pickup point",
  "Busca tu hotel o escribe un punto de recogida": "Search your hotel or type a pickup point",
  "Ej: hotel, villa o punto de encuentro": "Ex: hotel, villa, or meeting point",
  "Selecciona un hotel de la lista o deja escrito tu punto de recogida.":
    "Select a hotel from the list or leave your pickup point typed.",
  "Hotel seleccionado de la lista real.": "Hotel selected from the real list.",
  "No lo vemos en la lista de hoteles de esta zona. Usaremos lo que escribiste como punto de recogida.":
    "We do not see it in this area's hotel list. We will use what you typed as the pickup point.",
  "No pudimos buscar hoteles ahora. Usaremos lo que escribiste como punto de recogida.":
    "We could not search hotels right now. We will use what you typed as the pickup point.",
  "Notas especiales": "Special notes",
  "Pago protegido por Stripe y confirmación por Proactivitis.":
    "Payment protected by Stripe and confirmed by Proactivitis.",
  "Total a pagar": "Total to pay",
  "Pagar seguro con Stripe": "Pay securely with Stripe",
  "Procesando...": "Processing...",
  "Eliminando...": "Deleting...",
  "Procesando eliminación...": "Processing deletion...",
  "Pagar en navegador": "Pay in browser",
  "Confirmar por WhatsApp": "Confirm by WhatsApp",
  "Volver": "Back",
  "Indica el nombre.": "Enter your first name.",
  "Indica el apellido.": "Enter your last name.",
  "Indica un email válido.": "Enter a valid email.",
  "Indica hotel o punto de recogida.": "Enter hotel or pickup point.",
  "Stripe nativo no está disponible en la vista web. Usa checkout web o prueba en Android/iOS.":
    "Native Stripe is not available in web view. Use web checkout or test on Android/iOS.",
  "Stripe aún no está configurado en esta build. Revisa NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.":
    "Stripe is not configured in this build yet. Check NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.",
  "Preparando pago seguro...": "Preparing secure payment...",
  "Stripe no devolvió client secret para abrir el pago.": "Stripe did not return a client secret to open payment.",
  "Abriendo pago seguro...": "Opening secure payment...",
  "El pago fue cancelado o no se completo.": "The payment was canceled or not completed.",
  "Pago confirmado. Tu reserva quedó registrada en Proactivitis.": "Payment confirmed. Your booking is registered with Proactivitis.",
  "No se pudo completar el pago.": "The payment could not be completed.",
  "Abriendo checkout web de Proactivitis...": "Opening Proactivitis web checkout...",
  "Cuenta": "Account",
  "Contacto y soporte": "Contact and support",
  "Habla con Proactivitis antes o después de reservar.": "Talk to Proactivitis before or after booking.",
  "Respuesta rápida para reservas": "Fast help for bookings",
  "Llamar ahora": "Call now",
  "Atencion directa": "Direct support",
  "Soporte por correo": "Email support",
  "Fotos y novedades": "Photos and updates",
  "Videos y recomendaciones": "Videos and recommendations",
  "Formulario web": "Web form",
  "Enviar mensaje desde la web": "Send a message from the website",
  "Perfil Proactivitis": "Proactivitis Profile",
  "Tus reservas quedan asociadas a este correo.": "Your bookings are linked to this email.",
  "Cliente Proactivitis": "Proactivitis Customer",
  "Cerrar sesión": "Sign out",
  "Eliminar cuenta": "Delete account",
  "Página web de eliminación": "Deletion web page",
  "Se cerrará tu cuenta de cliente, sesiones, preferencias y métodos de pago guardados. Podemos retener registros de reservas y pagos cuando sea necesario.":
    "Your customer account, sessions, preferences, and saved payment methods will be closed. We may retain booking and payment records when required.",
  "Cancelar": "Cancel",
  "Eliminar": "Delete",
  "WhatsApp": "WhatsApp",
  "Soporte directo": "Direct support",
  "Web": "Website",
  "Entra a Proactivitis": "Sign in to Proactivitis",
  "Conecta tus datos con la base real de la web.": "Connect your details with the live website database.",
  "Accede a tus reservas": "Access your bookings",
  "Inicia sesión para guardar tus datos, revisar planes y continuar reservas desde cualquier dispositivo.":
    "Sign in to save your details, review plans, and continue bookings from any device.",
  "Tu perfil de viaje": "Your travel profile",
  "Tus reservas, favoritos y preferencias quedan guardados en tu cuenta.":
    "Your bookings, favorites, and preferences stay saved in your account.",
  "Centro de cliente": "Customer center",
  "Cargando tus reservas, pagos y notificaciones...": "Loading your bookings, payments, and notifications...",
  "No pudimos cargar tu cuenta ahora mismo.": "We could not load your account right now.",
  "Abrir portal web": "Open web portal",
  "Reservas, pagos, resenas y avisos de tu cuenta.": "Bookings, payments, reviews, and account alerts.",
  "Reservas, pagos, reseñas y avisos de tu cuenta.": "Bookings, payments, reviews, and account alerts.",
  "Proximas": "Upcoming",
  "Completadas": "Completed",
  "Resenas": "Reviews",
  "Pagado": "Paid",
  "Proxima actividad": "Next activity",
  "Completada": "Completed",
  "Cancelada": "Canceled",
  "Pendiente": "Pending",
  "Confirmada": "Confirmed",
  "Sin reservas todavia": "No bookings yet",
  "Cuando reserves, tu historial aparecera aqui.": "When you book, your history will appear here.",
  "Cuando reserves, tu historial aparecerá aquí.": "When you book, your history will appear here.",
  "Mis reservas": "My bookings",
  "reservas en tu historial": "bookings in your history",
  "Aun no tienes reservas registradas": "You do not have registered bookings yet",
  "Aún no tienes reservas registradas": "You do not have registered bookings yet",
  "Tarjetas guardadas": "Saved cards",
  "Tarjeta": "Card",
  "Agrega una tarjeta para reservar mas rapido": "Add a card to book faster",
  "Resenas pendientes": "Pending reviews",
  "Comparte tu experiencia en": "Share your experience in",
  "Cuando completes un tour o traslado podras dejar tu opinion":
    "When you complete a tour or transfer, you can leave your review",
  "Datos y preferencias": "Details and preferences",
  "Completa tus gustos de viaje": "Complete your travel preferences",
  "Preferencias guardadas": "Saved preferences",
  "Ultimo aviso": "Latest alert",
  "Entrar": "Sign in",
  "Crear cuenta": "Create account",
  "Password": "Password",
  "Contrasena": "Password",
  "O usa email": "Or use email",
  "Conectando...": "Connecting...",
  "No se pudo entrar.": "Could not sign in.",
  "Viajes guardados": "Saved trips",
  "Todavia no hay planes guardados": "No saved plans yet",
  "Cotiza un transfer o marca tours como favoritos.": "Quote a transfer or mark tours as favorites.",
  "Cotizar transfer": "Quote transfer",
  "Ver tours": "View tours",
  "Transfer guardado": "Saved transfer",
  "Continuar pago": "Continue payment",
  "Tours favoritos": "Favorite tours",
  "Ciudades": "Cities",
  "Elige donde quieres vivir la experiencia": "Choose where you want the experience",
  "Entra por ciudad y mira solo los tours disponibles en esa zona.": "Enter by city and see only tours available in that area.",
  "Todos los destinos": "All destinations",
  "Ver todo el catálogo": "View full catalog",
  "Ciudad": "City",
  "Cambiar ciudad": "Change city",
  "Ciudad seleccionada": "Selected city",
  "Tours filtrados por ciudad. Puedes reservar el tour o cotizar transfer para llegar cómodo.":
    "Tours filtered by city. You can book the tour or quote a transfer to arrive comfortably.",
  "Todas": "All",
  "Todas las ciudades": "All cities",
  "No hay tours en esta zona": "No tours in this area",
  "Prueba otra zona o revisa el catálogo completo.": "Try another area or view the full catalog.",
  "Experiencias reales de la web, fotos del producto, detalles claros y checkout dentro de la app.":
    "Live website experiences, product photos, clear details, and checkout inside the app.",
  "Catálogo Proactivitis": "Proactivitis catalog",
  "🌴 Catálogo Proactivitis": "Proactivitis catalog",
  "Tours listos para reservar": "Tours ready to book",
  "📸 Galería": "Gallery",
  "Reserva rápida": "Fast booking",
  "💬 Soporte humano": "Human support",
  "Buscar Saona, buggy, parasailing...": "Search Saona, buggy, parasailing...",
  "Actualizando productos...": "Updating products...",
  "Todos los planes": "All plans",
  "Conectado": "Connected",
  "Cerrar": "Close",
  "fotos": "photos",
  "Politica de privacidad": "Privacy Policy",
  "Como protegemos datos, cuenta y reservas.": "How we protect data, accounts, and bookings.",
  "Terminos y condiciones": "Terms and Conditions",
  "Reglas de uso, reservas, pagos y responsabilidades.": "Rules for use, bookings, payments, and responsibilities.",
  "Cookies": "Cookies",
  "Uso de cookies y tecnologias similares.": "Use of cookies and similar technologies.",
  "Informacion legal": "Legal information",
  "Empresa, contacto y datos de operacion.": "Company, contact, and operating details.",
  "Ver políticas": "View policies",
  "Error de pantalla": "Screen error",
  "La app encontro un problema en esta vista. Vuelve y prueba otra vez.": "The app found a problem in this view. Go back and try again.",
  "Volver al inicio": "Back to home",
  "Todos": "All",
  "Agua": "Water",
  "Aventura": "Adventure",
  "Cultura": "Culture",
  "Ver tours 🔥": "View tours 🔥",
  "Buscar transfer 🚘": "Find transfer 🚘",
  "🌴 Tours, transfers y planes privados": "Tours, transfers, and private plans",
  "Tu viaje en RD, claro y sin estrés": "Your DR trip, clear and stress-free",
  "Elige tours con fotos reales, cotiza tu traslado y reserva con ayuda local 24/7. Aquí vienes a disfrutar, nosotros organizamos lo difícil.":
    "Choose tours with real photos, quote your transfer, and book with 24/7 local help. You come to enjoy; we organize the hard part.",
  "✨ Recomendado para familias, parejas y grupos que quieren reservar sin vueltas.":
    "Recommended for families, couples, and groups who want a simple booking experience.",
  "📸 Fotos reales": "Real photos",
  "💵 Precio claro": "Clear price",
  "Transfers": "Transfers",
  "Soporte": "Support",
  "Tours que se sienten reales": "Tours that feel real",
  "Fotos, opciones y precios conectados a la web. Ves antes de reservar.":
    "Photos, options, and prices connected to the website. See before you book.",
  "Transfer sin adivinar": "Transfers without guessing",
  "Busca hoteles y aeropuertos reales, elige la ruta y confirma sin enredos.":
    "Search real hotels and airports, choose your route, and confirm without confusion.",
  "Ver experiencias": "View experiences",
  "Reserva con respaldo local": "Book with local support",
  "Completa tus datos en la app y finaliza con el checkout seguro de Proactivitis. Si necesitas ayuda, te hablamos como personas.":
    "Enter your details in the app and finish with Proactivitis secure checkout. If you need help, real people will assist you.",
  "Aeropuerto Santo Domingo": "Santo Domingo Airport",
  "Aeropuerto La Romana": "La Romana Airport",
  "Bavaro y Cap Cana": "Bavaro and Cap Cana",
  "Santo Domingo y Bayahibe": "Santo Domingo and Bayahibe",
  "La Romana y Bayahibe": "La Romana and Bayahibe",
  "La pantalla no cargo bien": "This screen did not load correctly",
  "La app sigue abierta. Vuelve al inicio o confirma la reserva por WhatsApp.":
    "The app is still open. Go back home or confirm your booking by WhatsApp.",
  "🔥 Recomendados": "🔥 Recommended",
  "Ver todos": "View all",
  "🧭 Categorias": "🧭 Categories",
  "Explorar": "Explore",
  "🚐 Rutas populares": "🚐 Popular routes",
  "Cotizar": "Quote",
  "Duracion": "Duration",
  "Zona": "Area",
  "Confirmacion segura": "Secure confirmation",
  "Punto de encuentro": "Meeting point",
  "Instrucciones": "Instructions",
  "Idiomas": "Languages",
  "Horarios": "Times",
  "Días": "Days",
  "Capacidad": "Capacity",
  "Edad mínima": "Minimum age",
  "Nivel físico": "Physical level",
  "Accesibilidad": "Accessibility",
  "Requisitos": "Requirements",
  "Cancelación": "Cancellation",
  "Incluye": "Included",
  "No incluido": "Not included",
  "Adultos": "Adults",
  "Ver tour": "View tour",
  "Experiencia Proactivitis": "Proactivitis experience",
  "Recogida disponible segun zona": "Pickup available depending on area",
  "Experiencia confirmada por Proactivitis.": "Experience confirmed by Proactivitis.",
  "Fecha pendiente": "Date pending",
  "Hora pendiente": "Time pending",
  "Cookies y tecnologias": "Cookies and technologies",
  "Uso de cookies en la web y servicios conectados.": "Cookie use on the website and connected services.",
  "Datos legales, contacto y notificaciones formales.": "Legal details, contact, and formal notices.",
  "Cancelaciones y reembolsos": "Cancellations and refunds",
  "Aplican los términos y la política indicada en cada producto.": "Terms and the policy shown on each product apply.",
  "Desde": "From",
  "Opciones": "Options",
  "Ajusta la cantidad": "Adjust quantity",
  "Legal y políticas": "Legal and policies",
  "Politicas y legal": "Policies and legal",
  "Accesos visibles para privacidad, términos, cookies, información legal y cancelaciones.":
    "Visible access to privacy, terms, cookies, legal information, and cancellations.",
  "Cancelación gratuita": "Free cancellation",
  "Cancelación flexible": "Flexible cancellation",
  "No reembolsable": "Non-refundable",
  "Confirmacion inmediata": "Instant confirmation",
  "Confirmacion manual": "Manual confirmation",
  "Continuar con Google": "Continue with Google",
  "Abriendo Google...": "Opening Google...",
  "Vuelve a la app cuando Google termine.": "Return to the app when Google finishes.",
  "No se pudo abrir Google.": "Could not open Google.",
  "Experiencias y traslados en Republica Dominicana": "Experiences and transfers in the Dominican Republic",
  "Descubre Republica Dominicana con reservas claras": "Discover the Dominican Republic with clear bookings",
  "Republica Dominicana, bien organizada": "Dominican Republic, well organized",
  "Tours y traslados en Republica Dominicana": "Tours and transfers in the Dominican Republic",
  "Reserva traslados y tours confiables en República Dominicana": "Book trusted transfers and tours in the Dominican Republic",
  "Precio claro, soporte humano y coordinación local desde que reservas.":
    "Clear pricing, human support, and local coordination from the moment you book.",
  "Reserva tours, traslados privados y planes seleccionados con precios transparentes, fotos reales y asistencia local en varios idiomas.":
    "Book tours, private transfers, and selected plans with transparent prices, real photos, and local assistance in multiple languages.",
  "Tours, traslados privados y planes seleccionados con precios claros y asistencia local.":
    "Tours, private transfers, and selected plans with clear prices and local assistance.",
  "Reserva experiencias seleccionadas y traslados privados con precios claros.":
    "Book selected experiences and private transfers with clear prices.",
  "Atencion para familias, parejas, grupos y viajeros que prefieren organizar todo antes de llegar.":
    "Support for families, couples, groups, and travelers who prefer to organize everything before arrival.",
  "Fotos verificadas": "Verified photos",
  "Precio transparente": "Transparent price",
  "Asistencia 24/7": "24/7 assistance",
  "Reservar traslado": "Book transfer",
  "Explorar tours": "Explore tours",
  "Cotizar traslado": "Quote transfer",
  "Experiencias seleccionadas": "Selected experiences",
  "Actividades con detalles, fotos y precios conectados al catálogo web.":
    "Activities with details, photos, and prices connected to the web catalog.",
  "Busca aeropuertos, hoteles y zonas reales para calcular tu ruta antes de reservar.":
    "Search real airports, hotels, and areas to calculate your route before booking.",
  "Busca tu hotel, aeropuerto o zona y ve el precio antes de reservar.":
    "Search your hotel, airport, or area and see the price before booking.",
  "Ver disponibilidad": "Check availability",
  "Por qué elegir esta experiencia": "Why choose this experience",
  "Recogida en hotel incluida": "Hotel pickup included",
  "Fotos reales verificadas": "Verified real photos",
  "Confirmación rápida": "Fast confirmation",
  "Confirmación segura": "Secure confirmation",
  "Soporte humano": "Human support",
  "Pago seguro": "Secure payment",
  "Galería": "Gallery",
  "Fotos reales de la experiencia": "Real experience photos",
  "Duración": "Duration",
  "Descripción": "Description",
  "Más reservado": "Most booked",
  "Mejor precio": "Best price",
  "Recogida incluida": "Pickup included",
  "Premium": "Premium",
  "Ideal familias": "Great for families",
  "Reserva con asistencia local": "Book with local assistance",
  "Completa tus datos en la app y finaliza con checkout seguro. Si necesitas ayuda, nuestro equipo te acompaña antes y durante tu experiencia.":
    "Enter your details in the app and finish with secure checkout. If you need help, our team supports you before and during your experience.",
  "Completa tus datos en la app y finaliza con checkout seguro. Si necesitas ayuda, nuestro equipo te acompana antes y durante tu experiencia.":
    "Enter your details in the app and finish with secure checkout. If you need help, our team supports you before and during your experience."
};

const frenchText: Record<string, string> = {
  "Espanol": "Espagnol",
  "Usar la app en espanol": "Utiliser l'app en espagnol",
  "English": "Anglais",
  "Use the app in English": "Utiliser l'app en anglais",
  "Frances": "Francais",
  "Usar la app en frances": "Utiliser l'app en francais",
  "Elige tu idioma": "Choisissez votre langue",
  "Puedes cambiarlo luego desde Perfil.": "Vous pourrez le changer ensuite depuis Profil.",
  "Continuar": "Continuer",
  "Idioma": "Langue",
  "Cambiar idioma": "Changer de langue",
  "Idioma de la app": "Langue de l'app",
  "La app recordara tu preferencia para futuras visitas.": "L'app gardera votre preference pour les prochaines visites.",
  "Inicio": "Accueil",
  "Tours": "Tours",
  "Transfer": "Transfert",
  "Zonas": "Zones",
  "Perfil": "Profil",
  "Traslados privados": "Transferts prives",
  "Reserva tu traslado privado": "Reservez votre transfert prive",
  "Precio fijo, conductor confirmado y recogida en tu hotel o aeropuerto.":
    "Prix fixe, chauffeur confirme et prise en charge a votre hotel ou aeroport.",
  "Elige origen y destino": "Choisissez depart et arrivee",
  "Elige tu punto exacto de recogida.": "Choisissez votre point de prise en charge exact.",
  "Busca tu hotel, aeropuerto o zona.": "Cherchez votre hotel, aeroport ou zone.",
  "Solo ida": "Aller simple",
  "Ida y vuelta": "Aller-retour",
  "Origen": "Depart",
  "Destino": "Arrivee",
  "Aeropuerto, hotel o zona": "Aeroport, hotel ou zone",
  "Hotel, villa o zona": "Hotel, villa ou zone",
  "Seleccionado. Puedes tocar el campo para editar.": "Selectionne. Touchez le champ pour modifier.",
  "Escribiendo. Elige una sugerencia para confirmar.": "Saisie en cours. Choisissez une suggestion pour confirmer.",
  "No encontramos ese lugar exacto. Prueba con hotel, aeropuerto o zona cercana.":
    "Nous ne trouvons pas ce lieu exact. Essayez un hotel, aeroport ou zone proche.",
  "Rutas populares": "Trajets populaires",
  "Fecha salida": "Date de depart",
  "Hora": "Heure",
  "Fecha regreso": "Date de retour",
  "Hora regreso": "Heure de retour",
  "Pasajeros": "Passagers",
  "Ver precio ahora": "Voir le prix maintenant",
  "Buscando...": "Recherche...",
  "Vehiculos disponibles": "Vehicules disponibles",
  "Vehículos disponibles": "Vehicules disponibles",
  "Reservar": "Reserver",
  "Reservar ahora": "Reserver maintenant",
  "Guardar ruta": "Sauvegarder le trajet",
  "Busca y selecciona origen y destino desde la lista real.": "Cherchez et choisissez depart et arrivee dans la liste reelle.",
  "Origen y destino deben ser diferentes.": "Le depart et l'arrivee doivent etre differents.",
  "Selecciona el hotel o aeropuerto exacto antes de cotizar.": "Choisissez l'hotel ou l'aeroport exact avant le devis.",
  "Indica fecha y hora de regreso.": "Ajoutez la date et l'heure de retour.",
  "No hay vehiculos disponibles para ese grupo.": "Aucun vehicule disponible pour ce groupe.",
  "No hay vehículos disponibles para ese grupo.": "Aucun vehicule disponible pour ce groupe.",
  "No se pudo calcular la tarifa real.": "Impossible de calculer le tarif reel.",
  "Precio fijo sin sorpresas": "Prix fixe, sans surprise",
  "Conductor te espera con tu nombre": "Le chauffeur vous attend avec votre nom",
  "Soporte por WhatsApp": "Assistance WhatsApp",
  "Pago seguro con Stripe": "Paiement securise avec Stripe",
  "Confirmacion por WhatsApp": "Confirmation par WhatsApp",
  "Confirmación por WhatsApp": "Confirmation par WhatsApp",
  "Soporte antes y después de reservar": "Assistance avant et apres la reservation",
  "Reserva": "Reservation",
  "Reserva segura": "Reservation securisee",
  "Confirma tu experiencia en minutos": "Confirmez votre experience en quelques minutes",
  "Revisa tu reserva, deja tus datos y paga seguro con Proactivitis.":
    "Verifiez votre reservation, ajoutez vos donnees et payez en securite avec Proactivitis.",
  "Datos": "Infos",
  "Recogida": "Prise en charge",
  "Pago": "Paiement",
  "Transfer privado": "Transfert prive",
  "Tour": "Tour",
  "Fecha": "Date",
  "Personas": "Personnes",
  "Total": "Total",
  "Elige fecha": "Choisir la date",
  "Elige hora": "Choisir l'heure",
  "Manana": "Demain",
  "Tu selección": "Votre selection",
  "Selecciona una fecha": "Choisissez une date",
  "Selecciona una hora": "Choisissez une heure",
  "El precio se actualiza antes de continuar.": "Le prix se met a jour avant de continuer.",
  "Selecciona fecha, hora y viajeros.": "Choisissez la date, l'heure et les voyageurs.",
  "Seleccionar fecha": "Choisir une date",
  "Seleccionar hora": "Choisir une heure",
  "Toca la fecha para abrir el calendario y elegir cualquier día futuro.":
    "Touchez la date pour ouvrir le calendrier et choisir un jour futur.",
  "Elige el horario que prefieres para esta experiencia.": "Choisissez l'horaire que vous preferez pour cette experience.",
  "por adulto, con datos sincronizados desde la web.": "par adulte, synchronise depuis le site web.",
  "Adulto": "Adulte",
  "Adolescente": "Adolescent",
  "Adolescentes": "Adolescents",
  "Nino": "Enfant",
  "Niño": "Enfant",
  "Niños": "Enfants",
  "aplicado. Ahorras": "applique. Vous economisez",
  "Fecha de la experiencia": "Date de l'experience",
  "Puedes reservar para una fecha más futura.": "Vous pouvez reserver pour une date future plus lointaine.",
  "Mes anterior": "Mois precedent",
  "Mes siguiente": "Mois suivant",
  "Datos de contacto": "Coordonnees",
  "Nombre": "Prenom",
  "Apellido": "Nom",
  "Email": "Email",
  "Teléfono": "Telephone",
  "Recogida y preferencias": "Prise en charge et preferences",
  "Punto principal": "Point principal",
  "Hotel o punto de recogida": "Hotel ou point de prise en charge",
  "Busca tu hotel o escribe un punto de recogida": "Cherchez votre hotel ou ecrivez un point de prise en charge",
  "Ej: hotel, villa o punto de encuentro": "Ex: hotel, villa ou point de rencontre",
  "Selecciona un hotel de la lista o deja escrito tu punto de recogida.":
    "Selectionnez un hotel dans la liste ou laissez votre point de prise en charge ecrit.",
  "Hotel seleccionado de la lista real.": "Hotel selectionne dans la liste reelle.",
  "No lo vemos en la lista de hoteles de esta zona. Usaremos lo que escribiste como punto de recogida.":
    "Nous ne le voyons pas dans la liste d'hotels de cette zone. Nous utiliserons le point ecrit.",
  "No pudimos buscar hoteles ahora. Usaremos lo que escribiste como punto de recogida.":
    "Impossible de chercher les hotels maintenant. Nous utiliserons le point ecrit.",
  "Notas especiales": "Notes speciales",
  "Pago protegido por Stripe y confirmación por Proactivitis.":
    "Paiement protege par Stripe et confirmation par Proactivitis.",
  "Total a pagar": "Total a payer",
  "Pagar seguro con Stripe": "Payer en securite avec Stripe",
  "Procesando...": "Traitement...",
  "Eliminando...": "Suppression...",
  "Procesando eliminación...": "Suppression en cours...",
  "Pagar en navegador": "Payer dans le navigateur",
  "Confirmar por WhatsApp": "Confirmer par WhatsApp",
  "Volver": "Retour",
  "Indica el nombre.": "Ajoutez le prenom.",
  "Indica el apellido.": "Ajoutez le nom.",
  "Indica un email válido.": "Ajoutez un email valide.",
  "Indica hotel o punto de recogida.": "Ajoutez l'hotel ou le point de prise en charge.",
  "Stripe nativo no está disponible en la vista web. Usa checkout web o prueba en Android/iOS.":
    "Stripe natif n'est pas disponible dans la vue web. Utilisez le checkout web ou testez sur Android/iOS.",
  "Stripe aún no está configurado en esta build. Revisa NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.":
    "Stripe n'est pas encore configure dans cette build. Verifiez NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.",
  "Preparando pago seguro...": "Preparation du paiement securise...",
  "Stripe no devolvió client secret para abrir el pago.": "Stripe n'a pas renvoye le client secret pour ouvrir le paiement.",
  "Abriendo pago seguro...": "Ouverture du paiement securise...",
  "El pago fue cancelado o no se completo.": "Le paiement a ete annule ou n'a pas abouti.",
  "Pago confirmado. Tu reserva quedó registrada en Proactivitis.": "Paiement confirme. Votre reservation est enregistree chez Proactivitis.",
  "No se pudo completar el pago.": "Impossible de completer le paiement.",
  "Abriendo checkout web de Proactivitis...": "Ouverture du checkout web Proactivitis...",
  "Cuenta": "Compte",
  "Contacto y soporte": "Contact et assistance",
  "Habla con Proactivitis antes o después de reservar.": "Parlez avec Proactivitis avant ou apres la reservation.",
  "Respuesta rápida para reservas": "Aide rapide pour les reservations",
  "Llamar ahora": "Appeler maintenant",
  "Atencion directa": "Assistance directe",
  "Soporte por correo": "Assistance par email",
  "Fotos y novedades": "Photos et nouveautes",
  "Videos y recomendaciones": "Videos et recommandations",
  "Formulario web": "Formulaire web",
  "Enviar mensaje desde la web": "Envoyer un message depuis le site",
  "Perfil Proactivitis": "Profil Proactivitis",
  "Tus reservas quedan asociadas a este correo.": "Vos reservations seront liees a cet email.",
  "Cliente Proactivitis": "Client Proactivitis",
  "Cerrar sesión": "Se deconnecter",
  "Eliminar cuenta": "Supprimer le compte",
  "Página web de eliminación": "Page web de suppression",
  "Se cerrará tu cuenta de cliente, sesiones, preferencias y métodos de pago guardados. Podemos retener registros de reservas y pagos cuando sea necesario.":
    "Votre compte client, vos sessions, preferences et moyens de paiement enregistres seront fermes. Nous pouvons conserver les dossiers de reservations et paiements si necessaire.",
  "Cancelar": "Annuler",
  "Eliminar": "Supprimer",
  "WhatsApp": "WhatsApp",
  "Soporte directo": "Assistance directe",
  "Web": "Web",
  "Entra a Proactivitis": "Connectez-vous a Proactivitis",
  "Conecta tus datos con la base real de la web.": "Connectez vos donnees avec la base reelle du site web.",
  "Accede a tus reservas": "Accedez a vos reservations",
  "Inicia sesión para guardar tus datos, revisar planes y continuar reservas desde cualquier dispositivo.":
    "Connectez-vous pour sauvegarder vos donnees, revoir vos plans et continuer vos reservations depuis n'importe quel appareil.",
  "Tu perfil de viaje": "Votre profil de voyage",
  "Tus reservas, favoritos y preferencias quedan guardados en tu cuenta.":
    "Vos reservations, favoris et preferences restent sauvegardes dans votre compte.",
  "Centro de cliente": "Espace client",
  "Cargando tus reservas, pagos y notificaciones...": "Chargement de vos reservations, paiements et notifications...",
  "No pudimos cargar tu cuenta ahora mismo.": "Impossible de charger votre compte pour le moment.",
  "Abrir portal web": "Ouvrir le portail web",
  "Reservas, pagos, resenas y avisos de tu cuenta.": "Reservations, paiements, avis et alertes de votre compte.",
  "Reservas, pagos, reseñas y avisos de tu cuenta.": "Reservations, paiements, avis et alertes de votre compte.",
  "Proximas": "A venir",
  "Completadas": "Terminees",
  "Resenas": "Avis",
  "Pagado": "Paye",
  "Proxima actividad": "Prochaine activite",
  "Completada": "Terminee",
  "Cancelada": "Annulee",
  "Pendiente": "En attente",
  "Confirmada": "Confirmee",
  "Sin reservas todavia": "Aucune reservation pour le moment",
  "Cuando reserves, tu historial aparecera aqui.": "Quand vous reservez, votre historique apparaitra ici.",
  "Cuando reserves, tu historial aparecerá aquí.": "Quand vous reservez, votre historique apparaitra ici.",
  "Mis reservas": "Mes reservations",
  "reservas en tu historial": "reservations dans votre historique",
  "Aun no tienes reservas registradas": "Vous n'avez pas encore de reservations enregistrees",
  "Aún no tienes reservas registradas": "Vous n'avez pas encore de reservations enregistrees",
  "Tarjetas guardadas": "Cartes sauvegardees",
  "Tarjeta": "Carte",
  "Agrega una tarjeta para reservar mas rapido": "Ajoutez une carte pour reserver plus vite",
  "Resenas pendientes": "Avis en attente",
  "Comparte tu experiencia en": "Partagez votre experience sur",
  "Cuando completes un tour o traslado podras dejar tu opinion":
    "Quand vous terminez un tour ou transfert, vous pourrez laisser votre avis",
  "Datos y preferencias": "Donnees et preferences",
  "Completa tus gustos de viaje": "Completez vos preferences de voyage",
  "Preferencias guardadas": "Preferences sauvegardees",
  "Ultimo aviso": "Derniere alerte",
  "Entrar": "Connexion",
  "Crear cuenta": "Creer un compte",
  "Password": "Mot de passe",
  "Contrasena": "Mot de passe",
  "O usa email": "Ou utilisez l'email",
  "Conectando...": "Connexion...",
  "No se pudo entrar.": "Connexion impossible.",
  "Viajes guardados": "Voyages sauvegardes",
  "Todavia no hay planes guardados": "Aucun plan sauvegarde pour le moment",
  "Cotiza un transfer o marca tours como favoritos.": "Demandez un devis de transfert ou marquez des tours comme favoris.",
  "Cotizar transfer": "Devis transfert",
  "Ver tours": "Voir les tours",
  "Transfer guardado": "Transfert sauvegarde",
  "Continuar pago": "Continuer le paiement",
  "Tours favoritos": "Tours favoris",
  "Ciudades": "Villes",
  "Elige donde quieres vivir la experiencia": "Choisissez ou vivre l'experience",
  "Entra por ciudad y mira solo los tours disponibles en esa zona.": "Entrez par ville et voyez seulement les tours disponibles dans cette zone.",
  "Todos los destinos": "Toutes les destinations",
  "Ver todo el catálogo": "Voir tout le catalogue",
  "Ciudad": "Ville",
  "Cambiar ciudad": "Changer de ville",
  "Ciudad seleccionada": "Ville selectionnee",
  "Tours filtrados por ciudad. Puedes reservar el tour o cotizar transfer para llegar cómodo.":
    "Tours filtres par ville. Vous pouvez reserver le tour ou demander un transfert pour arriver facilement.",
  "Todas": "Toutes",
  "Todas las ciudades": "Toutes les villes",
  "No hay tours en esta zona": "Aucun tour dans cette zone",
  "Prueba otra zona o revisa el catálogo completo.": "Essayez une autre zone ou consultez tout le catalogue.",
  "Experiencias reales de la web, fotos del producto, detalles claros y checkout dentro de la app.":
    "Experiences reelles du site, photos du produit, details clairs et checkout dans l'app.",
  "Catálogo Proactivitis": "Catalogue Proactivitis",
  "Tours listos para reservar": "Tours prets a reserver",
  "Reserva rápida": "Reservation rapide",
  "Buscar Saona, buggy, parasailing...": "Chercher Saona, buggy, parasailing...",
  "Actualizando productos...": "Mise a jour des produits...",
  "Todos los planes": "Tous les plans",
  "Conectado": "Connecte",
  "Cerrar": "Fermer",
  "fotos": "photos",
  "Politica de privacidad": "Politique de confidentialite",
  "Como protegemos datos, cuenta y reservas.": "Comment nous protegeons les donnees, le compte et les reservations.",
  "Terminos y condiciones": "Conditions generales",
  "Reglas de uso, reservas, pagos y responsabilidades.": "Regles d'utilisation, reservations, paiements et responsabilites.",
  "Cookies": "Cookies",
  "Uso de cookies y tecnologias similares.": "Utilisation de cookies et technologies similaires.",
  "Informacion legal": "Information legale",
  "Empresa, contacto y datos de operacion.": "Entreprise, contact et donnees d'operation.",
  "Ver políticas": "Voir les politiques",
  "Error de pantalla": "Erreur d'ecran",
  "La app encontro un problema en esta vista. Vuelve y prueba otra vez.": "L'app a trouve un probleme dans cette vue. Revenez et essayez encore.",
  "Volver al inicio": "Retour a l'accueil",
  "Todos": "Tous",
  "Agua": "Eau",
  "Aventura": "Aventure",
  "Cultura": "Culture",
  "Ver tours 🔥": "Voir les tours 🔥",
  "Buscar transfer 🚘": "Chercher un transfert 🚘",
  "🌴 Tours, transfers y planes privados": "🌴 Tours, transferts et plans prives",
  "Tu viaje en RD, claro y sin estrés": "Votre voyage en RD, clair et sans stress",
  "Elige tours con fotos reales, cotiza tu traslado y reserva con ayuda local 24/7. Aquí vienes a disfrutar, nosotros organizamos lo difícil.":
    "Choisissez des tours avec de vraies photos, demandez votre transfert et reservez avec une aide locale 24/7. Vous profitez, nous organisons le reste.",
  "✨ Recomendado para familias, parejas y grupos que quieren reservar sin vueltas.":
    "✨ Recommande pour familles, couples et groupes qui veulent reserver simplement.",
  "📸 Fotos reales": "📸 Photos reelles",
  "💵 Precio claro": "💵 Prix clair",
  "💬 Soporte humano": "💬 Assistance humaine",
  "Transfers": "Transferts",
  "Soporte": "Assistance",
  "Idiomas": "Langues",
  "Tours que se sienten reales": "Des tours qui semblent reels",
  "Fotos, opciones y precios conectados a la web. Ves antes de reservar.":
    "Photos, options et prix connectes au site. Vous voyez avant de reserver.",
  "Transfer sin adivinar": "Transfert sans deviner",
  "Busca hoteles y aeropuertos reales, elige la ruta y confirma sin enredos.":
    "Cherchez de vrais hotels et aeroports, choisissez le trajet et confirmez sans confusion.",
  "Ver experiencias": "Voir les experiences",
  "Reserva con respaldo local": "Reservation avec soutien local",
  "Completa tus datos en la app y finaliza con el checkout seguro de Proactivitis. Si necesitas ayuda, te hablamos como personas.":
    "Completez vos donnees dans l'app et terminez avec le checkout securise Proactivitis. Si vous avez besoin d'aide, de vraies personnes vous repondent.",
  "Aeropuerto Santo Domingo": "Aeroport de Saint-Domingue",
  "Aeropuerto La Romana": "Aeroport de La Romana",
  "Bavaro y Cap Cana": "Bavaro et Cap Cana",
  "Santo Domingo y Bayahibe": "Saint-Domingue et Bayahibe",
  "La Romana y Bayahibe": "La Romana et Bayahibe",
  "La pantalla no cargo bien": "L'ecran ne s'est pas bien charge",
  "La app sigue abierta. Vuelve al inicio o confirma la reserva por WhatsApp.":
    "L'app reste ouverte. Revenez a l'accueil ou confirmez la reservation par WhatsApp.",
  "🔥 Recomendados": "🔥 Recommandes",
  "Ver todos": "Voir tout",
  "🧭 Categorias": "🧭 Categories",
  "Explorar": "Explorer",
  "🚐 Rutas populares": "🚐 Trajets populaires",
  "Cotizar": "Devis",
  "Duracion": "Duree",
  "Zona": "Zone",
  "Confirmacion segura": "Confirmation securisee",
  "Punto de encuentro": "Point de rencontre",
  "Instrucciones": "Instructions",
  "Horarios": "Horaires",
  "Días": "Jours",
  "Capacidad": "Capacite",
  "Edad mínima": "Age minimum",
  "Nivel físico": "Niveau physique",
  "Accesibilidad": "Accessibilite",
  "Requisitos": "Exigences",
  "Cancelación": "Annulation",
  "Incluye": "Inclus",
  "No incluido": "Non inclus",
  "Adultos": "Adultes",
  "Ver tour": "Voir le tour",
  "Experiencia Proactivitis": "Experience Proactivitis",
  "Recogida disponible segun zona": "Prise en charge disponible selon la zone",
  "Experiencia confirmada por Proactivitis.": "Experience confirmee par Proactivitis.",
  "Fecha pendiente": "Date en attente",
  "Hora pendiente": "Heure en attente",
  "Cookies y tecnologias": "Cookies et technologies",
  "Uso de cookies en la web y servicios conectados.": "Utilisation de cookies sur le site et les services connectes.",
  "Datos legales, contacto y notificaciones formales.": "Donnees legales, contact et notifications formelles.",
  "Cancelaciones y reembolsos": "Annulations et remboursements",
  "Aplican los términos y la política indicada en cada producto.": "Les conditions et la politique indiquees sur chaque produit s'appliquent.",
  "Desde": "A partir de",
  "Opciones": "Options",
  "Ajusta la cantidad": "Ajuster la quantite",
  "Legal y políticas": "Legal et politiques",
  "Politicas y legal": "Politiques et legal",
  "Accesos visibles para privacidad, términos, cookies, información legal y cancelaciones.":
    "Acces visible a la confidentialite, aux conditions, cookies, informations legales et annulations.",
  "Cancelación gratuita": "Annulation gratuite",
  "Cancelación flexible": "Annulation flexible",
  "No reembolsable": "Non remboursable",
  "Confirmacion inmediata": "Confirmation immediate",
  "Confirmacion manual": "Confirmation manuelle",
  "Continuar con Google": "Continuer avec Google",
  "Abriendo Google...": "Ouverture de Google...",
  "Vuelve a la app cuando Google termine.": "Revenez dans l'app quand Google termine.",
  "No se pudo abrir Google.": "Impossible d'ouvrir Google.",
  "Experiencias y traslados en Republica Dominicana": "Experiences et transferts en Republique dominicaine",
  "Descubre Republica Dominicana con reservas claras": "Decouvrez la Republique dominicaine avec des reservations claires",
  "Republica Dominicana, bien organizada": "Republique dominicaine, bien organisee",
  "Tours y traslados en Republica Dominicana": "Tours et transferts en Republique dominicaine",
  "Reserva traslados y tours confiables en República Dominicana":
    "Reservez des transferts et tours fiables en Republique dominicaine",
  "Precio claro, soporte humano y coordinación local desde que reservas.":
    "Prix clair, assistance humaine et coordination locale des la reservation.",
  "Reserva tours, traslados privados y planes seleccionados con precios transparentes, fotos reales y asistencia local en varios idiomas.":
    "Reservez tours, transferts prives et plans selectionnes avec prix transparents, photos reelles et assistance locale en plusieurs langues.",
  "Tours, traslados privados y planes seleccionados con precios claros y asistencia local.":
    "Tours, transferts prives et plans selectionnes avec prix clairs et assistance locale.",
  "Reserva experiencias seleccionadas y traslados privados con precios claros.":
    "Reservez des experiences selectionnees et des transferts prives avec prix clairs.",
  "Atencion para familias, parejas, grupos y viajeros que prefieren organizar todo antes de llegar.":
    "Assistance pour familles, couples, groupes et voyageurs qui preferent tout organiser avant leur arrivee.",
  "Fotos verificadas": "Photos verifiees",
  "Precio transparente": "Prix transparent",
  "Asistencia 24/7": "Assistance 24/7",
  "Reservar traslado": "Reserver un transfert",
  "Explorar tours": "Explorer les tours",
  "Cotizar traslado": "Devis transfert",
  "Experiencias seleccionadas": "Experiences selectionnees",
  "Actividades con detalles, fotos y precios conectados al catálogo web.":
    "Activites avec details, photos et prix connectes au catalogue web.",
  "Busca aeropuertos, hoteles y zonas reales para calcular tu ruta antes de reservar.":
    "Cherchez de vrais aeroports, hotels et zones pour calculer votre trajet avant de reserver.",
  "Busca tu hotel, aeropuerto o zona y ve el precio antes de reservar.":
    "Cherchez votre hotel, aeroport ou zone et voyez le prix avant de reserver.",
  "Ver disponibilidad": "Voir les disponibilites",
  "Por qué elegir esta experiencia": "Pourquoi choisir cette experience",
  "Recogida en hotel incluida": "Prise en charge a l'hotel incluse",
  "Fotos reales verificadas": "Photos reelles verifiees",
  "Confirmación rápida": "Confirmation rapide",
  "Confirmación segura": "Confirmation securisee",
  "Soporte humano": "Assistance humaine",
  "Pago seguro": "Paiement securise",
  "Galería": "Galerie",
  "Fotos reales de la experiencia": "Photos reelles de l'experience",
  "Duración": "Duree",
  "Descripción": "Description",
  "Más reservado": "Le plus reserve",
  "Mejor precio": "Meilleur prix",
  "Recogida incluida": "Prise en charge incluse",
  "Premium": "Premium",
  "Ideal familias": "Ideal familles",
  "Reserva con asistencia local": "Reservation avec assistance locale",
  "Completa tus datos en la app y finaliza con checkout seguro. Si necesitas ayuda, nuestro equipo te acompaña antes y durante tu experiencia.":
    "Completez vos donnees dans l'app et finalisez avec un checkout securise. Si vous avez besoin d'aide, notre equipe vous accompagne avant et pendant votre experience.",
  "Completa tus datos en la app y finaliza con checkout seguro. Si necesitas ayuda, nuestro equipo te acompana antes y durante tu experiencia.":
    "Completez vos donnees dans l'app et finalisez avec un checkout securise. Si vous avez besoin d'aide, notre equipe vous accompagne avant et pendant votre experience."
};

const languageDictionaries: Record<Exclude<AppLanguage, "es">, Record<string, string>> = {
  en: englishText,
  fr: frenchText
};

const translateText = (value: string, language: AppLanguage) => {
  if (language === "es") return value;
  const dictionary = languageDictionaries[language];
  const exact = dictionary[value];
  if (exact) return exact;

  if (language === "fr") {
    return value
      .replace(/^(\d+) ciudades$/, "$1 villes")
      .replace(/^(\d+) experiencias conectadas$/, "$1 experiences connectees")
      .replace(/^(\d+) experiencias$/, "$1 experiences")
      .replace(/^(\d+) tours$/, "$1 tours")
      .replace(/^(\d+) fotos$/, "$1 photos")
      .replace(/^Desde /, "A partir de ")
      .replace(/ experiencias$/, " experiences")
      .replace(/ tours$/, " tours");
  }

  return value
    .replace(/^(\d+) ciudades$/, "$1 cities")
    .replace(/^(\d+) experiencias conectadas$/, "$1 connected experiences")
    .replace(/^(\d+) experiencias$/, "$1 experiences")
    .replace(/^(\d+) tours$/, "$1 tours")
    .replace(/^(\d+) fotos$/, "$1 photos")
    .replace(/^Desde /, "From ")
    .replace(/ experiencias$/, " experiences")
    .replace(/ tours$/, " tours");
};

const translateChildren = (children: ReactNode, language: AppLanguage): ReactNode => {
  if (typeof children === "string") return translateText(children, language);
  if (Array.isArray(children)) {
    if (children.every((child) => typeof child === "string" || typeof child === "number")) {
      return translateText(children.join(""), language);
    }
    return children.map((child) => translateChildren(child, language));
  }
  return children;
};

function useLanguage() {
  return useContext(languageContext);
}

function useTranslate() {
  const { language } = useLanguage();
  return (value?: string | null) => (value ? translateText(value, language) : value);
}

function Text({ children, ...props }: TextProps) {
  const { language } = useLanguage();
  return (
    <RNText {...props} style={[{ fontFamily: resolveFontFamily(props.style) }, props.style]}>
      {translateChildren(children, language)}
    </RNText>
  );
}

declare const process:
  | {
      env?: Record<string, string | undefined>;
    }
  | undefined;

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
  priceChild?: number | null;
  priceYouth?: number | null;
  activeOffer?: MobileTourOffer | null;
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
  tourLocation?: string | null;
  vehicle?: string | null;
};

type TransferDraft = {
  originQuery: string;
  destinationQuery: string;
  origin: LocationSummary | null;
  destination: LocationSummary | null;
  selectedRouteId: string;
  passengers: number;
  tripType: TripType;
  departureDate: string;
  departureTime: string;
  returnDate: string;
  returnTime: string;
  vehicles?: QuoteVehicle[];
  selectedVehicleId?: string | null;
  savedAt: number;
};

type CheckoutDraft = {
  url: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pickupLocation: string;
  notes: string;
  savedAt: number;
};

const heroImage =
  "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/transfer/banner%20%20%20%20transfer.jpeg";
const transferHeroSource = require("./assets/photos/transfer-hero.jpeg");
const fallbackTourImage =
  "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/tours/4b7182fc-2041-4f02-a7cb-c34a56b9ae8f/temp-1771700516443/cover-1771700516443-118071monkey-land-KNCIgv5ywCaw7hyuyMYq3HYOkUjqX6.webp";
const mobileSessionStorageKey = "proactivitis_mobile_session";
const transferDraftStorageKey = "proactivitis_transfer_draft";
const checkoutDraftStorageKey = "proactivitis_checkout_draft";
const languageStorageKey = "proactivitis_language";
const privacyConsentStorageKey = "proactivitis_privacy_consent";
const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
};
const privacyConsentVersion = 1;
const appBuildLabel = "Version 1.0.6 | Android 6";
const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);

const shortDate = (value?: string | null) => {
  if (!value) return "Fecha pendiente";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha pendiente";
  return new Intl.DateTimeFormat("es-DO", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const openUrl = (url: string) => {
  void Linking.openURL(url).catch(() => undefined);
};

const googleLoginUrl = () => `${getApiBaseUrl().replace(/\/$/, "")}/mobile-auth/google`;
const customerUrl = (path: string) => `${getApiBaseUrl().replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

const whatsappUrl = (message: string) => `${links.whatsapp}?text=${encodeURIComponent(message)}`;

type CustomerPanelSection = "overview" | "bookings" | "payments" | "reviews" | "preferences" | "notifications" | "account";

const customerPanelSections: Array<{ key: CustomerPanelSection; label: string; icon: IconType }> = [
  { key: "overview", label: "Resumen", icon: Compass },
  { key: "bookings", label: "Reservas", icon: CalendarCheck },
  { key: "payments", label: "Pagos", icon: CreditCard },
  { key: "reviews", label: "Resenas", icon: Star },
  { key: "preferences", label: "Gustos", icon: Heart },
  { key: "notifications", label: "Avisos", icon: Mail },
  { key: "account", label: "Cuenta", icon: User }
];

const preferenceDestinationOptions = ["Punta Cana", "Santo Domingo", "La Romana", "Bayahibe", "Samana", "Puerto Plata"];
const preferenceProductOptions = ["Tours", "Transfers", "Aventura", "Playa", "Familia", "VIP"];

const setupIntentIdFromClientSecret = (clientSecret: string) => clientSecret.split("_secret_")[0] || clientSecret;

const policyLinks: Array<{ title: string; subtitle: string; url: string; icon: IconType }> = [
  {
    title: "Política de privacidad",
    subtitle: "Cómo protegemos datos, cuenta y reservas.",
    url: links.privacy,
    icon: ShieldCheck
  },
  {
    title: "Términos y condiciones",
    subtitle: "Reglas de uso, reservas, pagos y responsabilidades.",
    url: links.terms,
    icon: CreditCard
  },
  {
    title: "Cookies y tecnologías",
    subtitle: "Uso de cookies en la web y servicios conectados.",
    url: links.cookies,
    icon: Compass
  },
  {
    title: "Información legal",
    subtitle: "Datos legales, contacto y notificaciones formales.",
    url: links.legalInformation,
    icon: MessageCircle
  },
  {
    title: "Cancelaciones y reembolsos",
    subtitle: "Aplican los términos y la política indicada en cada producto.",
    url: links.terms,
    icon: CalendarCheck
  },
  {
    title: "Eliminar cuenta",
    subtitle: "Solicitud oficial de eliminación de cuenta y datos de la app.",
    url: links.accountDeletion,
    icon: User
  }
];

const sanitizeImageUrl = (value: string) => encodeURI(value.trim().replace(/\\/g, "/"));

const absoluteImageUrl = (url?: string | null) => {
  const cleanUrl = url?.trim();
  if (!cleanUrl) return fallbackTourImage;
  if (/^https?:\/\//i.test(cleanUrl)) return sanitizeImageUrl(cleanUrl);
  return sanitizeImageUrl(`${getApiBaseUrl().replace(/\/$/, "")}${cleanUrl.startsWith("/") ? "" : "/"}${cleanUrl}`);
};

const uniqueImages = (items: Array<string | null | undefined>) =>
  Array.from(new Set(items.filter((item): item is string => Boolean(item)))).map(absoluteImageUrl);

const tomorrow = () => {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
};

const addDays = (days: number) => {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
};

const shortPickerDate = (value: string, locale = "es-DO") => {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { weekday: "short", day: "2-digit", month: "short" }).format(date);
};

const parseDateKey = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 12);
};

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const monthStart = (value: string | Date) => {
  const date = typeof value === "string" ? parseDateKey(value) : value;
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
};

const addCalendarMonths = (date: Date, months: number) => new Date(date.getFullYear(), date.getMonth() + months, 1, 12);

const calendarMonthDays = (month: Date) => {
  const firstDay = monthStart(month);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay.getFullYear(), firstDay.getMonth(), 1 - mondayOffset, 12);
  return Array.from(
    { length: 42 },
    (_, index) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index, 12)
  );
};

const joinValues = (values?: string[] | null) => (values?.filter(Boolean).join(", ") ?? "");

const ignoredCityParts = new Set(["dominican republic", "republica dominicana"]);

const tourCityLabels = (tour: AppTour) => {
  const parts = tour.location
    .split(/[\/,|]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !ignoredCityParts.has(normalizeLocationSearch(part)));
  const cities = parts.length ? parts : [tour.location.trim() || "República Dominicana"];
  return Array.from(new Set(cities));
};

const readStoredMobileSession = async () => {
  const raw = await SecureStore.getItemAsync(mobileSessionStorageKey, secureStoreOptions).catch(() => null);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MobileSession;
  } catch {
    return null;
  }
};

const writeStoredMobileSession = async (session: MobileSession | null) => {
  if (!session) {
    await SecureStore.deleteItemAsync(mobileSessionStorageKey, secureStoreOptions).catch(() => undefined);
    return;
  }
  await SecureStore.setItemAsync(mobileSessionStorageKey, JSON.stringify(session), secureStoreOptions).catch(() => undefined);
};

const readStoredJson = async <T,>(key: string) => {
  const raw = await SecureStore.getItemAsync(key, secureStoreOptions).catch(() => null);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const writeStoredJson = async (key: string, value: unknown | null) => {
  if (!value) {
    await SecureStore.deleteItemAsync(key, secureStoreOptions).catch(() => undefined);
    return;
  }
  await SecureStore.setItemAsync(key, JSON.stringify(value), secureStoreOptions).catch(() => undefined);
};

const isAppLanguage = (value: unknown): value is AppLanguage => value === "es" || value === "en" || value === "fr";

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

const productValueLabels: Record<string, string> = {
  free_cancellation: "Cancelación gratuita",
  flexible_cancellation: "Cancelación flexible",
  non_refundable: "No reembolsable",
  instant_confirmation: "Confirmación rápida",
  manual_confirmation: "Confirmación manual",
  instant: "Confirmación rápida"
};

const normalizeProductValue = (value?: string | null) => {
  const text = value?.trim();
  if (!text) return text;
  return productValueLabels[text.toLowerCase()] ?? text;
};

const applyOfferDiscount = (total: number, offer?: MobileTourOffer | null) => {
  if (!offer || offer.discountValue <= 0) return { total, savings: 0 };
  const rawSavings =
    offer.discountType === "PERCENT" ? total * (Math.min(offer.discountValue, 95) / 100) : offer.discountValue;
  const savings = Math.min(total, Math.round(rawSavings * 100) / 100);
  return {
    total: Math.max(0, Math.round((total - savings) * 100) / 100),
    savings
  };
};

const offerLabel = (offer?: MobileTourOffer | null) => {
  if (!offer) return null;
  return offer.discountType === "PERCENT"
    ? `${offer.discountValue}% OFF`
    : `${money(offer.discountValue)} OFF`;
};

const mapMobileTour = (tour: MobileTour): AppTour => {
  const fallback = fallbackBySlug.get(tour.slug) ?? fallbackById.get(tour.id);
  const image = absoluteImageUrl(tour.image || fallback?.image);
  const gallery = uniqueImages([tour.image, ...(tour.gallery ?? []), fallback?.image]);
  return {
    id: tour.id,
    slug: tour.slug,
    title: tour.title || fallback?.title || "Experiencia Proactivitis",
    category: tour.category || fallback?.category || "Aventura",
    location: tour.location || fallback?.location || "República Dominicana",
    duration: tour.duration || fallback?.duration || "A confirmar",
    price: Number(tour.price || fallback?.price || 0),
    priceChild: tour.priceChild,
    priceYouth: tour.priceYouth,
    activeOffer: tour.activeOffer ?? null,
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
    cancellationPolicy: normalizeProductValue(tour.cancellationPolicy),
    terms: tour.terms,
    physicalLevel: tour.physicalLevel,
    minAge: tour.minAge,
    accessibility: tour.accessibility,
    confirmationType: normalizeProductValue(tour.confirmationType),
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

const fallbackTransferRoutes = staticMobileTransferRoutes.length
  ? [...staticMobileTransferRoutes, ...catalogTransferRoutes]
  : catalogTransferRoutes;

const sameZone = (left?: string | null, right?: string | null) =>
  Boolean(left && right && normalizeLocationSearch(left) === normalizeLocationSearch(right));

type StaticMobileTransferPriceOverride = {
  vehicleId: string;
  originLocationId?: string | null;
  destinationLocationId?: string | null;
  price: number;
};

type StaticMobileTransferPriceRoute = {
  id: string;
  zoneAId: string;
  zoneBId: string;
  zoneAName: string;
  zoneBName: string;
  currency: string;
  vehicles: QuoteVehicle[];
  overrides: StaticMobileTransferPriceOverride[];
};

const mobileTransferPriceRoutes = staticMobileTransferPriceRoutes as StaticMobileTransferPriceRoute[];

const matchesPriceRouteZone = (location: LocationSummary, zoneId: string, zoneName: string) => {
  if (location.zoneId && location.zoneId === zoneId) return true;
  return sameZone(location.zoneName, zoneName);
};

const findStaticPriceRoute = (origin: LocationSummary, destination: LocationSummary) =>
  mobileTransferPriceRoutes.find(
    (route) =>
      (matchesPriceRouteZone(origin, route.zoneAId, route.zoneAName) &&
        matchesPriceRouteZone(destination, route.zoneBId, route.zoneBName)) ||
      (matchesPriceRouteZone(origin, route.zoneBId, route.zoneBName) &&
        matchesPriceRouteZone(destination, route.zoneAId, route.zoneAName))
  );

const findStaticPriceOverride = (
  route: StaticMobileTransferPriceRoute,
  vehicleId: string,
  origin: LocationSummary,
  destination: LocationSummary
) =>
  route.overrides.find(
    (override) =>
      override.vehicleId === vehicleId &&
      override.originLocationId === origin.id &&
      override.destinationLocationId === destination.id
  ) ??
  route.overrides.find(
    (override) =>
      override.vehicleId === vehicleId &&
      override.originLocationId === origin.id &&
      !override.destinationLocationId
  ) ??
  route.overrides.find(
    (override) =>
      override.vehicleId === vehicleId &&
      override.destinationLocationId === destination.id &&
      !override.originLocationId
  );

const buildCatalogTransferVehicles = (
  origin: LocationSummary,
  destination: LocationSummary,
  passengers: number
): QuoteVehicle[] => {
  const route = findStaticPriceRoute(origin, destination);
  if (!route) return [];
  return route.vehicles
    .filter((vehicle) => passengers >= vehicle.minPax && passengers <= vehicle.maxPax)
    .map((vehicle) => ({
      id: vehicle.id,
      name: vehicle.name,
      category: vehicle.category,
      minPax: vehicle.minPax,
      maxPax: vehicle.maxPax,
      imageUrl: vehicle.imageUrl,
      price: findStaticPriceOverride(route, vehicle.id, origin, destination)?.price ?? vehicle.price
    }));
};

const staticTransferVehicles = staticMobileTransferPriceRoutes.flatMap((route) => route.vehicles);
const findTransferVehicleImage = (category: string) =>
  staticTransferVehicles.find((vehicle) => vehicle.category.toUpperCase() === category)?.imageUrl;

const homePopularTransferCards = [
  {
    id: "home-puj",
    code: "PUJ",
    airport: "Punta Cana Airport",
    destination: "Bavaro y Cap Cana",
    priceFrom: 35,
    image: findTransferVehicleImage("SEDAN"),
    vehicle: { name: "Sedan privado" }
  },
  {
    id: "home-sdq",
    code: "SDQ",
    airport: "Aeropuerto Santo Domingo",
    destination: "Santo Domingo y Bayahibe",
    priceFrom: 150,
    image: findTransferVehicleImage("SUV"),
    vehicle: { name: "SUV VIP" }
  },
  {
    id: "home-lrm",
    code: "LRM",
    airport: "Aeropuerto La Romana",
    destination: "La Romana y Bayahibe",
    priceFrom: 94,
    image: findTransferVehicleImage("VAN"),
    vehicle: { name: "Mini van" }
  }
];

const normalizeLocationSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const transferSearchAliases: Record<string, string[]> = {
  puj: ["punta", "cana", "airport", "aeropuerto"],
  sdq: ["santo", "domingo", "airport", "aeropuerto", "las", "americas"],
  lrm: ["romana", "airport", "aeropuerto"],
  airport: ["aeropuerto"],
  aeropuerto: ["airport"],
  bavaro: ["bavaro", "bávaro", "punta", "cana"],
  bahia: ["bahia", "principe"],
  bávaro: ["bavaro", "punta", "cana"],
  romana: ["la", "romana"],
  santo: ["santo", "domingo"],
  zona: ["area", "sector"]
};

const searchTokens = (value: string) =>
  normalizeLocationSearch(value)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);

const expandSearchTokens = (tokens: string[]) =>
  Array.from(new Set(tokens.flatMap((token) => [token, ...(transferSearchAliases[token] ?? [])]).map(normalizeLocationSearch)));

const editDistance = (left: string, right: string) => {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = Array(right.length + 1).fill(0);
  for (let i = 1; i <= left.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
    }
    for (let j = 0; j <= right.length; j += 1) previous[j] = current[j];
  }
  return previous[right.length];
};

const tokenMatchScore = (token: string, haystackTokens: string[]) => {
  if (!token) return 0;
  let score = 0;
  haystackTokens.forEach((item) => {
    if (item === token) score = Math.max(score, 12);
    else if (item.startsWith(token) || token.startsWith(item)) score = Math.max(score, 9);
    else if (item.includes(token) || token.includes(item)) score = Math.max(score, 7);
    else if (token.length >= 4 && item.length >= 4 && editDistance(token, item) <= 1) score = Math.max(score, 6);
    else if (token.length >= 6 && item.length >= 6 && editDistance(token, item) <= 2) score = Math.max(score, 5);
  });
  return score;
};

const transferLocationScore = (location: LocationSummary, query: string) => {
  const queryTokens = expandSearchTokens(searchTokens(query));
  if (!queryTokens.length) return 0;
  const haystack = `${location.name} ${location.zoneName ?? ""} ${location.type}`;
  const haystackTokens = searchTokens(haystack);
  const fullText = normalizeLocationSearch(haystack);
  const normalizedQuery = normalizeLocationSearch(query);
  let score = fullText.includes(normalizedQuery) ? 40 : 0;
  queryTokens.forEach((token) => {
    score += tokenMatchScore(token, haystackTokens);
  });
  if (location.type.toLowerCase().includes("airport") || location.type.toLowerCase().includes("aeropuerto")) score += 3;
  if (location.type.toLowerCase().includes("hotel")) score += 2;
  return score;
};

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

const collectRouteLocations = (routes: MobileTransferRoute[]) =>
  mergeLocations(routes.map((route) => route.origin), routes.map((route) => route.destination));

const fallbackTransferLocations = mergeLocations(staticMobileTransferLocations, collectRouteLocations(fallbackTransferRoutes));

const transferLocationMatches = (locations: LocationSummary[], query: string) => {
  const normalizedQuery = normalizeLocationSearch(query);
  if (normalizedQuery.length < 2) return [];
  return mergeLocations(locations)
    .map((location) => ({ location, score: transferLocationScore(location, query) }))
    .filter((item) => item.score >= 7)
    .sort((a, b) => b.score - a.score || a.location.name.localeCompare(b.location.name))
    .map((item) => item.location)
    .slice(0, 9);
};

const tourZoneParts = (value?: string | null) =>
  (value ?? "")
    .split(/[\/,|]/)
    .map((part) => normalizeLocationSearch(part))
    .filter((part) => part.length > 2 && !ignoredCityParts.has(part));

const pickupHotelMatchesForTour = (locations: LocationSummary[], query: string, tourLocation?: string | null) => {
  const normalizedQuery = normalizeLocationSearch(query);
  if (normalizedQuery.length < 2) return [];
  const zoneParts = tourZoneParts(tourLocation);
  return mergeLocations(locations)
    .filter((location) => location.type === "HOTEL")
    .filter((location) =>
      normalizeLocationSearch(`${location.name} ${location.zoneName ?? ""}`).includes(normalizedQuery)
    )
    .filter((location) => {
      if (!zoneParts.length) return true;
      const zoneText = normalizeLocationSearch(`${location.name} ${location.zoneName ?? ""}`);
      const zoneName = normalizeLocationSearch(location.zoneName ?? "");
      return zoneParts.some((part) => zoneText.includes(part) || (zoneName.length > 2 && part.includes(zoneName)));
    })
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

const readMobileAuthSession = (href: string): MobileSession | null => {
  if (!href.startsWith("proactivitis://auth")) return null;
  const params = readUrlParams(href);
  const token = params.get("token") ?? "";
  const id = params.get("userId") ?? "";
  const email = params.get("email") ?? "";
  if (!token || !id || !email) return null;
  return {
    token,
    user: {
      id,
      email,
      name: params.get("name"),
      role: params.get("role")
    }
  };
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
    tourLocation: params.get("tourLocation"),
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

const normalizeStripePublishableKey = (value?: string | null) => {
  const key = value?.trim();
  return key && key.startsWith("pk_") ? key : "";
};

const buildStripePublishableKey = normalizeStripePublishableKey(process?.env?.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function App() {
  const [fontsLoaded, fontLoadError] = useFonts(appFonts);
  const [stripePublishableKey, setStripePublishableKey] = useState(buildStripePublishableKey);
  const [language, setLanguageState] = useState<AppLanguage | null>(null);
  const [languageReady, setLanguageReady] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState<PrivacyConsent | null>(null);
  const [privacyReady, setPrivacyReady] = useState(false);

  useEffect(() => {
    let active = true;
    readStoredJson<{ language: AppLanguage }>(languageStorageKey)
      .then((stored) => {
        if (active && isAppLanguage(stored?.language)) setLanguageState(stored.language);
      })
      .finally(() => {
        if (active) setLanguageReady(true);
      });

    readStoredJson<PrivacyConsent>(privacyConsentStorageKey)
      .then((stored) => {
        if (active && stored?.version === privacyConsentVersion && stored.essential) {
          setPrivacyConsent(stored);
        }
      })
      .finally(() => {
        if (active) setPrivacyReady(true);
      });

    fetchMobileConfig()
      .then((config) => {
        const configKey = normalizeStripePublishableKey(config.stripePublishableKey);
        if (active && configKey) setStripePublishableKey(configKey);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const updateLanguage = (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    void writeStoredJson(languageStorageKey, { language: nextLanguage });
  };

  const updatePrivacyConsent = (nextConsent: Omit<PrivacyConsent, "acceptedAt" | "version" | "essential">) => {
    const consent: PrivacyConsent = {
      essential: true,
      personalization: nextConsent.personalization,
      analytics: nextConsent.analytics,
      marketing: nextConsent.marketing,
      acceptedAt: new Date().toISOString(),
      version: privacyConsentVersion
    };
    setPrivacyConsent(consent);
    void writeStoredJson(privacyConsentStorageKey, consent);
  };

  const currentLanguage = language ?? "es";
  const appReady = languageReady && privacyReady && (fontsLoaded || Boolean(fontLoadError));

  return (
    <SafeAreaProvider>
      <languageContext.Provider value={{ language: currentLanguage, setLanguage: updateLanguage }}>
        <AppStripeProvider publishableKey={stripePublishableKey}>
          <StripeDeepLinkHandler />
          {appReady ? (
            language ? (
              privacyConsent ? (
                <MobileApp stripeReady={Boolean(stripePublishableKey)} />
              ) : (
                <PrivacyConsentGate onAccept={updatePrivacyConsent} />
              )
            ) : (
              <LanguageGate onSelect={updateLanguage} />
            )
          ) : (
            <SafeAreaView style={styles.safeArea}>
              <StatusBar style="light" />
              <View style={styles.languageScreen} />
            </SafeAreaView>
          )}
        </AppStripeProvider>
      </languageContext.Provider>
    </SafeAreaProvider>
  );
}

function LanguageGate({ onSelect }: { onSelect: (language: AppLanguage) => void }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.languageScreen}>
        <View style={styles.languageCard}>
          <View style={styles.languageIcon}>
            <Compass size={30} color={colors.white} />
          </View>
          <Text style={styles.languageTitle}>Elige tu idioma</Text>
          <Text style={styles.languageSubtitle}>Puedes cambiarlo luego desde Perfil.</Text>
          <LanguageSelector onSelect={onSelect} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function PrivacyConsentGate({
  onAccept
}: {
  onAccept: (consent: Omit<PrivacyConsent, "acceptedAt" | "version" | "essential">) => void;
}) {
  const [showPreferences, setShowPreferences] = useState(false);
  const [personalization, setPersonalization] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const acceptAll = () => onAccept({ personalization: true, analytics: true, marketing: true });
  const savePreferences = () => onAccept({ personalization, analytics, marketing });

  if (showPreferences) {
    return (
      <SafeAreaView style={styles.privacySafeArea}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.privacyScreen} showsVerticalScrollIndicator={false}>
          <View style={styles.privacyTopIcon}>
            <ShieldCheck size={28} color={colors.skyDark} />
          </View>
          <Text style={styles.privacyTitle}>Preferencias de privacidad</Text>
          <Text style={styles.privacyBody}>
            Puedes activar solo lo necesario o permitir datos adicionales para personalizar tu experiencia. Las preferencias se guardan en este dispositivo.
          </Text>

          <View style={styles.privacyOptions}>
            <View style={styles.privacyOption}>
              <View style={styles.flexText}>
                <Text style={styles.privacyOptionTitle}>Necesarias</Text>
                <Text style={styles.privacyOptionText}>Mantienen sesión, idioma, seguridad, reservas y checkout.</Text>
              </View>
              <Text style={styles.privacyAlwaysOn}>Siempre</Text>
            </View>
            <PrivacyToggle
              title="Personalizacion"
              text="Recuerda idioma, preferencias, favoritos y rutas para una experiencia mas fluida."
              active={personalization}
              onPress={() => setPersonalization((current) => !current)}
            />
            <PrivacyToggle
              title="Medicion"
              text="Nos ayuda a entender rendimiento, errores y mejoras dentro de la app."
              active={analytics}
              onPress={() => setAnalytics((current) => !current)}
            />
            <PrivacyToggle
              title="Ofertas relevantes"
              text="Permite mostrar promociones y recomendaciones mas utiles."
              active={marketing}
              onPress={() => setMarketing((current) => !current)}
            />
          </View>

          <View style={styles.privacyActions}>
            <ActionButton label="Guardar preferencias" icon={CheckCircle2} onPress={savePreferences} />
            <ActionButton label="Aceptar todo" icon={ShieldCheck} variant="outlineDark" onPress={acceptAll} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.privacySafeArea}>
      <StatusBar style="dark" />
      <View style={styles.privacyScreen}>
        <View>
          <View style={styles.privacyTopIcon}>
            <ShieldCheck size={28} color={colors.skyDark} />
          </View>
          <Text style={styles.privacyTitle}>Queremos ofrecerte la mejor experiencia posible</Text>
          <Text style={styles.privacyBody}>
            Proactivitis utiliza almacenamiento local y tecnologias similares para proteger tu cuenta, recordar tu idioma,
            guardar preferencias, medir el rendimiento de la app y ofrecerte tours, traslados y ofertas mas relevantes.
            Puedes cambiar tus preferencias antes de continuar.
          </Text>
          <Pressable onPress={() => openUrl(links.privacy)}>
            <Text style={styles.privacyLink}>Ver política de privacidad</Text>
          </Pressable>
        </View>

        <View style={styles.privacyBottomActions}>
          <ActionButton label="Aceptar y continuar" icon={CheckCircle2} onPress={acceptAll} />
          <Pressable style={styles.privacyTextButton} onPress={() => setShowPreferences(true)}>
            <Text style={styles.privacyTextButtonLabel}>Cambiar preferencias</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function PrivacyToggle({
  title,
  text,
  active,
  onPress
}: {
  title: string;
  text: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.privacyOption} onPress={onPress}>
      <View style={styles.flexText}>
        <Text style={styles.privacyOptionTitle}>{title}</Text>
        <Text style={styles.privacyOptionText}>{text}</Text>
      </View>
      <View style={[styles.privacySwitch, active ? styles.privacySwitchActive : null]}>
        <View style={[styles.privacySwitchKnob, active ? styles.privacySwitchKnobActive : null]} />
      </View>
    </Pressable>
  );
}

function LanguageSelector({
  selected,
  onSelect
}: {
  selected?: AppLanguage;
  onSelect: (language: AppLanguage) => void;
}) {
  const { language } = useLanguage();

  return (
    <View style={styles.languageOptions}>
      {languageOptions.map((option) => {
        const active = selected ? selected === option.code : language === option.code;
        return (
          <Pressable
            key={option.code}
            style={[styles.languageOption, active ? styles.languageOptionActive : null]}
            onPress={() => onSelect(option.code)}
          >
            <View style={[styles.languageBadge, active ? styles.languageBadgeActive : null]}>
              <Text style={[styles.languageBadgeText, active ? styles.languageBadgeTextActive : null]}>
                {option.code.toUpperCase()}
              </Text>
            </View>
            <View style={styles.flexText}>
              <Text style={styles.languageOptionTitle}>{option.title}</Text>
              <Text style={styles.languageOptionSubtitle}>{option.subtitle}</Text>
            </View>
            {active ? <CheckCircle2 size={22} color={colors.green} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function MobileApp({ stripeReady }: { stripeReady: boolean }) {
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
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
  const [productBookingY, setProductBookingY] = useState(0);
  const [productFloatingVisible, setProductFloatingVisible] = useState(true);

  const updateMobileSession = (session: MobileSession | null) => {
    setMobileSession(session);
    void writeStoredMobileSession(session);
  };

  const refreshLiveTours = useCallback(() => {
    setToursLoading(true);
    fetchMobileTours(language)
      .then((items) => {
        setTours(items.map(mapMobileTour));
      })
      .catch(() => {
        setTours(fallbackTours);
      })
      .finally(() => {
        setToursLoading(false);
      });
  }, [language]);

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (!url) return;
      const nextSession = readMobileAuthSession(url);
      if (!nextSession) return;
      setMobileSession(nextSession);
      void writeStoredMobileSession(nextSession);
      setActiveTab("profile");
    };

    void Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener("url", (event) => handleUrl(event.url));
    return () => subscription.remove();
  }, []);

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

    fetchMobileTours(language)
      .then((items) => {
        if (active) setTours(items.map(mapMobileTour));
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
  }, [language]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshLiveTours();
    });
    return () => subscription.remove();
  }, [refreshLiveTours]);

  useEffect(() => {
    if (checkoutUrl) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });
  }, [activeTab, activeProduct?.id, checkoutUrl]);

  useEffect(() => {
    setProductBookingY(0);
    setProductFloatingVisible(true);
  }, [activeProduct?.id]);

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
          onSessionChange={updateMobileSession}
          onClose={() => setCheckoutUrl(null)}
          onOpenProfile={() => {
            setCheckoutUrl(null);
            setActiveTab("profile");
          }}
        />
      );
    }

    if (activeProduct) {
      return (
        <ProductScreen
          tour={activeProduct}
          onBack={() => setActiveProduct(null)}
          onCheckout={openCheckout}
          onScrollTo={(y) => scrollRef.current?.scrollTo({ y, animated: true })}
          onBookingOffsetChange={setProductBookingY}
          onFloatingBarVisibleChange={setProductFloatingVisible}
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

  const fullBleedTop = !checkoutUrl && (activeTab === "home" || activeTab === "transfers" || Boolean(activeProduct));
  const bottomInset = Math.max(insets.bottom, 14);
  const topInset = Math.max(insets.top, 24);
  const tabBarBottom = bottomInset;
  const scrollBottomPadding = activeProduct ? 94 + bottomInset + 62 : 72 + tabBarBottom + 64;

  return (
    <View style={styles.appRoot}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={[styles.appShell, fullBleedTop ? null : { paddingTop: topInset }]}>
        {checkoutUrl ? (
          <ScreenErrorBoundary
            resetKey={screenResetKey}
            fallback={<CrashFallbackScreen onBack={() => setCheckoutUrl(null)} />}
          >
            {renderScreen()}
          </ScreenErrorBoundary>
        ) : (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[
              styles.scrollContent,
              activeProduct ? styles.scrollContentWithFloatingBar : null,
              { paddingBottom: scrollBottomPadding }
            ]}
            showsVerticalScrollIndicator={false}
          >
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
        {!checkoutUrl && activeProduct && productFloatingVisible ? (
          <ProductFloatingBar
            tour={activeProduct}
            bottomInset={bottomInset}
            onPress={() => {
              setProductFloatingVisible(false);
              scrollRef.current?.scrollTo({ y: productBookingY || 620, animated: true });
            }}
          />
        ) : null}
        {!checkoutUrl && !activeProduct ? <TabBar activeTab={activeTab} onChange={setActiveTab} bottomInset={tabBarBottom} /> : null}
      </View>
    </View>
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
    <View style={styles.homeScreen}>
      <ImageBackground source={{ uri: absoluteImageUrl(homeHeroImage) }} style={styles.hero} imageStyle={styles.heroImage as StyleProp<ImageStyle>}>
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <View style={styles.heroBrand}>
            <View style={styles.heroBrandIconShell}>
              <Image source={require("./assets/icon.png")} style={styles.heroBrandIcon} />
            </View>
            <View style={styles.flexText}>
              <Text style={styles.heroBrandName}>Proactivitis</Text>
              <Text style={styles.heroBrandLine}>Tours & Transfers</Text>
            </View>
          </View>
          <Text style={styles.eyebrow}>Experiencias y traslados</Text>
          <Text style={styles.heroTitle}>Reserva traslados y tours confiables en República Dominicana</Text>
          <Text style={styles.heroSubtitle}>
            Precio claro, soporte humano y coordinación local desde que reservas.
          </Text>
          <View style={styles.heroTrustRow}>
            <Text style={styles.heroTrustPill}>Fotos verificadas</Text>
            <Text style={styles.heroTrustPill}>Asistencia 24/7</Text>
          </View>
          <View style={styles.heroActions}>
            <ActionButton label="Reservar traslado" icon={Car} onPress={onOpenTransfers} />
            <ActionButton label="Explorar tours" icon={Compass} variant="outline" onPress={onOpenTours} />
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
          <Text style={styles.homeBookingTitle}>Experiencias seleccionadas</Text>
          <Text style={styles.homeBookingText}>Actividades con fotos reales, horarios claros y precios actualizados.</Text>
        </Pressable>
        <Pressable style={styles.homeBookingCard} onPress={onOpenTransfers}>
          <Text style={styles.homeBookingEmoji}>🚘</Text>
          <Text style={styles.homeBookingTitle}>Traslados privados</Text>
          <Text style={styles.homeBookingText}>Busca tu hotel, aeropuerto o zona y ve el precio antes de reservar.</Text>
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
            <View style={styles.homeRouteTopRow}>
              <Text style={styles.homeRouteCode}>{route.code}</Text>
              <View style={styles.homeRouteImageWrap}>
                <RemoteImage uri={route.image} style={styles.homeRouteImage} resizeMode="contain" />
              </View>
            </View>
            <Text style={styles.homeRouteAirport} numberOfLines={2}>{route.airport}</Text>
            <Text style={styles.homeRouteDestination} numberOfLines={2}>{route.destination}</Text>
            <View style={styles.homeVehiclePill}>
              <Car size={13} color={colors.skyDark} />
              <Text style={styles.homeVehicleText} numberOfLines={1}>{route.vehicle.name}</Text>
            </View>
            <Text style={styles.homeRoutePrice}>Desde {money(route.priceFrom)}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.noticePanel}>
        <ShieldCheck size={22} color={colors.skyDark} />
        <View style={styles.flexText}>
          <Text style={styles.noticeTitle}>Reserva con asistencia local</Text>
          <Text style={styles.noticeText}>
            Completa tus datos en la app y finaliza con checkout seguro. Si necesitas ayuda, nuestro equipo te acompaña antes y durante tu experiencia.
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
  const tr = useTranslate();

  return (
    <View style={styles.screen}>
      <View style={styles.toursHeroPanel}>
        <Text style={styles.eyebrowDark}>Catálogo Proactivitis</Text>
        <Text style={styles.toursHeroTitle}>Tours listos para reservar</Text>
        <Text style={styles.toursHeroCopy}>
          Experiencias reales, fotos del producto, detalles claros y reserva dentro de la app.
        </Text>
        <View style={styles.toursTrustRow}>
          <Text style={styles.toursTrustPill}>Galería</Text>
          <Text style={styles.toursTrustPill}>Reserva rápida</Text>
          <Text style={styles.toursTrustPill}>Soporte humano</Text>
        </View>
      </View>
      <View style={styles.searchBox}>
        <Search size={18} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          placeholder={tr("Buscar Saona, buggy, parasailing...") ?? undefined}
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
              <Text style={styles.bodyText}>Prueba con Saona, buggy, catamarán o limpia el filtro para ver todo el catálogo.</Text>
        </View>
      )}
    </View>
  );
}

function CalendarPickerModal({
  visible,
  selectedDate,
  month,
  locale,
  onMonthChange,
  onSelect,
  onClose
}: {
  visible: boolean;
  selectedDate: string;
  month: Date;
  locale: string;
  onMonthChange: (month: Date) => void;
  onSelect: (date: string) => void;
  onClose: () => void;
}) {
  const minDate = parseDateKey(tomorrow());
  const maxDate = parseDateKey(addDays(730));
  const currentMonth = monthStart(month);
  const selectedDateKey = selectedDate;
  const cells = calendarMonthDays(currentMonth);
  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(currentMonth);
  const weekdayLabels = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2026, 0, 5 + index, 12))
  );
  const canGoPrevious = currentMonth.getTime() > monthStart(minDate).getTime();
  const canGoNext = currentMonth.getTime() < monthStart(maxDate).getTime();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.calendarBackdrop}>
        <Pressable style={styles.calendarBackdropTap} onPress={onClose} />
        <View style={styles.calendarSheet}>
          <View style={styles.rowBetween}>
            <View style={styles.flexText}>
              <Text style={styles.sectionTitle}>Selecciona una fecha</Text>
              <Text style={styles.smallMuted}>Puedes reservar para una fecha más futura.</Text>
            </View>
            <Pressable style={styles.calendarCloseButton} onPress={onClose}>
              <Text style={styles.calendarCloseText}>Cerrar</Text>
            </Pressable>
          </View>

          <View style={styles.calendarMonthBar}>
            <Pressable
              style={[styles.calendarNavButton, !canGoPrevious ? styles.calendarNavButtonDisabled : null]}
              onPress={() => canGoPrevious && onMonthChange(addCalendarMonths(currentMonth, -1))}
            >
              <ArrowLeft size={18} color={canGoPrevious ? colors.skyDark : colors.muted} />
              <Text style={[styles.calendarNavText, !canGoPrevious ? styles.calendarNavTextDisabled : null]}>
                Mes anterior
              </Text>
            </Pressable>
            <Text style={styles.calendarMonthTitle}>{monthLabel}</Text>
            <Pressable
              style={[styles.calendarNavButton, !canGoNext ? styles.calendarNavButtonDisabled : null]}
              onPress={() => canGoNext && onMonthChange(addCalendarMonths(currentMonth, 1))}
            >
              <Text style={[styles.calendarNavText, !canGoNext ? styles.calendarNavTextDisabled : null]}>
                Mes siguiente
              </Text>
            </Pressable>
          </View>

          <View style={styles.calendarWeekRow}>
            {weekdayLabels.map((day) => (
              <Text key={day} style={styles.calendarWeekText}>{day}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {cells.map((cell) => {
              const key = toDateKey(cell);
              const isSelected = key === selectedDateKey;
              const isOtherMonth = cell.getMonth() !== currentMonth.getMonth();
              const disabled = cell.getTime() < minDate.getTime() || cell.getTime() > maxDate.getTime();
              return (
                <Pressable
                  key={key}
                  style={[
                    styles.calendarDay,
                    isOtherMonth ? styles.calendarDayOtherMonth : null,
                    disabled ? styles.calendarDayDisabled : null,
                    isSelected ? styles.calendarDaySelected : null
                  ]}
                  disabled={disabled}
                  onPress={() => onSelect(key)}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      isOtherMonth ? styles.calendarDayTextMuted : null,
                      disabled ? styles.calendarDayTextDisabled : null,
                      isSelected ? styles.calendarDayTextSelected : null
                    ]}
                  >
                    {cell.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ProductFloatingBar({
  tour,
  bottomInset,
  onPress
}: {
  tour: AppTour;
  bottomInset: number;
  onPress: () => void;
}) {
  const displayPrice = applyOfferDiscount(tour.price, tour.activeOffer).total;
  return (
    <View style={[styles.productFloatingBar, { paddingBottom: 18 + bottomInset }]}>
      <View style={styles.productFloatingPriceBlock}>
        <Text style={styles.productFloatingLabel}>Desde</Text>
        <View style={styles.productFloatingPriceRow}>
          {tour.activeOffer ? <Text style={styles.productFloatingOldPrice}>{money(tour.price)}</Text> : null}
          <Text style={styles.productFloatingPrice}>{money(displayPrice)}</Text>
        </View>
        <Text style={styles.productFloatingSub}>por adulto</Text>
      </View>
      <Pressable style={styles.productFloatingButton} onPress={onPress}>
        <CalendarCheck size={20} color={colors.white} />
        <Text style={styles.productFloatingButtonText}>Ver disponibilidad</Text>
      </Pressable>
    </View>
  );
}

function ProductScreen({
  tour,
  onBack,
  onCheckout,
  onScrollTo,
  onBookingOffsetChange,
  onFloatingBarVisibleChange
}: {
  tour: AppTour;
  onBack: () => void;
  onCheckout: (url: string) => void;
  onScrollTo: (y: number) => void;
  onBookingOffsetChange: (y: number) => void;
  onFloatingBarVisibleChange: (visible: boolean) => void;
}) {
  const { language } = useLanguage();
  const dateLocale = language === "en" ? "en-US" : language === "fr" ? "fr-FR" : "es-DO";
  const productPanelY = useRef(0);
  const bookingFormY = useRef(0);
  const heroCarouselRef = useRef<ScrollView>(null);
  const galleryImages = useMemo(() => (tour.gallery.length ? tour.gallery : [tour.image]).slice(0, 18), [tour.gallery, tour.image]);
  const [selectedImage, setSelectedImage] = useState(galleryImages[0] ?? tour.image);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [adults, setAdults] = useState(2);
  const [youth, setYouth] = useState(0);
  const [child, setChild] = useState(0);
  const [date, setDate] = useState(tomorrow());
  const [dateConfirmed, setDateConfirmed] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => monthStart(tomorrow()));
  const [time, setTime] = useState("09:00");
  const [timeConfirmed, setTimeConfirmed] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState(
    tour.options.find((option) => option.isDefault)?.id ?? tour.options[0]?.id ?? null
  );
  const selectedOption = tour.options.find((option) => option.id === selectedOptionId) ?? null;
  const totalTravelers = Math.max(1, adults + youth + child);
  const adultPrice = selectedOption?.pricePerPerson ?? tour.price;
  const youthPrice = selectedOption?.pricePerPerson ?? tour.priceYouth ?? tour.price;
  const childPrice = selectedOption?.pricePerPerson ?? tour.priceChild ?? tour.priceYouth ?? tour.price;
  const subtotal =
    selectedOption?.basePrice && selectedOption.baseCapacity
      ? selectedOption.basePrice +
        Math.max(0, totalTravelers - selectedOption.baseCapacity) *
          (selectedOption.extraPricePerPerson ?? selectedOption.pricePerPerson ?? tour.price)
      : selectedOption?.basePrice
        ? selectedOption.basePrice
        : adults * adultPrice + youth * youthPrice + child * childPrice;
  const offerPricing = applyOfferDiscount(subtotal, tour.activeOffer);
  const totalPrice = offerPricing.total;
  const pricePerPerson = totalPrice / totalTravelers;
  const timeOptions = useMemo(() => {
    const cleanOptions = tour.timeOptions.map((item) => item.trim()).filter(Boolean).slice(0, 6);
    return cleanOptions.length ? cleanOptions : ["08:00", "09:00", "10:00", "13:00", "15:00"];
  }, [tour.timeOptions]);
  const shortDescription = tour.description || tour.fullDescription || "Experiencia confirmada por Proactivitis.";
  const detailDescription = tour.fullDescription || tour.description;
  const quickFacts = [
    { icon: Clock3, label: "Duración", value: tour.duration },
    { icon: MapPin, label: "Zona", value: tour.location },
    { icon: Car, label: "Recogida", value: tour.pickup },
    { icon: ShieldCheck, label: "Reserva", value: tour.confirmationType ?? "Confirmación segura" }
  ].filter((item) => item.value.trim().length > 0);
  const productTrustPoints = [
    "Recogida en hotel incluida",
    "Fotos reales verificadas",
    "Confirmación rápida",
    "Soporte humano",
    "Pago seguro"
  ];

  useEffect(() => {
    setSelectedImage(galleryImages[0] ?? tour.image);
  }, [tour.id, galleryImages, tour.image]);

  useEffect(() => {
    const nextDate = tomorrow();
    setAdults(2);
    setYouth(0);
    setChild(0);
    setDate(nextDate);
    setDateConfirmed(false);
    setCalendarOpen(false);
    setCalendarMonth(monthStart(nextDate));
    setTime(timeOptions[0] ?? "09:00");
    setTimeConfirmed(false);
    setSelectedOptionId(tour.options.find((option) => option.isDefault)?.id ?? tour.options[0]?.id ?? null);
  }, [timeOptions, tour.id, tour.options]);

  useEffect(() => {
    const selectedIndex = Math.max(0, galleryImages.indexOf(selectedImage));
    requestAnimationFrame(() => {
      heroCarouselRef.current?.scrollTo({ x: selectedIndex * windowWidth, animated: false });
    });
  }, [galleryImages, selectedImage]);

  useEffect(() => {
    if (!galleryOpen) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      setGalleryOpen(false);
      return true;
    });

    return () => subscription.remove();
  }, [galleryOpen]);

  useEffect(() => {
    onFloatingBarVisibleChange(!galleryOpen);
    return () => onFloatingBarVisibleChange(true);
  }, [galleryOpen, onFloatingBarVisibleChange]);

  const infoRows = [
    { label: "Punto de encuentro", value: tour.meetingPoint ?? "" },
    { label: "Instrucciones", value: tour.meetingInstructions ?? "" },
    { label: "Idiomas", value: joinValues(tour.languages) },
    { label: "Horarios", value: joinValues(tour.timeOptions) },
    { label: "Días", value: joinValues(tour.operatingDays) },
    { label: "Capacidad", value: tour.capacity ? `${tour.capacity} personas` : "" },
    { label: "Edad mínima", value: tour.minAge ? `${tour.minAge}+` : "" },
    { label: "Nivel físico", value: tour.physicalLevel ?? "" },
    { label: "Accesibilidad", value: tour.accessibility ?? "" },
    { label: "Requisitos", value: tour.requirements ?? "" },
    { label: "Cancelación", value: tour.cancellationPolicy ?? "" }
  ].filter((item) => item.value.trim().length > 0);

  const startCheckout = () => {
    onCheckout(
      buildTourCheckoutUrl({
        tour: tour.webTour,
        option: selectedOption,
        adults,
        youth,
        child,
        date,
        time,
        totalPrice,
        tourPrice: pricePerPerson
      })
    );
  };

  const scrollToBookingForm = () => {
    onFloatingBarVisibleChange(false);
    onScrollTo(Math.max(0, productPanelY.current + bookingFormY.current - 18));
  };

  const closeGalleryAndShowAvailability = () => {
    setGalleryOpen(false);
    requestAnimationFrame(scrollToBookingForm);
  };

  const updateBookingOffset = () => {
    onBookingOffsetChange(Math.max(0, productPanelY.current + bookingFormY.current - 18));
  };

  const handleHeroScrollEnd = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / windowWidth);
    const image = galleryImages[Math.min(Math.max(index, 0), galleryImages.length - 1)];
    if (image) setSelectedImage(image);
  };

  const openCalendar = () => {
    setCalendarMonth(monthStart(date));
    setCalendarOpen(true);
    scrollToBookingForm();
  };

  const bookingActionLabel = !dateConfirmed ? "Seleccionar fecha" : !timeConfirmed ? "Seleccionar hora" : "Continuar";
  const bookingActionIcon = !dateConfirmed ? CalendarCheck : !timeConfirmed ? Clock3 : CreditCard;
  const bookingActionPress = !dateConfirmed ? openCalendar : !timeConfirmed ? scrollToBookingForm : startCheckout;

  if (galleryOpen) {
    return (
      <GalleryViewer
        images={galleryImages}
        image={selectedImage}
        onSelect={setSelectedImage}
        onClose={() => setGalleryOpen(false)}
        onAvailability={closeGalleryAndShowAvailability}
      />
    );
  }

  return (
    <View style={styles.productScreen}>
      <View style={styles.productHero}>
        <ScrollView
          ref={heroCarouselRef}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          style={styles.productImageButton}
          onMomentumScrollEnd={handleHeroScrollEnd}
        >
          {galleryImages.map((image, index) => (
            <Pressable key={`${image}-${index}`} style={styles.productImageSlide} onPress={() => setGalleryOpen(true)}>
              <RemoteImage uri={image} style={styles.productHeroImage} />
            </Pressable>
          ))}
        </ScrollView>
        <View pointerEvents="none" style={styles.productOverlay} />
        <Pressable style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={22} color={colors.ink} />
        </Pressable>
        <Pressable style={styles.galleryFloatingButton} onPress={() => setGalleryOpen(true)}>
          <ImageIcon size={16} color={colors.ink} />
          <Text style={styles.galleryFloatingText}>
            {Math.max(1, galleryImages.indexOf(selectedImage) + 1)}/{galleryImages.length}
          </Text>
        </Pressable>
        <View style={styles.productHeroDots}>
          {galleryImages.slice(0, 6).map((image, index) => (
            <View
              key={`${image}-dot`}
              style={[styles.productHeroDot, image === selectedImage ? styles.productHeroDotActive : null]}
            />
          ))}
        </View>
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

      <View
        style={styles.productPanel}
        onLayout={(event) => {
          productPanelY.current = event.nativeEvent.layout.y;
          updateBookingOffset();
        }}
      >
        <View style={styles.productBookingCard}>
          <View style={styles.flexText}>
            <Text style={styles.productPriceLabel}>Desde</Text>
            {tour.activeOffer ? <Text style={styles.productOldPrice}>{money(tour.price)}</Text> : null}
            <Text style={styles.productPrice}>{money(applyOfferDiscount(tour.price, tour.activeOffer).total)}</Text>
            <Text style={styles.smallMuted}>por adulto, actualizado antes de pagar.</Text>
            {tour.activeOffer ? (
              <View style={styles.offerBadge}>
                <Text style={styles.offerBadgeText}>{offerLabel(tour.activeOffer)}</Text>
              </View>
            ) : null}
          </View>
          <ActionButton label="Ver disponibilidad" icon={CalendarCheck} onPress={scrollToBookingForm} />
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
            <View style={styles.flexText}>
              <Text style={styles.sectionTitle}>Galería</Text>
              <Text style={styles.smallMuted}>Fotos reales de la experiencia</Text>
            </View>
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

        <View style={styles.productTrustPanel}>
          <Text style={styles.sectionTitle}>Por qué elegir esta experiencia</Text>
          <View style={styles.productTrustGrid}>
            {productTrustPoints.map((point) => (
              <View key={point} style={styles.productTrustItem}>
                <CheckCircle2 size={16} color={colors.green} />
                <Text style={styles.productTrustText}>{point}</Text>
              </View>
            ))}
          </View>
        </View>

        {detailDescription ? (
          <View style={styles.listPanel}>
            <Text style={styles.sectionTitle}>Descripción</Text>
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

        <View
          style={styles.checkoutBox}
          onLayout={(event) => {
            bookingFormY.current = event.nativeEvent.layout.y;
            updateBookingOffset();
          }}
        >
          <View style={styles.rowBetween}>
            <View style={styles.flexText}>
              <Text style={styles.sectionTitle}>Reservar</Text>
              <Text style={styles.smallMuted}>Selecciona fecha, hora y viajeros.</Text>
            </View>
            <Text style={styles.checkoutBadge}>Pago seguro</Text>
          </View>

          <View style={styles.bookingSelectionSummary}>
            <View style={styles.bookingSelectionIcon}>
              <CalendarCheck size={18} color={colors.white} />
            </View>
            <View style={styles.flexText}>
              <Text style={styles.bookingSelectionLabel}>Tu selección</Text>
              <Text style={styles.bookingSelectionValue}>{shortPickerDate(date, dateLocale)} | {time} | {totalTravelers} pax</Text>
            </View>
          </View>

          <View style={styles.priceTierPanel}>
            <View style={styles.priceTierRow}>
              <Text style={styles.priceTierLabel}>Adulto</Text>
              <Text style={styles.priceTierValue}>{money(adultPrice)}</Text>
            </View>
            <View style={styles.priceTierRow}>
              <Text style={styles.priceTierLabel}>Adolescente</Text>
              <Text style={styles.priceTierValue}>{money(youthPrice)}</Text>
            </View>
            <View style={styles.priceTierRow}>
              <Text style={styles.priceTierLabel}>Niño</Text>
              <Text style={styles.priceTierValue}>{money(childPrice)}</Text>
            </View>
          </View>

          {tour.activeOffer ? (
            <View style={styles.offerPanel}>
              <Text style={styles.offerPanelTitle}>{tour.activeOffer.title}</Text>
              <Text style={styles.offerPanelText}>
                {offerLabel(tour.activeOffer)} aplicado. Ahorras {money(offerPricing.savings)} en esta reserva.
              </Text>
            </View>
          ) : null}

          <View style={styles.bookingStepBlock}>
            <View style={styles.bookingStepHeader}>
              <Text style={styles.bookingStepNumber}>1</Text>
              <View style={styles.flexText}>
                <Text style={styles.fieldLabel}>Selecciona una fecha</Text>
                <Text style={styles.smallMuted}>Toca la fecha para abrir el calendario y elegir cualquier día futuro.</Text>
              </View>
            </View>
            <Pressable style={styles.bookingDateButton} onPress={openCalendar}>
              <CalendarCheck size={18} color={colors.skyDark} />
              <View style={styles.flexText}>
                <Text style={styles.bookingDateLabel}>Fecha de la experiencia</Text>
                <Text style={styles.bookingDateValue}>{shortPickerDate(date, dateLocale)}</Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.bookingStepBlock}>
            <View style={styles.bookingStepHeader}>
              <Text style={styles.bookingStepNumber}>2</Text>
              <View style={styles.flexText}>
                <Text style={styles.fieldLabel}>Selecciona una hora</Text>
                <Text style={styles.smallMuted}>Elige el horario que prefieres para esta experiencia.</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bookingChipRow}>
              {timeOptions.map((item) => (
                <Pressable
                  key={item}
                  style={[styles.bookingChoiceChip, item === time ? styles.bookingChoiceChipActive : null]}
                  onPress={() => {
                    setTime(item);
                    setTimeConfirmed(true);
                    scrollToBookingForm();
                  }}
                >
                  <Clock3 size={14} color={item === time ? colors.white : colors.skyDark} />
                  <Text style={[styles.bookingChoiceText, item === time ? styles.bookingChoiceTextActive : null]}>
                    {item}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.bookingStepBlock}>
            <View style={styles.bookingStepHeader}>
              <Text style={styles.bookingStepNumber}>3</Text>
              <View style={styles.flexText}>
                <Text style={styles.fieldLabel}>Personas</Text>
                <Text style={styles.smallMuted}>El precio se actualiza antes de continuar.</Text>
              </View>
            </View>
            <Stepper label="Adultos" value={adults} min={1} max={20} onChange={setAdults} />
            <Stepper label="Adolescentes" value={youth} min={0} max={20} onChange={setYouth} />
            <Stepper label="Niños" value={child} min={0} max={20} onChange={setChild} />
          </View>

          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.smallMuted}>{offerPricing.savings > 0 ? `Antes ${money(subtotal)}` : "Total"}</Text>
              <Text style={styles.checkoutTotal}>{money(totalPrice)}</Text>
            </View>
            <ActionButton label={bookingActionLabel} icon={bookingActionIcon} onPress={bookingActionPress} />
          </View>
        </View>
      </View>
      <CalendarPickerModal
        visible={calendarOpen}
        selectedDate={date}
        month={calendarMonth}
        locale={dateLocale}
        onMonthChange={setCalendarMonth}
        onClose={() => setCalendarOpen(false)}
        onSelect={(nextDate) => {
          setDate(nextDate);
          setDateConfirmed(true);
          setCalendarOpen(false);
          scrollToBookingForm();
        }}
      />
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
  const [availableLocations, setAvailableLocations] = useState<LocationSummary[]>(() => fallbackTransferLocations);
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
  const [quoteNotice, setQuoteNotice] = useState<string | null>(null);
  const [draftReady, setDraftReady] = useState(false);

  const roundTripMultiplier = tripType === "round-trip" ? 1.9 : 1;
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? vehicles[0] ?? null;
  const selectedPrice = selectedVehicle ? Math.round(selectedVehicle.price * roundTripMultiplier) : null;

  const routeSuggestions = useMemo(() => {
    const text = `${originQuery} ${destinationQuery}`.trim();
    const matches = text
      ? routes
          .map((route) => ({
            route,
            score:
              transferLocationScore(route.origin, text) +
              transferLocationScore(route.destination, text) +
              tokenMatchScore(normalizeLocationSearch(route.zoneLabel ?? ""), expandSearchTokens(searchTokens(text)))
          }))
          .filter((item) => item.score >= 7)
          .sort((a, b) => b.score - a.score)
          .map((item) => item.route)
      : routes;
    return matches.slice(0, 8);
  }, [destinationQuery, originQuery, routes]);

  useEffect(() => {
    let active = true;
    fetchMobileTransferRoutes()
      .then((items) => {
        if (!active || !items.length) return;
        setRoutes(items);
        setAvailableLocations((current) => mergeLocations(current, collectRouteLocations(items)));
      })
      .catch(() => undefined);
    fetchMobileTransferLocations()
      .then((items) => {
        if (active && items.length) setAvailableLocations((current) => mergeLocations(items, current));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    readStoredJson<TransferDraft>(transferDraftStorageKey)
      .then((draft) => {
        if (!active || !draft) return;
        setOriginQuery(draft.originQuery ?? "");
        setDestinationQuery(draft.destinationQuery ?? "");
        setOrigin(draft.origin ?? null);
        setDestination(draft.destination ?? null);
        setSelectedRouteId(draft.selectedRouteId ?? "");
        setPassengers(draft.passengers || 2);
        setTripType(draft.tripType === "round-trip" ? "round-trip" : "one-way");
        setDepartureDate(draft.departureDate || tomorrow());
        setDepartureTime(draft.departureTime || "10:00");
        setReturnDate(draft.returnDate ?? "");
        setReturnTime(draft.returnTime ?? "");
        setVehicles(Array.isArray(draft.vehicles) ? draft.vehicles : []);
        setSelectedVehicleId(draft.selectedVehicleId ?? null);
      })
      .finally(() => {
        if (active) setDraftReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    const hasDraft =
      Boolean(originQuery.trim()) ||
      Boolean(destinationQuery.trim()) ||
      Boolean(origin) ||
      Boolean(destination) ||
      vehicles.length > 0;

    if (!hasDraft) {
      void writeStoredJson(transferDraftStorageKey, null);
      return;
    }

    void writeStoredJson(transferDraftStorageKey, {
      originQuery,
      destinationQuery,
      origin,
      destination,
      selectedRouteId,
      passengers,
      tripType,
      departureDate,
      departureTime,
      returnDate,
      returnTime,
      savedAt: Date.now()
    } satisfies TransferDraft);
  }, [
    departureDate,
    departureTime,
    destination,
    destinationQuery,
    draftReady,
    origin,
    originQuery,
    passengers,
    returnDate,
    returnTime,
    selectedRouteId,
    tripType,
    vehicles.length
  ]);

  useEffect(() => {
    if (origin?.name === originQuery || originQuery.trim().length < 2) {
      setOriginOptions([]);
      setOriginLoading(false);
      setOriginSearchError(null);
      return;
    }
    const localMatches = transferLocationMatches(availableLocations, originQuery);
    setOriginOptions(localMatches);
    setOriginLoading(false);
    setOriginSearchError(null);
    if (!localMatches.length && originQuery.trim().length >= 3) {
      setOriginSearchError("No encontramos ese lugar exacto. Prueba con hotel, aeropuerto o zona cercana.");
    }
  }, [availableLocations, originQuery, origin?.name]);

  useEffect(() => {
    if (destination?.name === destinationQuery || destinationQuery.trim().length < 2) {
      setDestinationOptions([]);
      setDestinationLoading(false);
      setDestinationSearchError(null);
      return;
    }
    const localMatches = transferLocationMatches(availableLocations, destinationQuery);
    setDestinationOptions(localMatches);
    setDestinationLoading(false);
    setDestinationSearchError(null);
    if (!localMatches.length && destinationQuery.trim().length >= 3) {
      setDestinationSearchError("No encontramos ese lugar exacto. Prueba con hotel, aeropuerto o zona cercana.");
    }
  }, [availableLocations, destinationQuery, destination?.name]);

  const resetQuote = () => {
    setVehicles([]);
    setSelectedVehicleId(null);
    setQuoteError(null);
    setQuoteNotice(null);
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
    const resolvedOrigin = origin ?? transferLocationMatches(availableLocations, originQuery)[0] ?? null;
    const resolvedDestination = destination ?? transferLocationMatches(availableLocations, destinationQuery)[0] ?? null;

    if (!resolvedOrigin || !resolvedDestination) {
      setQuoteError("Busca y selecciona origen y destino desde la lista real.");
      return;
    }
    if (!origin) {
      setOrigin(resolvedOrigin);
      setOriginQuery(resolvedOrigin.name);
      setOriginOptions([]);
    }
    if (!destination) {
      setDestination(resolvedDestination);
      setDestinationQuery(resolvedDestination.name);
      setDestinationOptions([]);
    }
    if (resolvedOrigin.id === resolvedDestination.id) {
      setQuoteError("Origen y destino deben ser diferentes.");
      return;
    }
    const usesPopularShortcut = resolvedOrigin.id.startsWith("route-") || resolvedDestination.id.startsWith("route-");
    if (tripType === "round-trip" && (!returnDate || !returnTime)) {
      setQuoteError("Indica fecha y hora de regreso.");
      return;
    }
    setQuoteLoading(true);
    setQuoteError(null);
    setQuoteNotice(null);
    if (usesPopularShortcut) {
      const catalogVehicles = buildCatalogTransferVehicles(resolvedOrigin, resolvedDestination, passengers);
      if (catalogVehicles.length) {
        setVehicles(catalogVehicles);
        setSelectedVehicleId(catalogVehicles[0]?.id ?? null);
        setQuoteNotice("Tarifa real del catálogo Proactivitis cargada en la app. Puedes continuar al checkout con este precio.");
      } else {
        setVehicles([]);
        setSelectedVehicleId(null);
        setQuoteError("No hay vehículos disponibles para esa ruta.");
      }
      setQuoteLoading(false);
      return;
    }
    try {
      const data = await fetchTransferQuote({
        originId: resolvedOrigin.id,
        destinationId: resolvedDestination.id,
        passengers
      });
      setVehicles(data.vehicles);
      setSelectedVehicleId(data.vehicles[0]?.id ?? null);
      if (!data.vehicles.length) setQuoteError("No hay vehículos disponibles para ese grupo.");
    } catch (error) {
      const fallbackVehicles = buildCatalogTransferVehicles(resolvedOrigin, resolvedDestination, passengers);
      if (fallbackVehicles.length) {
        setVehicles(fallbackVehicles);
        setSelectedVehicleId(fallbackVehicles[0]?.id ?? null);
        setQuoteNotice(
          "Tarifa real del catálogo Proactivitis cargada en la app. Puedes continuar al checkout con este precio."
        );
      } else {
        setVehicles([]);
        setSelectedVehicleId(null);
        setQuoteError(error instanceof Error ? error.message : "No se pudo calcular la tarifa real.");
      }
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
      <ImageBackground source={transferHeroSource} style={styles.transferHero} imageStyle={styles.heroImage as StyleProp<ImageStyle>}>
        <View style={styles.heroOverlay} />
        <View style={styles.transferHeroContent}>
          <Text style={styles.eyebrow}>Traslados privados</Text>
          <Text style={styles.heroTitle}>Reserva tu traslado privado</Text>
          <Text style={styles.heroSubtitle}>
            Precio fijo, conductor confirmado y recogida en tu hotel o aeropuerto.
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
            <Text style={styles.transferSearchCopy}>Elige tu punto exacto de recogida.</Text>
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
          placeholder="Aeropuerto, hotel o zona"
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
          placeholder="Hotel, villa o zona"
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
        <TrustMiniList
          items={["Precio fijo sin sorpresas", "Conductor te espera con tu nombre", "Soporte por WhatsApp"]}
        />
        <ActionButton label={quoteLoading ? "Buscando..." : "Ver precio ahora"} icon={Search} onPress={quoteRoute} />
      </View>

      {quoteError ? (
        <View style={styles.errorPanel}>
          <Text style={styles.errorText}>{quoteError}</Text>
        </View>
      ) : null}

      {quoteNotice ? (
        <View style={[styles.noticePanel, styles.transferNoticePanel]}>
          <ShieldCheck size={20} color={colors.skyDark} />
          <View style={styles.flexText}>
            <Text style={styles.noticeTitle}>Cotización disponible</Text>
            <Text style={styles.noticeText}>{quoteNotice}</Text>
          </View>
        </View>
      ) : null}

      {vehicles.length ? (
        <View style={styles.resultsPanel}>
          <Text style={styles.sectionTitle}>Vehículos disponibles</Text>
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
  onSessionChange,
  onClose,
  onOpenProfile
}: {
  url: string;
  session: MobileSession | null;
  stripeReady: boolean;
  onSessionChange: (session: MobileSession | null) => void;
  onClose: () => void;
  onOpenProfile: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { initPaymentSheet, presentPaymentSheet, nativeStripeAvailable } = useAppStripe();
  const summary = useMemo(() => readCheckoutSummary(url), [url]);
  const nameParts = (session?.user.name ?? "").trim().split(/\s+/).filter(Boolean);
  const [firstName, setFirstName] = useState(nameParts[0] ?? "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" "));
  const [email, setEmail] = useState(session?.user.email ?? "");
  const [phone, setPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState(summary.destination ?? "");
  const [pickupSelected, setPickupSelected] = useState<LocationSummary | null>(null);
  const [pickupOptions, setPickupOptions] = useState<LocationSummary[]>([]);
  const [pickupLoading, setPickupLoading] = useState(false);
  const [pickupInfo, setPickupInfo] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    bookingId: string;
    orderCode?: string;
    ticketUrl?: string;
    eticketPdfUrl?: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    readStoredJson<CheckoutDraft>(checkoutDraftStorageKey)
      .then((draft) => {
        if (!active || !draft || draft.url !== url) return;
        setFirstName(draft.firstName ?? "");
        setLastName(draft.lastName ?? "");
        setEmail(draft.email ?? "");
        setPhone(draft.phone ?? "");
        setPickupLocation(draft.pickupLocation ?? "");
        setNotes(draft.notes ?? "");
      })
      .finally(() => {
        if (active) setDraftReady(true);
      });
    return () => {
      active = false;
    };
  }, [url]);

  useEffect(() => {
    if (!draftReady) return;
    const hasDraft =
      Boolean(firstName.trim()) ||
      Boolean(lastName.trim()) ||
      Boolean(email.trim()) ||
      Boolean(phone.trim()) ||
      Boolean(pickupLocation.trim()) ||
      Boolean(notes.trim());

    if (!hasDraft) {
      void writeStoredJson(checkoutDraftStorageKey, null);
      return;
    }

    void writeStoredJson(checkoutDraftStorageKey, {
      url,
      firstName,
      lastName,
      email,
      phone,
      pickupLocation,
      notes,
      savedAt: Date.now()
    } satisfies CheckoutDraft);
  }, [draftReady, email, firstName, lastName, notes, phone, pickupLocation, url]);

  useEffect(() => {
    if (summary.flowType !== "tour") {
      setPickupOptions([]);
      setPickupLoading(false);
      setPickupInfo(null);
      return;
    }

    const query = pickupLocation.trim();
    if (pickupSelected?.name === query) {
      setPickupOptions([]);
      setPickupLoading(false);
      setPickupInfo("Hotel seleccionado de la lista real.");
      return;
    }

    if (query.length < 2) {
      setPickupOptions([]);
      setPickupLoading(false);
      setPickupInfo(null);
      return;
    }

    let active = true;
    const timer = setTimeout(() => {
      setPickupLoading(true);
      fetchTransferLocations(query)
        .then((locations) => {
          if (!active) return;
          const matches = pickupHotelMatchesForTour(locations, query, summary.tourLocation);
          setPickupOptions(matches);
          setPickupInfo(
            matches.length
              ? "Selecciona un hotel de la lista o deja escrito tu punto de recogida."
              : "No lo vemos en la lista de hoteles de esta zona. Usaremos lo que escribiste como punto de recogida."
          );
        })
        .catch(() => {
          if (!active) return;
          setPickupOptions([]);
          setPickupInfo("No pudimos buscar hoteles ahora. Usaremos lo que escribiste como punto de recogida.");
        })
        .finally(() => {
          if (active) setPickupLoading(false);
        });
    }, 220);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [pickupLocation, pickupSelected?.name, summary.flowType, summary.tourLocation]);

  const validateCheckout = () => {
    const nextErrors: Record<string, string> = {};
    if (!firstName.trim()) nextErrors.firstName = "Indica el nombre.";
    if (!lastName.trim()) nextErrors.lastName = "Indica el apellido.";
    if (!email.trim() || !email.includes("@")) nextErrors.email = "Indica un email válido.";
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
      setFeedback("Stripe nativo no está disponible en la vista web. Usa checkout web o prueba en Android/iOS.");
      return;
    }
    if (!stripeReady) {
      setFeedback("Stripe aún no está configurado en esta build. Revisa NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.");
      return;
    }

    setPaymentLoading(true);
    setFeedback("Preparando pago seguro...");
    try {
      const intent = await createMobilePaymentIntent(buildPaymentPayload(), session?.token);
      if (!intent.clientSecret) {
        throw new Error("Stripe no devolvió client secret para abrir el pago.");
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

      const confirmed = await confirmMobileBooking({
        bookingId: intent.bookingId,
        paymentIntentId: intent.paymentIntentId,
        token: session?.token
      });
      if (confirmed.token && confirmed.user) {
        onSessionChange({ token: confirmed.token, user: confirmed.user });
      }
      setConfirmedBooking({
        bookingId: confirmed.bookingId ?? intent.bookingId,
        orderCode: confirmed.orderCode,
        ticketUrl: confirmed.ticketUrl,
        eticketPdfUrl: confirmed.eticketPdfUrl
      });
      void writeStoredJson(checkoutDraftStorageKey, null);
      void writeStoredJson(transferDraftStorageKey, null);
      setFeedback("Pago confirmado. Tu e-ticket fue enviado por correo y tu cuenta quedó lista en la app.");
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
      <ScrollView
        contentContainerStyle={[styles.checkoutContent, { paddingBottom: 64 + Math.max(insets.bottom, 14) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.checkoutHero}>
          <Text style={styles.eyebrowDark}>Reserva segura</Text>
          <Text style={styles.checkoutHeroTitle}>Confirma tu experiencia en minutos</Text>
          <Text style={styles.bodyText}>
            Revisa tu reserva, deja tus datos y paga seguro con Proactivitis.
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
          <InputField label="Teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>

        <View style={styles.formPanel}>
          <Text style={styles.sectionTitle}>Recogida y preferencias</Text>
          {summary.flowType === "tour" ? (
            <View style={styles.cardStack}>
              <LocationSearchInput
                label="Busca tu hotel o escribe un punto de recogida"
                icon={MapPin}
                value={pickupLocation}
                selected={pickupSelected}
                loading={pickupLoading}
                options={pickupOptions}
                placeholder="Ej: hotel, villa o punto de encuentro"
                onChange={(value) => {
                  setPickupLocation(value);
                  setPickupSelected(null);
                  setErrors((current) => {
                    const next = { ...current };
                    delete next.pickupLocation;
                    return next;
                  });
                }}
                onSelect={(location) => {
                  setPickupSelected(location);
                  setPickupLocation(location.name);
                  setPickupOptions([]);
                  setPickupInfo("Hotel seleccionado de la lista real.");
                  setErrors((current) => {
                    const next = { ...current };
                    delete next.pickupLocation;
                    return next;
                  });
                }}
                error={errors.pickupLocation}
              />
              {pickupInfo ? <Text style={styles.pickupHelperText}>{pickupInfo}</Text> : null}
            </View>
          ) : (
            <InputField
              label="Punto principal"
              value={pickupLocation}
              onChangeText={setPickupLocation}
              error={errors.pickupLocation}
            />
          )}
          <InputField label="Notas especiales" value={notes} onChangeText={setNotes} multiline />
        </View>

        <View style={styles.payPanel}>
          <View style={styles.checkoutSecureNote}>
            <ShieldCheck size={18} color={colors.skySoft} />
            <Text style={styles.checkoutSecureText}>Pago protegido por Stripe y confirmación por Proactivitis.</Text>
          </View>
          <TrustMiniList
            dark
            items={["Pago seguro con Stripe", "Confirmación por WhatsApp", "Soporte antes y después de reservar"]}
          />
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.checkoutPayLabel}>Total a pagar</Text>
              <Text style={styles.checkoutTotal}>{money(summary.totalPrice)}</Text>
            </View>
            <ActionButton label={paymentLoading ? "Procesando..." : "Pagar seguro con Stripe"} icon={CreditCard} onPress={continueToPay} />
          </View>
          <ActionButton
            label="Pagar en navegador"
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
          {confirmedBooking ? (
            <View style={styles.confirmedActions}>
              <View style={styles.confirmedBadge}>
                <CheckCircle2 size={18} color={colors.green} />
                <Text style={styles.confirmedText}>
                  {confirmedBooking.orderCode ? `Reserva ${confirmedBooking.orderCode}` : "Reserva confirmada"}
                </Text>
              </View>
              <ActionButton
                label="Ver e-ticket"
                icon={CalendarCheck}
                variant="outlineDark"
                onPress={() => openUrl(confirmedBooking.ticketUrl ?? confirmedBooking.eticketPdfUrl ?? customerUrl("/customer/reservations"))}
              />
              <ActionButton label="Ir a mi cuenta" icon={User} variant="outlineDark" onPress={onOpenProfile} />
            </View>
          ) : null}
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
              <Text style={styles.cityCardTitle}>Ver todo el catálogo</Text>
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
        description="Tours filtrados por ciudad. Puedes reservar el tour o cotizar transfer para llegar cómodo."
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
          <Text style={styles.smallMuted}>Prueba otra zona o revisa el catálogo completo.</Text>
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

const bookingStatusLabel = (status?: string | null) => {
  if (status === "COMPLETED") return "Completada";
  if (status === "CANCELLED") return "Cancelada";
  if (status === "PENDING") return "Pendiente";
  return "Confirmada";
};

function CustomerStat({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string | number;
  icon: IconType;
}) {
  return (
    <View style={styles.customerStat}>
      <Icon size={16} color={colors.skyDark} />
      <Text style={styles.customerStatValue}>{value}</Text>
      <Text style={styles.customerStatLabel}>{label}</Text>
    </View>
  );
}

function CustomerHubRow({
  icon: Icon,
  title,
  subtitle,
  onPress,
  active = false
}: {
  icon: IconType;
  title: string;
  subtitle: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Pressable style={[styles.customerHubRow, active ? styles.customerHubRowActive : null]} onPress={onPress}>
      <View style={[styles.customerHubIcon, active ? styles.customerHubIconActive : null]}>
        <Icon size={17} color={active ? colors.white : colors.skyDark} />
      </View>
      <View style={styles.flexText}>
        <Text style={styles.customerHubRowTitle}>{title}</Text>
        <Text style={styles.customerHubRowText} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

function CustomerAccountHub({
  summary,
  loading,
  error,
  activeSection,
  onSectionChange,
  onRefresh
}: {
  summary: MobileCustomerSummary | null;
  loading: boolean;
  error: string | null;
  activeSection: CustomerPanelSection;
  onSectionChange: (section: CustomerPanelSection) => void;
  onRefresh: () => void;
}) {
  const t = useTranslate();
  const tr = (value: string) => t(value) || value;

  if (loading && !summary) {
    return (
      <View style={styles.formPanel}>
        <Text style={styles.sectionTitle}>Centro de cliente</Text>
        <Text style={styles.smallMuted}>Cargando tus reservas, pagos y notificaciones...</Text>
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.formPanel}>
        <Text style={styles.sectionTitle}>Centro de cliente</Text>
        <Text style={styles.smallMuted}>{error || "No pudimos cargar tu cuenta ahora mismo."}</Text>
        <ActionButton label="Intentar de nuevo" icon={Compass} variant="outlineDark" onPress={onRefresh} />
      </View>
    );
  }

  const latestBooking = summary.bookings[0] ?? null;
  const latestNotification = summary.notifications[0] ?? null;
  const paymentLabel =
    summary.payment?.hasSavedMethod && summary.payment.last4
      ? `${summary.payment.brand || tr("Tarjeta")} **** ${summary.payment.last4}`
      : tr("Agrega una tarjeta para reservar mas rapido");
  const preferenceLabel = summary.preference?.completedAt
    ? [
        ...summary.preference.preferredDestinations.slice(0, 2),
        ...summary.preference.preferredProductTypes.slice(0, 1)
      ]
        .filter(Boolean)
        .join(", ") || tr("Preferencias guardadas")
    : tr("Completa tus gustos de viaje");

  return (
    <View style={styles.formPanel}>
      <View style={styles.rowBetween}>
        <View style={styles.flexText}>
          <Text style={styles.sectionTitle}>Centro de cliente</Text>
          <Text style={styles.smallMuted}>Reservas, pagos, reseñas y avisos de tu cuenta.</Text>
        </View>
        {summary.metrics.unreadNotifications ? (
          <View style={styles.customerBadge}>
            <Text style={styles.customerBadgeText}>{summary.metrics.unreadNotifications}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.customerStatsGrid}>
        <CustomerStat label="Próximas" value={summary.metrics.upcoming} icon={CalendarCheck} />
        <CustomerStat label="Completadas" value={summary.metrics.completed} icon={CheckCircle2} />
        <CustomerStat label="Reseñas" value={summary.metrics.pendingReviews} icon={Star} />
        <CustomerStat label="Pagos registrados" value={money(summary.metrics.totalPaid)} icon={CreditCard} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.customerPanelTabs}>
        {customerPanelSections.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.key;
          return (
            <Pressable
              key={item.key}
              style={[styles.customerPanelTab, active ? styles.customerPanelTabActive : null]}
              onPress={() => onSectionChange(item.key)}
            >
              <Icon size={14} color={active ? colors.white : colors.skyDark} />
              <Text style={[styles.customerPanelTabText, active ? styles.customerPanelTabTextActive : null]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.customerFocusBox}>
        <Text style={styles.customerFocusLabel}>Próxima actividad</Text>
        {latestBooking ? (
          <>
            <Text style={styles.customerFocusTitle} numberOfLines={2}>{latestBooking.title}</Text>
            <Text style={styles.customerFocusText}>
              {tr(bookingStatusLabel(latestBooking.status))} | {shortDate(latestBooking.travelDate)} | {money(latestBooking.totalAmount)}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.customerFocusTitle}>Sin reservas todavía</Text>
            <Text style={styles.customerFocusText}>Cuando reserves, tu historial aparecerá aquí.</Text>
          </>
        )}
      </View>

      <View style={styles.customerHubRows}>
        <CustomerHubRow
          icon={CalendarCheck}
          title="Mis reservas"
          subtitle={latestBooking ? `${summary.metrics.totalBookings} ${tr("reservas en tu historial")}` : "Aún no tienes reservas registradas"}
          active={activeSection === "bookings"}
          onPress={() => onSectionChange("bookings")}
        />
        <CustomerHubRow
          icon={CreditCard}
          title="Tarjetas guardadas"
          subtitle={paymentLabel}
          active={activeSection === "payments"}
          onPress={() => onSectionChange("payments")}
        />
        <CustomerHubRow
          icon={Star}
          title="Reseñas pendientes"
          subtitle={
            summary.pendingReviews[0]
              ? `${tr("Comparte tu experiencia en")} ${summary.pendingReviews[0].title}`
              : "Cuando completes un tour o traslado podrás dejar tu opinión"
          }
          active={activeSection === "reviews"}
          onPress={() => onSectionChange("reviews")}
        />
        <CustomerHubRow
          icon={User}
          title="Datos y preferencias"
          subtitle={preferenceLabel}
          active={activeSection === "preferences" || activeSection === "account"}
          onPress={() => onSectionChange("preferences")}
        />
      </View>

      {latestNotification ? (
        <View style={styles.customerNotice}>
          <Text style={styles.customerFocusLabel}>Último aviso</Text>
          <Text style={styles.customerHubRowTitle}>{latestNotification.title}</Text>
          {latestNotification.message ? (
            <Text style={styles.customerHubRowText} numberOfLines={2}>{latestNotification.message}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const paymentStatusLabel = (status?: string | null) => {
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "paid" || normalized === "succeeded") return "Pagado";
  if (normalized.includes("pending") || normalized.includes("requires")) return "Pendiente de pago";
  return status || "Por confirmar";
};

function NativeBookingCard({
  booking,
  pendingReview,
  onReview
}: {
  booking: MobileCustomerSummary["bookings"][number];
  pendingReview: boolean;
  onReview: () => void;
}) {
  const image = booking.tourImage ? absoluteImageUrl(booking.tourImage) : null;
  const pickup = booking.hotel || booking.pickup || booking.originAirport || "Punto por confirmar";
  return (
    <View style={styles.nativeBookingCard}>
      {image ? <RemoteImage uri={image} style={styles.nativeBookingImage} /> : null}
      <View style={styles.nativeBookingBody}>
        <View style={styles.rowBetween}>
          <Text style={styles.customerFocusLabel}>{booking.flowType === "transfer" ? "Transfer" : "Tour"}</Text>
          <Text style={styles.nativeStatusPill}>{bookingStatusLabel(booking.status)}</Text>
        </View>
        <Text style={styles.nativeBookingTitle} numberOfLines={2}>{booking.title}</Text>
        <Text style={styles.customerHubRowText}>
          {shortDate(booking.travelDate)}{booking.startTime ? ` | ${booking.startTime}` : ""} | {booking.passengers ?? 1} pax
        </Text>
        <Text style={styles.customerHubRowText}>Recogida: {pickup}</Text>
        <Text style={styles.customerHubRowText}>Pago: {paymentStatusLabel(booking.paymentStatus)} | {money(booking.totalAmount)}</Text>
        {booking.bookingCode ? <Text style={styles.nativeCode}>Código {booking.bookingCode}</Text> : null}
        <View style={styles.nativeActionsRow}>
          <Pressable style={styles.nativeSmallButton} onPress={() => openUrl(customerUrl(`/booking/confirmed/${booking.id}`))}>
            <Text style={styles.nativeSmallButtonText}>E-ticket</Text>
          </Pressable>
          <Pressable style={styles.nativeSmallButton} onPress={() => openUrl(customerUrl(`/api/bookings/${booking.id}/eticket`))}>
            <Text style={styles.nativeSmallButtonText}>PDF</Text>
          </Pressable>
          {pendingReview ? (
            <Pressable style={styles.nativeSmallButtonDark} onPress={onReview}>
              <Text style={styles.nativeSmallButtonDarkText}>Reseñar</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function NativeBookingsPanel({
  summary,
  onReview
}: {
  summary: MobileCustomerSummary;
  onReview: (bookingId: string) => void;
}) {
  const pendingIds = new Set(summary.pendingReviews.map((item) => item.bookingId));
  return (
    <View style={styles.formPanel}>
      <Text style={styles.sectionTitle}>Mis reservas</Text>
      <Text style={styles.smallMuted}>Historial real de reservas, e-tickets y datos de recogida.</Text>
      {summary.bookings.length ? (
        summary.bookings.map((booking) => (
          <NativeBookingCard
            key={booking.id}
            booking={booking}
            pendingReview={pendingIds.has(booking.id)}
            onReview={() => onReview(booking.id)}
          />
        ))
      ) : (
        <Text style={styles.smallMuted}>Aún no tienes reservas. Cuando compres un tour o transfer aparecerá aquí.</Text>
      )}
    </View>
  );
}

function NativeOverviewPanel({
  summary,
  onSectionChange
}: {
  summary: MobileCustomerSummary;
  onSectionChange: (section: CustomerPanelSection) => void;
}) {
  const latestBooking = summary.bookings[0] ?? null;
  return (
    <View style={styles.formPanel}>
      <Text style={styles.sectionTitle}>Panel nativo</Text>
      <Text style={styles.smallMuted}>Todo lo importante de tu cuenta queda disponible dentro de la app.</Text>
      <View style={styles.customerHubRows}>
        <CustomerHubRow
          icon={CalendarCheck}
          title={latestBooking ? latestBooking.title : "Reservas y e-tickets"}
          subtitle={latestBooking ? `${shortDate(latestBooking.travelDate)} | ${money(latestBooking.totalAmount)}` : "Aquí verás tus próximos planes y comprobantes."}
          onPress={() => onSectionChange("bookings")}
        />
        <CustomerHubRow
          icon={CreditCard}
          title="Pago rapido"
          subtitle={summary.payment?.hasSavedMethod ? "Tienes una tarjeta lista para futuras reservas." : "Guarda una tarjeta segura con Stripe."}
          onPress={() => onSectionChange("payments")}
        />
        <CustomerHubRow
          icon={Mail}
          title="Avisos"
          subtitle={summary.metrics.unreadNotifications ? `${summary.metrics.unreadNotifications} avisos sin leer` : "Todo al dia por ahora."}
          onPress={() => onSectionChange("notifications")}
        />
      </View>
    </View>
  );
}

function NativePaymentsPanel({
  summary,
  saving,
  feedback,
  onSavePayment
}: {
  summary: MobileCustomerSummary;
  saving: boolean;
  feedback: string | null;
  onSavePayment: () => void;
}) {
  const payment = summary.payment;
  const savedLabel = payment?.hasSavedMethod && payment.last4
    ? `${payment.brand ?? "Tarjeta"} terminada en ${payment.last4}`
    : "No tienes una tarjeta guardada.";

  return (
    <View style={styles.formPanel}>
      <Text style={styles.sectionTitle}>Pagos</Text>
      <Text style={styles.smallMuted}>Guarda una tarjeta con Stripe para reservar mas rapido en la app.</Text>
      <View style={styles.nativePaymentCard}>
        <CreditCard size={22} color={colors.white} />
        <View style={styles.flexText}>
          <Text style={styles.nativePaymentTitle}>{savedLabel}</Text>
          <Text style={styles.customerFocusText}>Stripe protege los datos de la tarjeta. Proactivitis no guarda el numero completo.</Text>
        </View>
      </View>
      <ActionButton label={saving ? "Abriendo Stripe..." : "Guardar o cambiar tarjeta"} icon={CreditCard} onPress={onSavePayment} />
      {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}
    </View>
  );
}

function NativeReviewsPanel({
  summary,
  activeBookingId,
  rating,
  title,
  body,
  feedback,
  submitting,
  onPickBooking,
  onRating,
  onTitle,
  onBody,
  onSubmit
}: {
  summary: MobileCustomerSummary;
  activeBookingId: string | null;
  rating: number;
  title: string;
  body: string;
  feedback: string | null;
  submitting: boolean;
  onPickBooking: (bookingId: string) => void;
  onRating: (rating: number) => void;
  onTitle: (title: string) => void;
  onBody: (body: string) => void;
  onSubmit: () => void;
}) {
  const activeReview = summary.pendingReviews.find((item) => item.bookingId === activeBookingId) ?? summary.pendingReviews[0] ?? null;

  return (
    <View style={styles.formPanel}>
      <Text style={styles.sectionTitle}>Resenas</Text>
      <Text style={styles.smallMuted}>Cuando termines una experiencia puedes dejar tu opinion sin salir de la app.</Text>
      {summary.pendingReviews.length ? (
        <>
          <View style={styles.customerHubRows}>
            {summary.pendingReviews.map((item) => (
              <Pressable
                key={item.bookingId}
                style={[styles.nativeReviewChoice, activeReview?.bookingId === item.bookingId ? styles.nativeReviewChoiceActive : null]}
                onPress={() => onPickBooking(item.bookingId)}
              >
                <Text style={styles.customerHubRowTitle}>{item.title}</Text>
                <Text style={styles.customerHubRowText}>{shortDate(item.travelDate)}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.nativeStarsRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable key={value} onPress={() => onRating(value)}>
                <Star size={30} color={colors.amberDark} fill={value <= rating ? colors.amberDark : "transparent"} />
              </Pressable>
            ))}
          </View>
          <InputField label="Titulo corto" value={title} onChangeText={onTitle} placeholder="Ej. Servicio excelente" />
          <InputField label="Tu experiencia" value={body} onChangeText={onBody} placeholder="Cuenta que te gusto y que puede ayudar a otros viajeros." multiline />
          <ActionButton label={submitting ? "Enviando..." : "Enviar reseña"} icon={Star} onPress={onSubmit} />
          {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}
        </>
      ) : (
        <View style={styles.customerNotice}>
          <Text style={styles.customerHubRowTitle}>No tienes reseñas pendientes</Text>
          <Text style={styles.customerHubRowText}>Después de completar un tour o transfer, la app te activará el formulario aquí.</Text>
        </View>
      )}
    </View>
  );
}

function NativePreferencesPanel({
  destinations,
  productTypes,
  consentMarketing,
  saving,
  feedback,
  onToggleDestination,
  onToggleProductType,
  onToggleMarketing,
  onSave
}: {
  destinations: string[];
  productTypes: string[];
  consentMarketing: boolean;
  saving: boolean;
  feedback: string | null;
  onToggleDestination: (value: string) => void;
  onToggleProductType: (value: string) => void;
  onToggleMarketing: () => void;
  onSave: () => void;
}) {
  return (
    <View style={styles.formPanel}>
      <Text style={styles.sectionTitle}>Gustos de viaje</Text>
      <Text style={styles.smallMuted}>Esto alimenta recomendaciones, ofertas y experiencias dentro de la app.</Text>
      <Text style={styles.fieldLabel}>Zonas favoritas</Text>
      <View style={styles.nativeChipWrap}>
        {preferenceDestinationOptions.map((item) => (
          <Chip key={item} label={item} active={destinations.includes(item)} onPress={() => onToggleDestination(item)} />
        ))}
      </View>
      <Text style={styles.fieldLabel}>Tipo de experiencia</Text>
      <View style={styles.nativeChipWrap}>
        {preferenceProductOptions.map((item) => (
          <Chip key={item} label={item} active={productTypes.includes(item)} onPress={() => onToggleProductType(item)} />
        ))}
      </View>
      <Pressable style={styles.nativeToggleRow} onPress={onToggleMarketing}>
        <View style={[styles.nativeToggleDot, consentMarketing ? styles.nativeToggleDotActive : null]} />
        <View style={styles.flexText}>
          <Text style={styles.customerHubRowTitle}>Recibir ofertas y avisos utiles</Text>
          <Text style={styles.customerHubRowText}>Promociones reales, recordatorios y novedades importantes.</Text>
        </View>
      </Pressable>
      <ActionButton label={saving ? "Guardando..." : "Guardar preferencias"} icon={Heart} onPress={onSave} />
      {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}
    </View>
  );
}

function NativeNotificationsPanel({
  summary,
  saving,
  onRead
}: {
  summary: MobileCustomerSummary;
  saving: boolean;
  onRead: (notificationId?: string) => void;
}) {
  return (
    <View style={styles.formPanel}>
      <View style={styles.rowBetween}>
        <View style={styles.flexText}>
          <Text style={styles.sectionTitle}>Avisos</Text>
          <Text style={styles.smallMuted}>Confirmaciones, cambios y mensajes importantes.</Text>
        </View>
        {summary.notifications.length ? (
          <Pressable style={styles.nativeSmallButton} onPress={() => onRead()}>
            <Text style={styles.nativeSmallButtonText}>{saving ? "..." : "Leer todo"}</Text>
          </Pressable>
        ) : null}
      </View>
      {summary.notifications.length ? (
        summary.notifications.map((notification) => (
          <Pressable
            key={notification.id}
            style={[styles.nativeNotification, notification.isRead ? null : styles.nativeNotificationUnread]}
            onPress={() => onRead(notification.id)}
          >
            <View style={styles.rowBetween}>
              <Text style={styles.customerHubRowTitle}>{notification.title}</Text>
              {!notification.isRead ? <View style={styles.nativeUnreadDot} /> : null}
            </View>
            {notification.message ? <Text style={styles.customerHubRowText}>{notification.message}</Text> : null}
            <Text style={styles.customerFocusLabel}>{shortDate(notification.createdAt)}</Text>
          </Pressable>
        ))
      ) : (
        <Text style={styles.smallMuted}>No tienes avisos por ahora.</Text>
      )}
    </View>
  );
}

function NativeAccountPanel({
  name,
  email,
  language,
  deleteFeedback,
  deletingAccount,
  savingProfile,
  profileFeedback,
  onName,
  onLanguage,
  onSaveProfile,
  onDeleteAccount
}: {
  name: string;
  email: string;
  language: AppLanguage;
  deleteFeedback: string | null;
  deletingAccount: boolean;
  savingProfile: boolean;
  profileFeedback: string | null;
  onName: (value: string) => void;
  onLanguage: (language: AppLanguage) => void;
  onSaveProfile: () => void;
  onDeleteAccount: () => void;
}) {
  return (
    <View style={styles.formPanel}>
      <Text style={styles.sectionTitle}>Cuenta</Text>
      <Text style={styles.smallMuted}>Tu información básica, idioma y control de datos.</Text>
      <InputField label="Nombre" value={name} onChangeText={onName} />
      <InputField label="Email" value={email} onChangeText={() => undefined} editable={false} />
      <ActionButton label={savingProfile ? "Guardando..." : "Guardar nombre"} icon={User} onPress={onSaveProfile} />
      {profileFeedback ? <Text style={styles.feedbackText}>{profileFeedback}</Text> : null}
      <View style={styles.formDivider}>
        <View style={styles.formDividerLine} />
        <Text style={styles.formDividerText}>Idioma</Text>
        <View style={styles.formDividerLine} />
      </View>
      <LanguageSelector selected={language} onSelect={onLanguage} />
      <View style={styles.formDivider}>
        <View style={styles.formDividerLine} />
        <Text style={styles.formDividerText}>Datos</Text>
        <View style={styles.formDividerLine} />
      </View>
      <ActionButton label={deletingAccount ? "Eliminando..." : "Eliminar cuenta"} icon={User} variant="outlineDark" onPress={onDeleteAccount} />
      <ActionButton label="Página web de eliminación" icon={ShieldCheck} variant="outlineDark" onPress={() => openUrl(links.accountDeletion)} />
      {deleteFeedback ? <Text style={styles.feedbackText}>{deleteFeedback}</Text> : null}
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
  const { language, setLanguage } = useLanguage();
  const tr = useTranslate();
  const { initPaymentSheet, presentPaymentSheet, nativeStripeAvailable } = useAppStripe();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [deleteFeedback, setDeleteFeedback] = useState<string | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [customerSummary, setCustomerSummary] = useState<MobileCustomerSummary | null>(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [activeCustomerSection, setActiveCustomerSection] = useState<CustomerPanelSection>("overview");
  const [profileName, setProfileName] = useState(session?.user.name ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentFeedback, setPaymentFeedback] = useState<string | null>(null);
  const [preferenceDestinations, setPreferenceDestinations] = useState<string[]>([]);
  const [preferenceProductTypes, setPreferenceProductTypes] = useState<string[]>([]);
  const [preferenceMarketing, setPreferenceMarketing] = useState(false);
  const [preferenceSaving, setPreferenceSaving] = useState(false);
  const [preferenceFeedback, setPreferenceFeedback] = useState<string | null>(null);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);
  const [notificationSaving, setNotificationSaving] = useState(false);

  const refreshCustomerSummary = useCallback(() => {
    if (!session?.token) {
      setCustomerSummary(null);
      setCustomerError(null);
      setCustomerLoading(false);
      return;
    }

    setCustomerLoading(true);
    setCustomerError(null);
    return fetchMobileCustomerSummary(session.token)
      .then((summary) => {
        setCustomerSummary(summary);
      })
      .catch((error) => {
        setCustomerError(error instanceof Error ? error.message : "No se pudo cargar tu cuenta.");
      })
      .finally(() => {
        setCustomerLoading(false);
      });
  }, [session?.token]);

  useEffect(() => {
    void refreshCustomerSummary();
  }, [refreshCustomerSummary]);

  useEffect(() => {
    setProfileName(session?.user.name ?? "");
  }, [session?.user.name]);

  const preferenceDestinationKey = JSON.stringify(customerSummary?.preference?.preferredDestinations ?? []);
  const preferenceProductKey = JSON.stringify(customerSummary?.preference?.preferredProductTypes ?? []);

  useEffect(() => {
    setPreferenceDestinations(customerSummary?.preference?.preferredDestinations ?? []);
    setPreferenceProductTypes(customerSummary?.preference?.preferredProductTypes ?? []);
    setPreferenceMarketing(Boolean(customerSummary?.preference?.consentMarketing));
  }, [customerSummary?.preference?.consentMarketing, preferenceDestinationKey, preferenceProductKey]);

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

  const openGoogleLogin = async () => {
    setFeedback("Abriendo Google...");
    try {
      await Linking.openURL(googleLoginUrl());
      setFeedback("Vuelve a la app cuando Google termine.");
    } catch {
      setFeedback("No se pudo abrir Google.");
    }
  };

  const confirmDeleteAccount = () => {
    if (!session?.token || deletingAccount) return;
    Alert.alert(
      tr("Eliminar cuenta") ?? "Eliminar cuenta",
      tr("Se cerrará tu cuenta de cliente, sesiones, preferencias y métodos de pago guardados. Podemos retener registros de reservas y pagos cuando sea necesario.") ??
        "Se cerrará tu cuenta de cliente, sesiones, preferencias y métodos de pago guardados. Podemos retener registros de reservas y pagos cuando sea necesario.",
      [
        { text: tr("Cancelar") ?? "Cancelar", style: "cancel" },
        {
          text: tr("Eliminar") ?? "Eliminar",
          style: "destructive",
          onPress: () => {
            setDeletingAccount(true);
            setDeleteFeedback("Procesando eliminación...");
            deleteMobileAccount(session.token)
              .then(() => {
                void writeStoredJson(checkoutDraftStorageKey, null);
                void writeStoredJson(transferDraftStorageKey, null);
                onSessionChange(null);
              })
              .catch((error) => {
                setDeleteFeedback(error instanceof Error ? error.message : "No se pudo eliminar la cuenta.");
              })
              .finally(() => setDeletingAccount(false));
          }
        }
      ]
    );
  };

  const toggleListValue = (value: string, list: string[], setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const saveProfile = async () => {
    if (!session?.token || profileSaving) return;
    setProfileSaving(true);
    setProfileFeedback("Guardando perfil...");
    try {
      const updated = await updateMobileCustomerProfile({ token: session.token, name: profileName });
      onSessionChange({ ...session, user: updated.user });
      setProfileFeedback("Perfil actualizado.");
      void refreshCustomerSummary();
    } catch (error) {
      setProfileFeedback(error instanceof Error ? error.message : "No se pudo actualizar tu perfil.");
    } finally {
      setProfileSaving(false);
    }
  };

  const savePreferences = async () => {
    if (!session?.token || preferenceSaving) return;
    setPreferenceSaving(true);
    setPreferenceFeedback("Guardando preferencias...");
    try {
      await saveMobileCustomerPreferences({
        token: session.token,
        destinations: preferenceDestinations,
        productTypes: preferenceProductTypes,
        consentMarketing: preferenceMarketing
      });
      setPreferenceFeedback("Preferencias guardadas.");
      void refreshCustomerSummary();
    } catch (error) {
      setPreferenceFeedback(error instanceof Error ? error.message : "No se pudieron guardar tus preferencias.");
    } finally {
      setPreferenceSaving(false);
    }
  };

  const savePaymentMethod = async () => {
    if (!session?.token || paymentSaving) return;
    if (!nativeStripeAvailable) {
      setPaymentFeedback("Stripe nativo no está disponible en esta vista. Pruébalo en Android.");
      return;
    }

    setPaymentSaving(true);
    setPaymentFeedback("Preparando tarjeta segura...");
    try {
      const setup = await createMobileCustomerSetupIntent(session.token);
      if (!setup.clientSecret) throw new Error("Stripe no devolvió client secret.");
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "Proactivitis",
        setupIntentClientSecret: setup.clientSecret,
        allowsDelayedPaymentMethods: false,
        returnURL: "proactivitis://stripe-redirect"
      });
      if (initError) throw new Error(initError.message ?? "No se pudo abrir Stripe.");
      const { error: presentError } = await presentPaymentSheet();
      if (presentError) throw new Error(presentError.message ?? "La tarjeta no fue confirmada.");
      await saveMobileCustomerPayment({
        token: session.token,
        setupIntentId: setupIntentIdFromClientSecret(setup.clientSecret)
      });
      setPaymentFeedback("Tarjeta guardada correctamente.");
      void refreshCustomerSummary();
    } catch (error) {
      setPaymentFeedback(error instanceof Error ? error.message : "No se pudo guardar la tarjeta.");
    } finally {
      setPaymentSaving(false);
    }
  };

  const openReviewForBooking = (bookingId: string) => {
    setReviewBookingId(bookingId);
    setActiveCustomerSection("reviews");
  };

  const submitReview = async () => {
    const bookingId = reviewBookingId ?? customerSummary?.pendingReviews[0]?.bookingId ?? null;
    if (!session?.token || !bookingId || reviewSubmitting) return;
    setReviewSubmitting(true);
    setReviewFeedback("Enviando reseña...");
    try {
      await submitMobileCustomerReview({
        token: session.token,
        bookingId,
        rating: reviewRating,
        title: reviewTitle,
        body: reviewBody,
        locale: language
      });
      setReviewFeedback("Gracias. Tu reseña quedó enviada para revisión.");
      setReviewBookingId(null);
      setReviewRating(5);
      setReviewTitle("");
      setReviewBody("");
      void refreshCustomerSummary();
    } catch (error) {
      setReviewFeedback(error instanceof Error ? error.message : "No se pudo enviar tu reseña.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const markNotificationRead = async (notificationId?: string) => {
    if (!session?.token || notificationSaving) return;
    setNotificationSaving(true);
    try {
      await markMobileNotificationsRead({ token: session.token, notificationId });
      void refreshCustomerSummary();
    } catch {
      setCustomerError("No se pudo actualizar avisos.");
    } finally {
      setNotificationSaving(false);
    }
  };

  if (session) {
    return (
      <View style={styles.screen}>
        <ScreenHeader eyebrow="Cuenta" title="Tu perfil de viaje" description="Tus reservas, favoritos y preferencias quedan guardados en tu cuenta." />
        <View style={styles.savedCard}>
          <User size={28} color={colors.skyDark} />
          <Text style={styles.savedTitle}>{session.user.name || "Cliente Proactivitis"}</Text>
          <Text style={styles.smallMuted}>{session.user.email}</Text>
          <Text style={styles.smallMuted}>{appBuildLabel}</Text>
          <ActionButton label="Cerrar sesión" icon={User} variant="outlineDark" onPress={() => onSessionChange(null)} />
        </View>
        <CustomerAccountHub
          summary={customerSummary}
          loading={customerLoading}
          error={customerError}
          activeSection={activeCustomerSection}
          onSectionChange={setActiveCustomerSection}
          onRefresh={() => void refreshCustomerSummary()}
        />
        {customerSummary ? (
          <>
            {activeCustomerSection === "overview" ? (
              <NativeOverviewPanel summary={customerSummary} onSectionChange={setActiveCustomerSection} />
            ) : null}
            {activeCustomerSection === "bookings" ? (
              <NativeBookingsPanel summary={customerSummary} onReview={openReviewForBooking} />
            ) : null}
            {activeCustomerSection === "payments" ? (
              <NativePaymentsPanel
                summary={customerSummary}
                saving={paymentSaving}
                feedback={paymentFeedback}
                onSavePayment={savePaymentMethod}
              />
            ) : null}
            {activeCustomerSection === "reviews" ? (
              <NativeReviewsPanel
                summary={customerSummary}
                activeBookingId={reviewBookingId}
                rating={reviewRating}
                title={reviewTitle}
                body={reviewBody}
                feedback={reviewFeedback}
                submitting={reviewSubmitting}
                onPickBooking={setReviewBookingId}
                onRating={setReviewRating}
                onTitle={setReviewTitle}
                onBody={setReviewBody}
                onSubmit={submitReview}
              />
            ) : null}
            {activeCustomerSection === "preferences" ? (
              <NativePreferencesPanel
                destinations={preferenceDestinations}
                productTypes={preferenceProductTypes}
                consentMarketing={preferenceMarketing}
                saving={preferenceSaving}
                feedback={preferenceFeedback}
                onToggleDestination={(value) => toggleListValue(value, preferenceDestinations, setPreferenceDestinations)}
                onToggleProductType={(value) => toggleListValue(value, preferenceProductTypes, setPreferenceProductTypes)}
                onToggleMarketing={() => setPreferenceMarketing((current) => !current)}
                onSave={savePreferences}
              />
            ) : null}
            {activeCustomerSection === "notifications" ? (
              <NativeNotificationsPanel
                summary={customerSummary}
                saving={notificationSaving}
                onRead={markNotificationRead}
              />
            ) : null}
            {activeCustomerSection === "account" ? (
              <NativeAccountPanel
                name={profileName}
                email={session.user.email}
                language={language}
                deleteFeedback={deleteFeedback}
                deletingAccount={deletingAccount}
                savingProfile={profileSaving}
                profileFeedback={profileFeedback}
                onName={setProfileName}
                onLanguage={setLanguage}
                onSaveProfile={saveProfile}
                onDeleteAccount={confirmDeleteAccount}
              />
            ) : null}
          </>
        ) : null}
        <ContactPanel />
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
      <ScreenHeader eyebrow="Cuenta" title="Accede a tus reservas" description="Inicia sesión para guardar tus datos, revisar planes y continuar reservas desde cualquier dispositivo." />
      <View style={styles.formPanel}>
        <GoogleLoginButton onPress={openGoogleLogin} />
        <View style={styles.formDivider}>
          <View style={styles.formDividerLine} />
          <Text style={styles.formDividerText}>O usa email</Text>
          <View style={styles.formDividerLine} />
        </View>
        <View style={styles.segmentRow}>
          <SegmentButton label="Entrar" active={mode === "login"} onPress={() => setMode("login")} />
          <SegmentButton label="Crear cuenta" active={mode === "register"} onPress={() => setMode("register")} />
        </View>
        {mode === "register" ? <InputField label="Nombre" value={name} onChangeText={setName} /> : null}
        <InputField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <InputField label="Contrasena" value={password} onChangeText={setPassword} secureTextEntry />
        <ActionButton label={mode === "login" ? "Entrar" : "Crear cuenta"} icon={LogIn} onPress={submit} />
        {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}
      </View>
      <View style={styles.formPanel}>
        <Text style={styles.sectionTitle}>Idioma de la app</Text>
        <Text style={styles.smallMuted}>La app recordara tu preferencia para futuras visitas.</Text>
        <LanguageSelector selected={language} onSelect={setLanguage} />
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
      <ContactPanel />
      <PolicyLinksPanel />
    </View>
  );
}

function GalleryViewer({
  images,
  image,
  onSelect,
  onClose,
  onAvailability
}: {
  images: string[];
  image: string;
  onSelect: (image: string) => void;
  onClose: () => void;
  onAvailability: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [showGrid, setShowGrid] = useState(false);
  const viewerScrollRef = useRef<ScrollView>(null);
  const selectedIndex = Math.max(0, images.indexOf(image));

  useEffect(() => {
    if (showGrid) return;
    requestAnimationFrame(() => {
      viewerScrollRef.current?.scrollTo({ x: selectedIndex * windowWidth, animated: false });
    });
  }, [selectedIndex, showGrid]);

  const handleViewerScrollEnd = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / windowWidth);
    const nextImage = images[Math.min(Math.max(index, 0), images.length - 1)];
    if (nextImage) onSelect(nextImage);
  };

  return (
    <View style={styles.galleryViewer}>
      <View style={[styles.galleryTopbar, { paddingTop: Math.max(insets.top, 10) }]}>
        <Pressable style={styles.galleryViewerCircleButton} onPress={onClose}>
          <X size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.galleryCounter}>{selectedIndex + 1}/{images.length}</Text>
        <Pressable style={styles.galleryViewerCircleButton} onPress={() => setShowGrid((current) => !current)}>
          <ImageIcon size={23} color={colors.ink} />
        </Pressable>
      </View>
      {showGrid ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.galleryViewerGrid}>
          {images.map((item, index) => (
            <Pressable
              key={`${item}-grid`}
              style={[styles.galleryViewerGridItem, item === image ? styles.galleryViewerGridItemActive : null]}
              onPress={() => {
                onSelect(item);
                setShowGrid(false);
              }}
            >
              <RemoteImage uri={item} style={styles.fillImage} />
              <View style={styles.viewerThumbLabel}>
                <Text style={styles.viewerThumbText}>{index + 1}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.galleryViewerStage}>
          <ScrollView
            ref={viewerScrollRef}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleViewerScrollEnd}
          >
            {images.map((item, index) => (
              <View key={`${item}-viewer-${index}`} style={styles.galleryViewerSlide}>
                <RemoteImage uri={item} style={styles.galleryLarge} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>
          <View style={styles.galleryViewerDots}>
            {images.slice(0, 7).map((item) => (
              <View key={`${item}-viewer-dot`} style={[styles.galleryViewerDot, item === image ? styles.productHeroDotActiveDark : null]} />
            ))}
          </View>
        </View>
      )}
      <View style={[styles.galleryViewerBottom, { paddingBottom: 22 + Math.max(insets.bottom, 12) }]}>
        <Pressable style={styles.galleryAvailabilityButton} onPress={onAvailability}>
          <Text style={styles.galleryAvailabilityText}>Ver disponibilidad</Text>
        </Pressable>
      </View>
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

function TrustMiniList({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <View style={[styles.trustMiniList, dark ? styles.trustMiniListDark : null]}>
      {items.map((item) => (
        <View key={item} style={styles.trustMiniItem}>
          <CheckCircle2 size={15} color={dark ? colors.green : colors.skyDark} />
          <Text style={[styles.trustMiniText, dark ? styles.trustMiniTextDark : null]}>{item}</Text>
        </View>
      ))}
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
  const tr = useTranslate();
  const [focused, setFocused] = useState(false);
  const hasValue = value.trim().length > 0;
  const statusText = selected
    ? "Seleccionado. Puedes tocar el campo para editar."
    : hasValue && !error
      ? "Escribiendo. Elige una sugerencia para confirmar."
      : "";

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View
        style={[
          styles.locationInputShell,
          selected ? styles.locationInputSelected : null,
          focused ? styles.locationInputFocused : null
        ]}
      >
        <Icon size={18} color={selected ? colors.skyDark : colors.skyDark} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={tr(placeholder) ?? undefined}
          placeholderTextColor={colors.muted}
          style={styles.locationInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {selected ? (
          <View style={styles.locationEditPill}>
            <Pencil size={12} color={colors.skyDark} />
          </View>
        ) : null}
        {loading ? <Text style={styles.loadingText}>...</Text> : null}
      </View>
      {statusText ? (
        <Text style={[styles.locationStatusText, selected ? styles.locationStatusSelected : null]}>
          {statusText}
        </Text>
      ) : null}
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
  onFocus,
  placeholder,
  error,
  keyboardType,
  secureTextEntry,
  multiline,
  editable = true
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  onFocus?: () => void;
  placeholder?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  multiline?: boolean;
  editable?: boolean;
}) {
  const tr = useTranslate();

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholder={tr(placeholder) ?? undefined}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        editable={editable}
        style={[styles.textInput, multiline ? styles.textArea : null, !editable ? styles.textInputDisabled : null]}
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

function GoogleLoginButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.googleButton} onPress={onPress}>
      <View style={styles.googleMark}>
        <Text style={styles.googleMarkText}>G</Text>
      </View>
      <Text style={styles.googleButtonText}>Continuar con Google</Text>
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
  const cleanTitle = title.includes("Recomendados")
    ? "Recomendados"
    : title.includes("Categorias")
      ? "Categorias"
      : title.includes("Rutas populares")
        ? "Rutas populares"
        : title;

  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{cleanTitle}</Text>
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

const tourDecisionTags = (tour: AppTour) => {
  const tags = new Set<string>();
  if (tour.activeOffer) tags.add("Mejor precio");
  if (tour.rating >= 4.8) tags.add("Más reservado");
  if (normalizeLocationSearch(tour.pickup).includes("incluye")) tags.add("Recogida incluida");
  if (normalizeLocationSearch(tour.category).includes("premium")) tags.add("Premium");
  if (normalizeLocationSearch(`${tour.title} ${tour.category}`).includes("familia")) tags.add("Ideal familias");
  if (!tags.size) tags.add(tour.price <= 75 ? "Mejor precio" : "Confirmación rápida");
  return Array.from(tags).slice(0, 3);
};

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
  const offerAdultPrice = applyOfferDiscount(tour.price, tour.activeOffer).total;
  return (
    <Pressable style={styles.tourCard} onPress={onReserve}>
      <View style={styles.tourImageWrap}>
        <RemoteImage uri={tour.image} style={styles.tourImage} />
        <View style={styles.tourImageOverlay} />
        <View style={styles.tourTopRow}>
          <Text style={styles.tourCategoryBadge}>{tour.category}</Text>
          {tour.activeOffer ? <Text style={styles.tourOfferBadge}>{offerLabel(tour.activeOffer)}</Text> : null}
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
        <View style={styles.tourDecisionTags}>
          {tourDecisionTags(tour).map((tag) => (
            <Text key={tag} style={styles.tourDecisionTag}>{tag}</Text>
          ))}
        </View>
        <Text style={styles.bodyText} numberOfLines={2}>{tour.description}</Text>
        <View style={styles.metaRow}>
          <MetaItem icon={MapPin} label={tour.location} />
          <MetaItem icon={Clock3} label={tour.duration} />
          <MetaItem icon={Car} label={tour.pickup} />
        </View>
        <View style={styles.tourFooter}>
          <View style={styles.tourPriceBlock}>
            <Text style={styles.tourPriceLabel}>Desde</Text>
            {tour.activeOffer ? <Text style={styles.tourOldPrice}>{money(tour.price)}</Text> : null}
            <Text style={styles.tourPrice}>{money(offerAdultPrice)}</Text>
          </View>
          <ActionButton label="Ver disponibilidad" icon={CalendarCheck} onPress={onReserve} />
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

function ContactPanel({ compact = false }: { compact?: boolean }) {
  return (
    <View style={compact ? styles.contactPanelCompact : styles.formPanel}>
      <View style={styles.contactHeader}>
        <View style={styles.contactIcon}>
          <MessageCircle size={20} color={colors.white} />
        </View>
        <View style={styles.flexText}>
          <Text style={styles.sectionTitle}>Contacto y soporte</Text>
          <Text style={styles.smallMuted}>Habla con Proactivitis antes o después de reservar.</Text>
        </View>
      </View>
      <View style={styles.contactGrid}>
        <LinkRow
          icon={MessageCircle}
          title="WhatsApp"
          subtitle="Respuesta rápida para reservas"
          onPress={() => openUrl(links.whatsapp)}
        />
        <LinkRow
          icon={Phone}
          title="Llamar ahora"
          subtitle="+1 829 475 6298"
          onPress={() => openUrl(links.phone)}
        />
        <LinkRow
          icon={Mail}
          title="Email"
          subtitle="support@proactivitis.com"
          onPress={() => openUrl(links.email)}
        />
        <LinkRow
          icon={ImageIcon}
          title="Instagram"
          subtitle="Fotos y novedades"
          onPress={() => openUrl(links.instagram)}
        />
        <LinkRow
          icon={MessageCircle}
          title="TikTok"
          subtitle="Videos y recomendaciones"
          onPress={() => openUrl(links.tiktok)}
        />
        <LinkRow
          icon={Compass}
          title="Formulario web"
          subtitle="Enviar mensaje desde la web"
          onPress={() => openUrl(links.contact)}
        />
      </View>
    </View>
  );
}

function PolicyLinksPanel({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <View style={styles.policyMiniPanel}>
        <Text style={styles.policyMiniTitle}>Legal y políticas</Text>
        <Text style={styles.policyMiniText}>Consulta estos enlaces cuando necesites revisar privacidad, términos o cancelaciones.</Text>
        <View style={styles.policyMiniGrid}>
          {policyLinks.map((item) => (
            <Pressable key={item.title} style={styles.policyMiniLink} onPress={() => openUrl(item.url)}>
              <item.icon size={13} color={colors.skyDark} />
              <Text style={styles.policyMiniLabel} numberOfLines={2}>{item.title}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.policyMiniNotice}>
          Al continuar aceptas los términos, privacidad y reglas de cancelación aplicables al producto.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.formPanel}>
      <Text style={styles.sectionTitle}>Políticas y legal</Text>
      <Text style={styles.smallMuted}>
        Accesos visibles para privacidad, términos, cookies, información legal y cancelaciones.
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setFailed(false);
    setLoading(true);
  }, [uri]);

  return (
    <View style={[style, styles.remoteImageShell]}>
      {loading ? (
        <View style={styles.remoteImageSkeleton}>
          <ImageIcon size={18} color={colors.skyDark} />
        </View>
      ) : null}
      <Image
        source={{ uri: failed ? fallbackTourImage : absoluteImageUrl(uri) }}
        style={styles.remoteImageFill}
        resizeMode={resizeMode}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          if (!failed) setFailed(true);
        }}
      />
    </View>
  );
}

function TabBar({
  activeTab,
  bottomInset,
  onChange
}: {
  activeTab: TabKey;
  bottomInset: number;
  onChange: (tab: TabKey) => void;
}) {
  const tabs: Array<{ key: TabKey; label: string; icon: IconType }> = [
    { key: "home", label: "Inicio", icon: Home },
    { key: "tours", label: "Tours", icon: Compass },
    { key: "transfers", label: "Transfer", icon: Car },
    { key: "zones", label: "Zonas", icon: MapPin },
    { key: "profile", label: "Perfil", icon: User }
  ];
  return (
    <View style={[styles.tabBar, { bottom: bottomInset }]}>
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
  appRoot: {
    flex: 1,
    backgroundColor: colors.ink
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.ink
  },
  appShell: {
    flex: 1,
    backgroundColor: colors.surface
  },
  appShellSafeTop: {
    paddingTop: 24
  },
  languageScreen: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.ink,
    padding: 18
  },
  privacySafeArea: {
    flex: 1,
    backgroundColor: colors.white
  },
  privacyScreen: {
    flexGrow: 1,
    justifyContent: "space-between",
    gap: 28,
    backgroundColor: colors.white,
    paddingHorizontal: 22,
    paddingTop: 36,
    paddingBottom: 26
  },
  privacyTopIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.skySoft,
    marginBottom: 18
  },
  privacyTitle: {
    color: colors.ink,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: 0
  },
  privacyBody: {
    marginTop: 18,
    color: colors.inkSoft,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "800"
  },
  privacyLink: {
    alignSelf: "flex-start",
    marginTop: 12,
    color: colors.sky,
    fontSize: 16,
    fontWeight: "900",
    textDecorationLine: "underline"
  },
  privacyBottomActions: {
    gap: 16
  },
  privacyActions: {
    gap: 12
  },
  privacyTextButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center"
  },
  privacyTextButtonLabel: {
    color: colors.sky,
    fontSize: 16,
    fontWeight: "900"
  },
  privacyOptions: {
    gap: 10
  },
  privacyOption: {
    minHeight: 78,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13
  },
  privacyOptionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  privacyOptionText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  privacyAlwaysOn: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: colors.skySoft,
    color: colors.skyDark,
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  privacySwitch: {
    width: 50,
    height: 30,
    borderRadius: 999,
    backgroundColor: "#cbd5e1",
    justifyContent: "center",
    paddingHorizontal: 3
  },
  privacySwitchActive: {
    backgroundColor: colors.sky
  },
  privacySwitchKnob: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: colors.white
  },
  privacySwitchKnobActive: {
    alignSelf: "flex-end"
  },
  languageCard: {
    gap: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lineOnDark,
    backgroundColor: colors.card,
    padding: 18
  },
  languageIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.skyDark
  },
  languageTitle: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "900"
  },
  languageSubtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700"
  },
  languageOptions: {
    gap: 10
  },
  languageOption: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 12
  },
  languageOptionActive: {
    borderColor: colors.green,
    backgroundColor: "#f0fdf4"
  },
  languageBadge: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.skySoft
  },
  languageBadgeActive: {
    backgroundColor: colors.green
  },
  languageBadgeText: {
    color: colors.skyDark,
    fontSize: 13,
    fontWeight: "900"
  },
  languageBadgeTextActive: {
    color: colors.white
  },
  languageOptionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  languageOptionSubtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  scrollContent: {
    paddingBottom: 150,
    backgroundColor: colors.surface
  },
  scrollContentWithFloatingBar: {
    paddingBottom: 154
  },
  screen: {
    gap: 18,
    padding: 16,
    paddingBottom: 38
  },
  homeScreen: {
    gap: 18,
    paddingHorizontal: 16,
    paddingBottom: 38
  },
  flexText: {
    flex: 1,
    minWidth: 0,
    gap: 4
  },
  hero: {
    minHeight: 500,
    justifyContent: "flex-end",
    overflow: "hidden",
    marginHorizontal: -16,
    backgroundColor: colors.ink
  },
  heroImage: {
    resizeMode: "cover"
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 17, 31, 0.34)"
  },
  heroContent: {
    gap: 11,
    padding: 20,
    paddingTop: 38,
    paddingBottom: 34
  },
  heroBrand: {
    alignSelf: "flex-start",
    maxWidth: "92%",
    minHeight: 58,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.58)",
    backgroundColor: "rgba(255,255,255,0.94)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 8,
    paddingRight: 14,
    shadowColor: "#020617",
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5
  },
  heroBrandIconShell: {
    width: 42,
    height: 42,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: colors.white
  },
  heroBrandIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  },
  heroBrandName: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "900"
  },
  heroBrandLine: {
    color: colors.skyDark,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  eyebrow: {
    color: colors.skySoft,
    fontSize: 11,
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
    fontSize: 31,
    lineHeight: 35,
    fontWeight: "900",
    letterSpacing: 0,
    textShadowColor: "rgba(6,17,31,0.72)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10
  },
  heroSubtitle: {
    color: "#dbeafe",
    fontSize: 15,
    lineHeight: 21,
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
    paddingHorizontal: 11,
    paddingVertical: 8
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
    display: "none"
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
    minHeight: 184,
    gap: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 11,
    ...shadows.card
  },
  homeRouteTopRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6
  },
  homeRouteCode: {
    flexShrink: 0,
    color: colors.text,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "900"
  },
  homeRouteImageWrap: {
    width: 58,
    height: 40,
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line
  },
  homeRouteImage: {
    width: "100%",
    height: "100%"
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
  homeRoutePrice: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    backgroundColor: "#ecfdf5",
    color: "#047857",
    fontSize: 14,
    fontWeight: "900",
    paddingHorizontal: 9,
    paddingVertical: 5
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
  transferNoticePanel: {
    marginHorizontal: 16,
    marginTop: 12
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
  tourDecisionTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7
  },
  tourDecisionTag: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: colors.skySoft,
    color: colors.skyDark,
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 9,
    paddingVertical: 5
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
  customerStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  customerStat: {
    width: "48%",
    minHeight: 82,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    gap: 5,
    padding: 11
  },
  customerStatValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  customerStatLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  customerBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.green,
    paddingHorizontal: 8
  },
  customerBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "900"
  },
  customerFocusBox: {
    gap: 5,
    borderRadius: 8,
    backgroundColor: colors.ink,
    padding: 13
  },
  customerFocusLabel: {
    color: colors.mutedOnDark,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  customerFocusTitle: {
    color: colors.white,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "900"
  },
  customerFocusText: {
    color: colors.skySoft,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800"
  },
  customerHubRows: {
    gap: 8
  },
  customerHubRow: {
    minHeight: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 11
  },
  customerHubRowActive: {
    borderColor: colors.sky,
    backgroundColor: "#f0f9ff"
  },
  customerHubIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.skySoft
  },
  customerHubIconActive: {
    backgroundColor: colors.sky
  },
  customerHubRowTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  customerHubRowText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700"
  },
  customerNotice: {
    gap: 5,
    borderRadius: 8,
    backgroundColor: colors.skySoft,
    padding: 12
  },
  customerPanelTabs: {
    gap: 8,
    paddingRight: 10
  },
  customerPanelTab: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12
  },
  customerPanelTabActive: {
    borderColor: colors.skyDark,
    backgroundColor: colors.skyDark
  },
  customerPanelTabText: {
    color: colors.skyDark,
    fontSize: 12,
    fontWeight: "900"
  },
  customerPanelTabTextActive: {
    color: colors.white
  },
  nativeBookingCard: {
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white
  },
  nativeBookingImage: {
    width: "100%",
    height: 132,
    backgroundColor: colors.line
  },
  nativeBookingBody: {
    gap: 8,
    padding: 12
  },
  nativeStatusPill: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#ecfdf5",
    color: colors.green,
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  nativeBookingTitle: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900"
  },
  nativeCode: {
    color: colors.skyDark,
    fontSize: 12,
    fontWeight: "900"
  },
  nativeActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  nativeSmallButton: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12
  },
  nativeSmallButtonText: {
    color: colors.skyDark,
    fontSize: 12,
    fontWeight: "900"
  },
  nativeSmallButtonDark: {
    minHeight: 36,
    borderRadius: 999,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12
  },
  nativeSmallButtonDarkText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "900"
  },
  nativePaymentCard: {
    minHeight: 86,
    borderRadius: 8,
    backgroundColor: colors.ink,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14
  },
  nativePaymentTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "900"
  },
  nativeReviewChoice: {
    gap: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    padding: 11
  },
  nativeReviewChoiceActive: {
    borderColor: colors.sky,
    backgroundColor: colors.skySoft
  },
  nativeStarsRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  nativeChipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9
  },
  nativeToggleRow: {
    minHeight: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 12
  },
  nativeToggleDot: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.white
  },
  nativeToggleDotActive: {
    borderColor: colors.green,
    backgroundColor: colors.green
  },
  nativeNotification: {
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    padding: 12
  },
  nativeNotificationUnread: {
    borderColor: colors.sky,
    backgroundColor: "#f0f9ff"
  },
  nativeUnreadDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: colors.green
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
    flexWrap: "wrap",
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
  tourOfferBadge: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#f0fdf4",
    color: colors.green,
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
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    backgroundColor: "#dcfce7",
    color: "#15803d",
    fontSize: 15,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 5
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
  tourPriceBlock: {
    alignSelf: "flex-start",
    minWidth: 92,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#86efac",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  tourPriceLabel: {
    color: "#166534",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  tourOldPrice: {
    color: "#65a30d",
    fontSize: 12,
    fontWeight: "900",
    textDecorationLine: "line-through"
  },
  tourPrice: {
    color: "#16a34a",
    fontSize: 22,
    fontWeight: "900"
  },
  productScreen: {
    backgroundColor: colors.surface,
    paddingBottom: 18
  },
  productHero: {
    minHeight: 500,
    justifyContent: "flex-end",
    overflow: "hidden",
    backgroundColor: colors.ink
  },
  productImageButton: {
    ...StyleSheet.absoluteFillObject
  },
  productImageSlide: {
    width: windowWidth,
    height: "100%"
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
    backgroundColor: "rgba(6,17,31,0.12)"
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 2,
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f172a",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 6
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
    minHeight: 54,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 15,
    shadowColor: "#0f172a",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 6
  },
  galleryFloatingText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900"
  },
  productHeroDots: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 150,
    zIndex: 2,
    flexDirection: "row",
    justifyContent: "center",
    gap: 7
  },
  productHeroDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.56)"
  },
  productHeroDotActive: {
    width: 18,
    backgroundColor: colors.white
  },
  productHeroDotActiveDark: {
    width: 18,
    backgroundColor: colors.ink
  },
  productHeroContent: {
    gap: 12,
    padding: 20,
    paddingBottom: 46
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
    marginTop: -24,
    paddingBottom: 6
  },
  productTrustPanel: {
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    backgroundColor: "#f0fdf4",
    padding: 14,
    ...shadows.card
  },
  productTrustGrid: {
    gap: 9
  },
  productTrustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  productTrustText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800"
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
  productFloatingBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 94,
    borderTopWidth: 1,
    borderColor: colors.line,
    backgroundColor: "rgba(255,255,255,0.98)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    shadowColor: "#0f172a",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12
  },
  productFloatingPriceBlock: {
    flexShrink: 1,
    minWidth: 98
  },
  productFloatingLabel: {
    color: colors.inkSoft,
    fontSize: 12,
    fontWeight: "800"
  },
  productFloatingPriceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: 6
  },
  productFloatingOldPrice: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
    textDecorationLine: "line-through"
  },
  productFloatingPrice: {
    color: colors.ink,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900"
  },
  productFloatingSub: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  productFloatingButton: {
    minHeight: 58,
    flexShrink: 0,
    borderRadius: 999,
    backgroundColor: colors.sky,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 19
  },
  productFloatingButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "900"
  },
  offerBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  offerBadgeText: {
    color: colors.green,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
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
  productOldPrice: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "900",
    textDecorationLine: "line-through"
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
  bookingSelectionSummary: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderRadius: 8,
    backgroundColor: colors.ink,
    padding: 12
  },
  bookingSelectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.sky
  },
  bookingSelectionLabel: {
    color: colors.mutedOnDark,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  bookingSelectionValue: {
    color: colors.white,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "900"
  },
  bookingStepBlock: {
    gap: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 12
  },
  priceTierPanel: {
    gap: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: 12
  },
  priceTierRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  priceTierLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  priceTierValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  offerPanel: {
    gap: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    backgroundColor: "#f0fdf4",
    padding: 12
  },
  offerPanelTitle: {
    color: colors.green,
    fontSize: 14,
    fontWeight: "900"
  },
  offerPanelText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800"
  },
  bookingStepHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10
  },
  bookingStepNumber: {
    width: 26,
    height: 26,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: colors.sky,
    color: colors.white,
    textAlign: "center",
    lineHeight: 26,
    fontSize: 12,
    fontWeight: "900"
  },
  bookingDateButton: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bae6fd",
    backgroundColor: colors.white,
    padding: 12
  },
  bookingDateLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  bookingDateValue: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900"
  },
  bookingChipRow: {
    gap: 8,
    paddingRight: 8
  },
  bookingChoiceChip: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 12
  },
  bookingChoiceChipActive: {
    borderColor: colors.sky,
    backgroundColor: colors.sky
  },
  bookingChoiceText: {
    color: colors.skyDark,
    fontSize: 12,
    fontWeight: "900"
  },
  bookingChoiceTextActive: {
    color: colors.white
  },
  calendarBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(6,17,31,0.55)"
  },
  calendarBackdropTap: {
    ...StyleSheet.absoluteFillObject
  },
  calendarSheet: {
    gap: 14,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: colors.card,
    padding: 16,
    paddingBottom: 24
  },
  calendarCloseButton: {
    minHeight: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 12
  },
  calendarCloseText: {
    color: colors.skyDark,
    fontSize: 12,
    fontWeight: "900"
  },
  calendarMonthBar: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8
  },
  calendarMonthTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
    textTransform: "capitalize"
  },
  calendarNavButton: {
    minHeight: 36,
    minWidth: 78,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 8,
    backgroundColor: colors.skySoft,
    paddingHorizontal: 8
  },
  calendarNavButtonDisabled: {
    backgroundColor: colors.surface
  },
  calendarNavText: {
    color: colors.skyDark,
    fontSize: 10,
    fontWeight: "900"
  },
  calendarNavTextDisabled: {
    color: colors.muted
  },
  calendarWeekRow: {
    flexDirection: "row",
    gap: 5
  },
  calendarWeekText: {
    flex: 1,
    color: colors.muted,
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center",
    textTransform: "uppercase"
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5
  },
  calendarDay: {
    width: "13.45%",
    aspectRatio: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface
  },
  calendarDayOtherMonth: {
    backgroundColor: colors.white
  },
  calendarDayDisabled: {
    opacity: 0.45
  },
  calendarDaySelected: {
    backgroundColor: colors.sky
  },
  calendarDayText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  calendarDayTextMuted: {
    color: colors.muted
  },
  calendarDayTextDisabled: {
    color: colors.muted
  },
  calendarDayTextSelected: {
    color: colors.white
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
  textInputDisabled: {
    backgroundColor: "#eef4f8",
    color: colors.muted
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
  pickupHelperText: {
    color: colors.skyDark,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800"
  },
  trustMiniList: {
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bae6fd",
    backgroundColor: "#f0f9ff",
    padding: 12
  },
  trustMiniListDark: {
    borderColor: "rgba(125,211,252,0.22)",
    backgroundColor: "rgba(14,165,233,0.1)"
  },
  trustMiniItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  trustMiniText: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900"
  },
  trustMiniTextDark: {
    color: colors.skySoft
  },
  checkoutTotal: {
    color: "#22c55e",
    fontSize: 28,
    fontWeight: "900"
  },
  transferScreen: {
    gap: 16,
    paddingBottom: 54,
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
    borderColor: "#7dd3fc",
    backgroundColor: "#f0f9ff"
  },
  locationInputFocused: {
    borderColor: colors.sky,
    backgroundColor: colors.white
  },
  locationInput: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: 15,
    fontWeight: "800"
  },
  locationEditPill: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.skySoft
  },
  locationStatusText: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800"
  },
  locationStatusSelected: {
    color: colors.skyDark
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
    paddingBottom: 64
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
  contactPanelCompact: {
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 14,
    ...shadows.card
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11
  },
  contactIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.skyDark
  },
  contactGrid: {
    gap: 8
  },
  formDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 2
  },
  formDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line
  },
  formDividerText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
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
  confirmedActions: {
    gap: 10,
    borderRadius: 8,
    backgroundColor: colors.white,
    padding: 12
  },
  confirmedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  confirmedText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  galleryViewer: {
    flex: 1,
    minHeight: windowHeight,
    backgroundColor: colors.white,
    paddingTop: 10
  },
  galleryTopbar: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 10
  },
  galleryViewerCircleButton: {
    width: 58,
    height: 58,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: "#0f172a",
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5
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
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  galleryViewerStage: {
    flex: 1,
    minHeight: Math.max(430, windowHeight - 250),
    justifyContent: "center",
    gap: 20
  },
  galleryLarge: {
    width: "100%",
    height: Math.max(360, windowHeight * 0.54),
    backgroundColor: colors.white
  },
  galleryViewerSlide: {
    width: windowWidth,
    minHeight: Math.max(360, windowHeight * 0.54),
    alignItems: "center",
    justifyContent: "center"
  },
  galleryViewerDots: {
    minHeight: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 7
  },
  galleryViewerDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#cbd5e1"
  },
  galleryViewerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 20
  },
  galleryViewerGridItem: {
    width: (windowWidth - 38) / 2,
    height: 132,
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.line
  },
  galleryViewerGridItemActive: {
    borderColor: colors.sky
  },
  galleryViewerBottom: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 30,
    backgroundColor: colors.white
  },
  galleryAvailabilityButton: {
    minHeight: 58,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingHorizontal: 18
  },
  galleryAvailabilityText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  remoteImageShell: {
    overflow: "hidden",
    backgroundColor: colors.line
  },
  remoteImageFill: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%"
  },
  remoteImageSkeleton: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.skySoft
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
    minHeight: 56,
    borderRadius: 999,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8
  },
  actionButtonPrimary: {
    backgroundColor: colors.sky,
    shadowColor: colors.skyDark,
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5
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
  googleButton: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  googleMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line
  },
  googleMarkText: {
    color: "#4285F4",
    fontSize: 16,
    fontWeight: "900"
  },
  googleButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  tabBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 14,
    minHeight: 72,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "rgba(255,255,255,0.98)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    ...shadows.card
  },
  tabButton: {
    flex: 1,
    minHeight: 58,
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
