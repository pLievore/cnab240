import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

import config from "./config.js";
import authRoutes from "./routes/auth.js";
import cnabRoutes from "./routes/cnab.js";
import adminRoutes from "./routes/admin.js";

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(morgan("short"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições. Tente novamente em alguns minutos." },
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Muitas tentativas de login. Tente novamente em 15 minutos." },
});
app.use("/api/auth/login", authLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/cnab", cnabRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erro interno do servidor" });
});

// Start
async function start() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB conectado");

    app.listen(config.port, "0.0.0.0", () => {
      console.log(`Backend rodando na porta ${config.port}`);
    });
  } catch (err) {
    console.error("Falha ao iniciar:", err);
    process.exit(1);
  }
}

start();
