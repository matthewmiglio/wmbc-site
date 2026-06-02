import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockReq, mockRes } from "../helpers";

const selectChain = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
};
const insertResult = { data: [{ id: 1 }], error: null };
const fromMock = vi.fn();

vi.mock("@/lib/supabaseAdmin", () => ({
  supabaseAdmin: {
    from: (...args: unknown[]) => fromMock(...args),
  },
}));

import handler from "@/pages/api/addToSignUpTable";

beforeEach(() => {
  vi.clearAllMocks();
  fromMock.mockImplementation(() => ({
    select: selectChain.select,
    eq: selectChain.eq,
    single: selectChain.single,
    insert: vi.fn().mockResolvedValue(insertResult),
  }));
});

describe("POST /api/addToSignUpTable", () => {
  it("rejects non-POST", async () => {
    const req = mockReq({ method: "GET" });
    const res = mockRes();
    await handler(req, res);
    expect((res as unknown as { statusCode: number }).statusCode).toBe(405);
  });

  it("returns 409 when email already exists", async () => {
    selectChain.single.mockResolvedValueOnce({
      data: { email: "x@x.com" },
      error: null,
    });
    const req = mockReq({
      body: { fname: "a", lname: "b", email: "x@x.com", phone: "" },
    });
    const res = mockRes();
    await handler(req, res);
    expect((res as unknown as { statusCode: number }).statusCode).toBe(409);
  });

  it("inserts and returns 200 when email is new", async () => {
    selectChain.single.mockResolvedValueOnce({
      data: null,
      error: { code: "PGRST116" },
    });
    const req = mockReq({
      body: { fname: "a", lname: "b", email: "new@x.com", phone: "555" },
    });
    const res = mockRes();
    await handler(req, res);
    expect((res as unknown as { statusCode: number }).statusCode).toBe(200);
  });
});
