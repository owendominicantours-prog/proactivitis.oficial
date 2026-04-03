import nodemailer from "nodemailer";
import { convert } from "html-to-text";

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
  from
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  const agent = getMailAgent();
  if (!agent) {
    console.warn("SMTP credentials missing; email not sent", to, subject);
    return null;
  }
  const payload = {
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
