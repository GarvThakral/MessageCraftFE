import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export default function PaymentSuccess() {
  const { user, isAuthenticated, refresh } = useAuth();
  const [status, setStatus] = useState("Finalizing your upgrade...");

  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      const refreshed = await refresh();
      if (cancelled) return;
      if (refreshed) {
        setStatus(`You're now on ${refreshed.tier}.`);
      } else {
        setStatus("Sign in to see your upgraded plan.");
      }
    };
    sync();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f3e5e8] via-[#f0eef5] to-[#e8f2f7] flex items-center justify-center px-6">
      <div className="max-w-xl rounded-3xl bg-white/90 p-8 text-center shadow-xl">
        <h1 className="text-3xl font-semibold text-[#3d3854]">{status}</h1>
        <p className="mt-4 text-sm text-[#7d7890]">
          {isAuthenticated
            ? "Your payment is processing. Your plan will unlock shortly."
            : "Log in to verify your upgrade."}
        </p>
        {user && (
          <p className="mt-3 text-xs text-[#9b96aa]">
            Signed in as {user.username}. Current tier: {user.tier}.
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-full bg-[#3d3854] px-6 py-3 text-sm font-semibold text-white"
          >
            Go to the app
          </Link>
          <Link
            to="/pricing"
            className="rounded-full border border-[#e5e7eb] px-6 py-3 text-sm font-semibold text-[#7d7890]"
          >
            View pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
