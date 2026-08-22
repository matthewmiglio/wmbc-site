import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockReq, mockRes } from "../helpers";

const selectChain = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
};
const insertMock = vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null });
const fromMock = vi.fn();

const getServerSessionMock = vi.fn();
vi.mock("next-auth/next", () => ({
  getServerSession: (...a: unknown[]) => getServerSessionMock(...a),
}));
vi.mock("@/lib/authOptions", () => ({ authOptions: {} }));

vi.mock("@/lib/supabaseAdmin", () => ({
  supabaseAdmin: {
    from: (...args: unknown[]) => fromMock(...args),
  },
}));

import handler from "@/pages/api/addToSignUpTable";

const status = (res: unknown) => (res as { statusCode: number }).statusCode;

beforeEach(() => {
  vi.clearAllMocks();
  fromMock.mockImplementation(() => ({
    select: selectChain.select,
    eq: selectChain.eq,
    single: selectChain.single,
    insert: insertMock,
  }));
  getServerSessionMock.mockResolvedValue({ user: { email: "me@x.com" } });
});

describe("POST /api/addToSignUpTable", () => {
  it("rejects non-POST", async () => {
    const res = mockRes();
    await handler(mockReq({ method: "GET" }), res);
    expect(status(res)).toBe(405);
  });

  it("returns 401 when not signed in", async () => {
    getServerSessionMock.mockResolvedValueOnce(null);
    const res = mockRes();
    await handler(mockReq({ body: { fname: "a", lname: "b", phone: "" } }), res);
    expect(status(res)).toBe(401);
  });

  it("rejects a non-string name", async () => {
    const res = mockRes();
    await handler(
      mockReq({ body: { fname: { $ne: null }, lname: "b", phone: "" } }),
      res
    );
    expect(status(res)).toBe(400);
  });

  it("rejects an over-long name", async () => {
    const res = mockRes();
    await handler(
      mockReq({ body: { fname: "a".repeat(101), lname: "b", phone: "" } }),
      res
    );
    expect(status(res)).toBe(400);
  });

  it("returns 409 when email already exists", async () => {
    selectChain.single.mockResolvedValueOnce({
      data: { email: "me@x.com" },
      error: null,
    });
    const res = mockRes();
    await handler(mockReq({ body: { fname: "a", lname: "b", phone: "" } }), res);
    expect(status(res)).toBe(409);
  });

  it("inserts the session email, not one from the body", async () => {
    selectChain.single.mockResolvedValueOnce({
      data: null,
      error: { code: "PGRST116" },
    });
    const res = mockRes();
    await handler(
      mockReq({
        body: { fname: "a", lname: "b", phone: "555", email: "victim@x.com" },
      }),
      res
    );
    expect(status(res)).toBe(200);
    expect(insertMock).toHaveBeenCalledWith([
      { fname: "a", lname: "b", email: "me@x.com", phone: "555" },
    ]);
  });

  it("does not leak the database error to the caller", async () => {
    selectChain.single.mockResolvedValueOnce({
      data: null,
      error: { code: "PGRST116" },
    });
    insertMock.mockResolvedValueOnce({
      data: null,
      error: { message: "duplicate key value violates constraint xyz" },
    });
    const res = mockRes();
    await handler(mockReq({ body: { fname: "a", lname: "b", phone: "" } }), res);
    expect(status(res)).toBe(400);
    expect(JSON.stringify((res as unknown as { jsonBody: unknown }).jsonBody))
      .not.toContain("constraint");
  });
});
