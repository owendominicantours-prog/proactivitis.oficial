from pathlib import Path


INSERTS = {
    "messages/es.json": [
        '  "notFound.eyebrow": "Ups",',
        '  "notFound.title": "No encontramos tu pagina",',
        '  "notFound.body": "Pero te ofrecemos experiencias y traslados listos para reservar.",',
        '  "notFound.search.label": "Buscar tours",',
        '  "notFound.search.placeholder": "Ej. Punta Cana, Saona, aventura",',
        '  "notFound.search.cta": "Buscar",',
        '  "notFound.tours.eyebrow": "Tours",',
        '  "notFound.tours.title": "Experiencias recomendadas",',
        '  "notFound.transfers.eyebrow": "Transfers",',
        '  "notFound.transfers.title": "Traslados privados destacados",',
        '  "notFound.transfers.cardTag": "Traslado privado",',
        '  "notFound.transfers.cardCta": "Ver traslado"'
    ],
    "messages/en.json": [
        '  "notFound.eyebrow": "Oops",',
        '  "notFound.title": "We could not find that page",',
        '  "notFound.body": "But here are tours and transfers ready to book.",',
        '  "notFound.search.label": "Search tours",',
        '  "notFound.search.placeholder": "Ex. Punta Cana, Saona, adventure",',
        '  "notFound.search.cta": "Search",',
        '  "notFound.tours.eyebrow": "Tours",',
        '  "notFound.tours.title": "Recommended experiences",',
        '  "notFound.transfers.eyebrow": "Transfers",',
        '  "notFound.transfers.title": "Featured private transfers",',
        '  "notFound.transfers.cardTag": "Private transfer",',
        '  "notFound.transfers.cardCta": "View transfer"'
    ],
    "messages/fr.json": [
        '  "notFound.eyebrow": "Oups",',
        '  "notFound.title": "Page introuvable",',
        '  "notFound.body": "Mais voici des tours et transferts disponibles.",',
        '  "notFound.search.label": "Rechercher des tours",',
        '  "notFound.search.placeholder": "Ex. Punta Cana, Saona, aventure",',
        '  "notFound.search.cta": "Rechercher",',
        '  "notFound.tours.eyebrow": "Tours",',
        '  "notFound.tours.title": "Experiences recommandees",',
        '  "notFound.transfers.eyebrow": "Transferts",',
        '  "notFound.transfers.title": "Transferts prives recommandes",',
        '  "notFound.transfers.cardTag": "Transfert prive",',
        '  "notFound.transfers.cardCta": "Voir le transfert"'
    ]
}


def append_keys(path: str, lines: list[str]) -> None:
    file_path = Path(path)
    text = file_path.read_text(encoding="latin-1")
    if '"notFound.eyebrow"' in text:
        return
    trimmed = text.rstrip()
    if not trimmed.endswith("}"):
        raise ValueError(f"{path} does not end with a JSON object")
    updated = trimmed[:-1] + ",\n" + "\n".join(lines) + "\n}\n"
    file_path.write_text(updated, encoding="latin-1")


for file_path, lines in INSERTS.items():
    append_keys(file_path, lines)
