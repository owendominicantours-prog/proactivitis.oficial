# -*- coding: utf-8 -*-
from pathlib import Path
path = Path('app/(public)/layout.tsx')
text = path.read_text(encoding='cp1252')
text = text.replace('¸', '©')
path.write_text(text, encoding='utf-8')
