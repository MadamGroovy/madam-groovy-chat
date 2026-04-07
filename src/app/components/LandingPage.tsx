"use client";

import { useState, useEffect } from "react";
import IntakeChat from "./IntakeChat";
import ChatInterface from "./ChatInterface";
import StatusBanner, { WaitlistForm } from "./StatusBanner";
import { fetchAvailability, AvailabilityStatus } from "@/lib/availability";

interface IntakeFlow {
  name: string;
  topic: string;
  focus: "person" | "self" | "";
  personName: string;
  personContext: string;
  lifeArea: string;
  coreIssue: string;
}

export default function LandingPage() {
  const [showIntake, setShowIntake] = useState(false);
  const [intakeFlow, setIntakeFlow] = useState<IntakeFlow | null>(null);
  const [status, setStatus] = useState<AvailabilityStatus>("offline");

  useEffect(() => {
    fetchAvailability().then(setStatus);
    
    const interval = setInterval(() => {
      fetchAvailability().then(setStatus);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    if (status === "offline") return;
    setShowIntake(true);
  };

  const handleIntakeComplete = (flow: IntakeFlow) => {
    setIntakeFlow(flow);
  };

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

  if (showIntake) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        <IntakeChat onComplete={handleIntakeComplete} />
      </div>
    );
  }

  const isAvailable = status === "available";

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{
        backgroundImage: "url('/uploads/7153decf-IMG-20260331-WA0010.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full flex justify-center pt-6">
        <StatusBanner status={status} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-end pb-32">
        {isAvailable ? (
          <div className="text-center">
            <button
              onClick={handleStart}
              style={{
                display: "inline-block",
                background: "#2f6f4f",
                color: "#ffffff",
                padding: "8px 14px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
                transition: "all 0.2s ease",
                cursor: "pointer",
                border: "none",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.25)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.18)";
              }}
            >
              Ask what's really going on – 3 free minutes
            </button>
            <div style={{ marginTop: "4px", fontSize: "12px", color: "#2f6f4f", opacity: 0.85 }}>
              madamgroovy.com
            </div>
          </div>
        ) : (
          <div className="bg-[#1a1a1a]/90 backdrop-blur-sm border border-[#333] rounded-2xl p-6 max-w-sm w-full mx-4">
            <div className="text-center mb-4">
              <p className="text-white text-lg mb-2">
                {status === "in_session" 
                  ? "Harmony is currently in a session" 
                  : "Harmony is offline"}
              </p>
              <p className="text-gray-400 text-sm">
                {status === "in_session"
                  ? "Please wait or sign up to be notified"
                  : "Sign up to be notified when she goes live"}
              </p>
            </div>
            <WaitlistForm />
          </div>
        )}
      </div>
    </div>
  );
}
