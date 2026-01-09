import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { resetPassword } from "../lib/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setStatus("");
    const token = searchParams.get("token");
    if (!token) {
      setError("Missing reset token.");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token, password });
      setStatus("Password reset. You can log in now.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Reset failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f3e5e8] via-[#f0eef5] to-[#e8f2f7] flex items-center justify-center px-6">
      <div className="max-w-xl rounded-3xl bg-white/90 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-[#3d3854]">Reset your password</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b96aa]">
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-full border border-[#e5e7eb] px-4 py-2 text-sm text-[#4a4561]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b96aa]">
              Confirm password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="mt-2 w-full rounded-full border border-[#e5e7eb] px-4 py-2 text-sm text-[#4a4561]"
            />
          </div>
          {status ? <p className="text-sm text-[#6bb38b]">{status}</p> : null}
          {error ? <p className="text-sm text-[#b9586b]">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#3d3854] px-4 py-3 text-sm font-semibold text-white"
          >
            {loading ? "Saving..." : "Reset password"}
          </button>
        </form>
        <Link to="/auth" className="mt-4 inline-flex text-xs text-[#7d7890] hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
