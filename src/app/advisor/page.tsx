"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchAvailability, setAvailability, AvailabilityStatus } from "@/lib/availability";

export default function AdvisorLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<AvailabilityStatus>("offline");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchAvailability().then(s => {
      setStatus(s);
      setMounted(true);
    });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Harmony 1 2 3" || password === "harmony123") {
      localStorage.setItem("advisorLoggedIn", "true");
      router.push("/advisor/dashboard");
    } else {
      setError("Invalid password");
    }
  };

  const handleStatusChange = async (newStatus: AvailabilityStatus) => {
    await setAvailability(newStatus);
    setStatus(newStatus);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAvailability().then(setStatus);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative z-10 min-h-screen flex items-center justify-center p-4 pb-32">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <span className="text-6xl">🔮</span>
          </div>
          <h1
            className="text-3xl font-bold mb-2 tracking-wide"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            Advisor Portal
          </h1>
          <p className="opacity-70">Sign in to manage your sessions</p>
        </div>

        {!mounted ? null : (
        <div className="mb-6">
          <p className="text-sm font-medium mb-3 opacity-80 text-center">Quick Status Toggle</p>
          <div className="flex gap-2 bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-1">
            <button
              onClick={() => handleStatusChange("available")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                status === "available"
                  ? "bg-green-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Available
            </button>
            <button
              onClick={() => handleStatusChange("in_session")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                status === "in_session"
                  ? "bg-yellow-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              In Session
            </button>
            <button
              onClick={() => handleStatusChange("offline")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                status === "offline"
                  ? "bg-gray-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Offline
            </button>
          </div>
          {status === "available" && (
            <p className="text-center text-xs text-green-400 mt-2">Clients can start readings now</p>
          )}
          {status === "in_session" && (
            <p className="text-center text-xs text-yellow-400 mt-2">Clients see "In Session"</p>
          )}
          {status === "offline" && (
            <p className="text-center text-xs text-gray-400 mt-2">Clients see "Offline" and can join waitlist</p>
          )}
        </div>
        )}

        <form
          onSubmit={handleLogin}
          className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 space-y-5 shadow-2xl"
        >
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 opacity-80">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="w-full px-4 py-4 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all text-lg"
              placeholder="Enter your password"
              style={{ fontSize: "18px", minHeight: "60px" }}
              required
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary-glow)] text-white font-bold rounded-xl transition-all"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            Sign In
          </button>
        </form>

        <p className="text-center mt-4 text-xs opacity-50">
          <a href="/" className="hover:underline">← Back to Chat</a>
        </p>
      </div>
    </main>
  );
}
