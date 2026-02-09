import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FEEDBACK_FILE = path.join(process.cwd(), "feedback.log");

export async function POST(req: NextRequest) {
  try {
    const { url, message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${url || "/"}\n${message}\n\n`;

    fs.appendFileSync(FEEDBACK_FILE, line, "utf-8");

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "failed to write feedback" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const content = fs.existsSync(FEEDBACK_FILE)
      ? fs.readFileSync(FEEDBACK_FILE, "utf-8")
      : "";
    return new NextResponse(content, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch {
    return NextResponse.json({ error: "failed to read feedback" }, { status: 500 });
  }
}
