
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const COGNITO_DOMAIN =
  process.env.COGNITO_DOMAIN!;

const CLIENT_ID =
  process.env.COGNITO_CLIENT_ID!;

const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET!;

const REDIRECT_URI =
  process.env.COGNITO_REDIRECT_URI!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const cognitoError = searchParams.get("error");

    if (cognitoError) {
      return NextResponse.redirect(
        new URL("/?authError=login_failed", request.url)
      );
    }

    const savedState = request.cookies.get("oauth_state")?.value;
    const codeVerifier =
      request.cookies.get("pkce_verifier")?.value;

    if (
      !code ||
      !state ||
      !savedState ||
      !codeVerifier ||
      state !== savedState
    ) {
      return NextResponse.redirect(
        new URL("/?authError=invalid_callback", request.url)
      );
    }

    const tokenResponse = await fetch(
      `${COGNITO_DOMAIN}/oauth2/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: CLIENT_ID,
          code,
          redirect_uri: REDIRECT_URI,
          code_verifier: codeVerifier,
        }),
        cache: "no-store",
      }
    );

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();

      console.error(
        "Cognito token exchange failed:",
        tokenResponse.status,
        errorBody
      );

      return NextResponse.redirect(
        new URL("/?authError=token_exchange_failed", request.url)
      );
    }
    const tokens = await tokenResponse.json();

    console.log("TOKEN EXCHANGE SUCCESS:", {
      hasAccessToken: Boolean(tokens.access_token),
      hasIdToken: Boolean(tokens.id_token),
    });

    if (!tokens.access_token || !tokens.id_token) {
      return NextResponse.redirect(
        new URL("/?authError=missing_tokens", request.url)
      );
    }

    const response = NextResponse.redirect(
      new URL("/", request.url)
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    response.cookies.set("access_token", tokens.access_token, {
      ...cookieOptions,
      maxAge: tokens.expires_in ?? 3600,
    });

    response.cookies.set("id_token", tokens.id_token, {
      ...cookieOptions,
      maxAge: tokens.expires_in ?? 3600,
    });

    if (tokens.refresh_token) {
      response.cookies.set("refresh_token", tokens.refresh_token, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    response.cookies.delete("oauth_state");
    response.cookies.delete("pkce_verifier");

    return response;
  } catch (error) {
    console.error("Cognito callback error:", error);

    return NextResponse.redirect(
      new URL("/?authError=callback_failed", request.url)
    );
  }
}

