import express from "express";
import { setupClientEvents, initializeClient, destroyClient, clientState } from "./services/whatsapp.js";
import { errorResponse } from "./utils/helpers.js";

// Import routes
import healthRoutes from "./routes/health.js";
import qrRoutes from "./routes/qr.js";
import messagingRoutes from "./routes/messaging.js";
import webhookRoutes from "./routes/webhook.js";

// Configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const WEBHOOK_URL = process.env.WEBHOOK_URL || null;

// Initialize Express app
const app = express();
app.use(express.json({ limit: "10mb" }));

// Setup WhatsApp client events
setupClientEvents(WEBHOOK_URL);

// Initialize WhatsApp client
initializeClient();

// Register routes
app.use("/", healthRoutes);
app.use("/", qrRoutes);
app.use("/", messagingRoutes);
app.use("/", webhookRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  errorResponse(res, 500, "Internal server error", {
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  errorResponse(res, 404, "Endpoint not found", {
    path: req.path,
    method: req.method,
  });
});

/**
 * Graceful Shutdown
 */
const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/`);
  console.log(`📱 Status: http://${HOST}:${PORT}/status`);
});

// Handle graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  server.close(async () => {
    console.log("HTTP server closed");
    
    try {
      await destroyClient();
      process.exit(0);
    } catch (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
