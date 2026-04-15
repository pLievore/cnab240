import { Router } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { authenticate, updateLastUsed } from "../middleware/auth.js";
import { buildCNAB240 } from "../utils/cnab240.js";
import GeneratedFile from "../models/GeneratedFile.js";
import config from "../config.js";

const router = Router();

function ensureFilesDir() {
  const dir = path.resolve(config.filesDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function encodeToLatin1(str) {
  const bytes = Buffer.alloc(str.length);
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    bytes[i] = code > 255 ? 63 : code;
  }
  return bytes;
}

// POST /api/cnab/generate — generate CNAB file, save and return it
router.post("/generate", authenticate, updateLastUsed, async (req, res) => {
  const { empresa, loteInfo, pagamentos } = req.body;

  if (!empresa || !pagamentos || !Array.isArray(pagamentos) || pagamentos.length === 0) {
    return res.status(400).json({ error: "Dados incompletos para geração" });
  }

  try {
    const lines = buildCNAB240({ empresa, pagamentos, loteInfo });
    const allValid = lines.every((l) => l.length === 240);

    if (!allValid) {
      return res.status(422).json({
        error: "Linhas geradas com tamanho incorreto",
        details: lines.map((l, i) => ({ line: i + 1, length: l.length })).filter(l => l.length !== 240),
      });
    }

    const content = lines.join("\r\n") + "\r\n";
    const fileBuffer = encodeToLatin1(content);
    const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    const cnpjClean = (empresa.cnpj || "").replace(/\D/g, "");
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const timeStr = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
    const filename = `cnab240_${cnpjClean}_${dateStr}_${timeStr}.rem`;

    const filesDir = ensureFilesDir();
    const filePath = path.join(filesDir, filename);
    fs.writeFileSync(filePath, fileBuffer);

    const valorTotal = pagamentos.reduce((s, p) => s + parseFloat(p.valor || "0"), 0);

    const record = await GeneratedFile.create({
      tokenId: req.user.tokenId,
      tokenLabel: req.user.label,
      tokenRole: req.user.role,
      filename,
      filePath,
      fileHash,
      fileSize: fileBuffer.length,
      empresaCnpj: cnpjClean,
      empresaNome: empresa.nome || "",
      bancoCodigo: empresa.codigoBanco || "",
      bancoNome: empresa.nomeBanco || "",
      tipoServico: loteInfo?.tipoServico || "",
      formaLancamento: loteInfo?.formaLancamento || "",
      qtdPagamentos: pagamentos.length,
      qtdLinhas: lines.length,
      valorTotal,
      pagamentos: pagamentos.map((p) => ({
        nomeFavorecido: p.nomeFavorecido || "",
        cpfCnpjFavorecido: (p.cpfCnpjFavorecido || "").replace(/\D/g, ""),
        bancoFavorecido: p.bancoFavorecido || "",
        valor: parseFloat(p.valor || "0"),
        dataPagamento: p.dataPagamento || "",
      })),
    });

    res.json({
      id: record._id,
      filename,
      fileHash,
      fileSize: fileBuffer.length,
      qtdLinhas: lines.length,
      valorTotal,
      lines: lines.map((l, i) => ({ text: l, valid: l.length === 240, idx: i })),
    });
  } catch (err) {
    console.error("Erro ao gerar CNAB:", err);
    res.status(500).json({ error: "Erro interno ao gerar arquivo" });
  }
});

// GET /api/cnab/files — list generated files (admin: all, user: own)
router.get("/files", authenticate, async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { tokenId: req.user.tokenId };

  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
  const skip = (page - 1) * limit;

  const [files, total] = await Promise.all([
    GeneratedFile.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    GeneratedFile.countDocuments(filter),
  ]);

  res.json({
    files: files.map((f) => ({
      id: f._id,
      filename: f.filename,
      empresaNome: f.empresaNome,
      empresaCnpj: f.empresaCnpj,
      bancoCodigo: f.bancoCodigo,
      bancoNome: f.bancoNome,
      tipoServico: f.tipoServico,
      formaLancamento: f.formaLancamento,
      qtdPagamentos: f.qtdPagamentos,
      qtdLinhas: f.qtdLinhas,
      valorTotal: f.valorTotal,
      fileSize: f.fileSize,
      tokenLabel: f.tokenLabel,
      tokenRole: f.tokenRole,
      createdAt: f.createdAt,
    })),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

// GET /api/cnab/files/:id — file detail
router.get("/files/:id", authenticate, async (req, res) => {
  const file = await GeneratedFile.findById(req.params.id).lean();
  if (!file) return res.status(404).json({ error: "Arquivo não encontrado" });

  if (req.user.role !== "admin" && String(file.tokenId) !== String(req.user.tokenId)) {
    return res.status(403).json({ error: "Sem permissão" });
  }

  res.json(file);
});

// GET /api/cnab/files/:id/download — download .rem file
router.get("/files/:id/download", authenticate, async (req, res) => {
  const file = await GeneratedFile.findById(req.params.id).lean();
  if (!file) return res.status(404).json({ error: "Arquivo não encontrado" });

  if (req.user.role !== "admin" && String(file.tokenId) !== String(req.user.tokenId)) {
    return res.status(403).json({ error: "Sem permissão" });
  }

  const fullPath = path.resolve(file.filePath);
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: "Arquivo físico não encontrado no servidor" });
  }

  res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
  res.setHeader("Content-Type", "application/octet-stream");
  fs.createReadStream(fullPath).pipe(res);
});

export default router;
