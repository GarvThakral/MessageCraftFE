import type { UsageState } from "./types";
import { readUsage, writeUsage } from "./storage";

function getNextMonday(date = new Date()): Date {
  const now = new Date(date);
  const day = now.getDay();
  const diffToMonday = (day + 6) % 7;
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - diffToMonday);
  thisMonday.setHours(0, 0, 0, 0);
  const nextMonday = new Date(thisMonday);
  nextMonday.setDate(thisMonday.getDate() + 7);
  return nextMonday;
}

export function getUsageState(): UsageState {
  const stored = readUsage();
  const resetAt = stored?.resetAt ? new Date(stored.resetAt) : null;
  const now = new Date();

  if (!stored || !resetAt || Number.isNaN(resetAt.getTime()) || now >= resetAt) {
    const nextReset = getNextMonday(now).toISOString();
    const fresh = { count: 0, resetAt: nextReset };
    writeUsage(fresh);
    return fresh;
  }

  return stored;
}

export function incrementUsage(amount = 1): UsageState {
  const current = getUsageState();
  const next = { ...current, count: current.count + amount };
  writeUsage(next);
  return next;
}

export function resetUsage(): UsageState {
  const nextReset = getNextMonday().toISOString();
  const fresh = { count: 0, resetAt: nextReset };
  writeUsage(fresh);
  return fresh;
}
