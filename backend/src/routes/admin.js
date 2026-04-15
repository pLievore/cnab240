import { Router } from "express";
import crypto from "crypto";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import Token from "../models/Token.js";
import GeneratedFile from "../models/GeneratedFile.js";

const router = Router();

function sha256(text) {
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}

function generateRawToken() {
  return crypto.randomBytes(32).toString("hex");
}

// GET /api/admin/stats — dashboard statistics
router.get("/stats", authenticate, requireAdmin, async (_req, res) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalFiles,
    filesToday,
    filesWeek,
    filesMonth,
    totalTokens,
    activeTokens,
    valorTotalAll,
    recentFiles,
    dailyStats,
  ] = await Promise.all([
    GeneratedFile.countDocuments(),
    GeneratedFile.countDocuments({ createdAt: { $gte: todayStart } }),
    GeneratedFile.countDocuments({ createdAt: { $gte: weekStart } }),
    GeneratedFile.countDocuments({ createdAt: { $gte: monthStart } }),
    Token.countDocuments(),
    Token.countDocuments({ active: true, revokedAt: null }),
    GeneratedFile.aggregate([{ $group: { _id: null, total: { $sum: "$valorTotal" } } }]),
    GeneratedFile.find().sort({ createdAt: -1 }).limit(5).lean(),
    GeneratedFile.aggregate([
      { $match: { createdAt: { $gte: weekStart } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          valor: { $sum: "$valorTotal" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  res.json({
    totalFiles,
    filesToday,
    filesWeek,
    filesMonth,
    totalTokens,
    activeTokens,
    valorTotal: valorTotalAll[0]?.total || 0,
    recentFiles: recentFiles.map((f) => ({
      id: f._id,
      filename: f.filename,
      empresaNome: f.empresaNome,
      valorTotal: f.valorTotal,
      qtdPagamentos: f.qtdPagamentos,
      tokenLabel: f.tokenLabel,
      createdAt: f.createdAt,
    })),
    dailyStats,
  });
});

// GET /api/admin/tokens — list all tokens
router.get("/tokens", authenticate, requireAdmin, async (_req, res) => {
  const tokens = await Token.find().sort({ createdAt: -1 }).lean();
  res.json(tokens.map((t) => ({
    id: t._id,
    label: t.label,
    role: t.role,
    active: t.active,
    createdAt: t.createdAt,
    lastUsedAt: t.lastUsedAt,
    revokedAt: t.revokedAt,
  })));
});

// POST /api/admin/tokens — create new token
router.post("/tokens", authenticate, requireAdmin, async (req, res) => {
  const { label, role } = req.body;
  if (!label || !label.trim()) {
    return res.status(400).json({ error: "Label é obrigatório" });
  }
  const validRole = role === "admin" ? "admin" : "user";

  const rawToken = generateRawToken();
  const hash = sha256(rawToken);

  const doc = await Token.create({
    tokenHash: hash,
    label: label.trim(),
    role: validRole,
  });

  res.status(201).json({
    id: doc._id,
    label: doc.label,
    role: doc.role,
    rawToken,
    message: "Guarde este token! Ele não será exibido novamente.",
  });
});

// PATCH /api/admin/tokens/:id/revoke — revoke a token
router.patch("/tokens/:id/revoke", authenticate, requireAdmin, async (req, res) => {
  const doc = await Token.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: "Token não encontrado" });

  doc.active = false;
  doc.revokedAt = new Date();
  await doc.save();

  res.json({ message: "Token revogado", token: doc.toPublic() });
});

// PATCH /api/admin/tokens/:id/activate — reactivate a token
router.patch("/tokens/:id/activate", authenticate, requireAdmin, async (req, res) => {
  const doc = await Token.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: "Token não encontrado" });

  doc.active = true;
  doc.revokedAt = null;
  await doc.save();

  res.json({ message: "Token reativado", token: doc.toPublic() });
});

// DELETE /api/admin/tokens/:id — permanently delete a token
router.delete("/tokens/:id", authenticate, requireAdmin, async (req, res) => {
  const doc = await Token.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ error: "Token não encontrado" });
  res.json({ message: "Token excluído permanentemente" });
});

export default router;
