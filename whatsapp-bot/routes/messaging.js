import express from "express";
// import { MessageMedia } from "whatsapp-web.js";
import { client, clientState } from "../services/whatsapp.js";
import {
  formatPhoneNumber,
  isValidPhoneNumber,
  validateMessage,
  errorResponse,
  successResponse,
} from "../utils/helpers.js";

const router = express.Router();

// Send text message
router.post("/send", async (req, res) => {
  // Check if client is ready
  if (!clientState.ready) {
    return errorResponse(
      res,
      503,
      "WhatsApp client is not ready",
      { status: clientState.status }
    );
  }

  // Validate input
  const { phoneNumber, message } = req.body;

  if (!phoneNumber) {
    return errorResponse(res, 400, "Missing 'phoneNumber' in request body");
  }

  if (!message) {
    return errorResponse(res, 400, "Missing 'message' in request body");
  }

  // Validate phone number
  if (!isValidPhoneNumber(phoneNumber)) {
    return errorResponse(
      res,
      400,
      "Invalid phone number format",
      { provided: phoneNumber }
    );
  }

  // Validate message
  const messageValidation = validateMessage(message);
  if (!messageValidation.valid) {
    return errorResponse(res, 400, messageValidation.error);
  }

  // Format phone number
  const formattedNumber = formatPhoneNumber(phoneNumber);
  const chatId = `${formattedNumber}@c.us`;

  try {
    const sentMessage = await client.sendMessage(chatId, message);
    successResponse(res, {
      messageId: sentMessage.id._serialized,
      to: chatId,
      timestamp: sentMessage.timestamp,
    });
  } catch (err) {
    console.error("Send message error:", err);
    
    // Handle specific error types
    if (err.message.includes("not found")) {
      return errorResponse(res, 404, "Phone number not found on WhatsApp", {
        phoneNumber: formattedNumber,
      });
    } else if (err.message.includes("not authorized")) {
      return errorResponse(res, 403, "Not authorized to send message", {
        phoneNumber: formattedNumber,
      });
    } else {
      return errorResponse(res, 500, "Failed to send message", {
        error: err.message,
      });
    }
  }
});

// Send media message
// router.post("/send-media", async (req, res) => {
//   // Check if client is ready
//   if (!clientState.ready) {
//     return errorResponse(
//       res,
//       503,
//       "WhatsApp client is not ready",
//       { status: clientState.status }
//     );
//   }

//   const { phoneNumber, media, caption } = req.body;

//   if (!phoneNumber) {
//     return errorResponse(res, 400, "Missing 'phoneNumber' in request body");
//   }

//   if (!media) {
//     return errorResponse(res, 400, "Missing 'media' in request body. Provide 'url' or 'base64' with 'mimetype'");
//   }

//   // Validate phone number
//   if (!isValidPhoneNumber(phoneNumber)) {
//     return errorResponse(
//       res,
//       400,
//       "Invalid phone number format",
//       { provided: phoneNumber }
//     );
//   }

//   // Validate caption if provided
//   if (caption) {
//     const captionValidation = validateMessage(caption);
//     if (!captionValidation.valid) {
//       return errorResponse(res, 400, `Invalid caption: ${captionValidation.error}`);
//     }
//   }

//   const formattedNumber = formatPhoneNumber(phoneNumber);
//   const chatId = `${formattedNumber}@c.us`;

//   try {
//     let messageMedia;

//     // Handle different media input formats
//     if (media.url) {
//       // Download from URL
//       messageMedia = await MessageMedia.fromUrl(media.url);
//     } else if (media.base64 && media.mimetype) {
//       // Base64 encoded media
//       messageMedia = new MessageMedia(media.mimetype, media.base64, media.filename || null);
//     } else {
//       return errorResponse(
//         res,
//         400,
//         "Invalid media format. Provide 'url' or 'base64' with 'mimetype'"
//       );
//     }

//     const sentMessage = await client.sendMessage(chatId, messageMedia, { caption: caption || "" });
    
//     successResponse(res, {
//       messageId: sentMessage.id._serialized,
//       to: formattedNumber,
//       timestamp: sentMessage.timestamp,
//     });
//   } catch (err) {
//     console.error("Send media error:", err);
    
//     if (err.message.includes("not found")) {
//       return errorResponse(res, 404, "Phone number not found on WhatsApp", {
//         phoneNumber: formattedNumber,
//       });
//     } else if (err.message.includes("not authorized")) {
//       return errorResponse(res, 403, "Not authorized to send message", {
//         phoneNumber: formattedNumber,
//       });
//     } else {
//       return errorResponse(res, 500, "Failed to send media", {
//         error: err.message,
//       });
//     }
//   }
// });

export default router;

