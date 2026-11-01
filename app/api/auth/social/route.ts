import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // A provider/email posted by the browser is not proof of identity. OAuth is
  // intentionally disabled until callback verification is implemented.
  void request;
  return NextResponse.json(
    { error: "Social sign-in is not configured yet. Please use email and password." },
    { status: 501 }
  );
}
