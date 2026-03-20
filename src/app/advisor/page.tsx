"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdvisorLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "harmony123") {
      localStorage.setItem("advisorLoggedIn", "true");
      router.push("/advisor/dashboard");
    } else {
      setError("Invalid password");
    }
  };

  return (
    <main className="relative z-10 min-h-screen flex items-center justify-center p-4">
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
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              placeholder="Enter your password"
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
