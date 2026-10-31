import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json(
    {
      error:
        "Saved work now stays in your browser. Shared history is no longer available.",
    },
    { status: 410 },
  );
}
export async function DELETE() {
  return GET();
}
