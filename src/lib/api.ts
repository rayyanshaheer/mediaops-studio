import { NextResponse } from "next/server";

export function errorResponse(code: string, message: string, status: number, requestId = crypto.randomUUID()) {
  return NextResponse.json({ error: { code, message, requestId } }, { status, headers: { "x-request-id": requestId } });
}

export function jsonSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, (_, item) => typeof item === "bigint" ? item.toString() : item));
}
