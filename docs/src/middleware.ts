import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyFirebaseToken } from "@/lib/edge-auth";

export const config = {
  runtime: "experimental-edge",
  matcher: "/api/:path*",
};

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (request.method === "GET") {
    return NextResponse.next();
  }

  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    try {
      const user = await verifyFirebaseToken(token);
      // Add the user info to the request headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", user.uid);
      requestHeaders.set("x-user-email", user.email || "");
      requestHeaders.set("x-user-name", user.name || "");

      // Return the response with the modified headers
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error("Error verifying token:", error);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
