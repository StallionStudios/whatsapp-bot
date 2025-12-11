# WhatsApp Bot API

A robust WhatsApp bot API built with Express.js and whatsapp-web.js, providing a RESTful interface for sending messages and managing WhatsApp interactions.

## Features

- ✅ **Send Text Messages** - Send text messages to any WhatsApp number
- ✅ **Send Media Messages** - Send images, documents, and other media files
- ✅ **Webhook Support** - Receive incoming message notifications via webhooks
- ✅ **Health Monitoring** - Health check and status endpoints
- ✅ **Error Handling** - Comprehensive error handling with proper HTTP status codes
- ✅ **Input Validation** - Phone number and message validation
- ✅ **Client Status Management** - Real-time client status tracking
- ✅ **Graceful Shutdown** - Proper cleanup on server shutdown
- ✅ **QR Code Endpoint** - Retrieve QR code for authentication

## Prerequisites

- Node.js 20 or higher
- Docker (optional, for containerized deployment)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

## Configuration

The API can be configured using environment variables:

- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)
- `WEBHOOK_URL` - URL to receive incoming message webhooks (optional)

Example:

```bash
PORT=3000 HOST=0.0.0.0 WEBHOOK_URL=https://your-webhook-url.com/webhook npm start
```

## API Endpoints

### Health & Status

#### `GET /`

Get service information and basic status.

**Response:**

```json
{
  "service": "WhatsApp Bot API",
  "version": "1.0.0",
  "status": "running",
  "client": {
    "status": "ready",
    "ready": true
  }
}
```

#### `GET /health`

Health check endpoint. Returns 200 if healthy, 503 if degraded.

**Response:**

```json
{
  "status": "healthy",
  "client": {
    "status": "ready",
    "ready": true
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /status`

Get detailed WhatsApp client status.

**Response:**

```json
{
  "status": "ready",
  "ready": true,
  "qrCode": null,
  "error": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Status Values:**

- `initializing` - Client is starting up
- `waiting_for_scan` - Waiting for QR code scan
- `authenticated` - Authenticated but not ready
- `ready` - Ready to send messages
- `disconnected` - Client disconnected
- `auth_failure` - Authentication failed
- `error` - Error state

#### `GET /qr`

Get QR code for authentication (only available when status is `waiting_for_scan`).

**Query Parameters:**

- `format` (optional) - Output format: `png` (default), `svg`, `dataurl`, or `json`

**Formats:**

- `png` (default) - Returns PNG image (Content-Type: `image/png`)
- `svg` - Returns SVG image (Content-Type: `image/svg+xml`)
- `dataurl` - Returns JSON with base64 data URL
- `json` - Returns raw QR code string in JSON

**Examples:**

Get PNG image (default):

```bash
curl http://localhost:3000/qr --output qr.png
```

Get SVG:

```bash
curl "http://localhost:3000/qr?format=svg" --output qr.svg
```

Get data URL (for embedding in HTML):

```bash
curl "http://localhost:3000/qr?format=dataurl"
```

**Response (dataurl format):**

```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "status": "waiting_for_scan",
  "format": "dataurl"
}
```

**Response (json format):**

```json
{
  "qrCode": "QR_CODE_STRING",
  "status": "waiting_for_scan"
}
```

**Note:** When using `png` or `svg` format, the response is a binary image file, not JSON.

### Messaging

#### `POST /send`

Send a text message to a WhatsApp number.

**Request Body:**

```json
{
  "number": "1234567890",
  "text": "Hello, World!"
}
```

**Phone Number Formats Supported:**

- 10 digits: `1234567890` (assumes Mexico format, adds 521 prefix)
- With country code: `521234567890`
- International: `+521234567890` or `521234567890`

**Response (Success):**

```json
{
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "messageId": "true_1234567890@c.us_ABC123",
    "to": "521234567890@c.us",
    "timestamp": 1704067200
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "WhatsApp client is not ready",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "details": {
    "status": "initializing"
  }
}
```

#### `POST /send-media`

Send a media message (image, document, etc.) to a WhatsApp number.

**Request Body (URL):**

```json
{
  "number": "1234567890",
  "media": {
    "url": "https://example.com/image.jpg"
  },
  "caption": "Optional caption text"
}
```

**Request Body (Base64):**

```json
{
  "number": "1234567890",
  "media": {
    "base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "mimetype": "image/jpeg",
    "filename": "image.jpg"
  },
  "caption": "Optional caption text"
}
```

**Response (Success):**

```json
{
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "messageId": "true_1234567890@c.us_ABC123",
    "to": "521234567890@c.us",
    "timestamp": 1704067200,
    "type": "image"
  }
}
```

### Webhooks

#### `POST /webhook`

Configure webhook URL for incoming messages (optional, can also be set via `WEBHOOK_URL` env var).

**Request Body:**

```json
{
  "url": "https://your-webhook-url.com/webhook"
}
```

**Webhook Payload (Incoming Messages):**
When a message is received, the configured webhook URL will receive a POST request with:

```json
{
  "event": "message",
  "from": "521234567890@c.us",
  "to": "5210987654321@c.us",
  "body": "Hello!",
  "type": "chat",
  "timestamp": 1704067200,
  "isGroup": false,
  "contact": {
    "name": "John Doe",
    "number": "1234567890"
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "details": {
    "additional": "error details"
  }
}
```

**HTTP Status Codes:**

- `200` - Success
- `400` - Bad Request (validation errors)
- `403` - Forbidden (not authorized)
- `404` - Not Found (phone number not on WhatsApp)
- `500` - Internal Server Error
- `503` - Service Unavailable (client not ready)

## Docker Deployment

Build and run with Docker Compose:

```bash
docker-compose up -d whatsapp-bot
```

The Dockerfile includes all necessary dependencies including Chromium for Puppeteer.

## Usage Examples

### Send a text message:

```bash
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{
    "number": "1234567890",
    "text": "Hello from WhatsApp Bot!"
  }'
```

### Send an image from URL:

```bash
curl -X POST http://localhost:3000/send-media \
  -H "Content-Type: application/json" \
  -d '{
    "number": "1234567890",
    "media": {
      "url": "https://example.com/image.jpg"
    },
    "caption": "Check out this image!"
  }'
```

### Check health:

```bash
curl http://localhost:3000/health
```

### Get client status:

```bash
curl http://localhost:3000/status
```

## Security Considerations

- The API currently has no authentication. Consider adding API key authentication for production use.
- WhatsApp Web.js stores authentication data locally. Ensure proper file permissions.
- Webhook URLs should use HTTPS in production.
- Consider implementing rate limiting for production deployments.

## Troubleshooting

### Client not ready

- Check the `/status` endpoint to see the current state
- If status is `waiting_for_scan`, scan the QR code from `/qr` endpoint
- If status is `disconnected`, restart the service

### Messages not sending

- Verify the phone number format is correct
- Ensure the recipient has your number saved (for some cases)
- Check that the WhatsApp client status is `ready`

### Authentication issues

- Delete `.wwebjs_auth` and `.wwebjs_cache` directories to re-authenticate
- Check logs for authentication errors

## License

Private
