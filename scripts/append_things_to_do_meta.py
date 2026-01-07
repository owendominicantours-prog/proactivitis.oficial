from pathlib import Path


INSERTS = {
    "messages/es.json": [
        '  "thingsToDo.meta.title": "Que hacer en {hotel} | Tours y traslados Proactivitis",',
        '  "thingsToDo.meta.description": "Proactivitis recomienda {hotel} y experiencias cercanas. Reserva tours y traslados con confirmacion inmediata."'
    ],
    "messages/en.json": [
        '  "thingsToDo.meta.title": "Things to do in {hotel} | Proactivitis tours and transfers",',
        '  "thingsToDo.meta.description": "Proactivitis recommends {hotel} and nearby experiences. Book tours and transfers with instant confirmation."'
    ],
    "messages/fr.json": [
        '  "thingsToDo.meta.title": "Things to do in {hotel} | Tours et transferts Proactivitis",',
        '  "thingsToDo.meta.description": "Proactivitis recommande {hotel} et des experiences a proximite. Reservez des tours et transferts avec confirmation immediate."'
    ]
}


def append_keys(path: str, lines: list[str]) -> None:
    file_path = Path(path)
    text = file_path.read_text(encoding="latin-1")
    if '"thingsToDo.meta.title"' in text:
        return
    trimmed = text.rstrip()
    if not trimmed.endswith("}"):
        raise ValueError(f"{path} does not end with a JSON object")
    updated = trimmed[:-1] + ",\n" + "\n".join(lines) + "\n}\n"
    file_path.write_text(updated, encoding="latin-1")


for file_path, lines in INSERTS.items():
    append_keys(file_path, lines)
