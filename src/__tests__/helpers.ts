import type { NextApiRequest, NextApiResponse } from "next";

export function mockReq(opts: Partial<NextApiRequest> = {}): NextApiRequest {
  return {
    method: "POST",
    headers: {},
    body: {},
    query: {},
    cookies: {},
    ...opts,
  } as unknown as NextApiRequest;
}

export function mockRes() {
  const res: {
    statusCode: number;
    jsonBody: unknown;
    status: (n: number) => typeof res;
    json: (b: unknown) => typeof res;
    setHeader: () => void;
    end: () => void;
  } = {
    statusCode: 0,
    jsonBody: undefined,
    status(n) { this.statusCode = n; return this; },
    json(b) { this.jsonBody = b; return this; },
    setHeader() {},
    end() {},
  };
  return res as unknown as NextApiResponse & {
    statusCode: number;
    jsonBody: unknown;
  };
}

export type SupabaseStub = {
  from: ReturnType<typeof import("vitest").vi.fn>;
  __setTable: (cfg: {
    selectResult?: { data: unknown; error: unknown };
    insertResult?: { data: unknown; error: unknown };
  }) => void;
};
