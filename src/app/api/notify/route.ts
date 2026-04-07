import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    const message = formatNotificationMessage(payload);
    
    const whatsappUrl = process.env.WHATSAPP_WEBHOOK_URL;
    if (whatsappUrl) {
      try {
        await fetch(whatsappUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });
      } catch (e) {
        console.error("WhatsApp notify failed:", e);
      }
    }
    
    const emailApiKey = process.env.MAILGUN_API_KEY;
    const emailDomain = process.env.MAILGUN_DOMAIN;
    const toEmail = process.env.NOTIFY_EMAIL || "harmony@groovy.com";
    
    if (emailApiKey && emailDomain) {
      try {
        const auth = Buffer.from(`api:${emailApiKey}`).toString("base64");
        await fetch(`https://api.mailgun.net/v3/${emailDomain}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${auth}`,
          },
          body: new URLSearchParams({
            from: `Madam Groovy <postmaster@${emailDomain}>`,
            to: toEmail,
            subject: `🔮 New reading chat started: ${payload.clientName}`,
            text: message,
          }).toString(),
        });
      } catch (e) {
        console.error("Mailgun notify failed:", e);
      }
    }
    
    const emailUrl = process.env.EMAIL_WEBHOOK_URL;
    if (emailUrl) {
      try {
        await fetch(emailUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: `🔮 New Madam Groovy Client: ${payload.clientName}`,
            body: message,
          }),
        });
      } catch (e) {
        console.error("Email webhook notify failed:", e);
      }
    }
    
    const smsUrl = process.env.SMS_WEBHOOK_URL;
    if (smsUrl) {
      try {
        await fetch(smsUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });
      } catch (e) {
        console.error("SMS notify failed:", e);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notify API error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

function formatNotificationMessage(payload: any): string {
  let msg = `🔮 New client: ${payload.clientName}`;
  
  if (payload.topic) {
    msg += `\nTopic: ${payload.topic}`;
  }
  
  if (payload.focus === "person" && payload.personName) {
    msg += `\nReading about: ${payload.personName}`;
  } else if (payload.focus === "self" && payload.lifeArea) {
    msg += `\nArea: ${payload.lifeArea}`;
  }
  
  msg += `\n\nFirst message: ${payload.firstMessage?.substring(0, 100) || "N/A"}`;
  msg += `\n\nSession ID: ${payload.sessionId || "N/A"}`;
  msg += `\nOpen session: ${payload.sessionLink}`;
  
  return msg;
}
