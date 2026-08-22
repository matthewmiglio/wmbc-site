import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
import { cleanStr } from "@/lib/validate";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // The only caller is the members page, right after a Google sign-in. Taking
  // the address from the session instead of the request body means a stranger
  // cannot write arbitrary rows into the signup table.
  const session = await getServerSession(req, res, authOptions);
  const email = session?.user?.email;
  if (!email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // The name still arrives in the body, so bound it and reject non-strings.
  const fname = cleanStr(req.body?.fname, 100);
  const lname = cleanStr(req.body?.lname, 100);
  const phone = cleanStr(req.body?.phone, 40);

  if (fname === null || lname === null || phone === null) {
    return res.status(400).json({ message: "Invalid signup data" });
  }

  try {
    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("wmbc_SIGNUPs")
      .select("email")
      .eq("email", email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is what we want
      console.error("Error checking for existing user:", checkError);
      return res
        .status(500)
        .json({ message: "Error checking for existing user" });
    }

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Email already exists in signup table" });
    }

    // Email doesn't exist, proceed with insert
    const { error } = await supabase
      .from("wmbc_SIGNUPs")
      .insert([{ fname, lname, email, phone }]);

    if (error) {
      // Database errors carry schema and constraint details, so they are
      // logged rather than returned to the caller.
      console.error("Error inserting user data:", error);
      return res.status(400).json({ message: "Error inserting user data" });
    }

    return res.status(200).json({ message: "User successfully added" });
  } catch (error) {
    console.error("Unexpected error in addToSignUpTable:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
