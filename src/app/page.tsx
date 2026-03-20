"use client";

import { useState } from "react";
import ChatInterface from "./components/ChatInterface";

export default function Home() {
  const [chatStarted, setChatStarted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    question: "",
  });
  const [freeMinutes] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.question) {
      setChatStarted(true);
    }
  };

  if (chatStarted) {
    return <ChatInterface {...formData} initialMinutes={freeMinutes} />;
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
          <p className="text-lg opacity-80" style={{ fontFamily: "var(--font-lato)" }}>
            Chat with Harmony
          </p>
          <a
            href="/advisor"
            className="text-sm opacity-50 hover:opacity-100 transition-opacity"
            style={{ fontFamily: "var(--font-lato)" }}
          >
            🔮 Advisor Login
          </a>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 space-y-5 shadow-2xl"
          style={{ fontFamily: "var(--font-lato)" }}
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2 opacity-80">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2 opacity-80">
              Phone Number <span className="text-xs opacity-50">(optional)</span>
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              placeholder="For follow-up contact"
            />
          </div>

          <div>
            <label htmlFor="question" className="block text-sm font-medium mb-2 opacity-80">
              What&apos;s on your mind?
            </label>
            <textarea
              id="question"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all resize-none"
              rows={3}
              placeholder="Ask your question..."
              required
            />
          </div>

          <div className="bg-[var(--background)] rounded-xl p-4 text-center">
            <span className="text-sm opacity-70">Your reading includes</span>
            <div className="mt-2">
              <span 
                className="text-3xl font-bold text-[var(--accent)]"
                style={{ fontFamily: "var(--font-cinzel)" }}
              >
                {freeMinutes}
              </span>
              <span className="text-lg ml-2 opacity-80">free minutes</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary-glow)] text-white font-bold rounded-xl transition-all duration-300 animate-pulse-glow flex items-center justify-center gap-3"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            <span className="text-2xl">🔮</span>
            <span className="text-lg">START {freeMinutes} FREE MINUTES</span>
          </button>

          <p className="text-center text-xs opacity-50">
            Secure payment via Stripe • Your info stays private
          </p>
        </form>
      </div>
    </main>
  );
}
