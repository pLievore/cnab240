import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText, Users, DollarSign, TrendingUp,
  Clock, BarChart3, Activity,
} from "lucide-react";
import { Card, Badge } from "../ui/index.js";

function StatCard({ icon: Icon, label, value, sub, color = "emerald" }) {
  const colors = {
    emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border bg-gradient-to-br p-5 ${colors[color]}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-zinc-900/50">
          <Icon size={18} />
        </div>
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-zinc-100">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </motion.div>
  );
}

export default function AdminDashboard({ admin }) {
  const { stats, fetchStats } = admin;

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-zinc-100 mb-1">Dashboard</h2>
        <p className="text-sm text-zinc-500">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Arquivos Hoje" value={stats.filesToday} sub={`${stats.filesWeek} esta semana`} color="emerald" />
        <StatCard icon={BarChart3} label="Total Arquivos" value={stats.totalFiles} sub={`${stats.filesMonth} este mês`} color="blue" />
        <StatCard icon={DollarSign} label="Valor Total" value={`R$ ${stats.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} color="purple" />
        <StatCard icon={Users} label="Tokens Ativos" value={stats.activeTokens} sub={`${stats.totalTokens} total`} color="amber" />
      </div>

      {/* Daily chart - simple bar visualization */}
      {stats.dailyStats && stats.dailyStats.length > 0 && (
        <Card>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-zinc-200">Últimos 7 dias</h3>
            </div>
            <div className="flex items-end gap-2 h-32">
              {stats.dailyStats.map((d) => {
                const maxCount = Math.max(...stats.dailyStats.map((x) => x.count), 1);
                const height = Math.max((d.count / maxCount) * 100, 8);
                const day = d._id.slice(8);
                return (
                  <div key={d._id} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-zinc-500">{d.count}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 min-h-[4px]"
                    />
                    <span className="text-[10px] text-zinc-600">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Recent files */}
      <Card>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Últimos Arquivos Gerados</h3>
          </div>
          {stats.recentFiles.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhum arquivo gerado ainda.</p>
          ) : (
            <div className="space-y-2">
              {stats.recentFiles.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText size={14} className="text-zinc-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-zinc-200 truncate">{f.empresaNome || f.filename}</p>
                      <p className="text-[10px] text-zinc-600">
                        {new Date(f.createdAt).toLocaleString("pt-BR")} &middot; {f.tokenLabel}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge color="emerald">{f.qtdPagamentos} pgto{f.qtdPagamentos !== 1 ? "s" : ""}</Badge>
                    <span className="text-sm font-medium text-zinc-300">
                      R$ {f.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
