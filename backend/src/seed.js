import "dotenv/config";
import crypto from "crypto";
import mongoose from "mongoose";
import config from "./config.js";
import Token from "./models/Token.js";

function sha256(text) {
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}

async function seed() {
  await mongoose.connect(config.mongoUri);
  console.log("MongoDB conectado");

  const existingAdmin = await Token.findOne({ role: "admin" });
  if (existingAdmin) {
    console.log("Já existe um token admin. Seed cancelado.");
    console.log("Para criar mais tokens, use o painel admin.");
    await mongoose.disconnect();
    return;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hash = sha256(rawToken);

  await Token.create({
    tokenHash: hash,
    label: "Admin Inicial",
    role: "admin",
  });

  console.log("═══════════════════════════════════════════════════════");
  console.log("  TOKEN ADMIN CRIADO COM SUCESSO!");
  console.log("  Guarde este token — ele NÃO será exibido novamente.");
  console.log("");
  console.log(`  Token: ${rawToken}`);
  console.log("");
  console.log("  Use este token para fazer login no painel.");
  console.log("═══════════════════════════════════════════════════════");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Erro no seed:", err);
  process.exit(1);
});
