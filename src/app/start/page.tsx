"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import IntakeChat from "../components/IntakeChat";
import ChatInterface from "../components/ChatInterface";
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

export default function StartPage() {
  const router = useRouter();
  const [status, setStatus] = useState<AvailabilityStatus>("offline");
  const [intakeFlow, setIntakeFlow] = useState<IntakeFlow | null>(null);
  const [inQueue, setInQueue] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAvailability().then(setStatus);
    const interval = setInterval(() => fetchAvailability().then(setStatus), 3000);
    return () => clearInterval(interval);
  }, []);

  const handleIntakeComplete = (flow: IntakeFlow) => {
    setIntakeFlow(flow);
  };

  const handleIntakeQueue = (flow: IntakeFlow) => {
    addToWaitlist({
      name: flow.name,
      email: undefined,
      phone: undefined,
    });
    setIntakeFlow(flow);
    setInQueue(true);
  };

  if (!mounted) {
    return null;
  }

  if (inQueue && intakeFlow) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <span className="text-6xl mb-4 block">⏳</span>
          <h2 className="text-2xl font-bold text-white mb-2">You're on the waitlist</h2>
          <p className="text-gray-400 mb-6">We'll notify you when Harmony is available.</p>
          <div className="bg-[#1a1a1a] rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-500">Your question:</p>
            <p className="text-white">{intakeFlow.topic}</p>
          </div>
          <button
            onClick={() => {
              setInQueue(false);
              setIntakeFlow(null);
            }}
            className="text-[#2f6f4f] text-sm"
          >
            ← Back to start
          </button>
        </div>
      </div>
    );
  }

  if (intakeFlow) {
    return (
      <ChatInterface
        name={intakeFlow.name}
        phone=""
        question={intakeFlow.topic}
        initialMinutes={3}
        intakeFlow={intakeFlow}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <IntakeChat
        onComplete={handleIntakeComplete}
        onJoinQueue={handleIntakeQueue}
        status={status}
      />
    </div>
  );
}
