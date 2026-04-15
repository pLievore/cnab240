import { motion } from "framer-motion";
import { Menu, LogOut } from "lucide-react";
import { Badge } from "../ui/index.js";

export default function Header({
  empresa,
  pagamentos,
  totalValor,
  onToggleSidebar,
  onLogout,
  user,
}) {
  return (
    <header className="sticky top-0 z-40 glass border-b border-zinc-800/60">
      <div className="flex items-center gap-4 px-4 lg:px-8 py-4">
        {/* Mobile menu */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm
              bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
            whileHover={{ scale: 1.05 }}
            style={{ backgroundSize: "200% 200%" }}
          >
            C2
          </motion.div>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold text-zinc-100 tracking-tight">
              Gerador CNAB 240
            </h1>
            <p className="text-[11px] text-zinc-500 tracking-wide">
              FEBRABAN v10.11 &middot; 240 posicoes
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="hidden md:flex items-center gap-2 ml-auto mr-4">
          <Badge color="blue" animated>
            {pagamentos.length} Pagamento{pagamentos.length !== 1 ? "s" : ""}
          </Badge>
          <Badge color="emerald" animated>
            R$ {totalValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </Badge>
          <Badge color="zinc">
            {empresa.nome || "Empresa nao definida"}
          </Badge>
        </div>

        {/* Version badge */}
        <div className="hidden lg:flex items-center gap-2 ml-auto lg:ml-0">
          <Badge color="emerald">REMESSA</Badge>
          {user && (
            <Badge color={user.role === "admin" ? "amber" : "blue"}>
              {user.label || user.role}
            </Badge>
          )}
        </div>

        {onLogout && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            title="Sair"
            className="p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-red-600/60
              text-zinc-400 hover:text-red-400 transition-all ml-2"
          >
            <LogOut size={16} />
          </motion.button>
        )}
      </div>

      {/* Mobile status */}
      <div className="md:hidden flex items-center gap-2 px-4 pb-3 overflow-x-auto">
        <Badge color="blue" animated>
          {pagamentos.length} Pgto{pagamentos.length !== 1 ? "s" : ""}
        </Badge>
        <Badge color="emerald" animated>
          R$ {totalValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </Badge>
      </div>
    </header>
  );
}
