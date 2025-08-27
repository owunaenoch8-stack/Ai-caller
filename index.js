// index.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { twiml: { VoiceResponse } } = require('twilio');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// TwiML route: Twilio will POST here when a call comes in
app.post('/voice', (req, res) => {
  const vr = new VoiceResponse();
  // IMPORTANT: replace domain below with your Render domain (already set)
  vr.start().stream({ url: 'wss://ai-caller-sgbu.onrender.com/twilio-ws' });
  vr.say({ voice: 'alice' }, 'Connecting to the AI assistant, please wait.');
  vr.pause({ length: 600 }); // keeps call open while streaming
  res.type('text/xml');
  res.send(vr.toString());
});

// health check
app.get('/', (req, res) => res.send('Server running'));

// create HTTP server so we can attach ws to same port
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/twilio-ws' });

wss.on('connection', (ws, req) => {
  console.log('Twilio MediaStream connected');

  // create unique file per connection for debug
  const filename = path.join(__dirname, `call_${Date.now()}_${Math.floor(Math.random()*1e6)}.pcm`);
  const writeStream = fs.createWriteStream(filename);
  console.log('Writing PCM to', filename);

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      // log event type
      if (msg.event) console.log('event:', msg.event);

      if (msg.event === 'connected') {
        console.log('Connected event payload:', msg);
      } else if (msg.event === 'start') {
        console.log('Stream start:', msg);
      } else if (msg.event === 'media') {
        // msg.media.payload is base64 PCM (s16le)
        const payload = msg.media && msg.media.payload;
        if (payload) {
          const audioBuffer = Buffer.from(payload, 'base64');
          writeStream.write(audioBuffer);
        }
      } else if (msg.event === 'stop') {
        console.log('Stream stopped for connection');
      } else if (msg.event === 'error') {
        console.error('MediaStream error', msg);
      }
    } catch (err) {
      console.error('Failed to parse message', err);
    }
  });

  ws.on('close', () => {
    console.log('MediaStream disconnected, closing file');
    writeStream.end();
  });

  ws.on('error', (err) => {
    console.error('WebSocket error', err);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Listening on ${PORT}`));
