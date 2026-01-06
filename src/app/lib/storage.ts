import type { ConversationEntry, Preset, Tier, UsageState } from "./types";

const TIER_KEY = "messagecraft_tier";
const USAGE_KEY = "messagecraft_usage";
const HISTORY_KEY = "messagecraft_history";
const PRESETS_KEY = "messagecraft_presets";
const CUSTOMER_KEY = "messagecraft_customer_id";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readTier(): Tier {
  return readJson<Tier>(TIER_KEY, "FREE");
}

export function writeTier(tier: Tier): void {
  writeJson(TIER_KEY, tier);
}

export function readUsage(): UsageState | null {
  return readJson<UsageState | null>(USAGE_KEY, null);
}

export function writeUsage(usage: UsageState): void {
  writeJson(USAGE_KEY, usage);
}

export function readHistory(): ConversationEntry[] {
  return readJson<ConversationEntry[]>(HISTORY_KEY, []);
}

export function writeHistory(entries: ConversationEntry[]): void {
  writeJson(HISTORY_KEY, entries);
}

export function readPresets(): Preset[] {
  return readJson<Preset[]>(PRESETS_KEY, []);
}

export function writePresets(presets: Preset[]): void {
  writeJson(PRESETS_KEY, presets);
}

export function readCustomerId(): string {
  return readJson<string>(CUSTOMER_KEY, "");
}

export function writeCustomerId(customerId: string): void {
  writeJson(CUSTOMER_KEY, customerId);
}
