const express = require("express");
const bodyParser = require("body-parser");
const { twiml } = require("twilio");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Root route
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// Voice route for Twilio calls
app.post("/voice", (req, res) => {
  const twimlResponse = new twiml.VoiceResponse();

  // What the AI says when someone calls
  twimlResponse.say("Hello! This is your AI assistant calling. How can I help you today?", {
    voice: "alice" // female voice, natural sounding
  });

  res.type("text/xml");
  res.send(twimlResponse.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
