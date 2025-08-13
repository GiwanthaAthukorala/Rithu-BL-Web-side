import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

const secret = process.env.ADMIN_JWT_SECRET;

export default async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Only protect admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow login page
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get("adminToken")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    await verify(token, secret);
    return NextResponse.next();
  } catch (error) {
    console.error("Admin auth error:", error);
    const response = NextResponse.redirect(new URL("/admin/login", req.url));
    response.cookies.delete("adminToken");
    return response;
  }
}
