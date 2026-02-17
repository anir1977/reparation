const express = require("express");
const cors = require("cors");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");

const PORT = process.env.PORT || 4001;

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

let isReady = false;

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: ".wwebjs_auth" }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  console.log("\nScan this QR code with WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  isReady = true;
  console.log("WhatsApp client ready.");
});

client.on("disconnected", () => {
  isReady = false;
  console.log("WhatsApp client disconnected.");
});

client.initialize();

function normalizePhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) {
    return digits.slice(2);
  }
  if (digits.startsWith("0") && digits.length === 10) {
    return `212${digits.slice(1)}`;
  }
  return digits;
}

app.get("/health", (_req, res) => {
  res.json({ ready: isReady });
});

app.post("/send", async (req, res) => {
  try {
    if (!isReady) {
      return res.status(503).json({ error: "WhatsApp client not ready." });
    }

    const { telephone, message } = req.body || {};
    if (!telephone || !message) {
      return res.status(400).json({ error: "Telephone and message are required." });
    }

    const phone = normalizePhone(telephone);
    if (!phone) {
      return res.status(400).json({ error: "Invalid phone number." });
    }

    const chatId = `${phone}@c.us`;
    await client.sendMessage(chatId, String(message));

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to send WhatsApp message." });
  }
});

app.listen(PORT, () => {
  console.log(`WhatsApp server listening on port ${PORT}`);
});
