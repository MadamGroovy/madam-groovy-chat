"use client";

import { useState, useEffect, useRef } from "react";
import { generateSessionId, addIntake, IntakeData } from "@/lib/intakeStore";

interface Message {
  id: string;
  text: string;
  sender: "ai" | "client";
  timestamp: number;
}

const aiGreetings = [
  "Hello! You've taken the first step.",
  "Welcome. You've taken the first step.",
  "Hello, beautiful soul. You've taken the first step.",
];

const aiNameAsks = [
  "Before we begin, what shall I call you?",
  "What name resonates with you?",
  "By what name shall I know you?",
];

const aiQuestionAsks = [
  "Now... what's stirring in your heart or mind?",
  "What would you like guidance on?",
  "What brings you here today?",
];

const aiOtherPersonAsks = [
  "Would you like me to look into someone else's energy? A partner, friend, or family member?",
  "Is there someone else's path you'd like me to glimpse?",
  "Would you like clarity on someone else's situation?",
];

export default function IntakeChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<"greeting" | "name" | "question" | "otherPerson" | "otherName" | "otherDetail" | "complete">("greeting");
  const [intakeData, setIntakeData] = useState({
    name: "",
    question: "",
    otherPersonName: "",
    otherPersonDetail: "",
    hasOtherPerson: false,
  });
  const [waitingPosition, setWaitingPosition] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const randomGreeting = aiGreetings[Math.floor(Math.random() * aiGreetings.length)];
    const randomNameAsk = aiNameAsks[Math.floor(Math.random() * aiNameAsks.length)];
    
    setMessages([
      {
        id: "1",
        text: randomGreeting,
        sender: "ai",
        timestamp: Date.now(),
      },
      {
        id: "2",
        text: randomNameAsk,
        sender: "ai",
        timestamp: Date.now() + 100,
      },
    ]);
    setStep("name");
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getWaitingPosition = (): number => {
    const stored = localStorage.getItem("madamGroovy_intakes");
    if (!stored) return 1;
    const intakes = JSON.parse(stored);
    return intakes.filter((i: IntakeData) => i.status === "waiting").length + 1;
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "client",
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      processResponse(input);
    }, 500);
    
    setInput("");
  };

  const addAIResponse = (text: string) => {
    const aiMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "ai",
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, aiMessage]);
  };

  const processResponse = (response: string) => {
    switch (step) {
      case "name":
        setIntakeData((prev) => ({ ...prev, name: response }));
        setStep("question");
        addAIResponse(aiQuestionAsks[Math.floor(Math.random() * aiQuestionAsks.length)]);
        break;

      case "question":
        setIntakeData((prev) => ({ ...prev, question: response }));
        setStep("otherPerson");
        addAIResponse(aiOtherPersonAsks[Math.floor(Math.random() * aiOtherPersonAsks.length)]);
        break;

      case "otherPerson":
        const isYes = response.toLowerCase().includes("yes") || response.toLowerCase().includes("yeah") || response.toLowerCase().includes("sure") || response.toLowerCase().includes("ok") || response.toLowerCase().includes("okay");
        
        if (isYes) {
          setIntakeData((prev) => ({ ...prev, hasOtherPerson: true }));
          setStep("otherName");
          addAIResponse("What is their name? Just their first name is fine.");
        } else {
          completeIntake();
        }
        break;

      case "otherName":
        setIntakeData((prev) => ({ ...prev, otherPersonName: response }));
        setStep("otherDetail");
        addAIResponse("What do they do? Their job, hobby, or what stands out about them?");
        break;

      case "otherDetail":
        setIntakeData((prev) => ({ ...prev, otherPersonDetail: response }));
        completeIntake();
        break;
    }
  };

  const completeIntake = () => {
    const position = getWaitingPosition();
    setWaitingPosition(position);
    setStep("complete");

    const sessionId = generateSessionId();
    const intake: IntakeData = {
      id: sessionId,
      name: intakeData.name,
      question: intakeData.question,
      otherPersonName: intakeData.otherPersonName,
      otherPersonDetail: intakeData.otherPersonDetail,
      hasOtherPerson: intakeData.hasOtherPerson,
      status: "waiting",
      createdAt: Date.now(),
    };

    addIntake(intake);
    localStorage.setItem("madamGroovy_currentIntake", JSON.stringify(intake));

    let completeMsg = `Thank you, ${intakeData.name}. Your energy is received. `;
    
    if (position === 1) {
      completeMsg += "You are next in line. Madam Groovy will be with you shortly.";
    } else {
      completeMsg += `You are number ${position} in line. Please wait for your turn.`;
    }

    if (intakeData.hasOtherPerson) {
      completeMsg += `\n\nI've noted your interest in ${intakeData.otherPersonName}.`;
    }

    addAIResponse(completeMsg);

    window.dispatchEvent(new CustomEvent("newIntake", { detail: intake }));
  };

  return (
    <main className="relative z-10 min-h-screen flex flex-col">
      <header className="bg-[var(--card)] border-b border-[var(--card-border)] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔮</span>
          <div>
            <h2 className="font-bold" style={{ fontFamily: "var(--font-cinzel)" }}>
              Intakes
            </h2>
            <p className="text-xs opacity-60">Chat with Harmony</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "client" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 ${
                msg.sender === "client"
                  ? "bg-[var(--primary)] text-white rounded-2xl rounded-br-md"
                  : "bg-[var(--card)] border border-[var(--card-border)] rounded-2xl rounded-bl-md"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {step !== "complete" && (
        <form
          onSubmit={handleSend}
          className="bg-[var(--card)] border-t border-[var(--card-border)] p-4"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your response..."
              className="flex-1 px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-glow)] text-white rounded-xl font-bold"
            >
              ➤
            </button>
          </div>
        </form>
      )}

      {step === "complete" && (
        <div className="bg-[var(--card)] border-t border-[var(--card-border)] p-4 text-center">
          <p className="text-sm opacity-60">
            Waiting for Madam Groovy... (Position #{waitingPosition})
          </p>
          <p className="text-xs opacity-40 mt-1">
            You can close this and return, or stay here.
          </p>
        </div>
      )}
    </main>
  );
}
