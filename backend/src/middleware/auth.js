import jwt from "jsonwebtoken";
import config from "../config.js";
import Token from "../models/Token.js";

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const jwtToken = header.slice(7);
  try {
    const payload = jwt.verify(jwtToken, config.jwtSecret);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Acesso restrito a administradores" });
  }
  next();
}

export async function updateLastUsed(req, _res, next) {
  if (req.user?.tokenId) {
    Token.findByIdAndUpdate(req.user.tokenId, { lastUsedAt: new Date() }).catch(() => {});
  }
  next();
}
