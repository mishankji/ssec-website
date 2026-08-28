import { NextResponse } from "next/server";
import { Resend } from "resend";

const TO_ADDRESS = "info@ssenvirocare.in";

export async function POST(request: Request) {
  let body: {
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name, email, phone, subject, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      "RESEND_API_KEY is not set -- contact form submission was not emailed."
    );
    return NextResponse.json(
      {
        error:
          "The contact form isn't fully set up yet -- please email us directly at " +
          TO_ADDRESS,
      },
      { status: 500 }
    );
  }

  try {
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      // Replace with an address on a domain verified in Resend once one is
      // set up; the resend.dev sending address only reaches the account's
      // own verified inbox, not arbitrary recipients like TO_ADDRESS.
      from: "SS Envirocare Website <onboarding@resend.dev>",
      to: TO_ADDRESS,
      replyTo: email,
      subject: `New contact form submission: ${subject || "General Inquiry"}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "-"}`,
        `Subject: ${subject || "-"}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });

    if (error) {
      console.error("Resend failed to send contact form email:", error);
      return NextResponse.json(
        { error: "Something went wrong. Please try again or email us directly." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form submission failed:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again or email us directly." },
      { status: 500 }
    );
  }
}
