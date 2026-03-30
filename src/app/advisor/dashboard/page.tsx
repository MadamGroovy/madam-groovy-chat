"use client";

import { useState, useEffect, useRef } from "react";
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
import { getIntakes, IntakeData, updateIntake } from "@/lib/intakeStore";

const NOTIFICATION_SOUND = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleR8XKJXa2b5eIBkjkt3iu3QiGS6T1uC5bR8SLJLV4bZqIBgtktTft2sfFjGQ1N21ayIYLozU3bNqIRkvjdPds2kgGTCO0dyyayIYMYzS3LBqIRkyjdDcsGohGTKM0NuvaiIZMovP27BqIRkyi8/bsGohGTKJz9uuaiIZMonP26xqIRkxic/brGohGTJxz9usaiEZMnHP26xqIRkycc/brGohGTJxz9usa";

export default function AdvisorDashboard() {
  const router = useRouter();
  const [chatRequests, setChatRequests] = useState<ChatSession[]>([]);
  const [activeSessions, setActiveSessions] = useState<ChatSession[]>([]);
  const [intakes, setIntakes] = useState<IntakeData[]>([]);
  const [clientNotes, setClientNotes] = useState<ClientNote[]>([]);
  const [earnings, setEarnings] = useState(0);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [selectedIntake, setSelectedIntake] = useState<IntakeData | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [showIntakeResponse, setShowIntakeResponse] = useState(false);
  const [intakeResponse, setIntakeResponse] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem("advisorLoggedIn");
    if (!loggedIn) {
      router.push("/advisor");
    }
  }, [router]);

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.volume = 0.8;
      audio.play().catch(() => {});
    } catch (e) {
      console.log("Audio play failed", e);
    }
  };

  const showBrowserNotification = (intake: IntakeData) => {
    playNotificationSound();
    
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🔮 New Client Waiting!", {
        body: `${intake.name}: ${intake.question.substring(0, 50)}...`,
        icon: "/favicon.ico",
        tag: intake.id,
      });
    }
  };

  useEffect(() => {
    requestNotificationPermission();

    const loadData = () => {
      setChatRequests(getChatRequests());
      setActiveSessions(getActiveSessions());
      setIntakes(getIntakes().filter(i => i.status === "waiting"));
      setClientNotes(getClientNotes());
      setEarnings(getEarnings());
    };

    loadData();
    const interval = setInterval(loadData, 2000);

    const handleNewIntake = (e: Event) => {
      const intake = (e as CustomEvent).detail as IntakeData;
      showBrowserNotification(intake);
      loadData();
    };

    window.addEventListener("newIntake", handleNewIntake as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener("newIntake", handleNewIntake as EventListener);
    };
  }, []);

  const acceptIntake = (intake: IntakeData) => {
    setSelectedIntake(intake);
    setShowIntakeResponse(true);
  };

  const sendIntakeResponse = () => {
    if (!selectedIntake || !intakeResponse.trim()) return;

    const currentIntake = localStorage.getItem("madamGroovy_currentIntake");
    if (currentIntake) {
      const stored = JSON.parse(currentIntake);
      localStorage.setItem("madamGroovy_currentIntake", JSON.stringify({
        ...stored,
        harmonyResponse: intakeResponse,
        status: "active"
      }));
    }

    updateIntake(selectedIntake.id, { 
      status: "active",
      harmonyResponse: intakeResponse 
    });
    
    setShowIntakeResponse(false);
    setIntakeResponse("");
    setSelectedIntake(null);
    setIntakes(getIntakes().filter(i => i.status === "waiting"));
  };

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
          <div className="p-4 border-b border-[var(--card-border)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium opacity-60">
                Waiting ({intakes.length})
              </h2>
              {intakes.length > 0 && (
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              )}
            </h2>
            {intakes.length === 0 ? (
              <p className="text-sm opacity-40 text-center py-4">
                No one waiting
              </p>
            ) : (
              <div className="space-y-2">
                {intakes.map((intake) => (
                  <button
                    key={intake.id}
                    onClick={() => setSelectedIntake(intake)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      selectedIntake?.id === intake.id
                        ? "bg-[var(--accent)]"
                        : "bg-[var(--background)] hover:bg-[var(--card-border)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{intake.name}</p>
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                        New
                      </span>
                    </div>
                    <p className="text-xs opacity-60 truncate">
                      {intake.question}
                    </p>
                    {intake.hasOtherPerson && (
                      <p className="text-xs opacity-40 mt-1">
                        + {intake.otherPersonName}: {intake.otherPersonDetail}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-b border-[var(--card-border)]">
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

          <div className="p-4">
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
          {selectedIntake && !showIntakeResponse ? (
            <div className="flex-1 p-6">
              <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-cinzel)" }}>
                    {selectedIntake.name}
                  </h2>
                  <span className="text-sm opacity-50">
                    {new Date(selectedIntake.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm opacity-60 mb-1">Question</p>
                    <p className="text-lg">{selectedIntake.question}</p>
                  </div>

                  {selectedIntake.hasOtherPerson && (
                    <div className="bg-[var(--background)] rounded-xl p-4">
                      <p className="text-sm opacity-60 mb-1">Reading about someone else</p>
                      <p className="font-medium">{selectedIntake.otherPersonName}</p>
                      <p className="text-sm opacity-70">{selectedIntake.otherPersonDetail}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => acceptIntake(selectedIntake)}
                    className="flex-1 py-3 bg-[var(--accent)] text-white rounded-xl font-medium hover:opacity-90 transition-all"
                  >
                    I'll be there in 5 min
                  </button>
                  <button
                    onClick={() => {
                      updateIntake(selectedIntake.id, { status: "completed" });
                      setIntakes(getIntakes().filter(i => i.status === "waiting"));
                      setSelectedIntake(null);
                    }}
                    className="px-6 py-3 border border-[var(--card-border)] rounded-xl hover:bg-[var(--card-border)] transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ) : showIntakeResponse ? (
            <div className="flex-1 p-6">
              <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 max-w-2xl">
                <h3 className="font-bold mb-4">Send response to {selectedIntake?.name}</h3>
                <textarea
                  value={intakeResponse}
                  onChange={(e) => setIntakeResponse(e.target.value)}
                  placeholder="e.g., I'll be with you in about 5 minutes. Please stay on this page."
                  className="w-full h-32 px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] mb-4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={sendIntakeResponse}
                    disabled={!intakeResponse.trim()}
                    className="flex-1 py-3 bg-[var(--accent)] text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    Send & Start Chat
                  </button>
                  <button
                    onClick={() => {
                      setShowIntakeResponse(false);
                      setIntakeResponse("");
                    }}
                    className="px-6 py-3 border border-[var(--card-border)] rounded-xl hover:bg-[var(--card-border)] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : selectedSession ? (
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
                  Select someone to respond
                </p>
                <p className="text-sm opacity-30 mt-2">
                  Waiting clients appear at the top
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </main>
  );
}
