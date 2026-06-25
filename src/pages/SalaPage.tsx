import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/useAuthStore";
import { apiGet } from "../lib/api";
import { useUserMedia } from "../hooks/useUserMedia";
import { useWebRTC } from "../hooks/useWebRTC";
import { useRoomParticipants } from "../hooks/useRoomParticipants";
import { useToast, ToastContainer } from "../components/Toast";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0a; }

  .sl-root {
    min-height: 100vh; height: 100vh;
    background: #0a0a0a;
    font-family: 'Outfit', sans-serif;
    color: #e5e5e5;
    display: flex; flex-direction: column;
    overflow: hidden;
  }

  .sl-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px; height: 56px; flex-shrink: 0;
    background: #0f0f0f; border-bottom: 1px solid #1a1a1a;
  }
  .sl-nav-left { display: flex; align-items: center; gap: 14px; }
  .sl-back-btn {
    background: none; border: none; cursor: pointer;
    color: #4caf50; display: flex; align-items: center; padding: 4px;
    transition: color 0.2s;
  }
  .sl-back-btn:hover { color: #81c784; }
  .sl-nav-logo { display: flex; align-items: center; gap: 8px; }
  .sl-nav-logo-icon {
    width: 32px; height: 32px;
    background: #111; border: 1.5px solid #2a5c2a; border-radius: 7px;
    display: flex; align-items: center; justify-content: center; color: #4caf50;
  }
  .sl-room-info { display: flex; flex-direction: column; gap: 1px; }
  .sl-room-name { font-size: 16px; font-weight: 700; color: #fff; line-height: 1; }
  .sl-room-code { font-size: 12px; color: #555; }
  .sl-copy-link-btn {
    background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 6px;
    padding: 3px 8px; font-size: 11px; color: #888; cursor: pointer;
    font-family: 'Outfit', sans-serif; transition: all 0.2s;
    white-space: nowrap;
  }
  .sl-copy-link-btn:hover { border-color: #2a5c2a; color: #4caf50; }
  .sl-copy-link-btn.copied { color: #4caf50; border-color: #4caf50; }
  .sl-nav-actions { display: flex; align-items: center; gap: 8px; }
  .sl-nav-icon-btn {
    background: none; border: 1px solid #1e1e1e; border-radius: 8px;
    width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #888; transition: border-color 0.2s, color 0.2s;
  }
  .sl-nav-icon-btn:hover { border-color: #2a5c2a; color: #4caf50; }
  .sl-nav-icon-btn.active { border-color: #2a5c2a; color: #4caf50; }

  .sl-body { display: flex; flex: 1; overflow: hidden; }

  .sl-sidebar-left {
    width: 240px; flex-shrink: 0;
    background: #0f0f0f; border-right: 1px solid #1a1a1a;
    display: flex; flex-direction: column;
    overflow-y: auto;
  }
  .sl-sidebar-title {
    padding: 16px 16px 12px;
    font-size: 14px; font-weight: 600; color: #aaa;
    border-bottom: 1px solid #1a1a1a;
  }
  .sl-participant-list { padding: 8px 0; }
  .sl-participant-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px;
    transition: background 0.15s;
  }
  .sl-participant-item:hover { background: #141414; }
  .sl-participant-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: #1e4d1e;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #81c784; flex-shrink: 0;
  }
  .sl-participant-name { font-size: 14px; color: #ccc; }

  .sl-center {
    flex: 1; display: flex; flex-direction: column;
    overflow: hidden; position: relative;
  }
  .sl-video-grid {
    flex: 1;
    display: grid;
    gap: 2px;
    background: #050505;
    overflow: hidden;
  }
  .sl-video-grid.expanded {
    overflow-y: auto;
    align-content: start;
    grid-auto-rows: 220px;
  }
  .sl-video-grid.expanded::-webkit-scrollbar { width: 4px; }
  .sl-video-grid.expanded::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
  .sl-tile-more {
    background: #111; border: 1px solid #222;
    cursor: pointer; transition: background 0.2s;
  }
  .sl-tile-more:hover { background: #1a2a1a; border-color: #2a5c2a; }
  .sl-tile-more-inner {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
  }
  .sl-tile-more-count {
    font-size: 32px; font-weight: 700; color: #4caf50; line-height: 1;
  }
  .sl-tile-more-label { font-size: 12px; color: #666; }
  .sl-collapse-btn {
    position: absolute; top: 10px; right: 10px; z-index: 5;
    background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 6px;
    padding: 4px 10px; font-size: 12px; color: #888; cursor: pointer;
    font-family: 'Outfit', sans-serif; transition: border-color 0.2s, color 0.2s;
  }
  .sl-collapse-btn:hover { border-color: #2a5c2a; color: #4caf50; }
  .sl-video-tile {
    background: #0d1a0d;
    position: relative;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .sl-video-avatar {
    width: 72px; height: 72px; border-radius: 50%;
    background: #1e4d1e;
    display: flex; align-items: center; justify-content: center;
    font-size: 26px; font-weight: 700; color: #81c784;
    border: 2px solid #2a6b2a;
  }
  .sl-video-name {
    position: absolute; bottom: 14px; left: 14px;
    font-size: 13px; font-weight: 500; color: #ccc;
    background: rgba(0,0,0,0.55); padding: 3px 8px; border-radius: 5px;
    z-index: 2;
  }
  .sl-video-stream {
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%; object-fit: cover;
  }
  .sl-video-indicators {
    position: absolute; bottom: 14px; right: 14px;
    display: flex; gap: 4px; z-index: 2;
  }
  .sl-video-indicator {
    width: 26px; height: 26px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.5);
  }
  .sl-video-indicator svg { width: 12px; height: 12px; }
  .sl-video-indicator.off { background: rgba(198,40,40,0.85); color: #fff; }
  .sl-video-indicator.on { color: #81c784; }

  .sl-controls {
    height: 68px; flex-shrink: 0;
    background: #0f0f0f; border-top: 1px solid #1a1a1a;
    display: flex; align-items: center; justify-content: center;
    gap: 12px;
  }
  .sl-ctrl-btn {
    width: 46px; height: 46px; border-radius: 50%;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #ccc;
    transition: background 0.2s, border-color 0.2s, color 0.2s;
  }
  .sl-ctrl-btn:hover { background: #222; border-color: #3a3a3a; }
  .sl-ctrl-btn.active { background: #1e4d1e; border-color: #2a6b2a; color: #81c784; }
  .sl-ctrl-btn.danger { background: #c62828; border-color: #b71c1c; color: #fff; }
  .sl-ctrl-btn.danger:hover { background: #b71c1c; }

  .sl-sidebar-right {
    width: 300px; flex-shrink: 0;
    background: #0f0f0f; border-left: 1px solid #1a1a1a;
    display: flex; flex-direction: column;
  }
  .sl-chat-header {
    padding: 16px 16px 12px;
    font-size: 15px; font-weight: 600; color: #ddd;
    border-bottom: 1px solid #1a1a1a;
    flex-shrink: 0;
  }
  .sl-chat-messages {
    flex: 1; overflow-y: auto; padding: 14px 14px 0;
    display: flex; flex-direction: column;
  }
  .sl-chat-messages::-webkit-scrollbar { width: 4px; }
  .sl-chat-messages::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
  .sl-chat-system {
    font-size: 12px; color: #555; text-align: center; font-style: italic;
    margin-bottom: 14px;
  }
  .sl-chat-group {
    display: flex; flex-direction: column; gap: 2px;
    margin-bottom: 14px;
    max-width: 100%;
  }
  .sl-chat-group--me { align-items: flex-end; }
  .sl-chat-group--other { align-items: flex-start; }
  .sl-chat-author {
    font-size: 12px; font-weight: 600;
    margin-bottom: 2px; padding: 0 4px;
  }
  .sl-chat-bubble {
    background: #1e1e1e; color: #bbb;
    padding: 8px 12px; border-radius: 12px;
    font-size: 13px; line-height: 1.45;
    max-width: 85%; word-break: break-word;
  }
  .sl-chat-bubble--me {
    background: #1a3d1a; color: #e5e5e5;
    border-bottom-right-radius: 4px;
  }
  .sl-chat-group--other .sl-chat-bubble {
    border-bottom-left-radius: 4px;
  }
  .sl-chat-input-row {
    padding: 12px;
    display: flex; gap: 8px; align-items: center;
    border-top: 1px solid #1a1a1a; flex-shrink: 0;
  }
  .sl-chat-input {
    flex: 1; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px;
    padding: 8px 12px; font-size: 13px; font-family: 'Outfit', sans-serif;
    color: #e5e5e5; outline: none; transition: border-color 0.2s;
  }
  .sl-chat-input::placeholder { color: #444; }
  .sl-chat-input:focus { border-color: #3a7d3a; }
  .sl-chat-send-btn {
    width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0;
    background: #4caf50; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #fff; transition: background 0.2s;
  }
  .sl-chat-send-btn:hover { background: #43a047; }

  .mobile-only { display: none !important; }
  .sl-drawer-close {
    background: none; border: none; color: #888;
    font-size: 18px; cursor: pointer; padding: 4px;
    display: flex; align-items: center; justify-content: center;
  }
  .sl-drawer-close:hover { color: #fff; }
  .sl-drawer-overlay { display: none; }

  @media (max-width: 1023px) {
    .desktop-only { display: none !important; }
    .mobile-only { display: flex !important; }

    .sl-sidebar-left,
    .sl-sidebar-right {
      position: fixed;
      top: 0; bottom: 0;
      z-index: 50;
      transition: transform 0.25s ease;
    }
    .sl-sidebar-left { left: 0; width: 260px; transform: translateX(-100%); }
    .sl-sidebar-right { right: 0; width: 320px; transform: translateX(100%); }
    .sl-sidebar-left.open { transform: translateX(0); }
    .sl-sidebar-right.open { transform: translateX(0); }

    .sl-drawer-overlay {
      display: block;
      position: fixed; inset: 0; background: rgba(0,0,0,0.6);
      z-index: 40; opacity: 0; pointer-events: none;
      transition: opacity 0.25s ease;
    }
    .sl-drawer-overlay.open { opacity: 1; pointer-events: auto; }
  }

  @media (max-width: 767px) {
    .sl-sidebar-right { width: 100%; }
    .sl-center { overflow-y: auto; }
    .sl-video-grid {
      display: flex !important;
      flex-direction: column;
      gap: 12px;
      padding: 12px;
      overflow-y: auto;
      background: #050505;
    }
    .sl-video-tile {
      width: 100%;
      height: 300px;
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #111;
      border: 2px solid #222;
      border-radius: 16px;
      position: relative;
      overflow: hidden;
    }
    .sl-video-stream {
      position: static;
      width: auto;
      height: auto;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 0;
      background: transparent;
    }
    .sl-video-avatar {
      position: static;
      width: 80px;
      height: 80px;
      font-size: 28px;
      margin: 0;
    }
    .sl-video-name {
      bottom: 10px;
      left: 10px;
      font-size: 12px;
    }
    .sl-video-indicators {
      bottom: 10px;
      right: 10px;
    }
    .sl-video-indicator {
      width: 28px;
      height: 28px;
    }
    .sl-nav { padding: 0 12px; height: 52px; }
    .sl-room-name { font-size: 14px; }
    .sl-room-code { display: none; }
    .sl-controls { height: 60px; gap: 8px; }
    .sl-ctrl-btn { width: 44px; height: 44px; }
  }
`;

const BookOpenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const ChatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const MicOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
    <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const VideoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const VideoOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);
const HandIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
  </svg>
);
const PhoneOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.43 9.88a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.34 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.32 8.91"/>
    <line x1="23" y1="1" x2="1" y2="23"/>
  </svg>
);
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const AVATAR_COLORS = ["#1e4d1e", "#1a3d5c", "#4d1e1e", "#3d1e4d"];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function getAuthorColor(name: string) {
  const colors = ["#5c8aff", "#ff9f43", "#a55eea", "#ff6b81", "#26de81", "#fed330"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

interface LocalMessage {
  id: string | number;
  type: "msg" | "system";
  author?: string;
  text: string;
  isMe?: boolean;
}

interface WsMessage {
  roomId: string;
  senderId: string;
  senderName?: string;
  text: string;
  timestamp: string;
}

const MAX_GRID = 9;

function getGridColumns(count: number): string {
  if (count <= 1) return "1fr";
  if (count <= 4) return "1fr 1fr";
  if (count <= 9) return "repeat(3, 1fr)";
  return "repeat(4, 1fr)";
}

function groupMessages(msgs: LocalMessage[]) {
  const groups: { author?: string; isMe: boolean; messages: LocalMessage[] }[] = [];
  let current: (typeof groups)[0] | null = null;
  for (const msg of msgs) {
    if (msg.type === "system") {
      groups.push({ author: undefined, isMe: false, messages: [msg] });
      current = null;
    } else {
      if (!current || current.author !== msg.author || current.isMe !== !!msg.isMe) {
        current = { author: msg.author, isMe: !!msg.isMe, messages: [msg] };
        groups.push(current);
      } else {
        current.messages.push(msg);
      }
    }
  }
  return groups;
}

let _idCounter = 0;
function uniqueId(prefix = "msg"): string {
  return `${prefix}-${Date.now()}-${++_idCounter}`;
}

export default function SalaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const currentUserName =
    user?.displayName || `${(user as any)?.firstName || ""} ${(user as any)?.lastName || ""}`.trim() || "Tú";

  const { stream: localStream, micOn, camOn, toggleMic, toggleCam } = useUserMedia();
  const [socket, setSocket] = useState<Socket | null>(null);
  const { remoteStreams, peerInfoMap } = useWebRTC(socket, localStream);
  const participants = useRoomParticipants(socket, user?.uid ?? "", currentUserName, localStream, micOn, camOn, remoteStreams, peerInfoMap);
  const { toasts, show, dismiss } = useToast();

  const showDeviceError = (message: string) => {
    show("error", "Dispositivo no disponible", message);
  };

  const [handRaised, setHandRaised] = useState(false);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const [roomName, setRoomName] = useState("Sala");
  const roomCode = id ?? "";
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [copied, setCopied] = useState(false);
  const [showAllGrid, setShowAllGrid] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!id) return;
    apiGet(`/api/rooms/${id}`).then((res) => {
      if (res.ok) res.json().then((data: { name?: string }) => { if (data.name) setRoomName(data.name); });
    }).catch(() => {});
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket creation + chat listeners (autoConnect: false para que los hooks registren listeners primero)
  useEffect(() => {
    if (!id || !user) return;
    const WS_URL = import.meta.env.VITE_WS_URL as string;
    if (!WS_URL) return;

    const s = io(WS_URL, { autoConnect: false });
    setSocket(s);

    s.on("connect", () => {
      s.emit("join-room", {
        roomId: id,
        uid: user.uid,
        displayName: currentUserName,
        micOn: false,
        camOn: false,
      });
      s.emit("load-messages", id);
    });

    s.on("history-loaded", (history: WsMessage[]) => {
      setMessages(history.map((m) => ({
        id: uniqueId("hist"),
        type: "msg" as const,
        author: m.senderId === user.uid ? currentUserName : (m.senderName || m.senderId.slice(0, 8)),
        text: m.text,
        isMe: m.senderId === user.uid,
      })));
    });

    s.on("receive-message", (msg: WsMessage) => {
      setMessages((prev) => [...prev, {
        id: uniqueId("rcv"),
        type: "msg",
        author: msg.senderId === user.uid ? currentUserName : (msg.senderName || msg.senderId.slice(0, 8)),
        text: msg.text,
        isMe: msg.senderId === user.uid,
      }]);
    });

    s.on("user-joined", ({ displayName }: { uid: string; displayName: string }) => {
      setMessages((prev) => [...prev, { id: uniqueId("sys"), type: "system", text: `${displayName} se ha unido a la sala` }]);
    });

    s.on("user-left", ({ displayName }: { uid: string; displayName: string }) => {
      setMessages((prev) => [...prev, { id: uniqueId("sys"), type: "system", text: `${displayName} ha abandonado la sala` }]);
    });

    return () => {
      s.emit("leave-room", id);
      s.disconnect();
      setSocket(null);
    };
  }, [id, user, currentUserName]);

  // Conectar el socket DESPUÉS de que useWebRTC y useRoomParticipants hayan registrado sus listeners
  useEffect(() => {
    if (socket && !socket.connected) {
      socket.connect();
    }
  }, [socket]);

  // Media-state broadcast
  useEffect(() => {
    if (!id || !user?.uid || !socket?.connected) return;
    socket.emit("media-state-change", { roomId: id, uid: user.uid, micOn, camOn });
  }, [micOn, camOn, id, user?.uid, socket]);

  // Attach local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const sendMessage = () => {
    const text = inputMsg.trim();
    if (!text || !user || !socket) return;
    socket.emit("send-message", {
      roomId: id!,
      senderId: user.uid,
      senderName: currentUserName,
      text,
      timestamp: new Date().toISOString(),
    });
    setInputMsg("");
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error copiando código de sala:", err);
    }
  };

  const needsMore = !showAllGrid && participants.length > MAX_GRID;
  const visible = needsMore ? participants.slice(0, MAX_GRID - 1) : participants;
  const hiddenCount = participants.length - visible.length;
  const tileCount = visible.length + (needsMore ? 1 : 0);

  return (
    <>
      <style>{styles}</style>
      <div className="sl-root">
        <nav className="sl-nav">
          <div className="sl-nav-left">
            <button className="sl-back-btn" onClick={() => navigate("/dashboard")}><ArrowLeftIcon /></button>
            <div className="sl-nav-logo">
              <div className="sl-nav-logo-icon"><BookOpenIcon /></div>
            </div>
            <div className="sl-room-info">
              <span className="sl-room-name">{roomName}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="sl-room-code">{roomCode}</span>
                <button className={`sl-copy-link-btn${copied ? ' copied' : ''}`} onClick={copyRoomCode}>
                  {copied ? 'Copiado!' : 'Copiar código'}
                </button>
              </div>
            </div>
          </div>
          <div className="sl-nav-actions">
            <button className="sl-nav-icon-btn" title="Participantes" onClick={() => setShowParticipants((v) => !v)}>
              <UsersIcon />
            </button>
            <button className="sl-nav-icon-btn active" title="Chat" onClick={() => setShowChat((v) => !v)}>
              <ChatIcon />
            </button>
            <button className="sl-nav-icon-btn desktop-only" title="Configuración">
              <SettingsIcon />
            </button>
          </div>
        </nav>

        <div
          className={`sl-drawer-overlay ${showParticipants || showChat ? 'open' : ''}`}
          onClick={() => { setShowParticipants(false); setShowChat(false); }}
        />

        <div className="sl-body">
          <aside className={`sl-sidebar-left ${showParticipants ? 'open' : ''}`}>
            <div className="sl-sidebar-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Participantes ({participants.length})
              <button className="sl-drawer-close mobile-only" onClick={() => setShowParticipants(false)}>✕</button>
            </div>
            <div className="sl-participant-list">
              {participants.map((p, i) => (
                <div key={p.id} className="sl-participant-item">
                  <div className="sl-participant-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                    {getInitials(p.name)}
                  </div>
                  <span className="sl-participant-name">{p.name}</span>
                </div>
              ))}
            </div>
          </aside>

          <div className="sl-center">
            {showAllGrid && (
              <button className="sl-collapse-btn" onClick={() => setShowAllGrid(false)}>Colapsar ↑</button>
            )}
            <div
              className={`sl-video-grid${showAllGrid ? " expanded" : ""}`}
              style={!isMobile ? { gridTemplateColumns: getGridColumns(tileCount) } : undefined}
            >
              {visible.map((p, i) => {
                const showVideo = p.camOn && !!p.stream && p.stream.getVideoTracks().length > 0;
                
                return (
                  <div key={p.id} className="sl-video-tile">
                    {/* 1. El elemento <video> SIEMPRE se renderiza. Evita que los refs queden en null.
                      2. Usamos 'display: none/block' para controlar si se ve o no sin romper la conexión.
                    */}
                    <video
                      ref={(el) => {
                        if (!el) return;
                        
                        const targetStream = p.isLocal ? localStream : p.stream;
                        
                        if (targetStream && el.srcObject !== targetStream) {
                          el.srcObject = targetStream;
                        }
                      }}
                      autoPlay
                      muted={p.isLocal}
                      playsInline
                      className="sl-video-stream"
                      style={{ display: showVideo ? "block" : "none" }}
                    />

                    {/* El avatar solo se muestra cuando la cámara está apagada */}
                    {!showVideo && (
                      <div className="sl-video-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                        {getInitials(p.name)}
                      </div>
                    )}

                    <span className="sl-video-name">{p.name}</span>
                    
                    <div className="sl-video-indicators">
                      <div className={`sl-video-indicator ${p.micOn ? "on" : "off"}`}>
                        {p.micOn ? <MicIcon /> : <MicOffIcon />}
                      </div>
                      <div className={`sl-video-indicator ${p.camOn ? "on" : "off"}`}>
                        {p.camOn ? <VideoIcon /> : <VideoOffIcon />}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {needsMore && (
                <div className="sl-video-tile sl-tile-more" onClick={() => setShowAllGrid(true)}>
                  <div className="sl-tile-more-inner">
                    <span className="sl-tile-more-count">+{hiddenCount}</span>
                    <span className="sl-tile-more-label">Ver más</span>
                  </div>
                </div>
              )}
            </div>

            <div className="sl-controls">
              <button className={`sl-ctrl-btn${micOn ? " active" : ""}`} title={micOn ? "Silenciar" : "Activar micrófono"} onClick={() => {
                if (!micOn && (localStream?.getAudioTracks().length ?? 0) === 0) {
                  showDeviceError("Micrófono no disponible. Verifica que esté conectado y los permisos del navegador.");
                  return;
                }
                toggleMic();
              }}>
                {micOn ? <MicIcon /> : <MicOffIcon />}
              </button>
              <button className={`sl-ctrl-btn${camOn ? " active" : ""}`} title={camOn ? "Apagar cámara" : "Activar cámara"} onClick={() => {
                if (!camOn && (localStream?.getVideoTracks().length ?? 0) === 0) {
                  showDeviceError("Cámara no disponible. Verifica que esté conectada y los permisos del navegador.");
                  return;
                }
                toggleCam();
              }}>
                {camOn ? <VideoIcon /> : <VideoOffIcon />}
              </button>
              <button className="sl-ctrl-btn" title="Compartir pantalla"><ShareIcon /></button>
              <button className={`sl-ctrl-btn${handRaised ? " active" : ""}`} title={handRaised ? "Bajar la mano" : "Levantar la mano"} onClick={() => setHandRaised((v) => !v)}>
                <HandIcon />
              </button>
              <button className="sl-ctrl-btn danger" title="Salir de la sala" onClick={() => navigate("/dashboard")}>
                <PhoneOffIcon />
              </button>
            </div>
          </div>

          <aside className={`sl-sidebar-right ${showChat ? 'open' : ''}`}>
            <div className="sl-chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Chat de la sala
              <button className="sl-drawer-close mobile-only" onClick={() => setShowChat(false)}>✕</button>
            </div>
            <div className="sl-chat-messages">
              {groupMessages(messages).map((group, idx) =>
                !group.author ? (
                  <div key={`sys-${idx}`} className="sl-chat-system">{group.messages[0].text}</div>
                ) : (
                  <div key={`grp-${idx}`} className={`sl-chat-group ${group.isMe ? "sl-chat-group--me" : "sl-chat-group--other"}`}>
                    {!group.isMe && <span className="sl-chat-author" style={{ color: getAuthorColor(group.author) }}>{group.author}</span>}
                    {group.messages.map((msg) => (
                      <div key={msg.id} className={`sl-chat-bubble ${group.isMe ? "sl-chat-bubble--me" : ""}`}>{msg.text}</div>
                    ))}
                  </div>
                )
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="sl-chat-input-row">
              <input
                className="sl-chat-input"
                placeholder="Escribe un mensaje..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button className="sl-chat-send-btn" onClick={sendMessage} title="Enviar"><SendIcon /></button>
            </div>
          </aside>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
