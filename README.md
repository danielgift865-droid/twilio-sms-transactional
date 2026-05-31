# Twilio SMS Transactional Alert System

A production-grade SMS transactional alert system with two-way conversation management, built with Node.js, Express, Twilio, Prisma, and BullMQ.

## Features

- 📤 **Outbound SMS** — single, bulk, and template-based sending
- 📥 **Inbound SMS** — receive and handle two-way conversations via Twilio webhooks
- 📋 **Contact Management** — CRUD + opt-out/opt-in handling
- 🗂️ **Message Templates** — reusable templates with variable interpolation
- 💬 **Conversation Threading** — track two-way message history per contact
- 📊 **Delivery Tracking** — real-time status updates (queued → sent → delivered/failed)
- 🔁 **Retry Logic** — automatic retry with exponential backoff (up to 3 attempts)
- 🔒 **Security** — Twilio signature validation, API key auth, rate limiting
- 🐳 **Docker** — fully containerized with Docker Compose

## Quick Start

### 1. Clone & Configure

```bash
cp .env.example .env
# Fill in your Twilio credentials and database URL
```

### 2. Run with Docker

```bash
docker-compose up -d
# Run migrations
docker-compose exec app npx prisma migrate deploy
```

### 3. Run locally (development)

```bash
npm install
npx prisma migrate dev
npm run dev        # Start API server
npm run worker     # Start BullMQ worker (separate terminal)
```

## API Usage

### Send a single SMS

```bash
curl -X POST http://localhost:3000/api/sms/send \
  -H "x-api-key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"to": "+2348012345678", "body": "Your order #1234 has been confirmed!", "contactId": "uuid-here"}'
```

### Send via template

```bash
curl -X POST http://localhost:3000/api/sms/send-template \
  -H "x-api-key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"contactId": "uuid", "templateName": "order_confirmation", "variables": {"name": "Daniel", "orderId": "1234"}}'
```

### Create a contact

```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "x-api-key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+2348012345678", "fullName": "Daniel"}'
```

## Twilio Webhook Setup

1. Go to [Twilio Console](https://console.twilio.com) → Messaging → Phone Numbers
2. Select your number → Messaging Configuration
3. Set **"A Message Comes In"** → Webhook → POST → `https://yourdomain.com/webhooks/twilio/inbound`
4. Set **Status Callback** → `https://yourdomain.com/webhooks/twilio/status`

> Use [ngrok](https://ngrok.com) for local development: `ngrok http 3000`

## Environment Variables

| Variable | Description |
|---|---|
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number (E.164) |
| `TWILIO_WEBHOOK_URL` | Public URL for inbound webhook |
| `TWILIO_STATUS_CALLBACK` | Public URL for status callbacks |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `API_KEY` | Your API key for securing endpoints |
| `PORT` | Server port (default: 3000) |

## License

MIT
