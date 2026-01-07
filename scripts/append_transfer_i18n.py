from pathlib import Path


INSERTS = {
    "messages/es.json": [
        '  "transferLanding.hero.label": "Transfer desde PUJ",',
        '  "transferLanding.route.label": "Ruta fija:",',
        '  "transferLanding.faq.eyebrow": "FAQ",',
        '  "transferLanding.faq.title": "Preguntas frecuentes",',
        '  "transferLanding.other.title": "Otras rutas desde el aeropuerto",',
        '  "transferLanding.backLink": "Volver desde {hotel} al aeropuerto",',
        '  "transferLanding.schema.serviceType": "Transfer privado al hotel {hotel}",',
        '  "transferLanding.schema.area": "Punta Cana",',
        '  "transferLanding.schema.catalogName": "Transfers desde Punta Cana",',
        '  "transferLanding.schema.offerName": "Transfer privado a {hotel}",',
        '  "transferLanding.breadcrumb.home": "Inicio",',
        '  "transferLanding.breadcrumb.transfers": "Transfers",',
        '  "transferQuote.error": "No fue posible calcular la tarifa. Intenta nuevamente.",',
        '  "transferQuote.datetime": "Fecha y hora",',
        '  "transferQuote.passengers": "Pasajeros",',
        '  "transferQuote.oneWay": "Solo ida",',
        '  "transferQuote.roundTrip": "Ida y vuelta",',
        '  "transferQuote.priceFrom": "Precio desde ${price} por pasajero. Datos actualizados instantaneamente.",',
        '  "transferQuote.updating": "Actualizando tarifas...",',
        '  "transferQuote.passengerRange": "{min}-{max} pasajeros",',
        '  "transferQuote.totalRoundTrip": "total (ida y vuelta)",',
        '  "transferQuote.perTrip": "por trayecto",',
        '  "transferQuote.bullets.private": "Transfer privado y directo",',
        '  "transferQuote.bullets.ac": "Aire acondicionado y Wi-Fi",',
        '  "transferQuote.bullets.support": "Chofer verificado y soporte 24/7",',
        '  "transferQuote.reserve": "Reservar ahora",',
        '  "transferQuote.noRates": "Ajusta los pasajeros o fecha para ver tarifas disponibles."'
    ],
    "messages/en.json": [
        '  "transferLanding.hero.label": "Airport transfer from PUJ",',
        '  "transferLanding.route.label": "Fixed route:",',
        '  "transferLanding.faq.eyebrow": "FAQ",',
        '  "transferLanding.faq.title": "Frequently asked questions",',
        '  "transferLanding.other.title": "Other routes from the airport",',
        '  "transferLanding.backLink": "Return from {hotel} to the airport",',
        '  "transferLanding.schema.serviceType": "Private transfer to {hotel}",',
        '  "transferLanding.schema.area": "Punta Cana",',
        '  "transferLanding.schema.catalogName": "Transfers from Punta Cana",',
        '  "transferLanding.schema.offerName": "Private transfer to {hotel}",',
        '  "transferLanding.breadcrumb.home": "Home",',
        '  "transferLanding.breadcrumb.transfers": "Transfers",',
        '  "transferQuote.error": "We could not calculate the fare. Please try again.",',
        '  "transferQuote.datetime": "Date and time",',
        '  "transferQuote.passengers": "Passengers",',
        '  "transferQuote.oneWay": "One way",',
        '  "transferQuote.roundTrip": "Round trip",',
        '  "transferQuote.priceFrom": "Prices from ${price} per passenger. Updated instantly.",',
        '  "transferQuote.updating": "Updating fares...",',
        '  "transferQuote.passengerRange": "{min}-{max} passengers",',
        '  "transferQuote.totalRoundTrip": "total (round trip)",',
        '  "transferQuote.perTrip": "per trip",',
        '  "transferQuote.bullets.private": "Private door-to-door transfer",',
        '  "transferQuote.bullets.ac": "Air conditioning and Wi-Fi",',
        '  "transferQuote.bullets.support": "Verified driver and 24/7 support",',
        '  "transferQuote.reserve": "Reserve now",',
        '  "transferQuote.noRates": "Adjust passengers or date to see available fares."'
    ],
    "messages/fr.json": [
        '  "transferLanding.hero.label": "Transfert depuis PUJ",',
        '  "transferLanding.route.label": "Route fixe:",',
        '  "transferLanding.faq.eyebrow": "FAQ",',
        '  "transferLanding.faq.title": "Questions frequentes",',
        '  "transferLanding.other.title": "Autres routes depuis l aeroport",',
        '  "transferLanding.backLink": "Retour de {hotel} vers l aeroport",',
        '  "transferLanding.schema.serviceType": "Transfert prive vers {hotel}",',
        '  "transferLanding.schema.area": "Punta Cana",',
        '  "transferLanding.schema.catalogName": "Transferts depuis Punta Cana",',
        '  "transferLanding.schema.offerName": "Transfert prive vers {hotel}",',
        '  "transferLanding.breadcrumb.home": "Accueil",',
        '  "transferLanding.breadcrumb.transfers": "Transferts",',
        '  "transferQuote.error": "Impossible de calculer le tarif. Reessayez.",',
        '  "transferQuote.datetime": "Date et heure",',
        '  "transferQuote.passengers": "Passagers",',
        '  "transferQuote.oneWay": "Aller simple",',
        '  "transferQuote.roundTrip": "Aller-retour",',
        '  "transferQuote.priceFrom": "Prix a partir de ${price} par passager. Mise a jour instantanee.",',
        '  "transferQuote.updating": "Mise a jour des tarifs...",',
        '  "transferQuote.passengerRange": "{min}-{max} passagers",',
        '  "transferQuote.totalRoundTrip": "total (aller-retour)",',
        '  "transferQuote.perTrip": "par trajet",',
        '  "transferQuote.bullets.private": "Transfert prive porte-a-porte",',
        '  "transferQuote.bullets.ac": "Climatisation et Wi-Fi",',
        '  "transferQuote.bullets.support": "Chauffeur verifie et support 24/7",',
        '  "transferQuote.reserve": "Reserver",',
        '  "transferQuote.noRates": "Ajustez les passagers ou la date pour voir les tarifs."'
    ]
}


def append_keys(path: str, lines: list[str]) -> None:
    file_path = Path(path)
    text = file_path.read_text(encoding="latin-1")
    if '"transferLanding.hero.label"' in text:
        return
    trimmed = text.rstrip()
    if not trimmed.endswith("}"):
        raise ValueError(f"{path} does not end with a JSON object")
    updated = trimmed[:-1] + ",\n" + "\n".join(lines) + "\n}\n"
    file_path.write_text(updated, encoding="latin-1")


for file_path, lines in INSERTS.items():
    append_keys(file_path, lines)
