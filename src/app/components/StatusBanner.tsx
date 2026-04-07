"use client";

import { useState, useEffect } from "react";
import { AvailabilityStatus } from "@/lib/availability";
import { addToWaitlist } from "@/lib/availability";

interface StatusBannerProps {
  status: AvailabilityStatus;
}

export default function StatusBanner({ status }: StatusBannerProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "available":
        return {
          text: "Live Now",
          color: "bg-green-500",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/30",
        };
      case "in_session":
        return {
          text: "In Session",
          color: "bg-yellow-500",
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/30",
        };
      case "offline":
      default:
        return {
          text: "Offline",
          color: "bg-gray-500",
          bgColor: "bg-gray-500/10",
          borderColor: "border-gray-500/30",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border px-3 py-1.5 rounded-full text-sm flex items-center gap-2`}
    >
      <span className={`w-2 h-2 rounded-full ${config.color} animate-pulse`} />
      <span className={config.color}>{config.text}</span>
    </div>
  );
}

export function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!email.trim() && !phone.trim()) return;

    addToWaitlist({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center p-4">
        <p className="text-green-400">You&apos;ll be notified when Harmony goes live!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="w-full px-4 py-2 bg-[#0f0f0f] border border-[#333] rounded-lg text-white text-sm"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (optional)"
        className="w-full px-4 py-2 bg-[#0f0f0f] border border-[#333] rounded-lg text-white text-sm"
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone (optional)"
        className="w-full px-4 py-2 bg-[#0f0f0f] border border-[#333] rounded-lg text-white text-sm"
      />
      <button
        type="submit"
        disabled={!name.trim() || (!email.trim() && !phone.trim())}
        className="w-full py-2 bg-[#f5d78e] hover:bg-[#e6b85c] text-[#1a1a1a] rounded-lg font-medium text-sm disabled:opacity-50"
      >
        Notify Me When Live
      </button>
    </form>
  );
}
