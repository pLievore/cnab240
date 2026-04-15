import { motion } from "framer-motion";
import { Inbox } from "lucide-react";
import Button from "./Button.jsx";

/**
 * @param {{ title: string, description?: string, actionLabel?: string, onAction?: () => void, icon?: React.ReactNode }} props
 */
export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-8"
    >
      <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-5">
        {icon || <Inbox size={28} className="text-zinc-600" />}
      </div>
      <h3 className="text-sm font-semibold text-zinc-300 mb-2">{title}</h3>
      {description && (
        <p className="text-xs text-zinc-500 text-center max-w-xs mb-6">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
