import re
from pathlib import Path
text = Path('components/checkout/CheckoutFlow.tsx').read_text()
keys = re.findall(r't\("([^"]+)"', text)
print("\n".join(keys))
