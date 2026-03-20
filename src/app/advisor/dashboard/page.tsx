"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getChatRequests,
  getActiveSessions,
  updateSession,
  endSession,
  saveClientNote,
  getClientNotes,
  getEarnings,
  ChatSession,
  ChatMessage,
  ClientNote,
} from "@/lib/chatStore";

export default function AdvisorDashboard() {
  const router = useRouter();
  const [chatRequests, setChatRequests] = useState<ChatSession[]>([]);
  const [activeSessions, setActiveSessions] = useState<ChatSession[]>([]);
  const [clientNotes, setClientNotes] = useState<ClientNote[]>([]);
  const [earnings, setEarnings] = useState(0);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [noteInput, setNoteInput] = useState("");

  useEffect(() => {
    const loggedIn = localStorage.getItem("advisorLoggedIn");
    if (!loggedIn) {
      router.push("/advisor");
    }
  }, [router]);

  useEffect(() => {
    const loadData = () => {
      setChatRequests(getChatRequests());
      setActiveSessions(getActiveSessions());
      setClientNotes(getClientNotes());
      setEarnings(getEarnings());
    };

    loadData();
    const interval = setInterval(loadData, 2000);

    const handleUpdate = () => loadData();
    window.addEventListener("storage", handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const acceptChat = (session: ChatSession) => {
    const accepted = { ...session, status: "active" as const };
    updateSession(accepted);
    setSelectedSession(accepted);
    setChatRequests((prev) => prev.filter((s) => s.id !== session.id));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedSession) return;

    const msg: ChatMessage = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "harmony",
      timestamp: Date.now(),
    };

    const updated = {
      ...selectedSession,
      messages: [...selectedSession.messages, msg],
    };
    updateSession(updated);
    localStorage.setItem(`madamGroovy_session_${selectedSession.id}`, JSON.stringify({
      messages: updated.messages,
    }));
    setSelectedSession(updated);
    setNewMessage("");
  };

  const handleSaveNote = () => {
    if (selectedSession && noteInput.trim()) {
      saveClientNote(selectedSession.clientName, noteInput);
      setClientNotes(getClientNotes());
      setNoteInput("");
    }
  };

  const handleEndChat = () => {
    if (selectedSession) {
      endSession(selectedSession.id);
      setActiveSessions(getActiveSessions());
      setEarnings(getEarnings());
      setSelectedSession(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("advisorLoggedIn");
    router.push("/advisor");
  };

  const allSessions = [...chatRequests, ...activeSessions];
  const selectedNote = selectedSession
    ? clientNotes.find((n) => n.clientName === selectedSession.clientName)
    : null;

  return (
    <main className="relative z-10 min-h-screen bg-[var(--background)]">
      <header className="bg-[var(--card)] border-b border-[var(--card-border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🔮</span>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-cinzel)" }}
              >
                Advisor Dashboard
              </h1>
              <p className="text-sm opacity-60">Welcome back, Harmony</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm opacity-60">Today&apos;s Earnings</p>
              <p
                className="text-2xl font-bold text-[var(--accent)]"
                style={{ fontFamily: "var(--font-cinzel)" }}
              >
                ${earnings.toFixed(2)}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-[var(--card-border)] rounded-lg hover:bg-[var(--card-border)] transition-all text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        <aside className="w-80 bg-[var(--card)] border-r border-[var(--card-border)] overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-medium opacity-60 mb-3">
              Chat Requests ({chatRequests.length})
            </h2>
            {chatRequests.length === 0 ? (
              <p className="text-sm opacity-40 text-center py-4">
                No pending requests
              </p>
            ) : (
              <div className="space-y-2">
                {chatRequests.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      selectedSession?.id === session.id
                        ? "bg-[var(--primary)]"
                        : "bg-[var(--background)] hover:bg-[var(--card-border)]"
                    }`}
                  >
                    <p className="font-medium">{session.clientName}</p>
                    <p className="text-xs opacity-60 truncate">
                      {session.question}
                    </p>
                    <p className="text-xs opacity-40 mt-1">
                      {Math.floor((Date.now() - session.createdAt) / 60000)}m ago
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[var(--card-border)]">
            <h2 className="text-sm font-medium opacity-60 mb-3">
              Active Chats ({activeSessions.length})
            </h2>
            {activeSessions.length === 0 ? (
              <p className="text-sm opacity-40 text-center py-4">No active chats</p>
            ) : (
              <div className="space-y-2">
                {activeSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      selectedSession?.id === session.id
                        ? "bg-[var(--primary)]"
                        : "bg-[var(--background)] hover:bg-[var(--card-border)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{session.clientName}</p>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                        {session.minutesRemaining}m
                      </span>
                    </div>
                    <p className="text-xs opacity-60 truncate">
                      {session.question}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          {selectedSession ? (
            <>
              <div className="bg-[var(--card)] border-b border-[var(--card-border)] px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg">{selectedSession.clientName}</h2>
                  <p className="text-sm opacity-60">{selectedSession.question}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className={`px-3 py-1.5 rounded-full text-sm font-mono ${
                      selectedSession.status === "waiting"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {selectedSession.status === "waiting" ? "⏳ Waiting" : "💬 Active"}
                  </div>
                  {selectedSession.status === "waiting" && (
                    <button
                      onClick={() => acceptChat(selectedSession)}
                      className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition-all"
                    >
                      Accept Chat
                    </button>
                  )}
                  {selectedSession.status === "active" && (
                    <button
                      onClick={handleEndChat}
                      className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                    >
                      End Chat
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedSession.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "harmony" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                        msg.sender === "harmony"
                          ? "chat-bubble-left"
                          : "chat-bubble-right text-white"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <p className="text-xs opacity-50 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[var(--card)] border-t border-[var(--card-border)] p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type your response..."
                    className="flex-1 px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-glow)] text-white rounded-xl font-bold disabled:opacity-50 transition-all"
                  >
                    Send
                  </button>
                </div>
              </div>

              <div className="bg-[var(--background)] border-t border-[var(--card-border)] p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-80">
                    Notes for {selectedSession.clientName}
                  </h3>
                  {selectedNote && (
                    <span className="text-xs opacity-40">
                      Last updated: {new Date(selectedNote.lastUpdated).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add a note about this client..."
                    className="flex-1 px-3 py-2 bg-[var(--card)] border border-[var(--card-border)] rounded-lg text-sm"
                  />
                  <button
                    onClick={handleSaveNote}
                    className="px-4 py-2 bg-[var(--primary)]/20 text-[var(--primary)] rounded-lg text-sm hover:bg-[var(--primary)]/30 transition-all"
                  >
                    Save
                  </button>
                </div>
                {selectedNote && (
                  <p className="text-sm opacity-60 mt-2 italic">
                    {selectedNote.notes}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl opacity-20">🌙</span>
                <p className="text-lg opacity-40 mt-4">
                  Select a chat to start responding
                </p>
                <p className="text-sm opacity-30 mt-2">
                  New requests will appear here automatically
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </main>
  );
}
