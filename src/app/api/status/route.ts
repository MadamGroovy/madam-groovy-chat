import { NextRequest, NextResponse } from "next/server";

const availabilityStatus = {
  status: "offline" as "available" | "in_session" | "offline",
  updatedAt: Date.now(),
};

export async function GET() {
  return NextResponse.json({
    status: availabilityStatus.status,
    updatedAt: availabilityStatus.updatedAt,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (body.status) {
    availabilityStatus.status = body.status;
    availabilityStatus.updatedAt = Date.now();
  }
  return NextResponse.json({ success: true });
}
