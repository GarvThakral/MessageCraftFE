import type { MessageCraftRequest, MessageCraftResponse, TierStatus, User } from "./types";
import { readAuthToken, readRefreshToken, readSessionId, readTier } from "./storage";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(
  /\/$/,
  "",
);
const FETCH_OPTIONS = { credentials: "include" as const };
const COOKIE_AUTH = (import.meta.env.VITE_USE_COOKIE_AUTH || "").toString() === "true";

function authHeaders(): Record<string, string> {
  const token = readAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function cookieHeaders(): Record<string, string> {
  return COOKIE_AUTH ? { "X-Use-Cookie": "true" } : {};
}

export async function fetchMessageCraft(
  payload: MessageCraftRequest,
): Promise<MessageCraftResponse> {
  const sessionId = readSessionId();
  const tier = readTier();
  const response = await fetch(`${API_BASE_URL}/api/messagecraft`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": sessionId,
      "X-User-Tier": tier,
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
    ...FETCH_OPTIONS,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : typeof detail?.message === "string"
          ? detail.message
          : "Request failed";
    throw new Error(message);
  }

  return data as MessageCraftResponse;
}

export async function fetchUsage(): Promise<{
  tier: string;
  count: number;
  limit: number | null;
  reset_at: string;
}> {
  const sessionId = readSessionId();
  const tier = readTier();
  const response = await fetch(`${API_BASE_URL}/api/usage`, {
    headers: {
      "X-Session-Id": sessionId,
      "X-User-Tier": tier,
      ...authHeaders(),
    },
    ...FETCH_OPTIONS,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : typeof detail?.message === "string"
          ? detail.message
          : "Usage lookup failed";
    throw new Error(message);
  }

  return data as { tier: string; count: number; limit: number | null; reset_at: string };
}

export async function createConversationEntry(payload: {
  contact: string;
  input_text: string;
  output_text: string;
  tone_key: string;
  tone_scores: MessageCraftResponse["analysis"]["tone_scores"];
  impact_prediction: number;
  clarity_before: number;
  clarity_after: number;
}): Promise<{ status: string }> {
  const sessionId = readSessionId();
  const tier = readTier();
  const response = await fetch(`${API_BASE_URL}/api/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": sessionId,
      "X-User-Tier": tier,
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
    ...FETCH_OPTIONS,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : typeof detail?.message === "string"
          ? detail.message
          : "Conversation save failed";
    throw new Error(message);
  }

  return data as { status: string };
}

export async function fetchConversations(contact?: string): Promise<{
  entries: Array<{
    id: string;
    contact: string;
    tone_key: string;
    tone_scores: MessageCraftResponse["analysis"]["tone_scores"];
    impact_prediction: number;
    clarity_before: number;
    clarity_after: number;
    created_at: string;
  }>;
}> {
  const sessionId = readSessionId();
  const tier = readTier();
  const url = new URL(`${API_BASE_URL}/api/conversations`);
  if (contact) {
    url.searchParams.set("contact", contact);
  }

  const response = await fetch(url.toString(), {
    headers: {
      "X-Session-Id": sessionId,
      "X-User-Tier": tier,
      ...authHeaders(),
    },
    ...FETCH_OPTIONS,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : typeof detail?.message === "string"
          ? detail.message
          : "Conversation fetch failed";
    throw new Error(message);
  }

  return data as {
    entries: Array<{
      id: string;
      contact: string;
      tone_key: string;
      tone_scores: MessageCraftResponse["analysis"]["tone_scores"];
      impact_prediction: number;
      clarity_before: number;
      clarity_after: number;
      created_at: string;
    }>;
  };
}

export async function signup(payload: {
  username: string;
  email: string;
  password: string;
}): Promise<{ token: string; refresh_token: string; user: User }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...cookieHeaders() },
    body: JSON.stringify(payload),
    ...FETCH_OPTIONS,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.token) {
    const message = typeof data?.detail === "string" ? data.detail : "Signup failed";
    throw new Error(message);
  }

  return data as { token: string; refresh_token: string; user: User };
}

export async function login(payload: {
  username: string;
  password: string;
}): Promise<{ token: string; refresh_token: string; user: User }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...cookieHeaders() },
    body: JSON.stringify(payload),
    ...FETCH_OPTIONS,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.token) {
    const message = typeof data?.detail === "string" ? data.detail : "Login failed";
    throw new Error(message);
  }

  return data as { token: string; refresh_token: string; user: User };
}

export async function fetchMe(): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      ...authHeaders(),
    },
    ...FETCH_OPTIONS,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.id) {
    const message = typeof data?.detail === "string" ? data.detail : "Failed to fetch user";
    const error = new Error(message);
    (error as { status?: number }).status = response.status;
    throw error;
  }

  return data as User;
}

export async function refreshSession(refreshToken?: string): Promise<{
  token: string;
  refresh_token: string;
  user: User;
}> {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...cookieHeaders() },
    body: JSON.stringify({ refresh_token: refreshToken || readRefreshToken() }),
    ...FETCH_OPTIONS,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.token) {
    const message = typeof data?.detail === "string" ? data.detail : "Session refresh failed";
    const error = new Error(message);
    (error as { status?: number }).status = response.status;
    throw error;
  }

  return data as { token: string; refresh_token: string; user: User };
}

export async function verifyEmail(token: string): Promise<{ verified: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
    ...FETCH_OPTIONS,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data?.detail === "string" ? data.detail : "Verification failed";
    throw new Error(message);
  }
  return data as { verified: boolean };
}

export async function resendVerification(): Promise<{ sent: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    ...FETCH_OPTIONS,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data?.detail === "string" ? data.detail : "Resend failed";
    throw new Error(message);
  }
  return data as { sent: boolean };
}

export async function requestPasswordReset(email: string): Promise<{ sent: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    ...FETCH_OPTIONS,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data?.detail === "string" ? data.detail : "Reset request failed";
    throw new Error(message);
  }
  return data as { sent: boolean };
}

export async function resetPassword(payload: {
  token: string;
  password: string;
}): Promise<{ reset: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    ...FETCH_OPTIONS,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data?.detail === "string" ? data.detail : "Reset failed";
    throw new Error(message);
  }
  return data as { reset: boolean };
}

export async function fetchTierStatus(): Promise<TierStatus> {
  const response = await fetch(`${API_BASE_URL}/api/account/tier-status`, {
    headers: { ...authHeaders() },
    ...FETCH_OPTIONS,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data?.detail === "string" ? data.detail : "Tier lookup failed";
    throw new Error(message);
  }
  return data as TierStatus;
}

export async function createDodoCheckoutLink(tier: "STARTER" | "PRO"): Promise<{
  checkout_url: string;
}> {
  const response = await fetch(`${API_BASE_URL}/api/payments/dodo/checkout-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ tier }),
    ...FETCH_OPTIONS,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.checkout_url) {
    const message = typeof data?.detail === "string" ? data.detail : "Checkout link failed";
    throw new Error(message);
  }

  return data as { checkout_url: string };
}
