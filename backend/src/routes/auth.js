import { Router } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config.js";
import Token from "../models/Token.js";

const router = Router();

function sha256(text) {
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}

// POST /api/auth/login — validate raw token, return JWT
router.post("/login", async (req, res) => {
  const { token } = req.body;
  if (!token || !token.trim()) {
    return res.status(400).json({ error: "Token não fornecido" });
  }

  const hash = sha256(token);
  const doc = await Token.findOne({ tokenHash: hash, active: true, revokedAt: null });
  if (!doc) {
    return res.status(401).json({ error: "Token inválido" });
  }

  doc.lastUsedAt = new Date();
  await doc.save();

  const jwt_payload = {
    tokenId: doc._id,
    label: doc.label,
    role: doc.role,
  };

  const accessToken = jwt.sign(jwt_payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  res.json({
    accessToken,
    user: {
      label: doc.label,
      role: doc.role,
    },
  });
});

// GET /api/auth/me — return current user info
router.get("/me", async (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret);
    res.json({ label: payload.label, role: payload.role });
  } catch {
    return res.status(401).json({ error: "Token expirado" });
  }
});

export default router;
