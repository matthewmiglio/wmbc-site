import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockReq, mockRes } from "../helpers";

const selectChain = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
};
const fromMock = vi.fn();

const getServerSessionMock = vi.fn();
vi.mock("next-auth/next", () => ({
  getServerSession: (...a: unknown[]) => getServerSessionMock(...a),
}));
vi.mock("@/lib/authOptions", () => ({ authOptions: {} }));

vi.mock("@/lib/supabaseAdmin", () => ({
  supabaseAdmin: { from: (...a: unknown[]) => fromMock(...a) },
}));

import handler from "@/pages/api/emailExistsInSignups";

const status = (res: unknown) => (res as { statusCode: number }).statusCode;

beforeEach(() => {
  vi.clearAllMocks();
  fromMock.mockImplementation(() => selectChain);
  getServerSessionMock.mockResolvedValue({ user: { email: "me@x.com" } });
});

describe("POST /api/emailExistsInSignups", () => {
  it("rejects non-POST", async () => {
    const res = mockRes();
    await handler(mockReq({ method: "GET" }), res);
    expect(status(res)).toBe(405);
  });

  it("returns 401 when not signed in", async () => {
    getServerSessionMock.mockResolvedValueOnce(null);
    const res = mockRes();
    await handler(mockReq({ body: { email: "someone@x.com" } }), res);
    expect(status(res)).toBe(401);
  });

  it("looks up the session email and ignores the body", async () => {
    selectChain.single.mockResolvedValueOnce({
      data: { email: "me@x.com" },
      error: null,
    });
    const res = mockRes();
    await handler(mockReq({ body: { email: "victim@x.com" } }), res);
    expect(selectChain.eq).toHaveBeenCalledWith("email", "me@x.com");
    expect((res as unknown as { jsonBody: { isRegistered: boolean } }).jsonBody
      .isRegistered).toBe(true);
  });

  it("returns isRegistered: false when PGRST116", async () => {
    selectChain.single.mockResolvedValueOnce({
      data: null,
      error: { code: "PGRST116" },
    });
    const res = mockRes();
    await handler(mockReq({ body: {} }), res);
    expect((res as unknown as { jsonBody: { isRegistered: boolean } }).jsonBody
      .isRegistered).toBe(false);
  });
});
