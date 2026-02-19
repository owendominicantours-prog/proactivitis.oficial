import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BLOCKED_HOSTS = [
  "booking.com",
  "tripadvisor.",
  "expedia.",
  "hotels.com",
  "kayak.",
  "trivago.",
  "viator.",
  "getyourguide.",
  "facebook.com",
  "instagram.com",
  "youtube.com",
  "tiktok.com",
  "x.com",
  "twitter.com",
  "pinterest."
];

const OFFICIAL_URL_HINTS = {
  "bahia-principe-grand-bavaro":
    "https://www.bahia-principe.com/en/resorts-in-dominican-republic/resort-punta-cana/grand-bavaro/",
  "bahia-principe-grand-punta-cana":
    "https://www.bahia-principe.com/en/resorts-in-dominican-republic/resort-punta-cana/grand-punta-cana/",
  "bahia-principe-ambar":
    "https://www.bahia-principe.com/en/resorts-in-dominican-republic/resort-punta-cana/luxury-ambar/",
  "barcelo-bavaro-beach": "https://www.barcelo.com/en-us/barcelo-bavaro-beach/",
  "barcelo-bavaro-palace": "https://www.barcelo.com/en-us/barcelo-bavaro-palace/",
  "barcelo-santo-domingo": "https://www.barcelo.com/en-us/barcelo-santo-domingo/",
  "breathless-punta-cana": "https://www.hyattinclusivecollection.com/en/resorts-hotels/breathless/",
  "dreams-flora": "https://www.hyattinclusivecollection.com/en/resorts-hotels/dreams/",
  "dreams-macao-beach": "https://www.hyattinclusivecollection.com/en/resorts-hotels/dreams/",
  "dreams-onyx": "https://www.hyattinclusivecollection.com/en/resorts-hotels/dreams/",
  "dreams-royal-beach": "https://www.hyattinclusivecollection.com/en/resorts-hotels/dreams/",
  "secrets-cap-cana": "https://www.hyattinclusivecollection.com/en/resorts-hotels/secrets/",
  "secrets-royal-beach-preferred": "https://www.hyattinclusivecollection.com/en/resorts-hotels/secrets/",
  "secrets-royal-beach": "https://www.hyattinclusivecollection.com/en/resorts-hotels/secrets/",
  "secrets-tides-punta-cana": "https://www.hyattinclusivecollection.com/en/resorts-hotels/secrets/",
  "zoetry-agua": "https://www.hyattinclusivecollection.com/en/resorts-hotels/zoetry/",
  "hyatt-zilara-cap-cana": "https://www.hyatt.com/en-US/hotel/dominican-republic/hyatt-zilara-cap-cana/pujif",
  "hyatt-ziva-cap-cana": "https://www.hyatt.com/en-US/hotel/dominican-republic/hyatt-ziva-cap-cana/pujif",
  "hard-rock-hotel-punta-cana": "https://www.hrhpc.com/",
  "eden-roc-cap-cana": "https://www.edenroccapcana.com/",
  "lopesan-costa-bavaro": "https://www.lopesan.com/en/hotels/dominican-republic/punta-cana/lopesan-costa-bavaro-resort-spa-casino/",
  "majestic-colonial": "https://www.majestic-resorts.com/en/our-resorts/majestic-colonial-punta-cana/",
  "majestic-elegance": "https://www.majestic-resorts.com/en/our-resorts/majestic-elegance-punta-cana/",
  "majestic-mirage": "https://www.majestic-resorts.com/en/our-resorts/majestic-mirage-punta-cana/",
  "melia-caribe-beach": "https://www.melia.com/en/hotels/dominican-republic/punta-cana/melia-caribe-beach-resort",
  "melia-punta-cana-beach": "https://www.melia.com/en/hotels/dominican-republic/punta-cana/melia-punta-cana-beach",
  "paradisus-palma-real":
    "https://www.melia.com/en/hotels/dominican-republic/punta-cana/paradisus-palma-real-golf-and-spa-resort",
  "paradisus-grand-cana": "https://www.melia.com/en/hotels/dominican-republic/punta-cana/paradisus-grand-cana",
  "iberostar-grand-bavaro": "https://www.iberostar.com/en/hotels/punta-cana/",
  "iberostar-bavaro-suites": "https://www.iberostar.com/en/hotels/punta-cana/",
  "grand-palladium-punta-cana": "https://www.palladiumhotelgroup.com/en/hotels/dominicanrepublic/puntacana",
  "trs-turquesa": "https://www.palladiumhotelgroup.com/en/hotels/dominicanrepublic/puntacana/trs-turquesa-hotel",
  "trs-cap-cana": "https://www.palladiumhotelgroup.com/en/hotels/dominicanrepublic/capcana/trs-cap-cana-waterfront-marina-hotel",
  "excellence-punta-cana": "https://www.excellenceresorts.com/punta-cana/excellence-punta-cana/",
  "finest-punta-cana": "https://www.finestresorts.com/punta-cana/finest-punta-cana/",
  "riu-bambu": "https://www.riu.com/en/hotel/dominican-republic/punta-cana/",
  "riu-naiboa": "https://www.riu.com/en/hotel/dominican-republic/punta-cana/",
  "riu-palace-bavaro": "https://www.riu.com/en/hotel/dominican-republic/punta-cana/",
  "riu-palace-macao": "https://www.riu.com/en/hotel/dominican-republic/punta-cana/",
  "riu-palace-punta-cana": "https://www.riu.com/en/hotel/dominican-republic/punta-cana/",
  "riu-republica": "https://www.riu.com/en/hotel/dominican-republic/punta-cana/",
  "royalton-bavaro": "https://www.royaltonresorts.com/",
  "royalton-punta-cana": "https://www.royaltonresorts.com/",
  "royalton-splash-punta-cana": "https://www.royaltonresorts.com/",
  "nickelodeon-punta-cana": "https://www.karismahotels.com/",
  "margaritaville-cap-cana": "https://www.karismahotels.com/",
  "westin-puntacana": "https://www.marriott.com/",
  "four-points-puntacana-village": "https://www.marriott.com/",
  "courtyard-marriott-santo-domingo": "https://www.marriott.com/",
  "jw-marriott-santo-domingo": "https://www.marriott.com/",
  "renaissance-jaragua-santo-domingo": "https://www.marriott.com/",
  "sheraton-santo-domingo": "https://www.marriott.com/",
  "holiday-inn-santo-domingo": "https://www.ihg.com/",
  "crowne-plaza-santo-domingo": "https://www.ihg.com/",
  "intercontinental-real-santo-domingo": "https://www.ihg.com/",
  "radisson-santo-domingo": "https://www.radissonhotels.com/",
  "radisson-blu-punta-cana": "https://www.radissonhotels.com/",
  "catalonia-bavaro": "https://www.cataloniahotels.com/en/hotel/catalonia-bavaro-beach-golf-casino-resort",
  "catalonia-santo-domingo": "https://www.cataloniahotels.com/en/hotel/catalonia-santo-domingo",
  "whala-bavaro": "https://www.whalahotels.com/",
  "vista-sol-punta-cana": "https://www.vistasolhotels.com/"
};

