import { useState, useCallback } from "react";
import { validateToken, getSession, setSession } from "../utils/auth.js";

export default function useAuth() {
  const [authed, setAuthed] = useState(getSession);
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
      const ok = await validateToken(token);
      if (ok) {
        setSession(true);
        setAuthed(true);
        return true;
      }
      setError("Token inválido");
      return false;
    } catch {
      setError("Falha ao validar o token");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setSession(false);
    setAuthed(false);
  }, []);

  return { authed, loading, error, login, logout };
}
