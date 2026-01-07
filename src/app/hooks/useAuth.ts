import { useCallback, useEffect, useState } from "react";
import type { User } from "../lib/types";
import { fetchMe } from "../lib/api";
import {
  clearAuthToken,
  clearUser,
  readAuthToken,
  readUser,
  writeAuthToken,
  writeTier,
  writeUser,
} from "../lib/storage";

export function useAuth() {
  const [token, setToken] = useState(readAuthToken);
  const [user, setUser] = useState<User | null>(() => (readAuthToken() ? readUser() : null));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let cancelled = false;
    const loadUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const me = await fetchMe();
        if (cancelled) return;
        setUser(me);
        writeUser(me);
        writeTier(me.tier);
      } catch (err) {
        const status =
          err && typeof err === "object" && "status" in err
            ? (err as { status?: number }).status
            : 0;
        if (!cancelled && (status === 401 || status === 403)) {
          clearAuthToken();
          clearUser();
          setToken("");
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    loadUser();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const refresh = useCallback(async () => {
    if (!token) return null;
    setLoading(true);
    try {
      const me = await fetchMe();
      setUser(me);
      writeUser(me);
      writeTier(me.tier);
      return me;
    } catch (err) {
      const status =
        err && typeof err === "object" && "status" in err
          ? (err as { status?: number }).status
          : 0;
      if (status === 401 || status === 403) {
        clearAuthToken();
        clearUser();
        setToken("");
        setUser(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const signIn = useCallback((nextToken: string, nextUser: User) => {
    writeAuthToken(nextToken);
    writeUser(nextUser);
    writeTier(nextUser.tier);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const signOut = useCallback(() => {
    clearAuthToken();
    clearUser();
    writeTier("FREE");
    setToken("");
    setUser(null);
  }, []);

  return {
    token,
    user,
    loading,
    isAuthenticated: Boolean(token),
    signIn,
    signOut,
    refresh,
  };
}