const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);
const getArgValue = (flag, fallback = "") => {
  const found = args.find((item) => item.startsWith(`${flag}=`));
  if (!found) return fallback;
  return found.slice(flag.length + 1).trim();
};

const limit = Number(getArgValue("--limit", "0")) || 0;
const targetSlug = getArgValue("--slug", "");
const refresh = hasFlag("--refresh");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cleanText = (value = "") => value.replace(/\s+/g, " ").trim();

const shorten = (value = "", max = 165) => {
  const cleaned = cleanText(value);
  if (cleaned.length <= max) return cleaned;
  const cut = cleaned.slice(0, max);
  const edge = cut.lastIndexOf(" ");
  return `${cut.slice(0, edge > 70 ? edge : max)}...`;
};

const getHotelTokens = (hotelName) =>
  cleanText(hotelName)
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4);

const isRelevantMeta = (hotelName, meta) => {
  const haystack = `${meta.title || ""} ${meta.description || ""} ${meta.url || ""}`.toLowerCase();
  const tokens = getHotelTokens(hotelName);
  if (!tokens.length) return true;
  const matched = tokens.filter((token) => haystack.includes(token)).length;
  return matched >= Math.min(2, tokens.length);
};

const isBlocked = (hostname) => BLOCKED_HOSTS.some((blocked) => hostname.includes(blocked));

