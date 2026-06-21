import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_APP_PASSWORD!,
  },
});

export interface InviteEmailPayload {
  to: string;
  splitName: string;
  share: number; // percentage e.g. 40
  inviteLink: string;
}

export async function sendInviteEmail(payload: InviteEmailPayload) {
  const { to, splitName, share, inviteLink } = payload;

  await transporter.sendMail({
    from: `"Slyce" <${process.env.GMAIL_USER}>`,
    to,
    subject: `You've been offered a ${share}% deal — ${splitName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8f4f0; margin: 0; padding: 40px 20px; }
            .card { background: #fff; border-radius: 16px; max-width: 480px; margin: 0 auto; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
            .logo { font-size: 22px; font-weight: 700; color: #201f24; margin-bottom: 32px; }
            h1 { font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 12px; }
            p { color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
            .share-badge { display: inline-block; background: #f0faf8; border: 1.5px solid #3e9b8f; color: #2E7D6E; font-size: 28px; font-weight: 700; border-radius: 12px; padding: 12px 28px; margin-bottom: 28px; }
            .btn { display: inline-block; background: #201f24; color: #fff; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 10px; padding: 14px 32px; margin-bottom: 28px; }
            .footer { font-size: 12px; color: #9ca3af; margin-top: 32px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">Slyce</div>
            <h1>You've been added to a collaboration</h1>
            <p>
              <strong>${splitName}</strong> — you've been offered a guaranteed cut of future earnings, locked on-chain before any work begins.
            </p>
            <div class="share-badge">${share}% agreed cut</div>
            <br />
            <a href="${inviteLink}" class="btn">Review & Confirm Your Cut</a>
            <p style="font-size:13px">
              This link is unique to you and contains your one-time confirmation code. Do not share it.
            </p>
            <div class="footer">
              Powered by Slyce — deferred collaboration protocol on Sui.<br/>
              If you weren't expecting this, you can safely ignore this email.
            </div>
          </div>
        </body>
      </html>
    `,
  });
}
