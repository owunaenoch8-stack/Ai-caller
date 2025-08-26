const express = require('express');
const { twiml } = require('twilio');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));

// Route for Twilio Voice
app.post('/voice', (req, res) => {
  const twimlResponse = new twiml.VoiceResponse();
  twimlResponse.say("Hello, your Twilio number is working!");
  res.type('text/xml');
  res.send(twimlResponse.toString());
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
