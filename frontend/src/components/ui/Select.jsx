import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import Tooltip from "./Tooltip.jsx";

/**
 * @param {{ label?: string, value: string, onChange: (v: string) => void, options: Array<{value: string, label: string}>, tooltip?: string, error?: boolean, className?: string }} props
 */
export default function Select({
  label,
  value,
  onChange,
  options,
  tooltip,
  error = false,
  required = false,
  className = "",
}) {
  const [focused, setFocused] = useState(false);
  const isEmpty = !value || String(value).trim() === "";
  const showRequiredError = required && isEmpty;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
            {label}
            {required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
          {tooltip && (
            <Tooltip content={tooltip}>
              <HelpCircle size={12} className="text-zinc-600 hover:text-zinc-400 transition-colors cursor-help" />
            </Tooltip>
          )}
        </div>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full bg-zinc-950 border rounded-lg text-zinc-200 font-mono text-sm
            appearance-none px-3 py-2.5 pr-8 transition-all duration-200 cursor-pointer
            ${error || showRequiredError
              ? "border-red-500/50 focus:border-red-400"
              : focused
                ? "border-emerald-500/50 ring-1 ring-emerald-500/20"
                : "border-zinc-800 hover:border-zinc-700"
            }
          `}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
        />
      </div>
    </div>
  );
}
