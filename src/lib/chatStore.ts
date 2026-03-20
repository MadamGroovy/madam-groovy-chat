export interface ChatMessage {
  id: string;
  text: string;
  sender: "client" | "harmony";
  timestamp: number;
}

export interface ChatSession {
  id: string;
  clientName: string;
  clientPhone: string;
  question: string;
  minutesRemaining: number;
  messages: ChatMessage[];
  status: "waiting" | "active" | "ended";
  createdAt: number;
  earnings: number;
}

export interface ClientNote {
  clientName: string;
  notes: string;
  lastUpdated: number;
}

const STORAGE_KEYS = {
  CHAT_REQUESTS: "madamGroovy_chatRequests",
  ACTIVE_SESSIONS: "madamGroovy_activeSessions",
  CLIENT_NOTES: "madamGroovy_clientNotes",
  EARNINGS: "madamGroovy_earnings",
};

export function addChatRequest(session: ChatSession) {
  const requests = getChatRequests();
  requests.push(session);
  localStorage.setItem(STORAGE_KEYS.CHAT_REQUESTS, JSON.stringify(requests));
  localStorage.setItem("madamGroovy_newRequest", Date.now().toString());
}

export function getChatRequests(): ChatSession[] {
  const data = localStorage.getItem(STORAGE_KEYS.CHAT_REQUESTS);
  return data ? JSON.parse(data) : [];
}

export function clearChatRequests() {
  localStorage.setItem(STORAGE_KEYS.CHAT_REQUESTS, JSON.stringify([]));
}

export function updateSession(session: ChatSession) {
  const sessions = getActiveSessions();
  const index = sessions.findIndex((s) => s.id === session.id);
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.push({ ...session, status: "active" });
  }
  localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSIONS, JSON.stringify(sessions));
  localStorage.setItem("madamGroovy_sessionUpdate", Date.now().toString());
}

export function getActiveSessions(): ChatSession[] {
  const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSIONS);
  return data ? JSON.parse(data) : [];
}

export function endSession(sessionId: string) {
  const sessions = getActiveSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (session) {
    const minutesUsed = 3 + Math.floor((Date.now() - session.createdAt) / 60000);
    const earnings = minutesUsed * 1;
    addEarnings(earnings);
    saveClientNote(session.clientName, `Ended session. ${minutesUsed} minutes.`);
  }
  const filtered = sessions.filter((s) => s.id !== sessionId);
  localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSIONS, JSON.stringify(filtered));
  localStorage.setItem("madamGroovy_sessionUpdate", Date.now().toString());
}

export function addEarnings(amount: number) {
  const current = getEarnings();
  const updated = current + amount;
  localStorage.setItem(STORAGE_KEYS.EARNINGS, JSON.stringify(updated));
}

export function getEarnings(): number {
  const data = localStorage.getItem(STORAGE_KEYS.EARNINGS);
  return data ? parseFloat(data) : 0;
}

export function saveClientNote(clientName: string, note: string) {
  const notes = getClientNotes();
  const existing = notes.find((n) => n.clientName === clientName);
  if (existing) {
    existing.notes = note;
    existing.lastUpdated = Date.now();
  } else {
    notes.push({ clientName, notes: note, lastUpdated: Date.now() });
  }
  localStorage.setItem(STORAGE_KEYS.CLIENT_NOTES, JSON.stringify(notes));
}

export function getClientNotes(): ClientNote[] {
  const data = localStorage.getItem(STORAGE_KEYS.CLIENT_NOTES);
  return data ? JSON.parse(data) : [];
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
