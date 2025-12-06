import express from "express";
import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

const { Client, LocalAuth } = pkg;

const app = express();
const port = 3000;

app.use(express.json());

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
  },
});

/**
 * WhatsApp Events
 */
client.on("qr", (qr) => {
  console.log("📲 Scan this QR:");
  qrcode.generate(qr, { small: true });
});

client.once("ready", () => {
  console.log("✅ WhatsApp client ready!");
});

client.on("message_create", (message) => {
  console.log("📩 Received:", message.body);
});

/**
 * Start WhatsApp
 */
client.initialize();

/**
 * Routes
 */
app.get("/", (req, res) => {
  res.send("Hello from Express + WhatsApp 🚀");
});

app.post("/send", async (req, res) => {
  const { number, text } = req.body;

  if (!number || !text) {
    return res.status(400).json({ ok: false, error: "Missing 'number' or 'text' in request body" });
  }
  let formattedNumber = number.replace("+52", "521");
  if(number.length === 10) {
    formattedNumber = `521${number}`;
  }

  try {
    await client.sendMessage(`${formattedNumber}@c.us`, text);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.json({ ok: false, error: err.message });
  }
});

/**
 * Start server
 */
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server running http://0.0.0.0:${port}`);
});
