const TRANSLATION_URL = process.env.TRANSLATION_API_URL;
const MAX_TRANSLATION_CHARS = 1800;

const splitPlainTextChunk = (text: string, maxChars: number) => {
  const chunks: string[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const remaining = text.length - cursor;
    if (remaining <= maxChars) {
      chunks.push(text.slice(cursor));
      break;
    }

    const end = cursor + maxChars;
    const window = text.slice(cursor, end);
    const boundaryCandidates = [
      window.lastIndexOf("\n\n"),
      window.lastIndexOf("\n"),
      window.lastIndexOf(". "),
      window.lastIndexOf(", "),
      window.lastIndexOf(" ")
    ];
    const boundary = boundaryCandidates.find((index) => index > 250) ?? -1;
    const splitAt = boundary > -1 ? cursor + boundary + 1 : end;
    chunks.push(text.slice(cursor, splitAt));
    cursor = splitAt;
  }

  return chunks.filter((chunk) => chunk.trim().length > 0);
};

const splitHtmlText = (html: string, maxChars: number) => {
  const parts = html.split(/(<[^>]+>)/g).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const part of parts) {
    if (part.startsWith("<") && part.endsWith(">")) {
      if (current.length + part.length <= maxChars) {
        current += part;
      } else {
        if (current.trim().length > 0) chunks.push(current);
        current = part;
      }
      continue;
    }

    const textParts = splitPlainTextChunk(part, maxChars);
    for (const textPart of textParts) {
      if (current.length + textPart.length <= maxChars) {
        current += textPart;
      } else {
        if (current.trim().length > 0) chunks.push(current);
        current = textPart;
      }
    }
  }

  if (current.trim().length > 0) chunks.push(current);
  return chunks;
};

const chunkText = (text: string, maxChars: number) => {
  if (text.length <= maxChars) return [text];
  const looksLikeHtml = /<[^>]+>/.test(text);
  return looksLikeHtml ? splitHtmlText(text, maxChars) : splitPlainTextChunk(text, maxChars);
};

async function translateViaApi(text: string, target: string, source: string) {
  if (!text || (target === source && source !== "auto")) return text;
  if (TRANSLATION_URL) {
    const response = await fetch(TRANSLATION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source,
        target
      })
    });
    if (!response.ok) {
      throw new Error(`translation failed: ${response.status} ${response.statusText}`);
    }
    const json = await response.json();
    return json.translatedText as string;
  }

  const params = new URLSearchParams({
    client: "gtx",
    sl: source,
    tl: target,
    dt: "t",
    q: text
  });
  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`translation failed: ${response.status} ${response.statusText}`);
  }
  const body = await response.text();
  const json = JSON.parse(body);
  const segments = json[0];
  return segments.map((segment: unknown[]) => segment[0]).join("");
}

export async function translateText(text: string, target: string, source = "es") {
  if (!text) return text;
  const chunks = chunkText(text, MAX_TRANSLATION_CHARS);
  const translatedParts: string[] = [];

  for (const chunk of chunks) {
    translatedParts.push(await translateViaApi(chunk, target, source));
  }

  return translatedParts.join("");
}

export async function translateEntries(items: string[], target: string, source = "es") {
  return Promise.all(items.map((item) => translateText(item, target, source)));
}
