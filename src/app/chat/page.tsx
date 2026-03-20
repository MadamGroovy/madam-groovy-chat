"use client";

export default function ChatPage() {
  const chatUrl = "https://madam-groovy-chat.vercel.app";

  return (
    <main className="relative z-10 min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#0f0a1a] via-[#1a0a2e] to-[#0f0a1a]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md w-full text-center">
        <div className="mb-8 animate-float">
          <div className="relative inline-block">
            <span className="text-9xl filter drop-shadow-lg">🌙</span>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0.5s" }}>
              <span className="absolute inset-0 flex items-center justify-center text-lg">✨</span>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h1 
            className="text-5xl font-bold mb-3 text-white tracking-wider"
            style={{ fontFamily: "var(--font-cinzel)", textShadow: "0 0 30px rgba(124, 58, 237, 0.5)" }}
          >
            MADAM GROOVY
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-purple-500" />
            <p className="text-xl text-purple-300" style={{ fontFamily: "var(--font-lato)" }}>
              GPS for the Soul
            </p>
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-purple-500" />
          </div>
        </div>

        <p className="text-lg mb-10 text-gray-300 max-w-sm mx-auto" style={{ fontFamily: "var(--font-lato)" }}>
          Get clarity. Find your path. 3 free minutes to start.
        </p>

        <a
          href={chatUrl}
          className="group relative inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-xl font-bold rounded-full transition-all duration-500 shadow-2xl hover:shadow-purple-500/25"
          style={{ 
            fontFamily: "var(--font-cinzel)",
            boxShadow: "0 0 40px rgba(124, 58, 237, 0.4), inset 0 0 20px rgba(255,255,255,0.1)"
          }}
        >
          <span className="text-3xl group-hover:animate-bounce">🔮</span>
          <span>START YOUR FREE READING</span>
          <span className="absolute -top-3 -right-3 bg-emerald-400 text-black text-xs px-2 py-1 rounded-full font-bold">
            3 MIN FREE
          </span>
        </a>

        <div className="mt-16 space-y-4">
          <p className="text-sm text-gray-500" style={{ fontFamily: "var(--font-lato)" }}>
            Share anywhere
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href={`https://wa.me/?text=${encodeURIComponent("🔮 Get a psychic reading with Madam Groovy! 3 free minutes: " + chatUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-green-500/20 hover:bg-green-500/40 rounded-full flex items-center justify-center text-2xl transition-all"
            >
              📱
            </a>
            <a 
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("🔮 Get clarity with Madam Groovy! 3 free minutes: " + chatUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-blue-500/20 hover:bg-blue-500/40 rounded-full flex items-center justify-center text-2xl transition-all"
            >
              𝕏
            </a>
            <a 
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(chatUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-blue-600/20 hover:bg-blue-600/40 rounded-full flex items-center justify-center text-2xl transition-all"
            >
              f
            </a>
          </div>
        </div>

        <div className="mt-12 p-4 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-xs text-gray-400" style={{ fontFamily: "var(--font-lato)" }}>
            Copy link:
          </p>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={chatUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-gray-300"
            />
            <button
              onClick={() => navigator.clipboard.writeText(chatUrl)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
