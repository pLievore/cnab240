import { motion } from "framer-motion";

/**
 * @param {{ title?: string, subtitle?: string, icon?: React.ReactNode, children: React.ReactNode, className?: string, padding?: string }} props
 */
export default function Card({
  title,
  subtitle,
  icon,
  children,
  className = "",
  padding = "p-6",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`glass border border-zinc-800/80 rounded-xl ${padding} ${className}`}
    >
      {title && (
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-zinc-800/60">
          {icon && <span className="text-emerald-500">{icon}</span>}
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 tracking-wide uppercase">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      {children}
    </motion.div>
  );
}
