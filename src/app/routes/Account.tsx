import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchTierStatus, resendVerification } from "../lib/api";
import type { TierStatus } from "../lib/types";
import { useAuth } from "../hooks/useAuth";

export default function Account() {
  const { user, isAuthenticated } = useAuth();
  const [tierStatus, setTierStatus] = useState<TierStatus | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const load = async () => {
      try {
        const status = await fetchTierStatus();
        if (!cancelled) {
          setTierStatus(status);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load tier status.";
          setError(message);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const handleResend = async () => {
    setNotice("");
    setError("");
    setLoading(true);
    try {
      await resendVerification();
      setNotice("Verification email sent.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to resend verification.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#f3e5e8] via-[#f0eef5] to-[#e8f2f7] flex items-center justify-center px-6">
        <div className="rounded-3xl bg-white/90 p-8 text-center shadow-xl">
          <h1 className="text-2xl font-semibold text-[#3d3854]">Sign in to view your account</h1>
          <p className="mt-3 text-sm text-[#7d7890]">
            Access your tier status and renewal details.
          </p>
          <Link
            to="/auth"
            className="mt-6 inline-flex rounded-full bg-[#3d3854] px-5 py-2 text-xs font-semibold text-white"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f3e5e8] via-[#f0eef5] to-[#e8f2f7] px-6 py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b2a8c6]">
              Account
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[#3d3854]">Your plan details</h1>
          </div>
          <Link to="/" className="text-sm text-[#7d7890]">
            Back to app
          </Link>
        </header>

        <div className="rounded-3xl bg-white/90 p-6 shadow-xl">
          <h2 className="text-sm font-semibold text-[#3d3854]">Profile</h2>
          <p className="mt-3 text-sm text-[#6f6a83]">Username: {user?.username}</p>
          <p className="mt-1 text-sm text-[#6f6a83]">Email: {user?.email || "Not set"}</p>
          <p className="mt-1 text-sm text-[#6f6a83]">
            Email verified: {user?.email_verified ? "Yes" : "No"}
          </p>
          {!user?.email_verified && (
            <button
              onClick={handleResend}
              disabled={loading}
              className="mt-4 rounded-full border border-[#e5e7eb] px-4 py-2 text-xs font-semibold text-[#7d7890]"
            >
              {loading ? "Sending..." : "Resend verification"}
            </button>
          )}
          {notice ? <p className="mt-2 text-xs text-[#6bb38b]">{notice}</p> : null}
          {error ? <p className="mt-2 text-xs text-[#b9586b]">{error}</p> : null}
        </div>

        <div className="rounded-3xl bg-white/90 p-6 shadow-xl">
          <h2 className="text-sm font-semibold text-[#3d3854]">Tier status</h2>
          <p className="mt-3 text-sm text-[#6f6a83]">
            Current tier: {tierStatus?.current_tier || user?.tier}
          </p>
          <p className="mt-1 text-sm text-[#6f6a83]">
            Expires on:{" "}
            {tierStatus?.tier_expires_at
              ? new Date(tierStatus.tier_expires_at).toLocaleDateString()
              : "No expiry"}
          </p>
          <p className="mt-1 text-sm text-[#6f6a83]">
            Days remaining:{" "}
            {tierStatus?.days_remaining != null ? tierStatus.days_remaining : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
