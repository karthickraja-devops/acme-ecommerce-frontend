
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

export const config = {
  matcher: ["/", "/product/:path*", "/cart", "/success"],
};

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  let response = NextResponse.next();

  // Route the homepage to the default variant.
  if (request.nextUrl.pathname === "/") {
    const nextUrl = new URL(
      `/default${request.nextUrl.pathname}${request.nextUrl.search}`,
      request.url
    );
    response = NextResponse.rewrite(nextUrl, { request });
  }

  // Set a shopper cookie if one doesn't exist.
  if (!request.cookies.has("shopper")) {
    const newShopperId = Math.random().toString(36).substring(2);
    response.cookies.set("shopper", newShopperId);
  }

  return response;
}
