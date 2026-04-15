import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key, Plus, Ban, CheckCircle, Trash2, Copy,
  Check, Shield, User, AlertTriangle,
} from "lucide-react";
import { Card, Button, Badge } from "../ui/index.js";
import toast from "react-hot-toast";

export default function TokenManager({ admin }) {
  const { tokens, fetchTokens, createToken, revokeToken, activateToken, deleteToken } = admin;
  const [showCreate, setShowCreate] = useState(false);
  const [label, setLabel] = useState("");
  const [role, setRole] = useState("user");
  const [creating, setCreating] = useState(false);
  const [newToken, setNewToken] = useState(null);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchTokens(); }, [fetchTokens]);

  const handleCreate = async () => {
    if (!label.trim()) {
      toast.error("Informe um nome para o token");
      return;
    }
    setCreating(true);
    try {
      const data = await createToken(label.trim(), role);
      setNewToken(data.rawToken);
      setLabel("");
      setRole("user");
      toast.success("Token criado com sucesso!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (newToken) {
      await navigator.clipboard.writeText(newToken);
      setCopied(true);
      toast.success("Token copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevoke = async (id) => {
    try {
      await revokeToken(id);
      toast.success("Token revogado");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleActivate = async (id) => {
    try {
      await activateToken(id);
      toast.success("Token reativado");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteToken(id);
      setConfirmDelete(null);
      toast.success("Token excluído");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 mb-1">Tokens de Acesso</h2>
          <p className="text-sm text-zinc-500">Gerencie os tokens de usuários e admins</p>
        </div>
        <Button onClick={() => { setShowCreate(!showCreate); setNewToken(null); }}>
          <Plus size={14} className="mr-1.5" />
          Novo Token
        </Button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <div className="p-5 space-y-4">
                <h3 className="text-sm font-semibold text-zinc-200">Criar Novo Token</h3>

                {newToken ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-400">Token Criado!</span>
                      </div>
                      <p className="text-xs text-zinc-400 mb-3">
                        Copie e guarde este token. Ele <strong className="text-zinc-200">não será exibido novamente</strong>.
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2.5 rounded bg-zinc-900 border border-zinc-700 text-xs text-emerald-300 font-mono break-all select-all">
                          {newToken}
                        </code>
                        <button
                          onClick={handleCopy}
                          className="p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-emerald-500/50 text-zinc-400 hover:text-emerald-400 transition-colors flex-shrink-0"
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => { setNewToken(null); setShowCreate(false); }}>
                      Fechar
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="Nome do token (ex: Usuário João)"
                      className="flex-1 px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none"
                    />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-zinc-200 focus:border-emerald-500/50 focus:outline-none"
                    >
                      <option value="user">Usuário</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Button onClick={handleCreate} disabled={creating}>
                      {creating ? "Criando..." : "Criar"}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Token list */}
      <div className="space-y-2">
        {tokens.length === 0 ? (
          <Card>
            <div className="p-8 text-center text-zinc-500 text-sm">Nenhum token encontrado.</div>
          </Card>
        ) : (
          tokens.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-center justify-between p-4 rounded-xl border transition-colors
                ${t.active && !t.revokedAt
                  ? "bg-zinc-900/50 border-zinc-800/50"
                  : "bg-zinc-900/30 border-zinc-800/30 opacity-60"
                }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-lg ${t.role === "admin" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"}`}>
                  {t.role === "admin" ? <Shield size={14} /> : <User size={14} />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-200 truncate">{t.label}</span>
                    <Badge color={t.role === "admin" ? "amber" : "blue"}>{t.role}</Badge>
                    {!t.active || t.revokedAt ? (
                      <Badge color="red">revogado</Badge>
                    ) : (
                      <Badge color="emerald">ativo</Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-0.5">
                    Criado: {new Date(t.createdAt).toLocaleString("pt-BR")}
                    {t.lastUsedAt && ` · Último uso: ${new Date(t.lastUsedAt).toLocaleString("pt-BR")}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {t.active && !t.revokedAt ? (
                  <button
                    onClick={() => handleRevoke(t.id)}
                    title="Revogar"
                    className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Ban size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivate(t.id)}
                    title="Reativar"
                    className="p-2 rounded-lg hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400 transition-colors"
                  >
                    <CheckCircle size={14} />
                  </button>
                )}
                {confirmDelete === t.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="px-2 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-500"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-2 py-1 rounded text-xs bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(t.id)}
                    title="Excluir"
                    className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
