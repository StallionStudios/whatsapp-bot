/**
 * Utility Functions
 */

/**
 * Format phone number to WhatsApp format
 * Supports various input formats and converts to international format
 */
export function formatPhoneNumber(number) {
  if (!number) return null;

  // Remove all non-digit characters
  let cleaned = number.replace(/\D/g, "");

  // Handle different formats
  if (cleaned.length === 10) {
    // 10 digits - assume Mexico format, add country code
    return `521${cleaned}`;
  } else if (cleaned.startsWith("52") && cleaned.length === 12) {
    // Already has Mexico country code
    return cleaned.replace("52", "521");
  } else if (cleaned.startsWith("1") && cleaned.length === 11) {
    // US/Canada format
    return cleaned;
  } else if (cleaned.length >= 10 && cleaned.length <= 15) {
    // International format
    return cleaned;
  }

  return null;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(number) {
  const formatted = formatPhoneNumber(number);
  return formatted !== null && formatted.length >= 10 && formatted.length <= 15;
}

/**
 * Validate message content
 */
export function validateMessage(text) {
  if (!text || typeof text !== "string") {
    return { valid: false, error: "Message text is required and must be a string" };
  }
  if (text.length === 0) {
    return { valid: false, error: "Message text cannot be empty" };
  }
  if (text.length > 4096) {
    return { valid: false, error: "Message text cannot exceed 4096 characters" };
  }
  return { valid: true };
}

/**
 * Error response helper
 */
export function errorResponse(res, statusCode, message, details = null) {
  const response = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  };
  if (details) {
    response.details = details;
  }
  return res.status(statusCode).json(response);
}

/**
 * Success response helper
 */
export function successResponse(res, data = null, statusCode = 200) {
  const response = {
    success: true,
    timestamp: new Date().toISOString(),
  };
  if (data) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
}

