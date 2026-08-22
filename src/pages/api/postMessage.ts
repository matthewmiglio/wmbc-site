import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const MAX_LEN = 2000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
  if (!content) {
    return res.status(400).json({ message: "Message content is required" });
  }
  if (content.length > MAX_LEN) {
    return res.status(400).json({ message: `Message exceeds ${MAX_LEN} characters` });
  }

  const { data, error } = await supabaseAdmin
    .from("wmbc_messages")
    .insert([{ user_email: session.user.email, content }])
    .select()
    .single();

  if (error) {
    // Logged, not returned: Supabase errors expose schema details.
    console.error("Error inserting message:", error);
    return res.status(500).json({ message: "Error inserting message" });
  }

  return res.status(200).json({ message: data });
}
