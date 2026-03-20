"use client";

export default function ChatPage() {
  const chatUrl = "https://madam-groovy-chat.vercel.app";

  return (
    <main className="relative z-10 min-h-screen flex items-center justify-center p-4 bg-[#0f0a1a]">
      <div className="relative z-10 max-w-md w-full text-center">
        
        <div className="mb-6">
          <span className="text-5xl">🌙</span>
        </div>
        
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold mb-2 text-white tracking-wide"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            Madam Groovy
          </h1>
          <p className="text-sm text-gray-400" style={{ fontFamily: "var(--font-lato)" }}>
            GPS for the Soul
          </p>
        </div>

        <p className="text-base mb-10 text-gray-300 max-w-xs mx-auto" style={{ fontFamily: "var(--font-lato)" }}>
          Get clarity. Find your path.
        </p>

        <a
          href={chatUrl}
          className="inline-flex items-center gap-3 px-8 py-4 bg-[#7c3aed] hover:bg-[#a78bfa] text-white text-base font-semibold rounded-full transition-all duration-300"
          style={{ fontFamily: "var(--font-cinzel)" }}
        >
          <span>🔮</span>
          <span>START YOUR FREE READING</span>
        </a>

        <p className="mt-4 text-xs text-gray-500" style={{ fontFamily: "var(--font-lato)" }}>
          3 free minutes to start
        </p>

        <div className="mt-16 space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider" style={{ fontFamily: "var(--font-lato)" }}>
            Share
          </p>
          <div className="flex justify-center gap-3">
            <a 
              href={`https://wa.me/?text=${encodeURIComponent("🔮 Get a psychic reading with Madam Groovy! 3 free minutes: " + chatUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white text-sm rounded-full transition-all"
              style={{ fontFamily: "var(--font-lato)" }}
            >
              WhatsApp
            </a>
            <a 
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("🔮 Get clarity with Madam Groovy! 3 free minutes: " + chatUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm rounded-full border border-gray-700 transition-all"
              style={{ fontFamily: "var(--font-lato)" }}
            >
              𝕏 Twitter
            </a>
          </div>
        </div>

        <div className="mt-12 p-4 bg-[#1a1225] rounded-xl border border-[#2d1f3d]">
          <p className="text-xs text-gray-400 mb-2" style={{ fontFamily: "var(--font-lato)" }}>
            Copy link:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={chatUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-[#0f0a1a] border border-[#2d1f3d] rounded-lg text-sm text-gray-400"
            />
            <button
              onClick={() => navigator.clipboard.writeText(chatUrl)}
              className="px-4 py-2 bg-[#7c3aed] hover:bg-[#a78bfa] text-white text-sm rounded-lg transition-all"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
