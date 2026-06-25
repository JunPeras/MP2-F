import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";

export interface RoomParticipant {
  id: string;
  name: string;
  isLocal: boolean;
  micOn: boolean;
  camOn: boolean;
  stream?: MediaStream;
}

export function useRoomParticipants(
  socket: Socket | null,
  localUid: string,
  localName: string,
  localStream: MediaStream | null,
  micOn: boolean,
  camOn: boolean,
  remoteStreams: Map<string, MediaStream>,
  peerInfoMap: Map<string, { uid: string; displayName: string }>
) {
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);

  useEffect(() => {
    setParticipants((prev) => {
      const others = prev.filter((p) => !p.isLocal);
      const local: RoomParticipant = { id: localUid, name: `${localName} (Tú)`, isLocal: true, micOn, camOn, stream: localStream || undefined };
      return [local, ...others];
    });
  }, [localUid, localName, localStream, micOn, camOn]);

  useEffect(() => {
    setParticipants((prev) => prev.map((p) => {
      if (p.isLocal) return p;
      let stream: MediaStream | undefined;
      peerInfoMap.forEach((info, sid) => { if (info.uid === p.id) stream = remoteStreams.get(sid); });
      return stream ? { ...p, stream } : p;
    }));
  }, [remoteStreams, peerInfoMap]);

  useEffect(() => {
    if (!socket) return;

    const onExistingUsers = (users: { uid: string; displayName: string; micOn?: boolean; camOn?: boolean }[]) => {
      setParticipants((prev) => {
        const local = prev.find((p) => p.isLocal);
        const remotes = users
          .filter((u) => u.uid !== localUid)
          .map((u) => ({ id: u.uid, name: u.displayName, isLocal: false, micOn: u.micOn ?? false, camOn: u.camOn ?? false }));
        return local ? [local, ...remotes] : remotes;
      });
    };

    const onUserJoined = ({ uid, displayName, micOn, camOn }: { uid: string; displayName: string; micOn?: boolean; camOn?: boolean }) => {
      if (uid === localUid) return;
      setParticipants((prev) => prev.some((p) => p.id === uid) ? prev : [...prev, { id: uid, name: displayName, isLocal: false, micOn: micOn ?? false, camOn: camOn ?? false }]);
    };

    const onUserLeft = ({ uid }: { uid: string }) => {
      setParticipants((prev) => prev.filter((p) => p.id !== uid));
    };

    const onMediaState = ({ uid, micOn: m, camOn: c }: { uid: string; micOn: boolean; camOn: boolean }) => {
      setParticipants((prev) => prev.map((p) => (p.id === uid ? { ...p, micOn: m, camOn: c } : p)));
    };

    socket.on("existing-users", onExistingUsers);
    socket.on("user-joined", onUserJoined);
    socket.on("user-left", onUserLeft);
    socket.on("user-media-state", onMediaState);

    return () => {
      socket.off("existing-users", onExistingUsers);
      socket.off("user-joined", onUserJoined);
      socket.off("user-left", onUserLeft);
      socket.off("user-media-state", onMediaState);
    };
  }, [socket, localUid]);

  return participants;
}
