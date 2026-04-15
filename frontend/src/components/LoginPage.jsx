import { useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage({ onSubmit, loading, error }) {
  const [token, setToken] = useState("");
  const [show, setShow] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(token);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 flex items-center justify-center px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(600px circle at 50% 0%, rgba(16,185,129,0.15), transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white
              bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/30 mb-4"
          >
            C2
          </motion.div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            Gerador CNAB 240
          </h1>
          <p className="text-xs text-zinc-500 mt-1 tracking-wide">
            FEBRABAN v10.11 &middot; Acesso restrito
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass rounded-2xl border border-zinc-800/80 p-6 shadow-2xl shadow-black/40"
        >
          <div className="flex items-center gap-2 mb-5 text-zinc-200">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="text-sm font-semibold">Autenticação por token</span>
          </div>

          <label className="block text-xs font-medium text-zinc-400 mb-2">
            Token de acesso
          </label>

          <div className="relative">
            <KeyRound
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
            />
            <input
              type={show ? "text" : "password"}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Cole seu token aqui"
              className="w-full pl-10 pr-11 py-3 rounded-xl bg-zinc-900/70 border border-zinc-800
                text-zinc-100 placeholder:text-zinc-600 text-sm font-mono
                focus:border-emerald-600/60 focus:ring-2 focus:ring-emerald-600/20 outline-none
                transition-all"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-zinc-500
                hover:text-zinc-300 transition-colors"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-xs text-red-400"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl
              bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500
              text-white text-sm font-semibold
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg shadow-emerald-500/20 transition-all"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Validando...
              </>
            ) : (
              <>Entrar</>
            )}
          </button>

          <p className="mt-5 text-[11px] text-zinc-600 text-center leading-relaxed">
            Esta aplicação só pode ser acessada com um token válido.
            <br />
            Contate o administrador se não possuir um.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
