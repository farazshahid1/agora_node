const express = require("express");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

const PORT = 8080;

const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;
const DB_URI = process.env.DB_CONNECTION;

const app = express();

app.use(bodyParser.json());

const nocache = (req, resp, next) => {
  resp.header("Cache-Control", "private", "no-store", "must-revalidate");
  resp.header("Expire", "-1");
  resp.header("Pragma", "no-cache");
  next();
};

const generateRTCToken = (req, resp) => {
  //avoid cors error
  resp.header("Access-Control-Allow-Origin", "*");

  // channel Name
  const channelName = req.params.channel;
  if (!channelName)
    return resp.status(500).json({ error: "channel is required" });

  // uid
  const uid = req.params.uid;
  if (!uid || uid === "")
    return resp.status(500).json({ error: "uid is missing" });

  // get role
  let role;
  if (req.params.role == "publisher") role = RtcRole.PUBLISHER;
  else if (req.params.role == "audience") role = RtcRole.SUBSCRIBER;
  else return resp.status(500).json({ error: "role is missing" });

  // expire
  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === "") expireTime = 3600;
  else expireTime = parseInt(expireTime, 10);

  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  console.log(
    "APP_ID: ",
    APP_ID,
    "APP_CERTIFICATE: ",
    APP_CERTIFICATE,
    "channelName: ",
    channelName,
    "uid: ",
    uid,
    "role: ",
    role,
    "privilegeExpireTime: ",
    privilegeExpireTime
  );

  // Build token
  let token;
  if (req.params.tokenType === "userAccount")
    token = RtcTokenBuilder.buildTokenWithAccount(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      role,
      privilegeExpireTime
    );
  else if (req.params.tokenType === "uid")
    token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      role,
      privilegeExpireTime
    );
  else return resp.status(500).json({ error: "token type is invalid" });

  return resp.json({ rtcToken: token });
};

app.get("/rtc/:channel/:role/:tokenType/:uid", nocache, generateRTCToken);

// Import routes
const authRoutes = require("./routes/auth");

app.use("/user", authRoutes);

// Connect to be db
mongoose.connect(DB_URI, () => console.log("Connected to DB!"));

app.listen(process.env.PORT || PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://agora:stromeagora@cluster0.zekgm8y.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });
