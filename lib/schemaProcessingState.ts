import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { Locale } from "@/lib/translations";

export type SchemaProcessingState = {
  reviewGeneratedAt?: string;
  reviewModel?: string;
  reviewSource?: "manual" | "autopilot";
  overrideAppliedAt?: string;
  overrideAppliedSource?: "manual" | "autopilot";
  lastAutopilotStatus?: string;
  lastAutopilotDetail?: string;
  lastAutopilotRunAt?: string;
};

type SchemaProcessingStore = {
  transfer?: Record<string, Partial<Record<Locale, SchemaProcessingState>>>;
};

const SCHEMA_PROCESSING_STATE_KEY = "SCHEMA_PROCESSING_STATE";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toJson = (value: unknown) => value as Prisma.InputJsonValue;

async function getStore(): Promise<SchemaProcessingStore> {
  try {
    const record = await prisma.siteContentSetting.findUnique({
      where: { key: SCHEMA_PROCESSING_STATE_KEY }
    });
    if (!record?.content || !isObject(record.content)) return {};
    return record.content as SchemaProcessingStore;
  } catch {
    return {};
  }
}

async function saveStore(store: SchemaProcessingStore) {
  await prisma.siteContentSetting.upsert({
    where: { key: SCHEMA_PROCESSING_STATE_KEY },
    update: { content: toJson(store) },
    create: { key: SCHEMA_PROCESSING_STATE_KEY, content: toJson(store) }
  });
}

export async function listSchemaProcessingStates(): Promise<
  Array<{ slug: string; locale: Locale; state: SchemaProcessingState }>
> {
  const store = await getStore();
  const transfer = store.transfer ?? {};

  return Object.entries(transfer)
    .flatMap(([slug, locales]) =>
      Object.entries(locales ?? {}).flatMap(([locale, state]) =>
        state
          ? [
              {
                slug,
                locale: locale as Locale,
                state
              }
            ]
          : []
      )
    )
    .sort((a, b) => {
      const aTime = new Date(a.state.reviewGeneratedAt ?? a.state.overrideAppliedAt ?? 0).getTime();
      const bTime = new Date(b.state.reviewGeneratedAt ?? b.state.overrideAppliedAt ?? 0).getTime();
      return bTime - aTime;
    });
}

export async function updateSchemaProcessingState(
  slug: string,
  locale: Locale,
  patch: Partial<SchemaProcessingState>
) {
  const store = await getStore();
  const current = store.transfer?.[slug]?.[locale] ?? {};
  const nextStore: SchemaProcessingStore = {
    ...store,
    transfer: {
      ...(store.transfer ?? {}),
      [slug]: {
        ...(store.transfer?.[slug] ?? {}),
        [locale]: {
          ...current,
          ...patch
        }
      }
    }
  };

  await saveStore(nextStore);
}
