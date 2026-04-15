import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Download, ChevronLeft, ChevronRight,
  Search, Calendar, Eye,
} from "lucide-react";
import { Card, Button, Badge } from "../ui/index.js";
import toast from "react-hot-toast";

export default function FileHistory({ admin, onViewDetail }) {
  const { files, fetchFiles, downloadFile } = admin;
  const [page, setPage] = useState(1);

  useEffect(() => { fetchFiles(page); }, [fetchFiles, page]);

  const handleDownload = async (id, filename) => {
    try {
      await downloadFile(id, filename);
      toast.success("Download iniciado!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-zinc-100 mb-1">Arquivos Gerados</h2>
        <p className="text-sm text-zinc-500">
          {files.total} arquivo{files.total !== 1 ? "s" : ""} encontrado{files.total !== 1 ? "s" : ""}
        </p>
      </div>

      {files.files.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <FileText size={32} className="mx-auto text-zinc-700 mb-3" />
            <p className="text-sm text-zinc-500">Nenhum arquivo gerado ainda.</p>
          </div>
        </Card>
      ) : (
        <>
          {/* File list */}
          <div className="space-y-2">
            {files.files.map((f, idx) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 flex-shrink-0">
                    <FileText size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-zinc-200 truncate">
                        {f.empresaNome || "Sem nome"}
                      </span>
                      <Badge color="zinc">{f.bancoCodigo} - {f.bancoNome || "Banco"}</Badge>
                      <Badge color="blue">{f.tokenLabel}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(f.createdAt).toLocaleString("pt-BR")}
                      </span>
                      <span>{f.qtdPagamentos} pgto{f.qtdPagamentos !== 1 ? "s" : ""}</span>
                      <span>{f.qtdLinhas} linhas</span>
                      <span>{(f.fileSize / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-sm font-semibold text-emerald-400">
                    R$ {f.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  <button
                    onClick={() => onViewDetail(f.id)}
                    title="Ver detalhes"
                    className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => handleDownload(f.id, f.filename)}
                    title="Download"
                    className="p-2 rounded-lg hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400 transition-colors"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {files.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-zinc-500">
                Página {files.page} de {files.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(files.totalPages, p + 1))}
                disabled={page >= files.totalPages}
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
