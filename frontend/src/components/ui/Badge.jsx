import { motion, AnimatePresence } from "framer-motion";

const colorMap = {
  emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  blue: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  red: "bg-red-500/10 border-red-500/30 text-red-400",
  amber: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  zinc: "bg-zinc-500/10 border-zinc-500/30 text-zinc-400",
  purple: "bg-purple-400/10 border-purple-400/30 text-purple-400",
};

/**
 * @param {{ color?: keyof typeof colorMap, children: React.ReactNode, animated?: boolean, className?: string, icon?: React.ReactNode }} props
 */
export default function Badge({
  color = "emerald",
  children,
  animated = false,
  className = "",
  icon,
}) {
  const Wrapper = animated ? motion.span : "span";
  const animProps = animated
    ? { key: String(children), initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 } }
    : {};

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold font-mono
        ${colorMap[color]} ${className}`}
    >
      {icon}
      <AnimatePresence mode="wait">
        <Wrapper {...animProps}>{children}</Wrapper>
      </AnimatePresence>
    </span>
  );
}
