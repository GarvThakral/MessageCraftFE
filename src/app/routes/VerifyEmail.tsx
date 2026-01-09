import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { verifyEmail } from "../lib/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Verifying your email...");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("Missing verification token.");
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        await verifyEmail(token);
        if (!cancelled) {
          setStatus("Email verified. You can sign in now.");
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Verification failed.";
          setError(message);
          setStatus("Verification failed.");
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f3e5e8] via-[#f0eef5] to-[#e8f2f7] flex items-center justify-center px-6">
      <div className="max-w-xl rounded-3xl bg-white/90 p-8 text-center shadow-xl">
        <h1 className="text-2xl font-semibold text-[#3d3854]">{status}</h1>
        {error ? <p className="mt-3 text-sm text-[#b9586b]">{error}</p> : null}
        <Link
          to="/auth"
          className="mt-6 inline-flex rounded-full bg-[#3d3854] px-5 py-2 text-xs font-semibold text-white"
        >
          Go to sign in
        </Link>
      </div>
    </div>
  );
}
