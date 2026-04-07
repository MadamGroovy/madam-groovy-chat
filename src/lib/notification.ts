export interface NotificationPayload {
  clientName: string;
  firstMessage: string;
  sessionLink: string;
  topic?: string;
  focus?: "person" | "self";
  personName?: string;
  personContext?: string;
  lifeArea?: string;
  coreIssue?: string;
}

export type NotificationChannel = "whatsapp" | "email" | "sms";

export async function sendNotification(payload: NotificationPayload): Promise<{ success: boolean; channel: NotificationChannel; error?: string }> {
  const message = formatNotificationMessage(payload);
  
  const channels: NotificationChannel[] = ["whatsapp", "email", "sms"];
  
  for (const channel of channels) {
    try {
      const result = await notifyChannel(channel, message, payload);
      if (result.success) {
        return { success: true, channel };
      }
    } catch (error) {
      console.error(`Failed to send via ${channel}:`, error);
    }
  }
  
  return { success: false, channel: "email", error: "All notification channels failed" };
}

function formatNotificationMessage(payload: NotificationPayload): string {
  let msg = `🔮 New client: ${payload.clientName}`;
  
  if (payload.topic) {
    msg += `\nTopic: ${payload.topic}`;
  }
  
  if (payload.focus === "person" && payload.personName) {
    msg += `\nReading about: ${payload.personName}`;
  } else if (payload.focus === "self" && payload.lifeArea) {
    msg += `\nArea: ${payload.lifeArea}`;
  }
  
  msg += `\n\nFirst message: ${payload.firstMessage.substring(0, 100)}${payload.firstMessage.length > 100 ? "..." : ""}`;
  msg += `\n\n${payload.sessionLink}`;
  
  return msg;
}

async function notifyChannel(channel: NotificationChannel, message: string, payload: NotificationPayload): Promise<{ success: boolean }> {
  switch (channel) {
    case "whatsapp":
      return notifyWhatsApp(message);
    case "email":
      return notifyEmail(message);
    case "sms":
      return notifySMS(message);
    default:
      return { success: false };
  }
}

async function notifyWhatsApp(message: string): Promise<{ success: boolean }> {
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log("[Notify] WhatsApp webhook not configured, skipping");
    return { success: false };
  }
  
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    
    return { success: response.ok };
  } catch {
    return { success: false };
  }
}

async function notifyEmail(message: string): Promise<{ success: boolean }> {
  const webhookUrl = process.env.EMAIL_WEBHOOK_URL;
  
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          subject: `🔮 New Madam Groovy Client`,
          body: message,
        }),
      });
      
      if (response.ok) {
        return { success: true };
      }
    } catch {
      console.log("[Notify] Email webhook failed");
    }
  }
  
  const adminEmail = process.env.ADMIN_EMAIL || "harmony@groovy.com";
  const mailtoUrl = `mailto:${adminEmail}?subject=${encodeURIComponent("🔮 New Madam Groovy Client")}&body=${encodeURIComponent(message)}`;
  
  if (typeof window !== "undefined") {
    window.location.href = mailtoUrl;
  }
  
  return { success: true };
}

async function notifySMS(message: string): Promise<{ success: boolean }> {
  const webhookUrl = process.env.SMS_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log("[Notify] SMS webhook not configured, skipping");
    return { success: false };
  }
  
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    
    return { success: response.ok };
  } catch {
    return { success: false };
  }
}
