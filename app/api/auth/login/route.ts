
import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";

export const runtime = "nodejs";

const COGNITO_DOMAIN = process.env.COGNITO_DOMAIN!;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;
const REDIRECT_URI = process.env.COGNITO_REDIRECT_URI!;

export async function GET(request: NextRequest) {
  try {
    if (!COGNITO_DOMAIN || !CLIENT_ID || !REDIRECT_URI) {
      throw new Error("Cognito environment variables are missing");
    }

    // Generate a random OAuth state value.
    const state = randomBytes(32).toString("base64url");

    // Generate the PKCE verifier and S256 challenge.
    const codeVerifier = randomBytes(32).toString("base64url");

    const codeChallenge = createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");

    // Build the Cognito authorization URL.
    const authorizeUrl = new URL(
      "/oauth2/authorize",
      COGNITO_DOMAIN
    );

    authorizeUrl.search = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: "openid email phone",
      prompt: "login",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    }).toString();

    console.log("COGNITO AUTHORIZE URL:", authorizeUrl.toString());

    const response = NextResponse.redirect(authorizeUrl);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 600,
    };

    response.cookies.set("oauth_state", state, cookieOptions);
    response.cookies.set("pkce_verifier", codeVerifier, cookieOptions);

    return response;
  } catch (error) {
    console.error("Cognito login initialization failed:", error);

    return NextResponse.redirect(
      new URL("/?authError=login_initialization_failed", request.url)
    );
  }
}
