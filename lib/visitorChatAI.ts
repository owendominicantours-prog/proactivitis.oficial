import { prisma } from "@/lib/prisma";

type ChatHistoryItem = {
  senderRole: string;
  content: string;
};

type AIInput = {
  message: string;
  pagePath?: string;
  history?: ChatHistoryItem[];
};

const OPENAI_API_URL = "https://api.openai.com/v1/responses";

const buildCatalogContext = async () => {
  const [tours, hotels, transfers] = await Promise.all([
    prisma.tour.findMany({
      select: { title: true, slug: true, price: true, duration: true, shortDescription: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 20
    }),
    prisma.transferLocation.findMany({
      where: { type: "HOTEL", active: true },
      select: { name: true, slug: true },
      orderBy: { name: "asc" },
      take: 40
    }),
    prisma.transferDestination.findMany({
      select: { name: true, slug: true },
      orderBy: { updatedAt: "desc" },
      take: 25
    })
  ]);

  return {
    tours: tours.map((tour) => ({
      title: tour.title,
      slug: tour.slug,
      price: Math.round(tour.price),
      duration: tour.duration,
      url: `https://proactivitis.com/tours/${tour.slug}`,
      shortDescription: tour.shortDescription ?? ""
    })),
    hotels: hotels.map((hotel) => ({
      name: hotel.name,
      slug: hotel.slug,
      url: `https://proactivitis.com/hoteles/${hotel.slug}`,
      transferUrl: `https://proactivitis.com/traslado?origin=PUJ&to=${hotel.slug}`
    })),
    transfers: transfers.map((transfer) => ({
      name: transfer.name,
      slug: transfer.slug,
      url: `https://proactivitis.com/transfer/${transfer.slug}`
    }))
  };
};

export async function generateVisitorAIReply({ message, pagePath, history }: AIInput): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const catalog = await buildCatalogContext();

  const systemPrompt = `
You are "Admin Proactivitis", a human-like sales advisor for https://proactivitis.com.

Goals:
1) Speak naturally, short and useful, like a real salesperson.
2) Never sound robotic or mention being automated.
3) Guide step-by-step for booking: date -> hotel -> pax -> direct link.
4) Recommend only products that exist in provided catalog context.
5) If user asks "why that option", explain clearly using fit, price, duration.
6) Do not mix languages; reply in user's language (Spanish/English/French).
7) If user just greets, greet back and ask what they want (transfer, tour, hotel).
8) Always include actionable next step.
9) Keep answer concise (max ~8 lines).
10) For links, include full URLs so frontend can render clickable chips.

Business rules:
- Priority: close sales.
- For transfers, collect arrival date + hotel before sending transfer link.
- If hotel identified, send transfer URL with origin=PUJ&to=<hotelSlug> and optionally date/pax if known.
- Upsell tours after transfer.
`;

  const inputPayload = {
    system: systemPrompt,
    pagePath: pagePath ?? "",
    userMessage: message,
    conversationHistory: (history ?? []).slice(-20),
    catalog
  };

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
      input: JSON.stringify(inputPayload),
      max_output_tokens: 450
    })
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.error("[visitor-chat-ai] OpenAI error", response.status, errorBody);
    return null;
  }

  const data = (await response.json()) as {
    output_text?: string;
  };

  const text = data.output_text?.trim();
  return text && text.length > 0 ? text : null;
}
