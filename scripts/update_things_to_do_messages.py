from pathlib import Path


INSERTS = {
    "messages/es.json": [
        '  "thingsToDo.eyebrow": "Que hacer en",',
        '  "thingsToDo.title": "{hotel}",',
        '  "thingsToDo.subtitle": "Proactivitis recomienda {hotel} y experiencias cercanas para tu viaje. Reserva tours y traslados con confirmacion inmediata.",',
        '  "thingsToDo.meta.title": "Que hacer en {hotel} | Tours y traslados Proactivitis",',
        '  "thingsToDo.meta.description": "Proactivitis recomienda {hotel} y experiencias cercanas. Reserva tours y traslados con confirmacion inmediata.",',
        '  "thingsToDo.cta.tours": "Ver tours",',
        '  "thingsToDo.cta.transfers": "Ver traslados",',
        '  "thingsToDo.tours.eyebrow": "Tours",',
        '  "thingsToDo.tours.title": "Excursiones recomendadas",',
        '  "thingsToDo.transfers.eyebrow": "Transfers",',
        '  "thingsToDo.transfers.title": "Traslados privados recomendados",',
        '  "thingsToDo.transfers.cardTag": "Traslado privado",',
        '  "thingsToDo.transfers.cardCta": "Ver traslado",',
        '  "thingsToDo.transfers.fallback": "Traslado privado disponible desde el aeropuerto.",',
        '  "thingsToDo.schema.description": "Que hacer en {hotel}: tours y traslados recomendados por Proactivitis."'
    ],
    "messages/en.json": [
        '  "thingsToDo.eyebrow": "Things to do in",',
        '  "thingsToDo.title": "{hotel}",',
        '  "thingsToDo.subtitle": "Proactivitis recommends {hotel} and nearby experiences. Book tours and transfers with instant confirmation.",',
        '  "thingsToDo.meta.title": "Things to do in {hotel} | Proactivitis tours and transfers",',
        '  "thingsToDo.meta.description": "Proactivitis recommends {hotel} and nearby experiences. Book tours and transfers with instant confirmation.",',
        '  "thingsToDo.cta.tours": "View tours",',
        '  "thingsToDo.cta.transfers": "View transfers",',
        '  "thingsToDo.tours.eyebrow": "Tours",',
        '  "thingsToDo.tours.title": "Recommended excursions",',
        '  "thingsToDo.transfers.eyebrow": "Transfers",',
        '  "thingsToDo.transfers.title": "Recommended private transfers",',
        '  "thingsToDo.transfers.cardTag": "Private transfer",',
        '  "thingsToDo.transfers.cardCta": "View transfer",',
        '  "thingsToDo.transfers.fallback": "Private transfer available from the airport.",',
        '  "thingsToDo.schema.description": "Things to do in {hotel}: tours and transfers recommended by Proactivitis."'
    ],
    "messages/fr.json": [
        '  "thingsToDo.eyebrow": "Things to do in",',
        '  "thingsToDo.title": "{hotel}",',
        '  "thingsToDo.subtitle": "Proactivitis recommande {hotel} et des experiences a proximite. Reservez des tours et transferts avec confirmation immediate.",',
        '  "thingsToDo.meta.title": "Things to do in {hotel} | Tours et transferts Proactivitis",',
        '  "thingsToDo.meta.description": "Proactivitis recommande {hotel} et des experiences a proximite. Reservez des tours et transferts avec confirmation immediate.",',
        '  "thingsToDo.cta.tours": "Voir les tours",',
        '  "thingsToDo.cta.transfers": "Voir les transferts",',
        '  "thingsToDo.tours.eyebrow": "Tours",',
        '  "thingsToDo.tours.title": "Excursions recommandees",',
        '  "thingsToDo.transfers.eyebrow": "Transferts",',
        '  "thingsToDo.transfers.title": "Transferts prives recommandes",',
        '  "thingsToDo.transfers.cardTag": "Transfert prive",',
        '  "thingsToDo.transfers.cardCta": "Voir le transfert",',
        '  "thingsToDo.transfers.fallback": "Transfert prive disponible depuis l aeroport.",',
        '  "thingsToDo.schema.description": "Things to do in {hotel}: tours et transferts recommandes par Proactivitis."'
    ]
}


def append_keys(path: str, lines: list[str]) -> None:
    file_path = Path(path)
    text = file_path.read_text(encoding="latin-1")
    if '"thingsToDo.eyebrow"' in text:
        return
    trimmed = text.rstrip()
    if not trimmed.endswith("}"):
        raise ValueError(f"{path} does not end with a JSON object")
    updated = trimmed[:-1] + ",\n" + "\n".join(lines) + "\n}\n"
    file_path.write_text(updated, encoding="latin-1")


for file_path, lines in INSERTS.items():
    append_keys(file_path, lines)
