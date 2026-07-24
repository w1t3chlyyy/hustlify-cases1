import { NextRequest, NextResponse } from "next/server";
import { webhookCallback } from "grammy";
import { getBot } from "@/lib/bot/bot";

export async function POST(req: NextRequest) {
  try {
    const handleUpdate = webhookCallback(getBot(), "std/http", {
      secretToken: process.env.TELEGRAM_WEBHOOK_SECRET,
    });
    return await handleUpdate(req);
  } catch (err) {
    console.error("[bot webhook]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// Convenience health-check — Telegram itself only ever sends POST requests here.
export async function GET() {
  return NextResponse.json({ ok: true, message: "Hustlify admin bot webhook is running." });
}
