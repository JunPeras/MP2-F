import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/useAuthStore";
import { apiGet } from "../lib/api";

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

  /* ── Navbar ── */
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
  .sl-nav-actions { display: flex; align-items: center; gap: 8px; }
  .sl-nav-icon-btn {
    background: none; border: 1px solid #1e1e1e; border-radius: 8px;
    width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #888; transition: border-color 0.2s, color 0.2s;
  }
  .sl-nav-icon-btn:hover { border-color: #2a5c2a; color: #4caf50; }
  .sl-nav-icon-btn.active { border-color: #2a5c2a; color: #4caf50; }

  /* ── Body ── */
  .sl-body {
    display: flex; flex: 1; overflow: hidden;
  }

  /* ── Left sidebar: participantes ── */
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

  /* ── Center: video grid ── */
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
  .sl-media-error {
    position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
    background: rgba(198,40,40,0.85); color: #fff;
    padding: 6px 16px; border-radius: 8px; font-size: 13px;
    z-index: 10; white-space: nowrap; pointer-events: none;
  }

  /* ── Controls bar ── */
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

  /* ── Right sidebar: chat ── */
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

  /* ── Responsive helpers ── */
  .mobile-only { display: none !important; }
  .sl-drawer-close {
    background: none; border: none; color: #888;
    font-size: 18px; cursor: pointer; padding: 4px;
    display: flex; align-items: center; justify-content: center;
  }
  .sl-drawer-close:hover { color: #fff; }
  .sl-drawer-overlay {
    display: none;
  }

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
    .sl-video-grid { grid-template-columns: 1fr !important; grid-auto-rows: 220px; overflow-y: auto; }
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
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
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

interface Participant {
  id: string;
  name: string;
  micOn: boolean;
  camOn: boolean;
  isLocal: boolean;
  stream?: MediaStream;
}

// const MOCK_PARTICIPANTS = [
//   { id: "1", name: "Juan Esteban" },
//   { id: "2", name: "Maria Garcia" },
//   { id: "3", name: "Valentina Garcia" },
//   { id: "4", name: "Juan Pablo" },
// ];

// #79 — Grid dinámico: límite de tiles y cálculo de columnas
const MAX_GRID = 9;

function getGridColumns(count: number): string {
  if (count <= 1) return "1fr";
  if (count <= 4) return "1fr 1fr";
  if (count <= 9) return "repeat(3, 1fr)";
  return "repeat(4, 1fr)";
}

// Participantes simulados — descomenta el array y comenta la línea vacía para activarlos
// const MOCK_EXTRA_PARTICIPANTS: Participant[] = [
//   { id: "m1",  name: "Maria Garcia",       micOn: true,  camOn: true,  isLocal: false },
//   { id: "m2",  name: "Juan Esteban",       micOn: false, camOn: true,  isLocal: false },
//   { id: "m3",  name: "Valentina Roa",      micOn: true,  camOn: false, isLocal: false },
//   { id: "m4",  name: "Andrés Felipe",      micOn: false, camOn: false, isLocal: false },
//   { id: "m5",  name: "Sofía Herrera",      micOn: true,  camOn: true,  isLocal: false },
//   { id: "m6",  name: "Carlos Mendoza",     micOn: false, camOn: true,  isLocal: false },
//   { id: "m7",  name: "Laura Jiménez",      micOn: true,  camOn: false, isLocal: false },
//   { id: "m8",  name: "Diego Ospina",       micOn: true,  camOn: true,  isLocal: false },
//   { id: "m9",  name: "Isabela Castro",     micOn: false, camOn: false, isLocal: false },
//   { id: "m10", name: "Sebastián Torres",   micOn: true,  camOn: true,  isLocal: false },
//   { id: "m11", name: "Natalia Vargas",     micOn: false, camOn: true,  isLocal: false },
//   { id: "m12", name: "Felipe Ríos",        micOn: true,  camOn: false, isLocal: false },
//   { id: "m13", name: "Alejandra Mora",     micOn: true,  camOn: true,  isLocal: false },
//   { id: "m14", name: "Tomás Gutiérrez",    micOn: false, camOn: false, isLocal: false },
//   { id: "m15", name: "Daniela Suárez",     micOn: true,  camOn: true,  isLocal: false },
//   { id: "m16", name: "Julián Peña",        micOn: false, camOn: true,  isLocal: false },
//   { id: "m17", name: "Camila Reyes",       micOn: true,  camOn: false, isLocal: false },
//   { id: "m18", name: "Mateo Salcedo",      micOn: true,  camOn: true,  isLocal: false },
//   { id: "m19", name: "Paula Londoño",      micOn: false, camOn: false, isLocal: false },
//   { id: "m20", name: "Esteban Cárdenas",   micOn: true,  camOn: true,  isLocal: false },
//   { id: "m21", name: "Manuela Pardo",      micOn: false, camOn: true,  isLocal: false },
//   { id: "m22", name: "Samuel Arango",      micOn: true,  camOn: false, isLocal: false },
//   { id: "m23", name: "Luisa Fernanda",     micOn: false, camOn: false, isLocal: false },
//   { id: "m24", name: "Nicolás Bernal",     micOn: true,  camOn: true,  isLocal: false },
//   { id: "m25", name: "Ana Lucía Pérez",    micOn: true,  camOn: false, isLocal: false },
//   { id: "m26", name: "David Castillo",     micOn: false, camOn: true,  isLocal: false },
//   { id: "m27", name: "Sara Quintero",      micOn: true,  camOn: true,  isLocal: false },
//   { id: "m28", name: "Miguel Ángel Ruiz",  micOn: false, camOn: false, isLocal: false },
//   { id: "m29", name: "Gabriela Nieto",     micOn: true,  camOn: false, isLocal: false },
//   { id: "m30", name: "Alejandro Muñoz",    micOn: true,  camOn: true,  isLocal: false },
//   { id: "m31", name: "Verónica Aguilar",   micOn: false, camOn: true,  isLocal: false },
//   { id: "m32", name: "Iván Morales",       micOn: true,  camOn: false, isLocal: false },
//   { id: "m33", name: "Tatiana Orozco",     micOn: false, camOn: false, isLocal: false },
//   { id: "m34", name: "Ricardo Villamizar", micOn: true,  camOn: true,  isLocal: false },
//   { id: "m35", name: "Marcela Escobar",    micOn: false, camOn: true,  isLocal: false },
//   { id: "m36", name: "Óscar Patiño",       micOn: true,  camOn: false, isLocal: false },
//   { id: "m37", name: "Juliana Bedoya",     micOn: true,  camOn: true,  isLocal: false },
//   { id: "m38", name: "Hernán Cuervo",      micOn: false, camOn: false, isLocal: false },
//   { id: "m39", name: "Mónica Pedraza",     micOn: true,  camOn: true,  isLocal: false },
//   { id: "m40", name: "Cristian Zapata",    micOn: false, camOn: true,  isLocal: false },
// ];
// const MOCK_EXTRA_PARTICIPANTS: Participant[] = [];

// const MOCK_MESSAGES: LocalMessage[] = [
//   { id: 1, type: "msg", author: "Maria Garcia", text: "¡Hola a todos! Empecemos con el tema de integrales" },
//   { id: 2, type: "system", text: "Juan Esteban se ha unido a la sala" },
//   { id: 3, type: "msg", author: "Juan Esteban", text: "Buenos dias compañeros" },
//   { id: 4, type: "msg", author: "Valentina Garcia", text: "Hola Juan, ¿cómo vas?" },
//   { id: 5, type: "msg", author: "Juan Pablo", text: "Excelente pregunta" },
// ];

export default function SalaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [messages, setMessages] = useState<LocalMessage[]>(/* MOCK_MESSAGES */ []);
  const [inputMsg, setInputMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [showAllGrid, setShowAllGrid] = useState(false);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const socketToUidRef = useRef<Map<string, string>>(new Map());
  const uidToSocketRef = useRef<Map<string, string>>(new Map());
  const pendingJoinQueueRef = useRef<{ uid: string; displayName: string }[]>([]);
  // Callback que se ejecuta en cuanto localStreamRef esté listo (si existing-users llega primero)
  const onStreamReadyRef = useRef<(() => Promise<void>) | null>(null);

  const [roomName, setRoomName] = useState("Sala");
  const roomCode = id ?? "";

  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!id) return;
    apiGet(`/api/rooms/${id}`).then((res) => {
      if (res.ok) res.json().then((data: { name?: string }) => {
        if (data.name) setRoomName(data.name);
      });
    }).catch(() => {});
  }, [id]);

  const currentUserName =
    user?.displayName || `${(user as any)?.firstName || ""} ${(user as any)?.lastName || ""}`.trim() || "Tú";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!id || !user) return;
    const WS_URL = import.meta.env.VITE_WS_URL as string;
    if (!WS_URL) return;

    const socket = io(WS_URL);
    socketRef.current = socket;

    const createPeerConnection = (socketId: string, uid: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      // #77 — Añadir tracks locales a la conexión P2P
      localStreamRef.current?.getTracks().forEach((track: MediaStreamTrack) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) socket.emit("ice-candidate", { targetSocketId: socketId, candidate });
      };

      pc.ontrack = ({ streams }) => {
        if (!streams[0]) return;
        const stream = streams[0];
        setParticipants((prev) => prev.map((p) => (p.id === uid ? { ...p, stream } : p)));
      };

      peerConnectionsRef.current.set(socketId, pc);
      return pc;
    };

    // #80 — Chat + presencia: join-room ahora envía uid y displayName
    socket.on("connect", () => {
      socket.emit("join-room", { roomId: id, uid: user.uid, displayName: currentUserName });
      socket.emit("load-messages", id);
      // Emitir estado actual de media para que los demás sepan si estamos muteados
      socket.emit("media-state-change", { roomId: id!, uid: user.uid, micOn, camOn });
    });

    socket.on("history-loaded", (history: WsMessage[]) => {
      const mapped: LocalMessage[] = history.map((m) => ({
        id: `${m.timestamp}-${m.senderId}`,
        type: "msg",
        author: m.senderId === user.uid ? currentUserName : (m.senderName || m.senderId.slice(0, 8)),
        text: m.text,
        isMe: m.senderId === user.uid,
      }));
      setMessages(mapped);
    });

    socket.on("receive-message", (msg: WsMessage) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "msg",
          author: msg.senderId === user.uid ? currentUserName : (msg.senderName || msg.senderId.slice(0, 8)),
          text: msg.text,
          isMe: msg.senderId === user.uid,
        },
      ]);
    });

    // #80 — Participantes ya en la sala al entrar; #76 — iniciar oferta P2P con cada uno
    socket.on("existing-users", (users: { socketId: string; uid: string; displayName: string }[]) => {
      if (users.length === 0) return;
      setParticipants((prev) => {
        const local = prev.find((p) => p.isLocal);
        const remotes = users.map((u) => ({
          id: u.uid, name: u.displayName, micOn: true, camOn: true, isLocal: false,
        }));
        return local ? [local, ...remotes] : remotes;
      });

      const createOffers = async () => {
        for (const u of users) {
          try {
            socketToUidRef.current.set(u.socketId, u.uid);
            uidToSocketRef.current.set(u.uid, u.socketId);
            const pc = createPeerConnection(u.socketId, u.uid);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("offer", { targetSocketId: u.socketId, offer });
          } catch (err) {
            console.error("Error creating offer for", u.uid, err);
          }
        }
      };

      // Si el stream local aún no está listo, diferir hasta que applyStream lo active
      if (localStreamRef.current) {
        createOffers();
      } else {
        onStreamReadyRef.current = createOffers;
      }
    });

    // #80 — Alguien nuevo se unió: añadir al grid y encolar para asociar su socketId cuando llegue el offer
    socket.on("user-joined", ({ uid, displayName }: { uid: string; displayName: string }) => {
      pendingJoinQueueRef.current.push({ uid, displayName });
      setParticipants((prev) => [
        ...prev,
        { id: uid, name: displayName, micOn: true, camOn: true, isLocal: false },
      ]);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: "system", text: `${displayName} se ha unido a la sala` },
      ]);
    });

    // #80 — Alguien salió: cerrar su conexión P2P y quitarlo del grid
    socket.on("user-left", ({ uid, displayName }: { uid: string; displayName: string }) => {
      const socketId = uidToSocketRef.current.get(uid);
      if (socketId) {
        peerConnectionsRef.current.get(socketId)?.close();
        peerConnectionsRef.current.delete(socketId);
        socketToUidRef.current.delete(socketId);
        uidToSocketRef.current.delete(uid);
      }
      setParticipants((prev) => prev.filter((p) => p.id !== uid));
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: "system", text: `${displayName} ha abandonado la sala` },
      ]);
    });

    // Notificación de cambios de mic/cam de otros participantes
    socket.on("user-media-state", ({ uid, micOn: newMic, camOn: newCam }: { uid: string; micOn: boolean; camOn: boolean }) => {
      setParticipants((prev) => prev.map((p) => (p.id === uid ? { ...p, micOn: newMic, camOn: newCam } : p)));
    });

    // #76 — Recibir offer de alguien que acaba de entrar y responder con answer
    socket.on("offer", async ({ offer, senderSocketId }: { offer: RTCSessionDescriptionInit; senderSocketId: string }) => {
      try {
        const pending = pendingJoinQueueRef.current.shift();
        const uid = pending?.uid ?? senderSocketId;
        if (pending) {
          socketToUidRef.current.set(senderSocketId, uid);
          uidToSocketRef.current.set(uid, senderSocketId);
        }
        const pc = createPeerConnection(senderSocketId, uid);
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { targetSocketId: senderSocketId, answer });
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    });

    // #76 — Recibir answer y completar la negociación SDP
    socket.on("answer", async ({ answer, senderSocketId }: { answer: RTCSessionDescriptionInit; senderSocketId: string }) => {
      try {
        const pc = peerConnectionsRef.current.get(senderSocketId);
        if (pc) await pc.setRemoteDescription(answer);
      } catch (err) {
        console.error("Error handling answer:", err);
      }
    });

    // #76 — ICE candidates: intercambio de candidatos de red
    socket.on("ice-candidate", async ({ candidate, senderSocketId }: { candidate: RTCIceCandidateInit; senderSocketId: string }) => {
      try {
        const pc = peerConnectionsRef.current.get(senderSocketId);
        if (pc) await pc.addIceCandidate(candidate);
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    });

    return () => {
      socket.emit("leave-room", id);
      socket.disconnect();
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      socketToUidRef.current.clear();
      uidToSocketRef.current.clear();
      pendingJoinQueueRef.current = [];
      onStreamReadyRef.current = null;
    };
  }, [id, user?.uid]);

  // #75 — getUserMedia: captura cámara y micrófono del usuario local
  useEffect(() => {
    if (!user) return;

    const applyStream = (stream: MediaStream, hasVideo: boolean) => {
      localStreamRef.current = stream;
      setCamOn(hasVideo);
      // Fusionar: mantener remotos que existing-users pudo haber cargado antes de que getUserMedia resolviera
      setParticipants((prev: Participant[]) => {
        const remotes = prev.filter((p: Participant) => !p.isLocal);
        return [
          { id: user.uid, name: currentUserName, micOn: true, camOn: hasVideo, isLocal: true, stream },
          // ...MOCK_EXTRA_PARTICIPANTS,
          ...remotes,
        ];
      });
      // Lanzar los offers que quedaron pendientes esperando el stream
      if (onStreamReadyRef.current) {
        onStreamReadyRef.current();
        onStreamReadyRef.current = null;
      }
    };

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => applyStream(stream, true))
      .catch((err) => {
        console.warn("getUserMedia (video+audio):", err.name, err.message);
        // Fallback: intentar solo audio si no hay cámara disponible
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((audioStream) => {
            applyStream(audioStream, false);
          })
          .catch((err2) => {
            console.warn("getUserMedia (audio):", err2.name);
            setMicOn(false);
            setCamOn(false);
            setParticipants((prev: Participant[]) => {
              const remotes = prev.filter((p: Participant) => !p.isLocal);
              return [
                { id: user.uid, name: currentUserName, micOn: false, camOn: false, isLocal: true },
                // ...MOCK_EXTRA_PARTICIPANTS,
                ...remotes,
              ];
            });
          });
      });

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [user?.uid]);

  // Asigna el stream al elemento <video> local cuando ambos estén listos
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [participants]);

  // const sendMessage = () => {
  //   const text = inputMsg.trim();
  //   if (!text) return;
  //   setMessages((prev) => [...prev, { id: Date.now(), type: "msg", author: currentUserName, text }]);
  //   setInputMsg("");
  // };
  const sendMessage = () => {
    const text = inputMsg.trim();
    if (!text || !user || !socketRef.current) return;
    socketRef.current.emit("send-message", {
      roomId: id!,
      senderId: user.uid,
      senderName: currentUserName,
      text,
      timestamp: new Date().toISOString(),
    });
    setInputMsg("");
  };

  const showDeviceError = (msg: string) => {
    setMediaError(msg);
    setTimeout(() => setMediaError(null), 3000);
  };

  // #75 — toggles que afectan el stream real además del estado visual
  const toggleMic = () => {
    if (!micOn && (localStreamRef.current?.getAudioTracks().length ?? 0) === 0) {
      showDeviceError("Micrófono no disponible. Verifica que esté conectado y los permisos del navegador.");
      return;
    }
    const next = !micOn;
    setMicOn(next);
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = next; });
    setParticipants((prev) => prev.map((p) => (p.isLocal ? { ...p, micOn: next } : p)));
    socketRef.current?.emit("media-state-change", { roomId: id!, uid: user?.uid, micOn: next, camOn });
  };

  const toggleCam = () => {
    if (!camOn && (localStreamRef.current?.getVideoTracks().length ?? 0) === 0) {
      showDeviceError("Cámara no disponible. Verifica que esté conectada y los permisos del navegador.");
      return;
    }
    const next = !camOn;
    setCamOn(next);
    localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = next; });
    setParticipants((prev) => prev.map((p) => (p.isLocal ? { ...p, camOn: next } : p)));
    socketRef.current?.emit("media-state-change", { roomId: id!, uid: user?.uid, micOn, camOn: next });
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      <style>{styles}</style>
      <div className="sl-root">
        {/* Navbar */}
        <nav className="sl-nav">
          <div className="sl-nav-left">
            <button className="sl-back-btn" onClick={() => navigate("/dashboard")}>
              <ArrowLeftIcon />
            </button>
            <div className="sl-nav-logo">
              <div className="sl-nav-logo-icon"><BookOpenIcon /></div>
            </div>
            <div className="sl-room-info">
              <span className="sl-room-name">{roomName}</span>
              <span className="sl-room-code">{roomCode}</span>
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

        {/* Drawer overlay */}
        <div
          className={`sl-drawer-overlay ${showParticipants || showChat ? 'open' : ''}`}
          onClick={() => { setShowParticipants(false); setShowChat(false); }}
        />

        <div className="sl-body">
          {/* Sidebar izquierdo: participantes */}
          <aside className={`sl-sidebar-left ${showParticipants ? 'open' : ''}`}>
            <div className="sl-sidebar-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Participantes ({participants.length})
              <button className="sl-drawer-close mobile-only" onClick={() => setShowParticipants(false)}>✕</button>
            </div>
            <div className="sl-participant-list">
              {participants.map((p, i) => (
                <div key={p.id} className="sl-participant-item">
                  <div
                    className="sl-participant-avatar"
                    style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                  >
                    {getInitials(p.name)}
                  </div>
                  <span className="sl-participant-name">
                    {p.isLocal ? `${p.name} (Tú)` : p.name}
                  </span>
                </div>
              ))}
            </div>
          </aside>

          {/* Centro: video grid + controles */}
          <div className="sl-center">
            {mediaError && <div className="sl-media-error">{mediaError}</div>}
            {showAllGrid && (
              <button className="sl-collapse-btn" onClick={() => setShowAllGrid(false)}>
                Colapsar ↑
              </button>
            )}
            {(() => {
              const needsMore = !showAllGrid && participants.length > MAX_GRID;
              const visible = needsMore ? participants.slice(0, MAX_GRID - 1) : participants;
              const hiddenCount = participants.length - visible.length;
              const tileCount = visible.length + (needsMore ? 1 : 0);
              return (
                <div
                  className={`sl-video-grid${showAllGrid ? " expanded" : ""}`}
                  style={!isMobile ? { gridTemplateColumns: getGridColumns(tileCount) } : undefined}
                >
                  {visible.map((p, i) => (
                    <div key={p.id} className="sl-video-tile">
                      {/* #75 — stream local */}
                      {p.isLocal && p.camOn && (
                        <video
                          ref={localVideoRef}
                          autoPlay
                          muted
                          playsInline
                          className="sl-video-stream"
                        />
                      )}
                      {/* #78 — stream remoto: solo si hay tracks de video reales y cam activa */}
                      {!p.isLocal && p.camOn && p.stream && p.stream.getVideoTracks().length > 0 && (
                        <video
                          ref={(el: HTMLVideoElement | null) => { if (el) el.srcObject = p.stream!; }}
                          autoPlay
                          playsInline
                          className="sl-video-stream"
                        />
                      )}
                      {/* Avatar: local sin cam, o remoto sin video (sin stream, cam off, o sin video tracks) */}
                      {(p.isLocal ? !p.camOn : (!p.camOn || !p.stream || p.stream.getVideoTracks().length === 0)) && (
                        <div
                          className="sl-video-avatar"
                          style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                        >
                          {getInitials(p.name)}
                        </div>
                      )}
                      {/* #81 — Nombre e indicadores mic/cam sobre el tile */}
                      <span className="sl-video-name">
                        {p.isLocal ? `${p.name} (Tú)` : p.name}
                      </span>
                      <div className="sl-video-indicators">
                        <div className={`sl-video-indicator ${p.micOn ? "on" : "off"}`}>
                          {p.micOn ? <MicIcon /> : <MicOffIcon />}
                        </div>
                        <div className={`sl-video-indicator ${p.camOn ? "on" : "off"}`}>
                          {p.camOn ? <VideoIcon /> : <VideoOffIcon />}
                        </div>
                      </div>
                    </div>
                  ))}
                  {needsMore && (
                    <div
                      className="sl-video-tile sl-tile-more"
                      onClick={() => setShowAllGrid(true)}
                    >
                      <div className="sl-tile-more-inner">
                        <span className="sl-tile-more-count">+{hiddenCount}</span>
                        <span className="sl-tile-more-label">Ver más</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="sl-controls">
              <button
                className={`sl-ctrl-btn${micOn ? " active" : ""}`}
                title={micOn ? "Silenciar" : "Activar micrófono"}
                onClick={toggleMic}
              >
                {micOn ? <MicIcon /> : <MicOffIcon />}
              </button>
              <button
                className={`sl-ctrl-btn${camOn ? " active" : ""}`}
                title={camOn ? "Apagar cámara" : "Activar cámara"}
                onClick={toggleCam}
              >
                {camOn ? <VideoIcon /> : <VideoOffIcon />}
              </button>
              <button className="sl-ctrl-btn" title="Compartir pantalla">
                <ShareIcon />
              </button>
              <button
                className={`sl-ctrl-btn${handRaised ? " active" : ""}`}
                title={handRaised ? "Bajar la mano" : "Levantar la mano"}
                onClick={() => setHandRaised((v) => !v)}
              >
                <HandIcon />
              </button>
              <button
                className="sl-ctrl-btn danger"
                title="Salir de la sala"
                onClick={() => navigate("/dashboard")}
              >
                <PhoneOffIcon />
              </button>
            </div>
          </div>

          {/* Sidebar derecho: chat */}
          <aside className={`sl-sidebar-right ${showChat ? 'open' : ''}`}>
            <div className="sl-chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Chat de la sala
              <button className="sl-drawer-close mobile-only" onClick={() => setShowChat(false)}>✕</button>
            </div>
            <div className="sl-chat-messages">
              {groupMessages(messages).map((group, groupIdx) =>
                !group.author ? (
                  <div key={`sys-${groupIdx}`} className="sl-chat-system">
                    {group.messages[0].text}
                  </div>
                ) : (
                  <div
                    key={`grp-${groupIdx}`}
                    className={`sl-chat-group ${group.isMe ? "sl-chat-group--me" : "sl-chat-group--other"}`}
                  >
                    {!group.isMe && (
                      <span className="sl-chat-author" style={{ color: getAuthorColor(group.author) }}>
                        {group.author}
                      </span>
                    )}
                    {group.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`sl-chat-bubble ${group.isMe ? "sl-chat-bubble--me" : ""}`}
                      >
                        {msg.text}
                      </div>
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
                onKeyDown={handleInputKeyDown}
              />
              <button className="sl-chat-send-btn" onClick={sendMessage} title="Enviar">
                <SendIcon />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
