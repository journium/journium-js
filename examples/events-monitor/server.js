const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = 3006;

app.use(express.json());
app.use(express.static('public'));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  clients.add(ws);
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

function broadcastEvent(eventData) {
  const message = JSON.stringify({
    timestamp: new Date().toISOString(),
    event: eventData
  });
  
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

app.get('/v1/configs', async  (req, res) => {
  const ingestion_key = req.query.ingestion_key;
  
  if (!ingestion_key) {
    return res.status(400).json({ error: 'ingestion_key query parameter is required' });
  }
  
  // Sample remote configuration - in production this would come from database
  const remoteConfig = {
    debug: true,
    flushAt: 5,
    flushInterval: 1000,
    autoTrackPageviews: true,
    autocapture: {
      captureClicks: true,
      captureFormSubmits: true,
      captureFormChanges: true,
      ignoreClasses: ['no-track', 'sensitive'],
      captureContentText: true
    }
  };
  
  console.log(`Config requested for ingestion_key: ${ingestion_key}`);
  // await new Promise(resolve => setTimeout(resolve, 5000));
  res.status(200).json({ 
    success: true,
    config: remoteConfig,
    tenant_id:"acme_corp",
    timestamp: new Date().toISOString()
  });
});

app.post('/v1/ingest_event', (req, res) => {
  try {
    const eventData = req.body;
    
    if (!eventData || Object.keys(eventData).length === 0) {
      return res.status(400).json({ error: 'Event data is required' });
    }
    
    console.log('Event received:', JSON.stringify(eventData, null, 2));
    
    broadcastEvent(eventData);
    
    res.status(200).json({ 
      message: 'Event ingested successfully', 
      timestamp: new Date().toISOString(),
      clientsNotified: clients.size
    });
  } catch (error) {
    console.error('Error processing event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
  console.log(`POST endpoint available at http://localhost:${PORT}/v1/ingest_event`);
});