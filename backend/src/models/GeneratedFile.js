import mongoose from "mongoose";

const generatedFileSchema = new mongoose.Schema({
  tokenId: { type: mongoose.Schema.Types.ObjectId, ref: "Token", required: true, index: true },
  tokenLabel: { type: String, required: true },
  tokenRole: { type: String },
  filename: { type: String, required: true },
  filePath: { type: String, required: true },
  fileHash: { type: String, required: true },
  fileSize: { type: Number, required: true },
  empresaCnpj: { type: String },
  empresaNome: { type: String },
  bancoCodigo: { type: String },
  bancoNome: { type: String },
  tipoServico: { type: String },
  formaLancamento: { type: String },
  qtdPagamentos: { type: Number },
  qtdLinhas: { type: Number },
  valorTotal: { type: Number },
  pagamentos: [{
    nomeFavorecido: String,
    cpfCnpjFavorecido: String,
    bancoFavorecido: String,
    valor: Number,
    dataPagamento: String,
  }],
}, { timestamps: true });

generatedFileSchema.index({ createdAt: -1 });
generatedFileSchema.index({ empresaCnpj: 1 });

export default mongoose.model("GeneratedFile", generatedFileSchema);
