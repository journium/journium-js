# Journium Events Monitor

A simple Node.js server that mocks a real event ingestion server for Journium SDK demos. It provides a POST API to ingest events and broadcasts them to connected WebSocket clients in real-time, allowing you to see the events being tracked by the Journium SDK samples.

## Purpose

This server is specifically designed to work with the Journium SDK examples:
- **React Sample**: Configured to send events to `http://localhost:3001`
- **Next.js Sample**: Can be configured to send events to this server
- **Real-time Monitoring**: See exactly what events are being tracked as you interact with the demo applications

## Features

- **POST API**: `/ingest_event` endpoint to receive JSON events from Journium SDK
- **WebSocket Broadcasting**: Real-time event distribution to connected clients
- **Web UI**: Built-in dashboard to monitor events with timestamps and formatting
- **Test Interface**: Send test events directly from the UI
- **CORS Enabled**: Allows requests from demo applications running on different ports

## Quick Start

### 1. Start the Events Monitor (from workspace root)
```bash
pnpm --filter journium-events-monitor start
```

### 2. Start a Demo Application
In another terminal:
```bash
# For React sample
pnpm --filter journium-react-sample start

# OR for Next.js sample (after configuring it)
pnpm --filter journium-nextjs-sample dev
```

The events monitor will be available at `http://localhost:3001`

### 3. Access the Web UI
Open your browser and navigate to:
```
http://localhost:3001
```

### 4. Interact with Demo Apps
Once both the events monitor and a demo application are running:
1. Open the demo app (usually at `http://localhost:3000`)
2. Click buttons, fill forms, navigate pages
3. Watch the events appear in real-time on the events monitor dashboard

## API Usage

### Ingest Events (Used by Journium SDK)
The Journium SDK automatically sends POST requests to the `/ingest_event` endpoint:

```bash
curl -X POST http://localhost:3001/ingest_event \
  -H "Content-Type: application/json" \
  -d '{"event": "button_clicked", "properties": {"button_text": "Track Event", "click_count": 1}}'
```

**Response:**
```json
{
  "message": "Event ingested successfully",
  "timestamp": "2025-11-08T10:30:00.000Z",
  "clientsNotified": 1
}
```

### Example Journium Event Payloads

These are the types of events you'll see from the Journium SDK samples:

**Custom Button Click:**
```json
{
  "event": "button_clicked",
  "properties": {
    "button_text": "Track Event",
    "click_count": 3,
    "timestamp": "2025-11-08T10:30:00.000Z"
  },
  "timestamp": 1699440600000,
  "distinct_id": "user_123",
  "session_id": "session_456"
}
```

**E-commerce Purchase:**
```json
{
  "event": "purchase_completed",
  "properties": {
    "product_id": "sample_product_123",
    "price": 29.99,
    "currency": "USD",
    "quantity": 1,
    "category": "electronics"
  },
  "timestamp": 1699440600000,
  "distinct_id": "user_123",
  "session_id": "session_456"
}
```

**Pageview Event:**
```json
{
  "event": "$pageview",
  "properties": {
    "$current_url": "http://localhost:3000/",
    "$host": "localhost:3000",
    "$pathname": "/",
    "$title": "Journium React Sample",
    "page": "home",
    "framework": "react"
  },
  "timestamp": 1699440600000
}
```

**Form Interaction:**
```json
{
  "event": "form_field_updated", 
  "properties": {
    "field_name": "email",
    "field_value_length": 15,
    "form_type": "contact",
    "page": "about"
  },
  "timestamp": 1699440600000
}
```

## WebSocket Connection

Connect to WebSocket for real-time events:
```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Event received:', data);
};
```

**WebSocket Message Format:**
```json
{
  "timestamp": "2025-10-14T10:30:00.000Z",
  "event": {
    "message": "Hello World",
    "type": "test",
    "value": 42
  }
}
```

## Integration with Journium SDK

### React Sample Configuration
The React sample is already configured to use this events monitor:

```typescript
// examples/react-sample/src/App.tsx
const journiumConfig = {
  applicationKey: 'demo-api-key',
  apiHost: 'http://localhost:3001',  // Points to events monitor
  debug: true,
  flushAt: 10,
  flushInterval: 30000
};
```

### Next.js Sample Configuration
To configure the Next.js sample to use this monitor, update the configuration:

```typescript
// examples/nextjs-sample/pages/_app.tsx
const journiumConfig = {
  applicationKey: 'demo-api-key',
  apiHost: 'http://localhost:3001',  // Add this line
  debug: true,
  flushAt: 10,
  flushInterval: 30000
};
```

## File Structure

```
examples/events-monitor/
├── package.json          # Dependencies and scripts  
├── server.js             # Main Express server with WebSocket
├── public/
│   └── index.html        # Web UI dashboard with real-time monitoring
└── README.md            # This documentation
```

## Workspace Integration

This package is part of the Journium monorepo workspace:
- **Package Name**: `journium-events-monitor`
- **Workspace Filter**: `pnpm --filter journium-events-monitor [command]`
- **Dependencies**: Managed by pnpm workspace
- **Development**: Run alongside other workspace packages

### Available Commands
```bash
# Start the events monitor
pnpm --filter journium-events-monitor start

# Install dependencies for all workspace packages
pnpm install

# Build all SDK packages before running examples
pnpm build
```

## Development

### Configuration
- **Port**: 3001 (hardcoded for demo purposes)
- **Max Events**: UI displays last 100 events
- **Auto-reconnect**: WebSocket clients automatically reconnect on disconnect
- **CORS**: Enabled for all origins (development only)

### Logs
The server logs all incoming events and WebSocket connections:
```
Server running on http://localhost:3001
WebSocket server running on ws://localhost:3001
POST endpoint available at http://localhost:3001/ingest_event
Event received: { event: 'button_clicked', properties: {...} }
New WebSocket client connected
```

### Error Handling
- Invalid JSON payloads return 400 Bad Request
- Empty payloads return 400 Bad Request  
- Server errors return 500 Internal Server Error
- WebSocket connection errors are logged and clients reconnect automatically

## Testing the Integration

### Complete Demo Workflow
1. **Start Events Monitor**:
   ```bash
   pnpm --filter journium-events-monitor start
   ```

2. **Start React Sample** (in another terminal):
   ```bash
   pnpm --filter journium-react-sample start
   ```

3. **Open Both Applications**:
   - Events Monitor: `http://localhost:3001`
   - React Sample: `http://localhost:3000`

4. **Test Event Tracking**:
   - Arrange windows side by side
   - Click buttons in React sample
   - Watch events appear in real-time on events monitor
   - See event details, timestamps, and properties

### Manual Testing
Send test events using the built-in UI or curl:

```bash
# Test the endpoint directly
curl -X POST http://localhost:3001/ingest_event \
  -H "Content-Type: application/json" \
  -d '{"event": "test_event", "properties": {"source": "manual_test"}}'

# Simulate Journium SDK event format
curl -X POST http://localhost:3001/ingest_event \
  -H "Content-Type: application/json" \
  -d '{
    "event": "user_signup",
    "properties": {
      "signup_method": "email",
      "source": "demo_app",
      "user_type": "trial"
    },
    "timestamp": 1699440600000,
    "distinct_id": "user_123",
    "session_id": "session_456"
  }'
```

This events monitor provides a complete solution for visualizing and debugging Journium SDK event tracking in development environments.