const absoluteUrl = (value, base) => {
  if (!value) return "";
  try {
    return new URL(value, base).toString();
  } catch {
    return "";
  }
};

const extractMeta = (html, selector) => {
  const regexes = [
    new RegExp(`<meta[^>]+property=["']${selector}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${selector}["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+name=["']${selector}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${selector}["'][^>]*>`, "i")
  ];
  for (const regex of regexes) {
    const match = html.match(regex);
    if (match?.[1]) return cleanText(match[1]);
  }
  return "";
};

const extractTitle = (html) => {
  const ogTitle = extractMeta(html, "og:title");
  if (ogTitle) return ogTitle;
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return cleanText(match?.[1] ?? "");
};

const parseDuckResultLink = (rawHref) => {
  if (!rawHref) return "";
  try {
    const prefixed = rawHref.startsWith("//") ? `https:${rawHref}` : rawHref;
    const url = new URL(prefixed);
    const redirected = url.searchParams.get("uddg");
    if (redirected) return decodeURIComponent(redirected);
    return prefixed;
  } catch {
    return "";
  }
};

const decodeHtmlEntities = (value = "") =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const decodeBingUParam = (uParam) => {
  if (!uParam) return "";
  let payload = uParam;
  if (payload.startsWith("a1")) payload = payload.slice(2);
  payload = payload.replace(/-/g, "+").replace(/_/g, "/");
  while (payload.length % 4 !== 0) payload += "=";
  try {
    const decoded = Buffer.from(payload, "base64").toString("utf8");
    if (decoded.startsWith("http://") || decoded.startsWith("https://")) return decoded;
  } catch {
    return "";
  }
  return "";
};

const parseBingResultLink = (rawHref) => {
  if (!rawHref) return "";
  const href = decodeHtmlEntities(rawHref);
  if (href.startsWith("http://") || href.startsWith("https://")) {
    try {
      const url = new URL(href);
      if (url.hostname.includes("bing.com")) {
        const u = url.searchParams.get("u");
        const decoded = decodeBingUParam(u);
        return decoded || href;
      }
      return href;
    } catch {
      return "";
    }
  }
  return "";
};

const findBingCandidates = async (hotelName) => {
  const query = encodeURIComponent(`"${hotelName}" punta cana resort official site`);
  const url = `https://www.bing.com/search?q=${query}&setlang=en`;
  let html = "";
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
      }
    });
    if (!response.ok) return [];
    html = await response.text();
  } catch {
    return [];
  }
  const links = [];
  const regex = /<li class="b_algo"[\s\S]*?<a[^>]+href="([^"]+)"/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const href = parseBingResultLink(match[1] || "");
    if (!href) continue;
    try {
      const hostname = new URL(href).hostname.replace(/^www\./, "").toLowerCase();
      if (isBlocked(hostname)) continue;
      links.push(href);
    } catch {
      continue;
    }
  }
  return Array.from(new Set(links)).slice(0, 5);
};

const findOfficialCandidates = async (hotelName) => {
  const query = encodeURIComponent(`"${hotelName}" punta cana resort official site`);
  const url = `https://duckduckgo.com/html/?q=${query}`;
  let html = "";
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
      }
    });
    if (!response.ok) return [];
    html = await response.text();
  } catch {
    return [];
  }
  const links = [];
  const regex = /<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const parsed = parseDuckResultLink(match[1]);
    if (!parsed) continue;
    try {
      const hostname = new URL(parsed).hostname.replace(/^www\./, "").toLowerCase();
      if (isBlocked(hostname)) continue;
      links.push(parsed);
    } catch {
      continue;
    }
  }
  return Array.from(new Set(links)).slice(0, 5);
};

