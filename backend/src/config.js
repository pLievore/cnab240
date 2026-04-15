import "dotenv/config";

export default {
  port: parseInt(process.env.PORT || "3001", 10),
  mongoUri: process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://mongo:27017/cnab240",
  jwtSecret: process.env.JWT_SECRET || "CHANGE_ME_IN_PRODUCTION",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
  filesDir: process.env.FILES_DIR || "./data/files",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
};
