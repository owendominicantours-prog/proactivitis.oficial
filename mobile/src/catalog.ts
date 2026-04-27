export type TourCategory = "Todos" | "Agua" | "Aventura" | "Cultura" | "Premium";

export type Tour = {
  id: string;
  slug: string;
  title: string;
  category: Exclude<TourCategory, "Todos">;
  location: string;
  duration: string;
  price: number;
  rating: number;
  reviews: number;
  pickup: string;
  image: string;
  description: string;
  highlights: string[];
};

export type TransferVehicle = {
  id: "sedan" | "suv" | "van";
  name: string;
  capacity: string;
  baseMultiplier: number;
  description: string;
};

export type TransferRoute = {
  id: string;
  origin: string;
  destination: string;
  priceFrom: number;
  duration: string;
  slug: string;
};

export const tourCategories: TourCategory[] = ["Todos", "Agua", "Aventura", "Cultura", "Premium"];

export const featuredTours: Tour[] = [
  {
    id: "parasailing-punta-cana",
    slug: "parasailing-punta-cana",
    title: "Aventura en Parasailing en Punta Cana",
    category: "Agua",
    location: "Punta Cana",
    duration: "35-45 min",
    price: 90,
    rating: 4.9,
    reviews: 84,
    pickup: "Pickup hotel disponible",
    image:
      "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/tours/4b7182fc-2041-4f02-a7cb-c34a56b9ae8f/temp-1767057803622/cover-1767057803622-parasail-06-cfOi84q9dxReyhjPnGoQlUzzJRaMAH.webp",
    description: "Vuelo sobre la costa con asistencia local y confirmacion por WhatsApp.",
    highlights: ["Vista aerea del Caribe", "Equipo asegurado", "Soporte local"]
  },
  {
    id: "buggy-atv-punta-cana",
    slug: "excursion-en-buggy-y-atv-en-punta-cana",
    title: "Excursion en Buggy y ATV en Punta Cana",
    category: "Aventura",
    location: "Bavaro / Punta Cana",
    duration: "3 horas",
    price: 30,
    rating: 4.8,
    reviews: 126,
    pickup: "Recogida en zonas seleccionadas",
    image:
      "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/tours/4b7182fc-2041-4f02-a7cb-c34a56b9ae8f/temp-1766103067677/cover-1766103067677-whatsapp-image-2025-10-15-at-9.40.22-am-5-PFSQ6hA7pDZxlmltQ8nltjdVwJnWPp.jpeg",
    description: "Ruta de barro, cueva y playa para viajeros que buscan adrenalina.",
    highlights: ["Buggy o ATV", "Paradas locales", "Confirmacion rapida"]
  },
  {
    id: "saona-punta-cana",
    slug: "tour-y-entrada-para-de-isla-saona-desde-punta-cana",
    title: "Isla Saona desde Punta Cana",
    category: "Premium",
    location: "Bayahibe / Isla Saona",
    duration: "Dia completo",
    price: 60,
    rating: 4.9,
    reviews: 211,
    pickup: "Pickup hotel incluido segun zona",
    image:
      "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/tours/4b7182fc-2041-4f02-a7cb-c34a56b9ae8f/temp-1768120103625/cover-1768120103625-62697bd1c989d954dc4ae124tomando-el-sol-en-el-catamarn-en-isla-saona-min-3g4DKn4AoWhEmnzFIALNcHzLbcNzfA.jpg",
    description: "Playas, catamaran, piscina natural y asistencia durante toda la ruta.",
    highlights: ["Playa Saona", "Almuerzo", "Piscina natural"]
  },
  {
    id: "santo-domingo-cultural",
    slug: "excursion-de-un-dia-a-santo-domingo-desde-punta-cana",
    title: "Santo Domingo desde Punta Cana",
    category: "Cultura",
    location: "Santo Domingo",
    duration: "Dia completo",
    price: 70,
    rating: 4.7,
    reviews: 58,
    pickup: "Salida temprano desde hoteles",
    image:
      "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/tours/4b7182fc-2041-4f02-a7cb-c34a56b9ae8f/temp-1767057402255/cover-1767057402255-62697bd1c989d9fc714ae040tour-santo-domingo--caribe-activo30-uHN4mhQYQ7FGJxuve4Ynf15Psh5QMd.jpg",
    description: "Ruta historica con ciudad colonial, monumentos y guia local.",
    highlights: ["Zona Colonial", "Guia local", "Almuerzo opcional"]
  },
  {
    id: "party-boat-sosua",
    slug: "party-boat-sosua",
    title: "Sosua Party Boat VIP",
    category: "Agua",
    location: "Sosua / Puerto Plata",
    duration: "3 horas",
    price: 65,
    rating: 4.9,
    reviews: 92,
    pickup: "Opciones desde Puerto Plata",
    image:
      "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/tours/4b7182fc-2041-4f02-a7cb-c34a56b9ae8f/temp-1768655731575/cover-1768655731575-caption-8-1Fy42uQS0dKYpuzNQqHSm3SSGj8mRZ.jpg",
    description: "Open bar, snorkeling y ambiente social con soporte de Proactivitis.",
    highlights: ["Open bar", "Snorkeling", "Privado o compartido"]
  }
];

export const transferVehicles: TransferVehicle[] = [
  {
    id: "sedan",
    name: "Sedan",
    capacity: "1-3 pax",
    baseMultiplier: 1,
    description: "Privado y rapido para parejas o viajeros solos."
  },
  {
    id: "suv",
    name: "SUV premium",
    capacity: "1-5 pax",
    baseMultiplier: 1.45,
    description: "Mas espacio, ideal para familias y clientes VIP."
  },
  {
    id: "van",
    name: "Mini van",
    capacity: "1-8 pax",
    baseMultiplier: 1.25,
    description: "Mejor opcion para grupos y equipaje."
  }
];

export const transferRoutes: TransferRoute[] = [
  {
    id: "puj-bavaro",
    origin: "PUJ Airport",
    destination: "Barcelo Bavaro Palace",
    priceFrom: 35,
    duration: "25-35 min",
    slug: "punta-cana-international-airport-to-barcelo-bavaro-palace"
  },
  {
    id: "puj-hard-rock",
    origin: "PUJ Airport",
    destination: "Hard Rock Hotel Punta Cana",
    priceFrom: 55,
    duration: "35-45 min",
    slug: "punta-cana-international-airport-to-hard-rock-hotel-punta-cana"
  },
  {
    id: "puj-cap-cana",
    origin: "PUJ Airport",
    destination: "Secrets Cap Cana",
    priceFrom: 45,
    duration: "20-30 min",
    slug: "punta-cana-international-airport-to-secrets-cap-cana"
  },
  {
    id: "puj-uvero",
    origin: "PUJ Airport",
    destination: "Dreams Onyx Punta Cana",
    priceFrom: 58,
    duration: "40-55 min",
    slug: "punta-cana-international-airport-to-dreams-onyx"
  }
];

export const trustStats = [
  { label: "Transfers", value: "5.000+" },
  { label: "Soporte", value: "24/7" },
  { label: "Idiomas", value: "ES / EN / FR" }
];
