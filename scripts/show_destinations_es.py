from pathlib import Path

text = Path("messages/es.json").read_text()
needle = '"destinations.note.verifying"'
idx = text.index(needle)
line_end = text.index("\n", idx)
print(repr(text[idx:line_end + 1]))
