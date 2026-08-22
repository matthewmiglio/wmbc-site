import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // The address is taken from the signed-in session and any email in the
  // request body is ignored. Otherwise this route answers "is this person a
  // member?" for any address anyone types, which lets a stranger test a list
  // of addresses against the membership roster.
  const session = await getServerSession(req, res, authOptions);
  const email = session?.user?.email;
  if (!email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { data, error } = await supabase
      .from("wmbc_SIGNUPs")
      .select("email")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking email:", error);
      return res.status(500).json({ message: "Error checking email" });
    }

    return res.status(200).json({ isRegistered: !!data });
  } catch (error) {
    console.error("Error in API:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
