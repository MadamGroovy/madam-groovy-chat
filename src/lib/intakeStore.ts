export interface IntakeData {
  id: string;
  name: string;
  question: string;
  otherPersonName: string;
  otherPersonDetail: string;
  hasOtherPerson: boolean;
  status: "waiting" | "active" | "completed";
  createdAt: number;
  harmonyResponse?: string;
}

export function generateSessionId(): string {
  return "intake_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

export function addIntake(intake: IntakeData): void {
  const stored = localStorage.getItem("madamGroovy_intakes");
  const intakes: IntakeData[] = stored ? JSON.parse(stored) : [];
  intakes.unshift(intake);
  localStorage.setItem("madamGroovy_intakes", JSON.stringify(intakes));
}

export function updateIntake(id: string, updates: Partial<IntakeData>): void {
  const stored = localStorage.getItem("madamGroovy_intakes");
  if (!stored) return;
  const intakes: IntakeData[] = JSON.parse(stored);
  const index = intakes.findIndex((i) => i.id === id);
  if (index !== -1) {
    intakes[index] = { ...intakes[index], ...updates };
    localStorage.setItem("madamGroovy_intakes", JSON.stringify(intakes));
  }
}

export function getIntakes(): IntakeData[] {
  const stored = localStorage.getItem("madamGroovy_intakes");
  return stored ? JSON.parse(stored) : [];
}

export function getWaitingIntakes(): IntakeData[] {
  return getIntakes().filter((i) => i.status === "waiting");
}
