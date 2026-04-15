import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Download, Copy, Check, AlertTriangle,
  FileText, Building2, Users, DollarSign,
  Eye, Code, Hash,
} from "lucide-react";
import { Card, Button, Badge } from "../ui/index.js";
import toast from "react-hot-toast";

const typeLabel = (t) =>
  ({ "0": "HDR-ARQ", "1": "HDR-LOT", "5": "TRL-LOT", "9": "TRL-ARQ", "3": "DETALHE" }[t] || t);

const typeColor = (t) =>
  ({
    "0": "text-blue-400",
    "1": "text-purple-400",
    "5": "text-amber-500",
    "9": "text-red-400",
    "3": "text-emerald-400",
  }[t] || "text-zinc-400");

/**
 * @param {{ empresa: object, pagamentos: Array, totalValor: number, lines: Array, generated: boolean, generate: () => boolean, download: () => void, copyToClipboard: () => Promise<void> }} props
 */
export default function GerarTab({
  empresa,
  pagamentos,
  totalValor,
  lines,
  generated,
  generate,
  download,
  copyToClipboard,
  validationErrors = [],
  isValid = true,
  onGoToTab,
}) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState("raw"); // raw | formatted
  const [showRuler, setShowRuler] = useState(false);

  const handleGenerate = async () => {
    if (!isValid) {
      const byTab = validationErrors.reduce((acc, e) => {
        acc[e.tabName] = (acc[e.tabName] || 0) + 1;
        return acc;
      }, {});
      const summary = Object.entries(byTab)
        .map(([t, n]) => `${t} (${n})`)
        .join(", ");
      toast.error(`Preencha os campos obrigatorios: ${summary}`);
      return;
    }
    const valid = await generate();
    if (valid) {
      toast.success("Arquivo CNAB 240 gerado com sucesso!", { icon: "⚡" });
    } else {
      toast.error("Algumas linhas nao tem 240 posicoes. Verifique os dados!");
    }
  };

  const handleDownload = () => {
    setDownloading(true);
    download();
    toast.success("Download iniciado!");
    setTimeout(() => setDownloading(false), 1500);
  };

  const handleCopy = async () => {
    await copyToClipboard();
    setCopied(true);
    toast.success("Conteudo copiado para a area de transferencia!");
    setTimeout(() => setCopied(false), 2000);
  };

  const allValid = lines.every((l) => l.valid);

  // Generate ruler
  const ruler = [];
  for (let i = 1; i <= 240; i += 10) {
    ruler.push(String(i).padEnd(10));
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Building2 size={16} />}
          label="Empresa"
          value={empresa.nome || "Nao definida"}
          color="blue"
        />
        <SummaryCard
          icon={<Users size={16} />}
          label="Pagamentos"
          value={String(pagamentos.length)}
          color="purple"
        />
        <SummaryCard
          icon={<DollarSign size={16} />}
          label="Valor Total"
          value={`R$ ${totalValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          color="emerald"
        />
        <SummaryCard
          icon={<FileText size={16} />}
          label="Banco"
          value={`${empresa.codigoBanco} - ${empresa.nomeBanco}`}
          color="amber"
        />
      </div>

      {/* Validation errors panel */}
      {!isValid && validationErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-500/30 bg-red-500/5 p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-red-400" />
            <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">
              Campos obrigatorios faltando ({validationErrors.length})
            </span>
          </div>
          {Object.entries(
            validationErrors.reduce((acc, e) => {
              (acc[e.tab] = acc[e.tab] || { name: e.tabName, items: [] }).items.push(e.field);
              return acc;
            }, {})
          ).map(([tabIdx, group]) => (
            <div key={tabIdx} className="mb-3 last:mb-0">
              <button
                onClick={() => onGoToTab && onGoToTab(Number(tabIdx))}
                className="text-[11px] font-mono font-semibold text-red-300 hover:text-red-200 underline decoration-dotted underline-offset-2 mb-1"
              >
                Aba {Number(tabIdx) + 1} — {group.name} →
              </button>
              <ul className="text-xs text-zinc-400 space-y-0.5 pl-4">
                {group.items.map((f, i) => (
                  <li key={i} className="list-disc list-outside marker:text-red-500/60">{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={handleGenerate}
          icon={<Zap size={16} />}
          disabled={!isValid}
        >
          Gerar Arquivo CNAB 240
        </Button>

        {generated && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Button
              variant="secondary"
              onClick={handleDownload}
              icon={downloading ? <Check size={16} className="text-emerald-400" /> : <Download size={16} />}
            >
              {downloading ? "Baixando..." : "Download .rem"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleCopy}
              icon={copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            >
              {copied ? "Copiado!" : "Copiar"}
            </Button>
          </motion.div>
        )}
      </div>

      {/* Preview */}
      <AnimatePresence>
        {generated && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Status */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge color="blue" icon={<Hash size={12} />}>
                {lines.length} registros
              </Badge>
              <Badge color={allValid ? "emerald" : "red"} icon={allValid ? <Check size={12} /> : <AlertTriangle size={12} />}>
                {allValid ? "Todas as linhas com 240 posicoes" : "Erro no tamanho das linhas"}
              </Badge>

              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={() => setViewMode("raw")}
                  className={`p-1.5 rounded-md text-xs transition-colors ${viewMode === "raw" ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"}`}
                  title="Visualizacao raw"
                >
                  <Code size={14} />
                </button>
                <button
                  onClick={() => setViewMode("formatted")}
                  className={`p-1.5 rounded-md text-xs transition-colors ${viewMode === "formatted" ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"}`}
                  title="Visualizacao formatada"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => setShowRuler((r) => !r)}
                  className={`p-1.5 rounded-md text-xs transition-colors ${showRuler ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"}`}
                  title="Mostrar regua de posicoes"
                >
                  <Hash size={14} />
                </button>
              </div>
            </div>

            {/* Preview box */}
            <div className="glass border border-zinc-800/80 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/60 flex items-center gap-2">
                <FileText size={14} className="text-zinc-500" />
                <span className="text-xs text-zinc-500 font-mono tracking-wider">
                  PREVIEW — {lines.length} LINHAS x 240 POSICOES
                </span>
              </div>

              <div className="overflow-x-auto p-4">
                {/* Ruler */}
                {showRuler && (
                  <div className="flex mb-2 text-[10px] font-mono text-zinc-700 select-none">
                    <span className="w-14 flex-shrink-0" />
                    <span className="whitespace-pre">{ruler.join("")}</span>
                  </div>
                )}

                {/* Lines */}
                {lines.map((l, i) => {
                  const tipo = l.text[7];
                  const seg = tipo === "3" ? l.text[13] : "";

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15, delay: i * 0.02 }}
                      className="flex items-start font-mono text-[11px] leading-6 hover:bg-zinc-800/30 rounded transition-colors group"
                    >
                      {/* Line number */}
                      <span className="w-14 flex-shrink-0 text-right pr-3 text-zinc-700 select-none sticky left-0 bg-inherit">
                        {String(i + 1).padStart(4, "0")}
                      </span>

                      {/* Type badge */}
                      <span className={`flex-shrink-0 mr-2 font-bold ${typeColor(tipo)}`}>
                        [{typeLabel(tipo)}{seg ? `-${seg}` : ""}]
                      </span>

                      {/* Content */}
                      {viewMode === "raw" ? (
                        <span className={l.valid ? "text-zinc-300" : "text-red-400"}>
                          {l.text}
                        </span>
                      ) : (
                        <FormattedLine text={l.text} tipo={tipo} seg={seg} />
                      )}

                      {/* Position count */}
                      <span className={`ml-2 flex-shrink-0 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity
                        ${l.valid ? "text-emerald-500/50" : "text-red-500/50"}`}>
                        {l.text.length}pos
                      </span>

                      {/* Validation icon */}
                      <span className="ml-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {l.valid ? (
                          <Check size={12} className="text-emerald-500/50" />
                        ) : (
                          <AlertTriangle size={12} className="text-red-500/50" />
                        )}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryCard({ icon, label, value, color }) {
  const bgMap = {
    blue: "bg-blue-500/5 border-blue-500/20",
    emerald: "bg-emerald-500/5 border-emerald-500/20",
    purple: "bg-purple-400/5 border-purple-400/20",
    amber: "bg-amber-500/5 border-amber-500/20",
  };
  const textMap = {
    blue: "text-blue-400",
    emerald: "text-emerald-400",
    purple: "text-purple-400",
    amber: "text-amber-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 ${bgMap[color]}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={textMap[color]}>{icon}</span>
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">{label}</span>
      </div>
      <p className={`text-sm font-semibold truncate ${textMap[color]}`}>{value}</p>
    </motion.div>
  );
}

