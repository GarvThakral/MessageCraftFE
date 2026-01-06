import { useCallback, useEffect, useMemo, useState } from "react";
import { canTranslate, TIERS } from "../lib/tiers";
import type { Tier, UsageState } from "../lib/types";
import { incrementUsage, getUsageState } from "../lib/usage";
import { readTier, writeTier, writeUsage } from "../lib/storage";
import { fetchUsage } from "../lib/api";

export function useTierState() {
  const [tier, setTier] = useState<Tier>(readTier);
  const [usage, setUsage] = useState<UsageState>(getUsageState);

  useEffect(() => {
    writeTier(tier);
  }, [tier]);

  useEffect(() => {
    setUsage(getUsageState());
  }, []);

  useEffect(() => {
    let cancelled = false;
    const syncUsage = async () => {
      try {
        const serverUsage = await fetchUsage();
        if (cancelled) return;
        const next = { count: serverUsage.count, resetAt: serverUsage.reset_at };
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
  }, [tier]);

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

  const canRun = useMemo(() => canTranslate(tier, usage.count), [tier, usage.count]);

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
