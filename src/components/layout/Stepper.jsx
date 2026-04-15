import { motion } from "framer-motion";
import { Check } from "lucide-react";

const steps = [
  { id: 0, label: "Empresa" },
  { id: 1, label: "Lote" },
  { id: 2, label: "Pagamentos" },
  { id: 3, label: "Gerar" },
];

/**
 * @param {{ activeTab: number, completedSteps: Set<number>, onTabChange: (t: number) => void }} props
 */
export default function Stepper({ activeTab, completedSteps, onTabChange }) {
  return (
    <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
      {steps.map((step, idx) => {
        const active = activeTab === step.id;
        const completed = completedSteps.has(step.id);

        return (
          <div key={step.id} className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTabChange(step.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer
                ${active
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                  : completed
                    ? "bg-zinc-800/50 border border-zinc-700/50 text-emerald-500"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 border border-transparent"
                }`}
            >
              <span className={`flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold
                ${active
                  ? "bg-emerald-500 text-zinc-950"
                  : completed
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {completed && !active ? <Check size={10} /> : idx + 1}
              </span>
              <span className="hidden sm:inline whitespace-nowrap">{step.label}</span>
            </motion.button>

            {idx < steps.length - 1 && (
              <div className={`w-6 h-px mx-1 ${completed ? "bg-emerald-500/30" : "bg-zinc-800"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
