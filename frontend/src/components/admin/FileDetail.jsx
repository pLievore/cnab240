import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Download, FileText, Building2,
  Users, DollarSign, Calendar, Hash, Shield,
} from "lucide-react";
import { Card, Button, Badge } from "../ui/index.js";
import toast from "react-hot-toast";

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-zinc-800/30 last:border-0">
      <Icon size={14} className="text-zinc-600 flex-shrink-0" />
      <span className="text-xs text-zinc-500 w-36 flex-shrink-0">{label}</span>
      <span className="text-sm text-zinc-200">{value || "—"}</span>
    </div>
  );
}

export default function FileDetail({ admin, fileId, onBack }) {
  const { selectedFile, fetchFileDetail, downloadFile } = admin;

  useEffect(() => {
    if (fileId) fetchFileDetail(fileId);
  }, [fileId, fetchFileDetail]);

  if (!selectedFile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const f = selectedFile;

  const handleDownload = async () => {
    try {
      await downloadFile(f._id, f.filename);
      toast.success("Download iniciado!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-zinc-100">Detalhe do Arquivo</h2>
          <p className="text-xs text-zinc-500 font-mono">{f.filename}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Info card */}
        <Card>
          <div className="p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4">Informações Gerais</h3>
            <div className="space-y-0">
              <InfoRow icon={Building2} label="Empresa" value={f.empresaNome} />
              <InfoRow icon={Hash} label="CNPJ" value={f.empresaCnpj} />
              <InfoRow icon={FileText} label="Banco" value={`${f.bancoCodigo} - ${f.bancoNome}`} />
              <InfoRow icon={Hash} label="Tipo Serviço" value={f.tipoServico} />
              <InfoRow icon={Hash} label="Forma Lançamento" value={f.formaLancamento} />
              <InfoRow icon={Calendar} label="Gerado em" value={new Date(f.createdAt).toLocaleString("pt-BR")} />
              <InfoRow icon={Shield} label="Gerado por" value={`${f.tokenLabel} (${f.tokenRole})`} />
              <InfoRow icon={Hash} label="Hash SHA-256" value={f.fileHash?.slice(0, 16) + "..."} />
              <InfoRow icon={FileText} label="Tamanho" value={`${(f.fileSize / 1024).toFixed(1)} KB · ${f.qtdLinhas} linhas`} />
            </div>
          </div>
        </Card>

        {/* Values card */}
        <Card>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-200">Pagamentos ({f.qtdPagamentos})</h3>
              <span className="text-lg font-bold text-emerald-400">
                R$ {f.valorTotal?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            {f.pagamentos && f.pagamentos.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {f.pagamentos.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/30">
                    <div className="min-w-0">
                      <p className="text-sm text-zinc-200 truncate">{p.nomeFavorecido || "—"}</p>
                      <p className="text-[10px] text-zinc-600">
                        {p.cpfCnpjFavorecido} · Banco {p.bancoFavorecido} · {p.dataPagamento}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-zinc-300 flex-shrink-0 ml-3">
                      R$ {p.valor?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">Detalhes não disponíveis.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleDownload}>
          <Download size={14} className="mr-1.5" />
          Download .rem
        </Button>
        <Button variant="ghost" onClick={onBack}>
          Voltar
        </Button>
      </div>
    </div>
  );
}
