import { NextResponse } from "next/server";
import { getThbRates } from "@/lib/fx";

export async function GET() {
  const fx = await getThbRates();
  return NextResponse.json(fx);
}
