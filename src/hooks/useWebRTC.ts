import { useState, useRef, useEffect, useCallback } from "react";
import { Socket } from "socket.io-client";
import Peer from "simple-peer/simplepeer.min.js";

const iceServerUrl = import.meta.env.VITE_ICE_SERVER_URL as string | undefined;
const iceServerUsername = import.meta.env.VITE_ICE_SERVER_USERNAME as string | undefined;
const iceServerCredential = import.meta.env.VITE_ICE_SERVER_CREDENTIAL as string | undefined;

function buildIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [];
  if (iceServerUrl) {
    iceServerUrl
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean)
      .forEach((url) => {
        const full = /^stun:|^turn:|^turns:/.test(url) ? url : `turn:${url}`;
        const cfg: RTCIceServer = { urls: full };
        if (iceServerUsername) cfg.username = iceServerUsername;
        if (iceServerCredential) cfg.credential = iceServerCredential;
        servers.push(cfg);
      });
  }
  if (!servers.length) {
    servers.push({ urls: "stun:stun.l.google.com:19302" });
  } else if (!servers.some((s) =>
    Array.isArray(s.urls) ? s.urls.some((u) => u.startsWith("turn:")) : s.urls.startsWith("turn:")
  )) {
    servers.push({ urls: "stun:stun.l.google.com:19302" });
  }
  return servers;
}

export interface PeerInfo {
  uid: string;
  displayName: string;
}

export function useWebRTC(socket: Socket | null, localStream: MediaStream | null) {
  const peersRef = useRef<Record<string, Peer.Instance>>({});
  const localStreamRef = useRef<MediaStream | null>(localStream);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [peerInfoMap, setPeerInfoMap] = useState<Map<string, PeerInfo>>(new Map());

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  const createPeer = useCallback((theirId: string, initiator: boolean) => {
    if (!socket || peersRef.current[theirId]) return;
    const opts: Peer.Options = { initiator, config: { iceServers: buildIceServers() } };
    if (localStream) opts.stream = localStream;
    const peer = new Peer(opts);
    peer.on("signal", (data) => socket.emit("signal", theirId, socket.id, data));
    peer.on("stream", (stream: MediaStream) => {
      setRemoteStreams((prev) => new Map(prev).set(theirId, stream));
    });
    peer.on("close", () => {
      setRemoteStreams((prev) => { const next = new Map(prev); next.delete(theirId); return next; });
    });
    peer.on("error", (err) => console.error("Peer error", theirId, err));
    peersRef.current[theirId] = peer;
  }, [socket, localStream]);

  const destroyPeer = useCallback((id: string) => {
    const peer = peersRef.current[id];
    if (peer) { try { peer.destroy(); } catch (e) { void e; } delete peersRef.current[id]; }
    setRemoteStreams((prev) => { const next = new Map(prev); next.delete(id); return next; });
    setPeerInfoMap((prev) => { const next = new Map(prev); next.delete(id); return next; });
  }, []);

  const setVideoSource = useCallback((newStream: MediaStream | null) => {
    const newVideoTrack = newStream?.getVideoTracks()[0] || null;
    const audioTrack = localStreamRef.current?.getAudioTracks()[0] || null;
    const syntheticStream = new MediaStream();
    if (newVideoTrack) syntheticStream.addTrack(newVideoTrack);
    if (audioTrack) syntheticStream.addTrack(audioTrack);

    Object.values(peersRef.current).forEach((peer) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const senders = (peer as any)._pc?.getSenders?.() || [];
        const videoSender = senders.find((s: RTCRtpSender) => s.track?.kind === "video");
        if (videoSender) {
          videoSender.replaceTrack(newVideoTrack).catch((err: unknown) => {
            console.error("replaceTrack error", err);
          });
        } else {
          try { peer.removeStream(localStreamRef.current as MediaStream); } catch (e) { void e; }
          try { peer.addStream(syntheticStream); } catch (e) { void e; }
        }
      } catch (e) {
        void e;
      }
    });
  }, []);

  useEffect(() => {
    if (!localStream) return;
    Object.values(peersRef.current).forEach((peer) => {
      try { peer.addStream(localStream); } catch (e) { void e; }
    });
  }, [localStream]);

  useEffect(() => {
    if (!socket) return;

    const onIntroduction = (clients: { socketId: string; uid: string; displayName: string }[]) => {
      clients.forEach((c) => {
        if (c.socketId === socket.id || peersRef.current[c.socketId]) return;
        setPeerInfoMap((prev) => new Map(prev).set(c.socketId, { uid: c.uid, displayName: c.displayName }));
        createPeer(c.socketId, true);
      });
    };

    const onNewUser = (client: { socketId: string; uid: string; displayName: string }) => {
      if (client.socketId === socket.id || peersRef.current[client.socketId]) return;
      setPeerInfoMap((prev) => new Map(prev).set(client.socketId, { uid: client.uid, displayName: client.displayName }));
      createPeer(client.socketId, false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onSignal = (to: string, from: string, data: any) => {
      if (to !== socket.id) return;
      const existing = peersRef.current[from];
      if (existing) { existing.signal(data); return; }
      createPeer(from, false);
      peersRef.current[from]?.signal(data);
    };

    socket.on("introduction", onIntroduction);
    socket.on("newUserConnected", onNewUser);
    socket.on("userDisconnected", destroyPeer);
    socket.on("signal", onSignal);

    return () => {
      socket.off("introduction", onIntroduction);
      socket.off("newUserConnected", onNewUser);
      socket.off("userDisconnected", destroyPeer);
      socket.off("signal", onSignal);
    };
  }, [socket, createPeer, destroyPeer]);

  useEffect(() => {
    return () => {
      Object.values(peersRef.current).forEach((p) => { try { p.destroy(); } catch (e) { void e; } });
      peersRef.current = {};
    };
  }, []);

  return { remoteStreams, peerInfoMap, setVideoSource };
}
