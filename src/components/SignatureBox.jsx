"use client";

import { useEffect, useRef, useState } from "react";
import SignaturePad from "signature_pad";

export default function SignatureBox({ onChange }) {
  const canvasRef = useRef(null);
  const padRef = useRef(null);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    function resize() {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d").scale(ratio, ratio);
      padRef.current?.clear();
    }
    padRef.current = new SignaturePad(canvas, {
      backgroundColor: "rgb(255,255,255)",
      penColor: "rgb(10,19,48)",
    });
    padRef.current.addEventListener("endStroke", () => {
      const empty = padRef.current.isEmpty();
      setHasSignature(!empty);
      onChange?.(empty ? null : padRef.current.toDataURL("image/png"));
    });
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-white/15 bg-white">
        <canvas ref={canvasRef} className="h-40 w-full touch-none" />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-white/50">
          {hasSignature ? "✓ Signature enregistrée" : "Signez avec le doigt ou la souris dans le cadre ci-dessus"}
        </span>
        <button
          type="button"
          onClick={() => {
            padRef.current?.clear();
            setHasSignature(false);
            onChange?.(null);
          }}
          className="text-xs font-semibold text-gold-400 hover:text-green-400 hover:underline"
        >
          Effacer
        </button>
      </div>
    </div>
  );
}
