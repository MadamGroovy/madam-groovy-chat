"use client";

export default function ChatPage() {
  const chatUrl = "https://madam-groovy-chat.vercel.app";
  const embedCode = `<a href="${chatUrl}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:white;border-radius:50px;text-decoration:none;font-family:system-ui;font-weight:bold;">🔮 Chat with Madam Groovy - 3 Free Minutes</a>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  return (
    <main className="relative z-10 min-h-screen flex items-center justify-center p-4 bg-[#0f0a1a]">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8 animate-float">
          <span className="text-8xl">🌙</span>
        </div>
        
        <h1 
          className="text-4xl font-bold mb-4 text-white"
          style={{ fontFamily: "var(--font-cinzel)" }}
        >
          Madam Groovy
        </h1>
        
        <p className="text-xl mb-8 text-gray-300" style={{ fontFamily: "var(--font-lato)" }}>
          Get clarity now. 3 free minutes.
        </p>

        <a
          href={chatUrl}
          className="inline-block px-8 py-4 bg-[#7c3aed] hover:bg-[#a78bfa] text-white text-xl font-bold rounded-full transition-all duration-300 animate-pulse-glow shadow-lg"
          style={{ fontFamily: "var(--font-cinzel)" }}
        >
          🔮 Start Your Free Reading
        </a>

        <div className="mt-16 p-6 bg-[#1a1225] rounded-2xl border border-[#2d1f3d]">
          <h2 
            className="text-lg font-bold mb-4 text-white"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            Share This Button
          </h2>
          
          <p className="text-sm text-gray-400 mb-4" style={{ fontFamily: "var(--font-lato)" }}>
            Copy the link or embed code to put on YouTube, Facebook, Twitter, or anywhere:
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-2 text-left">LINK:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-[#0f0a1a] border border-[#2d1f3d] rounded-lg text-sm text-gray-300"
                />
                <button
                  onClick={() => copyToClipboard(chatUrl)}
                  className="px-4 py-2 bg-[#7c3aed] text-white rounded-lg text-sm hover:bg-[#a78bfa]"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2 text-left">BUTTON CODE (for websites):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={embedCode}
                  readOnly
                  className="flex-1 px-3 py-2 bg-[#0f0a1a] border border-[#2d1f3d] rounded-lg text-xs text-gray-300"
                />
                <button
                  onClick={() => copyToClipboard(embedCode)}
                  className="px-4 py-2 bg-[#7c3aed] text-white rounded-lg text-sm hover:bg-[#a78bfa]"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-[#0f0a1a] rounded-xl">
            <p className="text-xs text-gray-500 mb-2">Preview:</p>
            <a
              href={chatUrl}
              style={{
                display: "inline-block",
                padding: "12px 24px",
                background: "#7c3aed",
                color: "white",
                borderRadius: "50px",
                textDecoration: "none",
                fontFamily: "system-ui",
                fontWeight: "bold",
              }}
            >
              🔮 Chat with Madam Groovy - 3 Free Minutes
            </a>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <a href="/" className="hover:text-white">← Back to Chat</a>
        </div>
      </div>
    </main>
  );
}
