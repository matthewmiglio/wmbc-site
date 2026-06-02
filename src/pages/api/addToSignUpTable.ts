import { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { fname, lname, email, phone } = req.body;

    try {
      // Check if email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("SIGNUPs")
        .select("email")
        .eq("email", email)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 is "no rows returned" which is what we want
        return res
          .status(500)
          .json({ message: "Error checking for existing user", error: checkError });
      }

      if (existingUser) {
        return res
          .status(409)
          .json({ message: "Email already exists in signup table" });
      }

      // Email doesn't exist, proceed with insert
      const { data, error } = await supabase.from("SIGNUPs").insert([
        { fname: fname, lname: lname, email: email, phone: phone },
      ]);

      if (error) {
        return res
          .status(400)
          .json({ message: "Error inserting user data", error });
      }

      return res.status(200).json({ message: "User successfully added", data });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