function FormattedLine({ text, tipo, seg }) {
  // Simplified formatted view - highlight key fields
  if (tipo === "0") {
    // Header de Arquivo
    return (
      <span className="text-zinc-300">
        <span className="text-blue-400" title="Banco (1-3)">{text.slice(0, 3)}</span>
        <span className="text-zinc-600">{text.slice(3, 7)}</span>
        <span className="text-zinc-500">{text.slice(7, 17)}</span>
        <span className="text-amber-400" title="CNPJ (19-32)">{text.slice(17, 32)}</span>
        <span className="text-purple-400" title="Convenio (33-52)">{text.slice(32, 52)}</span>
        <span className="text-emerald-400" title="Ag/Conta (53-72)">{text.slice(52, 72)}</span>
        <span className="text-blue-300" title="Nome Empresa (73-102)">{text.slice(72, 102)}</span>
        <span className="text-zinc-500">{text.slice(102)}</span>
      </span>
    );
  }

  if (tipo === "3" && seg === "A") {
    return (
      <span className="text-zinc-300">
        <span className="text-blue-400" title="Banco (1-3)">{text.slice(0, 3)}</span>
        <span className="text-zinc-600">{text.slice(3, 13)}</span>
        <span className="text-zinc-500">{text.slice(13, 20)}</span>
        <span className="text-amber-400" title="Banco Fav (21-23)">{text.slice(20, 23)}</span>
        <span className="text-purple-400" title="Ag/Conta Fav (24-43)">{text.slice(23, 43)}</span>
        <span className="text-blue-300" title="Nome Fav (44-73)">{text.slice(43, 73)}</span>
        <span className="text-zinc-500">{text.slice(73, 119)}</span>
        <span className="text-emerald-400 font-bold" title="Valor (120-134)">{text.slice(119, 134)}</span>
        <span className="text-zinc-500">{text.slice(134)}</span>
      </span>
    );
  }

  return <span className="text-zinc-400">{text}</span>;
}
