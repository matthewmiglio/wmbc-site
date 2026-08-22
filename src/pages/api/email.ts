import type { NextApiRequest, NextApiResponse } from "next";
import { cleanStr, escapeHtml, isEmail } from "@/lib/validate";

type Data = {
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
      message: "Method Not Allowed",
    });
  }

  // Validate before anything is interpolated into an outbound email.
  const fname = cleanStr(req.body?.fname, 100);
  const lname = cleanStr(req.body?.lname, 100);
  const phone = cleanStr(req.body?.phone, 40);
  const email = cleanStr(req.body?.email, 254);

  if (!fname || !lname || !phone || !email || !isEmail(email)) {
    return res.status(400).json({
      error: "Missing or invalid required fields",
      message:
        "Can't send an email containing this registration data because the form is missing or has invalid required fields",
    });
  }

  // Get Resend API key
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return res.status(500).json({
      error: "Resend API key not configured",
      message: "Error: Email service not configured",
    });
  }

  // Get email recipients from environment variable
  const emailRecipientsString = process.env.EMAIL_RECIPIENTS;
  if (!emailRecipientsString) {
    return res.status(500).json({
      error: "Email recipients not configured",
      message: "Error: Email recipients not configured",
    });
  }

  // Parse comma-separated recipients
  const recipients = emailRecipientsString
    .split(",")
    .map((r) => r.trim())
    .filter((r) => r.length > 0);

  if (recipients.length === 0) {
    return res.status(500).json({
      error: "No valid recipients found",
      message: "Error: No valid email recipients configured",
    });
  }

  // Get sender email from environment variable
  const fromEmail = process.env.EMAIL_FROM || "wmbonsai@pixelbargain.com";

  // Compose the email. Every value below came from the request body, so it is
  // escaped: unescaped, a signup could inject links or markup into the mail
  // club admins receive.
  const subject = `New Registration: ${escapeHtml(fname)} ${escapeHtml(lname)}`;
  const html = `
      <h3>New Registration</h3>
      <p><strong>Full Name:</strong> ${escapeHtml(fname)} ${escapeHtml(lname)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    `;

  try {
    // Send email via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: recipients,
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      console.error("Resend API error:", await resendResponse.text());
      return res.status(502).json({
        error: "Failed to send email",
        message: "Error sending email",
      });
    }

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Error sending email",
    });
  }
}
