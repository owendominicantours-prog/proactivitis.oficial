from pathlib import Path
import re
content = Path('data/transfer-landings.ts').read_text(encoding='utf-8')
pattern = r"landingSlug:\s*['\"]([^'\"]+)['\"]"
slugs = set(re.findall(pattern, content))
given = [
    'punta-cana-international-airport-to-bahia-principe-grand-punta-cana',
    'punta-cana-international-airport-to-bahia-principe-luxury-ambar',
    'punta-cana-international-airport-to-bahia-principe-luxury-esmeralda',
    'punta-cana-international-airport-to-barcelo-bavaro-beach',
    'punta-cana-international-airport-to-live-aqua-punta-cana',
    'punta-cana-international-airport-to-majestic-mirage',
    'punta-cana-international-airport-to-margaritaville-cap-cana',
    'punta-cana-international-airport-to-melia-caribe-beach',
    'punta-cana-international-airport-to-melia-punta-cana-beach',
    'punta-cana-international-airport-to-nickelodeon-punta-cana',
    'punta-cana-international-airport-to-occidental-caribe',
    'punta-cana-international-airport-to-occidental-punta-cana',
    'punta-cana-international-airport-to-ocean-blue-and-sand',
    'punta-cana-international-airport-to-paradisus-palma-real',
    'punta-cana-international-airport-to-punta-cana-princess',
    'punta-cana-international-airport-to-radisson-blu-punta-cana',
    'punta-cana-international-airport-to-riu-bambu',
    'punta-cana-international-airport-to-riu-naiboa',
    'punta-cana-international-airport-to-riu-palace-bavaro',
    'punta-cana-international-airport-to-riu-palace-macao',
    'punta-cana-international-airport-to-riu-palace-punta-cana',
    'punta-cana-international-airport-to-royalton-bavaro',
    'punta-cana-international-airport-to-royalton-punta-cana',
    'punta-cana-international-airport-to-royalton-splash-punta-cana',
    'punta-cana-international-airport-to-secrets-cap-cana',
    'punta-cana-international-airport-to-secrets-royal-beach',
    'punta-cana-international-airport-to-secrets-royal-beach-preferred',
    'punta-cana-international-airport-to-secrets-tides-punta-cana',
    'punta-cana-international-airport-to-serenade-all-suites-adults-only',
    'punta-cana-international-airport-to-serenade-punta-cana',
    'punta-cana-international-airport-to-tropical-deluxe-princess',
    'punta-cana-international-airport-to-trs-cap-cana',
    'punta-cana-international-airport-to-trs-turquesa',
    'punta-cana-international-airport-to-vista-sol-punta-cana',
    'punta-cana-international-airport-to-westin-puntacana',
    'punta-cana-international-airport-to-whala-bavaro',
    'punta-cana-international-airport-to-zoetry-agua',
]
missing = [slug for slug in given if slug not in slugs]
print('manual count:', len(slugs))
print('missing count:', len(missing))
print('\\n'.join(missing))
