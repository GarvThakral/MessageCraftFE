import type { MessageCraftRequest, MessageCraftResponse } from "./types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(
  /\/$/,
  "",
);

export async function fetchMessageCraft(
  payload: MessageCraftRequest,
): Promise<MessageCraftResponse> {
  const response = await fetch(`${API_BASE_URL}/api/messagecraft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data?.detail === "string" ? data.detail : "Request failed";
    throw new Error(message);
  }

  return data as MessageCraftResponse;
}

export async function createCheckoutSession(payload: {
  plan: "STARTER" | "PRO";
  billing_cycle: "weekly" | "monthly";
  success_url: string;
  cancel_url: string;
}): Promise<{ url: string }> {
  const response = await fetch(`${API_BASE_URL}/api/stripe/checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.url) {
    const message = typeof data?.detail === "string" ? data.detail : "Checkout failed";
    throw new Error(message);
  }

  return data as { url: string };
}

export async function createPortalSession(payload: {
  customer_id: string;
  return_url: string;
}): Promise<{ url: string }> {
  const response = await fetch(`${API_BASE_URL}/api/stripe/portal-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.url) {
    const message = typeof data?.detail === "string" ? data.detail : "Portal failed";
    throw new Error(message);
  }

  return data as { url: string };
}

export async function verifyCheckoutSession(
  sessionId: string,
): Promise<{ tier: string; customer_id?: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`,
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.tier) {
    const message = typeof data?.detail === "string" ? data.detail : "Verification failed";
    throw new Error(message);
  }

  return data as { tier: string; customer_id?: string };
}
