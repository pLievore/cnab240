import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true, index: true },
  label: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  active: { type: Boolean, default: true },
  lastUsedAt: { type: Date, default: null },
  revokedAt: { type: Date, default: null },
}, { timestamps: true });

tokenSchema.methods.toPublic = function () {
  return {
    id: this._id,
    label: this.label,
    role: this.role,
    active: this.active,
    createdAt: this.createdAt,
    lastUsedAt: this.lastUsedAt,
    revokedAt: this.revokedAt,
  };
};

export default mongoose.model("Token", tokenSchema);
