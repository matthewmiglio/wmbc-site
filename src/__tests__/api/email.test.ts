import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockReq, mockRes } from "../helpers";
import handler from "@/pages/api/email";

const status = (res: unknown) => (res as { statusCode: number }).statusCode;

const good = {
  fname: "Ada",
  lname: "Lovelace",
  email: "ada@example.com",
  phone: "555-0100",
};

beforeEach(() => {
  vi.restoreAllMocks();
  vi.stubEnv("RESEND_API_KEY", "test-key");
  vi.stubEnv("EMAIL_RECIPIENTS", "club@example.com");
});

describe("POST /api/email", () => {
  it("rejects non-POST", async () => {
    const res = mockRes();
    await handler(mockReq({ method: "GET" }), res);
    expect(status(res)).toBe(405);
  });

  it("rejects a malformed email address", async () => {
    const res = mockRes();
    await handler(mockReq({ body: { ...good, email: "not-an-email" } }), res);
    expect(status(res)).toBe(400);
  });

  it("escapes HTML from the form before it reaches the outbound email", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200 }));

    const res = mockRes();
    await handler(
      mockReq({
        body: { ...good, fname: '<a href="http://evil.test">click</a>' },
      }),
      res
    );

    expect(status(res)).toBe(200);
    const sent = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(sent.html).not.toContain("<a href");
    expect(sent.html).toContain("&lt;a href=&quot;http://evil.test&quot;&gt;");
  });
});