const scrapePageMeta = async (url) => {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml"
    },
    redirect: "follow"
  });
  if (!response.ok) return null;
  const finalUrl = response.url || url;
  const html = await response.text();
  const image =
    absoluteUrl(extractMeta(html, "og:image"), finalUrl) ||
    absoluteUrl(extractMeta(html, "twitter:image"), finalUrl) ||
    absoluteUrl(extractMeta(html, "twitter:image:src"), finalUrl) ||
    absoluteUrl(extractMeta(html, "image"), finalUrl);
  const title = extractTitle(html);
  const description = extractMeta(html, "og:description") || extractMeta(html, "description");
  if (!title && !description && !image) return null;
  return {
    url: finalUrl,
    image,
    title: cleanText(title),
    description: cleanText(description)
  };
};

const pickBestMeta = async (hotelName, preferredUrl) => {
  if (preferredUrl) {
    try {
      const preferred = await scrapePageMeta(preferredUrl);
      if (preferred && (preferred.title || preferred.description || preferred.image)) {
        return preferred;
      }
    } catch {
      // continue to search fallback
    }
  }

  const [bingCandidates, duckCandidates] = await Promise.all([
    findBingCandidates(hotelName),
    findOfficialCandidates(hotelName)
  ]);
  const candidates = Array.from(new Set([...bingCandidates, ...duckCandidates])).slice(0, 8);
  for (const candidate of candidates) {
    try {
      const meta = await scrapePageMeta(candidate);
      if (!meta) continue;
      if (!isRelevantMeta(hotelName, meta)) continue;
      if (meta.image || meta.description || meta.title) {
        return meta;
      }
    } catch {
      continue;
    }
  }
  return null;
};

const run = async () => {
  const [hotels, existingSetting] = await Promise.all([
    prisma.transferLocation.findMany({
      where: {
        type: "HOTEL",
        active: true,
        ...(targetSlug ? { slug: targetSlug } : {})
      },
      select: { slug: true, name: true, description: true, heroImage: true },
      orderBy: { name: "asc" },
      ...(limit > 0 ? { take: limit } : {})
    }),
    prisma.siteContentSetting.findUnique({
      where: { key: "HOTEL_DIRECTORY_ENRICHMENT" },
      select: { content: true }
    })
  ]);

  const content = (existingSetting?.content ?? {}) || {};
  let updated = 0;

  for (const hotel of hotels) {
    const current = content[hotel.slug];
    if (!refresh && current?.coverImage && current?.shortDescription) {
      console.log(`skip ${hotel.slug} (already enriched)`);
      continue;
    }

    console.log(`enrich ${hotel.slug} -> ${hotel.name}`);
    const preferredUrl = OFFICIAL_URL_HINTS[hotel.slug] ?? "";
    const meta = await pickBestMeta(hotel.name, preferredUrl);
    if (!meta) {
      console.log(`  no metadata found`);
      await sleep(350);
      continue;
    }

    const shortDescription = shorten(meta.description || hotel.description || hotel.name, 150);
    content[hotel.slug] = {
      officialUrl: meta.url,
      coverImage: meta.image || current?.coverImage || "",
      shortDescription,
      seoTitle: meta.title || current?.seoTitle || hotel.name,
      metaDescription: shorten(meta.description || current?.metaDescription || shortDescription, 160),
      updatedAt: new Date().toISOString()
    };

    if (!hotel.heroImage && meta.image) {
      await prisma.transferLocation.update({
        where: { slug: hotel.slug },
        data: { heroImage: meta.image }
      });
    }

    updated += 1;
    await sleep(350);
  }

  await prisma.siteContentSetting.upsert({
    where: { key: "HOTEL_DIRECTORY_ENRICHMENT" },
    update: { content },
    create: { key: "HOTEL_DIRECTORY_ENRICHMENT", content }
  });

  console.log(`done. enriched hotels: ${updated}`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
