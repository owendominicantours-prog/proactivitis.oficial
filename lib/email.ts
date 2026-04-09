import nodemailer from "nodemailer";
import { convert } from "html-to-text";
import {
  buildUnsubscribeApiUrl,
  buildUnsubscribeUrl,
  isEmailSuppressed,
  normalizeEmailAddress
} from "@/lib/emailUnsubscribe";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT ?? "587");
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

let mailAgent: ReturnType<typeof nodemailer.createTransport> | null = null;

const createMailAgent = () => {
  if (!host || !port || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });
};

const getMailAgent = () => {
  if (!mailAgent) {
    mailAgent = createMailAgent();
  }
  return mailAgent;
};

const shouldRetryTransport = (error: unknown) => {
  if (!(error instanceof Error)) return false;
  const code = (error as Error & { code?: string }).code;
  return code === "ECONNECTION" || /connection closed unexpectedly/i.test(error.message);
};

export async function sendEmail({
  to,
  subject,
  html,
  from,
  category = "transactional"
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
  category?: "transactional" | "optional" | "internal";
}) {
  const agent = getMailAgent();
  if (!agent) {
    console.warn("SMTP credentials missing; email not sent", to, subject);
    return null;
  }
  const recipients = to
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const singleRecipient = recipients.length === 1 ? normalizeEmailAddress(recipients[0]) : null;
  if (category === "optional" && singleRecipient) {
    const suppressed = await isEmailSuppressed(singleRecipient);
    if (suppressed) {
      console.warn("Optional email skipped because recipient unsubscribed", singleRecipient, subject);
      return null;
    }
  }

  const unsubscribeUrl =
    category !== "internal" && singleRecipient ? buildUnsubscribeUrl(singleRecipient) : null;
  const unsubscribeApiUrl =
    category !== "internal" && singleRecipient ? buildUnsubscribeApiUrl(singleRecipient) : null;
  const unsubscribeFooter =
    unsubscribeUrl && singleRecipient
      ? `
        <div style="font-family:Inter,system-ui,-apple-system,sans-serif;background:#eef3fb;padding:0 32px 32px;color:#64748b;">
          <div style="max-width:680px;margin:0 auto;font-size:12px;line-height:1.7;">
            Si no deseas recibir correos no esenciales de Proactivitis, puedes
            <a href="${unsubscribeUrl}" style="color:#0ea5e9;text-decoration:none;font-weight:600;">darte de baja aqui</a>.
            Los correos operativos de reservas, pagos o seguridad pueden seguir enviandose cuando sean necesarios.
          </div>
        </div>
      `
      : "";
  const payload = {
    from: from ?? `"Proactivitis" <${user}>`,
    to,
    subject,
    html: `${html}${unsubscribeFooter}`,
    replyTo: from ?? user,
    text: convert(`${html}${unsubscribeFooter}`, {
      wordwrap: 130
    }),
    headers: {
      "X-Priority": "3",
      "X-Mailer": "Proactivitis CRM",
      ...(unsubscribeApiUrl
        ? {
            "List-Unsubscribe": `<${unsubscribeApiUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
          }
        : {})
    }
  };

  try {
    return await agent.sendMail(payload);
  } catch (error) {
    if (!shouldRetryTransport(error)) {
      throw error;
    }
    mailAgent = createMailAgent();
    if (!mailAgent) {
      throw error;
    }
    return mailAgent.sendMail(payload);
  }
}
