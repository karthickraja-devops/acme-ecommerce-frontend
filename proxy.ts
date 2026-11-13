
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

export const config = {
  matcher: ["/", "/product/:path*", "/cart", "/success"],
};

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const response = NextResponse.next();

  // Set a shopper cookie if one doesn't exist or has been cleared.
  if (!request.cookies.has("shopper")) {
    const newShopperId = Math.random().toString(36).substring(2);
    response.cookies.set("shopper", newShopperId);
  }

  return response;
}
