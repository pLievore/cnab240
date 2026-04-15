import { useState } from "react";
import { masks } from "../../utils/masks.js";
import { HelpCircle } from "lucide-react";
import Tooltip from "./Tooltip.jsx";

/**
 * @param {{ label?: string, value: string, onChange: (v: string) => void, mask?: string, tooltip?: string, charLimit?: number, icon?: React.ReactNode, error?: boolean, className?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>} props
 */
export default function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  mask,
  tooltip,
  charLimit,
  icon,
  error = false,
  required = false,
  className = "",
  maxLength,
  ...props
}) {
  const [focused, setFocused] = useState(false);

  const handleChange = (e) => {
    let val = e.target.value;
    if (mask && masks[mask]) val = masks[mask](val);
    onChange(val);
  };

  const effectiveMaxLength = charLimit || maxLength;
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
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={effectiveMaxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full bg-zinc-950 border rounded-lg text-zinc-200 font-mono text-sm
            px-3 py-2.5 transition-all duration-200
            placeholder:text-zinc-700
            ${icon ? "pl-9" : ""}
            ${error || showRequiredError
              ? "border-red-500/50 focus:border-red-400 focus:ring-1 focus:ring-red-400/20"
              : focused
                ? "border-emerald-500/50 ring-1 ring-emerald-500/20 shadow-sm shadow-emerald-500/5"
                : "border-zinc-800 hover:border-zinc-700"
            }
          `}
          {...props}
        />
        {charLimit && (
          <span className={`absolute right-2 bottom-1 text-[10px] ${
            value.length >= charLimit ? "text-amber-500" : "text-zinc-700"
          }`}>
            {value.length}/{charLimit}
          </span>
        )}
      </div>
    </div>
  );
}
