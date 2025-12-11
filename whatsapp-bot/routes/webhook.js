import express from "express";
import { errorResponse, successResponse } from "../utils/helpers.js";

const router = express.Router();

// Webhook configuration endpoint
router.post("/webhook", (req, res) => {
  const { url } = req.body;
  
  if (!url || typeof url !== "string") {
    return errorResponse(res, 400, "Missing or invalid 'url' in request body");
  }

  // Validate URL format
  try {
    new URL(url);
    // In a real implementation, you'd save this to a database or config
    console.log("Webhook URL configured:", url);
    successResponse(res, { webhookUrl: url, message: "Webhook URL configured" });
  } catch (err) {
    return errorResponse(res, 400, "Invalid URL format");
  }
});

export default router;

