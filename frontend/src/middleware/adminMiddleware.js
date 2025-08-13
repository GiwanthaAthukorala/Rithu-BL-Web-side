import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function withAdminAuth() {
  const token = cookies().get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/Admin/page", request.url));
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const user = await response.json();

    if (!["admin", "superadmin"].includes(user.role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return user;
  } catch (error) {
    return NextResponse.redirect(new URL("/Admin/login", request.url));
  }
}
