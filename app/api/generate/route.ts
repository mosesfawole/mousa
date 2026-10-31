import { NextRequest } from "next/server";
import { handleContentRequest } from "@/lib/content-api";
export const maxDuration = 60;
export async function POST(req: NextRequest) {
  return handleContentRequest(req, "generate");
}
