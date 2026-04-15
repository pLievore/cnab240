import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Layers, Users, FileText, X, Check, AlertCircle,
  LayoutDashboard, Key, FolderOpen,
} from "lucide-react";

const navItems = [
  { id: 0, label: "Empresa", icon: Building2, description: "Dados da pagadora" },
  { id: 1, label: "Lote", icon: Layers, description: "Config. do lote" },
  { id: 2, label: "Pagamentos", icon: Users, description: "Favorecidos" },
  { id: 3, label: "Gerar Arquivo", icon: FileText, description: "Preview e download" },
];

const adminNavItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Visão geral" },
  { id: "tokens", label: "Tokens", icon: Key, description: "Gerenciar acessos" },
  { id: "files", label: "Arquivos", icon: FolderOpen, description: "Histórico gerado" },
];

/**
 * @param {{ activeTab: number, onTabChange: (t: number) => void, completedSteps: Set<number>, errorSteps: Set<number>, open: boolean, onClose: () => void }} props
 */
export default function Sidebar({
  activeTab,
  onTabChange,
  completedSteps,
  errorSteps,
  open,
  onClose,
  isAdmin = false,
  adminTab = "dashboard",
  onAdminTabChange,
}) {
  const navContent = (
    <nav className="flex flex-col gap-1.5 p-4">
      <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-3 px-3">
        Etapas
      </p>
      {navItems.map((item, idx) => {
        const active = activeTab === item.id;
        const completed = completedSteps.has(item.id);
        const hasError = errorSteps.has(item.id);
        const Icon = item.icon;

        return (
          <motion.button
            key={item.id}
            onClick={() => {
              onTabChange(item.id);
              onClose();
            }}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer w-full
              ${active
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                : "border border-transparent hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200"
              }`}
          >
            {/* Step indicator */}
            <div className={`relative flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
              ${active
                ? "bg-emerald-500/20 text-emerald-400"
                : completed
                  ? "bg-emerald-500/10 text-emerald-500"
                  : hasError
                    ? "bg-red-500/10 text-red-400"
                    : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {completed && !active ? (
                <Check size={14} />
              ) : hasError ? (
                <AlertCircle size={14} />
              ) : (
                <Icon size={14} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium truncate ${active ? "text-emerald-400" : ""}`}>
                {item.label}
              </p>
              <p className="text-[10px] text-zinc-600 truncate">
                {item.description}
              </p>
            </div>

            {/* Connector line */}
            {idx < navItems.length - 1 && (
              <div className="absolute left-[31px] top-full w-px h-1.5 bg-zinc-800" />
            )}
          </motion.button>
        );
      })}

      {/* Progress bar */}
      <div className="mt-6 px-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Progresso</span>
          <span className="text-[10px] text-zinc-500 font-mono">
            {completedSteps.size}/4
          </span>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(completedSteps.size / 4) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Admin section */}
      {isAdmin && (
        <div className="mt-6 px-4">
          <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-3 px-3">
            Administração
          </p>
          <div className="flex flex-col gap-1.5">
            {adminNavItems.map((item) => {
              const active = activeTab === 10 && adminTab === item.id;
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    onTabChange(10);
                    onAdminTabChange(item.id);
                    onClose();
                  }}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer w-full
                    ${active
                      ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                      : "border border-transparent hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200"
                    }`}
                >
                  <div className={`relative flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                    ${active
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${active ? "text-amber-400" : ""}`}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-zinc-600 truncate">
                      {item.description}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-zinc-800/60 glass">
        {navContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 z-50 w-72 h-full bg-zinc-900 border-r border-zinc-800"
            >
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <span className="text-sm font-semibold text-zinc-200">Navegacao</span>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400"
                >
                  <X size={16} />
                </button>
              </div>
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
