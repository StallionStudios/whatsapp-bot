import express from "express";
import { clientState } from "../services/whatsapp.js";

const router = express.Router();

// Root endpoint - service info
router.get("/", (req, res) => {
  res.json({
    service: "WhatsApp Bot API",
    version: "1.0.0",
    status: "running",
    client: {
      status: clientState.status,
      ready: clientState.ready,
    },
  });
});

// Get client status
router.get("/status", (req, res) => {
  res.json({
    status: clientState.status,
    ready: clientState.ready,
    qrCode: clientState.qrCode,
    error: clientState.error,
    timestamp: new Date().toISOString(),
  });
});

export default router;

