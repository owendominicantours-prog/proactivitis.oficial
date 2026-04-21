const emailShell = ({
  title,
  intro,
  requesterName,
  requesterEmail,
  message,
  conversationUrl
}: {
  title: string;
  intro: string;
  requesterName: string;
  requesterEmail: string;
  message: string;
  conversationUrl?: string;
}) => `
  <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;">
      <div style="background:#0f172a;padding:24px;color:#ffffff;">
        <p style="margin:0;font-size:12px;letter-spacing:0.25em;text-transform:uppercase;color:#93c5fd;">Proactivitis</p>
        <h1 style="margin:8px 0 0;font-size:24px;">${title}</h1>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#334155;">${intro}</p>
        <div style="border:1px solid #e2e8f0;border-radius:16px;padding:16px;background:#f8fafc;">
          <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.2em;color:#64748b;">Cliente</p>
          <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#0f172a;">${requesterName}</p>
          <p style="margin:0;font-size:14px;color:#475569;">${requesterEmail}</p>
        </div>
        <div style="margin-top:16px;border:1px solid #e2e8f0;border-radius:16px;padding:16px;background:#ffffff;">
          <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.2em;color:#64748b;">Mensaje</p>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#0f172a;white-space:pre-wrap;">${message}</p>
        </div>
        ${
          conversationUrl
            ? `<a href="${conversationUrl}" style="display:inline-block;margin-top:20px;padding:12px 20px;border-radius:999px;background:#0f172a;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;">Abrir chat</a>`
            : ""
        }
      </div>
    </div>
  </div>
`;

export const buildSupportChatOpenedAdminEmail = ({
  requesterName,
  requesterEmail,
  message,
  conversationUrl
}: {
  requesterName: string;
  requesterEmail: string;
  message: string;
  conversationUrl?: string;
}) =>
  emailShell({
    title: "Nuevo chat de soporte",
    intro: "Un cliente abrio un chat nuevo desde el centro de ayuda de Proactivitis.",
    requesterName,
    requesterEmail,
    message,
    conversationUrl
  });

export const buildSupportChatReplyAdminEmail = ({
  requesterName,
  requesterEmail,
  message,
  conversationUrl
}: {
  requesterName: string;
  requesterEmail: string;
  message: string;
  conversationUrl?: string;
}) =>
  emailShell({
    title: "Nuevo mensaje en chat de soporte",
    intro: "Un cliente escribio un nuevo mensaje en una conversacion de soporte.",
    requesterName,
    requesterEmail,
    message,
    conversationUrl
  });
