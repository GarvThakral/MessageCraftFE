import type { MessageCraftRequest, MessageCraftResponse } from "./types";
import { readSessionId, readTier } from "./storage";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(
  /\/$/,
  "",
);

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
