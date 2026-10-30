// Fixes API-01..04: hardened Server Action for the contact form.
"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "10 m"),
  prefix: "contact",
});

const noCRLF = (s: string) => s.replace(/[\r\n]+/g, " "); // prevents mail-header injection

const ContactSchema = z.object({
  fullName: z.string().trim().min(2).max(80)
    .regex(/^[\p{L}\p{M}'’.\- ]+$/u, "Please use letters only"), // rejects "@@#%!"
  email: z.string().trim().toLowerCase().email().max(254),
  company: z.string().trim().max(120).default(""),
  industry: z.string().trim().max(80).default(""),
  message: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional(),       // honeypot: real users leave it empty
  turnstileToken: z.string().min(1),
});

export type ActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

async function verifyTurnstile(token: string, ip: string) {
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET!, response: token, remoteip: ip }),
  });
  return ((await res.json()) as { success: boolean }).success;
}

export async function submitContact(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const { success } = await ratelimit.limit(ip);
  if (!success) return { ok: false, message: "Too many requests. Please try again later." };

  const parsed = ContactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { ok: false, message: "Please check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };

  if (parsed.data.website) return { ok: true, message: "Thanks! We'll be in touch." }; // silently drop bots
  if (!(await verifyTurnstile(parsed.data.turnstileToken, ip)))
    return { ok: false, message: "Verification failed. Please retry." };

  try {
    // await sendMail({ subject: noCRLF(`New enquiry from ${parsed.data.fullName}`), ... });
    void noCRLF;
    return { ok: true, message: "Thanks! We'll be in touch." };
  } catch (err) {
    console.error("contact_submit_failed", { reqId: h.get("x-vercel-id") }); // no PII in logs
    return { ok: false, message: "Something went wrong. Please try again." }; // generic error
  }
}
