import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().trim().email("Invalid email"),
  projectType: z.enum(["web-app", "ecommerce", "dashboard", "landing", "other"]),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
});

const PROJECT_TYPE_LABELS: Record<string, string> = {
  "web-app": "Web app",
  ecommerce: "E-commerce",
  dashboard: "Dashboard",
  landing: "Landing page",
  other: "Other",
};

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = ContactSchema.safeParse(payload);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      {
        error: firstIssue?.message || "Validation failed",
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  const { name, email, projectType, message } = parsed.data;
  const projectLabel = PROJECT_TYPE_LABELS[projectType] || projectType;
  const submittedAt = new Date().toISOString();

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Shade Works <hello@shadeworks.dev>";
  const toEmail = process.env.CONTACT_TO_EMAIL || "adrian@shadeworks.dev";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const warnings: string[] = [];

  // 1. Send notification email via Resend
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        replyTo: email,
        subject: `New lead — ${projectLabel} · ${name}`,
        text: [
          `New contact submission`,
          ``,
          `Name:    ${name}`,
          `Email:   ${email}`,
          `Project: ${projectLabel}`,
          `Time:    ${submittedAt}`,
          ``,
          `--- Message ---`,
          message,
        ].join("\n"),
      });
    } catch (err) {
      console.error("[contact] Resend send failed", err);
      warnings.push("email-failed");
    }
  } else {
    console.warn("[contact] RESEND_API_KEY not set — skipping email");
    console.log("[contact] Lead received:", { name, email, projectType, message });
    warnings.push("resend-not-configured");
  }

  // 2. Insert into Supabase leads table
  if (supabaseUrl && supabaseServiceKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      });
      const { error } = await supabase.from("leads").insert({
        name,
        email,
        project_type: projectType,
        message,
        submitted_at: submittedAt,
      });
      if (error) {
        console.error("[contact] Supabase insert failed", error);
        warnings.push("db-failed");
      }
    } catch (err) {
      console.error("[contact] Supabase client error", err);
      warnings.push("db-failed");
    }
  } else {
    console.warn("[contact] Supabase env not set — skipping insert");
    warnings.push("supabase-not-configured");
  }

  return NextResponse.json({ ok: true, warnings }, { status: 200 });
}
