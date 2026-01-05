from pathlib import Path


MISSING_SLUGS = [
    "punta-cana-international-airport-to-barcelo-bavaro-beach",
    "punta-cana-international-airport-to-live-aqua-punta-cana",
    "punta-cana-international-airport-to-margaritaville-cap-cana",
    "punta-cana-international-airport-to-melia-punta-cana-beach",
    "punta-cana-international-airport-to-nickelodeon-punta-cana",
    "punta-cana-international-airport-to-occidental-caribe",
    "punta-cana-international-airport-to-occidental-punta-cana",
    "punta-cana-international-airport-to-ocean-blue-and-sand",
    "punta-cana-international-airport-to-punta-cana-princess",
    "punta-cana-international-airport-to-radisson-blu-punta-cana",
    "punta-cana-international-airport-to-riu-bambu",
    "punta-cana-international-airport-to-riu-naiboa",
    "punta-cana-international-airport-to-riu-palace-bavaro",
    "punta-cana-international-airport-to-riu-palace-macao",
    "punta-cana-international-airport-to-riu-palace-punta-cana",
    "punta-cana-international-airport-to-royalton-bavaro",
    "punta-cana-international-airport-to-royalton-punta-cana",
    "punta-cana-international-airport-to-royalton-splash-punta-cana",
    "punta-cana-international-airport-to-secrets-cap-cana",
    "punta-cana-international-airport-to-secrets-royal-beach",
    "punta-cana-international-airport-to-secrets-royal-beach-preferred",
    "punta-cana-international-airport-to-secrets-tides-punta-cana",
    "punta-cana-international-airport-to-serenade-all-suites-adults-only",
    "punta-cana-international-airport-to-serenade-punta-cana",
    "punta-cana-international-airport-to-tropical-deluxe-princess",
    "punta-cana-international-airport-to-trs-cap-cana",
    "punta-cana-international-airport-to-trs-turquesa",
    "punta-cana-international-airport-to-vista-sol-punta-cana",
    "punta-cana-international-airport-to-westin-puntacana",
    "punta-cana-international-airport-to-whala-bavaro",
    "punta-cana-international-airport-to-zoetry-agua",
]


def slug_to_hotel_name(slug: str) -> str:
    base = slug.split("to-")[-1]
    return base.replace("-", " ").title()


def build_entry(slug: str) -> str:
    hotel_slug = slug.split("to-")[-1]
    hotel_name = slug_to_hotel_name(slug)
    return (
        "  {\n"
        f"    landingSlug: \"{slug}\",\n"
        f"    reverseSlug: \"{hotel_slug}-to-punta-cana-international-airport\",\n"
        f"    hotelSlug: \"{hotel_slug}\",\n"
        f"    hotelName: \"{hotel_name}\",\n"
        f"    heroTitle: \"Punta Cana International Airport (PUJ) → {hotel_name}\",\n"
        f"    heroSubtitle: \"Traslado privado con chofer bilingüe, Wi-Fi y asistencia personalizada hasta {hotel_name}.\",\n"
        "    heroTagline: \"Servicio premium sin esperas ni filas\",\n"
        "    heroImage: \"/transfer/mini van.png\",\n"
        f"    heroImageAlt: \"Transporte premium hacia {hotel_name}\",\n"
        "    priceFrom: 45,\n"
        "    priceDetails: [\"Confirmación instantánea con chofer asignado\", \"60 minutos de espera gratuita en PUJ\", \"Wi-Fi y agua embotellada durante el trayecto\"],\n"
        f"    longCopy: buildLongCopy(\"{hotel_name}\"),\n"
        "    trustBadges: [\"Servicio privado garantizado\", \"Chofer bilingüe | Wi-Fi a bordo\", \"Cancelación flexible 24h\"],\n"
        f"    faq: buildFaq(\"{hotel_name}\"),\n"
        f"    seoTitle: \"Transfer privado PUJ a {hotel_name} | Proactivitis\",\n"
        f"    metaDescription: \"Traslado sin esperas desde Punta Cana International Airport (PUJ) hasta {hotel_name} con confirmación inmediata, Wi-Fi y chofer bilingüe.\",\n"
        f"    keywords: [\"PUJ {hotel_name} transfer\", \"{hotel_name} transfer privado\", \"transfer {hotel_name}\"],\n"
        f"    canonical: \"https://proactivitis.com/transfer/{slug}\"\n"
        "  }"
    )


def main():
    path = Path("data/transfer-landings.ts")
    text = path.read_text(encoding="utf-8")
    marker = "];"
    idx = text.rfind(marker)
    if idx == -1:
        raise SystemExit("Could not locate closing `];` in transfer-landings.ts")
    entries = [build_entry(slug) for slug in MISSING_SLUGS]
    insertion = ",\n".join(entries)
    new_text = text[:idx] + ",\n" + insertion + "\n];" + text[idx + len(marker) :]
    path.write_text(new_text, encoding="utf-8")


if __name__ == "__main__":
    main()
