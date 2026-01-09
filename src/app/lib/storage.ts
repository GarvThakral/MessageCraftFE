import type { ConversationEntry, Preset, Tier, UsageState, User } from "./types";

const TIER_KEY = "tier";
const USAGE_KEY = "messagecraft_usage";
const HISTORY_KEY = "messagecraft_history";
const PRESETS_KEY = "messagecraft_presets";
const SESSION_KEY = "messagecraft_session_id";
const AUTH_TOKEN_KEY = "messagecraft_auth_token";
const REFRESH_TOKEN_KEY = "messagecraft_refresh_token";
const USER_KEY = "messagecraft_user";

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
  if (typeof window === "undefined") return "FREE";
  const stored = window.localStorage.getItem(TIER_KEY);
  const parsed = stored
    ? (() => {
        try {
          return JSON.parse(stored);
        } catch {
          return stored;
        }
      })()
    : "FREE";
  const raw = String(parsed).toUpperCase();
  if (raw === "STARTER" || raw === "PRO" || raw === "FREE") {
    return raw as Tier;
  }
  return "FREE";
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

export function readSessionId(): string {
  const stored = readJson<string>(SESSION_KEY, "");
  if (stored) return stored;
  const newId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `mc-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  writeJson(SESSION_KEY, newId);
  return newId;
}

export function readAuthToken(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

export function writeAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function readRefreshToken(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(REFRESH_TOKEN_KEY) || "";
}

export function writeRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearRefreshToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function readUser(): User | null {
  return readJson<User | null>(USER_KEY, null);
}

export function writeUser(user: User): void {
  writeJson(USER_KEY, user);
}

export function clearUser(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USER_KEY);
}
