export type AvailabilityStatus = "available" | "in_session" | "offline";

export interface WaitlistEntry {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: number;
  notified: boolean;
}

const STORAGE_KEYS = {
  AVAILABILITY: "madamGroovy_availability",
  WAITLIST: "madamGroovy_waitlist",
};

let cachedStatus: AvailabilityStatus = "offline";
let lastFetch = 0;

export async function fetchAvailability(): Promise<AvailabilityStatus> {
  try {
    const res = await fetch("/api/status", { cache: "no-store" });
    const data = await res.json();
    cachedStatus = data.status;
    lastFetch = Date.now();
    return cachedStatus;
  } catch {
    return cachedStatus;
  }
}

export function getAvailability(): AvailabilityStatus {
  return cachedStatus;
}

export async function setAvailability(status: AvailabilityStatus): Promise<void> {
  cachedStatus = status;
  localStorage.setItem(STORAGE_KEYS.AVAILABILITY, status);
  localStorage.setItem("madamGroovy_availabilityChange", Date.now().toString());
  try {
    await fetch("/api/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  } catch (e) {
    console.error("Failed to sync availability:", e);
  }
}

export function getWaitlist(): WaitlistEntry[] {
  const data = localStorage.getItem(STORAGE_KEYS.WAITLIST);
  return data ? JSON.parse(data) : [];
}

export function addToWaitlist(entry: Omit<WaitlistEntry, "id" | "createdAt" | "notified">): WaitlistEntry {
  const waitlist = getWaitlist();
  const newEntry: WaitlistEntry = {
    ...entry,
    id: `wait_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    notified: false,
  };
  waitlist.push(newEntry);
  localStorage.setItem(STORAGE_KEYS.WAITLIST, JSON.stringify(waitlist));
  return newEntry;
}

export function markNotified(emailOrPhone: string): void {
  const waitlist = getWaitlist();
  const updated = waitlist.map((entry) => {
    if (entry.email === emailOrPhone || entry.phone === emailOrPhone) {
      return { ...entry, notified: true };
    }
    return entry;
  });
  localStorage.setItem(STORAGE_KEYS.WAITLIST, JSON.stringify(updated));
}

export function removeFromWaitlist(id: string): void {
  const waitlist = getWaitlist();
  const filtered = waitlist.filter((entry) => entry.id !== id);
  localStorage.setItem(STORAGE_KEYS.WAITLIST, JSON.stringify(filtered));
}

export function getUnnotifiedWaitlist(): WaitlistEntry[] {
  return getWaitlist().filter((entry) => !entry.notified);
}
