"use client";

export function Eyebrow({ children }) {
  return (
    <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-blue-600">
      {children}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, center = false }) {
  return (
    <div className={`mb-12 max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-4 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-gray-600">{subtitle}</p>}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-6 ${className}`}>
      {children}
    </div>
  );
}

export function Alert({ type = "info", children }) {
  if (!children) return null;
  const styles =
    type === "error"
      ? "border-red-300 bg-red-50 text-red-700"
      : "border-emerald-300 bg-emerald-50 text-emerald-700";
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</div>
  );
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`btn-gold rounded-full px-6 py-3 text-sm font-bold shadow-md transition disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, className = "", ...props }) {
  return (
    <button
      className={`rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition";

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-red-300 hover:text-red-500"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
