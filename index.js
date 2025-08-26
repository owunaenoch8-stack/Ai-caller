const express = require("express");
const bodyParser = require("body-parser");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const { twiml } = require("twilio");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// --- Root check
app.get("/", (req, res) => {
  res.send("Server is running ✅ (root route)");
});

// --- Twilio will hit this when a call starts
app.post("/voice", (req, res) => {
  const VoiceResponse = new twiml.VoiceResponse();

  // IMPORTANT: change this to YOUR Render domain
  const streamUrl = "wss://ai-caller-sgbu.onrender.com/media-stream";

  const connect = VoiceResponse.connect();
  connect.stream({ url: streamUrl });

  res.type("text/xml");
  res.send(VoiceResponse.toString());
});

// --- Create HTTP server and WebSocket for Twilio Media Streams
const server = createServer(app);

// WebSocket endpoint Twilio <Stream> will connect to
const wss = new WebSocketServer({ server, path: "/media-stream" });

wss.on("connection", (ws) => {
  console.log("✅ Twilio media stream connected");

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());

      if (data.event === "start") {
        console.log("▶️ Stream started. Call SID:", data.start.callSid);
      } else if (data.event === "media") {
        // audio frames arrive here in base64 (data.media.payload)
        // we'll plug AI here next
      } else if (data.event === "stop") {
        console.log("⏹️ Stream stopped");
      }
    } catch (e) {
      console.log("Received non-JSON message:", msg.toString());
    }
  });

  ws.on("close", () => console.log("❌ Twilio stream disconnected"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
