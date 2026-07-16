"use client";

import { useEffect, useRef, useState } from "react";

export default function FacialCapture({ onChange }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | streaming | captured | error
  const [photo, setPhoto] = useState(null);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("streaming");
    } catch {
      setStatus("error");
    }
  }

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setPhoto(dataUrl);
    setStatus("captured");
    onChange?.(true);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  function retake() {
    setPhoto(null);
    setStatus("idle");
    onChange?.(false);
  }

  useEffect(() => {
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  return (
    <div className="rounded-lg border border-white/15 bg-white/5 p-4">
      <canvas ref={canvasRef} className="hidden" />
      {status === "captured" && photo ? (
        <div className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="Photo capturée" className="h-40 w-40 rounded-lg object-cover" />
          <button type="button" onClick={retake} className="text-xs font-semibold text-gold-400 hover:underline">
            Reprendre la photo
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          {status === "streaming" ? (
            <video ref={videoRef} className="h-40 w-56 rounded-lg bg-black object-cover" muted playsInline />
          ) : (
            <div className="flex h-40 w-56 items-center justify-center rounded-lg bg-navy-900 text-4xl">📷</div>
          )}
          {status === "error" && (
            <p className="text-center text-xs text-red-300">
              Caméra indisponible sur cet appareil/navigateur. Vous pouvez simuler la capture pour continuer la démonstration.
            </p>
          )}
          <div className="flex gap-3">
            {status !== "streaming" && (
              <button type="button" onClick={startCamera} className="rounded-full border border-white/25 px-4 py-2 text-xs font-semibold hover:border-gold-400 hover:text-gold-400">
                Activer la caméra
              </button>
            )}
            {status === "streaming" && (
              <button type="button" onClick={capture} className="btn-gold rounded-full px-4 py-2 text-xs font-bold">
                Capturer la photo
              </button>
            )}
            {status === "error" && (
              <button
                type="button"
                onClick={() => {
                  setPhoto("simulated");
                  setStatus("captured");
                  onChange?.(true);
                }}
                className="rounded-full border border-white/25 px-4 py-2 text-xs font-semibold hover:border-gold-400 hover:text-gold-400"
              >
                Simuler la capture
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
