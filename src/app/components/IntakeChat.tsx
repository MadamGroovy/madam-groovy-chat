"use client";

import { useState, useEffect, useRef } from "react";
import { fetchAvailability, addToWaitlist, AvailabilityStatus } from "@/lib/availability";

interface IntakeFlow {
  name: string;
  topic: string;
  focus: "person" | "self" | "";
  personName: string;
  personContext: string;
  lifeArea: string;
  coreIssue: string;
}

interface IntakeChatProps {
  onComplete?: (flow: IntakeFlow) => void;
  onJoinQueue?: (flow: IntakeFlow, contact: { name: string; phone: string; email?: string }) => void;
  status?: AvailabilityStatus;
}

type Step = 
  | "intro"
  | "name"
  | "focus"
  | "personName"
  | "personContext"
  | "ready"
  | "transition"
  | "queue_form"
  | "queue_confirm";

type StepWithInput = "intro" | "name" | "personName" | "personContext";

export default function IntakeChat({ onComplete, onJoinQueue, status: propStatus }: IntakeChatProps) {
  const [step, setStep] = useState<Step>("intro");
  const [input, setInput] = useState("");
  const [flow, setFlow] = useState<IntakeFlow>({
    name: "",
    topic: "",
    focus: "",
    personName: "",
    personContext: "",
    lifeArea: "",
    coreIssue: "",
  });
  const [queueContact, setQueueContact] = useState({ name: "", phone: "", email: "" });
  const [status, setStatus] = useState<AvailabilityStatus>(propStatus || "offline");
  const [messages, setMessages] = useState<{ id: string; text: string; sender: "ai" | "client" }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAvailability().then(setStatus);
    const interval = setInterval(() => fetchAvailability().then(setStatus), 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  const addMessage = (text: string, sender: "ai" | "client" = "ai") => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, text, sender },
    ]);
  };

  const goToName = () => {
    setStep("name");
    addMessage("What's your first name?");
  };

  const handleNext = () => {
    const response = input.trim();
    if (!response && step !== "intro" && step !== "ready" && step !== "transition") return;

    if (step === "intro") {
      goToName();
      return;
    }

    if (step === "name") {
      setFlow((prev) => ({ ...prev, name: response }));
      setStep("focus");
      addMessage("Is this about you or someone else?");
      setInput("");
      return;
    }

    if (step === "focus") {
      const lower = response.toLowerCase();
      if (lower.includes("someone") || lower.includes("other") || lower.includes("them") || lower.includes("person")) {
        setFlow((prev) => ({ ...prev, focus: "person" }));
        setStep("personName");
        addMessage("What's their first name?");
      } else {
        setFlow((prev) => ({ ...prev, focus: "self", topic: "my situation" }));
        setStep("ready");
      }
      setInput("");
      return;
    }

    if (step === "personName") {
      setFlow((prev) => ({ ...prev, personName: response }));
      setStep("personContext");
      addMessage("One small detail helps Harmony connect faster. What do they do or something about them?");
      setInput("");
      return;
    }

    if (step === "personContext") {
      setFlow((prev) => ({ ...prev, personContext: response }));
      setStep("ready");
      setInput("");
      return;
    }
  };

  const handleStartSession = () => {
    onComplete?.(flow);
  };

  const handleJoinQueue = () => {
    if (!queueContact.name || !queueContact.phone) return;
    onJoinQueue?.(flow, queueContact);
  };

  const isOnline = status === "available";

  if (step === "queue_form") {
    return (
      <main className="relative z-10 min-h-screen flex flex-col bg-[#0f0f0f]">
        <header className="bg-[#1a1a1a] border-b border-[#333] px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔮</span>
            <div>
              <h2 className="font-bold" style={{ fontFamily: "var(--font-cinzel)" }}>
                Madam Groovy
              </h2>
              <p className="text-xs opacity-60">Get Notified</p>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full text-center mb-8">
            <h1 className="text-2xl text-white mb-2">Harmony is currently away</h1>
            <p className="text-gray-400">Be first to know when Harmony is available</p>
          </div>

          <div className="w-full max-w-md space-y-4">
            <div>
              <input
                type="text"
                value={queueContact.name}
                onChange={(e) => setQueueContact((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your first name"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#2f6f4f]"
              />
            </div>
            <div>
              <input
                type="tel"
                value={queueContact.phone}
                onChange={(e) => setQueueContact((p) => ({ ...p, phone: e.target.value }))}
                placeholder="Best way to reach you (phone or WhatsApp)"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#2f6f4f]"
              />
            </div>
            <div>
              <input
                type="email"
                value={queueContact.email}
                onChange={(e) => setQueueContact((p) => ({ ...p, email: e.target.value }))}
                placeholder="Email (optional)"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#2f6f4f]"
              />
            </div>
            <button
              onClick={handleJoinQueue}
              disabled={!queueContact.name || !queueContact.phone}
              className="w-full py-4 bg-[#2f6f4f] hover:bg-[#3d8a5f] text-white rounded-xl font-bold disabled:opacity-50"
            >
              Notify me when she's available
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">You'll be contacted within the next 24 hours</p>
          </div>
        </div>
      </main>
    );
  }

  if (step === "ready" || step === "transition") {
    const isReady = step === "ready";
    return (
      <main className="relative z-10 min-h-screen flex flex-col bg-[#0f0f0f]">
        <header className="bg-[#1a1a1a] border-b border-[#333] px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔮</span>
            <div>
              <h2 className="font-bold" style={{ fontFamily: "var(--font-cinzel)" }}>
                Madam Groovy
              </h2>
              <p className="text-xs opacity-60">Ready</p>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {isOnline ? (
            <>
              <h1 className="text-3xl text-white mb-2 text-center">
                {isReady ? "You're ready" : "Harmony is available now"}
              </h1>
              <p className="text-gray-400 mb-8 text-center">
                {isReady ? "Your 3 free minutes are waiting" : "You're about to begin your 3 free minutes"}
              </p>
              <button
                onClick={isReady ? () => setStep("transition") : handleStartSession}
                className="py-4 px-12 bg-[#2f6f4f] hover:bg-[#3d8a5f] text-white rounded-full font-bold text-lg"
              >
                {isReady ? "Start your session" : "Begin reading"}
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl text-white mb-2 text-center">Harmony is currently away</h1>
              <p className="text-gray-400 mb-8 text-center">We'll notify you when she's available</p>
              <button
                onClick={() => setStep("queue_form")}
                className="py-4 px-12 bg-[#2f6f4f] hover:bg-[#3d8a5f] text-white rounded-full font-bold"
              >
                Join waitlist
              </button>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="relative z-10 min-h-screen flex flex-col bg-[#0f0f0f]">
      <header className="bg-[#1a1a1a] border-b border-[#333] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔮</span>
          <div>
            <h2 className="font-bold" style={{ fontFamily: "var(--font-cinzel)" }}>
              Madam Groovy
            </h2>
            <p className="text-xs opacity-60">Get Oriented</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {step === "intro" ? (
          <div className="text-center py-8">
            <p className="text-xl text-white mb-4">Before we begin your 3 free minutes…</p>
            <p className="text-gray-400 mb-8">I'll help you get oriented for the reading</p>
            <button
              onClick={handleNext}
              className="py-3 px-8 bg-[#2f6f4f] hover:bg-[#3d8a5f] text-white rounded-full font-bold"
            >
              Start
            </button>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "client" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 ${
                    msg.sender === "client"
                      ? "bg-[#2f6f4f] text-white"
                      : "bg-[#1a1a1a] border border-[#333] text-white"
                  } rounded-2xl`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {["name", "personName", "personContext"].includes(step) && (
        <div className="bg-[#1a1a1a] border-t border-[#333] p-4">
          {step === "focus" ? (
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => { setInput("Me"); handleNext(); }}
                className="flex-1 py-3 bg-[#2f6f4f] text-white rounded-xl font-bold"
              >
                Me
              </button>
              <button
                onClick={() => { setInput("Someone else"); handleNext(); }}
                className="flex-1 py-3 bg-[#1a1a1a] border border-[#333] text-white rounded-xl font-bold"
              >
                Someone else
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
                placeholder="Type your response..."
                className="flex-1 px-4 py-3 bg-[#0f0f0f] border border-[#333] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2f6f4f] text-white"
              />
              <button
                onClick={handleNext}
                disabled={!input.trim()}
                className="px-6 py-3 bg-[#2f6f4f] hover:bg-[#3d8a5f] text-white rounded-xl font-bold disabled:opacity-50"
              >
                →
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
