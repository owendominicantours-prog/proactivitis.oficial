const TRANSLATION_URL = process.env.TRANSLATION_API_URL;

async function translateViaApi(text: string, target: string) {
  if (!text) return text;
  if (TRANSLATION_URL) {
    const response = await fetch(TRANSLATION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "es",
        target
      })
    });
    if (!response.ok) {
      throw new Error(`translation failed: ${response.statusText}`);
    }
    const json = await response.json();
    return json.translatedText as string;
  }

  const params = new URLSearchParams({
    client: "gtx",
    sl: "es",
    tl: target,
    dt: "t",
    q: text
  });
  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`translation failed: ${response.statusText}`);
  }
  const body = await response.text();
  const json = JSON.parse(body);
  const segments = json[0];
  return segments.map((segment: unknown[]) => segment[0]).join("");
}

export async function translateText(text: string, target: string) {
  if (!text) return text;
  return translateViaApi(text, target);
}

export async function translateEntries(items: string[], target: string) {
  return Promise.all(items.map((item) => translateText(item, target)));
}
