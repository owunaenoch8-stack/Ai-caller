const express = require("express");
const { twiml } = require("twilio");

const app = express();
const PORT = process.env.PORT || 3000;

// Root route
app.get("/", (req, res) => {
  res.send("Server is running ✅ (root route)");
});

// Voice webhook route
app.post("/voice", (req, res) => {
  const response = new twiml.VoiceResponse();

  // Stream audio to your AI server
  const connect = response.connect();
  connect.stream({ url: "wss://your-ai-server-url/stream" });

  res.type("text/xml");
  res.send(response.toString());
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
