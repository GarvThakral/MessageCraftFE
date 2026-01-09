import { useCallback, useEffect, useState } from "react";
import type { User } from "../lib/types";
import { fetchMe, refreshSession } from "../lib/api";
import {
  clearAuthToken,
  clearRefreshToken,
  clearUser,
  readAuthToken,
  readRefreshToken,
  readUser,
  writeAuthToken,
  writeRefreshToken,
  writeTier,
  writeUser,
} from "../lib/storage";

export function useAuth() {
  const [token, setToken] = useState(readAuthToken);
  const [refreshToken, setRefreshToken] = useState(readRefreshToken);
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
        if (!cancelled && (status === 401 || status === 403) && refreshToken) {
          try {
            const refreshed = await refreshSession(refreshToken);
            if (cancelled) return;
            writeAuthToken(refreshed.token);
            writeRefreshToken(refreshed.refresh_token);
            writeUser(refreshed.user);
            writeTier(refreshed.user.tier);
            setToken(refreshed.token);
            setRefreshToken(refreshed.refresh_token);
            setUser(refreshed.user);
            return;
          } catch {
            clearAuthToken();
            clearRefreshToken();
            clearUser();
            setToken("");
            setRefreshToken("");
            setUser(null);
          }
        } else if (!cancelled && (status === 401 || status === 403)) {
          clearAuthToken();
          clearRefreshToken();
          clearUser();
          setToken("");
          setRefreshToken("");
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
  }, [token, refreshToken]);

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
      if ((status === 401 || status === 403) && refreshToken) {
        try {
          const refreshed = await refreshSession(refreshToken);
          writeAuthToken(refreshed.token);
          writeRefreshToken(refreshed.refresh_token);
          writeUser(refreshed.user);
          writeTier(refreshed.user.tier);
          setToken(refreshed.token);
          setRefreshToken(refreshed.refresh_token);
          setUser(refreshed.user);
          return refreshed.user;
        } catch {
          clearAuthToken();
          clearRefreshToken();
          clearUser();
          setToken("");
          setRefreshToken("");
          setUser(null);
        }
      } else if (status === 401 || status === 403) {
        clearAuthToken();
        clearRefreshToken();
        clearUser();
        setToken("");
        setRefreshToken("");
        setUser(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, refreshToken]);

  const signIn = useCallback((nextToken: string, nextRefreshToken: string, nextUser: User) => {
    writeAuthToken(nextToken);
    writeRefreshToken(nextRefreshToken);
    writeUser(nextUser);
    writeTier(nextUser.tier);
    setToken(nextToken);
    setRefreshToken(nextRefreshToken);
    setUser(nextUser);
  }, []);

  const signOut = useCallback(() => {
    clearAuthToken();
    clearRefreshToken();
    clearUser();
    writeTier("FREE");
    setToken("");
    setRefreshToken("");
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
