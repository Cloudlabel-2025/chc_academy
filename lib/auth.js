import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_key_change_in_production_min_32_characters";
export const AUTH_COOKIE_NAME = "chc_auth_token";

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signAuthToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAuthToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyAuthToken(token);
    if (!payload || !payload.email) return null;

    return {
      email: payload.email.toLowerCase(),
      fullName: payload.fullName || payload.email,
      displayName: payload.fullName || payload.email,
      role: payload.role || "trainee",
    };
  } catch {
    return null;
  }
}

export const getChatGPTUser = getAuthUser;

export async function requireAuthUser(returnTo = "/dashboard") {
  const user = await getAuthUser();
  if (user) return user;

  const safeReturn = returnTo.startsWith("/") ? returnTo : "/dashboard";
  redirect(`/login?returnTo=${encodeURIComponent(safeReturn)}`);
}

export const requireChatGPTUser = requireAuthUser;

export function chatGPTSignInPath(returnTo = "/dashboard") {
  return `/login?returnTo=${encodeURIComponent(returnTo)}`;
}

export function chatGPTSignOutPath(returnTo = "/") {
  return `/login?returnTo=${encodeURIComponent(returnTo)}&logout=1`;
}

export function setAuthCookie(response, token) {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearAuthCookie(response) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
