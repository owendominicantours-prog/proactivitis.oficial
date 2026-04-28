import { StatusBar } from "expo-status-bar";
import type { ComponentType, ReactNode } from "react";
import { Component, createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
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
  fetchMobileTransferLocations,
  fetchMobileTransferRoutes,
  fetchMobileUser,
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
type AppLanguage = "es" | "en" | "fr";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
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
  "Busca tu ruta real": "Find your real route",
  "Escribe tu aeropuerto, hotel o zona. La app te muestra coincidencias antes de calcular.":
    "Enter your airport, hotel, or area. The app shows matches before calculating.",
  "Elige origen y destino": "Choose pickup and drop-off",
  "No dejamos una ruta marcada por defecto para que reserves exactamente donde necesitas.":
    "We do not preselect a route, so you book exactly what you need.",
  "Solo ida": "One way",
  "Ida y vuelta": "Round trip",
  "Origen": "Pickup",
  "Destino": "Drop-off",
  "Ej: Aeropuerto Punta Cana": "Ex: Punta Cana Airport",
  "Ej: hotel, villa o zona": "Ex: hotel, villa, or area",
  "Rutas populares": "Popular routes",
  "Fecha salida": "Departure date",
  "Hora": "Time",
  "Fecha regreso": "Return date",
  "Hora regreso": "Return time",
  "Pasajeros": "Passengers",
  "Buscar tarifa": "Search fare",
  "Buscando...": "Searching...",
  "Vehiculos disponibles": "Available vehicles",
  "Reservar": "Book",
  "Reservar ahora": "Book now",
  "Guardar ruta": "Save route",
  "Busca y selecciona origen y destino desde la lista real.": "Search and select pickup and drop-off from the real list.",
  "Origen y destino deben ser diferentes.": "Pickup and drop-off must be different.",
  "Selecciona el hotel o aeropuerto exacto antes de cotizar.": "Select the exact hotel or airport before quoting.",
  "Indica fecha y hora de regreso.": "Add return date and time.",
  "No hay vehiculos disponibles para ese grupo.": "No vehicles are available for that group.",
  "No se pudo calcular la tarifa real.": "The live fare could not be calculated.",
  "No encontramos coincidencias. Prueba con hotel, aeropuerto o zona.": "No matches found. Try a hotel, airport, or area.",
  "Reserva": "Booking",
  "Reserva segura": "Secure booking",
  "Confirma tu experiencia en minutos": "Confirm your experience in minutes",
  "Revisa el producto, deja tus datos y continua al pago seguro de Proactivitis.":
    "Review your product, enter your details, and continue to secure Proactivitis payment.",
  "Datos": "Details",
  "Recogida": "Pickup",
  "Pago": "Payment",
  "Transfer privado": "Private transfer",
  "Tour": "Tour",
  "Fecha": "Date",
  "Personas": "People",
  "Total": "Total",
  "Datos de contacto": "Contact details",
  "Nombre": "First name",
  "Apellido": "Last name",
  "Email": "Email",
  "Telefono": "Phone",
  "Recogida y preferencias": "Pickup and preferences",
  "Punto principal": "Main pickup point",
  "Hotel o punto de recogida": "Hotel or pickup point",
  "Notas especiales": "Special notes",
  "Pago nativo protegido por Stripe y confirmacion por Proactivitis.":
    "Native payment protected by Stripe and confirmed by Proactivitis.",
  "Total a pagar": "Total to pay",
  "Pagar con Stripe": "Pay with Stripe",
  "Procesando...": "Processing...",
  "Abrir checkout web": "Open web checkout",
  "Confirmar por WhatsApp": "Confirm by WhatsApp",
  "Volver": "Back",
  "Indica el nombre.": "Enter your first name.",
  "Indica el apellido.": "Enter your last name.",
  "Indica un email valido.": "Enter a valid email.",
  "Indica hotel o punto de recogida.": "Enter hotel or pickup point.",
  "Stripe nativo no esta disponible en la vista web. Usa checkout web o prueba en Android/iOS.":
    "Native Stripe is not available in web view. Use web checkout or test on Android/iOS.",
  "Stripe aun no esta configurado en esta build. Revisa NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.":
    "Stripe is not configured in this build yet. Check NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.",
  "Preparando pago seguro...": "Preparing secure payment...",
  "Stripe no devolvio client secret para abrir el pago.": "Stripe did not return a client secret to open payment.",
  "Abriendo pago seguro...": "Opening secure payment...",
  "El pago fue cancelado o no se completo.": "The payment was canceled or not completed.",
  "Pago confirmado. Tu reserva quedo registrada en Proactivitis.": "Payment confirmed. Your booking is registered with Proactivitis.",
  "No se pudo completar el pago.": "The payment could not be completed.",
  "Abriendo checkout web de Proactivitis...": "Opening Proactivitis web checkout...",
  "Cuenta": "Account",
  "Perfil Proactivitis": "Proactivitis Profile",
  "Tus reservas quedan asociadas a este correo.": "Your bookings are linked to this email.",
  "Cliente Proactivitis": "Proactivitis Customer",
  "Cerrar sesion": "Sign out",
  "WhatsApp": "WhatsApp",
  "Soporte directo": "Direct support",
  "Web": "Website",
  "Entra a Proactivitis": "Sign in to Proactivitis",
  "Conecta tus datos con la base real de la web.": "Connect your details with the live website database.",
  "Accede a tus reservas": "Access your bookings",
  "Inicia sesion para guardar tus datos, revisar planes y continuar reservas desde cualquier dispositivo.":
    "Sign in to save your details, review plans, and continue bookings from any device.",
  "Tu perfil de viaje": "Your travel profile",
  "Tus reservas, favoritos y preferencias quedan guardados en tu cuenta.":
    "Your bookings, favorites, and preferences stay saved in your account.",
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
  "Ver todo el catalogo": "View full catalog",
  "Ciudad": "City",
  "Cambiar ciudad": "Change city",
  "Ciudad seleccionada": "Selected city",
  "Tours filtrados por ciudad. Puedes reservar el tour o cotizar transfer para llegar comodo.":
    "Tours filtered by city. You can book the tour or quote a transfer to arrive comfortably.",
  "Todas": "All",
  "Todas las ciudades": "All cities",
  "No hay tours en esta zona": "No tours in this area",
  "Prueba otra zona o revisa el catalogo completo.": "Try another area or view the full catalog.",
  "Experiencias reales de la web, fotos del producto, detalles claros y checkout dentro de la app.":
    "Live website experiences, product photos, clear details, and checkout inside the app.",
  "Catalogo Proactivitis": "Proactivitis catalog",
  "ðŸŒ´ Catalogo Proactivitis": "Proactivitis catalog",
  "Tours listos para reservar": "Tours ready to book",
  "ðŸ“¸ Galeria": "Gallery",
  "âš¡ Reserva rapida": "Fast booking",
  "ðŸ’¬ Soporte humano": "Human support",
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
  "Ver politicas": "View policies",
  "Error de pantalla": "Screen error",
  "La app encontro un problema en esta vista. Vuelve y prueba otra vez.": "The app found a problem in this view. Go back and try again.",
  "Volver al inicio": "Back to home",
  "Todos": "All",
  "Agua": "Water",
  "Aventura": "Adventure",
  "Cultura": "Culture",
  "Premium": "Premium",
  "Ver tours 🔥": "View tours 🔥",
  "Buscar transfer 🚘": "Find transfer 🚘",
  "ðŸŒ´ Tours, transfers y planes privados": "Tours, transfers, and private plans",
  "Tu viaje en RD, claro y sin estres": "Your DR trip, clear and stress-free",
  "Elige tours con fotos reales, cotiza tu traslado y reserva con ayuda local 24/7. Aqui vienes a disfrutar, nosotros organizamos lo dificil.":
    "Choose tours with real photos, quote your transfer, and book with 24/7 local help. You come to enjoy; we organize the hard part.",
  "âœ¨ Recomendado para familias, parejas y grupos que quieren reservar sin vueltas.":
    "Recommended for families, couples, and groups who want a simple booking experience.",
  "ðŸ“¸ Fotos reales": "Real photos",
  "ðŸ’µ Precio claro": "Clear price",
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
  "Dias": "Days",
  "Capacidad": "Capacity",
  "Edad minima": "Minimum age",
  "Nivel fisico": "Physical level",
  "Accesibilidad": "Accessibility",
  "Requisitos": "Requirements",
  "Cancelacion": "Cancellation",
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
  "Aplican los terminos y la politica indicada en cada producto.": "Terms and the policy shown on each product apply.",
  "Desde": "From",
  "Opciones": "Options",
  "Ajusta la cantidad": "Adjust quantity",
  "Legal y politicas": "Legal and policies",
  "Politicas y legal": "Policies and legal",
  "Accesos visibles para privacidad, terminos, cookies, informacion legal y cancelaciones.":
    "Visible access to privacy, terms, cookies, legal information, and cancellations.",
  "Cancelacion gratuita": "Free cancellation",
  "Cancelacion flexible": "Flexible cancellation",
  "No reembolsable": "Non-refundable",
  "Confirmacion inmediata": "Instant confirmation",
  "Confirmacion manual": "Manual confirmation",
  "Continuar con Google": "Continue with Google",
  "Abriendo Google...": "Opening Google...",
  "Vuelve a la app cuando Google termine.": "Return to the app when Google finishes.",
  "No se pudo abrir Google.": "Could not open Google.",
  "Experiencias y traslados en Republica Dominicana": "Experiences and transfers in the Dominican Republic",
  "Descubre Republica Dominicana con reservas claras": "Discover the Dominican Republic with clear bookings",
  "Reserva tours, traslados privados y planes seleccionados con precios transparentes, fotos reales y asistencia local en varios idiomas.":
    "Book tours, private transfers, and selected plans with transparent prices, real photos, and local assistance in multiple languages.",
  "Atencion para familias, parejas, grupos y viajeros que prefieren organizar todo antes de llegar.":
    "Support for families, couples, groups, and travelers who prefer to organize everything before arrival.",
  "Fotos verificadas": "Verified photos",
  "Precio transparente": "Transparent price",
  "Asistencia 24/7": "24/7 assistance",
  "Explorar tours": "Explore tours",
  "Cotizar traslado": "Quote transfer",
  "Experiencias seleccionadas": "Selected experiences",
  "Actividades con detalles, fotos y precios conectados al catalogo web.":
    "Activities with details, photos, and prices connected to the web catalog.",
  "Busca aeropuertos, hoteles y zonas reales para calcular tu ruta antes de reservar.":
    "Search real airports, hotels, and areas to calculate your route before booking.",
  "Reserva con asistencia local": "Book with local assistance",
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
  "Busca tu ruta real": "Trouvez votre vrai trajet",
  "Escribe tu aeropuerto, hotel o zona. La app te muestra coincidencias antes de calcular.":
    "Ecrivez votre aeroport, hotel ou zone. L'app affiche les resultats avant le calcul.",
  "Elige origen y destino": "Choisissez depart et arrivee",
  "No dejamos una ruta marcada por defecto para que reserves exactamente donde necesitas.":
    "Aucun trajet n'est preselectionne afin de reserver exactement ce qu'il vous faut.",
  "Solo ida": "Aller simple",
  "Ida y vuelta": "Aller-retour",
  "Origen": "Depart",
  "Destino": "Arrivee",
  "Ej: Aeropuerto Punta Cana": "Ex: aeroport de Punta Cana",
  "Ej: hotel, villa o zona": "Ex: hotel, villa ou zone",
  "Rutas populares": "Trajets populaires",
  "Fecha salida": "Date de depart",
  "Hora": "Heure",
  "Fecha regreso": "Date de retour",
  "Hora regreso": "Heure de retour",
  "Pasajeros": "Passagers",
  "Buscar tarifa": "Chercher le tarif",
  "Buscando...": "Recherche...",
  "Vehiculos disponibles": "Vehicules disponibles",
  "Reservar": "Reserver",
  "Reservar ahora": "Reserver maintenant",
  "Guardar ruta": "Sauvegarder le trajet",
  "Busca y selecciona origen y destino desde la lista real.": "Cherchez et choisissez depart et arrivee dans la liste reelle.",
  "Origen y destino deben ser diferentes.": "Le depart et l'arrivee doivent etre differents.",
  "Selecciona el hotel o aeropuerto exacto antes de cotizar.": "Choisissez l'hotel ou l'aeroport exact avant le devis.",
  "Indica fecha y hora de regreso.": "Ajoutez la date et l'heure de retour.",
  "No hay vehiculos disponibles para ese grupo.": "Aucun vehicule disponible pour ce groupe.",
  "No se pudo calcular la tarifa real.": "Impossible de calculer le tarif reel.",
  "No encontramos coincidencias. Prueba con hotel, aeropuerto o zona.": "Aucun resultat. Essayez un hotel, aeroport ou zone.",
  "Reserva": "Reservation",
  "Reserva segura": "Reservation securisee",
  "Confirma tu experiencia en minutos": "Confirmez votre experience en quelques minutes",
  "Revisa el producto, deja tus datos y continua al pago seguro de Proactivitis.":
    "Verifiez le produit, ajoutez vos donnees et continuez vers le paiement securise Proactivitis.",
  "Datos": "Infos",
  "Recogida": "Prise en charge",
  "Pago": "Paiement",
  "Transfer privado": "Transfert prive",
  "Tour": "Tour",
  "Fecha": "Date",
  "Personas": "Personnes",
  "Total": "Total",
  "Datos de contacto": "Coordonnees",
  "Nombre": "Prenom",
  "Apellido": "Nom",
  "Email": "Email",
  "Telefono": "Telephone",
  "Recogida y preferencias": "Prise en charge et preferences",
  "Punto principal": "Point principal",
  "Hotel o punto de recogida": "Hotel ou point de prise en charge",
  "Notas especiales": "Notes speciales",
  "Pago nativo protegido por Stripe y confirmacion por Proactivitis.":
    "Paiement natif protege par Stripe et confirmation par Proactivitis.",
  "Total a pagar": "Total a payer",
  "Pagar con Stripe": "Payer avec Stripe",
  "Procesando...": "Traitement...",
  "Abrir checkout web": "Ouvrir le checkout web",
  "Confirmar por WhatsApp": "Confirmer par WhatsApp",
  "Volver": "Retour",
  "Indica el nombre.": "Ajoutez le prenom.",
  "Indica el apellido.": "Ajoutez le nom.",
  "Indica un email valido.": "Ajoutez un email valide.",
  "Indica hotel o punto de recogida.": "Ajoutez l'hotel ou le point de prise en charge.",
  "Stripe nativo no esta disponible en la vista web. Usa checkout web o prueba en Android/iOS.":
    "Stripe natif n'est pas disponible dans la vue web. Utilisez le checkout web ou testez sur Android/iOS.",
  "Stripe aun no esta configurado en esta build. Revisa NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.":
    "Stripe n'est pas encore configure dans cette build. Verifiez NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.",
  "Preparando pago seguro...": "Preparation du paiement securise...",
  "Stripe no devolvio client secret para abrir el pago.": "Stripe n'a pas renvoye le client secret pour ouvrir le paiement.",
  "Abriendo pago seguro...": "Ouverture du paiement securise...",
  "El pago fue cancelado o no se completo.": "Le paiement a ete annule ou n'a pas abouti.",
  "Pago confirmado. Tu reserva quedo registrada en Proactivitis.": "Paiement confirme. Votre reservation est enregistree chez Proactivitis.",
  "No se pudo completar el pago.": "Impossible de completer le paiement.",
  "Abriendo checkout web de Proactivitis...": "Ouverture du checkout web Proactivitis...",
  "Cuenta": "Compte",
  "Perfil Proactivitis": "Profil Proactivitis",
  "Tus reservas quedan asociadas a este correo.": "Vos reservations seront liees a cet email.",
  "Cliente Proactivitis": "Client Proactivitis",
  "Cerrar sesion": "Se deconnecter",
  "WhatsApp": "WhatsApp",
  "Soporte directo": "Assistance directe",
  "Web": "Web",
  "Entra a Proactivitis": "Connectez-vous a Proactivitis",
  "Conecta tus datos con la base real de la web.": "Connectez vos donnees avec la base reelle du site web.",
  "Accede a tus reservas": "Accedez a vos reservations",
  "Inicia sesion para guardar tus datos, revisar planes y continuar reservas desde cualquier dispositivo.":
    "Connectez-vous pour sauvegarder vos donnees, revoir vos plans et continuer vos reservations depuis n'importe quel appareil.",
  "Tu perfil de viaje": "Votre profil de voyage",
  "Tus reservas, favoritos y preferencias quedan guardados en tu cuenta.":
    "Vos reservations, favoris et preferences restent sauvegardes dans votre compte.",
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
  "Ver todo el catalogo": "Voir tout le catalogue",
  "Ciudad": "Ville",
  "Cambiar ciudad": "Changer de ville",
  "Ciudad seleccionada": "Ville selectionnee",
  "Tours filtrados por ciudad. Puedes reservar el tour o cotizar transfer para llegar comodo.":
    "Tours filtres par ville. Vous pouvez reserver le tour ou demander un transfert pour arriver facilement.",
  "Todas": "Toutes",
  "Todas las ciudades": "Toutes les villes",
  "No hay tours en esta zona": "Aucun tour dans cette zone",
  "Prueba otra zona o revisa el catalogo completo.": "Essayez une autre zone ou consultez tout le catalogue.",
  "Experiencias reales de la web, fotos del producto, detalles claros y checkout dentro de la app.":
    "Experiences reelles du site, photos du produit, details clairs et checkout dans l'app.",
  "Catalogo Proactivitis": "Catalogue Proactivitis",
  "Tours listos para reservar": "Tours prets a reserver",
  "Galeria": "Galerie",
  "Reserva rapida": "Reservation rapide",
  "Soporte humano": "Assistance humaine",
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
  "Ver politicas": "Voir les politiques",
  "Error de pantalla": "Erreur d'ecran",
  "La app encontro un problema en esta vista. Vuelve y prueba otra vez.": "L'app a trouve un probleme dans cette vue. Revenez et essayez encore.",
  "Volver al inicio": "Retour a l'accueil",
  "Todos": "Tous",
  "Agua": "Eau",
  "Aventura": "Aventure",
  "Cultura": "Culture",
  "Premium": "Premium",
  "Ver tours 🔥": "Voir les tours 🔥",
  "Buscar transfer 🚘": "Chercher un transfert 🚘",
  "🌴 Tours, transfers y planes privados": "🌴 Tours, transferts et plans prives",
  "Tu viaje en RD, claro y sin estres": "Votre voyage en RD, clair et sans stress",
  "Elige tours con fotos reales, cotiza tu traslado y reserva con ayuda local 24/7. Aqui vienes a disfrutar, nosotros organizamos lo dificil.":
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
  "Dias": "Jours",
  "Capacidad": "Capacite",
  "Edad minima": "Age minimum",
  "Nivel fisico": "Niveau physique",
  "Accesibilidad": "Accessibilite",
  "Requisitos": "Exigences",
  "Cancelacion": "Annulation",
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
  "Aplican los terminos y la politica indicada en cada producto.": "Les conditions et la politique indiquees sur chaque produit s'appliquent.",
  "Desde": "A partir de",
  "Opciones": "Options",
  "Ajusta la cantidad": "Ajuster la quantite",
  "Legal y politicas": "Legal et politiques",
  "Politicas y legal": "Politiques et legal",
  "Accesos visibles para privacidad, terminos, cookies, informacion legal y cancelaciones.":
    "Acces visible a la confidentialite, aux conditions, cookies, informations legales et annulations.",
  "Cancelacion gratuita": "Annulation gratuite",
  "Cancelacion flexible": "Annulation flexible",
  "No reembolsable": "Non remboursable",
  "Confirmacion inmediata": "Confirmation immediate",
  "Confirmacion manual": "Confirmation manuelle",
  "Continuar con Google": "Continuer avec Google",
  "Abriendo Google...": "Ouverture de Google...",
  "Vuelve a la app cuando Google termine.": "Revenez dans l'app quand Google termine.",
  "No se pudo abrir Google.": "Impossible d'ouvrir Google.",
  "Experiencias y traslados en Republica Dominicana": "Experiences et transferts en Republique dominicaine",
  "Descubre Republica Dominicana con reservas claras": "Decouvrez la Republique dominicaine avec des reservations claires",
  "Reserva tours, traslados privados y planes seleccionados con precios transparentes, fotos reales y asistencia local en varios idiomas.":
    "Reservez tours, transferts prives et plans selectionnes avec prix transparents, photos reelles et assistance locale en plusieurs langues.",
  "Atencion para familias, parejas, grupos y viajeros que prefieren organizar todo antes de llegar.":
    "Assistance pour familles, couples, groupes et voyageurs qui preferent tout organiser avant leur arrivee.",
  "Fotos verificadas": "Photos verifiees",
  "Precio transparente": "Prix transparent",
  "Asistencia 24/7": "Assistance 24/7",
  "Explorar tours": "Explorer les tours",
  "Cotizar traslado": "Devis transfert",
  "Experiencias seleccionadas": "Experiences selectionnees",
  "Actividades con detalles, fotos y precios conectados al catalogo web.":
    "Activites avec details, photos et prix connectes au catalogue web.",
  "Busca aeropuertos, hoteles y zonas reales para calcular tu ruta antes de reservar.":
    "Cherchez de vrais aeroports, hotels et zones pour calculer votre trajet avant de reserver.",
  "Reserva con asistencia local": "Reservation avec assistance locale",
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
  return <RNText {...props}>{translateChildren(children, language)}</RNText>;
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
const fallbackTourImage = "https://proactivitis.com/fototours/fotosimple.jpg";
const mobileSessionStorageKey = "proactivitis_mobile_session";
const transferDraftStorageKey = "proactivitis_transfer_draft";
const checkoutDraftStorageKey = "proactivitis_checkout_draft";
const languageStorageKey = "proactivitis_language";
const appBuildLabel = "Version 1.0.6 | Android 6";
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

const googleLoginUrl = () => `${getApiBaseUrl().replace(/\/$/, "")}/mobile-auth/google`;

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

const readStoredJson = async <T,>(key: string) => {
  const raw = await SecureStore.getItemAsync(key).catch(() => null);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const writeStoredJson = async (key: string, value: unknown | null) => {
  if (!value) {
    await SecureStore.deleteItemAsync(key).catch(() => undefined);
    return;
  }
  await SecureStore.setItemAsync(key, JSON.stringify(value)).catch(() => undefined);
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
  free_cancellation: "Cancelacion gratuita",
  flexible_cancellation: "Cancelacion flexible",
  non_refundable: "No reembolsable",
  instant_confirmation: "Confirmacion inmediata",
  manual_confirmation: "Confirmacion manual"
};

const normalizeProductValue = (value?: string | null) => {
  const text = value?.trim();
  if (!text) return text;
  return productValueLabels[text.toLowerCase()] ?? text;
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

const collectRouteLocations = (routes: MobileTransferRoute[]) =>
  mergeLocations(routes.map((route) => route.origin), routes.map((route) => route.destination));

const transferLocationMatches = (locations: LocationSummary[], query: string) => {
  const normalizedQuery = normalizeLocationSearch(query);
  if (normalizedQuery.length < 2) return [];
  return mergeLocations(locations)
    .filter((location) =>
      normalizeLocationSearch(`${location.name} ${location.zoneName ?? ""} ${location.type}`).includes(normalizedQuery)
    )
    .slice(0, 9);
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
  const [stripePublishableKey, setStripePublishableKey] = useState(buildStripePublishableKey);
  const [language, setLanguageState] = useState<AppLanguage | null>(null);
  const [languageReady, setLanguageReady] = useState(false);

  useEffect(() => {
    let active = true;
    readStoredJson<{ language: AppLanguage }>(languageStorageKey)
      .then((stored) => {
        if (active && isAppLanguage(stored?.language)) setLanguageState(stored.language);
      })
      .finally(() => {
        if (active) setLanguageReady(true);
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

  const currentLanguage = language ?? "es";

  return (
    <languageContext.Provider value={{ language: currentLanguage, setLanguage: updateLanguage }}>
      <AppStripeProvider publishableKey={stripePublishableKey}>
        <StripeDeepLinkHandler />
        {languageReady ? (
          language ? (
            <MobileApp stripeReady={Boolean(stripePublishableKey)} />
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
  }, [language]);

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
          <Text style={styles.eyebrow}>Experiencias y traslados en Republica Dominicana</Text>
          <Text style={styles.heroTitle}>Descubre Republica Dominicana con reservas claras</Text>
          <Text style={styles.heroSubtitle}>
            Reserva tours, traslados privados y planes seleccionados con precios transparentes, fotos reales y asistencia local en varios idiomas.
          </Text>
          <Text style={styles.heroHumanNote}>Atencion para familias, parejas, grupos y viajeros que prefieren organizar todo antes de llegar.</Text>
          <View style={styles.heroTrustRow}>
            <Text style={styles.heroTrustPill}>Fotos verificadas</Text>
            <Text style={styles.heroTrustPill}>Precio transparente</Text>
            <Text style={styles.heroTrustPill}>Asistencia 24/7</Text>
          </View>
          <View style={styles.heroActions}>
            <ActionButton label="Explorar tours" icon={Compass} onPress={onOpenTours} />
            <ActionButton label="Cotizar traslado" icon={Car} variant="outline" onPress={onOpenTransfers} />
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
          <Text style={styles.homeBookingText}>Actividades con detalles, fotos y precios conectados al catalogo web.</Text>
        </Pressable>
        <Pressable style={styles.homeBookingCard} onPress={onOpenTransfers}>
          <Text style={styles.homeBookingEmoji}>🚘</Text>
          <Text style={styles.homeBookingTitle}>Traslados privados</Text>
          <Text style={styles.homeBookingText}>Busca aeropuertos, hoteles y zonas reales para calcular tu ruta antes de reservar.</Text>
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
          <Text style={styles.noticeTitle}>Reserva con asistencia local</Text>
          <Text style={styles.noticeText}>
            Completa tus datos en la app y finaliza con checkout seguro. Si necesitas ayuda, nuestro equipo te acompana antes y durante tu experiencia.
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
  const [availableLocations, setAvailableLocations] = useState<LocationSummary[]>(() => collectRouteLocations(fallbackTransferRoutes));
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
  const [draftReady, setDraftReady] = useState(false);

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
      setOriginSearchError("No encontramos coincidencias. Prueba con hotel, aeropuerto o zona.");
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
      setDestinationSearchError("No encontramos coincidencias. Prueba con hotel, aeropuerto o zona.");
    }
  }, [availableLocations, destinationQuery, destination?.name]);

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
  const [draftReady, setDraftReady] = useState(false);

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
      void writeStoredJson(checkoutDraftStorageKey, null);
      void writeStoredJson(transferDraftStorageKey, null);
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
  const { language, setLanguage } = useLanguage();
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

  const openGoogleLogin = async () => {
    setFeedback("Abriendo Google...");
    try {
      await Linking.openURL(googleLoginUrl());
      setFeedback("Vuelve a la app cuando Google termine.");
    } catch {
      setFeedback("No se pudo abrir Google.");
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
          <ActionButton label="Cerrar sesion" icon={User} variant="outlineDark" onPress={() => onSessionChange(null)} />
        </View>
        <View style={styles.cardStack}>
          <LinkRow icon={MessageCircle} title="WhatsApp" subtitle="Soporte directo" onPress={() => openUrl(links.whatsapp)} />
          <LinkRow icon={Compass} title="Web" subtitle="proactivitis.com" onPress={() => openUrl(links.home)} />
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
        <PolicyLinksPanel />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader eyebrow="Cuenta" title="Accede a tus reservas" description="Inicia sesion para guardar tus datos, revisar planes y continuar reservas desde cualquier dispositivo." />
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
  const tr = useTranslate();

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.locationInputShell, selected ? styles.locationInputSelected : null]}>
        <Icon size={18} color={selected ? colors.green : colors.skyDark} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={tr(placeholder) ?? undefined}
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
  const tr = useTranslate();

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={tr(placeholder) ?? undefined}
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
  languageScreen: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.ink,
    padding: 18
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
    color: "#22c55e",
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
