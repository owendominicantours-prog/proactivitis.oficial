import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.redirect("https://proactivitis.com/sitemap-experiencias.xml", 308);
}
