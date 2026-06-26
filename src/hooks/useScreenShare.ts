import { useState, useRef, useEffect, useCallback } from "react";
import { Socket } from "socket.io-client";

export function useScreenShare(
  socket: Socket | null,
  localUid: string | null,
  roomId: string | null
) {
  const [sharing, setSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const endedHandlerRef = useRef<(() => void) | null>(null);
  const sharingRef = useRef(false);

  sharingRef.current = sharing;

  const stopLocal = useCallback((notifyServer: boolean) => {
    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setScreenStream(null);
    }
    if (endedHandlerRef.current) {
      endedHandlerRef.current = null;
    }
    setSharing(false);
    if (notifyServer && socket?.connected) {
      socket.emit("screen-share-request", {
        roomId,
        uid: localUid,
        action: "stop",
      });
    }
  }, [socket, localUid, roomId]);

  const attachEndedListener = useCallback((stream: MediaStream) => {
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;
    const handler = () => {
      if (sharingRef.current) {
        stopLocal(true);
      }
    };
    endedHandlerRef.current = handler;
    videoTrack.addEventListener("ended", handler);
  }, [stopLocal]);

  const startSharing = useCallback(async () => {
    if (!socket?.connected) {
      setError("No hay conexión con el servidor");
      return;
    }
    if (sharing) return;
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError("Tu navegador no soporta compartir pantalla");
      return;
    }
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      streamRef.current = stream;
      attachEndedListener(stream);
      setScreenStream(stream);
      setSharing(true);
      socket.emit("screen-share-request", {
        roomId,
        uid: localUid,
        action: "start",
      });
    } catch (e: unknown) {
      const err = e as { name?: string; message?: string };
      if (err?.name === "NotAllowedError") {
        setError(null);
      } else {
        setError(err?.message || "No se pudo iniciar la compartición de pantalla");
      }
    }
  }, [socket, localUid, roomId, sharing, attachEndedListener]);

  const stopSharing = useCallback(() => {
    stopLocal(true);
  }, [stopLocal]);

  useEffect(() => {
    if (!socket) return;

    const onScreenShareState = ({ uid, sharing: s }: { uid: string; sharing: boolean }) => {
      if (uid !== localUid) return;
      if (!s && sharingRef.current) {
        stopLocal(false);
      }
    };

    socket.on("user-screen-share-state", onScreenShareState);
    return () => {
      socket.off("user-screen-share-state", onScreenShareState);
    };
  }, [socket, localUid, stopLocal]);

  useEffect(() => {
    return () => {
      const s = streamRef.current;
      if (s) s.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  return { sharing, screenStream, error, startSharing, stopSharing };
}
