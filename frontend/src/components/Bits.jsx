export function StatBlock({ label, value, sub, tone }) {
  const toneClass =
    tone === "gain" ? "text-gain" : tone === "loss" ? "text-loss" : "text-ink";
  return (
    <div className="stub-card rounded-sm px-6 py-5">
      <div className="field-label text-ink-faint mb-2">{label}</div>
      <div className={`ledger-num text-2xl font-semibold ${toneClass}`}>{value}</div>
      {sub && <div className="field-label text-ink-faint mt-1 normal-case">{sub}</div>}
    </div>
  );
}

export function Stamp({ children, tone = "neutral" }) {
  const toneClass =
    tone === "gain"
      ? "text-gain bg-gain-soft"
      : tone === "loss"
      ? "text-loss bg-loss-soft"
      : "text-ink-soft bg-transparent";
  return <span className={`stamp ${toneClass}`}>{children}</span>;
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="border border-dashed border-line-strong rounded-sm px-8 py-14 text-center">
      <p className="font-display text-lg text-ink mb-1">{title}</p>
      {hint && <p className="text-ink-soft text-sm mb-5">{hint}</p>}
      {action}
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const base =
    "field-label px-4 py-2 rounded-sm border transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-ink text-surface border-ink hover:bg-ink-soft hover:border-ink-soft",
    ghost: "bg-transparent text-ink-soft border-line-strong hover:text-ink hover:border-ink",
    danger: "bg-transparent text-loss border-loss hover:bg-loss-soft",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function TextField({ label, ...props }) {
  return (
    <label className="block">
      <span className="field-label text-ink-soft block mb-1">{label}</span>
      <input
        className="w-full bg-surface border border-line-strong rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
        {...props}
      />
    </label>
  );
}

export function SelectField({ label, children, ...props }) {
  return (
    <label className="block">
      <span className="field-label text-ink-soft block mb-1">{label}</span>
      <select
        className="w-full bg-surface border border-line-strong rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
