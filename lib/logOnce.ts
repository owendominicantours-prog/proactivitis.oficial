type LogLevel = "warn" | "error";

declare global {
  // eslint-disable-next-line no-var
  var __proactivitisLoggedKeys: Set<string> | undefined;
}

const getStore = () => {
  if (!globalThis.__proactivitisLoggedKeys) {
    globalThis.__proactivitisLoggedKeys = new Set<string>();
  }
  return globalThis.__proactivitisLoggedKeys;
};

const logOnce = (level: LogLevel, key: string, ...args: unknown[]) => {
  const store = getStore();
  if (store.has(key)) return;
  store.add(key);
  if (level === "error") {
    console.error(...args);
    return;
  }
  console.warn(...args);
};

export const warnOnce = (key: string, ...args: unknown[]) => logOnce("warn", key, ...args);
export const errorOnce = (key: string, ...args: unknown[]) => logOnce("error", key, ...args);

