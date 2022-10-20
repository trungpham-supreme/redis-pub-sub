const express = require("express");
const app = express();
const redis = require("redis");
const subscribe = redis.createClient();

subscribe.subscribe("requestNodeA");
subscribe.on("message", (channel, message) => {
  console.log(`The channel is ${channel}`);
  console.log(`The message is`, JSON.parse(message));
});

app.get("/request", (req, res) => {
  function getCallerIP(req) {
    let ip =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    return ip;
  }
  let ip = getCallerIP(req);
  let url = req.url;
  subscribe.publish("requestNodeB", JSON.stringify({ ip, url }));

  return res.json({
    status: 200,
    message: { ip, url },
  });
});

app.listen(3001, () => {
  console.log(`Listening on port 3001`);
});
