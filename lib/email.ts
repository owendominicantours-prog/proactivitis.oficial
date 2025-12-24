import nodemailer from "nodemailer";
import { convert } from "html-to-text";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT ?? "587");
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

let mailAgent: ReturnType<typeof nodemailer.createTransport> | null = null;
if (host && port && user && pass) {
  mailAgent = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });
}

export async function sendEmail({
  to,
  subject,
  html,
  from
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  if (!mailAgent) {
    console.warn("SMTP credentials missing; email not sent", to, subject);
    return null;
  }
  return mailAgent.sendMail({
    from: from ?? `"Proactivitis" <${user}>`,
    to,
    subject,
    html,
    replyTo: from ?? user,
    text: convert(html, {
      wordwrap: 130
    }),
    headers: {
      "X-Priority": "3",
      "X-Mailer": "Proactivitis CRM"
    }
  });
}
