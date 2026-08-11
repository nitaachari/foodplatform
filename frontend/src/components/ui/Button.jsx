const variants = {
  primary: "bg-chili text-paper hover:bg-chili/90",
  secondary: "bg-ink text-paper hover:bg-ink/90",
  ghost: "bg-transparent text-ink hover:bg-ink/5 border border-ink/15",
};

export default function Button({
  variant = "primary",
  className = "",
  disabled,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
