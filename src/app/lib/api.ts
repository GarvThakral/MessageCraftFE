import type { MessageCraftRequest, MessageCraftResponse, User } from "./types";
import { readAuthToken, readSessionId, readTier } from "./storage";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(
  /\/$/,
  "",
);

function authHeaders(): Record<string, string> {
  const token = readAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
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
  password: string;
}): Promise<{ token: string; user: User }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.token) {
    const message = typeof data?.detail === "string" ? data.detail : "Signup failed";
    throw new Error(message);
  }

  return data as { token: string; user: User };
}

export async function login(payload: {
  username: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.token) {
    const message = typeof data?.detail === "string" ? data.detail : "Login failed";
    throw new Error(message);
  }

  return data as { token: string; user: User };
}

export async function fetchMe(): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      ...authHeaders(),
    },
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

export async function updateAccountTier(tier: "FREE" | "STARTER" | "PRO"): Promise<{
  tier: string;
}> {
  const response = await fetch(`${API_BASE_URL}/api/account/tier`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ tier }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.tier) {
    const message = typeof data?.detail === "string" ? data.detail : "Tier update failed";
    throw new Error(message);
  }

  return data as { tier: string };
}

export async function createDodoCheckoutLink(tier: "STARTER" | "PRO"): Promise<{
  checkout_url: string;
}> {
  const response = await fetch(`${API_BASE_URL}/api/payments/dodo/checkout-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ tier }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.checkout_url) {
    const message = typeof data?.detail === "string" ? data.detail : "Checkout link failed";
    throw new Error(message);
  }

  return data as { checkout_url: string };
}
