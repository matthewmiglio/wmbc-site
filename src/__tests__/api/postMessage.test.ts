import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockReq, mockRes } from "../helpers";

const getServerSessionMock = vi.fn();
vi.mock("next-auth/next", () => ({
  getServerSession: (...a: unknown[]) => getServerSessionMock(...a),
}));
vi.mock("@/lib/authOptions", () => ({ authOptions: {} }));

const insertReturn = {
  select: vi.fn().mockReturnThis(),
  single: vi.fn(),
};
const fromMock = vi.fn(() => ({
  insert: vi.fn(() => insertReturn),
}));
vi.mock("@/lib/supabaseAdmin", () => ({
  supabaseAdmin: { from: (...a: unknown[]) => fromMock(...a) },
}));

import handler from "@/pages/api/postMessage";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/postMessage", () => {
  it("rejects non-POST", async () => {
    const req = mockReq({ method: "GET" });
    const res = mockRes();
    await handler(req, res);
    expect((res as unknown as { statusCode: number }).statusCode).toBe(405);
  });

  it("returns 401 when no session", async () => {
    getServerSessionMock.mockResolvedValueOnce(null);
    const req = mockReq({ body: { content: "hi" } });
    const res = mockRes();
    await handler(req, res);
    expect((res as unknown as { statusCode: number }).statusCode).toBe(401);
  });

  it("returns 400 when content empty", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { email: "u@x.com" } });
    const req = mockReq({ body: { content: "   " } });
    const res = mockRes();
    await handler(req, res);
    expect((res as unknown as { statusCode: number }).statusCode).toBe(400);
  });

  it("returns 400 when content exceeds 2000 chars", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { email: "u@x.com" } });
    const req = mockReq({ body: { content: "x".repeat(2001) } });
    const res = mockRes();
    await handler(req, res);
    expect((res as unknown as { statusCode: number }).statusCode).toBe(400);
  });

  it("inserts via service role and returns 200 when authed", async () => {
    getServerSessionMock.mockResolvedValueOnce({
      user: { email: "u@x.com" },
    });
    insertReturn.single.mockResolvedValueOnce({
      data: { id: 42, user_email: "u@x.com", content: "hi", created_at: "now" },
      error: null,
    });
    const req = mockReq({ body: { content: "hi" } });
    const res = mockRes();
    await handler(req, res);
    expect((res as unknown as { statusCode: number }).statusCode).toBe(200);
    expect(fromMock).toHaveBeenCalledWith("wmbc_messages");
  });
});
