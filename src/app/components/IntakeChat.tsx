"use client";

import { useState, useEffect, useRef } from "react";
import { fetchAvailability, addToWaitlist, AvailabilityStatus } from "@/lib/availability";

interface IntakeFlow {
  name: string;
  topic: string;
  focus: "person" | "self" | "";
  personName: string;
  personContext: string;
  lifeArea?: string;
  coreIssue?: string;
}

interface IntakeChatProps {
  onComplete?: (flow: IntakeFlow) => void;
  onJoinQueue?: (flow: IntakeFlow, contact: { name: string; phone: string; email?: string }) => void;
  status?: AvailabilityStatus;
}

export default function IntakeChat({ onComplete, onJoinQueue, status: propStatus }: IntakeChatProps) {
  const [step, setStep] = useState<number>(0);
  const [input, setInput] = useState("");
  const [flow, setFlow] = useState<IntakeFlow>({
    name: "",
    topic: "",
    focus: "",
    personName: "",
    personContext: "",
  });
  const [queueContact, setQueueContact] = useState({ name: "", phone: "", email: "" });
  const [status, setStatus] = useState<AvailabilityStatus>(propStatus || "offline");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAvailability().then(setStatus);
    const interval = setInterval(() => fetchAvailability().then(setStatus), 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (inputRef.current && step > 0 && step < 5) {
      inputRef.current.focus();
    }
  }, [step]);

  const handleNext = () => {
    const response = input.trim();
    if (!response && step !== 1) return;

    switch (step) {
      case 1:
        setFlow((prev) => ({ ...prev, name: response }));
        setInput("");
        setStep(2);
        break;
      case 2:
        const lower = response.toLowerCase();
        if (lower.includes("someone") || lower.includes("other") || lower.includes("them") || lower.includes("person")) {
          setFlow((prev) => ({ ...prev, focus: "person" }));
        } else {
          setFlow((prev) => ({ ...prev, focus: "self", topic: "my situation" }));
          setStep(4);
        }
        setInput("");
        if (flow.focus === "person") {
          setStep(3);
        }
        break;
      case 3:
        setFlow((prev) => ({ ...prev, personName: response }));
        setInput("");
        setStep(4);
        break;
      case 4:
        setFlow((prev) => ({ ...prev, personContext: response }));
        setInput("");
        setStep(5);
        break;
    }
  };

  const handleSelectFocus = (choice: "self" | "person") => {
    if (choice === "person") {
      setFlow((prev) => ({ ...prev, focus: "person" }));
      setStep(3);
    } else {
      setFlow((prev) => ({ ...prev, focus: "self", topic: "my situation" }));
      setStep(4);
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

  if (step === 0) {
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

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <p className="text-xl text-white mb-4 text-center">Before we begin your 3 free minutes…</p>
          <p className="text-gray-400 mb-8 text-center">I'll help you get oriented for the reading</p>
          <button
            onClick={() => setStep(1)}
            className="py-3 px-8 bg-[#2f6f4f] hover:bg-[#3d8a5f] text-white rounded-full font-bold"
          >
            Start
          </button>
        </div>
      </main>
    );
  }

  if (step === 5) {
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
              <h1 className="text-3xl text-white mb-2 text-center">You're ready</h1>
              <p className="text-gray-400 mb-8 text-center">Your 3 free minutes are waiting</p>
              <button
                onClick={handleStartSession}
                className="py-4 px-12 bg-[#2f6f4f] hover:bg-[#3d8a5f] text-white rounded-full font-bold text-lg"
              >
                Start your session
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl text-white mb-2 text-center">Harmony is currently away</h1>
              <p className="text-gray-400 mb-8 text-center">We'll notify you when she's available</p>
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

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {step === 1 && (
          <div className="text-center w-full max-w-md">
            <p className="text-xl text-white mb-6">What's your first name?</p>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNext()}
              placeholder="Type your name..."
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#2f6f4f] text-lg"
              autoFocus
            />
            <button
              onClick={handleNext}
              disabled={!input.trim()}
              className="mt-4 w-full py-3 bg-[#2f6f4f] hover:bg-[#3d8a5f] text-white rounded-xl font-bold disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="text-center w-full max-w-md">
            <p className="text-xl text-white mb-6">Is this about you or someone else?</p>
            <button
              onClick={() => handleSelectFocus("self")}
              className="w-full py-4 bg-[#2f6f4f] hover:bg-[#3d8a5f] text-white rounded-xl font-bold mb-3"
            >
              Me
            </button>
            <button
              onClick={() => handleSelectFocus("person")}
              className="w-full py-4 bg-[#1a1a1a] border border-[#333] text-white rounded-xl font-bold"
            >
              Someone else
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center w-full max-w-md">
            <p className="text-xl text-white mb-6">What's their first name?</p>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNext()}
              placeholder="Type their name..."
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#2f6f4f] text-lg"
              autoFocus
            />
            <button
              onClick={handleNext}
              disabled={!input.trim()}
              className="mt-4 w-full py-3 bg-[#2f6f4f] hover:bg-[#3d8a5f] text-white rounded-xl font-bold disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="text-center w-full max-w-md">
            <p className="text-xl text-white mb-4">One small detail helps Harmony connect faster</p>
            <p className="text-gray-400 mb-6">What do they do or something about them?</p>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNext()}
              placeholder="Type something..."
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#2f6f4f] text-lg"
              autoFocus
            />
            <button
              onClick={handleNext}
              disabled={!input.trim()}
              className="mt-4 w-full py-3 bg-[#2f6f4f] hover:bg-[#3d8a5f] text-white rounded-xl font-bold disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
