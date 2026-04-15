import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * @param {{ content: string, children: React.ReactNode, position?: 'top'|'bottom' }} props
 */
export default function Tooltip({ content, children, position = "top" }) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: position === "top" ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: position === "top" ? 4 : -4 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 px-3 py-2 text-xs text-zinc-200 bg-zinc-800 border border-zinc-700
              rounded-lg shadow-xl max-w-[260px] whitespace-normal leading-relaxed
              ${position === "top" ? "bottom-full mb-2" : "top-full mt-2"} left-1/2 -translate-x-1/2`}
          >
            {content}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-800 border-zinc-700 rotate-45
                ${position === "top" ? "bottom-[-5px] border-r border-b" : "top-[-5px] border-l border-t"}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
