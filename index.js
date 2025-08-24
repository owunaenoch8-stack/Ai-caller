const express = require("express");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");

const app = express();
const server = createServer(app);

app.get("/", (req, res) => res.send("Server is running ✅"));

const wss = new WebSocketServer({ server, path: "/twilio-stream" });

wss.on("connection", (ws) => {
  console.log("✅ Twilio connected");

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.event === "start") {
        console.log("▶️ Call started:", msg.start.callSid);
      } else if (msg.event === "media") {
        // audio chunk comes here
      } else if (msg.event === "stop") {
        console.log("⏹️ Call ended");
      }
    } catch (e) {
      console.log("Raw:", data.toString());
    }
  });

  ws.on("close", () => console.log("❌ Twilio disconnected"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
