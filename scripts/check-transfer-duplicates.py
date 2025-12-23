import re
from collections import Counter
from pathlib import Path


def extract_hotel_names(name: str) -> list[str]:
    text = Path("scripts/seed-transfer-hotels.ts").read_text()
    start = text.split(f"const {name} = ")[1]
    block = start[: start.index("};", start.index("{")) + 1]
    return re.findall(r"\"([^\\\"]+)\"", block)


directory_names = extract_hotel_names("directory")
extra_directory_names = extract_hotel_names("extraDirectory")

all_names = directory_names + extra_directory_names
normalized = [name.lower() for name in all_names]
duplicates = [name for name, count in Counter(normalized).items() if count > 1]

print(f"Total hoteles cargados: {len(all_names)}")
print(f"Duplicados detectados: {len(duplicates)}")
if duplicates:
    print("Ejemplos de duplicados:", duplicates[:10])
