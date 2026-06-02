import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockReq, mockRes } from "../helpers";

const selectChain = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
};
const fromMock = vi.fn();

vi.mock("@/lib/supabaseAdmin", () => ({
  supabaseAdmin: { from: (...a: unknown[]) => fromMock(...a) },
}));

import handler from "@/pages/api/emailExistsInSignups";

beforeEach(() => {
  vi.clearAllMocks();
  fromMock.mockImplementation(() => selectChain);
});

describe("POST /api/emailExistsInSignups", () => {
  it("rejects non-POST", async () => {
    const req = mockReq({ method: "GET" });
    const res = mockRes();
    await handler(req, res);
    expect((res as unknown as { statusCode: number }).statusCode).toBe(405);
  });

  it("requires email", async () => {
    const req = mockReq({ body: {} });
    const res = mockRes();
    await handler(req, res);
    expect((res as unknown as { statusCode: number }).statusCode).toBe(400);
  });

  it("returns isRegistered: true when row found", async () => {
    selectChain.single.mockResolvedValueOnce({
      data: { email: "x@x.com" },
      error: null,
    });
    const req = mockReq({ body: { email: "x@x.com" } });
    const res = mockRes();
    await handler(req, res);
    const body = (res as unknown as { jsonBody: { isRegistered: boolean } }).jsonBody;
    expect(body.isRegistered).toBe(true);
  });

  it("returns isRegistered: false when PGRST116", async () => {
    selectChain.single.mockResolvedValueOnce({
      data: null,
      error: { code: "PGRST116" },
    });
    const req = mockReq({ body: { email: "missing@x.com" } });
    const res = mockRes();
    await handler(req, res);
    const body = (res as unknown as { jsonBody: { isRegistered: boolean } }).jsonBody;
    expect(body.isRegistered).toBe(false);
  });
});
