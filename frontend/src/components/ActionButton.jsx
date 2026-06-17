import { motion } from "framer-motion";

/**
 * ActionButton — Minimalist, animated action trigger.
 *
 * Variants:
 *   primary   → solid bg-slate-100, dark text, subtle scale-up on hover
 *   secondary → outlined border-slate-700, light text, glow border on hover
 *   danger    → outlined border-rose-800/50, rose text, rose glow on hover
 */

const variantStyles = {
  primary:
    "bg-slate-100 text-slate-900 hover:bg-white",
  secondary:
    "border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-slate-100",
  danger:
    "border border-rose-800/50 text-rose-400 hover:border-rose-600 hover:text-rose-300",
};

export default function ActionButton({
  children,
  variant = "primary",
  icon: Icon,
  onClick,
  disabled = false,
  className = "",
}) {
  const classes = variantStyles[variant] || variantStyles.primary;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={`
        inline-flex items-center justify-center gap-2
        px-4 py-2 rounded-lg
        text-sm font-medium
        cursor-pointer select-none
        transition-colors duration-200
        disabled:opacity-40 disabled:pointer-events-none
        ${classes}
        ${className}
      `}
    >
      {Icon && <Icon size={15} strokeWidth={2} />}
      {children}
    </motion.button>
  );
}
