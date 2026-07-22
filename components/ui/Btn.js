const LOOKS = {
  fill: "bg-accent text-white hover:bg-accent-600 shadow-sm hover:shadow-md hover:-translate-y-px",
  outline: "bg-surface text-ink-muted border border-border hover:border-accent hover:text-accent-700",
  ghost: "bg-transparent text-ink-dim hover:bg-accent-soft hover:text-accent-700",
  dark: "bg-shell-hover text-shell-text border border-shell-border hover:bg-shell-active",
  danger: "bg-bad text-white hover:brightness-110",
  success: "bg-ok text-white hover:brightness-110",
};

const SIZES = {
  xs: "px-2.5 py-1 text-[11px] gap-1",
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-[13px] gap-1.5",
  lg: "px-5 py-2.5 text-sm gap-2",
};

export default function Btn({
  children,
  onClick,
  disabled,
  look = "fill",
  size = "md",
  Icon,
  full,
  type = "button",
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md font-medium whitespace-nowrap transition-all duration-150 select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none active:translate-y-px ${LOOKS[look]} ${SIZES[size]} ${full ? "w-full" : ""} ${className}`}
    >
      {Icon && <Icon size={15} strokeWidth={2} />}
      {children}
    </button>
  );
}
