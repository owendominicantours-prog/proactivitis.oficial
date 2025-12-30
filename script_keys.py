import re
from pathlib import Path
text = Path('components/checkout/CheckoutFlow.tsx').read_text()
keys = re.findall(r't\("([^"]+)"', text)
unique = sorted(set(k for k in keys if k.strip()))
print('\n'.join(unique), end='')
