import express from "express";
import QRCode from "qrcode";
import { clientState } from "../services/whatsapp.js";
import { errorResponse } from "../utils/helpers.js";

const router = express.Router();

// Get QR code (if waiting for scan)
router.get("/qr", async (req, res) => {
  if (clientState.status === "waiting_for_scan" && clientState.qrCode) {
    const format = req.query.format || "png"; // png, svg, dataurl, json

    try {
      switch (format) {
        case "json":
          // Return raw QR code string
          return res.json({
            qrCode: clientState.qrCode,
            status: "waiting_for_scan",
          });

        case "dataurl":
          // Return as data URL (base64 encoded image)
          const dataUrl = await QRCode.toDataURL(clientState.qrCode, {
            errorCorrectionLevel: "M",
            type: "image/png",
            quality: 0.92,
            margin: 1,
            width: 300,
          });
          return res.json({
            qrCode: dataUrl,
            status: "waiting_for_scan",
            format: "dataurl",
          });

        case "svg":
          // Return as SVG
          const svg = await QRCode.toString(clientState.qrCode, {
            type: "svg",
            errorCorrectionLevel: "M",
            margin: 1,
            width: 300,
          });
          res.setHeader("Content-Type", "image/svg+xml");
          return res.send(svg);

        case "png":
        default:
          // Return as PNG image (default)
          const pngBuffer = await QRCode.toBuffer(clientState.qrCode, {
            errorCorrectionLevel: "M",
            type: "image/png",
            quality: 0.92,
            margin: 1,
            width: 300,
          });
          res.setHeader("Content-Type", "image/png");
          return res.send(pngBuffer);
      }
    } catch (err) {
      console.error("Error generating QR code image:", err);
      return errorResponse(res, 500, "Failed to generate QR code image", {
        error: err.message,
      });
    }
  } else {
    return errorResponse(
      res,
      404,
      "QR code not available. Client may already be authenticated or not in waiting state."
    );
  }
});

export default router;

