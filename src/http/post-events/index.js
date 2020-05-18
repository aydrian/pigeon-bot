// learn more about HTTP functions here: https://arc.codes/primitives/http
const arc = require("@architect/functions");
const crypto = require("crypto");
const qs = require("qs");

// fetch this from environment variables
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const signVerification = (req, res, next) => {
  const slackSignature = req.headers["X-Slack-Signature"];
  const requestBody = qs.stringify(req.body, { format: "RFC1738" });
  const timestamp = req.headers["X-Slack-Request-Timestamp"];
  console.log(`req.body: ${req.body}`);
  console.log(`requestedBody: ${requestBody}`);

  const time = Math.floor(new Date().getTime() / 1000);

  if (Math.abs(time - timestamp) > 300) {
    console.log("Ignore this request.");
    return res({
      status: 400,
      body: "Ignore this request.",
    });
  }

  if (!slackSigningSecret) {
    console.log("Slack signing secret is empty.");
    return res({
      status: 400,
      body: "Slack signing secret is empty.",
    });
  }

  const mySignature =
    "v0=" +
    crypto
      .createHmac("sha256", slackSigningSecret)
      .update(`v0:${timestamp}:${requestBody}`)
      .digest("hex");

  console.log(`signing secret: ${slackSigningSecret}`);
  console.log(`mySignature: ${mySignature}`);
  console.log(`slackSignature: ${slackSignature}`);
  if (
    crypto.timingSafeEqual(
      Buffer.from(mySignature),
      Buffer.from(slackSignature)
    )
  ) {
    next();
  } else {
    console.log("Verification failed");
    return res({
      status: 400,
      body: "Verification failed",
    });
  }
};

const route = function handler(req, res) {
  const { body } = req;
  console.log(body);

  if (body.type === "url_verification") {
    return res({
      headers: { "content-type": "application/json" },
      status: 200,
      body: JSON.stringify({ challenge: body.challenge }),
    });
  }

  res({
    status: 200,
  });
};

exports.handler = arc.http(signVerification, route);
