import { formatDate } from "../lib/utils";

interface UsageBannerProps {
  used: number;
  limit: number;
  resetAt: string;
  notice?: string;
  onUpgrade: () => void;
}

export default function UsageBanner({
  used,
  limit,
  resetAt,
  notice,
  onUpgrade,
}: UsageBannerProps) {
  const limitLabel = Number.isFinite(limit) ? `${used} of ${limit}` : "Unlimited";

  return (
    <div className="rounded-2xl bg-white/70 px-5 py-3 text-sm text-[#6f6a83] shadow">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>
          {limitLabel} translations used this week. Resets {formatDate(resetAt)}.
        </span>
        {Number.isFinite(limit) && (
          <button
            onClick={onUpgrade}
            className="rounded-full bg-[#3d3854] px-4 py-2 text-xs font-semibold text-white"
          >
            Upgrade
          </button>
        )}
      </div>
      {notice ? <p className="mt-2 text-xs text-[#9b96aa]">{notice}</p> : null}
    </div>
  );
}
