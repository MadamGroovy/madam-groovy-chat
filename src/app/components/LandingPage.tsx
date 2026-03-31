"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import IntakeChat from "./IntakeChat";

export default function LandingPage() {
  const [showChat, setShowChat] = useState(false);
  const router = useRouter();

  const handleStart = () => {
    setShowChat(true);
  };

  if (showChat) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] transition-opacity duration-500 opacity-0 animate-fadeIn">
        <IntakeChat />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <button
        onClick={handleStart}
        style={{
          padding: "18px 36px",
          fontSize: "18px",
          borderRadius: "999px",
          background: "linear-gradient(135deg, #f5d78e, #e6b85c)",
          color: "#1a1a1a",
          fontWeight: 500,
          boxShadow: "0 0 20px rgba(245, 215, 142, 0.4)",
          transition: "all 0.2s ease",
          cursor: "pointer",
          border: "none",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 0 30px rgba(245, 215, 142, 0.7)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 0 20px rgba(245, 215, 142, 0.4)";
        }}
      >
        Start Your Reading
      </button>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
        }
      `}</style>
    </div>
  );
}
