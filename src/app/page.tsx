"use client";

import { useState, useEffect } from "react";
import IntakeChat from "./components/IntakeChat";
import ChatInterface from "./components/ChatInterface";
import { IntakeData } from "./lib/intakeStore";

export default function Home() {
  const [mode, setMode] = useState<"landing" | "intake" | "chat">("landing");
  const [intakeData, setIntakeData] = useState<IntakeData | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true") {
      setShowAdmin(true);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("madamGroovy_currentIntake");
    if (stored) {
      const data = JSON.parse(stored) as IntakeData;
      if (data.status === "waiting") {
        setIntakeData(data);
        setMode("intake");
      }
    }
  }, []);

  const startIntake = () => {
    localStorage.removeItem("madamGroovy_currentIntake");
    setMode("intake");
  };

  const proceedToChat = () => {
    if (intakeData) {
      setMode("chat");
    }
  };

  if (mode === "intake") {
    return <IntakeChat />;
  }

  if (mode === "chat" && intakeData) {
    return (
      <ChatInterface
        name={intakeData.name}
        phone=""
        question={intakeData.question}
        initialMinutes={3}
      />
    );
  }

  return (
    <main className="relative z-10 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block mb-4 animate-float">
            <span className="text-6xl">🌙</span>
          </div>
          <h1 
            className="text-4xl font-bold mb-2 tracking-wide"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            Madam Groovy
          </h1>
          <p className="text-lg opacity-80 mb-4" style={{ fontFamily: "var(--font-lato)" }}>
            Chat with Harmony
          </p>
          {showAdmin && (
            <>
              <a
                href="/advisor"
                className="inline-block px-6 py-2 bg-[var(--primary)]/20 border border-[var(--primary)] text-[var(--primary)] rounded-lg font-medium hover:bg-[var(--primary)]/30 transition-all mr-2"
                style={{ fontFamily: "var(--font-lato)" }}
              >
                🔮 Advisor Portal
              </a>
              <a
                href="/chat"
                className="inline-block px-6 py-2 bg-[var(--accent)]/20 border border-[var(--accent)] text-[var(--accent)] rounded-lg font-medium hover:bg-[var(--accent)]/30 transition-all"
                style={{ fontFamily: "var(--font-lato)" }}
              >
                📤 Share Button
              </a>
            </>
          )}
        </div>

        <div className="text-center mb-8">
          <button
            onClick={startIntake}
            className="w-full py-6 bg-[var(--primary)] hover:bg-[var(--primary-glow)] text-white font-bold rounded-2xl transition-all duration-300 animate-pulse-glow flex items-center justify-center gap-3"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            <span className="text-lg">START YOUR READING</span>
            <span className="text-xs font-normal opacity-70" style={{ fontFamily: "var(--font-lato)" }}>
              3 free minutes to start
            </span>
          </button>
        </div>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6">
          <h3 className="font-bold mb-4 text-center" style={{ fontFamily: "var(--font-cinzel)" }}>
            How It Works
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">1</span>
              <div>
                <p className="font-medium">Share what's on your mind</p>
                <p className="text-sm opacity-60">Tell us your question in confidence</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">2</span>
              <div>
                <p className="font-medium">Wait for your turn</p>
                <p className="text-sm opacity-60">Madam Groovy will be with you shortly</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">3</span>
              <div>
                <p className="font-medium">Get your reading</p>
                <p className="text-sm opacity-60">Receive clarity and guidance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
