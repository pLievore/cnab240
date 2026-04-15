import { motion } from "framer-motion";

const variants = {
  primary:
    "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30",
  secondary:
    "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 hover:border-zinc-600",
  danger:
    "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50",
  ghost:
    "bg-transparent hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-6 py-3 text-sm gap-2",
};

/**
 * @param {{ variant?: 'primary'|'secondary'|'danger'|'ghost', size?: 'sm'|'md'|'lg', icon?: React.ReactNode, children: React.ReactNode, className?: string, disabled?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export default function Button({
  variant = "primary",
  size = "md",
  icon,
  children,
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 cursor-pointer
        ${variants[variant]} ${sizes[size]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}
