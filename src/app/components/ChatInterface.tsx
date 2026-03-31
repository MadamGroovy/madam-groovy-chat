"use client";

import { useState, useEffect, useRef } from "react";
import {
  addChatRequest,
  updateSession,
  generateSessionId,
  ChatSession,
  ChatMessage,
} from "@/lib/chatStore";

const PRICE_PER_MINUTE = 1;

const minuteOptions = [
  { minutes: 1, price: 1, label: "+1 min" },
  { minutes: 3, price: 3, label: "+3 min" },
  { minutes: 5, price: 5, label: "+5 min" },
  { minutes: 10, price: 10, label: "+10 min" },
  { minutes: 30, price: 25, label: "30 min", discount: true },
];

interface ChatInterfaceProps {
  name: string;
  phone: string;
  question: string;
  initialMinutes: number;
}

export default function ChatInterface({
  name,
  phone,
  question,
  initialMinutes,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showAddMinutes, setShowAddMinutes] = useState(false);
  const [sessionId] = useState(generateSessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialMsg: ChatMessage = {
      id: "1",
      text: `Hello, you're currently first in line. Let me connect you with Harmony — please hang on.`,
      sender: "harmony",
      timestamp: Date.now(),
    };
    setMessages([initialMsg]);

    const session: ChatSession = {
      id: sessionId,
      clientName: name,
      clientPhone: phone,
      question,
      minutesRemaining: initialMinutes,
      messages: [initialMsg],
      status: "waiting",
      createdAt: Date.now(),
      earnings: 0,
    };
    addChatRequest(session);
  }, [name, phone, question, initialMinutes, sessionId]);

  useEffect(() => {
    if (remainingSeconds <= 0 && remainingSeconds >= -1) {
      setShowUpgradeModal(true);
      return;
    }

    if (remainingSeconds > 0) {
      const timer = setInterval(() => {
        setRemainingSeconds((prev) => {
          const newVal = prev - 1;
          if (newVal % 30 === 0) {
            setMessages((msgs) => {
              const session: ChatSession = {
                id: sessionId,
                clientName: name,
                clientPhone: phone,
                question,
                minutesRemaining: Math.floor(newVal / 60),
                messages: msgs,
                status: "active",
                createdAt: Date.now(),
                earnings: 0,
              };
              updateSession(session);
              return msgs;
            });
          }
          return newVal;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [remainingSeconds, sessionId, name, phone, question]);

  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem(`madamGroovy_session_${sessionId}`);
      if (stored) {
        const { messages: newMsgs } = JSON.parse(stored);
        if (newMsgs && newMsgs.length > messages.length) {
          setMessages(newMsgs);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    const interval = setInterval(handleStorage, 1000);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [sessionId, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || remainingSeconds <= 0) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "client",
      timestamp: Date.now(),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setNewMessage("");

    const session: ChatSession = {
      id: sessionId,
      clientName: name,
      clientPhone: phone,
      question,
      minutesRemaining: Math.floor(remainingSeconds / 60),
      messages: newMessages,
      status: "active",
      createdAt: Date.now(),
      earnings: 0,
    };
    updateSession(session);
  };

  const handleAddMinutes = async (minutes: number, price: number) => {
    setPaymentProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRemainingSeconds((prev) => prev + minutes * 60);
    setShowUpgradeModal(false);
    setPaymentProcessing(false);
    setShowAddMinutes(true);
    setTimeout(() => setShowAddMinutes(false), 2000);
  };

  const handleEndSession = () => {
    const endMsg: ChatMessage = {
      id: Date.now().toString(),
      text: "Thank you for connecting with Madam Groovy. May you find the clarity you seek. Blessings.",
      sender: "harmony",
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, endMsg]);
    setShowUpgradeModal(false);
    setRemainingSeconds(0);
  };

  const isLowTime = remainingSeconds <= 60 && remainingSeconds > 0;
  const isVeryLowTime = remainingSeconds <= 30 && remainingSeconds > 0;

  return (
    <main className="relative z-10 min-h-screen flex flex-col">
      <header className="bg-[var(--card)] border-b border-[var(--card-border)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌙</span>
          <div>
            <h2
              className="font-bold"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              Madam Groovy
            </h2>
            <p className="text-xs opacity-60">Chat with Harmony</p>
          </div>
        </div>
        <div
          className={`px-3 py-1.5 rounded-full text-sm font-mono flex items-center gap-2 ${
            isVeryLowTime
              ? "bg-red-500/20 text-red-400 animate-pulse"
              : isLowTime
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-[var(--background)]"
          }`}
        >
          <span>⏱</span>
          <span>{formatTime(remainingSeconds)}</span>
        </div>
      </header>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "client" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 ${
                msg.sender === "client"
                  ? "chat-bubble-right text-white"
                  : "chat-bubble-left"
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
        <div ref={messagesEndRef} />
      </div>

      {showAddMinutes && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-[var(--accent)] text-white px-4 py-2 rounded-full animate-bounce">
          Minutes added! Continue your reading.
        </div>
      )}

      {isLowTime && !showUpgradeModal && (
        <div className="mx-4 mb-2 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-center">
          <p className="text-sm text-yellow-300">
            ⚠️ Running low on time.{" "}
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="underline font-bold"
            >
              Add minutes
            </button>
          </p>
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="bg-[var(--card)] border-t border-[var(--card-border)] p-4"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={remainingSeconds <= 0}
            placeholder={
              remainingSeconds <= 0
                ? "Session ended - add minutes to continue"
                : "Type your message..."
            }
            className="flex-1 px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || remainingSeconds <= 0}
            className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-glow)] text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ➤
          </button>
        </div>
      </form>

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">⏱</div>
              <h3
                className="text-xl font-bold"
                style={{ fontFamily: "var(--font-cinzel)" }}
              >
                Your minutes have ended
              </h3>
              <p className="opacity-70 mt-2">
                🌙 Your session with Madam Groovy has paused.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium opacity-80 mb-3">
                Choose minutes to add:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {minuteOptions.map((opt) => (
                  <button
                    key={opt.minutes}
                    onClick={() => handleAddMinutes(opt.minutes, opt.price)}
                    disabled={paymentProcessing}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center ${
                      "border-[var(--card-border)] hover:border-[var(--primary)]"
                    } ${paymentProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span className="font-bold">{opt.label}</span>
                    <span className="text-[var(--accent)]">${opt.price}</span>
                    {opt.discount && (
                      <span className="text-xs text-yellow-400">Save $5</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-[var(--card-border)] pt-4">
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <span>💳</span> Pay securely with card:
              </p>
              <div className="bg-[var(--background)] rounded-xl p-4 space-y-3">
                <input
                  type="text"
                  placeholder="Card number"
                  className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--card-border)] rounded-lg text-sm"
                  disabled={paymentProcessing}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="px-3 py-2 bg-[var(--card)] border border-[var(--card-border)] rounded-lg text-sm"
                    disabled={paymentProcessing}
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    className="px-3 py-2 bg-[var(--card)] border border-[var(--card-border)] rounded-lg text-sm"
                    disabled={paymentProcessing}
                  />
                </div>
              </div>
              <p className="text-xs text-center mt-3 opacity-50 flex items-center justify-center gap-2">
                <span>🔒</span> Stripe secured • Your card info is safe
              </p>
            </div>

            <button
              onClick={handleEndSession}
              disabled={paymentProcessing}
              className="w-full mt-4 py-3 border border-[var(--card-border)] rounded-xl hover:bg-[var(--card-border)] transition-all opacity-70"
            >
              End Session
            </button>

            {paymentProcessing && (
              <div className="absolute inset-0 bg-[var(--card)]/80 flex items-center justify-center rounded-2xl">
                <div className="text-center">
                  <div className="animate-spin text-3xl mb-2">🔮</div>
                  <p>Processing payment...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
