"use client";

import { useState, useEffect, useRef } from "react";
import { generateSessionId, addIntake, IntakeData } from "@/lib/intakeStore";
import { fetchAvailability, addToWaitlist, AvailabilityStatus } from "@/lib/availability";

interface Message {
  id: string;
  text: string;
  sender: "ai" | "client";
  timestamp: number;
}

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
  onJoinQueue?: (flow: IntakeFlow) => void;
  status?: AvailabilityStatus;
}

export default function IntakeChat({ onComplete, onJoinQueue, status: propStatus }: IntakeChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<
    | "opening"
    | "name"
    | "topic"
    | "focus"
    | "personName"
    | "personContext"
    | "lifeArea"
    | "coreIssue"
    | "grounding"
    | "ready"
  >("opening");
  const [flow, setFlow] = useState<IntakeFlow>({
    name: "",
    topic: "",
    focus: "",
    personName: "",
    personContext: "",
    lifeArea: "",
    coreIssue: "",
  });
  const [status, setStatus] = useState<AvailabilityStatus>(propStatus || "offline");
  const [showStartButton, setShowStartButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAvailability().then(setStatus);
    const interval = setInterval(() => fetchAvailability().then(setStatus), 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMessages([
      {
        id: "1",
        text: "Hi. You're in the right place. Before you begin your free 3 minutes, I'm going to help you get oriented for the reading.",
        sender: "ai",
        timestamp: Date.now(),
      },
      {
        id: "2",
        text: "What's your first name?",
        sender: "ai",
        timestamp: Date.now() + 100,
      },
    ]);
    setStep("name");
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (showStartButton && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showStartButton]);

  const addMessage = (text: string, sender: "ai" | "client") => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, text, sender, timestamp: Date.now() },
    ]);
  };

  const handleNext = () => {
    if (!input.trim()) return;

    const response = input.trim();
    addMessage(response, "client");
    setInput("");

    switch (step) {
      case "name":
        setFlow((prev) => ({ ...prev, name: response }));
        setStep("topic");
        addMessage("What would you like clarity on today?", "ai");
        break;

      case "topic":
        setFlow((prev) => ({ ...prev, topic: response }));
        setStep("focus");
        addMessage("Is this about a specific person, or more about your own path?", "ai");
        break;

      case "focus":
        const lowerResponse = response.toLowerCase();
        const isPerson =
          lowerResponse.includes("person") ||
          lowerResponse.includes("someone") ||
          lowerResponse.includes("them") ||
          lowerResponse.includes("other") ||
          lowerResponse.includes("partner") ||
          lowerResponse.includes("family") ||
          lowerResponse.includes("mother") ||
          lowerResponse.includes("father") ||
          lowerResponse.includes("mom") ||
          lowerResponse.includes("dad") ||
          lowerResponse.includes("friend") ||
          lowerResponse.includes("ex");
        
        const isSelfTopic =
          lowerResponse.includes("job") ||
          lowerResponse.includes("career") ||
          lowerResponse.includes("work") ||
          lowerResponse.includes("money") ||
          lowerResponse.includes("finances") ||
          lowerResponse.includes("love") ||
          lowerResponse.includes("relationship") ||
          lowerResponse.includes("direction") ||
          lowerResponse.includes("life") ||
          lowerResponse.includes("future") ||
          lowerResponse.includes("decision");
        
        if (isPerson && !isSelfTopic) {
          setFlow((prev) => ({ ...prev, focus: "person" }));
          setStep("personName");
          addMessage("What's their first name?", "ai");
        } else {
          setFlow((prev) => ({ ...prev, focus: "self" }));
          setStep("lifeArea");
          addMessage("What area of your life does this relate to most? (love, work, direction, something else)", "ai");
        }
        break;

      case "personName":
        setFlow((prev) => ({ ...prev, personName: response }));
        setStep("personContext");
        addMessage("Thank you. What do they do for work, or what's something they spend a lot of time doing? It helps Harmony connect more clearly.", "ai");
        break;

      case "personContext":
        setFlow((prev) => ({ ...prev, personContext: response }));
        setStep("grounding");
        addMessage("That helps bring the situation into focus.", "ai");
        setTimeout(() => {
          addMessage("Take a breath and settle in.", "ai");
        }, 1500);
        setTimeout(() => {
          setStep("ready");
          setShowStartButton(true);
          addMessage("When you're ready, your 3 minutes will begin.", "ai");
        }, 3000);
        break;

      case "lifeArea":
        setFlow((prev) => ({ ...prev, lifeArea: response }));
        setStep("coreIssue");
        addMessage("What feels most uncertain or unresolved about it?", "ai");
        break;

      case "coreIssue":
        setFlow((prev) => ({ ...prev, coreIssue: response }));
        setStep("grounding");
        addMessage("Thank you. That gives a clear starting point.", "ai");
        setTimeout(() => {
          addMessage("Take a breath and settle in.", "ai");
        }, 1500);
        setTimeout(() => {
          setStep("ready");
          setShowStartButton(true);
          addMessage("When you're ready, your 3 minutes will begin.", "ai");
        }, 3000);
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  const handleStartSession = () => {
    onComplete?.(flow);
  };

  const handleJoinQueue = () => {
    addToWaitlist({
      name: flow.name,
      email: undefined,
      phone: undefined,
    });
    onJoinQueue?.(flow);
  };

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
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "client" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-4 py-3 ${
                msg.sender === "client"
                  ? "bg-[#f5d78e] text-[#1a1a1a]"
                  : "bg-[#1a1a1a] border border-[#333]"
              } rounded-2xl`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {showStartButton && (
        <div className="bg-[#1a1a1a] border-t border-[#333] p-4 space-y-3">
          {status === "available" ? (
            <>
              <button
                onClick={handleStartSession}
                className="w-full py-4 bg-[#2f6f4f] hover:bg-[#3d8a5f] text-white rounded-xl font-bold text-lg"
              >
                Start Your Session
              </button>
              <p className="text-center text-sm text-gray-400">
                You're going to connect with Harmony now
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-3">
                <p className="text-yellow-400 text-sm">Harmony is currently {status === "in_session" ? "in a session" : "offline"}</p>
              </div>
              <button
                onClick={handleJoinQueue}
                className="w-full py-4 bg-[#2f6f4f] hover:bg-[#3d8a5f] text-white rounded-xl font-bold"
              >
                Join Waitlist
              </button>
              <button
                onClick={handleStartSession}
                className="w-full py-3 border border-[#333] text-gray-300 rounded-xl"
              >
                Try Anyway
              </button>
              <p className="text-center text-xs text-gray-500 mt-2">
                You'll be notified when Harmony goes live
              </p>
            </>
          )}
        </div>
      )}

      {step !== "ready" && step !== "grounding" && (
        <div className="bg-[#1a1a1a] border-t border-[#333] p-4">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response..."
              className="flex-1 px-4 py-3 bg-[#0f0f0f] border border-[#333] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f5d78e] text-white"
            />
            <button
              onClick={handleNext}
              disabled={!input.trim()}
              className="px-6 py-3 bg-[#f5d78e] hover:bg-[#e6b85c] text-[#1a1a1a] rounded-xl font-bold disabled:opacity-50"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
