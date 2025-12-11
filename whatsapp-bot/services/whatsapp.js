import pkg from "whatsapp-web.js";
import qrcodeTerminal from "qrcode-terminal";

const { Client, LocalAuth } = pkg;

// Client state management
export const clientState = {
  status: "initializing",
  qrCode: null,
  ready: false,
  error: null,
};

// Initialize WhatsApp Client
export const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
  },
});

/**
 * Setup WhatsApp Client Event Handlers
 */
export function setupClientEvents(webhookUrl = null) {
  client.on("qr", (qr) => {
    console.log("📲 QR Code generated. Scan with WhatsApp:");
    qrcodeTerminal.generate(qr, { small: true });
    clientState.qrCode = qr;
    clientState.status = "waiting_for_scan";
  });

  client.once("ready", () => {
    console.log("✅ WhatsApp client is ready!");
    clientState.status = "ready";
    clientState.ready = true;
    clientState.qrCode = null;
    clientState.error = null;
  });

  client.on("authenticated", () => {
    console.log("🔐 WhatsApp client authenticated");
    clientState.status = "authenticated";
  });

  client.on("auth_failure", (msg) => {
    console.error("❌ Authentication failed:", msg);
    clientState.status = "auth_failure";
    clientState.error = msg;
  });

  client.on("disconnected", (reason) => {
    console.log("⚠️ WhatsApp client disconnected:", reason);
    clientState.status = "disconnected";
    clientState.ready = false;
  });

//   client.on("message_create", async (message) => {
//     console.log("📩 Received message:", {
//       from: message.from,
//       body: message.body,
//       type: message.type,
//       timestamp: message.timestamp,
//     });

//     // Send webhook if configured
//     if (webhookUrl && message.from !== "status@broadcast") {
//       try {
//         const response = await fetch(webhookUrl, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             event: "message",
//             from: message.from,
//             to: message.to,
//             body: message.body,
//             type: message.type,
//             timestamp: message.timestamp,
//             isGroup: message.from.includes("@g.us"),
//             contact: message.contact ? {
//               name: message.contact.pushname,
//               number: message.contact.number,
//             } : null,
//           }),
//         });

//         if (!response.ok) {
//           console.error("Webhook failed:", response.statusText);
//         }
//       } catch (error) {
//         console.error("Webhook error:", error.message);
//       }
//     }
//   });
}

/**
 * Initialize WhatsApp client
 */
export function initializeClient() {
  client.initialize().catch((err) => {
    console.error("Failed to initialize WhatsApp client:", err);
    clientState.status = "error";
    clientState.error = err.message;
  });
}

/**
 * Destroy WhatsApp client
 */
export async function destroyClient() {
  if (clientState.ready) {
    await client.destroy();
    console.log("WhatsApp client destroyed");
  }
}

