// index.js
const express = require('express');
const app = express();

// parse application/x-www-form-urlencoded (what Twilio sends)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// GET so a browser shows something instead of "Cannot GET /voice"
app.get('/voice', (req, res) => {
  res.send('Voice endpoint is alive. Twilio should POST here.');
});

// POST — Twilio will call this. Respond with TwiML (XML)
app.post('/voice', (req, res) => {
  // Simple TwiML response (no twilio SDK required)
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
  <Response>
    <Say voice="alice">Hello — your Render app received the request. Goodbye.</Say>
  </Response>`;

  res.type('text/xml'); // important
  res.send(twiml);
});

// Listen on the port Render gives you
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
