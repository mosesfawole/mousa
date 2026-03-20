import { NextResponse, NextRequest } from "next/server";
import { getHistory, deleteContent } from "@/lib/db";

// GET /api/history — fetch last 20 sessions
export async function GET() {
  try {
    const history = await getHistory();
    return NextResponse.json(history);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 },
    );
  }
}

// DELETE /api/history?id=xxx — delete a single session
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const success = await deleteContent(id);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
