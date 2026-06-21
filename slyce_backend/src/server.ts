import express from "express";
import cors from "cors";
import { sendInviteEmail } from "./mailer.js";

const app = express();
const PORT = process.env.EMAIL_PORT || 3001;

app.use(cors());
app.use(express.json());

interface InviteBody {
  recipients: {
    email: string;
    share: number;
    passcode: string;
  }[];
  splitId: string;
  splitName: string;
  appUrl?: string;
}

app.post("/api/invite", async (req, res) => {
  const { recipients, splitId, splitName, appUrl } = req.body as InviteBody;

  if (!recipients || !splitId || !splitName) {
    res.status(400).json({ error: "Missing required fields." });
    return;
  }

  const baseUrl = appUrl || process.env.APP_URL || "http://localhost:5173";
  const errors: string[] = [];
  const sent: string[] = [];

  for (const r of recipients) {
    if (!r.email || !r.passcode) continue;
    const inviteLink = `${baseUrl}/confirm/${splitId}?code=${r.passcode}`;
    try {
      await sendInviteEmail({
        to: r.email,
        splitName,
        share: r.share,
        inviteLink,
      });
      sent.push(r.email);
      console.log(`[Email] Sent invite to ${r.email} for split ${splitId}`);
    } catch (err: any) {
      console.error(`[Email] Failed to send to ${r.email}:`, err.message, err.code, err.response);
      errors.push(r.email);
    }
  }

  res.json({
    success: errors.length === 0,
    sent,
    failed: errors,
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export function startEmailServer() {
  app.listen(PORT, () => {
    console.log(`[Email Server] Running on http://localhost:${PORT}`);
  });
}
