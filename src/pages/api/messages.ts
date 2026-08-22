import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// The member chat used to be read straight from the browser with the public
// Supabase key, which meant anyone could pull every message and every member's
// email address. Reads now go through here so a sign-in is required.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // ponytail: newest 200, no paging. The chat has never been longer.
  const { data, error } = await supabaseAdmin
    .from("wmbc_messages")
    .select("id, user_email, content, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ message: "Error fetching messages" });
  }

  return res.status(200).json({ messages: (data ?? []).reverse() });
}
