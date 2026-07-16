"use client";

export default function Stepper({ steps, current }) {
  return (
    <div className="mb-10 flex items-center justify-between">
      {steps.map((label, i) => {
        const idx = i + 1;
        const active = idx === current;
        const done = idx < current;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                  done
                    ? "bg-gold-500 text-navy-950"
                    : active
                    ? "border-2 border-gold-400 text-gold-300"
                    : "border border-white/20 text-white/40"
                }`}
              >
                {done ? "✓" : idx}
              </div>
              <span className={`hidden text-[11px] font-medium sm:block ${active ? "text-gold-300" : "text-white/40"}`}>
                {label}
              </span>
            </div>
            {idx !== steps.length && (
              <div className={`mx-2 h-0.5 flex-1 ${done ? "bg-gold-500" : "bg-white/15"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
