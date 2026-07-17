"use client";

export function Eyebrow({ children }) {
  return (
    <span className="inline-block rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold-300">
      {children}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, center = false }) {
  return (
    <div className={`mb-12 max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-white/65">{subtitle}</p>}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`card-surface rounded-2xl p-6 ${className}`}>{children}</div>
  );
}

export function Alert({ type = "info", children }) {
  if (!children) return null;
  const styles =
    type === "error"
      ? "border-red-400/40 bg-red-500/10 text-red-200"
      : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200";
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</div>
  );
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`btn-gold rounded-full px-6 py-3 text-sm font-bold shadow-lg shadow-gold-400/30 transition disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, className = "", ...props }) {
  return (
    <button
      className={`rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-gold-400 hover:text-gold-400 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-white/80">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm outline-none ring-gold-400 focus:ring-2 focus:border-gold-400 focus:bg-white/20 transition";

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-navy-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
