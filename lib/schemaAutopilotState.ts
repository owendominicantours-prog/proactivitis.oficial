import { prisma } from "@/lib/prisma";
import type { Locale } from "@/lib/translations";

export type SchemaAutopilotProcessedItem = {
  slug: string;
  locale: Locale;
  status: string;
  detail?: string;
};

export type SchemaAutopilotState = {
  cursor: number;
  lastRunAt?: string;
  lastProcessed?: SchemaAutopilotProcessedItem[];
};

export const SCHEMA_AUTOPILOT_KEY = "SCHEMA_MANAGER_AUTOPILOT";

export async function getSchemaAutopilotState(): Promise<SchemaAutopilotState> {
  const record = await prisma.siteContentSetting.findUnique({ where: { key: SCHEMA_AUTOPILOT_KEY } });
  if (!record?.content || typeof record.content !== "object" || Array.isArray(record.content)) {
    return { cursor: 0 };
  }

  const content = record.content as { cursor?: unknown; lastRunAt?: unknown; lastProcessed?: unknown };
  return {
    cursor: typeof content.cursor === "number" ? content.cursor : 0,
    lastRunAt: typeof content.lastRunAt === "string" ? content.lastRunAt : undefined,
    lastProcessed: Array.isArray(content.lastProcessed)
      ? (content.lastProcessed.filter((item) => typeof item === "object" && item !== null) as SchemaAutopilotProcessedItem[])
      : undefined
  };
}

export async function saveSchemaAutopilotState(state: SchemaAutopilotState) {
  await prisma.siteContentSetting.upsert({
    where: { key: SCHEMA_AUTOPILOT_KEY },
    update: { content: state as unknown as object },
    create: { key: SCHEMA_AUTOPILOT_KEY, content: state as unknown as object }
  });
}
