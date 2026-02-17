import express from "express";
import qrcode from "qrcode-terminal";
import { Client, LocalAuth } from "whatsapp-web.js";

const PORT = process.env.WHATSAPP_BOT_PORT || 3333;

const app = express();
app.use(express.json());

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  console.log("Scan this QR code with WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("WhatsApp client is ready.");
});

client.on("auth_failure", (msg) => {
  console.error("Auth failure:", msg);
});

client.initialize();

app.post("/send", async (req, res) => {
  try {
    const { telephone, message } = req.body || {};
    if (!telephone || !message) {
      return res.status(400).json({ error: "telephone and message required" });
    }

    const normalized = telephone.replace(/\D/g, "");
    if (!normalized) {
      return res.status(400).json({ error: "invalid telephone" });
    }

    const chatId = `${normalized}@c.us`;
    await client.sendMessage(chatId, message);
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "send failed" });
  }
});

app.listen(PORT, () => {
  console.log(`WhatsApp bot server running on :${PORT}`);
});
