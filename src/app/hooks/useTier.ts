import { useCallback, useEffect, useMemo, useState } from "react";
import { canTranslate, TIERS } from "../lib/tiers";
import type { Tier, UsageState } from "../lib/types";
import { incrementUsage, getUsageState } from "../lib/usage";
import { readTier, writeTier, writeUsage } from "../lib/storage";
import { fetchUsage } from "../lib/api";

export function useTierState(authToken?: string) {
  const [tier, setTier] = useState<Tier>(readTier);
  const [usage, setUsage] = useState<UsageState>(getUsageState);

  useEffect(() => {
    writeTier(tier);
  }, [tier]);

  useEffect(() => {
    if (!authToken) {
      setTier("FREE");
    }
  }, [authToken]);

  useEffect(() => {
    setUsage(getUsageState());
  }, []);

  useEffect(() => {
    let cancelled = false;
    const syncUsage = async () => {
      if (!authToken) {
        return;
      }
      try {
        const serverUsage = await fetchUsage();
        if (cancelled) return;
        const nextTier =
          serverUsage.tier === "PRO"
            ? "PRO"
            : serverUsage.tier === "STARTER"
              ? "STARTER"
              : "FREE";
        const next = { count: serverUsage.count, resetAt: serverUsage.reset_at };
        setTier(nextTier);
        setUsage(next);
        writeUsage(next);
      } catch {
        // Keep local usage if server is unavailable.
      }
    };
    syncUsage();
    return () => {
      cancelled = true;
    };
  }, [tier, authToken]);

  const recordUsage = useCallback(
    (amount = 1) => {
      const next = incrementUsage(amount);
      setUsage(next);
      return next;
    },
    [setUsage],
  );

  const updateUsage = useCallback(
    (count: number, resetAt: string) => {
      const next = { count, resetAt };
      setUsage(next);
      writeUsage(next);
    },
    [setUsage],
  );

  const remaining = useMemo(() => {
    const limit = TIERS[tier].weeklyLimit;
    if (!Number.isFinite(limit)) return Infinity;
    return Math.max(0, limit - usage.count);
  }, [tier, usage.count]);

  const canRun = useMemo(() => {
    if (!authToken) return false;
    return canTranslate(tier, usage.count);
  }, [tier, usage.count, authToken]);

  return {
    tier,
    setTier,
    usage,
    remaining,
    canRun,
    recordUsage,
    updateUsage,
  };
}
