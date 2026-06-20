import { useState, useEffect } from "react";

export function useUserMedia() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let s: MediaStream | null = null;

    const tryGet = (constraints: MediaStreamConstraints) =>
      navigator.mediaDevices.getUserMedia(constraints);

    const start = async () => {
      try {
        s = await tryGet({ video: true, audio: true });
      } catch {
        try {
          s = await tryGet({ audio: true });
        } catch {
          if (!cancelled) {
            setError("No se pudo acceder al micrófono ni a la cámara. Verifica los permisos del navegador.");
            setMicOn(false);
            setCamOn(false);
          }
          return;
        }
      }
      if (cancelled) {
        s.getTracks().forEach((t) => t.stop());
        return;
      }
      setStream(s);
      setMicOn(s.getAudioTracks().length > 0);
      setCamOn(s.getVideoTracks().length > 0);
    };

    start();

    return () => {
      cancelled = true;
      s?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const toggleMic = () => {
    const next = !micOn;
    setMicOn(next);
    stream?.getAudioTracks().forEach((t) => { t.enabled = next; });
  };

  const toggleCam = () => {
    const next = !camOn;
    setCamOn(next);
    stream?.getVideoTracks().forEach((t) => { t.enabled = next; });
  };

  return { stream, micOn, camOn, error, toggleMic, toggleCam };
}
