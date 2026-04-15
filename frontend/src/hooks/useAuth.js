import { useState, useCallback } from "react";
import { apiLogin, apiLogout, getStoredUser, isAuthenticated } from "../utils/api.js";

export default function useAuth() {
  const [user, setUser] = useState(() => getStoredUser());
  const [authed, setAuthed] = useState(() => isAuthenticated());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = useCallback(async (token) => {
    setLoading(true);
    setError("");
    try {
      if (!token || !token.trim()) {
        setError("Informe o token de acesso");
        return false;
      }
      const userData = await apiLogin(token);
      setUser(userData);
      setAuthed(true);
      return true;
    } catch (err) {
      setError(err.message || "Token inválido");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
    setAuthed(false);
  }, []);

  return { authed, user, loading, error, login, logout };
}
